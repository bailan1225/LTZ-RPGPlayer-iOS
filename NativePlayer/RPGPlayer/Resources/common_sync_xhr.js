/**
 * common_sync_xhr.js
 * 同步 XHR（open(..., async=false)）兼容层。
 *
 * WebKit 的 WKURLSchemeHandler 无法服务同步子资源加载：主线程同步 XHR 到
 * rpgmv:// / rpgmz:// 会命中 WebLoaderStrategy::loadResourceSynchronously
 * 恒定失败（error=0），插件拿到的是网络错误而不是文件内容。
 * 受影响的常见插件：
 *   - NekoGakuen_MulitLanguage：插件加载期同步拉 data/text.csv，失败后整个
 *     插件半死（csvData 无效 → getLangDataText 运行时 TypeError）
 *   - NekoGakuen_FontManager：checkFontFile 同步探测字体
 *   - polyfill 自己的 fs.readFileSync（NW.js 分支的插件全走它，如 UTA_CommonSave）
 *
 * 方案：拦 prototype 的 send，async=false 且目标为本 app 自定义 scheme 时，
 * 改走 prompt() 同步桥（__NATIVE_SYNC_GET__，见 WebViewCoordinator），由原生
 * 侧按 scheme handler 同源的解析逻辑读文件、base64 回传。响应格式：
 *   "<status>|<mime>|<base64>"
 * 大文件由原生侧设上限返回 413（WebKit IPC 不适合传 MB 级字符串），插件语义
 * 等同于拿到非 200，与修复前的失败行为一致，不会更糟。
 *
 * prompt 是 WKUIDelegate 的同步对话框边界，iOS WebKit 可能在返回后
 * 把原本 running 的 AudioContext 留在
 * suspended；桥调用后只恢复这个“调用前已在运行”的 context，不触发
 * 未经用户授权的首次音频启动。
 *
 * 成功读取的包内只读 GET/HEAD 会做小容量会话缓存，避免插件每帧轮询同一文件时
 * 反复进入 prompt()。缓存只覆盖 game host、只保存 200，写文件时由
 * common_fs.js 主动清空。
 *
 * 异步 XHR 完全不受影响（原样走 origSend）；非本 app scheme 的同步请求同样
 * 原样放行。
 */
