// APNG / pixi-rpgm .rpgmvp double-decryption fix
// 问题：pixi-apng 加载加密 .rpgmvp 图像时出现 "Buffer too small to slice 4 bytes" 错误。
// 原因：MVSchemeHandler 预解密 .rpgmvp 为 PNG，pixi-rpgm 再次 XOR 解密导致数据损坏。
// 修复：拦截 .rpgmvp 请求，检测到 PNG 签名时重建 RPGMV 容器。
// Trigger: game plugins.js contains pixi-apng or pixi-rpgm

(function() {
    var RPGMV_HEADER = new Uint8Array([
        0x52, 0x50, 0x47, 0x4d, 0x56, 0x00, 0x00, 0x00,
        0x00, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);

    function getDecryptKey() {
        var dec = window.Decrypter;
        if (!dec) return null;
        if (!dec._encryptionKey || dec._encryptionKey === '' || dec._encryptionKey.length === 0) {
            if (typeof dec.readEncryptionkey === 'function') {
                try { dec.readEncryptionkey(); } catch (e) {}
            }
        }
        var k = dec._encryptionKey;
        if (!k || k === '') return null;
        var bytes = null;
        if (Array.isArray(k)) {
            bytes = [];
            if (k.length === 32) {
                for (var i = 0; i < 16; i++) {
                    var v = k[i]; var b = (typeof v === 'string') ? parseInt(v, 16) : (v & 0xff);
                    if (isNaN(b)) return null;
                    bytes.push(b);
                }
            } else if (k.length === 16) {
                for (var i = 0; i < 16; i++) {
                    var v = k[i]; var b = (typeof v === 'number') ? (v & 0xff) : parseInt(String(v), 16);
                    if (isNaN(b)) return null;
                    bytes.push(b);
                }
            } else {
                return null;
            }
            return bytes;
        }
        if (typeof k === 'string') {
            var ks = k.trim();
            if (/^[0-9a-fA-F]{32}$/.test(ks)) {
                bytes = [];
                for (var j = 0; j < 32; j += 2) bytes.push(parseInt(ks.substr(j, 2), 16));
                return bytes;
            }
            return null;
        }
        return null;
    }

    function rebuildRpgmvpFromPng(view, key) {
        var xored = new Uint8Array(16);
        for (var i = 0; i < 16; i++) xored[i] = view[i] ^ key[i];
        var out = new Uint8Array(16 + view.length);
        out.set(RPGMV_HEADER, 0);
        out.set(xored, 16);
        out.set(view.subarray(16), 32);
        return out.buffer;
    }

    // 修复 1：.rpgmvp 双重解密修复（fetch 路径）
    (function installRpgmvpFetchFix() {
        if (typeof window.fetch !== 'function') { return; }
        var _origFetch = window.fetch;

        window.fetch = function(input, init) {
            var url;
            try {
                url = typeof input === 'string' ? input :
                      (input instanceof Request ? input.url : String(input));
            } catch (_) { url = ''; }

            var isRpgmvp = typeof url === 'string' &&
                           url.indexOf('blob:') !== 0 &&
                           url.indexOf('data:') !== 0 &&
                           url.indexOf('.rpgmvp') !== -1;
            if (!isRpgmvp) return _origFetch.apply(window, arguments);

            return _origFetch.call(window, input, init).then(function(response) {
                return response.arrayBuffer().then(function(buffer) {
                    var bytes = new Uint8Array(buffer);
                    var isPng = bytes.length >= 8 &&
                        bytes[0] === 0x89 && bytes[1] === 0x50 &&
                        bytes[2] === 0x4e && bytes[3] === 0x47;

                    if (!isPng) {
                        return new Response(buffer, {
                            status: response.status,
                            headers: { 'Content-Type': 'application/octet-stream' }
                        });
                    }

                    var key = getDecryptKey();
                    if (!key) {
                        return new Response(buffer, {
                            status: response.status,
                            headers: { 'Content-Type': 'image/png' }
                        });
                    }
                    var rebuilt = rebuildRpgmvpFromPng(bytes, key);
                    return new Response(rebuilt, {
                        status: response.status,
                        headers: { 'Content-Type': 'application/octet-stream' }
                    });
                }).catch(function(err) {
                    return _origFetch.call(window, input, init);
                });
            });
        };
    })();

    // 修复 2：.rpgmvp 双重解密修复（XHR 路径）
    (function installRpgmvpXhrFix() {
        if (typeof XMLHttpRequest === 'undefined') return;
        var _origOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            if (typeof url === 'string' && url.indexOf('.rpgmvp') !== -1) {
                var xhr = this;
                var _url = url;
                xhr.addEventListener('readystatechange', function() {
                    if (xhr.readyState !== 4 || xhr._arkXhrFixed) return;
                    xhr._arkXhrFixed = true;
                    try {
                        var rawBuf = xhr.response;
                        if (!rawBuf || !(rawBuf instanceof ArrayBuffer)) return;
                        var view = new Uint8Array(rawBuf);
                        if (view.length < 8 || view[0] !== 0x89 || view[1] !== 0x50) return;
                        var key = getDecryptKey();
                        if (!key) return;
                        var newBuf = rebuildRpgmvpFromPng(view, key);
                        Object.defineProperty(xhr, 'response', {
                            configurable: true, enumerable: true,
                            get: function() { return newBuf; }
                        });
                    } catch(e) {}
                });
            }
            return _origOpen.apply(this, arguments);
        };
    })();
})();
