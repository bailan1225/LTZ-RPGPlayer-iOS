// Media & Runtime Patches (MV Specific)

(function() {
    // 只在 MV 环境下执行，避免与 MZ 的 Decrypter 冲突
    function isMV() {
        if (typeof Utils !== 'undefined' && Utils.RPGMAKER_NAME) {
            return Utils.RPGMAKER_NAME === 'MV';
        }
        if (typeof DataManager !== 'undefined' && typeof DataManager.maxSaveFiles === 'function') {
            return true; // MV 有 maxSaveFiles
        }
        if (typeof DataManager !== 'undefined' && typeof DataManager.saveGame === 'function') {
            return false; // MZ 有 saveGame
        }
        return null; // 无法判断
    }

    function init() {
        var env = isMV();
        if (env === false) {
            console.log('[mv_media] Skipped: not MV environment');
            return;
        }
        if (env === null) {
            setTimeout(init, 100);
            return;
        }
        console.log("Initializing MV Media Patches...");
        initMVMedia();
    }

    function initMVMedia() {

    // --- Decrypter Polyfill ---
    // Handle plain images when game expects encrypted files
    if (typeof window.Decrypter === 'undefined') {
        window.Decrypter = {
            hasEncryptedAudio: false,
            hasEncryptedFiles: false,
            extToEncryptExt: function(url) { return url; },
            decryptUint8Array: function(uint8Array) { return uint8Array; },
            decryptArrayBuffer: function(arrayBuffer) { return arrayBuffer; },
            checkHeader: function(header) { return false; }
        };
    }
    
    function overrideDecrypter() {
        if (typeof Decrypter === 'undefined') return;
        
        console.log("[Polyfill] Overriding Decrypter methods...");
        
        if (!Decrypter._original_decryptArrayBuffer) {
            Decrypter._original_decryptArrayBuffer = Decrypter.decryptArrayBuffer;
        }

        Decrypter.decryptArrayBuffer = function(arrayBuffer) {
            if (!arrayBuffer) return null;
            
            var header = new Uint8Array(arrayBuffer, 0, 16);
            var isEncrypted = true;
            var signature = "RPGMV";
            
            for (var i = 0; i < signature.length; i++) {
                if (header[i] !== signature.charCodeAt(i)) {
                    isEncrypted = false;
                    break;
                }
            }
            
            if (isEncrypted) {
                return this._original_decryptArrayBuffer(arrayBuffer);
            } else {
                return arrayBuffer;
            }
        };
        Decrypter.checkHeader = function(header) { return true; };

        // --- decryptUint8Array 补丁 ---
        // AudioStreaming._loading 使用 decryptUint8Array 对流式块解密。
        // MVSchemeHandler 在原生层已预解密 .rpgmvo，返回纯 OGG（OggS 开头），
        // 没有 RPGMV 头。若 decryptUint8Array 不加检查直接截掉前 16 字节，
        // 会破坏 OGG 数据导致 stbvorbis 无法解码（静音）。
        // 修复：先检查 RPGMV 签名，无签名则原样返回（已预解密，无需再处理）。
        if (!Decrypter._original_decryptUint8Array) {
            Decrypter._original_decryptUint8Array = Decrypter.decryptUint8Array;
        }
        Decrypter.decryptUint8Array = function(uint8Array) {
            if (!uint8Array || uint8Array.length < 5) return uint8Array;
            // MVSchemeHandler 已在原生层预解密 .rpgmvo，返回纯 OGG（无 RPGMV 头）。
            // 若无 RPGMV 签名则直接透传，避免截掉有效 OGG 数据导致静音。
            if (uint8Array[0] === 0x52 && uint8Array[1] === 0x50 &&
                uint8Array[2] === 0x47 && uint8Array[3] === 0x4D &&
                uint8Array[4] === 0x56) {
                return this._original_decryptUint8Array.call(this, uint8Array);
            }
            return uint8Array;
        };
    }
    window.addEventListener('load', overrideDecrypter);

    // --- Decrypter.restoreImage 补丁 ---
    // MVSchemeHandler 在原生层预解密 .rpgmvp，返回普通 PNG 给 JS。
    // 但 Decrypter.restoreImage 期望 RPGMV 容器头（52 50 47 4D 56...），
    // 收到普通 PNG 头（89 50 4E 47）时抛出 "Header is wrong"。
    // 补丁：检测到 PNG 签名时直接透传，跳过 RPGMV 头校验。
    function patchDecrypterRestoreImage() {
        if (typeof Decrypter === 'undefined') return false;
        if (typeof Decrypter.restoreImage !== 'function') return false;
        if (Decrypter._arkRestoreImagePatched) return true;

        var _orig = Decrypter.restoreImage;
        Decrypter.restoreImage = function(arrayBuffer) {
            if (!arrayBuffer) return null;
            var bytes = new Uint8Array(arrayBuffer, 0, Math.min(4, arrayBuffer.byteLength));
            // PNG magic: 89 50 4E 47 — already decrypted by native scheme handler
            if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
                return arrayBuffer;
            }
            return _orig.call(this, arrayBuffer);
        };
        Decrypter._arkRestoreImagePatched = true;
        console.log('[Polyfill] Decrypter.restoreImage patched for pre-decrypted PNG');
        return true;
    }
    (function waitForDecrypterRestoreImage() {
        if (!patchDecrypterRestoreImage()) {
            var attempts = 0;
            var iv = setInterval(function() {
                attempts++;
                if (patchDecrypterRestoreImage() || attempts > 100) clearInterval(iv);
            }, 50);
        }
    })();

    } // end initMVMedia

    init();
})();
