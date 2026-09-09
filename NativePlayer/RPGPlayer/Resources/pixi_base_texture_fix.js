/**
 * pixi_base_texture_fix.js
 *
 * 修复 Pixi.js v4 BaseTexture.prototype.update 在 source=null 时崩溃的问题。
 *
 * ── 根本原因 ──────────────────────────────────────────────────────────
 *   BaseTexture.prototype.destroy() 会把 this.source 设为 null。
 *   若 destroy() 之后某处仍触发 update()（如异步事件回调），则：
 *
 *       this.realWidth = this.source.naturalWidth  // TypeError: null is not an object
 *
 *   复现游戏：MELFIAS －Azure and Crimson Verge（pixi.js v4.5.4）
 *
 * ── 修复 ──────────────────────────────────────────────────────────────
 *   在 PIXI.BaseTexture.prototype.update 前置 null guard：
 *   若 this.source 为 null（已销毁），直接 return，不执行原逻辑。
 *
 * 注入时机：atDocumentEnd（Phase 2，pixi.js 作为同步 <script> 在 DOMContentLoaded 前已执行）
 */
(function () {
    'use strict';

    function patchPixiBaseTexture() {
        if (typeof PIXI === 'undefined' || !PIXI.BaseTexture || !PIXI.BaseTexture.prototype) {
            return false;
        }

        // 仅修补 Pixi v4：v4 的 source 直接挂在 BaseTexture 上（HTMLImageElement）。
        // v5 移除了 this.source，改为 this.resource.source；若在 v5 应用此补丁，
        // !this.source 恒为 true（undefined），导致所有 update() 被跳过，纹理无法加载。
        var majorVersion = parseInt((PIXI.VERSION || '0').split('.')[0], 10);
        if (majorVersion !== 4) {
            console.log('[PixiFix] Skipping patch — Pixi v' + (PIXI.VERSION || '?') + ' is not v4');
            return true;
        }

        var proto = PIXI.BaseTexture.prototype;

        // 避免重复 patch
        if (proto._arkUpdatePatched) return true;
        proto._arkUpdatePatched = true;

        var orig = proto.update;
        proto.update = function () {
            // source 为 null 说明 BaseTexture 已被 destroy()，直接跳过
            if (!this.source) return;
            return orig.apply(this, arguments);
        };

        console.log('[PixiFix] BaseTexture.prototype.update null-guard applied (pixi ' +
            (PIXI.VERSION || '?') + ')');
        return true;
    }

    if (!patchPixiBaseTexture()) {
        // pixi.js 尚未就绪（极少见），轮询等待
        var retries = 0;
        var timer = setInterval(function () {
            if (patchPixiBaseTexture() || ++retries > 50) {
                clearInterval(timer);
            }
        }, 100);
    }
}());
