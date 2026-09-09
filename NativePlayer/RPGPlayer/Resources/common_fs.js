// File System Polyfills: Mock fs, path, require

(function() {
    console.log("Initializing FS Polyfills...");

    // Mock Path Module (纯 JS 实现)
    const mockPath = {
        join: function(...paths) {
            return paths.join('/').replace(/\/+/g, '/');
        },
        dirname: function(path) {
            if (path == null) return '.';
            // 与 Node.js 行为一致：去掉最后一个路径组件（含末尾斜杠）后返回父目录
            // 例：dirname("save/") = "."（不是 "save"），dirname("a/b") = "a"
            const normalized = path.replace(/\/+$/, ''); // 去除尾部斜杠
            const idx = normalized.lastIndexOf('/');
            if (idx === -1) return '.'; // 无斜杠，返回当前目录
            if (idx === 0) return '/';  // 根目录
            return normalized.substring(0, idx);
        },
        basename: function(path, ext) {
            if (path == null) return '';
            let name = path.substring(path.lastIndexOf('/') + 1);
            if (ext && name.endsWith(ext)) {
                name = name.substring(0, name.length - ext.length);
            }
            return name;
        },
        extname: function(path) {
            const index = path.lastIndexOf('.');
            return index > -1 ? path.substring(index) : '';
        },
        sep: '/',
        parse: function(p) {
            if (p == null) return { root: '', dir: '', base: '', ext: '', name: '' };
            var dir = p.substring(0, p.lastIndexOf('/'));
            var base = p.substring(p.lastIndexOf('/') + 1);
            var extIdx = base.lastIndexOf('.');
            var ext = extIdx > -1 ? base.substring(extIdx) : '';
            var name = extIdx > -1 ? base.substring(0, extIdx) : base;
            return { root: '', dir: dir, base: base, ext: ext, name: name };
        },
        resolve: function() {
            var parts = Array.prototype.slice.call(arguments);
            return parts.join('/').replace(/\/+/g, '/');
        },
        normalize: function(p) {
            return p ? p.replace(/\/+/g, '/') : '';
        }
    };

    // 生成成就存档的兜底压缩串（若 pako 可用则使用 deflate，否则直接返回 JSON 字符串）
    function fallbackAchievementZip() {
        const json = JSON.stringify({ unlockInfo: [] });
        try {
            if (window.pako && typeof window.pako.deflate === 'function') {
                return window.pako.deflate(json, { to: 'string', level: 1 });
            }
        } catch (e) {
            console.warn('[Polyfill] pako.deflate failed, fallback to raw json:', e);
        }
        return json;
    }

    const saveExistsCache = Object.create(null);

    // 存档写穿透缓存：writeFileSync 同步更新内存，磁盘落盘走异步 postMessage。
    // 旧实现的 prompt() 同步桥是 WKWebView 的 JS 对话框，WebKit 会中断页面音频，
    // Drill_GlobalGameTimer 这类每 300 帧自动存档的插件会让 BGM 周期性停顿；
    // 读路径（readFileSync/existsSync）先查本缓存，保证「写后读」不依赖落盘时序。
    const pendingSaveWrites = Object.create(null);

    // rename/unlink 仍走同步 prompt 桥（低频操作），执行前必须先排空未落盘的
    // 异步写：WKScriptMessage 异步送达，若不排空，原生侧处理 rename/delete 时
    // 文件可能还没写上盘（MZ 临时文件 write→rename 流程会被这个乱序打断）。
    function flushPendingSaveWrites() {
        for (const filename in pendingSaveWrites) {
            if (nativeWriteSave(filename, pendingSaveWrites[filename])) {
                delete pendingSaveWrites[filename];
            }
        }
    }

    // 仅将真正的 RPG Maker 存档文件统一映射到当前游戏的 save/ 目录。
    // MZ 原生存储会先写 *.rmmzsave_ 临时文件再 rename；部分插件使用 .bak/.tmp。
    // 不再通过 path.includes("save") 判断，避免误拦截 save-settings.json 等普通文件。
    function saveFilenameFromPath(path) {
        const normalized = String(path == null ? '' : path).replace(/\\/g, '/');
        const filename = normalized.substring(normalized.lastIndexOf('/') + 1);
        if (!filename || filename === '.' || filename === '..') return null;
        return /\.(?:rpgsave|rmmzsave)(?:\.(?:bak|tmp|temp)|_)?$/i.test(filename)
            ? filename
            : null;
    }

    function canonicalSavePath(path) {
        const filename = saveFilenameFromPath(path);
        return filename ? "save/" + filename : null;
    }

    // NativeBridge 以 Swift String 持久化 MZ/MV 存档。readFileSync 在未指定
    // encoding 时按 Node 语义返回 ArrayBuffer，因此复制存档前必须先按 UTF-8
    // 还原为原始字符串；直接 String(ArrayBuffer) 会写入 "[object ArrayBuffer]"。
    function saveContentString(data) {
        if (data == null) return '';
        if (typeof data === 'string') return data;

        var bytes = null;
        if (data instanceof ArrayBuffer) {
            bytes = new Uint8Array(data);
        } else if (typeof ArrayBuffer.isView === 'function' && ArrayBuffer.isView(data)) {
            bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        } else if (data._bytes instanceof Uint8Array) {
            bytes = data._bytes;
        }

        if (bytes) {
            return new TextDecoder('utf-8').decode(bytes);
        }
        return String(data);
    }

    function nativeWriteSave(filename, data) {
        const content = saveContentString(data);
        try {
            const result = prompt("__NATIVE_SAVE_WRITE__:" + filename, content);
            if (result === "1") return true;
            if (result === "0") return false;
        } catch (e) {
            console.warn("[Polyfill] synchronous save write failed, using bridge fallback: " + filename, e);
        }
        if (window.webkit && window.webkit.messageHandlers.nativeBridge) {
            window.webkit.messageHandlers.nativeBridge.postMessage({
                type: 'save',
                filename: filename,
                data: content
            });
            return true;
        }
        return false;
    }

    function nativeDeleteSave(filename) {
        try {
            return prompt("__NATIVE_SAVE_DELETE__:" + filename, "") === "1";
        } catch (e) {
            console.warn("[Polyfill] save delete failed: " + filename, e);
            return false;
        }
    }

    function nativeRenameSave(oldFilename, newFilename) {
        try {
            const payload = JSON.stringify([oldFilename, newFilename]);
            return prompt("__NATIVE_SAVE_RENAME__:" + payload, "") === "1";
        } catch (e) {
            console.warn("[Polyfill] save rename failed: " + oldFilename + " -> " + newFilename, e);
            return false;
        }
    }

    function queryNativeSaveExists(filename) {
        if (!filename) return false;
        if (saveExistsCache[filename] !== undefined) {
            return !!saveExistsCache[filename];
        }
        try {
            const result = prompt("__NATIVE_EXISTS__:" + filename, "");
            const exists = result === "1";
            saveExistsCache[filename] = exists;
            return exists;
        } catch (e) {
            return false;
        }
    }

    // 同步写入游戏包内文本配置文件（如 lng.txt）。
    // 通过 prompt 协议落到 NativeBridgeHandler —— 同步返回，确保 location.reload()
    // 在文件落盘之后触发，从而让 fs.readFileSync 在重启后读到最新值。
    function nativeWriteFile(path, data) {
        try {
            var p = String(path == null ? '' : path).replace(/\\/g, '/');
            // 与 readFileSync 同样的归一化：去掉任意 www/ 前缀，得到包内相对路径
            var cleanPath = p.replace(/^.*www\//, '');
            // 拒绝绝对路径与父目录穿越，防止误写到沙盒外
            if (!cleanPath || cleanPath.startsWith('/') || cleanPath.includes('..')) {
                console.warn("[Polyfill] nativeWriteFile rejected path: " + path);
                return false;
            }
            var result = prompt("__NATIVE_WRITE__:" + cleanPath, String(data == null ? '' : data));
            if (result !== "1") {
                console.warn("[Polyfill] nativeWriteFile native refused: " + cleanPath);
                return false;
            }
            // common_sync_xhr.js 会缓存成功的包内同步 GET/HEAD。配置写入成功后
            // 清空缓存，保证随后 readFileSync 仍能立即读到新内容。
            if (typeof window.__arkRpgClearSyncXhrCache === 'function') {
                window.__arkRpgClearSyncXhrCache();
            }
            return true;
        } catch (e) {
            console.warn("[Polyfill] nativeWriteFile failed: " + path, e);
            return false;
        }
    }

    // Mock OS Module (最小实现，供插件检测平台)
    const mockOS = {
        platform: function() { return 'darwin'; },
        type: function() { return 'Darwin'; },
        release: function() { return '23.0.0'; },
        arch: function() { return 'arm64'; },
        homedir: function() { return '/var/mobile'; },
        tmpdir: function() { return '/tmp'; },
        totalmem: function() { return 2 * 1024 * 1024 * 1024; },
        freemem: function() { return 1 * 1024 * 1024 * 1024; }
    };

    // Mock Process Module (最小实现，供插件检测平台)
    // title 必须为 'browser'：LN_FilmicFilter 等插件用
    //   typeof process !== 'undefined' && process.title !== 'browser'
    // 判定 Node 环境。title 缺省时（undefined !== 'browser'）会被误判为 Node，
    // 进而走 fs.mkdir/readdir 重扫 data/filters 的 NW 分支并崩溃。
    // 我们装 process 仅为让 Utils.isNwjs()（只查 typeof require/process）保持 true，
    // 本体是 WebView，title='browser' 才是插件作者预期的浏览器语义。
    const mockProcess = {
        title: 'browser',
        platform: 'darwin',
        env: {
            NODE_ENV: 'production',
            STEAM_DECK: '0'
        },
        version: '',
        versions: {},
        argv: ['index.html', ''],
        execPath: 'index.html',
        mainModule: { filename: 'index.html' },
        nextTick: function(fn) { setTimeout(fn, 0); },
        cwd: function() { return '.'; },
        browser: true,
        arch: 'arm64',
        platform: 'darwin'
    };

    function inferMockFFIReturn(signature) {
        const text = String(signature || '').trim();
        const lower = text.toLowerCase();

        // Steam/native bootstrap probes commonly abort the game when init returns false.
        if (lower.includes('steamapi_init') || lower.includes(' init(') || lower.endsWith(' init()')) {
            return true;
        }
        if (lower.includes('issubscribedapp') || lower.includes('steamrunning') || lower.includes('overlayenabled')) {
            return true;
        }
        if (lower.includes('shutdown')) {
            return undefined;
        }
        if (lower.startsWith('bool ')) {
            return true;
        }
        if (lower.startsWith('void ')) {
            return undefined;
        }
        if (lower.startsWith('char* ') || lower.startsWith('const char* ')) {
            return '';
        }
        if (lower.startsWith('int64') || lower.startsWith('uint64')) {
            return 1;
        }
        if (lower.startsWith('int ') || lower.startsWith('uint') || lower.startsWith('size_t')) {
            return 1;
        }
        if (lower.includes('*')) {
            return {};
        }
        return 0;
    }

    const _silentFFI = new Set(['NekoGakuen_SteamAPI_RunCallbacks']);
    function createNoopFFIFunction(name) {
        const fn = function() {
            if (!_silentFFI.has(name)) console.warn('[koffi] Mock FFI call ignored: ' + name);
            return inferMockFFIReturn(name);
        };
        fn.async = function() {
            if (!_silentFFI.has(name)) console.warn('[koffi] Mock async FFI call ignored: ' + name);
            return Promise.resolve(inferMockFFIReturn(name));
        };
        return fn;
    }

    const mockKoffiLibrary = {
        func: function(signature) {
            return createNoopFFIFunction(signature || 'anonymous');
        },
        symbol: function(signature) {
            return createNoopFFIFunction(signature || 'anonymous');
        },
        cdecl: function(signature) {
            return createNoopFFIFunction(signature || 'anonymous');
        },
        stdcall: function(signature) {
            return createNoopFFIFunction(signature || 'anonymous');
        },
        close: function() {}
    };

    const mockKoffi = {
        types: {
            void: 'void',
            bool: 'bool',
            char: 'char',
            int: 'int',
            uint32: 'uint32',
            uint64: 'uint64',
            size_t: 'size_t'
        },
        struct: function(name, fields) {
            return { __koffiKind: 'struct', name: name, fields: fields || {} };
        },
        union: function(name, fields) {
            return { __koffiKind: 'union', name: name, fields: fields || {} };
        },
        pointer: function(type) {
            return { __koffiKind: 'pointer', to: type };
        },
        opaque: function(name) {
            return { __koffiKind: 'opaque', name: name || 'opaque' };
        },
        array: function(type, length) {
            return { __koffiKind: 'array', type: type, length: length || 0 };
        },
        proto: function() {
            return createNoopFFIFunction('proto');
        },
        alias: function(name, type) {
            return type || name;
        },
        sizeof: function() { return 0; },
        alignof: function() { return 0; },
        load: function(libraryName) {
            console.warn('[koffi] Mock library load ignored: ' + libraryName);
            return mockKoffiLibrary;
        },
        open: function(libraryName) {
            console.warn('[koffi] Mock library open ignored: ' + libraryName);
            return mockKoffiLibrary;
        },
        func: function(signature) {
            return createNoopFFIFunction(signature || 'anonymous');
        },
        reset: function() {},
        errno: function() { return 0; },
        extension: '.dylib'
    };

    // Mock FS Module (文件系统)
    const mockFS = {
        existsSync: function(path) {
            const p = path.replace(/\\/g, '/');
            // 存档目录一律视为存在（mkdir 本就是 no-op，目录检查无意义）。
            // MV/MZ 插件的 localFileDirectoryPath 产物形如 "save/"、".../www/save"、
            // "...\save" 等；此前只匹配带前导斜杠的三种写法，"save/" 这类相对路径
            // 漏判后每次自动存档都会发一次同步 XHR HEAD 且恒 404（SAO β4 的
            // Drill_GlobalGameTimer 每 5 秒一次，既卡主线程又刷日志）。
            const dirTail = p.replace(/\/+$/, '');
            if (dirTail.substring(dirTail.lastIndexOf('/') + 1).toLowerCase() === 'save') return true;

            // 无论游戏提供默认 save/ 路径还是自定义绝对路径，存档均按文件名
            // 映射到当前游戏的统一 save/ 目录。
            const savePath = canonicalSavePath(p);
            if (savePath) {
                return queryNativeSaveExists(savePath.substring("save/".length));
            }

            let cleanPath = p.replace(/^.*www\//, '');
            
            try {
                const xhr = new XMLHttpRequest();
                // Dynamically use current protocol (rpgmv: or rpgmz:)
                const baseUrl = (location.protocol === 'file:') ? '' : (location.protocol + "//game/");
                xhr.open('HEAD', baseUrl + cleanPath, false);
                xhr.send(null);
                
                // [ArkRPG Fix] 
                // 如果是特殊配置文件（如 achievement.rmmzsave/global.rmmzsave），即使 404 也视为存在，
                // 随后 readFileSync 会拦截并返回空 JSON 对象，避免插件 crash。
                if (xhr.status !== 200 && (cleanPath.endsWith("achievement.rmmzsave")/* || cleanPath.endsWith("config.rmmzsave") || cleanPath.endsWith("global.rmmzsave") */)) {
                    console.log("[Polyfill] Spoofing existence for missing config file (status " + xhr.status + "): " + cleanPath);
                    return true;
                }
                
                return xhr.status === 200;
            } catch (e) {
                // [ArkRPG Fix] Catch block handling for when xhr.send throws (e.g. Network Error / status 0)
                if (cleanPath.endsWith("achievement.rmmzsave") || cleanPath.endsWith("config.rmmzsave") || cleanPath.endsWith("global.rmmzsave")) {
                    console.log("[Polyfill] Spoofing existence for missing config file (exception): " + cleanPath);
                    return true;
                }
                return false;
            }
        },
        readFileSync: function(path, encoding) {
            // 在 try/catch 之外声明，避免 catch 块访问不到 cleanPath 抛出 ReferenceError
            const p = path.replace(/\\/g, '/');
            let cleanPath = p;
            function isTextExt(name){
                const n = name.toLowerCase();
                return n.endsWith('.json') || n.endsWith('.json5') || n.endsWith('.txt') || n.endsWith('.ini') || n.endsWith('.csv') || n.endsWith('.js') || n.endsWith('.cfg') || n.endsWith('.yml') || n.endsWith('.yaml') || n.endsWith('.sl');
            }
            function decodeWithFallback(buf){
                var encs = ['utf-8','utf-16le','utf-16be','shift_jis','windows-1252','gbk','big5','euc-kr'];
                for (var i=0;i<encs.length;i++){
                    try {
                        var dec = new TextDecoder(encs[i], {fatal:false});
                        var txt = dec.decode(buf);
                        if (txt.charCodeAt(0) === 0xFEFF) txt = txt.slice(1);
                        return txt;
                    } catch(e){}
                }
                try { return new TextDecoder('utf-8').decode(buf); } catch(_){}
                return '';
            }
            try {
                cleanPath = canonicalSavePath(p) || p.replace(/^.*www\//, '');

                // 写穿透缓存命中：本会话刚写、尚未落盘的存档直接从内存返回
                const pendingName = cleanPath.indexOf("save/") === 0 ? cleanPath.substring(5) : null;
                if (pendingName && pendingSaveWrites[pendingName] !== undefined) {
                    const pendingHasEncoding = typeof encoding === 'string' ||
                        (encoding && typeof encoding === 'object' && typeof encoding.encoding === 'string');
                    if (pendingHasEncoding || isTextExt(cleanPath)) {
                        return pendingSaveWrites[pendingName];
                    }
                    // Node 语义：非文本扩展名且未指定 encoding 时返回 ArrayBuffer
                    return new TextEncoder().encode(pendingSaveWrites[pendingName]).buffer;
                }

                const xhr = new XMLHttpRequest();
                // Dynamically use current protocol
                const baseUrl = (location.protocol === 'file:') ? '' : (location.protocol + "//game/");
                const isText = isTextExt(cleanPath);
                // Node.js semantics: encoding specified → return string; no encoding + non-text → return ArrayBuffer
                const hasEncoding = typeof encoding === 'string' ||
                    (encoding && typeof encoding === 'object' && typeof encoding.encoding === 'string');
                const wantsText = isText || hasEncoding;
                xhr.responseType = 'arraybuffer';
                xhr.open('GET', baseUrl + cleanPath, false);
                xhr.send(null);
                if (xhr.status === 200) {
                    if (wantsText && xhr.response) {
                        return decodeWithFallback(xhr.response);
                    }
                    if (xhr.response) {
                        // 只为内嵌 NW.js EXE 代理恢复 Node 的 Buffer 语义。
                        // 普通游戏继续返回既有 ArrayBuffer，避免改变插件兼容行为。
                        if (typeof window.__ARKRPG_PROCESS_EXEC_PATH__ === 'string' &&
                            cleanPath === window.__ARKRPG_PROCESS_EXEC_PATH__) {
                            return Buffer.from(xhr.response);
                        }
                        return xhr.response;
                    }
                    return '';
                }
                
                // [ArkRPG Fix] 针对被 existsSync 欺骗进来的缺失配置文件，返回空串
                // 空串会让上层 zipToJson 走 "null" 分支，避免 pako.inflate 抛错
                if (cleanPath.endsWith("achievement.rmmzsave")/* || cleanPath.endsWith("config.rmmzsave") || cleanPath.endsWith("global.rmmzsave") */) {
                    console.warn("[Polyfill] Returning fallback zip for missing file: " + cleanPath);
                    return fallbackAchievementZip();
                }

                throw new Error("ENOENT: no such file or directory, open '" + path + "'");
            } catch (e) {
                // [ArkRPG Fix] Catch block handling for when xhr.send throws
                if (cleanPath && (cleanPath.endsWith("achievement.rmmzsave")/* || cleanPath.endsWith("config.rmmzsave") || cleanPath.endsWith("global.rmmzsave") */)) {
                    console.warn("[Polyfill] Returning fallback zip for missing file (exception): " + cleanPath);
                    return fallbackAchievementZip();
                }
                console.warn("[Polyfill] readFileSync failed for: " + path);
                throw e;
            }
        },
        writeFileSync: function(path, data, encoding) {
            try {
                const filename = saveFilenameFromPath(path);
                if (filename) {
                    const content = saveContentString(data);
                    if (window.webkit && window.webkit.messageHandlers.nativeBridge) {
                        // 异步落盘（见 pendingSaveWrites 注释）：WKScriptMessage 保序，
                        // 同文件多次写按序覆盖；进程崩溃最多丢最后一个未落盘的周期存档
                        window.webkit.messageHandlers.nativeBridge.postMessage({
                            type: 'save',
                            filename: filename,
                            data: content
                        });
                    } else if (!nativeWriteSave(filename, content)) {
                        throw new Error("native save write rejected: " + filename);
                    }
                    pendingSaveWrites[filename] = content;
                    saveExistsCache[filename] = true;
                } else {
                    // 非存档类配置文件（如 lng.txt）：同步写盘，确保后续 readFileSync 能读到最新值
                    nativeWriteFile(path, data);
                }
            } catch (e) {
                console.error("[Polyfill] writeFileSync error: " + e);
            }
        },
        copyFileSync: function(src, dest) {
            try {
                // 自定义存档目录插件会把 /var/mobile/Documents/.../file.rmmzsave
                // 与 save/file.rmmzsave 当成两个路径，但 ArkRPG 会把它们统一映射
                // 到同一个原生文件。此时复制等同于自我覆盖，必须直接跳过。
                var srcSavePath = canonicalSavePath(src);
                var destSavePath = canonicalSavePath(dest);
                if (srcSavePath && destSavePath && srcSavePath.toLowerCase() === destSavePath.toLowerCase()) {
                    console.log("[Polyfill] copyFileSync skipped for identical canonical save: " + srcSavePath);
                    return;
                }
                var data = mockFS.readFileSync(src);
                mockFS.writeFileSync(dest, data);
            } catch (e) {
                console.warn("[Polyfill] copyFileSync failed: " + src + " -> " + dest);
            }
        },
        mkdirSync: function() {},
        // 异步 mkdir：只做回调（目录操作在 WebView 中无意义）。
        // 部分插件（如 LN_FilmicFilter 的 NW 分支）只调异步版，
        // 缺失会抛 "mkdir is not a function"。
        mkdir: function(path, optionsOrCallback, callback) {
            var cb = typeof optionsOrCallback === 'function' ? optionsOrCallback : callback;
            setTimeout(function() { if (typeof cb === 'function') cb(null); }, 0);
        },
        openSync: function(path, flags) { console.log("[Polyfill] fs.openSync ignored: " + path); return 0; },
        closeSync: function(fd) {},
        writeSync: function(fd, data) {},
        appendFileSync: function(path, data) { console.log("[Polyfill] fs.appendFileSync ignored: " + path); },
        createWriteStream: function(path) {
            // 实现 Node.js fs.createWriteStream 的最小可用子集：
            //   write(chunk[, encoding][, callback])
            //   end([chunk][, encoding][, callback])
            //   on('finish' | 'close' | 'error', cb)
            // 内部缓冲所有 write，在 end 时通过 prompt 同步写盘。
            // 这样游戏流程中 `stream.end()` 后立即 `location.reload()` 仍能读到新内容。
            var buffer = "";
            var finished = false;
            var listeners = { finish: [], close: [], error: [] };

            function emit(event) {
                (listeners[event] || []).forEach(function (cb) {
                    try { cb(); } catch (e) { console.warn('[Polyfill] stream listener error:', e); }
                });
            }

            return {
                write: function(chunk, encoding, callback) {
                    if (finished) return false;
                    if (typeof chunk === 'string') {
                        buffer += chunk;
                    } else if (chunk == null) {
                        // skip
                    } else if (typeof chunk === 'number' || typeof chunk === 'boolean') {
                        buffer += String(chunk);
                    } else if (chunk && (chunk instanceof ArrayBuffer || chunk.buffer instanceof ArrayBuffer)) {
                        var u8 = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk.buffer ? chunk.buffer : chunk);
                        for (var i = 0; i < u8.length; i++) buffer += String.fromCharCode(u8[i]);
                    } else {
                        buffer += String(chunk);
                    }
                    if (typeof encoding === 'function') { encoding(); return true; }
                    if (typeof callback === 'function') callback();
                    return true;
                },
                end: function(chunk, encoding, callback) {
                    if (finished) return;
                    if (typeof chunk === 'string') buffer += chunk;
                    else if (typeof chunk === 'function') { callback = chunk; }
                    else if (chunk != null) buffer += String(chunk);
                    if (typeof encoding === 'function' && typeof callback === 'undefined') callback = encoding;
                    finished = true;
                    nativeWriteFile(path, buffer);
                    emit('finish');
                    emit('close');
                    if (typeof callback === 'function') callback();
                },
                on: function(event, cb) {
                    if (listeners[event]) listeners[event].push(cb);
                    return this;
                },
                once: function(event, cb) {
                    var self = this;
                    var wrapper = function() {
                        try { cb(); } catch (e) {}
                        var arr = listeners[event] || [];
                        var idx = arr.indexOf(wrapper);
                        if (idx !== -1) arr.splice(idx, 1);
                    };
                    return this.on(event, wrapper);
                },
                removeListener: function(event, cb) {
                    var arr = listeners[event];
                    if (!arr) return this;
                    var idx = arr.indexOf(cb);
                    if (idx !== -1) arr.splice(idx, 1);
                    return this;
                },
                emit: function(event) { emit(event); return this; },
                destroy: function() { finished = true; return this; },
                writable: true
            };
        },
        createReadStream: function(path) { return { on: function(ev, cb) { if(ev==='error') cb(new Error('ENOENT')); } }; },
        statSync: function(p) {
            var exists = mockFS.existsSync(p);
            return {
                isDirectory: function() { return false; },
                isFile: function() { return exists; },
                size: 0, mtimeMs: 0, mtime: new Date(0)
            };
        },
        lstatSync: function(p) { return mockFS.statSync(p); },
        unlinkSync: function(path) {
            const filename = saveFilenameFromPath(path);
            if (!filename) {
                console.log("[Polyfill] unlinkSync ignored for non-save file: " + path);
                return;
            }
            // 先排空未落盘的异步写，避免删完又被滞后的写消息复活
            flushPendingSaveWrites();
            if (!nativeDeleteSave(filename)) {
                throw new Error("Failed to delete save file: " + filename);
            }
            delete pendingSaveWrites[filename];
            saveExistsCache[filename] = false;
            console.log("[Polyfill] deleted save file: " + filename);
        },
        renameSync: function(oldPath, newPath) {
            const oldFilename = saveFilenameFromPath(oldPath);
            const newFilename = saveFilenameFromPath(newPath);
            if (!oldFilename || !newFilename) {
                console.log("[Polyfill] renameSync ignored for non-save file: " + oldPath + " -> " + newPath);
                return;
            }
            // 先排空未落盘的异步写，否则原生 rename 可能赶在写之前执行（文件不存在）
            flushPendingSaveWrites();
            if (!nativeRenameSave(oldFilename, newFilename)) {
                throw new Error("Failed to rename save file: " + oldFilename + " -> " + newFilename);
            }
            delete pendingSaveWrites[oldFilename];
            delete pendingSaveWrites[newFilename];
            saveExistsCache[oldFilename] = false;
            saveExistsCache[newFilename] = true;
            console.log("[Polyfill] renamed save file: " + oldFilename + " -> " + newFilename);
        },
        rename: function(oldPath, newPath, callback) {
            try {
                mockFS.renameSync(oldPath, newPath);
                if (typeof callback === 'function') callback(null);
            } catch (e) {
                if (typeof callback === 'function') callback(e);
            }
        },
        readFile: function(path, optionsOrCallback, callback) {
            var cb = typeof optionsOrCallback === 'function' ? optionsOrCallback : callback;
            try {
                var result = mockFS.readFileSync(path, typeof optionsOrCallback === 'string' ? optionsOrCallback : undefined);
                if (typeof cb === 'function') cb(null, result);
            } catch(e) {
                if (typeof cb === 'function') cb(e);
            }
        },
        writeFile: function(path, data, optionsOrCallback, callback) {
            // PDX_CoreAPI / PDX_StorageManager 使用异步 writeFile(path, content, callback)
            var cb = typeof optionsOrCallback === 'function' ? optionsOrCallback : callback;
            try {
                mockFS.writeFileSync(path, data);
                if (typeof cb === 'function') cb(null);
            } catch(e) {
                if (typeof cb === 'function') cb(e);
            }
        },
        unlink: function(path, callback) {
            try {
                mockFS.unlinkSync(path);
                if (typeof callback === 'function') callback(null);
            } catch(e) {
                if (typeof callback === 'function') callback(e);
            }
        },
        readdir: function(path, callback) {
            try {
                var result = mockFS.readdirSync(path);
                if (typeof callback === 'function') callback(null, result);
            } catch(e) {
                if (typeof callback === 'function') callback(e, []);
            }
        },
        readdirSync: function(path) {
            try {
                const p = String(path || '').replace(/\\/g, '/');
                let relPath;
                // Extract game-relative path using same normalization as existsSync/readFileSync
                if (p.includes('/save')) {
                    const idx = p.lastIndexOf('/save');
                    relPath = p.substring(idx + 1); // e.g. "save" or "save/subdir"
                } else {
                    relPath = p.replace(/^.*www\//, '').replace(/^\//, '');
                }
                relPath = relPath.replace(/\/+$/, ''); // strip trailing slash
                const result = prompt('__NATIVE_READDIR__:' + relPath, '[]');
                return JSON.parse(result || '[]');
            } catch (e) {
                return [];
            }
        }
    };

    // 注入全局 require
    // 无条件安装（不依赖 window.nw）：
    //   common_fs.js (f) 按字母序先于 common_nw.js (n) 加载，window.nw 此时尚未设置，
    //   若依赖 window.nw 条件则永远跳过 → mz_bootstrap.js 装了空 stub → require('path') = undefined。
    // isNwjs() 检测条件是 typeof require === 'function' && typeof process === 'object'，
    //   此处只装 require 不装 process，isNwjs() 仍为 false，存档路径不受影响。
    // ---- EventEmitter class（可被 ES6 class extends 使用）----
    var mockEventEmitter = (function() {
        function EventEmitter() {
            this._events = Object.create(null);
            this._maxListeners = 10;
        }
        EventEmitter.prototype.setMaxListeners = function(n) { this._maxListeners = n; return this; };
        EventEmitter.prototype.getMaxListeners = function() { return this._maxListeners; };
        EventEmitter.prototype.addListener = function(event, listener) {
            if (typeof listener !== 'function') return this;
            if (!this._events[event]) this._events[event] = [];
            this._events[event].push(listener);
            return this;
        };
        EventEmitter.prototype.on = EventEmitter.prototype.addListener;
        EventEmitter.prototype.once = function(event, listener) {
            if (typeof listener !== 'function') return this;
            var self = this;
            function wrapper() {
                self.removeListener(event, wrapper);
                listener.apply(this, arguments);
            }
            wrapper._originalListener = listener;
            return this.addListener(event, wrapper);
        };
        EventEmitter.prototype.removeListener = function(event, listener) {
            var list = this._events[event];
            if (!list) return this;
            var idx = -1;
            for (var i = list.length - 1; i >= 0; i--) {
                if (list[i] === listener || list[i]._originalListener === listener) { idx = i; break; }
            }
            if (idx !== -1) list.splice(idx, 1);
            return this;
        };
        EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
        EventEmitter.prototype.removeAllListeners = function(event) {
            if (event) this._events[event] = [];
            else this._events = Object.create(null);
            return this;
        };
        EventEmitter.prototype.emit = function(event) {
            var list = this._events[event];
            if (!list || !list.length) return false;
            var args = Array.prototype.slice.call(arguments, 1);
            list.slice().forEach(function(fn) { try { fn.apply(null, args); } catch(e) { console.warn('[EventEmitter] listener error:', e); } });
            return true;
        };
        EventEmitter.prototype.listeners = function(event) {
            return (this._events[event] || []).slice();
        };
        EventEmitter.prototype.listenerCount = function(event) {
            return (this._events[event] || []).length;
        };
        EventEmitter.listenerCount = function(emitter, event) { return emitter.listenerCount(event); };
        return EventEmitter;
    })();

    // ---- util module polyfill ----
    var mockUtil = {
        promisify: function(fn) {
            return function() {
                var args = Array.prototype.slice.call(arguments);
                var self = this;
                return new Promise(function(resolve, reject) {
                    args.push(function(err, result) {
                        if (err) reject(err); else resolve(result);
                    });
                    fn.apply(self, args);
                });
            };
        },
        inherits: function(ctor, superCtor) {
            ctor.prototype = Object.create(superCtor.prototype, {
                constructor: { value: ctor, enumerable: false, writable: true, configurable: true }
            });
        },
        format: function(fmt) {
            var args = Array.prototype.slice.call(arguments, 1);
            var i = 0;
            if (typeof fmt !== 'string') return Array.prototype.join.call(arguments, ' ');
            return fmt.replace(/%[sdjifoO%]/g, function(m) {
                if (m === '%%') return '%';
                var arg = args[i++];
                if (m === '%s') return String(arg);
                if (m === '%d' || m === '%i') return parseInt(arg, 10);
                if (m === '%f') return parseFloat(arg);
                if (m === '%j') { try { return JSON.stringify(arg); } catch(e) { return '[Circular]'; } }
                if (m === '%o' || m === '%O') { try { return JSON.stringify(arg, null, 2); } catch(e) { return String(arg); } }
                return m;
            });
        },
        inspect: function(obj) { try { return JSON.stringify(obj, null, 2); } catch(e) { return String(obj); } },
        deprecate: function(fn) { return fn; },
        callbackify: function(fn) {
            return function() {
                var args = Array.prototype.slice.call(arguments);
                var cb = args.pop();
                fn.apply(this, args).then(function(v) { cb(null, v); }, function(e) { cb(e); });
            };
        },
        isArray: Array.isArray,
        isString: function(v) { return typeof v === 'string'; },
        isNumber: function(v) { return typeof v === 'number'; },
        isObject: function(v) { return v !== null && typeof v === 'object'; },
        isFunction: function(v) { return typeof v === 'function'; },
        isNull: function(v) { return v === null; },
        isUndefined: function(v) { return v === undefined; },
        isBoolean: function(v) { return typeof v === 'boolean'; },
        types: {
            isPromise: function(v) { return v && typeof v.then === 'function'; },
            isMap: function(v) { return v instanceof Map; },
            isSet: function(v) { return v instanceof Set; },
            isRegExp: function(v) { return v instanceof RegExp; },
            isDate: function(v) { return v instanceof Date; }
        }
    };

    // 安全对象包装器：用 Proxy 确保任何未定义属性访问都返回安全的空函数/对象，
    // 彻底避免插件访问 nw.gui 不存在的属性时 TypeError。
    function makeSafeObject(target) {
        target = target || {};
        if (typeof Proxy === 'undefined') {
            // 旧浏览器不支持 Proxy：返回原对象（已包含常用属性）
            return target;
        }
        return new Proxy(target, {
            get: function(obj, prop) {
                if (prop in obj) return obj[prop];
                if (prop === Symbol.toPrimitive || prop === Symbol.iterator) return undefined;
                if (prop === 'then') return undefined; // 避免被当成 Promise
                // 未定义属性返回一个可调用、可访问的安全对象
                var safe = function() { return makeSafeObject({}); };
                return makeSafeObject(safe);
            },
            set: function(obj, prop, value) {
                obj[prop] = value;
                return true;
            }
        });
    }

    function makeSafeWindow() {
        var win = {
            _events: {},
            on: function(event, listener) {
                if (typeof listener !== 'function') return this;
                this._events[event] = this._events[event] || [];
                this._events[event].push(listener);
                return this;
            },
            addListener: function(e, l) { return this.on(e, l); },
            removeListener: function(event, listener) {
                var list = this._events[event];
                if (list) {
                    var idx = list.indexOf(listener);
                    if (idx !== -1) list.splice(idx, 1);
                }
                return this;
            },
            removeAllListeners: function(event) {
                if (event) this._events[event] = [];
                else this._events = {};
                return this;
            },
            emit: function(event) {
                var list = this._events[event];
                if (!list || !list.length) return false;
                var args = Array.prototype.slice.call(arguments, 1);
                list.slice().forEach(function(fn) { try { fn.apply(null, args); } catch(e) {} });
                return true;
            },
            close: function() { try { window.close(); } catch(_){} },
            reload: function() { location.reload(); },
            maximize: function() {}, minimize: function() {}, restore: function() {},
            focus: function() {}, blur: function() {}, show: function() {}, hide: function() {},
            enterFullscreen: function() {}, leaveFullscreen: function() {}, toggleFullscreen: function() {},
            showDevTools: function() {}, closeDevTools: function() {},
            isDevToolsOpen: function() { return false; },
            isFullscreen: function() { return false; },
            isMaximized: function() { return false; },
            isMinimized: function() { return false; },
            isVisible: function() { return true; },
            isClosing: function() { return false; },
            resizeTo: function() {}, moveTo: function() {}, resizeBy: function() {}, moveBy: function() {},
            setResizable: function() {}, setAlwaysOnTop: function() {}, setCloseListener: function() {},
            setMinimumSize: function() {}, setMaximumSize: function() {}, lockPosition: function() {},
            width: window.innerWidth, height: window.innerHeight, x: 0, y: 0,
            scale: { x: 1, y: 1 }, menu: null,
            window: window, document: document, location: location
        };
        return makeSafeObject(win);
    }

    if (typeof window.require === 'undefined') {
        window.require = function(moduleName) {
            console.log("[Polyfill] require called for: " + moduleName);
            if (moduleName === 'fs') return mockFS;
            if (moduleName === 'os') return mockOS;
            // Node 里 require('path/posix') 与 require('path') 等价（POSIX 实现）
            if (moduleName === 'path' || moduleName === 'path/posix') return mockPath;
            if (moduleName === 'process') return mockProcess;
            if (moduleName === 'events') return { EventEmitter: mockEventEmitter };
            if (moduleName === 'util') return mockUtil;
            if (moduleName === 'crypto') {
                const cryptoModule = window.__arkNodeCrypto || window.crypto;
                const source = window.__arkNodeCrypto ? '__arkNodeCrypto' : 'window.crypto';
                try {
                    console.log(
                        '[ArkCryptoDiag] require(crypto)',
                        'source=' + source,
                        'createHash=' + typeof (cryptoModule && cryptoModule.createHash),
                        'createCipheriv=' + typeof (cryptoModule && cryptoModule.createCipheriv),
                        'createDecipheriv=' + typeof (cryptoModule && cryptoModule.createDecipheriv),
                        'sameAsWindowCrypto=' + (cryptoModule === window.crypto)
                    );
                } catch (e) {
                    console.warn('[ArkCryptoDiag] require(crypto) log failed:', e && e.message ? e.message : e);
                }
                return cryptoModule;
            }
            if (moduleName === 'nw.gui') {
                // 优先返回 common_nw.js 设置的完整 mock（MZ 引擎）
                if (window.mockNW) return window.mockNW;
                // MV 引擎排除了 common_nw.js，此处提供内联最小 mock，
                // 防止插件（MovieManager.js、Community_Basic.js 等）直接调用
                // require('nw.gui').Window.get() 时因返回 {} 而崩溃。
                // 使用 Proxy 包装：任何未定义的属性访问都返回安全的空函数/对象，
                // 彻底避免 TypeError: undefined is not an object。
                var nwGuiTarget = {
                    Window: {
                        get: function() {
                            return makeSafeWindow();
                        },
                        open: function(url) { try { window.open(url); } catch(_){} }
                    },
                    App: {
                        argv: [], dataPath: '', fullArgv: [], filteredArgv: [],
                        manifest: { name: 'RPG Player' },
                        quit: function() { try { window.close(); } catch(_){} },
                        clearCache: function() {},
                        closeAllWindows: function() { try { window.close(); } catch(_){} }
                    },
                    Shell: { openExternal: function() {}, openItem: function() {} },
                    Menu: function() { return makeSafeObject({ append: function() {}, popup: function() {}, remove: function() {} }); },
                    MenuItem: function(o) { return o || {}; },
                    Clipboard: { get: function() { return makeSafeObject({ get: function() { return ''; }, set: function() {} }); } }
                };
                return makeSafeObject(nwGuiTarget);
            }
            if (moduleName === 'koffi' || moduleName.endsWith('/koffi') || moduleName.includes('koffi/')) {
                console.log('[Polyfill] Mocking koffi for: ' + moduleName);
                return mockKoffi;
            }
            
            // Loose matching for greenworks (plugins might require('./greenworks') or similar)
            if (moduleName.includes('greenworks')) {
                console.log("[Polyfill] Mocking greenworks for: " + moduleName);
                // 优先使用 common_nw.js 的 greenworksMock（API 更完整），
                // 插件加载时 common_nw.js 已执行完毕。
                if (window.greenworksMock) return window.greenworksMock;
                return {
                    // Core
                    initAPI: function() { console.log("[greenworks] initAPI called (Mock: Success)"); return true; }, 
                    init: function() { return true; },
                    isSteamRunning: function() { return true; },
                    // DLC / ownership
                    isSubscribedApp: function() { return true; },
                    
                    // User
                    getSteamId: function() { return { staticAccountId: '123456789', screenName: 'ArkPlayer', level: 1 }; }, 
                    getCurrentGameLanguage: function() { return 'english'; },
                    getUILanguage: function() { return 'english'; },
                    
                    // Overlay
                    activateGameOverlay: function() {},
                    activateGameOverlayToWebPage: function() {},
                    
                    // Stats & Achievements
                    getStatInt: function() { return 0; },
                    getStatFloat: function() { return 0.0; },
                    setStat: function() { return true; },
                    storeStats: function() { return true; },
                    resetAllStats: function() { return true; },
                    getAchievement: function() { return false; },
                    setAchievement: function() { return true; },
                    clearAchievement: function() { return true; },
                    getNumberOfAchievements: function() { return 0; },
                    getAchievementNames: function() { return []; },
                    
                    // Cloud (Disable to ensure local saves are used)
                    isCloudEnabled: function() { return false; },
                    enableCloud: function(flag) {},
                    getCloudQuota: function(success) { if(success) success(1000000, 0); },
                    
                    // Cloud File Ops (Fail gracefully if called)
                    saveTextToFile: function(file, content, success, error) { console.warn("[greenworks] Cloud save ignored"); if(success) success(); },
                    readTextFromFile: function(file, success, error) { console.warn("[greenworks] Cloud read ignored"); if(error) error("Cloud disabled"); },
                    writeFile: function(file, content, options, success, error) { console.warn("[greenworks] Cloud write ignored"); if(success) success(); },
                    readFile: function(file, success, error) { console.warn("[greenworks] Cloud read ignored"); if(error) error("Cloud disabled"); },
                    
                    // Workshop
                    ugcGetItems: function(options, type, func, success, error) { if(error) error(); }
                };
            }
            
            console.warn("[Polyfill] require module not found: " + moduleName);
            return {}; 
        };
    }

    // 兼容直接访问 window.os 的插件
    if (typeof window.os === 'undefined') {
        window.os = mockOS;
    }

    // 兼容直接访问 window.koffi 的插件
    if (typeof window.koffi === 'undefined') {
        window.koffi = mockKoffi;
    }

    // Buffer polyfill（Node.js global，WebKit 不内置）
    // 支持 Buffer.from(str, encoding) / Buffer.from(array) / Buffer.alloc / Buffer.isBuffer 等常见用法
    if (typeof window.Buffer === 'undefined') {
        window.Buffer = (function() {
            function Buffer(data, encoding) {
                if (typeof data === 'string') {
                    this._bytes = encodeString(data, encoding || 'utf8');
                } else if (data instanceof ArrayBuffer) {
                    this._bytes = new Uint8Array(data);
                } else if (data instanceof Uint8Array || Array.isArray(data)) {
                    this._bytes = new Uint8Array(data);
                } else if (data && data._bytes instanceof Uint8Array) {
                    this._bytes = new Uint8Array(data._bytes);
                } else if (typeof data === 'number') {
                    this._bytes = new Uint8Array(data);
                } else {
                    this._bytes = new Uint8Array(0);
                }
                this.length = this._bytes.length;
                // Expose bytes via numeric indices for Node.js Buffer compatibility.
                // Required for DRM/encryption code that modifies bytes via b[i] = v.
                for (var _i = 0; _i < this._bytes.length; _i++) this[_i] = this._bytes[_i];
            }

            function encodeString(str, encoding) {
                var enc = (encoding || 'utf8').toLowerCase().replace(/-/g, '');
                if (enc === 'base64') {
                    // atob returns binary string; convert to Uint8Array
                    var bin = atob(str.replace(/[^A-Za-z0-9+/=]/g, ''));
                    var bytes = new Uint8Array(bin.length);
                    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                    return bytes;
                } else if (enc === 'hex') {
                    var h = str.replace(/[^0-9a-fA-F]/g, '');
                    var bytes = new Uint8Array(Math.floor(h.length / 2));
                    for (var i = 0; i < bytes.length; i++) bytes[i] = parseInt(h.substr(i * 2, 2), 16);
                    return bytes;
                } else {
                    // utf8 / latin1 / binary
                    var encoded = new TextEncoder().encode(str);
                    return encoded;
                }
            }

            Buffer.prototype.toString = function(encoding) {
                var enc = (encoding || 'utf8').toLowerCase().replace(/-/g, '');
                // Always read from numeric-indexed properties, which may have been
                // mutated in-place via b[i] = v (e.g. DRM decryption loops).
                var len = this.length;
                var bytes = new Uint8Array(len);
                for (var i = 0; i < len; i++) bytes[i] = (this[i] !== undefined ? this[i] & 255 : 0);
                if (enc === 'base64') {
                    var binary = '';
                    for (var i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
                    return btoa(binary);
                } else if (enc === 'hex') {
                    var out = '';
                    for (var i = 0; i < bytes.length; i++) {
                        var h = bytes[i].toString(16);
                        out += h.length < 2 ? '0' + h : h;
                    }
                    return out;
                } else {
                    return new TextDecoder('utf-8').decode(bytes);
                }
            };

            Buffer.prototype.subarray = function(start, end) {
                var len = this.length;
                var from = start == null ? 0 : Number(start);
                var to = end == null ? len : Number(end);
                if (from < 0) from = Math.max(len + from, 0);
                else from = Math.min(from, len);
                if (to < 0) to = Math.max(len + to, 0);
                else to = Math.min(to, len);
                if (to < from) to = from;
                var bytes = new Uint8Array(to - from);
                for (var i = from; i < to; i++) bytes[i - from] = this[i] & 255;
                return new Buffer(bytes);
            };

            Buffer.prototype.slice = Buffer.prototype.subarray;

            Buffer.prototype.equals = function(other) {
                if (!other || typeof other.length !== 'number' || this.length !== other.length) return false;
                for (var i = 0; i < this.length; i++) {
                    if ((this[i] & 255) !== (other[i] & 255)) return false;
                }
                return true;
            };

            Buffer.prototype.readUInt16LE = function(offset) {
                var i = Number(offset) || 0;
                if (i < 0 || i + 2 > this.length) throw new RangeError('Index out of range');
                return (this[i] & 255) | ((this[i + 1] & 255) << 8);
            };

            Buffer.prototype.readUInt32LE = function(offset) {
                var i = Number(offset) || 0;
                if (i < 0 || i + 4 > this.length) throw new RangeError('Index out of range');
                return ((this[i] & 255) |
                    ((this[i + 1] & 255) << 8) |
                    ((this[i + 2] & 255) << 16) |
                    ((this[i + 3] & 255) << 24)) >>> 0;
            };

            Buffer.prototype.lastIndexOf = function(value, byteOffset, encoding) {
                var needle;
                if (typeof value === 'number') {
                    needle = new Buffer([value & 255]);
                } else if (typeof value === 'string') {
                    needle = Buffer.from(value, encoding);
                } else if (value && typeof value.length === 'number') {
                    needle = value;
                } else {
                    throw new TypeError('value must be a string, number, or Buffer');
                }
                if (needle.length === 0) return Math.min(this.length, byteOffset == null ? this.length : Number(byteOffset));
                var start = byteOffset == null ? this.length - needle.length : Number(byteOffset);
                if (start < 0) start = this.length + start;
                start = Math.min(start, this.length - needle.length);
                for (var i = start; i >= 0; i--) {
                    var matched = true;
                    for (var j = 0; j < needle.length; j++) {
                        if ((this[i + j] & 255) !== (needle[j] & 255)) {
                            matched = false;
                            break;
                        }
                    }
                    if (matched) return i;
                }
                return -1;
            };

            Buffer.from = function(data, encoding) {
                return new Buffer(data, encoding);
            };

            Buffer.alloc = function(size, fill) {
                var buf = new Buffer(size);
                if (fill !== undefined) {
                    var fillByte = (typeof fill === 'number') ? (fill & 255) : fill.charCodeAt(0) & 255;
                    buf._bytes.fill(fillByte);
                    for (var i = 0; i < size; i++) buf[i] = fillByte;
                }
                return buf;
            };

            Buffer.allocUnsafe = Buffer.alloc;

            Buffer.isBuffer = function(obj) {
                return obj instanceof Buffer;
            };

            Buffer.concat = function(list, totalLength) {
                var total = totalLength || list.reduce(function(s, b) { return s + b.length; }, 0);
                var buf = new Buffer(total);
                var offset = 0;
                list.forEach(function(b) {
                    for (var i = 0; i < b.length; i++) {
                        var byte = (b[i] !== undefined) ? b[i] : (b._bytes ? b._bytes[i] : 0);
                        buf[offset + i] = byte & 255;
                        buf._bytes[offset + i] = byte & 255;
                    }
                    offset += b.length;
                });
                return buf;
            };

            Buffer.isEncoding = function(encoding) {
                return ['utf8', 'utf-8', 'base64', 'hex', 'binary', 'latin1', 'ascii'].indexOf((encoding||'').toLowerCase()) !== -1;
            };

            Buffer.byteLength = function(str, encoding) {
                return new Buffer(str, encoding).length;
            };

            return Buffer;
        })();
        console.log("[Polyfill] Buffer global installed.");
    }

    // 兼容直接访问 window.process 的插件
    (function ensureProcessCompat() {
        const proc = (typeof window.process === 'undefined' || !window.process) ? mockProcess : window.process;
        if (!proc.env || typeof proc.env !== 'object') proc.env = {};
        if (!proc.versions || typeof proc.versions !== 'object') proc.versions = {};
        if (!Array.isArray(proc.argv) || proc.argv.length === 0) {
            proc.argv = ['index.html', ''];
        } else if (typeof proc.argv[0] !== 'string') {
            proc.argv[0] = String(proc.argv[0] || 'index.html');
        }
        if (typeof proc.platform !== 'string') proc.platform = 'darwin';
        if (typeof proc.version !== 'string') proc.version = '';
        // 外部先装的 process stub 同样可能缺 title（见 mockProcess 注释）
        if (typeof proc.title !== 'string' || !proc.title) proc.title = 'browser';
        if (typeof proc.browser !== 'boolean') proc.browser = true;
        if (typeof proc.arch !== 'string') proc.arch = 'arm64';
        if (typeof window.__ARKRPG_PROCESS_EXEC_PATH__ === 'string' && window.__ARKRPG_PROCESS_EXEC_PATH__) {
            proc.execPath = window.__ARKRPG_PROCESS_EXEC_PATH__;
        } else if (!proc.execPath) {
            proc.execPath = proc.argv[0] || 'index.html';
        }
        if (!proc.mainModule || typeof proc.mainModule !== 'object') {
            proc.mainModule = { filename: proc.execPath };
        } else if (typeof window.__ARKRPG_PROCESS_EXEC_PATH__ === 'string' &&
                   window.__ARKRPG_PROCESS_EXEC_PATH__) {
            proc.mainModule.filename = proc.execPath;
        }
        if (typeof proc.cwd !== 'function') proc.cwd = function() { return '.'; };
        if (typeof proc.nextTick !== 'function') proc.nextTick = function(fn) { setTimeout(fn, 0); };
        if (typeof proc.exit !== 'function') proc.exit = function(code) { console.warn('[Polyfill] process.exit(' + (code || 0) + ') suppressed in WebView'); };
        window.process = proc;
    })();

})();
