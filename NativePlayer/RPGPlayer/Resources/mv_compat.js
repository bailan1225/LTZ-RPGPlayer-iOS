// === MV Compatibility Bundle (merged) ===
// Contains: mv_storage.js, mv_media.js, mv_plugin_params.js
// Each module has its own MV environment check; only executes in MV games.

// --- mv_storage.js ---
// Storage Polyfills: Infinite Save Support (MV Only)

(function() {
    // 只在 MV 环境下执行，避免与 MZ 的 StorageManager 冲突
    function isMV() {
        if (typeof Utils !== 'undefined' && Utils.RPGMAKER_NAME) {
            return Utils.RPGMAKER_NAME === 'MV';
        }
        // MZ 有 DataManager.saveGame，MV 没有；用这个判断
        if (typeof DataManager !== 'undefined' && typeof DataManager.saveGame === 'function') {
            return false;
        }
        // MV 有 DataManager.maxSaveFiles，MZ 没有
        if (typeof DataManager !== 'undefined' && typeof DataManager.maxSaveFiles === 'function') {
            return true;
        }
        return null; // 无法判断，需要等待
    }

    function init() {
        var env = isMV();
        if (env === false) {
            console.log('[mv_storage] Skipped: not MV environment');
            return;
        }
        if (env === null) {
            setTimeout(init, 100);
            return;
        }
        console.log("Initializing Storage Polyfills (MV)...");
        initMVStorage();
    }

    function initMVStorage() {

    const SAVE_API_URL = "rpgmv://saves/";
    const existsCache = Object.create(null);
    let saveIndexLoaded = false;
    let saveIndexSet = null;

    function ensureSaveIndexLoaded() {
        if (saveIndexLoaded) return;
        saveIndexLoaded = true;
        try {
            const raw = prompt("__NATIVE_SAVE_INDEX__", "");
            if (!raw || raw.length === 0) {
                saveIndexSet = null;
                return;
            }
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                saveIndexSet = new Set(parsed.map(function(name) { return String(name).toLowerCase(); }));
            } else {
                saveIndexSet = null;
            }
        } catch (e) {
            saveIndexSet = null;
        }
    }

    function getSaveFilename(savefileId) {
        try {
            var path = StorageManager.localFilePath(savefileId);
            if (path) {
                var filename = path.replace(/^.*[\/\\]/, '');
                if (filename) return filename;
            }
        } catch(e) {}
        if (savefileId < 0) return "config.rpgsave";
        else if (savefileId === 0) return "global.rpgsave";
        else return "file" + savefileId + ".rpgsave";
    }

    function nativeSave(savefileId, json) {
        const filename = getSaveFilename(savefileId);
        const data = LZString.compressToBase64(json);
        console.log("[Polyfill] Saving via Bridge: " + filename);
        existsCache[filename] = true;
        ensureSaveIndexLoaded();
        if (saveIndexSet) saveIndexSet.add(filename.toLowerCase());
        
        if (window.webkit && window.webkit.messageHandlers.nativeBridge) {
            window.webkit.messageHandlers.nativeBridge.postMessage({
                type: 'save',
                filename: filename,
                data: data
            });
        }
    }

    function nativeLoad(savefileId) {
        const filename = getSaveFilename(savefileId);
        // console.log("[Polyfill] Loading via Bridge: " + filename);
        
        const result = prompt("__NATIVE_LOAD__:" + filename, "");
        if (result && result.length > 0) {
             if (typeof LZString !== 'undefined') {
                 return LZString.decompressFromBase64(result);
             }
        }
        return null;
    }

    function nativeExists(savefileId) {
        const filename = getSaveFilename(savefileId);
        if (existsCache[filename] !== undefined) {
            return !!existsCache[filename];
        }

        ensureSaveIndexLoaded();
        if (saveIndexSet) {
            const exists = saveIndexSet.has(filename.toLowerCase());
            existsCache[filename] = exists;
            return exists;
        }

        // 优先走原生 prompt 桥接，避免大量同步 HEAD 请求导致卡顿
        try {
            const result = prompt("__NATIVE_EXISTS__:" + filename, "");
            const exists = result === "1";
            existsCache[filename] = exists;
            return exists;
        } catch (e) {
            // ignore and fallback to xhr
        }

        try {
            const xhr = new XMLHttpRequest();
            xhr.open('HEAD', SAVE_API_URL + filename, false);
            xhr.send(null);
            const exists = xhr.status === 200;
            existsCache[filename] = exists;
            return exists;
        } catch (e) {
            existsCache[filename] = false;
            return false;
        }
    }

    // Override
    StorageManager.saveToWebStorage = nativeSave;
    StorageManager.loadFromWebStorage = nativeLoad;
    StorageManager.isWebStorageExists = nativeExists; 
    StorageManager.webStorageExists = nativeExists;

    function overrideStorageManager() {
        if (typeof StorageManager === 'undefined') return;
        
        console.log("[Polyfill] Overriding StorageManager methods...");
        
        StorageManager.saveToWebStorage = nativeSave;
        StorageManager.loadFromWebStorage = nativeLoad;
        StorageManager.webStorageExists = nativeExists;
        
        StorageManager.saveToLocalFile = nativeSave;
        StorageManager.loadFromLocalFile = nativeLoad;
        StorageManager.localFileExists = nativeExists;
        StorageManager.loadFileExists = nativeExists; 
        
        StorageManager.localFileDirectoryPath = function() { return "save/"; };
    }
    
    overrideStorageManager();
    window.addEventListener('load', overrideStorageManager);
    } // end initMVStorage

    init();
})();


