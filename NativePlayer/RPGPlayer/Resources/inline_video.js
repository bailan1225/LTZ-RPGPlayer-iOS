/**
 * inline_video.js
 * 强制 <video> 内联播放，拦截全屏进入；
 * 拦截 /movies/ 视频加载失败，将 error 事件转为合成的 ended 事件，防止游戏引擎崩溃/卡死。
 *
 * .webm → .mp4 重定向策略（2026-05 修正）：
 *   iOS WebKit/AVFoundation 给 <video> 选 demuxer 时高度依赖 URL 后缀；
 *   .webm URL 会被路由到不支持的 webm demuxer，连响应 Content-Type=video/mp4
 *   都不看，直接 net=3 NO_SOURCE。
 *   因此必须在 JS 层重写 src：.webm → .mp4。
 *
 * 自定义 scheme 视频播放策略（2026-06 修正）：
 *   AVFoundation 无法从自定义 URL scheme（rpgmv:// / rpgmz://）正常解码 <video>，
 *   无论 scheme handler 返回 200 全文件还是 206 Range，均反复重试后静默放弃。
 *   解决方案：在 loadstart 阶段 fetch 视频数据，创建 blob URL 替换 src，
 *   AVFoundation 可正常解码 blob URL。
 *
 * 注入时机：atDocumentStart（Phase 1）
 */
