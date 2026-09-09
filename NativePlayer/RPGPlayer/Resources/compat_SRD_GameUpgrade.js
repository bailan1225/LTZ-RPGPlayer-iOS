// SRD_GameUpgrade compat patch
//
// Root cause:
//   SRD_GameUpgrade replaces window.onload with its own function. If the
//   "Game Reconstruction (1.5.X & below)" param is enabled (default: true)
//   AND GameWindowManager.isWindowOriginal() returns true, it calls
//   GameWindowManager.startGameTransition() instead of the normal
//   SceneManager.run(Scene_Boot) startup.
//
//   startGameTransition() calls createNewWindow(gui) which calls
//   gui.Window.open() → our NW.js mock returns undefined (no return value) →
//   setupNewWindow(undefined, win) crashes:
//       TypeError: undefined is not an object
//           (evaluating 'this._intendedWindow[this._winCode] = true')
//   Result: window.onload never calls SceneManager.run → black screen.
//
//   isWindowOriginal() = Utils.isNwjs() && !require('nw.gui').Window.get()[winCode]
//   Utils.isNwjs() is patched to false by common_core.js, BUT if the game
//   environment has both require and process defined (it does), the patch may
//   not cover all execution paths, or the condition becomes true through the
//   mock nw.gui.Window.get() returning an object without the winCode property
//   (undefined → !undefined = true).
//
// Fix:
//   Patch GameWindowManager.isWindowOriginal() → false so that SRD's
//   window.onload always falls through to the else branch, which calls
//   _.window_onload() = SceneManager.run(Scene_Boot) normally.
//   Our addEventListener('load') listener fires before window.onload, so the
//   patch is in place before SRD's condition is evaluated.
//
// Trigger: game plugins.js contains SRD_GameUpgrade

(function() {
    window.addEventListener('load', function patchSRDGameUpgrade() {
        if (window.GameWindowManager &&
            typeof GameWindowManager.isWindowOriginal === 'function') {
            // In WKWebView, NW.js multi-window APIs are unavailable.
            // Returning false prevents startGameTransition() from being called,
            // allowing normal game startup via SceneManager.run(Scene_Boot).
            GameWindowManager.isWindowOriginal = function() { return false; };
            console.log('[Compat][SRD_GameUpgrade] GameWindowManager.isWindowOriginal patched → false');
        } else {
            console.log('[Compat][SRD_GameUpgrade] GameWindowManager.isWindowOriginal not found, skipping');
        }
    });
})();
