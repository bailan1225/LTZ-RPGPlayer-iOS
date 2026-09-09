// MV Plugin Parameters Safety Patch
// Ensures PluginManager.parameters() never returns null and normalizes common
// array-like parameters (e.g., CategoryOrder) without guessing their format.

(function(){
  // 只在 MV 环境下执行，避免与 MZ 的 PluginManager 行为冲突
  function isMV() {
    if (typeof Utils !== 'undefined' && Utils.RPGMAKER_NAME) {
      return Utils.RPGMAKER_NAME === 'MV';
    }
    if (typeof DataManager !== 'undefined' && typeof DataManager.maxSaveFiles === 'function') {
      return true;
    }
    if (typeof DataManager !== 'undefined' && typeof DataManager.saveGame === 'function') {
      return false;
    }
    return null;
  }

  function init() {
    var env = isMV();
    if (env === false) return;
    if (env === null) { setTimeout(init, 100); return; }
    initMVParams();
  }

  function initMVParams() {
  function normalizeArrayParameter(value){
    if (value == null) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string'){
      var s = value.trim();
      if (s === '' || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') return [];
      try {
        var parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed;
      } catch(e) {}

      // MV plugin parameters are strings by contract. A comma in a string does
      // not prove that the receiving plugin expects an array (Galv_QuestLog's
      // Categories parameter is a notable counterexample), so preserve it.
      return value;
    }

    // Do not silently replace numbers, booleans, or objects with an array.
    return value;
  }

  function applyPatch(){
    if (!window.PluginManager || window.PluginManager.__arkParamsPatched) return false;
    var PM = window.PluginManager;
    if (typeof PM.parameters !== 'function') return false;

    var orig = PM.parameters;
    PM.parameters = function(name){
      var p = null;
      try { p = orig.call(this, name); } catch(e){ console.warn('[Polyfill] PluginManager.parameters threw for', name, e); }
      if (p == null) p = {};

      // Common MV plugin keys that expect arrays
      var keys = ['CategoryOrder', 'Categories', 'Order', 'List'];
      keys.forEach(function(k){
        if (p.hasOwnProperty(k)){
          p[k] = normalizeArrayParameter(p[k]);
        }
      });

      // YEP-style specific key normalization
      if (p.hasOwnProperty('Category Order')){
        p['CategoryOrder'] = normalizeArrayParameter(p['Category Order']);
      }

      return p;
    };

    PM.__arkParamsPatched = true;
    console.log('[Polyfill] PluginManager.parameters patched for MV safety');
    return true;
  }

  function schedule(){
    if (applyPatch()) return; // already applied
    var tries = 0;
    var timer = setInterval(function(){
      tries++;
      if (applyPatch()) { clearInterval(timer); return; }
      if (tries > 200) { clearInterval(timer); }
    }, 25);

    // Also try once after DOM ready
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', applyPatch);
    } else {
      setTimeout(applyPatch, 0);
    }
  }

  schedule();
  } // end initMVParams

  init();
})();