(function(){
    console.log('[ArkRPG] inline_video.js loaded (rev 2026-08-21-webm-taint)');

    // WebKit 对 WebM 内容的视频元素做 WebGL 纹理上传（texImage2D）时一律抛
    // SecurityError（origin-taint），无论来源是 blob 还是自定义 scheme；MP4 内容
    // 同路径上传正常。MoviePicture 等插件用 PIXI.VideoBaseTexture 把 <video> 传进
    // WebGL，一旦 scheme 侧漏出原始 WebM，异常会沿 render loop 冒泡直接冻结游戏。
    // 这里只对“video 元素 + SecurityError”的组合吞掉本次上传（保持纹理为空，
    // 画面呈现黑帧），其余错误原样抛出。scheme 侧修复（伪装扩展名识别 + 按需转码）
    // 生效后此保护应当永远不会触发。
    (function() {
        var protos = [
            window.WebGLRenderingContext && WebGLRenderingContext.prototype,
            window.WebGL2RenderingContext && WebGL2RenderingContext.prototype,
        ].filter(function(p) { return p && !p.__arkRpgTexImageGuarded; });
        var warned = false;
        protos.forEach(function(proto) {
            proto.__arkRpgTexImageGuarded = true;
            var orig = proto.texImage2D;
            proto.texImage2D = function(target, level, internalformat, format, type, source) {
                // 各重载的 source 均在最后一位；仅 video 纹理上传会因 WebM taint 抛错
                var lastArg = arguments[arguments.length - 1];
                if (!(lastArg instanceof HTMLVideoElement)) {
                    return orig.apply(this, arguments);
                }
                try {
                    return orig.apply(this, arguments);
                } catch (e) {
                    if (e && e.name === 'SecurityError') {
                        if (!warned) {
                            warned = true;
                            console.warn('[ArkRPG][Video] texImage2D SecurityError on video '
                                + '(WebKit WebM taint) — skipping texture upload: ' + (lastArg.src || ''));
                        }
                        return;
                    }
                    throw e;
                }
            };
        });
    })();
    // /movies/foo.webm 或 movies/foo.webm → 对应 .mp4（保留 query/hash）
    const isMovieUrl = function(url) {
        return typeof url === 'string' && (/(^|\/)movies\//i.test(url));
    };
    const isEncodedOuterMovieUrl = function(url) {
        if (typeof url !== 'string') return false;
        return /(^|\/)movies\/(?:\.%2f|%2e%2f|save%2f|save\/|\.\/)/i.test(url);
    };
    const rewriteWebmToMp4 = function(url) {
        if (typeof url !== 'string') return url;
        if (!isMovieUrl(url)) return url;
        if (isEncodedOuterMovieUrl(url)) return url;
        // 仅替换 path 部分末尾的 .webm（避免误改 query string）
        return url.replace(/\.webm(\?|#|$)/i, '.mp4$1');
    };

    // 缺失或无法解码的视频必须同时通知 PIXI“已加载”和游戏引擎“已结束”。
    // 返回一段可播放的空白 MP4 并不可靠：部分 MoviePicture 插件不会真正调用 play，
    // 因而永远收不到 ended。按 replacement token 去重，避免 fetch/error/timeout 重复派发。
    const finishUnavailableMovie = function(video, token, reason) {
        if (!video) return;
        if (token && video.__arkRpgBlobReplacementToken !== token) return;
        var finishToken = String(token || video.__arkRpgBlobReplacementToken || 'direct')
            + ':' + (video.src || video.currentSrc || '');
        if (video.__arkRpgSyntheticEndToken === finishToken) return;
        video.__arkRpgSyntheticEndToken = finishToken;
        video.__arkRpgBlobReplacementPending = false;
        console.warn('[ArkRPG][Video] unavailable — forcing loadeddata + ended: '
            + reason + ' src=' + (video.src || video.currentSrc || ''));
        setTimeout(function() {
            try { video.dispatchEvent(new Event('loadeddata')); } catch(_){}
            try { video.dispatchEvent(new Event('ended')); } catch(_){}
        }, 0);
    };

    try {
        const origPlay = HTMLMediaElement.prototype.play;
        HTMLMediaElement.prototype.play = function() {
            var element = this;
            var playPromise = origPlay.apply(element, arguments);
            if (!playPromise || typeof playPromise.catch !== 'function') return playPromise;
            if (!element || element.tagName !== 'VIDEO') return playPromise;
            return playPromise.catch(function(error) {
                var name = error && error.name ? String(error.name) : '';
                var message = error && error.message ? String(error.message) : '';
                var replacementAgeMs = Date.now() - (element.__arkRpgBlobReplacementAt || 0);
                var sourceWasReplaced = (element.__arkRpgBlobReplacementPending || element.__arkRpgBlobReplaced)
                    && replacementAgeMs >= 0
                    && replacementAgeMs < 15000;
                var interruptedByLoad = name === 'AbortError' || /interrupted|aborted|load request/i.test(message);
                if (!sourceWasReplaced || !interruptedByLoad) throw error;

                return new Promise(function(resolve, reject) {
                    var settled = false;
                    var retrying = false;
                    var timer = null;
                    var cleanup = function() {
                        element.removeEventListener('loadeddata', retry, true);
                        element.removeEventListener('canplay', retry, true);
                        element.removeEventListener('error', fail, true);
                        if (timer) clearTimeout(timer);
                    };
                    var finish = function(fn, value) {
                        if (settled) return;
                        settled = true;
                        cleanup();
                        fn(value);
                    };
                    var retry = function() {
                        if (settled || retrying) return;
                        if (element.readyState < 2) return;
                        retrying = true;
                        try {
                            var retryPromise = origPlay.call(element);
                            if (retryPromise && typeof retryPromise.then === 'function') {
                                retryPromise.then(function(value) { finish(resolve, value); }, function(e) { finish(reject, e); });
                            } else {
                                finish(resolve);
                            }
                        } catch (e) {
                            finish(reject, e);
                        }
                    };
                    var fail = function() { finish(reject, element.error || error); };
                    element.addEventListener('loadeddata', retry, true);
                    element.addEventListener('canplay', retry, true);
                    element.addEventListener('error', fail, true);
                    timer = setTimeout(function() {
                        if (element.readyState >= 2) {
                            retry();
                        } else {
                            finish(reject, error);
                        }
                    }, 12000);
                    retry();
                });
            });
        };
    } catch(e) { console.warn('[ArkRPG] play promise patch failed: ' + e); }

    // 查找 src 属性 descriptor（沿原型链向上找）
    const findSrcDescriptor = function(el) {
        var p = Object.getPrototypeOf(el);
        while (p) {
            var d = Object.getOwnPropertyDescriptor(p, 'src');
            if (d && d.set && d.get) return d;
            p = Object.getPrototypeOf(p);
        }
        return null;
    };

    // 在 <video> 实例上安装 src setter，拦截 .webm → .mp4
    const installSrcHook = function(video) {
        try {
            // 已安装过则跳过
            if (video.__arkRpgSrcHooked) return;
            var desc = findSrcDescriptor(video);
            if (!desc) { console.warn('[ArkRPG] no src descriptor on video proto chain'); return; }
            Object.defineProperty(video, 'src', {
                configurable: true,
                enumerable: true,
                get: function() { return desc.get.call(this); },
                set: function(value) {
                    var rewritten = rewriteWebmToMp4(value);
                    if (rewritten !== value) {
                        console.log('[ArkRPG] src rewrite: ' + value + ' -> ' + rewritten);
                    }
                    desc.set.call(this, rewritten);
                }
            });
            video.__arkRpgSrcHooked = true;
        } catch(e) { console.warn('[ArkRPG] install src hook failed: ' + e); }
    };

    // 同时拦截 setAttribute('src'/'crossorigin', ...) 路径
    try {
        const origSetAttr = Element.prototype.setAttribute;
        Element.prototype.setAttribute = function(name, value) {
            if ((this.tagName === 'VIDEO' || this.tagName === 'SOURCE')
                && typeof name === 'string') {
                var nl = name.toLowerCase();
                if (nl === 'src') {
                    var rewritten = rewriteWebmToMp4(value);
                    if (rewritten !== value) {
                        console.log('[ArkRPG] setAttribute(src) rewrite: ' + value + ' -> ' + rewritten);
                    }
                    return origSetAttr.call(this, name, rewritten);
                }
                if (nl === 'crossorigin' && window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
                    return; // suppress crossOrigin on custom scheme
                }
            }
            return origSetAttr.call(this, name, value);
        };
    } catch(e) { console.warn('[ArkRPG] setAttribute hook failed: ' + e); }

    // iOS AVFoundation 不支持对自定义 URL scheme（rpgmv:// / rpgmz://）
    // 的视频执行 CORS 检查。若 crossOrigin='anonymous' 被设置，AVFoundation 可能
    // 静默拒绝加载，不发请求也不触发 error → PIXI hasLoaded 永远不 true → 游戏卡死。
    // 修复：拦截 crossOrigin setter，对自定义 scheme 页面不设置 crossOrigin。
    try {
        var coDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'crossOrigin');
        if (coDesc && coDesc.set) {
            var origCrossOriginSet = coDesc.set;
            Object.defineProperty(HTMLMediaElement.prototype, 'crossOrigin', {
                configurable: true, enumerable: true,
                get: coDesc.get,
                set: function(v) {
                    // 自定义 scheme 页面 origin 为 null，跳过 CORS 设置
                    if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
                        console.log('[ArkRPG] suppressed crossOrigin=' + v + ' on custom scheme');
                        return;
                    }
                    return origCrossOriginSet.call(this, v);
                }
            });
        }
    } catch(e) { /* non-critical */ }

    const markInline = (video) => {
        try {
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            video.setAttribute('x5-playsinline', '');
            video.disablePictureInPicture = true;
            // 拦截进入全屏
            if (typeof video.webkitEnterFullscreen === 'function') {
                video.webkitEnterFullscreen = function() { return; };
            }
            const exit = () => {
                try {
                    if (video.webkitSupportsFullscreen && video.webkitDisplayingFullscreen) {
                        video.webkitExitFullscreen();
                    }
                } catch(_){ }
            };
            video.addEventListener('webkitbeginfullscreen', function(e){ e.preventDefault(); exit(); }, true);
            video.addEventListener('ended', exit, true);
            // 关键：fetch 预热 WKWebView HTTP cache。
            // 实测如果不做这一步，AVFoundation 在 .webm URL 上有时会静默拒绝
            // （既不发请求给 scheme handler，也不 fire error 事件），导致引擎
            // 等 loadeddata 永远不来 → 卡死。此 fetch 让 scheme handler 的响应
            // 进 cache，AVFoundation 后续读取时拿到正确的 mp4 内容 + Content-Type,
            // 即便 URL 后缀仍是 .webm 也能播放。删除此段会复现间歇性卡死，详见
            // git 历史 / repo memory。
            video.addEventListener('loadstart', function() {
                var s = video.src || video.currentSrc || '';
                if (!isMovieUrl(s)) return;
                if (video.__arkRpgPrewarmed) return;
                video.__arkRpgPrewarmed = true;
                console.log('[ArkRPG][Video] loadstart: ' + s
                    + ' crossOrigin=' + video.crossOrigin
                    + ' protocol=' + window.location.protocol);
                // AVFoundation 无法从自定义 scheme（rpgmv:// / rpgmz://）正常解码视频，
                // 无论 Range/200 返回方式如何都会反复重试直到静默放弃。
                // 解决方案：fetch 视频数据，创建 blob URL 作为 src。
                // blob URL 由 web 进程内部处理，AVFoundation 可以正常解码。
                if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
                    var replacementToken = (video.__arkRpgBlobReplacementToken || 0) + 1;
                    video.__arkRpgBlobReplacementToken = replacementToken;
                    video.__arkRpgBlobReplacementPending = true;
                    video.__arkRpgBlobReplacementAt = Date.now();
                    fetch(s).then(function(r) {
                        if (r && typeof r.ok === 'boolean' && !r.ok) {
                            throw new Error('HTTP ' + r.status);
                        }
                        // scheme 侧可能已按内容改供 MP4（webm→mp4 twin / 伪装扩展名转码），
                        // 但伪装扩展名（.ddi 等）请求的响应 Content-Type 未必可靠，
                        // 仅当它明确是 video/* 时才采用，否则按 MP4 处理（AVFoundation 最稳）。
                        var contentType = '';
                        try { contentType = (r.headers && r.headers.get('Content-Type')) || ''; } catch(_){}
                        if (!/^video\//i.test(contentType)) contentType = 'video/mp4';
                        return r.arrayBuffer().then(function(buffer) {
                            return { buffer: buffer, type: contentType };
                        });
                    }).then(function(payload) {
                        if (video.__arkRpgBlobReplacementToken !== replacementToken) return;
                        var buffer = payload.buffer;
                        var blob = new Blob([buffer], {type: payload.type});
                        var blobUrl = URL.createObjectURL(blob);
                        console.log('[ArkRPG][Video] blob: ' + blobUrl + ' bytes=' + buffer.byteLength);
                        if (video.__arkRpgBlobUrl) {
                            try { URL.revokeObjectURL(video.__arkRpgBlobUrl); } catch(_){}
                        }
                        video.__arkRpgBlobUrl = blobUrl;
                        video.__arkRpgBlobReplaced = true;
                        video.__arkRpgBlobReplacementAt = Date.now();
                        video.src = blobUrl;
                        video.load();
                    }).catch(function(e) {
                        if (video.__arkRpgBlobReplacementToken === replacementToken) {
                            video.__arkRpgBlobReplacementPending = false;
                        }
                        console.warn('[ArkRPG][Video] blob conversion failed: ' + e);
                        finishUnavailableMovie(video, replacementToken, 'fetch failed: ' + e);
                    });
                }
                // 超时保护：10 秒后如果视频仍未 loadeddata，强制派发事件防止 PIXI 死锁
                setTimeout(function() {
                    if (!video.isConnected) return;
                    if (video.__arkRpgBlobReplacementToken !== replacementToken) return;
                    if (video.readyState >= 2) return; // HAVE_CURRENT_DATA or better
                    finishUnavailableMovie(video, replacementToken, 'timeout: ' + s);
                }, 10000);
            }, true);
            video.addEventListener('loadeddata', function() {
                video.__arkRpgBlobReplacementPending = false;
                var s = video.src || video.currentSrc || '';
                console.log('[ArkRPG][Video] loadeddata: ' + s
                    + ' ready=' + video.readyState
                    + ' dur=' + video.duration);
            }, true);
            video.addEventListener('canplay', function() {
                var s = video.src || video.currentSrc || '';
                console.log('[ArkRPG][Video] canplay: ' + s + ' ready=' + video.readyState);
            }, true);
            // 拦截 /movies/ 视频的 error 事件（capture 阶段，先于游戏引擎 bubble 阶段 handler）
            // 防止引擎将视频加载失败 throw 为 LoadError 崩溃/卡死游戏
            video.addEventListener('error', function(e) {
                var src = video.src || video.currentSrc || '';
                // MZ/插件在影片播完后会执行 video.src = "" 清理；WebKit 把空 src 解析为
                // 页面 URL（index.html）并触发 error。这是清理动作而非真正的影片加载失败。
                // 若仍按失败处理并派发合成 loadeddata，会让已销毁/空 source 的 PIXI 视频纹理
                // 崩溃（TypeError: null is not an object 'source._pixiId'，复现游戏：
                // 冒涜の聖女ナタリア MZ）。直接忽略即可——MZ 自身的清理本就不会崩。
                if (!src || src === window.location.href || /(^|\/)index\.html?$/i.test(src)) {
                    return;
                }
                // Match /movies/ scheme URLs or blob URLs that replaced them
                if (isMovieUrl(src) || video.__arkRpgPrewarmed) {
                    e.stopImmediatePropagation();
                    var err = video.error;
                    var code = err ? err.code : 'null';
                    var msg = err ? (err.message || '') : '';
                    // error code: 1=ABORTED 2=NETWORK 3=DECODE 4=SRC_NOT_SUPPORTED
                    console.warn('[ArkRPG] movie load failed: ' + src
                        + ' | errCode=' + code
                        + ' | net=' + video.networkState
                        + ' | ready=' + video.readyState
                        + (msg ? ' | ' + msg : ''));
                    // Fallback：如果 src 还是 .webm（setter/setAttribute hook 都没拦住，
                    // 实测 MZ 引擎走的就是这条路），这里改写到 .mp4 重新 load 一次
                    if (/\.webm(\?|#|$)/i.test(src) && !video.__arkRpgRetried) {
                        var rewritten = rewriteWebmToMp4(src);
                        if (rewritten !== src) {
                            console.log('[ArkRPG] webm->mp4 retry: ' + src + ' -> ' + rewritten);
                            video.__arkRpgRetried = true;
                            try {
                                video.src = rewritten;
                                video.load();
                            } catch(re) { console.warn('[ArkRPG] retry failed: ' + re); }
                            return;
                        }
                    }
                    // 触发合成 loadeddata + ended 事件。
                    // loadeddata 让 PIXI v4 VideoBaseTexture 设置 hasLoaded=true，
                    // 否则 ysp.VideoPlayer.isReady() 等插件会永远返回 false 导致事件死循环。
                    // ended 让 MV/MZ 引擎认为视频正常播完，游戏继续。
                    finishUnavailableMovie(
                        video,
                        video.__arkRpgBlobReplacementToken,
                        'media error code=' + code
                    );
                }
            }, true);
        } catch(_){ }
    };

    // 覆盖 createElement，确保后续创建的视频也被标记为内联 + 装上 src hook
    const origCreate = document.createElement.bind(document);
    document.createElement = function(tagName, options){
        const el = origCreate(tagName, options);
        if (tagName && String(tagName).toLowerCase() === 'video') {
            installSrcHook(el);
            markInline(el);
        }
        return el;
    };

    // 兜底：初始扫描已存在的 video 标签
    document.querySelectorAll('video').forEach(function(v){ installSrcHook(v); markInline(v); });
})();
