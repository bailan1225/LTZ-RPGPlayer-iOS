// Input Polyfills: Touch mapping and InputBridge
// 注意：此脚本在 atDocumentStart 执行，rpg_core.js 尚未加载。
// TouchInput/Input 在此时未定义，必须延迟初始化（轮询等待）。

(function() {
    console.log("[InputPolyfill] loading");

    function isInputDiagEnabled() {
        try {
            if (typeof window !== 'undefined' && window.__ARK_INPUT_DIAG__ === true) return true;
            if (typeof location !== 'undefined' && /(?:\?|&)arkInputDiag=1(?:&|$)/.test(location.search || '')) return true;
            if (typeof localStorage !== 'undefined' && localStorage.getItem('ARK_INPUT_DIAG') === '1') return true;
            return false;
        } catch (_) {}
        return false;
    }

    var inputDiagEnabled = isInputDiagEnabled();
    function inputDiag(msg) {
        if (!inputDiagEnabled) return;
        console.log('[ArkDiag][Input] ' + msg);
    }

    inputDiag('enabled; href=' + (location && location.href ? location.href : 'n/a'));

    function getCanvas() { return document.querySelector('canvas'); }

    // RPG Maker 的触控输入只应接管画布。游戏插件动态创建的 HTML
    // button/input 等元素需要保留浏览器原生触控语义，否则 preventDefault()
    // 会抑制 iOS WKWebView 生成 click。
    function isInteractiveDomTarget(target) {
        return !!(target && target.closest && target.closest(
            'button,input,textarea,select,a[href],[role="button"],[contenteditable="true"],' +
            '#arkrpg_cheat_menu_container,#cheat_menu_container'
        ));
    }

    function mapEventToCanvasXY(event) {
        var canvas = getCanvas();
        if (!canvas) return { x: 0, y: 0 };
        var rect = canvas.getBoundingClientRect();
        var clientX, clientY;
        if (event.touches && event.touches.length > 0) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else if (event.changedTouches && event.changedTouches.length > 0) {
            clientX = event.changedTouches[0].clientX;
            clientY = event.changedTouches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }
        if (typeof clientX !== 'number' || isNaN(clientX)) clientX = 0;
        if (typeof clientY !== 'number' || isNaN(clientY)) clientY = 0;
        if (!rect.width || !rect.height) return { x: 0, y: 0 };
        var dpr = window.devicePixelRatio || 1;
        var lw = (typeof Graphics !== 'undefined' && Graphics._width  > 0) ? Graphics._width  : (canvas.width  / dpr);
        var lh = (typeof Graphics !== 'undefined' && Graphics._height > 0) ? Graphics._height : (canvas.height / dpr);
        return {
            x: (clientX - rect.left) * (lw / rect.width),
            y: (clientY - rect.top)  * (lh / rect.height)
        };
    }

    // --- 延迟初始化：等待 TouchInput 定义后再绑定 ---
    var touchSetupDone = false;

    function setupTouchInput() {
        if (touchSetupDone) return;
        if (typeof TouchInput === 'undefined') return;
        touchSetupDone = true;
        console.log('[InputPolyfill] TouchInput ready, __MOUSE_COMPAT__=' + !!window.__MOUSE_COMPAT__);
        inputDiag('TouchInput detected; __MOUSE_COMPAT__=' + !!window.__MOUSE_COMPAT__);

        // 移除 rpg_core.js 注册的 TouchInput 原生事件监听器，避免冲突
        var targets = [window, document];
        targets.forEach(function(target) {
            if (typeof TouchInput._onTouchStart === 'function')
                target.removeEventListener('touchstart', TouchInput._onTouchStart);
            if (typeof TouchInput._onTouchMove === 'function')
                target.removeEventListener('touchmove', TouchInput._onTouchMove);
            if (typeof TouchInput._onTouchEnd === 'function')
                target.removeEventListener('touchend', TouchInput._onTouchEnd);
            if (typeof TouchInput._onMouseDown === 'function')
                target.removeEventListener('mousedown', TouchInput._onMouseDown);
            if (typeof TouchInput._onMouseMove === 'function')
                target.removeEventListener('mousemove', TouchInput._onMouseMove);
            if (typeof TouchInput._onMouseUp === 'function')
                target.removeEventListener('mouseup', TouchInput._onMouseUp);
        });

        // MOUSE_COMPAT: 合成鼠标事件（控制时序）
        // touchstart → mousemove + 延时 mousedown（支持长按）
        // touchmove  → mousemove
        // touchend   → 延时 mouseup
        function createMouseEvent(type, cx, cy, btn) {
            var evt = new MouseEvent(type, {
                bubbles: true, cancelable: true,
                clientX: cx, clientY: cy, button: btn || 0
            });
            Object.defineProperty(evt, 'pageX', { value: cx, writable: false });
            Object.defineProperty(evt, 'pageY', { value: cy, writable: false });
            return evt;
        }

        // Capture phase: 拦截触摸事件并合成鼠标事件（MOUSE_COMPAT 模式）
        document.addEventListener('touchstart', function(event) {
            if (!window.__MOUSE_COMPAT__) return;
            // HTML controls are handled by the browser/ios_form_fix, not the canvas bridge.
            if (isInteractiveDomTarget(event.target)) {
                return;
            }
            event.stopImmediatePropagation();
            event.preventDefault();
            if (!event.touches.length) return;
            var t = event.touches[0];
            var cx = t.clientX, cy = t.clientY;
            var canvas = getCanvas();
            if (!canvas) return;
            canvas.dispatchEvent(createMouseEvent('mousemove', cx, cy, 0));
            setTimeout(function() {
                canvas.dispatchEvent(createMouseEvent('mousedown', cx, cy, 0));
            }, 30);
        }, true);

        document.addEventListener('touchmove', function(event) {
            if (!window.__MOUSE_COMPAT__) return;
            if (isInteractiveDomTarget(event.target)) {
                return;
            }
            event.stopImmediatePropagation();
            event.preventDefault();
            if (!event.touches.length) return;
            var t = event.touches[0];
            var canvas = getCanvas();
            if (!canvas) return;
            canvas.dispatchEvent(createMouseEvent('mousemove', t.clientX, t.clientY, 0));
        }, true);

        document.addEventListener('touchend', function(event) {
            if (!window.__MOUSE_COMPAT__) return;
            if (isInteractiveDomTarget(event.target)) {
                return;
            }
            event.stopImmediatePropagation();
            event.preventDefault();
            if (!event.changedTouches.length) return;
            var t = event.changedTouches[0];
            var cx = t.clientX, cy = t.clientY;
            var canvas = getCanvas();
            if (!canvas) return;
            setTimeout(function() {
                canvas.dispatchEvent(createMouseEvent('mouseup', cx, cy, 0));
            }, 50);
        }, true);

        // Window-level touch handlers（非 MOUSE_COMPAT 模式）
        window.addEventListener('touchstart', function(event) {
            if (isInteractiveDomTarget(event.target)) return;
            event.preventDefault();
            if (window.__MOUSE_COMPAT__) return; // capture 阶段处理
            if (typeof TouchInput === 'undefined') return;
            var touches = event.touches;
            if (touches.length >= 2) {
                var pos = mapEventToCanvasXY({ clientX: touches[0].clientX, clientY: touches[0].clientY });
                TouchInput._onCancel(pos.x, pos.y);
            } else if (touches.length === 1) {
                var pos = mapEventToCanvasXY({ clientX: touches[0].clientX, clientY: touches[0].clientY });
                var gw = (typeof Graphics !== 'undefined' && Graphics._width  > 0) ? Graphics._width  : Infinity;
                var gh = (typeof Graphics !== 'undefined' && Graphics._height > 0) ? Graphics._height : Infinity;
                if (pos.x < 0 || pos.y < 0 || pos.x >= gw || pos.y >= gh) return;
                TouchInput._screenPressed = true;
                TouchInput._pressedTime = 0;
                TouchInput._onTrigger(pos.x, pos.y);
            }
        }, { passive: false });

        window.addEventListener('touchmove', function(event) {
            if (isInteractiveDomTarget(event.target)) return;
            event.preventDefault();
            if (window.__MOUSE_COMPAT__) return;
            if (typeof TouchInput === 'undefined' || !event.touches.length) return;
            var pos = mapEventToCanvasXY({ clientX: event.touches[0].clientX, clientY: event.touches[0].clientY });
            TouchInput._x = pos.x;
            TouchInput._y = pos.y;
            if (TouchInput._screenPressed) TouchInput._onMove(pos.x, pos.y);
        }, { passive: false });

        window.addEventListener('touchend', function(event) {
            if (isInteractiveDomTarget(event.target)) return;
            event.preventDefault();
            if (window.__MOUSE_COMPAT__) return;
            if (typeof TouchInput === 'undefined' || !event.changedTouches.length) return;
            var pos = mapEventToCanvasXY({ clientX: event.changedTouches[0].clientX, clientY: event.changedTouches[0].clientY });
            TouchInput._screenPressed = false;
            TouchInput._onRelease(pos.x, pos.y);
        }, { passive: false });

        window.addEventListener('mousedown', function(event) {
            if (typeof TouchInput === 'undefined') return;
            var pos = mapEventToCanvasXY(event);
            if (isNaN(pos.x) || isNaN(pos.y)) return;
            var gw = (typeof Graphics !== 'undefined' && Graphics._width  > 0) ? Graphics._width  : Infinity;
            var gh = (typeof Graphics !== 'undefined' && Graphics._height > 0) ? Graphics._height : Infinity;
            if (pos.x < 0 || pos.y < 0 || pos.x >= gw || pos.y >= gh) return;
            if (event.button === 0) {
                TouchInput._screenPressed = true;
                TouchInput._pressedTime = 0;
                TouchInput._onTrigger(pos.x, pos.y);
            } else if (event.button === 2) {
                TouchInput._onCancel(pos.x, pos.y);
            }
        });

        window.addEventListener('mousemove', function(event) {
            if (typeof TouchInput === 'undefined') return;
            var pos = mapEventToCanvasXY(event);
            if (isNaN(pos.x) || isNaN(pos.y)) return;
            TouchInput._x = pos.x;
            TouchInput._y = pos.y;
            if (TouchInput._screenPressed) TouchInput._onMove(pos.x, pos.y);
        });

        window.addEventListener('mouseup', function(event) {
            if (typeof TouchInput === 'undefined') return;
            var pos = mapEventToCanvasXY(event);
            TouchInput._screenPressed = false;
            if (event.button === 0 && !isNaN(pos.x) && !isNaN(pos.y)) {
                TouchInput._onRelease(pos.x, pos.y);
            }
        });

        var canvas = getCanvas();
        if (canvas) {
            canvas.style.touchAction = 'none';
            canvas.style.webkitUserSelect = 'none';
            canvas.style.webkitTouchCallout = 'none';
        }
    }

    // 立即尝试（如果 TouchInput 已就绪）
    setupTouchInput();

    // 轮询等待（处理异步脚本加载，最多 20s）
    if (!touchSetupDone) {
        var pollCount = 0;
        var pollInterval = setInterval(function() {
            pollCount++;
            if (inputDiagEnabled && (pollCount === 1 || pollCount % 20 === 0)) {
                inputDiag('waiting TouchInput... poll=' + pollCount + ' typeof TouchInput=' + typeof TouchInput + ' typeof Input=' + typeof Input);
            }
            setupTouchInput();
            if (touchSetupDone || pollCount > 200) {
                clearInterval(pollInterval);
                if (!touchSetupDone) console.warn('[InputPolyfill] TouchInput not found after 20s, giving up');
            }
        }, 100);
    }

    // DOMContentLoaded 和 window.load 双保险
    document.addEventListener('DOMContentLoaded', setupTouchInput);
    window.addEventListener('load', setupTouchInput);

    // --- Input Bridge (Virtual Gamepad) ---
    // 直接写入 Input._currentState / Input._previousState 实现可靠输入：
    //   press()   → _currentState[name]=true, _previousState[name]=false
    //               （_previousState=false 确保 Input.update for 循环将 _pressedTime 归零，
    //                 满足 isTriggered(===0) 条件，不依赖 Input.update wrapper 是否存在）
    //   release() → _currentState[name]=false
    // 同时维护 _held 缓冲区，供 compat 层（如 compat_koffi_modmanager.js）的
    // Input.update wrapper 使用（DKTools 双次 update / 浮点增量 _pressedTime 补偿）。
    // 同一键极短时间重复 keydown（常见于多层手势/重复注入）会导致一次点击触发两次。
    // 用时间窗去重：仅拦截"当前仍按下且 <35ms 的同键 keydown"。
    var _lastKeyDownTsByCode = {};

    window.InputBridge = {
        _held: {},

        press: function(keyName) {
            var keyCode = this._getKeyCode(keyName);
            inputDiag('InputBridge.press key=' + keyName + ' code=' + keyCode + ' inputReady=' + (typeof Input !== 'undefined'));
            if (keyCode && typeof Input !== 'undefined' && Input.keyMapper) {
                var name = Input.keyMapper[keyCode];
                if (name) {
                    this._held[name] = true;
                    // 直接写 _currentState 并强制 _previousState=false：
                    // Input.update for 循环检测到 current=true + prev=false → _pressedTime=0
                    // isTriggered(===0) 在同帧内必然命中，不依赖 wrapper 安装时机
                    if (Input._currentState) Input._currentState[name] = true;
                    if (Input._previousState) Input._previousState[name] = false;
                    // 虚拟手柄视同控制器输入（PDX_KeyboardNameInput 等插件以此标志启用
                    // Window_NameInput.processHandling，否则虚拟键盘无法触发字符确认）
                    Input._lastInputIsController = true;
                }
            }
        },
        release: function(keyName) {
            var keyCode = this._getKeyCode(keyName);
            inputDiag('InputBridge.release key=' + keyName + ' code=' + keyCode + ' inputReady=' + (typeof Input !== 'undefined'));
            if (keyCode && typeof Input !== 'undefined' && Input.keyMapper) {
                var name = Input.keyMapper[keyCode];
                if (name) {
                    delete this._held[name];
                    if (Input._currentState) Input._currentState[name] = false;
                }
            }
        },
        _getKeyCode: function(keyName) {
            if (typeof Input !== 'undefined' && Input.keyMapper) {
                for (var code in Input.keyMapper) {
                    if (Input.keyMapper[code] === keyName) return parseInt(code);
                }
            }
            switch(keyName) {
                case 'ok': return 90; // Z
                case 'escape': return 88; // X
                case 'shift': return 16;
                case 'control': return 17;
                case 'menu': return 27;
                case 'up': return 38;
                case 'down': return 40;
                case 'left': return 37;
                case 'right': return 39;
                case 'enter': return 13;
                case 'space': return 32;
                default: return 0;
            }
        },
        // 供 Swift injectEvent Tier 2 使用
        sendInput: function(type, key, code, keyCode) {
            var isDown = (type === 'keydown');
            var name = (typeof Input !== 'undefined' && Input.keyMapper) ? Input.keyMapper[keyCode] : null;

            // trace：X 键路径（keyCode=88），仅 __ARK_INPUT_DIAG__ 开启时打印
            if (keyCode === 88) {
                inputDiag('X-key type=' + type + ' name=' + name + ' InputReady=' + (typeof Input !== 'undefined'));
            }

            // _held buffer 同步 + 直接写状态
            // （name 有值即已确认 Input && Input.keyMapper 可用，无需再判）
            if (name) {
                if (isDown) {
                    this._held[name] = true;
                    if (Input._currentState) Input._currentState[name] = true;
                    if (Input._previousState) Input._previousState[name] = false;
                } else {
                    delete this._held[name];
                    if (Input._currentState) Input._currentState[name] = false;
                }
            }

            // KeyboardEvent dispatch（含去重）
            // 注：dispatch 到 document，RPG Maker 的 _onKeyDown 在 document 上监听
            if (isDown && name) {
                var now = (typeof performance !== 'undefined' && typeof performance.now === 'function')
                    ? performance.now()
                    : Date.now();
                var last = _lastKeyDownTsByCode[keyCode] || -99999;
                if (now - last < 35) {
                    inputDiag('drop dup keydown key=' + name + ' keyCode=' + keyCode + ' dt=' + (now - last).toFixed(2) + 'ms');
                    return;
                }
                _lastKeyDownTsByCode[keyCode] = now;
            }

            try {
                var event = new KeyboardEvent(type, {
                    bubbles: true, cancelable: true,
                    key: key, code: code, view: window
                });
                Object.defineProperty(event, 'keyCode', { get: function() { return keyCode; } });
                Object.defineProperty(event, 'which', { get: function() { return keyCode; } });
                Object.defineProperty(event, 'charCode', { get: function() { return keyCode; } });
                if (keyCode === 88) inputDiag('X-key dispatching KeyboardEvent to document');
                document.dispatchEvent(event);
                if (keyCode === 88) inputDiag('X-key dispatched, key=' + key);
            } catch (e) {
                console.error("[InputBridge] Error sending input:", e);
            }

            inputDiag('sendInput type=' + type + ' key=' + key + ' keyCode=' + keyCode + ' name=' + name);
        },

        // 鼠标按键模拟（部分游戏如夏日狂想曲依赖中键）
        // action: 'press' | 'release'
        // button: 0=左键, 1=中键, 2=右键
        // 命中坐标固定为画布中心。原因：触发虚拟按钮时用户通常未触摸画布，
        // TouchInput._x/y 可能停留在过期值（默认 0,0）；中键一般用作全局触发
        // （HUD 切换/菜单），位置不敏感。事件派发到 canvas，随 DOM 冒泡到
        // document/window，兼容 RPG Maker 默认 TouchInput 监听器与第三方插件。
        dispatchMouse: function(action, button) {
            var canvas = getCanvas();
            if (!canvas) {
                inputDiag('dispatchMouse: no canvas, abort');
                return;
            }
            var rect = canvas.getBoundingClientRect();
            if (!rect.width || !rect.height) {
                inputDiag('dispatchMouse: zero-size canvas, abort');
                return;
            }
            var cx = rect.left + rect.width / 2;
            var cy = rect.top + rect.height / 2;
            var type = (action === 'press') ? 'mousedown' : 'mouseup';
            var buttonsMask = (action === 'press') ? (1 << button) : 0;
            try {
                var evt = new MouseEvent(type, {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    button: button,
                    buttons: buttonsMask,
                    clientX: cx,
                    clientY: cy,
                    screenX: cx,
                    screenY: cy
                });
                canvas.dispatchEvent(evt);
            } catch (e) {
                console.error('[InputBridge] dispatchMouse error:', e);
            }
            // 右键按下时追加派发 contextmenu（物理鼠标右键的真实行为）
            // 部分游戏（如魔法少女ティアシャボン）监听 document 上的 contextmenu
            // 而非 mousedown，缺这次派发则右键菜单/关闭功能无法触发。
            if (button === 2 && action === 'press') {
                try {
                    var cmevt = new MouseEvent('contextmenu', {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                        button: 2,
                        buttons: 0,
                        clientX: cx,
                        clientY: cy,
                        screenX: cx,
                        screenY: cy
                    });
                    canvas.dispatchEvent(cmevt);
                } catch (e) {
                    console.error('[InputBridge] dispatchMouse contextmenu error:', e);
                }
            }
            inputDiag('dispatchMouse type=' + type + ' button=' + button + ' pos=(' + cx.toFixed(1) + ',' + cy.toFixed(1) + ')');
        },

        // 虚拟中键上下滑动：派发标准 wheel 事件。
        // deltaY < 0 表示向上滚，deltaY > 0 表示向下滚。
        // 事件从 canvas 冒泡至 document/window，兼容 MV/MZ TouchInput
        // 以及监听 document 或 window 的第三方插件。
        dispatchWheel: function(deltaY) {
            var canvas = getCanvas();
            if (!canvas || !isFinite(deltaY) || deltaY === 0) {
                inputDiag('dispatchWheel: invalid canvas or deltaY=' + deltaY);
                return {
                    ok: false,
                    reason: !canvas ? 'canvas unavailable' : 'invalid deltaY',
                    deltaY: Number(deltaY) || 0
                };
            }
            var rect = canvas.getBoundingClientRect();
            if (!rect.width || !rect.height) {
                inputDiag('dispatchWheel: zero-size canvas, abort');
                return {
                    ok: false,
                    reason: 'zero-size canvas',
                    deltaY: Number(deltaY)
                };
            }
            var cx = rect.left + rect.width / 2;
            var cy = rect.top + rect.height / 2;
            var options = {
                bubbles: true,
                cancelable: true,
                view: window,
                deltaX: 0,
                deltaY: Number(deltaY),
                deltaZ: 0,
                deltaMode: 0,
                clientX: cx,
                clientY: cy,
                screenX: cx,
                screenY: cy
            };
            function touchWheelState() {
                if (typeof TouchInput === 'undefined' || !TouchInput) return null;
                if (TouchInput._newState && typeof TouchInput._newState.wheelY === 'number') {
                    return { store: '_newState', value: TouchInput._newState.wheelY };
                }
                if (TouchInput._events && typeof TouchInput._events.wheelY === 'number') {
                    return { store: '_events', value: TouchInput._events.wheelY };
                }
                return null;
            }
            var before = touchWheelState();
            var evt;
            try {
                if (typeof WheelEvent === 'function') {
                    evt = new WheelEvent('wheel', options);
                } else {
                    evt = document.createEvent('Event');
                    evt.initEvent('wheel', true, true);
                    Object.keys(options).forEach(function(key) {
                        if (key === 'bubbles' || key === 'cancelable' || key === 'view') return;
                        Object.defineProperty(evt, key, { value: options[key] });
                    });
                }
                canvas.dispatchEvent(evt);
            } catch (e) {
                console.error('[InputBridge] dispatchWheel error:', e);
                return {
                    ok: false,
                    reason: 'event dispatch failed: ' + String(e),
                    deltaY: Number(deltaY)
                };
            }

            // 某些 WebKit / 游戏插件组合会使合成 wheel 事件未到达 RPG Maker
            // 注册在 document 上的监听器。仅当内部累计值完全未变化时直接调用
            // TouchInput._onWheel，避免正常冒泡路径发生双倍滚动。
            var afterDispatch = touchWheelState();
            var usedTouchInputFallback = false;
            if (typeof TouchInput !== 'undefined' &&
                TouchInput &&
                typeof TouchInput._onWheel === 'function' &&
                before &&
                afterDispatch &&
                before.store === afterDispatch.store &&
                before.value === afterDispatch.value) {
                try {
                    TouchInput._onWheel(evt);
                    usedTouchInputFallback = true;
                } catch (fallbackError) {
                    console.error('[InputBridge] TouchInput wheel fallback error:', fallbackError);
                }
            }
            var after = touchWheelState();
            var result = {
                ok: true,
                deltaY: Number(deltaY),
                target: 'canvas',
                touchInputReady: typeof TouchInput !== 'undefined',
                touchInputStore: after ? after.store : null,
                touchInputBefore: before ? before.value : null,
                touchInputAfter: after ? after.value : null,
                touchInputFallback: usedTouchInputFallback,
                defaultPrevented: !!evt.defaultPrevented
            };
            inputDiag(
                'dispatchWheel result=' + JSON.stringify(result) +
                ' pos=(' + cx.toFixed(1) + ',' + cy.toFixed(1) + ')'
            );
            return result;
        }
    };

    // patchInputUpdate（DKTools 双次 update / 浮点增量 _pressedTime 补偿）
    // 由 compat_koffi_modmanager.js 按需安装（仅 Karryn's Prison 等含 DKTools + koffi 的游戏）。
    // 不在此处安装：MZ 插件可能在安装后覆盖 Input.update，使 _held 同步链路断裂。

    // trace：capture 阶段探针，监控 X 键的 document keydown 事件
    // capture 阶段先于游戏 _onKeyDown（bubble）执行，可验证事件是否到达 document
    document.addEventListener('keydown', function(e) {
        if (e.key === 'x' || e.key === 'X' || e.keyCode === 88) {
            inputDiag('[Doc] keydown received: key=' + e.key + ' keyCode=' + e.keyCode + ' isTrusted=' + e.isTrusted);
        }
    }, true);

})();
