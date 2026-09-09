// SRD_PreloaderCore compat patch
//
// Root cause fix:
//   SRD_PreloaderCore initializes `_.isNwjs = Utils.isNwjs()` at plugin parse time.
//   Because common_core.js patches Utils.isNwjs() → false (to prevent broken
//   NW.js storage paths), `_.isNwjs` is false. When the preloader tries to build
//   the "all" image list via preloadImageFolder('enemies', 'all'), it falls into
//   the makeAllError() branch instead of setImageAll(), which calls:
//       SceneManager.stop()         ← game loop permanently halted
//       Graphics.printError(...)    ← error div hidden behind PIXI canvas
//       AudioManager.stopAll()
//   Result: black screen with no visible error.
//
// Fix:
//   Patch SRD.PreloaderCore.isNwjs = true on 'load' event (before SceneManager
//   starts). Since _ === SRD.PreloaderCore, preloadImageFolder('enemies','all')
//   will then call setImageAll() which uses fs.readdirSync(), implemented via
//   the __NATIVE_READDIR__ native bridge — correctly enumerating the game's
//   img/enemies/ directory.
//
// Trigger: game plugins.js contains SRD_PreloaderCore

(function() {
    // ── IMMEDIATE: catch errors that happen during window.onload / plugin init
    window.addEventListener('error', function(e) {
        console.error('[Compat][SRD] window.error: ' + e.message +
            ' (' + (e.filename || '?') + ':' + (e.lineno || '?') + ')');
    });
    window.addEventListener('unhandledrejection', function(e) {
        var reason = e.reason;
        var msg = reason ? (reason.message || String(reason)) : 'unknown';
        console.error('[Compat][SRD] unhandledrejection: ' + msg +
            (reason && reason.stack ? '\n' + reason.stack : ''));
    });

    // ── Helper: wrap readdirSync to log results for SRD paths ──────────────
    function installReaddirLogger() {
        try {
            var origRequire = window.__origRequire || window.require;
            var mockFS = origRequire && origRequire('fs');
            if (!mockFS || typeof mockFS.readdirSync !== 'function') return;
            var _orig = mockFS.readdirSync.bind(mockFS);
            mockFS.readdirSync = function(p) {
                var result = _orig(p);
                console.log('[Compat][SRD] readdirSync("' + p + '") → ' + result.length + ' files' +
                    (result.length > 0 ? ' [0]=' + result[0] : ''));
                return result;
            };
        } catch(e) {
            console.warn('[Compat][SRD] readdirSync logger install failed:', e);
        }
    }

    window.addEventListener('load', function patchSRDPreloader() {
        if (!window.SRD || !SRD.PreloaderCore) {
            console.warn('[Compat][SRD_PreloaderCore] SRD.PreloaderCore not found, skipping patch');
            return;
        }

        // ── 1. Intercept makeError to surface hidden errors in console ──────
        var _origMakeError = SRD.PreloaderCore.makeError;
        SRD.PreloaderCore.makeError = function(title, text) {
            console.error('[Compat][SRD_PreloaderCore] makeError intercepted! title="' + title + '" text="' + text + '"');
            // Still call original — if it black-screens, at least we logged it
            if (typeof _origMakeError === 'function') _origMakeError.call(this, title, text);
        };

        // ── 2. Install readdirSync logger before isNwjs patch ───────────────
        installReaddirLogger();

        // ── 3. Wrap setImageAll to catch any thrown exceptions ──────────────
        var _origSetImageAll = SRD.PreloaderCore.setImageAll;
        SRD.PreloaderCore.setImageAll = function(folder) {
            try {
                console.log('[Compat][SRD] setImageAll("' + folder + '") start');
                if (typeof _origSetImageAll === 'function') _origSetImageAll.call(this, folder);
                var count = (this.imagePreloads && this.imagePreloads[folder]) ? this.imagePreloads[folder].length : 0;
                console.log('[Compat][SRD] setImageAll("' + folder + '") done, ' + count + ' images queued');
            } catch(e) {
                console.error('[Compat][SRD] setImageAll("' + folder + '") THREW: ' + e.name + ': ' + e.message);
                // Prevent crash: ensure imagePreloads[folder] exists
                if (!this.imagePreloads) this.imagePreloads = {};
                if (!this.imagePreloads[folder]) this.imagePreloads[folder] = [];
            }
        };

        // ── 4. Wrap setAudioAll similarly ───────────────────────────────────
        var _origSetAudioAll = SRD.PreloaderCore.setAudioAll;
        SRD.PreloaderCore.setAudioAll = function(folder) {
            try {
                console.log('[Compat][SRD] setAudioAll("' + folder + '") start');
                if (typeof _origSetAudioAll === 'function') _origSetAudioAll.call(this, folder);
                var count = (this.audioPreloads && this.audioPreloads[folder]) ? this.audioPreloads[folder].length : 0;
                console.log('[Compat][SRD] setAudioAll("' + folder + '") done, ' + count + ' tracks queued');
            } catch(e) {
                console.error('[Compat][SRD] setAudioAll("' + folder + '") THREW: ' + e.name + ': ' + e.message);
                if (!this.audioPreloads) this.audioPreloads = {};
                if (!this.audioPreloads[folder]) this.audioPreloads[folder] = [];
            }
        };

        // Restore NW.js-style fs path so preloadImageFolder('enemies','all')
        // calls setImageAll() rather than makeAllError().
        SRD.PreloaderCore.isNwjs = true;
        console.log('[Compat][SRD_PreloaderCore] isNwjs patched to true (native readdirSync available)');

        // ── 5. Global SceneManager hooks to catch ANY black-screen cause ────
        if (window.SceneManager) {
            // Hook catchException: logs the actual JS error thrown anywhere in game loop
            var _origCatch = SceneManager.catchException;
            SceneManager.catchException = function(e) {
                if (e instanceof Error) {
                    console.error('[Compat][SRD] SceneManager.catchException: ' + e.name + ': ' + e.message);
                    if (e.stack) console.error('[Compat][SRD] Stack: ' + e.stack);
                } else {
                    console.error('[Compat][SRD] SceneManager.catchException (non-Error): ' + e);
                }
                if (typeof _origCatch === 'function') _origCatch.call(SceneManager, e);
            };

            // Hook stop: logs WHO called SceneManager.stop() via stack trace
            var _origStop = SceneManager.stop;
            SceneManager.stop = function() {
                console.error('[Compat][SRD] SceneManager.stop() called! Stack:\n' + new Error().stack);
                if (typeof _origStop === 'function') _origStop.call(SceneManager);
            };

            // Hook run: confirm the game loop is started at all
            var _origRun = SceneManager.run;
            SceneManager.run = function(sceneClass) {
                console.log('[Compat][SRD] SceneManager.run(' +
                    (sceneClass && sceneClass.name ? sceneClass.name : sceneClass) + ')');
                if (typeof _origRun === 'function') _origRun.call(SceneManager, sceneClass);
            };

            // Heartbeat: log every ~10s to confirm the game loop is ticking
            var _heartbeatFrame = 0;
            var _origUpdateMain = SceneManager.updateMain;
            SceneManager.updateMain = function() {
                _heartbeatFrame++;
                if (_heartbeatFrame % 600 === 1) {
                    console.log('[Compat][SRD] game loop heartbeat frame=' + _heartbeatFrame);
                }
                if (typeof _origUpdateMain === 'function') _origUpdateMain.call(SceneManager);
            };

            console.log('[Compat][SRD_PreloaderCore] SceneManager hooks installed');
        } else {
            console.warn('[Compat][SRD_PreloaderCore] SceneManager not found at load time');
        }

        // ── 6. Scene_Boot.prototype.start hook ─────────────────────────────
        if (window.Scene_Boot && Scene_Boot.prototype) {
            var _origSceneBoot = Scene_Boot.prototype.start;
            Scene_Boot.prototype.start = function() {
                console.log('[Compat][SRD] Scene_Boot.prototype.start() called');
                try {
                    if (typeof _origSceneBoot === 'function') _origSceneBoot.call(this);
                    console.log('[Compat][SRD] Scene_Boot.prototype.start() completed OK');
                } catch(e) {
                    console.error('[Compat][SRD] Scene_Boot.prototype.start() THREW: ' +
                        e.name + ': ' + e.message +
                        (e.stack ? '\n' + e.stack : ''));
                }
            };
            console.log('[Compat][SRD_PreloaderCore] Scene_Boot.start hook installed');
        } else {
            console.warn('[Compat][SRD_PreloaderCore] Scene_Boot not found at load time');
        }
    });
})();
