// YEP_FpsSynchOption iOS 输入修复
// 问题：YEP_FpsSynchOption 覆写 SceneManager.updateMain，在 updateMainNoFpsSynch()
//       中调用了 updateInputData()。而 rpg_managers.js 的 SceneManager.update() 在
//       isMobileSafari()=true 时也会在 updateMain() 之前调用 updateInputData()。
//       结果：每帧 Input.update() 被调用两次，_pressedTime 被推离 0，
//       Input.isTriggered()（===0）永远不满足。
//
// 修复：Hook SceneManager.updateInputData 而非 Input.update，在帧边界内去重。
//       这样不干扰其他 compat 层（如 compat_koffi_modmanager）对 Input.update 的
//       包装——DKTools 等插件直接调用 Input.update 时仍可被 koffi 层正确处理。
// Trigger: game plugins.js contains YEP_FpsSynchOption

(function () {
    'use strict';

    var MAX_WAIT_MS = 10000;
    var INTERVAL_MS = 50;
    var elapsed = 0;

    var checkInterval = setInterval(function () {
        elapsed += INTERVAL_MS;

        if (typeof SceneManager === 'undefined' || typeof Utils === 'undefined') {
            if (elapsed >= MAX_WAIT_MS) clearInterval(checkInterval);
            return;
        }

        clearInterval(checkInterval);

        if (!Utils.isMobileSafari()) return;

        if (SceneManager.updateInputData && SceneManager.updateInputData.__arkFpsPatchApplied) return;

        var _updatedThisTick = false;

        var _origTickStart = SceneManager.tickStart;
        SceneManager.tickStart = function () {
            _updatedThisTick = false;
            if (_origTickStart) _origTickStart.call(this);
        };

        var _origUpdateInputData = SceneManager.updateInputData;
        SceneManager.updateInputData = function () {
            if (_updatedThisTick) return;
            _updatedThisTick = true;
            _origUpdateInputData.call(this);
        };
        SceneManager.updateInputData.__arkFpsPatchApplied = true;

        console.log('[Compat] YEP_FpsSynchOption: iOS double updateInputData() dedup patch applied');
    }, INTERVAL_MS);

})();
