// TouchUI iOS 键盘方向键修复
//
// 问题：
//   TouchUI.js 把所有标准选择窗口（Window_Command, Window_MenuStatus,
//   Window_SavefileList, Window_ItemList, Window_SkillList, Window_EquipSlot,
//   Window_BattleActor, Window_BattleEnemy, Window_ShopBuy）的 _swipeable 设为
//   true，并重写 Window_Selectable.update：当 _swipeable=true 时只调用
//   processHandling + processTouch + 滚动逻辑，跳过 processCursorMove。
//
//   结果：键盘 / 虚拟摇杆方向键完全失效（OK/Cancel 走 processHandling 不受影响，
//         地图走 Input.dir4 不经过窗口也不受影响）。
//
// 修复：
//   保留 TouchUI 的 swipeable 滚动行为，在 update 末尾追加原版 processCursorMove
//   调用，让键盘方向键重新工作。processCursorMove 内部自带 isCursorMovable 检查，
//   不按键时不会移动光标，与触屏 swipe 互不干扰。
//
// 二次问题（cursor 多跳）：
//   TDDP_FluidTimestep 的 while 累积器循环会让单 tick 内 SceneManager.updateScene
//   跑 N 次，每次都触发 window.update → 追加的 processCursorMove 跑 N 次。
//   compat_TDDP 已把 Input.update 去重为 1 次/tick，所以 _pressedTime 在多次
//   processCursorMove 之间保持 0，isRepeated('down') 每次都返回 true → 一次按键
//   光标跳 N 格。修复：每 tick 全 scene 只让一个窗口响应键盘（单 flag）。
//
// 三次问题（焦点串台）：
//   TouchUI 让多个 swipeable 窗口同时 active=true（如战斗的 actorCommandWindow
//   + cancelWindow，两个都为触屏 swipe 准备）。两个窗口初始 _index 都 >= 0
//   （继承自 Window_Command.initialize 的 select(0)）。一次按方向键会引发
//   "select → deselect 对方 → 对方 cursorDown 在 _index=-1 上仍触发 select(0)
//   → 反向 deselect" 的连锁，视觉上光标从主菜单跳到 cancel。
//   修复：只让 _index >= 0 的窗口响应键盘（"focused"语义），并且每 tick 全 scene
//   只允许一个窗口响应。
//
// 时序注意：
//   compat 在 atDocumentStart 注入，rpg_windows.js 加载完后 Window_Selectable 出现，
//   但此时 plugins.js（含 TouchUI）还未执行。若立即 hook prototype.update，
//   TouchUI 后续会直接覆盖 prototype.update 把 hook 抹掉。所以必须轮询等
//   update.toString() 含 '_swipeable' 字样后再 hook。
//
// Trigger: game plugins.js contains TouchUI

(function () {
    'use strict';

    var MAX_WAIT_MS = 15000;
    var INTERVAL_MS = 50;
    var elapsed = 0;

    var checkInterval = setInterval(function () {
        elapsed += INTERVAL_MS;

        if (typeof Window_Selectable === 'undefined' || typeof Utils === 'undefined') {
            if (elapsed >= MAX_WAIT_MS) clearInterval(checkInterval);
            return;
        }

        var src = (typeof Window_Selectable.prototype.update === 'function')
            ? Window_Selectable.prototype.update.toString() : '';
        if (src.indexOf('_swipeable') === -1) {
            if (elapsed >= MAX_WAIT_MS) {
                clearInterval(checkInterval);
                console.log('[Compat] TouchUI: waited ' + (MAX_WAIT_MS / 1000)
                    + 's but update never got _swipeable branch — TouchUI not loaded? give up');
            }
            return;
        }

        clearInterval(checkInterval);
        installPatch();
    }, INTERVAL_MS);

    function installPatch() {
        if (!Utils.isMobileSafari()) {
            console.log('[Compat] TouchUI: not MobileSafari, skip');
            return;
        }

        if (Window_Selectable.prototype.update.__arkTouchUiPatchApplied) {
            console.log('[Compat] TouchUI: already patched, skip');
            return;
        }

        var _touchUiUpdate = Window_Selectable.prototype.update;
        var _origProcessCursorMove = Window_Selectable.prototype.processCursorMove;

        // 每 tick 全 scene 只让一个"focused"（_index >= 0）窗口响应键盘方向键。
        // - 防 TDDP 多次 updateScene 在同一窗口上重复触发（同一窗口二次 update 时 flag 已占）
        // - 防 TouchUI 双窗口同时 active 导致焦点串台（后处理的窗口看到 flag 已占直接跳过）
        var _focusedWindowThisTick = null;

        var _origTickStart = SceneManager.tickStart;
        SceneManager.tickStart = function () {
            _focusedWindowThisTick = null;
            if (_origTickStart) _origTickStart.call(this);
        };

        // 诊断计数
        var _cursorMoveCallCount = 0;
        var _suppressedDupCount = 0;
        var _suppressedUnfocusedCount = 0;
        var _lastReportTs = 0;
        var _startTs = (typeof performance !== 'undefined' && typeof performance.now === 'function')
            ? performance.now() : Date.now();

        var newUpdate = function () {
            var wasSwipeable = this._swipeable;
            _touchUiUpdate.call(this);
            if (!wasSwipeable) return;
            if (!(this.isOpenAndActive && this.isOpenAndActive())) return;

            // TouchUI 让多个 swipeable 窗口同时 active（如战斗 actorCommand + cancel）。
            // 只有 _index >= 0 的"focused"窗口才响应键盘，避免 cursor 在 _index=-1 上
            // 触发 cursorDown 的 wrap 行为，导致焦点串台。
            if (this._index < 0) {
                _suppressedUnfocusedCount++;
                return;
            }

            // 每 tick 全 scene 只允许一个窗口响应
            if (_focusedWindowThisTick !== null) {
                _suppressedDupCount++;
                return;
            }
            _focusedWindowThisTick = this;

            var indexBefore = this.index();
            _origProcessCursorMove.call(this);
            var indexAfter = this.index();
            _cursorMoveCallCount++;

            if (indexBefore !== indexAfter) {
                var cls = (this.constructor && this.constructor.name) || '?';
                console.log('[Compat][TouchUI] cursor moved by keyboard: ' + cls
                    + ' ' + indexBefore + '→' + indexAfter);
            }

            var now = (typeof performance !== 'undefined' && typeof performance.now === 'function')
                ? performance.now() : Date.now();
            if (now - _lastReportTs > 5000) {
                _lastReportTs = now;
                var sec = Math.max(0.001, (now - _startTs) / 1000);
                console.log('[Compat][TouchUI] stats: cursorMoveCalls=' + _cursorMoveCallCount
                    + ' dupSuppressed=' + _suppressedDupCount
                    + ' unfocusedSuppressed=' + _suppressedUnfocusedCount
                    + ' over ' + sec.toFixed(1) + 's');
            }
        };
        newUpdate.__arkTouchUiPatchApplied = true;
        Window_Selectable.prototype.update = newUpdate;

        console.log('[Compat] TouchUI: hook installed after TouchUI override detected (update src len='
            + _touchUiUpdate.toString().length + ')');
    }
})();
