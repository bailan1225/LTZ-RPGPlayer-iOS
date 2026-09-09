// AbortError 抑制器
// 部分游戏（如 Karryn's Prison DLC）的 mod-manager 注册了全局 error/unhandledrejection 处理器，
// 将所有未捕获错误视为 fatal error 并弹窗。当 app 进入后台时，WKWebView 中断 pending 异步操作
// 触发 AbortError（"The operation was aborted"），被误当作致命错误。
// 此处注册 capture 阶段处理器（先于 mod-manager 的 handler），拦截 AbortError 阻止传播。
// Trigger: game plugins.js contains mod-manager or koffi

(function() {
    function isAbortError(err) {
        if (!err) return false;
        if (err instanceof DOMException && err.name === 'AbortError') return true;
        if (err instanceof Error && err.name === 'AbortError') return true;
        var msg = err.message || String(err);
        return msg.indexOf('operation was aborted') !== -1 ||
               msg.indexOf('aborted') !== -1;
    }
    function suppressAbortError(event) {
        var err = event.reason || event.error;
        if (isAbortError(err)) {
            event.stopImmediatePropagation();
            event.preventDefault();
        }
    }
    window.addEventListener('error', suppressAbortError, true);
    window.addEventListener('unhandledrejection', suppressAbortError, true);
})();

// patchInputUpdate — DKTools 双次 update / 浮点增量 _pressedTime 补偿
// 触发条件：游戏含 mod-manager / koffi / ModManager 插件（即 Karryn's Prison 系列）
// 问题：
//   Karryn's Prison DLC 的 Input.update 使用 _deltaTime 浮点增量（替代原版 _pressedTime++），
//   且 DKTools 每帧调用 Input.update 2 次以上，导致 _pressedTime 被增量推离 0，
//   isTriggered(===0) 永远不满足，虚拟键盘按键无响应。
// 修复：
//   包装 Input.update，在检测到新虚拟按键按下且每帧多次调用时，
//   调整 _pressedTime 使 isTriggered 在最后一次调用后精确命中。
(function installKarrynInputPatch() {
    var attempts = 0;
    var timer = setInterval(function() {
        attempts++;
        if (typeof window.Input === 'undefined') {
            if (attempts >= 100) clearInterval(timer);
            return;
        }
        clearInterval(timer);
        console.log('[Compat][Karryn] Input ready, installing DKTools _pressedTime patch');

        var origUpdate = Input.update;
        var _updateCallsThisFrame = 0;
        var _prevFrameCalls = 1;

        // DLC 版本检测：DLC 版 Input.update 使用 _deltaTime 浮点增量
        var _isFloatIncrement = false;
        try {
            _isFloatIncrement = typeof origUpdate === 'function' &&
                origUpdate.toString().indexOf('_deltaTime') !== -1;
        } catch(e) {}
        var _arkNeedPtZero = false;
        var _arkPtZeroDone = false;

        requestAnimationFrame(function loop() {
            _prevFrameCalls = _updateCallsThisFrame;
            _updateCallsThisFrame = 0;
            _arkNeedPtZero = false;
            _arkPtZeroDone = false;
            requestAnimationFrame(loop);
        });

        Input.update = function() {
            _updateCallsThisFrame++;

            // 同步合并 _held 到 _currentState（防御：如果直写因某原因未生效时的补充保障）
            var held = window.InputBridge ? InputBridge._held : {};
            var virt = this._arkVirt || {};

            // 检测新虚拟按键按下（held 中有，_previousState 中没有）
            var hadNewVirtualPress = false;
            for (var name in held) {
                if (!this._previousState[name]) hadNewVirtualPress = true;
            }

            // 清除不再按住的虚拟按键
            for (var name in virt) {
                if (!held[name]) {
                    this._currentState[name] = false;
                    delete virt[name];
                }
            }
            // 设置当前按住的虚拟按键
            for (var name in held) {
                this._currentState[name] = true;
                virt[name] = true;
            }
            this._arkVirt = virt;

            origUpdate.call(this);

            // 修复多调用场景：DKTools 每帧调用 Input.update >=2 次，
            // _pressedTime 在第一次调用后被增量推离 0，导致 isTriggered(===0) 失败
            if (hadNewVirtualPress
                && _updateCallsThisFrame === 1
                && this._pressedTime === 0
                && this._latestButton) {
                if (_isFloatIncrement && _prevFrameCalls > 1) {
                    // DLC 浮点增量：改用哨兵值方案
                    // call#1 设 pt=-1 阻止中间触发，最后一次调用时强制 pt=0
                    _arkNeedPtZero = true;
                    _arkPtZeroDone = false;
                    this._pressedTime = -1;
                } else {
                    // 标准整数增量：pt=-(N-1) 后经 N-1 次自增恰好回到 0
                    this._pressedTime = -(_prevFrameCalls - 1);
                }
            }

            // DLC 浮点增量：最后一次调用时强制 pt=0（仅一次）
            if (_arkNeedPtZero && !_arkPtZeroDone
                && _updateCallsThisFrame >= _prevFrameCalls) {
                this._pressedTime = 0;
                _arkPtZeroDone = true;
            }
        };
    }, 200);
})();
