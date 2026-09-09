// Core Polyfills: Process, Environment, PIXI Safety

// --- Utils.isNwjs 同步拦截器（必须在 IIFE 外、document start 最早执行）---
// 问题根源：
//   common_fs.js 安装了 window.require（模块兼容性需要）且设置了 window.process，
//   导致 RPG Maker MV Utils.isNwjs() = typeof require==='function' && typeof process==='object' = true。
//   游戏因此走 NW.js 分支，调用 require('nw.gui')，返回的空对象上 .Window.get() 报 TypeError。
//
// 修复策略：
//   用 Object.defineProperty 拦截 window.Utils 的赋值（rpg_core.js 在 document 加载时同步执行），
//   在 Utils 刚被定义的那一刻立即覆盖 isNwjs，无需轮询，无竞争条件。
//
// 注意：var 声明会触发属性赋值（setter），即使 rpg_core.js 用 var Utils = function(){...} 也适用。
(function() {
    if (typeof window.Utils !== 'undefined') {
        // 极少数情况：Utils 已先于此脚本定义，直接 patch
        if (!window.Utils.__ark_isNwjsPatch) {
            window.Utils.isNwjs = function() { return false; };
            window.Utils.__ark_isNwjsPatch = true;
            console.log('[Polyfill] Utils.isNwjs patched immediately (already defined)');
        }
        return;
    }
    var _Utils;
    Object.defineProperty(window, 'Utils', {
        configurable: true,
        enumerable: true,
        get: function() { return _Utils; },
        set: function(val) {
            _Utils = val;
            if (val && !val.__ark_isNwjsPatch) {
                val.isNwjs = function() { return false; };
                val.__ark_isNwjsPatch = true;
                console.log('[Polyfill] Utils.isNwjs patched synchronously via property interceptor');
            }
        }
    });
    console.log('[Polyfill] Utils.isNwjs interceptor installed');
})();

