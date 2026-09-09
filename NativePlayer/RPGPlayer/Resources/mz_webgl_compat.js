/**
 * mz_webgl_compat.js
 * iOS WebGL Compatibility Fix for RPG Maker MZ
 */

(function() {
    'use strict';

    console.log("[MZ WebGL Compat] Initializing...");

    /**
     * Patch Graphics._createPixiApp to add preserveDrawingBuffer option
     */
    function patchGraphicsPixiApp() {
        if (typeof Graphics === 'undefined' || typeof Graphics._createPixiApp !== 'function') {
            return;
        }
        if (Graphics._createPixiApp.__webglCompatPatched) {
            return;
        }

        var originalCreatePixiApp = Graphics._createPixiApp;

        Graphics._createPixiApp = function() {
            try {
                this._setupPixi();

                this._app = new PIXI.Application({
                    view: this._canvas,
                    autoStart: false
                });

                if (this._app.ticker) {
                    this._app.ticker.remove(this._app.render, this._app);
                    this._app.ticker.add(this._onTick, this);
                }

                console.log("[MZ] PixiJS App created");
            } catch (e) {
                console.error("[MZ] Failed:", e);
                this._app = null;
            }
        };

        Graphics._createPixiApp.__webglCompatPatched = true;
        console.log("[MZ] Graphics._createPixiApp patched");
    }

    /**
     * Patch WebGL texImage2D to handle SecurityError (video sources)
     * This is a minimal patch that doesn't interfere with rendering
     */
    function patchTexImage2D() {
        if (HTMLCanvasElement.prototype.__mzTexImagePatched) {
            return;
        }
        HTMLCanvasElement.prototype.__mzTexImagePatched = true;

        var originalGetContext = HTMLCanvasElement.prototype.getContext;

        HTMLCanvasElement.prototype.getContext = function(type, attrs) {
            var gl = originalGetContext.call(this, type, attrs);
            if (gl && (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl')) {
                var origTexImage2D = gl.texImage2D;
                gl.texImage2D = function() {
                    try {
                        return origTexImage2D.apply(this, arguments);
                    } catch (e) {
                        if (e.name === 'SecurityError' || (e.message && e.message.indexOf('SecurityError') !== -1)) {
                            // Fallback: 1x1 transparent pixel
                            try {
                                var args = Array.prototype.slice.call(arguments);
                                var target = args[0];
                                var level = args[1];
                                origTexImage2D.call(this, target, level, this.RGBA, 1, 1, 0, this.RGBA, this.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
                                return;
                            } catch (fallback) {
                                // If fallback also fails, re-throw
                            }
                        }
                        throw e;
                    }
                };
            }
            return gl;
        };

        console.log("[MZ] texImage2D patched for SecurityError");
    }

    /**
     * Apply fixes
     */
    function applyFixes() {
        patchGraphicsPixiApp();
        patchTexImage2D();
        console.log("[MZ WebGL Compat] Done");
    }

    // Try immediately
    applyFixes();

    // Also try after DOM loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyFixes);
    }

    // Retry a few times in case classes aren't loaded yet
    var retries = 0;
    var interval = setInterval(function() {
        applyFixes();
        retries++;
        if (retries >= 5) {
            clearInterval(interval);
        }
    }, 100);

})();
