// Drill_LayerTiledGif: invalidate PIXI's cached CanvasPattern when a GIF frame changes.

(function() {
    'use strict';

    var retries = 0;

    function enabledPlugin(name) {
        return Array.isArray(window.$plugins) && window.$plugins.some(function(plugin) {
            return plugin && plugin.name === name && plugin.status === true;
        });
    }

    function install() {
        if (!enabledPlugin('Drill_LayerTiledGif') ||
            typeof TilingSprite === 'undefined') {
            retries++;
            if (retries <= 400) setTimeout(install, 50);
            return;
        }

        var prototype = TilingSprite.prototype;
        if (prototype.__ark_LTGCanvasPatternFix) return;

        var descriptor = Object.getOwnPropertyDescriptor(prototype, 'bitmap');
        if (!descriptor || typeof descriptor.get !== 'function' ||
            typeof descriptor.set !== 'function' || descriptor.configurable !== true) {
            console.warn('[Compat][Drill_LayerTiledGif] bitmap setter unavailable');
            return;
        }

        Object.defineProperty(prototype, 'bitmap', {
            configurable: descriptor.configurable,
            enumerable: descriptor.enumerable,
            get: descriptor.get,
            set: function(value) {
                var changed = this._bitmap !== value;
                descriptor.set.call(this, value);

                // PIXI v4 Canvas TilingSprite caches a CanvasPattern forever,
                // even after RPG Maker replaces texture.baseTexture for a new
                // Bitmap. Drill's GIF sprites are identified by their private
                // frame array, so ordinary TilingSprites remain untouched.
                if (changed && Array.isArray(this._drill_src_bitmaps)) {
                    this._canvasPattern = null;
                }
            }
        });

        Object.defineProperty(prototype, '__ark_LTGCanvasPatternFix', {
            configurable: true,
            value: true
        });
        console.log('[Compat][Drill_LayerTiledGif] Canvas pattern invalidation installed');
    }

    install();
})();