(function() {
    console.log("Initializing RPGMV Emulator Core Polyfills...");

    // --- PIXI WebGL Renderer 崩溃安全修复 ---
    // 问题：PIXI.Renderer / PIXI.WebGLRenderer 创建失败被 try/catch 静默吞掉，
    //       导致 Graphics._renderer = null，游戏进入死循环渲染失败（黑屏）
    // 修复：拦截 PIXI 渲染器构造函数，失败时回退到 CanvasRenderer
    (function patchPIXIRenderer() {
        function tryPatch() {
            if (typeof PIXI === 'undefined') {
                setTimeout(tryPatch, 100);
                return;
            }
            if (PIXI.__ark_rendererPatched) return;
            PIXI.__ark_rendererPatched = true;

            // PIXI v5+ uses PIXI.Renderer
            if (typeof PIXI.Renderer !== 'undefined' && !PIXI.Renderer.__ark_patched) {
                var OrigRenderer = PIXI.Renderer;
                PIXI.Renderer = function(options) {
                    try {
                        var inst = new OrigRenderer(options);
                        console.log('[PIXIPatch] PIXI.Renderer created OK');
                        return inst;
                    } catch (e) {
                        console.error('[PIXIPatch] PIXI.Renderer failed:', e.message, '→ falling back to CanvasRenderer');
                        if (typeof PIXI.CanvasRenderer !== 'undefined') {
                            try { return new PIXI.CanvasRenderer(options); } catch (e2) { console.error('[PIXIPatch] CanvasRenderer also failed:', e2); }
                        }
                        // 返回安全空对象，阻止 _renderer=null 死循环
                        return {
                            type: -1,
                            view: document.createElement('canvas'),
                            render: function() {},
                            resize: function() {},
                            destroy: function() {},
                            plugins: {},
                            gl: null
                        };
                    }
                };
                Object.keys(OrigRenderer).forEach(function(k) { PIXI.Renderer[k] = OrigRenderer[k]; });
                PIXI.Renderer.prototype = OrigRenderer.prototype;
                PIXI.Renderer.__ark_patched = true;
                console.log('[PIXIPatch] PIXI.Renderer patched with fallback');
            }

            // PIXI v4 uses PIXI.WebGLRenderer
            if (typeof PIXI.WebGLRenderer !== 'undefined' && !PIXI.WebGLRenderer.__ark_patched) {
                var OrigWebGLRenderer = PIXI.WebGLRenderer;
                PIXI.WebGLRenderer = function(width, height, options) {
                    try {
                        return new OrigWebGLRenderer(width, height, options);
                    } catch (e) {
                        console.error('[PIXIPatch] PIXI.WebGLRenderer failed:', e.message, '→ CanvasRenderer');
                        if (typeof PIXI.CanvasRenderer !== 'undefined') {
                            try { return new PIXI.CanvasRenderer(width, height, options); } catch (e2) {}
                        }
                        return {
                            type: -1,
                            view: document.createElement('canvas'),
                            render: function() {},
                            resize: function() {},
                            destroy: function() {},
                            gl: null
                        };
                    }
                };
                Object.keys(OrigWebGLRenderer).forEach(function(k) { PIXI.WebGLRenderer[k] = OrigWebGLRenderer[k]; });
                PIXI.WebGLRenderer.prototype = OrigWebGLRenderer.prototype;
                PIXI.WebGLRenderer.__ark_patched = true;
                console.log('[PIXIPatch] PIXI.WebGLRenderer patched with fallback');
            }
        }
        tryPatch();
        document.addEventListener('DOMContentLoaded', tryPatch);
    })();

    // --- ModManager 早期 Stub ---
    // main.js 在 window.onload 里调用 ModManager.getModsList().then(...)
    // 若 modManager.js 尚未加载完成，此调用会 throw。
    // Stub 让 promise 链正常建立，真实 ModManager 加载后会覆盖此 stub。
    if (typeof window.ModManager === 'undefined') {
        window.ModManager = {
            _isStub: true,
            getModsList: function() {
                console.log('[ModManagerStub] getModsList called');
                return Promise.resolve([]);
            },
            loadMods: function() {
                return Promise.resolve();
            },
            setParameters: function() {}
        };
        console.log('[ModManagerStub] Early stub installed');
    }

    // --- StorageManager.isLocalMode 修复 ---
    // 注意：Utils.isNwjs 已由文件顶部的 Object.defineProperty 拦截器同步 patch（无竞争条件）。
    // 此处仅修复 StorageManager.isLocalMode，轮询等待 StorageManager 定义后执行。
    (function patchStorageManagerLocalMode() {
        function applyPatch() {
            if (typeof StorageManager === 'undefined') return false;
            if (StorageManager.__ark_localModePatch) return true;
            StorageManager.isLocalMode = function() { return false; };
            StorageManager.__ark_localModePatch = true;
            console.log('[StorageFix] StorageManager.isLocalMode patched → always false');
            return true;
        }
        if (!applyPatch()) {
            var attempts = 0;
            var iv = setInterval(function() {
                attempts++;
                if (applyPatch() || attempts > 300) clearInterval(iv);
            }, 50);
        }
    })();

    // --- PIXI.DisplayObject.prototype.removeStageReference 缺失补丁 ---
    // 背景：pixi.js v3 的 removeStageReference 仅定义在 DisplayObjectContainer.prototype，
    //       基类 DisplayObject 只有 setStageReference，没有对应的 remove 版本。
    //       当场景树中存在纯 DisplayObject（非 Container）子节点时，
    //       递归调用 removeStageReference 会抛出 "not a function" 错误。
    //
    // 注意：此 polyfill 仅针对基类 PIXI.DisplayObject.prototype，
    //       不覆写 DisplayObjectContainer.prototype.removeStageReference（那是 7f6b2a1 已明确删除的覆写）。
    //       BaseSchemeHandler.patchPixiJS() 在源码层的字符串替换形成双重防护（已修复 CRLF 匹配问题）。
    (function installPixiDisplayObjectRemoveStageRefPolyfill() {
        function apply() {
            if (typeof PIXI === 'undefined' || !PIXI.DisplayObject) return false;
            // 只在基类缺少该方法时补充，不影响 DisplayObjectContainer 原型链上已有的实现
            if (!PIXI.DisplayObject.prototype.removeStageReference) {
                PIXI.DisplayObject.prototype.removeStageReference = function() {
                    this.stage = null;
                };
                console.log('[PixiFix] PIXI.DisplayObject.prototype.removeStageReference polyfilled');
            }
            return true;
        }
        if (!apply()) {
            var _pixiRsrAttempts = 0;
            var _pixiRsrIv = setInterval(function() {
                _pixiRsrAttempts++;
                if (apply() || _pixiRsrAttempts > 300) clearInterval(_pixiRsrIv);
            }, 50);
        }
    })();

    // --- Process Mock (Node.js compatibility) ---
    if (typeof window.process === 'undefined') {
        window.process = {
            // 插件用 process.title !== 'browser' 判定 Node 环境（如 LN_FilmicFilter），
            // 缺省会让 WebView 被误判为 Node 而走 fs 分支崩溃
            title: 'browser',
            platform: 'darwin', // 伪装成 macOS
            versions: {},
            mainModule: { filename: 'index.html' },
            argv: ['index.html', ''],
            execPath: 'index.html',
            env: {
                NODE_ENV: 'production',
                STEAM_DECK: '0'
            },
            browser: true,
            arch: 'arm64',
            cwd: function() { return '.'; },
            _events: {},
            on: function(event, listener) {
                if (typeof listener !== 'function') return;
                this._events[event] = this._events[event] || [];
                this._events[event].push(listener);
            },
            addListener: function(event, listener) { this.on(event, listener); },
            once: function(event, listener) {
                var self = this;
                if (typeof listener !== 'function') return;
                function wrapper() {
                    try { listener.apply(null, arguments); } catch (e) { console.error(e); }
                    self.removeListener(event, wrapper);
                }
                this.on(event, wrapper);
            },
            removeListener: function(event, listener) {
                var list = this._events[event];
                if (!list) return;
                var idx = list.indexOf(listener);
                if (idx !== -1) list.splice(idx, 1);
            },
            off: function(event, listener) { this.removeListener(event, listener); },
            removeAllListeners: function(event) {
                if (event) this._events[event] = [];
                else this._events = {};
            },
            emit: function(event) {
                var list = this._events[event];
                if (!list || list.length === 0) return false;
                var args = Array.prototype.slice.call(arguments, 1);
                list.slice().forEach(function(fn) {
                    try { fn.apply(null, args); } catch (e) { console.error('[Polyfill] process event handler error', e); }
                });
                return true;
            },
            exit: function(code) { console.warn('[Polyfill] process.exit(' + (code || 0) + ') suppressed in WebView'); },
            nextTick: function(cb) { if (typeof cb === 'function') return setTimeout(cb, 0); },
            hrtime: function(prev) {
                var nowMs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
                var seconds = Math.floor(nowMs / 1000);
                var nanoseconds = Math.floor((nowMs - seconds * 1000) * 1e6);
                if (prev && Array.isArray(prev) && prev.length === 2) {
                    var sec = seconds - prev[0];
                    var nsec = nanoseconds - prev[1];
                    if (nsec < 0) {
                        sec -= 1;
                        nsec += 1e9;
                    }
                    return [sec, nsec];
                }
                return [seconds, nanoseconds];
            }
        };
    }

    // --- Game_Interpreter.command355 (Script Command) Safety Wrapper ---
    // Fix for: eval code@ error when executing Script commands
    // This wrapper provides better error diagnostics for debugging
    (function() {
        var retries = 0;
        function patchCommand355() {
            if (typeof Game_Interpreter === 'undefined' || !Game_Interpreter.prototype.command355) {
                retries++;
                if (retries > 50) {
                    console.warn('[ScriptSafety] Game_Interpreter.command355 not found after 5s, giving up');
                    return;
                }
                setTimeout(patchCommand355, 100);
                return;
            }

            // Don't patch twice
            if (Game_Interpreter.prototype.command355.__ark_patched) return;

            var origCommand355 = Game_Interpreter.prototype.command355;
            Game_Interpreter.prototype.command355 = function() {
                var args = arguments;
                var command = this.currentCommand();
                if (command && command.code === 355) {
                    var script = command.parameters[0];
                    try {
                        return origCommand355.apply(this, args);
                    } catch (e) {
                        console.error('[ArkRPG] Script command error:');
                        console.error('  Error:', e.message || e);
                        console.error('  Script content:', JSON.stringify(script));
                        console.error('  Event ID:', this._eventId);
                        console.error('  Command index:', this._index);
                        if (e.stack) {
                            console.error('  Stack:', e.stack.split('\n').slice(0, 5).join('\n'));
                        }
                        throw e;
                    }
                }
                return origCommand355.apply(this, args);
            };
            Game_Interpreter.prototype.command355.__ark_patched = true;
            console.log('[ScriptSafety] command355 safety wrapper applied');
        }

        // Try immediately
        patchCommand355();
        // Also retry after DOM loads
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', patchCommand355);
        }
    })();
})();
