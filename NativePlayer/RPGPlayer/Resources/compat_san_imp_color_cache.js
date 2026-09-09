// CanvasRenderingContext2D.getImageData 安全修复
// 问题：SAN_Imp_ColorCache.js 等插件通过 Bitmap.getPixel()/getAlphaPixel() 调用
//       CanvasRenderingContext2D.getImageData()，当 canvas 因跨域图片（rpgmv:// 自定义
//       scheme 加载的加密素材）而被「污染」（tainted）时，getImageData 抛出
//       SecurityError，导致整个 Window 初始化链崩溃，游戏黑屏。
// 修复：拦截 getImageData，捕获任何异常后返回与请求尺寸匹配的
//       全透明/黑色 ImageData，确保调用方的缓存逻辑仍能正常工作。
// Trigger: game plugins.js contains SAN_Imp_ColorCache / PicturePointColor_EX_v2 / PicturePointColor / MOG_PictureEffects / GraphicalDesignMode

(function patchGetImageData() {
    if (typeof CanvasRenderingContext2D === 'undefined') return;
    if (CanvasRenderingContext2D.prototype.getImageData.__ark_patched) return;
    var _origGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function(sx, sy, sw, sh) {
        try {
            return _origGetImageData.call(this, sx, sy, sw, sh);
        } catch (e) {
            try {
                var w = Math.max(Math.ceil(sw) || 1, 1);
                var h = Math.max(Math.ceil(sh) || 1, 1);
                var tmp = document.createElement('canvas');
                tmp.width = w;
                tmp.height = h;
                return _origGetImageData.call(tmp.getContext('2d'), 0, 0, w, h);
            } catch (e2) {
                return { data: new Uint8ClampedArray(4), width: 1, height: 1 };
            }
        }
    };
    CanvasRenderingContext2D.prototype.getImageData.__ark_patched = true;
    console.log('[BitmapSafety] getImageData patched with taint-safe fallback');
})();
