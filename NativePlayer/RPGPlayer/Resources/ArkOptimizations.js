/**
 * ArkOptimizations.js
 * 整合 ArkRPG 开源项目的核心优化（MIT 协议）
 * 参考来源：https://github.com/... (ArkRPG)
 *
 * 包含：
 * 1. viewport.js      - 视口设置 + iOS AudioContext 自动恢复
 * 2. canvas_fix.js    - 触屏坐标偏移修复（getBoundingClientRect 双重保险）
 * 3. ios_form_fix.js  - iOS WKWebView input/button 交互修复
 * 4. common_perf.js   - WebGL 性能优化（关闭 MSAA、PIXI 设置）
 * 5. common_texture_gc.js - 纹理垃圾回收（动画/场景切换后清理）
 * 6. common_input.js  - 触摸输入映射（MOUSE_COMPAT 模式）
 *
 * 注入时机：atDocumentStart（在游戏脚本之前）
 */

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════
    // 1. Viewport + AudioContext 恢复
    // ═══════════════════════════════════════════════════════════════════
    (function initViewport() {
        var meta = document.querySelector('meta[name="viewport"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'viewport';
            document.head.appendChild(meta);
        }
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';

        var style = document.createElement('style');
        style.innerHTML = 'body, html { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important; overflow: hidden !important; -webkit-touch-callout: none; -webkit-user-select: none; background-color: black !important; }';
        document.head.appendChild(style);

        function resumeAudioContext() {
            if (window.AudioContext || window.webkitAudioContext) {
                if (window._audioContexts) {
                    window._audioContexts.forEach(function (ctx) {
                        if (ctx.state === 'suspended') { ctx.resume().catch(function () {}); }
                    });
                }
                if (window.WebAudio && window.WebAudio._context && window.WebAudio._context.state === 'suspended') {
                    window.WebAudio._context.resume().catch(function () {});
                }
            }
        }
        document.addEventListener('touchstart', resumeAudioContext);
        document.addEventListener('click', resumeAudioContext);
        document.addEventListener('keydown', resumeAudioContext);
        document.addEventListener('pointerdown', resumeAudioContext);
    })();

    // ═══════════════════════════════════════════════════════════════════
    // 2. WebGL 性能优化（关闭 MSAA、PIXI 设置）
    // ═══════════════════════════════════════════════════════════════════
    (function initPerf() {
        // 关闭 WebGL MSAA，A 系列 GPU 省 fill-rate
        try {
            var origGetContext = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function (type, attrs) {
                if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
                    var patched = Object.assign({}, attrs || {});
                    patched.antialias = false;
                    patched.powerPreference = 'high-performance';
                    var ctx = origGetContext.call(this, type, patched);
                    if (ctx) return ctx;
                    return origGetContext.call(this, type, attrs);
                }
                return origGetContext.apply(this, arguments);
            };
        } catch (e) {}

        // PIXI 设置：CAN_UPLOAD_SAME_BUFFER=false（A 系列 TBDR GPU 避免 pipeline stall）
        // MIPMAP_TEXTURES=0（像素美术不需要 mipmap）
        function patchPixiSettings(p) {
            if (!p || !p.settings || p.__arkPerfPatched) return;
            try {
                var s = p.settings;
                if (typeof s.CAN_UPLOAD_SAME_BUFFER !== 'undefined') s.CAN_UPLOAD_SAME_BUFFER = false;
                if (typeof s.MIPMAP_TEXTURES !== 'undefined') s.MIPMAP_TEXTURES = 0;
                p.__arkPerfPatched = true;
            } catch (e) {}
        }
        var _pixi = window.PIXI || null;
        if (_pixi) patchPixiSettings(_pixi);
        try {
            Object.defineProperty(window, 'PIXI', {
                configurable: true, enumerable: true,
                get: function () { return _pixi; },
                set: function (v) { _pixi = v; patchPixiSettings(v); }
            });
        } catch (e) {}

        // 等待 Graphics 就绪后关闭滤镜
        var perfTicks = 0;
        var perfTimer = setInterval(function () {
            try {
                if (typeof Graphics !== 'undefined' && typeof Graphics._disableFilters !== 'undefined') {
                    Graphics._disableFilters = true;
                }
                if (typeof PIXI !== 'undefined' && PIXI.settings && PIXI.ENV && PIXI.settings.PREFER_ENV !== PIXI.ENV.WEBGL) {
                    PIXI.settings.PREFER_ENV = PIXI.ENV.WEBGL;
                }
            } catch (e) {}
            perfTicks++;
            if (perfTicks > 30) clearInterval(perfTimer);
        }, 200);
    })();

    // ═══════════════════════════════════════════════════════════════════
    // 3. Canvas 坐标修复（触屏偏移）
    // ═══════════════════════════════════════════════════════════════════
    (function initCanvasFix() {
        function getCanvas() {
            if (typeof Graphics !== 'undefined' && Graphics._canvas) return Graphics._canvas;
            return document.querySelector('canvas');
        }

        var realScalePatched = false;
        function patchGraphicsScale() {
            if (realScalePatched) return true;
            if (typeof Graphics === 'undefined') return false;
            realScalePatched = true;

            if (typeof Graphics._updateRealScale === 'function') {
                var origUpdateRealScale = Graphics._updateRealScale.bind(Graphics);
                Graphics._updateRealScale = function () {
                    if (this._canvas) {
                        var rect = this._canvas.getBoundingClientRect();
                        if (rect.width > 0 && this._width > 0) {
                            this._realScale = rect.width / this._width;
                            return;
                        }
                    }
                    origUpdateRealScale();
                };
                Graphics._updateRealScale();
            }

            // 双重保险：直接覆盖 pageToCanvasX/Y
            Graphics.pageToCanvasX = function (x) {
                if (this._canvas) {
                    var rect = this._canvas.getBoundingClientRect();
                    if (rect.width > 0 && this._width > 0) {
                        return Math.round((x - rect.left) * (this._width / rect.width));
                    }
                }
                return 0;
            };
            Graphics.pageToCanvasY = function (y) {
                if (this._canvas) {
                    var rect = this._canvas.getBoundingClientRect();
                    if (rect.height > 0 && this._height > 0) {
                        return Math.round((y - rect.top) * (this._height / rect.height));
                    }
                }
                return 0;
            };
            return true;
        }

        var pollCount = 0;
        function poll() {
            pollCount++;
            patchGraphicsScale();
            if (!realScalePatched && pollCount < 150) setTimeout(poll, 200);
        }
        poll();
        document.addEventListener('DOMContentLoaded', poll);
        window.addEventListener('load', function () { setTimeout(poll, 500); setTimeout(poll, 1500); });
    })();

    // ═══════════════════════════════════════════════════════════════════
    // 4. iOS 表单/按钮交互修复
    // ═══════════════════════════════════════════════════════════════════
    (function initFormFix() {
        // CSS：恢复表单元素 user-select
        var s = document.createElement('style');
        s.id = '__ark_form_fix';
        s.textContent = 'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]),textarea,select,button{-webkit-user-select:auto!important;user-select:auto!important;-webkit-touch-callout:default!important;touch-action:manipulation!important;}';
        document.documentElement.appendChild(s);

        // HTML button 触摸桥接（绕过 RPG Maker document 级 preventDefault）
        var buttonTouch = null;
        var BUTTON_MOVE_SLOP = 12;

        function closestButton(target) {
            if (!target || !target.closest) return null;
            return target.closest('button,input[type="button"],input[type="submit"],[role="button"]');
        }

        document.addEventListener('touchstart', function (event) {
            var button = closestButton(event.target);
            if (!button || button.disabled || !event.changedTouches.length) return;
            var touch = event.changedTouches[0];
            buttonTouch = { element: button, identifier: touch.identifier, x: touch.clientX, y: touch.clientY, moved: false };
            event.stopImmediatePropagation();
        }, true);

        document.addEventListener('touchmove', function (event) {
            if (!buttonTouch) return;
            for (var i = 0; i < event.changedTouches.length; i++) {
                var touch = event.changedTouches[i];
                if (touch.identifier !== buttonTouch.identifier) continue;
                if (Math.abs(touch.clientX - buttonTouch.x) > BUTTON_MOVE_SLOP || Math.abs(touch.clientY - buttonTouch.y) > BUTTON_MOVE_SLOP) {
                    buttonTouch.moved = true;
                }
                event.stopImmediatePropagation();
                return;
            }
        }, true);

        document.addEventListener('touchend', function (event) {
            if (!buttonTouch) return;
            for (var i = 0; i < event.changedTouches.length; i++) {
                var touch = event.changedTouches[i];
                if (touch.identifier !== buttonTouch.identifier) continue;
                var state = buttonTouch;
                buttonTouch = null;
                event.preventDefault();
                event.stopImmediatePropagation();
                if (state.moved || !state.element.isConnected || state.element.disabled) return;
                var hit = document.elementFromPoint(touch.clientX, touch.clientY);
                if (closestButton(hit) !== state.element) return;
                state.element.dispatchEvent(new MouseEvent('click', {
                    bubbles: true, cancelable: true, view: window,
                    clientX: touch.clientX, clientY: touch.clientY, button: 0
                }));
                return;
            }
        }, true);

        document.addEventListener('touchcancel', function () { buttonTouch = null; }, true);
    })();

    // ═══════════════════════════════════════════════════════════════════
    // 5. 纹理垃圾回收（动画/场景切换后清理）
    // ═══════════════════════════════════════════════════════════════════
    (function initTextureGC() {
        if (window.__arkTextureGCInstalled) return;
        window.__arkTextureGCInstalled = true;

        var config = { pixiMaxIdle: 60, pixiCheckCountMax: 30, animationTrimDelay: 1200, sceneTrimDelay: 300 };
        var activeAnimations = 0;
        var pendingTrim = 0;
        var lastTrimAt = 0;

        function getRenderer() {
            try {
                if (window.Graphics) {
                    if (Graphics._renderer) return Graphics._renderer;
                    if (Graphics.app && Graphics.app.renderer) return Graphics.app.renderer;
                    if (Graphics._app && Graphics._app.renderer) return Graphics._app.renderer;
                }
            } catch (e) {}
            return null;
        }

        function configurePixiGC() {
            try {
                if (window.PIXI && PIXI.settings) {
                    if (typeof PIXI.settings.GC_MAX_IDLE === 'number') PIXI.settings.GC_MAX_IDLE = Math.min(PIXI.settings.GC_MAX_IDLE, config.pixiMaxIdle);
                    if (typeof PIXI.settings.GC_MAX_CHECK_COUNT === 'number') PIXI.settings.GC_MAX_CHECK_COUNT = Math.min(PIXI.settings.GC_MAX_CHECK_COUNT, config.pixiCheckCountMax);
                }
                var renderer = getRenderer();
                var textureGC = renderer && renderer.textureGC;
                if (!textureGC) return false;
                if (typeof textureGC.maxIdle === 'number') textureGC.maxIdle = Math.min(textureGC.maxIdle, config.pixiMaxIdle);
                if (typeof textureGC.checkCountMax === 'number') textureGC.checkCountMax = Math.min(textureGC.checkCountMax, config.pixiCheckCountMax);
                return true;
            } catch (e) { return false; }
        }

        function runPixiGC(reason) {
            try {
                configurePixiGC();
                var renderer = getRenderer();
                var textureGC = renderer && renderer.textureGC;
                if (!textureGC || typeof textureGC.run !== 'function') return false;
                textureGC.run();
                return true;
            } catch (e) { return false; }
        }

        function destroyBitmapTexture(bitmap) {
            if (!bitmap) return false;
            try {
                if (typeof bitmap.destroy === 'function') { bitmap.destroy(); return true; }
                var baseTexture = bitmap._baseTexture || bitmap.baseTexture;
                if (baseTexture && typeof baseTexture.destroy === 'function') { baseTexture.destroy(); bitmap._baseTexture = null; return true; }
            } catch (e) {}
            return false;
        }

        function purgeImageCache(predicate, reason) {
            try {
                if (!window.ImageManager || !ImageManager._imageCache) return 0;
                var cache = ImageManager._imageCache;
                var items = cache._items;
                if (!items) return 0;
                var removed = 0;
                Object.keys(items).forEach(function (key) {
                    if (!predicate(key)) return;
                    var entry = items[key];
                    var bitmap = entry && (entry.bitmap || entry._bitmap || entry);
                    if (cache && typeof cache.remove === 'function') {
                        try { cache.remove(key); } catch (e) { delete items[key]; }
                    } else { delete items[key]; }
                    destroyBitmapTexture(bitmap);
                    removed++;
                });
                return removed;
            } catch (e) { return 0; }
        }

        function isAnimationCacheKey(key) {
            return /(^|\/)img\/animations\//i.test(key) || /(^|\/)animations\//i.test(key);
        }

        function trimAnimations(reason) {
            if (activeAnimations > 0) return;
            purgeImageCache(isAnimationCacheKey, reason);
            runPixiGC(reason);
        }

        function scheduleTrim(reason, delay, includeAnimationCache) {
            var now = Date.now();
            if (now - lastTrimAt < 250 && pendingTrim) return;
            clearTimeout(pendingTrim);
            pendingTrim = setTimeout(function () {
                pendingTrim = 0;
                lastTrimAt = Date.now();
                if (includeAnimationCache) trimAnimations(reason);
                runPixiGC(reason);
            }, delay);
        }

        function wrapMethod(owner, name, wrapper) {
            if (!owner || typeof owner[name] !== 'function' || owner[name].__arkTextureGCWrapped) return false;
            var original = owner[name];
            var wrapped = wrapper(original);
            wrapped.__arkTextureGCWrapped = true;
            owner[name] = wrapped;
            return true;
        }

        function hookSpriteAnimation() {
            if (!window.Sprite_Animation || !Sprite_Animation.prototype) return false;
            var proto = Sprite_Animation.prototype;
            wrapMethod(proto, 'setup', function (original) {
                return function () {
                    if (!this.__arkTextureGCActive) { this.__arkTextureGCActive = true; activeAnimations++; }
                    return original.apply(this, arguments);
                };
            });
            wrapMethod(proto, 'remove', function (original) {
                return function () {
                    var result = original.apply(this, arguments);
                    if (this.__arkTextureGCActive) { this.__arkTextureGCActive = false; activeAnimations = Math.max(0, activeAnimations - 1); }
                    if (activeAnimations === 0) scheduleTrim('animation-remove', config.animationTrimDelay, true);
                    return result;
                };
            });
            wrapMethod(proto, 'destroy', function (original) {
                return function () {
                    if (this.__arkTextureGCActive) { this.__arkTextureGCActive = false; activeAnimations = Math.max(0, activeAnimations - 1); }
                    var result = original.apply(this, arguments);
                    if (activeAnimations === 0) scheduleTrim('animation-destroy', config.animationTrimDelay, true);
                    return result;
                };
            });
            return true;
        }

        function hookSceneTrims() {
            if (window.Scene_Map && Scene_Map.prototype) {
                wrapMethod(Scene_Map.prototype, 'terminate', function (original) {
                    return function () { var result = original.apply(this, arguments); scheduleTrim('scene-map-terminate', config.sceneTrimDelay, true); return result; };
                });
            }
            if (window.Scene_Battle && Scene_Battle.prototype) {
                wrapMethod(Scene_Battle.prototype, 'terminate', function (original) {
                    return function () { var result = original.apply(this, arguments); activeAnimations = 0; scheduleTrim('scene-battle-terminate', config.sceneTrimDelay, true); return result; };
                });
            }
            if (window.SceneManager) {
                wrapMethod(SceneManager, 'changeScene', function (original) {
                    return function () { var result = original.apply(this, arguments); scheduleTrim('scene-change', config.sceneTrimDelay, false); return result; };
                });
            }
            return true;
        }

        window.__arkTextureGC = {
            trim: function (reason) { scheduleTrim(reason || 'manual', 0, true); },
            runPixiGC: runPixiGC,
            activeAnimations: function () { return activeAnimations; }
        };

        var gcTicks = 0;
        var gcTimer = setInterval(function () {
            configurePixiGC();
            hookSpriteAnimation();
            hookSceneTrims();
            gcTicks++;
            if (gcTicks > 80) clearInterval(gcTimer);
        }, 250);
    })();

    // ═══════════════════════════════════════════════════════════════════
    // 6. 触摸输入映射（MOUSE_COMPAT 模式）
    // ═══════════════════════════════════════════════════════════════════
    (function initInputPolyfill() {
        // 启用 MOUSE_COMPAT：触摸事件合成鼠标事件（支持长按、拖拽）
        window.__MOUSE_COMPAT__ = true;

        function getCanvas() { return document.querySelector('canvas'); }

        function isInteractiveDomTarget(target) {
            return !!(target && target.closest && target.closest(
                'button,input,textarea,select,a[href],[role="button"],[contenteditable="true"],' +
                '#arkrpg_cheat_menu_container,#cheat_menu_container'
            ));
        }

        function createMouseEvent(type, cx, cy, btn) {
            var evt = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: cx, clientY: cy, button: btn || 0 });
            Object.defineProperty(evt, 'pageX', { value: cx, writable: false });
            Object.defineProperty(evt, 'pageY', { value: cy, writable: false });
            return evt;
        }

        var touchSetupDone = false;
        function setupTouchInput() {
            if (touchSetupDone) return;
            if (typeof TouchInput === 'undefined') return;
            touchSetupDone = true;

            // 移除 rpg_core.js 原生监听器，避免冲突
            var targets = [window, document];
            targets.forEach(function (target) {
                if (typeof TouchInput._onTouchStart === 'function') target.removeEventListener('touchstart', TouchInput._onTouchStart);
                if (typeof TouchInput._onTouchMove === 'function') target.removeEventListener('touchmove', TouchInput._onTouchMove);
                if (typeof TouchInput._onTouchEnd === 'function') target.removeEventListener('touchend', TouchInput._onTouchEnd);
                if (typeof TouchInput._onMouseDown === 'function') target.removeEventListener('mousedown', TouchInput._onMouseDown);
                if (typeof TouchInput._onMouseMove === 'function') target.removeEventListener('mousemove', TouchInput._onMouseMove);
                if (typeof TouchInput._onMouseUp === 'function') target.removeEventListener('mouseup', TouchInput._onMouseUp);
            });

            // touchstart → mousemove + 延时 mousedown（支持长按）
            document.addEventListener('touchstart', function (event) {
                if (isInteractiveDomTarget(event.target)) return;
                event.stopImmediatePropagation();
                event.preventDefault();
                if (!event.touches.length) return;
                var t = event.touches[0];
                var canvas = getCanvas();
                if (!canvas) return;
                canvas.dispatchEvent(createMouseEvent('mousemove', t.clientX, t.clientY, 0));
                setTimeout(function () { canvas.dispatchEvent(createMouseEvent('mousedown', t.clientX, t.clientY, 0)); }, 30);
            }, true);

            document.addEventListener('touchmove', function (event) {
                if (isInteractiveDomTarget(event.target)) return;
                event.stopImmediatePropagation();
                event.preventDefault();
                if (!event.touches.length) return;
                var t = event.touches[0];
                var canvas = getCanvas();
                if (!canvas) return;
                canvas.dispatchEvent(createMouseEvent('mousemove', t.clientX, t.clientY, 0));
            }, true);

            document.addEventListener('touchend', function (event) {
                if (isInteractiveDomTarget(event.target)) return;
                event.stopImmediatePropagation();
                event.preventDefault();
                if (!event.changedTouches.length) return;
                var t = event.changedTouches[0];
                var canvas = getCanvas();
                if (!canvas) return;
                setTimeout(function () { canvas.dispatchEvent(createMouseEvent('mouseup', t.clientX, t.clientY, 0)); }, 30);
            }, true);

            document.addEventListener('touchcancel', function (event) {
                if (isInteractiveDomTarget(event.target)) return;
                event.stopImmediatePropagation();
                event.preventDefault();
                if (!event.changedTouches.length) return;
                var t = event.changedTouches[0];
                var canvas = getCanvas();
                if (!canvas) return;
                canvas.dispatchEvent(createMouseEvent('mouseup', t.clientX, t.clientY, 0));
            }, true);
        }

        // 轮询等待 TouchInput 就绪
        var inputTicks = 0;
        var inputTimer = setInterval(function () {
            setupTouchInput();
            inputTicks++;
            if (touchSetupDone || inputTicks > 100) clearInterval(inputTimer);
        }, 100);
    })();

    console.log('[ArkOptimizations] all modules loaded');
})();
