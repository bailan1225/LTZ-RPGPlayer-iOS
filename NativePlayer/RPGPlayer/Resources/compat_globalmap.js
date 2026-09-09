// globalmap compatibility for ArkRPG/WKWebView.
//
// globalmap depends on two NW.js capabilities unavailable in WKWebView:
//   1. require('lodash/cloneDeep') for JSON-backed RPG.Event values.
//   2. fs.readFileSync for every MapNNN.json during new-game setup.
//
// The shared synchronous bridge deliberately rejects responses above 4 MiB.
// Keep that safety limit intact and use a bounded native chunk transport only
// for globalmap's UTF-8 map JSON reads.

(function() {
    'use strict';

    if (location.protocol !== 'rpgmv:' || typeof window.require !== 'function') return;
    if (window.require.__arkGlobalmapCompat) return;

    var originalRequire = window.require;
    var fs;
    try {
        fs = originalRequire('fs');
    } catch (error) {
        fs = null;
    }
    var originalReadFileSync = fs && typeof fs.readFileSync === 'function'
        ? fs.readFileSync
        : null;
    var chunkBytes = 1024 * 1024;

    function hasEnabledGlobalmap() {
        if (!Array.isArray(window.$plugins)) return false;
        return window.$plugins.some(function(plugin) {
            return plugin && plugin.name === 'globalmap' && plugin.status === true;
        });
    }

    function normalizedMapPath(path) {
        var normalized = String(path == null ? '' : path)
            .replace(/\\/g, '/')
            .replace(/[?#].*$/, '')
            .replace(/^.*www\//i, '')
            .replace(/^\.\//, '')
            .replace(/^\//, '');
        if (normalized.split('/').indexOf('..') !== -1) return null;
        return /^data\/Map\d{3}\.json$/i.test(normalized) ? normalized : null;
    }

    function utf8EncodingRequested(encoding) {
        var value = typeof encoding === 'string'
            ? encoding
            : encoding && typeof encoding.encoding === 'string'
                ? encoding.encoding
                : '';
        return /^(?:utf8|utf-8)$/i.test(value);
    }

    function base64ToBytes(base64) {
        var binary = atob(base64);
        var bytes = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return bytes;
    }

    function chunkedMapRead(cleanPath) {
        var url = location.protocol + '//game/' + cleanPath;
        var offset = 0;
        var total = null;
        var output = null;

        do {
            var response;
            try {
                response = prompt('__NATIVE_SYNC_GET_CHUNK__:' + JSON.stringify({
                    url: url,
                    offset: offset,
                    length: chunkBytes
                }), '');
            } catch (error) {
                return null;
            }
            if (typeof response !== 'string' || response.length === 0) return null;

            var firstSeparator = response.indexOf('|');
            var secondSeparator = response.indexOf('|', firstSeparator + 1);
            if (firstSeparator <= 0 || secondSeparator <= firstSeparator) return null;

            var status = parseInt(response.slice(0, firstSeparator), 10) || 0;
            if (status !== 200) {
                throw new Error('globalmap chunked read failed with status ' + status + ': ' + cleanPath);
            }

            var responseTotal = parseInt(
                response.slice(firstSeparator + 1, secondSeparator),
                10
            );
            if (!Number.isFinite(responseTotal) || responseTotal < 0) {
                throw new Error('globalmap chunked read returned invalid length: ' + cleanPath);
            }
            if (total === null) {
                total = responseTotal;
                output = new Uint8Array(total);
            } else if (responseTotal !== total) {
                throw new Error('globalmap chunked read length changed: ' + cleanPath);
            }

            var bytes = base64ToBytes(response.slice(secondSeparator + 1));
            if (bytes.length === 0 && offset < total) {
                throw new Error('globalmap chunked read made no progress: ' + cleanPath);
            }
            if (offset + bytes.length > total) {
                throw new Error('globalmap chunked read overflow: ' + cleanPath);
            }
            output.set(bytes, offset);
            offset += bytes.length;
        } while (offset < total);

        return new TextDecoder('utf-8').decode(output);
    }

    if (originalReadFileSync) {
        function compatibleReadFileSync(path, encoding) {
            var cleanPath = normalizedMapPath(path);
            if (!hasEnabledGlobalmap() || cleanPath === null || !utf8EncodingRequested(encoding)) {
                return originalReadFileSync.apply(this, arguments);
            }

            var content = chunkedMapRead(cleanPath);
            if (content !== null) return content;
            // Old app builds do not expose the chunk protocol. Preserve the
            // previous read path so small maps still work and large ones fail
            // with the existing ENOENT/413 behavior rather than corrupt data.
            return originalReadFileSync.apply(this, arguments);
        }

        compatibleReadFileSync.__arkGlobalmapCompat = true;
        fs.readFileSync = compatibleReadFileSync;
    }

    // globalmap only passes values sourced from RPG Maker JSON databases.
    function cloneDeepForGlobalmap(value) {
        if (value === null || value === undefined || typeof value !== 'object') {
            return value;
        }
        return JSON.parse(JSON.stringify(value));
    }

    function compatibleRequire(moduleName) {
        if (moduleName === 'lodash/cloneDeep' && hasEnabledGlobalmap()) {
            return cloneDeepForGlobalmap;
        }
        return originalRequire.apply(this, arguments);
    }

    compatibleRequire.__arkGlobalmapCompat = true;
    compatibleRequire.__arkGlobalmapOriginalRequire = originalRequire;
    if (originalRequire.modules) compatibleRequire.modules = originalRequire.modules;
    window.require = compatibleRequire;
    console.log('[Compat][globalmap] cloneDeep and chunked map reads installed');
})();