(function () {
    var proto = window.XMLHttpRequest && XMLHttpRequest.prototype;
    if (!proto || proto.__arkRpgSyncXhrPatched) return;
    proto.__arkRpgSyncXhrPatched = true;

    var origOpen = proto.open;
    var origSend = proto.send;
    var responseCache = Object.create(null);
    var responseCacheOrder = [];
    var responseCacheBytes = 0;
    var maxCacheEntries = 64;
    var maxCacheItemBytes = 256 * 1024;
    var maxCacheBytes = 2 * 1024 * 1024;

    function cacheKey(method, abs) {
        method = String(method || 'GET').toUpperCase();
        if (method !== 'GET' && method !== 'HEAD') return '';
        if (!/^rpgm[vzc]:\/\/game(?:\/|$)/i.test(abs)) return '';
        return method + ' ' + abs;
    }

    function cachedResponse(key) {
        return key && Object.prototype.hasOwnProperty.call(responseCache, key)
            ? responseCache[key]
            : null;
    }

    function storeResponse(key, response) {
        if (!key || typeof response !== 'string' || response.length > maxCacheItemBytes) return;
        if (Object.prototype.hasOwnProperty.call(responseCache, key)) return;
        while (responseCacheOrder.length >= maxCacheEntries ||
               responseCacheBytes + response.length > maxCacheBytes) {
            var oldest = responseCacheOrder.shift();
            if (!oldest) break;
            responseCacheBytes -= responseCache[oldest].length;
            delete responseCache[oldest];
        }
        responseCache[key] = response;
        responseCacheOrder.push(key);
        responseCacheBytes += response.length;
    }

    function clearResponseCache() {
        responseCache = Object.create(null);
        responseCacheOrder = [];
        responseCacheBytes = 0;
    }

    // common_fs.js 在成功写入包内配置后调用，防止同会话读到旧内容。
    window.__arkRpgClearSyncXhrCache = clearResponseCache;

    function webAudioContext() {
        return window.WebAudio && window.WebAudio._context;
    }

    function restoreRunningAudioAfterPrompt(context, wasRunning, generation) {
        if (!wasRunning || !context || typeof context.resume !== 'function') return;

        function restoreIfSuspended() {
            if (context.__arkPromptGeneration !== generation ||
                context.state !== 'suspended' ||
                context.__arkPromptResumePending === generation) return;
            context.__arkPromptResumePending = generation;
            try {
                var result = context.resume();
                if (result && typeof result.then === 'function') {
                    result.then(function() {
                        if (context.__arkPromptResumePending === generation) {
                            context.__arkPromptResumePending = 0;
                            if (context.__arkPromptGeneration === generation) {
                                console.log('[SyncXhr] restored AudioContext after prompt, state=' + context.state);
                            }
                        }
                    }).catch(function(error) {
                        if (context.__arkPromptResumePending === generation) {
                            context.__arkPromptResumePending = 0;
                            if (context.__arkPromptGeneration === generation) {
                                console.warn('[SyncXhr] AudioContext restore after prompt failed: ' + error);
                            }
                        }
                    });
                } else {
                    if (context.__arkPromptResumePending === generation) {
                        context.__arkPromptResumePending = 0;
                    }
                }
            } catch (error) {
                if (context.__arkPromptResumePending === generation) {
                    context.__arkPromptResumePending = 0;
                }
                console.warn('[SyncXhr] AudioContext restore after prompt threw: ' + error);
            }
        }

        // 大多数 WebKit 版本在 prompt() 返回时 state 已更新；也保留一个
        // microtask 复查，覆盖 statechange 延后投递的版本。
        restoreIfSuspended();
        if (typeof Promise !== 'undefined') {
            Promise.resolve().then(restoreIfSuspended);
        }
        if (typeof setTimeout === 'function') {
            setTimeout(restoreIfSuspended, 0);
        }
    }

    function b64ToBytes(b64) {
        var bin = atob(b64);
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return bytes;
    }

    proto.open = function (method, url, async) {
        this.__arkRpgSyncXhr = (async === false);
        this.__arkRpgSyncMethod = method;
        this.__arkRpgSyncUrl = url;
        return origOpen.apply(this, arguments);
    };

    proto.send = function (body) {
        if (!this.__arkRpgSyncXhr) {
            return origSend.apply(this, arguments);
        }
        var self = this;
        var abs = '';
        try {
            abs = new URL(this.__arkRpgSyncUrl, location.href).href;
        } catch (e) {}
        if (!/^rpgm[vzc]/i.test(abs)) {
            return origSend.apply(this, arguments);
        }

        var key = cacheKey(this.__arkRpgSyncMethod, abs);
        var resp = cachedResponse(key);
        if (resp === null) {
            var contextBeforePrompt = webAudioContext();
            var audioWasRunning = !!contextBeforePrompt && contextBeforePrompt.state === 'running';
            var promptGeneration = 0;
            if (contextBeforePrompt) {
                promptGeneration = (contextBeforePrompt.__arkPromptGeneration || 0) + 1;
                contextBeforePrompt.__arkPromptGeneration = promptGeneration;
            }
            try {
                resp = prompt('__NATIVE_SYNC_GET__:' + abs, '');
            } catch (e) {}
            restoreRunningAudioAfterPrompt(contextBeforePrompt, audioWasRunning, promptGeneration);
        }
        var status = 0, mime = '', b64 = '';
        if (typeof resp === 'string' && resp.length > 0) {
            var s1 = resp.indexOf('|');
            var s2 = resp.indexOf('|', s1 + 1);
            if (s1 > 0 && s2 > s1) {
                status = parseInt(resp.slice(0, s1), 10) || 0;
                mime = resp.slice(s1 + 1, s2);
                b64 = resp.slice(s2 + 1);
            }
        }
        if (!status) {
            // 桥不可用（老版本原生/协议不匹配）：退回原生同步请求，
            // 行为与修复前一致（会失败），不再尝试。
            console.warn('[SyncXhr] bridge unavailable, falling back: ' + abs);
            return origSend.apply(this, arguments);
        }
        if (status === 200) storeResponse(key, resp);

        function define(name, value) {
            try {
                Object.defineProperty(self, name, {
                    value: value, writable: true, configurable: true
                });
            } catch (e) {}
        }

        var isBinary = (this.responseType === 'arraybuffer' || this.responseType === 'blob');
        if (status === 200) {
            try {
                if (isBinary) {
                    var bytes = b64ToBytes(b64);
                    define('response', this.responseType === 'blob'
                        ? new Blob([bytes.buffer], { type: mime })
                        : bytes.buffer);
                    // 二进制模式下访问 responseText 按规范会抛 InvalidStateError，
                    // 不定义该属性，保留原生 getter 语义。
                } else {
                    var text = new TextDecoder('utf-8').decode(b64ToBytes(b64));
                    define('response', text);
                    define('responseText', text);
                }
                define('status', 200);
                define('statusText', 'OK');
            } catch (e) {
                define('status', 500);
                define('response', '');
                define('responseText', '');
            }
        } else {
            // 404 / 413（超上限）：与网络失败同视，插件按非 200 处理
            define('status', status);
            define('statusText', status === 413 ? 'Payload Too Large' : 'Not Found');
            define('response', '');
            define('responseText', '');
        }
        define('readyState', 4);

        // 同步 XHR 语义：事件在 send() 内同步派发（readystatechange → load → loadend），
        // property 型 handler（onload 等）与 addEventListener 均会被触发
        try { self.dispatchEvent(new Event('readystatechange')); } catch (e) {}
        try { self.dispatchEvent(new Event('load')); } catch (e) {}
        try { self.dispatchEvent(new Event('loadend')); } catch (e) {}
    };

    console.log('[SyncXhr] sync XHR prompt bridge installed');
})();