// --- mv_media.js ---
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


// --- mv_plugin_params.js ---
// MV Plugin Parameters Safety Patch
// Ensures PluginManager.parameters() never returns null and normalizes common
// array-like parameters (e.g., CategoryOrder) without guessing their format.

(function(){
  // 只在 MV 环境下执行，避免与 MZ 的 PluginManager 行为冲突
  function isMV() {
    if (typeof Utils !== 'undefined' && Utils.RPGMAKER_NAME) {
      return Utils.RPGMAKER_NAME === 'MV';
    }
    if (typeof DataManager !== 'undefined' && typeof DataManager.maxSaveFiles === 'function') {
      return true;
    }
    if (typeof DataManager !== 'undefined' && typeof DataManager.saveGame === 'function') {
      return false;
    }
    return null;
  }

  function init() {
    var env = isMV();
    if (env === false) return;
    if (env === null) { setTimeout(init, 100); return; }
    initMVParams();
  }

  function initMVParams() {
  function normalizeArrayParameter(value){
    if (value == null) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string'){
      var s = value.trim();
      if (s === '' || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') return [];
      try {
        var parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed;
      } catch(e) {}

      // MV plugin parameters are strings by contract. A comma in a string does
      // not prove that the receiving plugin expects an array (Galv_QuestLog's
      // Categories parameter is a notable counterexample), so preserve it.
      return value;
    }

    // Do not silently replace numbers, booleans, or objects with an array.
    return value;
  }

  function applyPatch(){
    if (!window.PluginManager || window.PluginManager.__arkParamsPatched) return false;
    var PM = window.PluginManager;
    if (typeof PM.parameters !== 'function') return false;

    var orig = PM.parameters;
    PM.parameters = function(name){
      var p = null;
      try { p = orig.call(this, name); } catch(e){ console.warn('[Polyfill] PluginManager.parameters threw for', name, e); }
      if (p == null) p = {};

      // Common MV plugin keys that expect arrays
      var keys = ['CategoryOrder', 'Categories', 'Order', 'List'];
      keys.forEach(function(k){
        if (p.hasOwnProperty(k)){
          p[k] = normalizeArrayParameter(p[k]);
        }
      });

      // YEP-style specific key normalization
      if (p.hasOwnProperty('Category Order')){
        p['CategoryOrder'] = normalizeArrayParameter(p['Category Order']);
      }

      return p;
    };

    PM.__arkParamsPatched = true;
    console.log('[Polyfill] PluginManager.parameters patched for MV safety');
    return true;
  }

  function schedule(){
    if (applyPatch()) return; // already applied
    var tries = 0;
    var timer = setInterval(function(){
      tries++;
      if (applyPatch()) { clearInterval(timer); return; }
      if (tries > 200) { clearInterval(timer); }
    }, 25);

    // Also try once after DOM ready
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', applyPatch);
    } else {
      setTimeout(applyPatch, 0);
    }
  }

  schedule();
  } // end initMVParams

  init();
})();


