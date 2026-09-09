(function () {
  console.log("[MZ Bootstrap] Initializing...");
  'use strict';
  // MZ 引擎环境标识与最小化 NW.js 占位，避免插件误判失败。

  // 版本与运行时标识
  window.Utils = window.Utils || {};
  try {
    // 标识为 MZ，供插件或运行时代码判断
    window.Utils.RPGMAKER_NAME = 'MZ';
    // 若官方版本号不可知，保留空或占位字符串
    if (typeof window.Utils.RPGMAKER_VERSION === 'undefined') {
      window.Utils.RPGMAKER_VERSION = 'ArkRPG-MZ';
    }
  } catch (e) {
    console.warn('[MZ Bootstrap] Utils 标识设置失败:', e);
  }

  // 最小 NW.js 占位（常见插件仅检查存在与几个属性）
  window.nw = window.nw || {
    App: {
      dataPath: '/data',
      argv: [],
      quit: function () {
        try { console.log('[nw.App.quit]'); } catch (_) {}
      }
    },
    Window: {
      title: 'ArkRPG',
      close: function () {
        try { console.log('[nw.Window.close]'); } catch (_) {}
      },
      focus: function () { /* no-op */ }
    },
    Shell: {
      openExternal: function (url) {
        try { console.log('[nw.Shell.openExternal]', url); } catch (_) {}
      }
    }
  };

  // require 白名单占位（fs/path 在 common_* 中提供，nw.gui 等返回空对象避免插件崩溃）
  if (typeof window.require !== 'function') {
    window.require = function (name) {
      console.warn('[require] stub called:', name);
      const modules = (window.require.modules = window.require.modules || {});
      // NW.js 常见模块：返回空对象，避免 YEP_CoreEngine 等插件崩溃
      if (name === 'nw.gui' || name === 'nw' || name === 'gui') {
        if (!modules[name]) {
          modules[name] = {
            Window: { get: function () { return { on: function () {}, show: function () {}, hide: function () {}, close: function () {} }; } },
            Menu: function () { return { append: function () {}, popup: function () {} }; },
            MenuItem: function () {},
            Clipboard: { get: function () { return { set: function () {}, get: function () { return ''; } }; } },
            Shell: { openExternal: function (url) { console.log('[nw.gui.Shell.openExternal]', url); } }
          };
        }
        return modules[name];
      }
      return modules[name];
    };
  }

  // Suppress unhandled AbortError from effekseer WASM fetch.
  // Some games ship effekseer.wasm but the library internally fetches
  // "effekseer.core.wasm". If the name mapping fails at the scheme-handler
  // level the fetch rejects with AbortError; without a .catch() on the
  // library side this becomes an unhandled rejection that SceneManager
  // catches and displays as a fatal error, killing the game.
  // The native scheme handler maps the filename, so this is a safety net.
  window.addEventListener('unhandledrejection', function (event) {
    try {
      var reason = event.reason;
      var name = (reason && reason.name) || '';
      var msg = (reason && reason.message) || String(reason);
      if (reason instanceof DOMException && reason.name === 'AbortError') {
        console.warn('[MZ Bootstrap] Suppressed unhandled AbortError:', msg);
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    } catch (e) {}
  });

  // Null guard: prevent crash when moveTowardCharacter/moveAwayFromCharacter
  // receives null/undefined character (e.g. dynamic event erased mid-move-route)
  (function () {
    function applyNullGuard() {
      if (typeof Game_Character === 'undefined') return false;
      var proto = Game_Character.prototype;
      if (proto._arkCharNullGuard) return true;
      var names = ['moveTowardCharacter', 'moveAwayFromCharacter'];
      for (var i = 0; i < names.length; i++) {
        var orig = proto[names[i]];
        if (typeof orig === 'function') {
          (function (fn, original) {
            proto[fn] = function (character) {
              if (character == null) return;
              return original.call(this, character);
            };
          })(names[i], orig);
        }
      }
      proto._arkCharNullGuard = true;
      return true;
    }
    if (!applyNullGuard()) {
      var retries = 0;
      var timer = setInterval(function () {
        retries++;
        if (applyNullGuard() || retries > 50) clearInterval(timer);
      }, 200);
    }
  })();
})();
