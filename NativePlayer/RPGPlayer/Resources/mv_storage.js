// Storage Polyfills: Infinite Save Support (MV Only)

(function() {
    // 只在 MV 环境下执行，避免与 MZ 的 StorageManager 冲突
    function isMV() {
        if (typeof Utils !== 'undefined' && Utils.RPGMAKER_NAME) {
            return Utils.RPGMAKER_NAME === 'MV';
        }
        // MZ 有 DataManager.maxSaveFiles，MV 没有；用这个判断
        if (typeof DataManager !== 'undefined' && typeof DataManager.maxSaveFiles === 'function') {
            return false;
        }
        return true; // 默认按 MV 处理
    }
    if (!isMV()) {
        console.log('[mv_storage] Skipped: not MV environment');
        return;
    }
    console.log("Initializing Storage Polyfills (MV)...");

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
})();
