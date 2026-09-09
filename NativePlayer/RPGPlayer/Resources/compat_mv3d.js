// Pointer Lock API polyfill（mv3d / mz3d 通用）
// 问题：mv3d.js（MV）与 mz3d.js（MZ）在 Scene_Map.stop / Scene_Map.update
//       等钩子中调用 document.exitPointerLock()、document.pointerLockElement、
//       及 HTMLElement.prototype.requestPointerLock()。
//       iOS WKWebView 不实现 Pointer Lock API，上述调用均抛出
//       TypeError: document.exitPointerLock is not a function，
//       导致 Scene_Map 过渡时整条场景切换链崩溃，游戏黑屏无法进行。
//
// 修复：在 document / HTMLElement.prototype 上注入空操作 (no-op) stub，
//       并将 pointerLockElement 固定为 null（iOS 上永远不会锁定指针）。
//       mv3d/mz3d 内部的 _relockPointer 逻辑依赖 pointerLockElement 判断
//       是否需要重新锁定，返回 null 即可让其静默放弃重锁请求。
// Trigger: game plugins.js contains mv3d or mz3d

(function patchPointerLock() {
    'use strict';

    // document.exitPointerLock
    if (typeof document.exitPointerLock !== 'function') {
        document.exitPointerLock = function () {};
    }

    // document.pointerLockElement（只读 getter stub）
    if (!('pointerLockElement' in document)) {
        Object.defineProperty(document, 'pointerLockElement', {
            get: function () { return null; },
            configurable: true
        });
    }

    // Element.prototype.requestPointerLock（canvas.requestPointerLock()）
    if (typeof HTMLElement !== 'undefined' &&
        typeof HTMLElement.prototype.requestPointerLock !== 'function') {
        HTMLElement.prototype.requestPointerLock = function () {};
    }

    console.log('[mv3d] Pointer Lock API polyfilled (no-op stubs for iOS WKWebView)');
})();
