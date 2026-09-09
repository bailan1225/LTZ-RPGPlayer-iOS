// KNS_TalkPortrait compatibility for ArkRPG/WKWebView.
//
// The packaged KNS Vue portrait component probes png/webp/jpg/jpeg candidates
// through fs.existsSync on every render. For encrypted KNS assets, a synchronous
// probe can read and decrypt the complete file. Cache only immutable portrait
// paths, and only while the full KNS Vue dialogue stack is enabled.

(function() {
    'use strict';

    if (location.protocol !== 'rpgmz:' || typeof window.require !== 'function') return;

    var fs;
    try {
        fs = window.require('fs');
    } catch (error) {
        return;
    }
    if (!fs || typeof fs.existsSync !== 'function' || fs.existsSync.__arkKNSTalkPortraitCompat) {
        return;
    }

    var originalExistsSync = fs.existsSync;
    var existsCache = Object.create(null);
    var activation;

    function hasEnabledPlugin(name) {
        if (!Array.isArray(window.$plugins)) return false;
        return window.$plugins.some(function(plugin) {
            return plugin && plugin.name === name && plugin.status === true;
        });
    }

    function isCompatibleStackEnabled() {
        if (!Array.isArray(window.$plugins)) return false;
        if (activation === undefined) {
            activation = hasEnabledPlugin('KNS_VueUI') &&
                hasEnabledPlugin('KNS_HtmlMessage') &&
                hasEnabledPlugin('KNS_TalkPortrait');
        }
        return activation;
    }

    function portraitCacheKey(path) {
        var normalized = String(path == null ? '' : path)
            .replace(/\\/g, '/')
            .replace(/[?#].*$/, '')
            .replace(/^.*www\//i, '')
            .replace(/^\.\//, '')
            .replace(/^\//, '');
        if (normalized.split('/').indexOf('..') !== -1) return null;
        if (!/^img\/pictures\/portraits\//i.test(normalized)) return null;
        return normalized;
    }

    function compatibleExistsSync(path) {
        if (!isCompatibleStackEnabled()) {
            return originalExistsSync.apply(this, arguments);
        }

        var key = portraitCacheKey(path);
        if (key === null) {
            return originalExistsSync.apply(this, arguments);
        }
        if (Object.prototype.hasOwnProperty.call(existsCache, key)) {
            return existsCache[key];
        }

        var exists = originalExistsSync.apply(this, arguments);
        existsCache[key] = exists;
        return exists;
    }

    compatibleExistsSync.__arkKNSTalkPortraitCompat = true;
    fs.existsSync = compatibleExistsSync;
    console.log('[Compat][KNS_TalkPortrait] portrait existsSync cache installed');
})();
