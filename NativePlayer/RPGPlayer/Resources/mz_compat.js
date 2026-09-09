// === MZ Compatibility Bundle (merged) ===
// Contains: mz_storage.js, mz_media.js, mz_plugin_params.js, mz_webgl_compat.js, mz_bootstrap.js
// Each module has its own MZ environment check; only executes in MZ games.

// --- mz_storage.js ---
(function () {
  'use strict';
  // 适配/覆盖 MZ 的 StorageManager/DataManager 存档行为，优先使用 web 存储（localStorage）。
  // 注：不复制官方实现，仅提供最小可玩所需的替代方案，兼容现有 MV 策略与 iOS 环境。

  // 只在 MZ 环境下执行，避免与 MV 的 StorageManager 冲突
  function isMZ() {
    if (typeof Utils !== 'undefined' && Utils.RPGMAKER_NAME) {
      return Utils.RPGMAKER_NAME === 'MZ';
    }
    // MZ 有 DataManager.saveGame，MV 没有；用这个判断
    if (typeof DataManager !== 'undefined' && typeof DataManager.saveGame === 'function') {
      return true;
    }
    // MV 有 DataManager.maxSaveFiles，MZ 没有
    if (typeof DataManager !== 'undefined' && typeof DataManager.maxSaveFiles === 'function') {
      return false;
    }
    return null; // 无法判断，需要等待
  }

  function init() {
    var env = isMZ();
    if (env === false) {
      console.log('[mz_storage] Skipped: not MZ environment');
      return;
    }
    if (env === null) {
      setTimeout(init, 100);
      return;
    }
    console.log('[mz_storage] Initializing MZ storage polyfill...');
    initMZStorage();
  }

  function initMZStorage() {

  var KEY_PREFIX = 'ArkRPG:MZ:save:';
  var INFO_KEY = 'ArkRPG:MZ:info';

  function safeJSONParse(text) {
    try { return JSON.parse(text); } catch (_) { return null; }
  }

  function lsGet(key) {
    try { return window.localStorage.getItem(key); } catch (_) { return null; }
  }
  function lsSet(key, val) {
    try { window.localStorage.setItem(key, val); return true; } catch (_) { return false; }
  }
  function lsRemove(key) {
    try { window.localStorage.removeItem(key); return true; } catch (_) { return false; }
  }

  // 提供基本的 StorageManager 代理，不依赖文件系统。
  window.StorageManager = window.StorageManager || {};

  // 是否使用本地模式（在 iOS WebView 下视为非文件系统存储）
  window.StorageManager.isLocalMode = function () { return false; };

  // 保存对象（slotId 从 1 开始）；data 应为序列化友好的对象
  window.StorageManager.saveObject = async function (slotId, object) {
    var key = KEY_PREFIX + String(slotId);
    var payload = JSON.stringify(object);
    if (!lsSet(key, payload)) throw new Error('saveObject failed');
    // 更新 savefileInfo（用于存档列表显示）
    var info = safeJSONParse(lsGet(INFO_KEY)) || {};
    info[slotId] = { timestamp: Date.now(), size: payload.length };
    lsSet(INFO_KEY, JSON.stringify(info));
    return true;
  };

  window.StorageManager.loadObject = async function (slotId) {
    var key = KEY_PREFIX + String(slotId);
    var raw = lsGet(key);
    if (!raw) throw new Error('loadObject: empty');
    var obj = safeJSONParse(raw);
    if (obj == null) throw new Error('loadObject: parse error');
    return obj;
  };

  window.StorageManager.remove = function (slotId) {
    var key = KEY_PREFIX + String(slotId);
    lsRemove(key);
    var info = safeJSONParse(lsGet(INFO_KEY)) || {};
    delete info[slotId];
    lsSet(INFO_KEY, JSON.stringify(info));
  };

  window.StorageManager.exists = function (slotId) {
    return !!lsGet(KEY_PREFIX + String(slotId));
  };

  window.StorageManager.savefileInfo = function (slotId) {
    var info = safeJSONParse(lsGet(INFO_KEY)) || {};
    return info[slotId] || null;
  };

  // 兼容 DataManager 的基础钩子（如有调用）——仅提供占位，不复制实现
  window.DataManager = window.DataManager || {};
  if (typeof window.DataManager.extractSaveContents !== 'function') {
    window.DataManager.extractSaveContents = function (contents) {
      // 在 MZ 中该函数负责将存档内容加载回内存结构；此处不做细化，交由引擎自身。
      return contents;
    };
  }
  } // end initMZStorage

  init();
})();


// --- mz_media.js ---
(function () {
  'use strict';
  // 统一 MZ 媒体行为：初始化/解锁 AudioContext，监听媒体错误并尽量不中断游戏流程。

  // 只在 MZ 环境下执行
  function isMZ() {
    if (typeof Utils !== 'undefined' && Utils.RPGMAKER_NAME) {
      return Utils.RPGMAKER_NAME === 'MZ';
    }
    if (typeof DataManager !== 'undefined' && typeof DataManager.saveGame === 'function') {
      return true;
    }
    if (typeof DataManager !== 'undefined' && typeof DataManager.maxSaveFiles === 'function') {
      return false;
    }
    return null;
  }

  function init() {
    var env = isMZ();
    if (env === false) return;
    if (env === null) { setTimeout(init, 100); return; }
    initMZMedia();
  }

  function initMZMedia() {

  var audioContext;
  function ensureAudioContext() {
    try {
      audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext && audioContext.state === 'suspended') {
        var resume = function () { audioContext.resume && audioContext.resume(); };
        // 交互解锁（一次性）
        ['click', 'touchstart', 'keydown'].forEach(function (evt) {
          window.addEventListener(evt, function once() {
            resume();
          }, { once: true, passive: true });
        });
      }
    } catch (e) {
      console.warn('[MZ Media] AudioContext init failed:', e);
    }
    return audioContext;
  }

  // 媒体错误监听与降噪（避免常见插件噪音阻塞）
  function setupMediaErrorHandling() {
    window.addEventListener('error', function (ev) {
      try {
        var t = ev && ev.target;
        if (t && (t.tagName === 'AUDIO' || t.tagName === 'VIDEO')) {
          console.warn('[MZ Media] Media error:', t.src);
          // 视频错误由 inline_video.js 精确处理，此处只重试音频
          if (t.tagName !== 'VIDEO') {
            try { t.load && t.load(); } catch (_) {}
          }
        }
      } catch (e) {}
    }, true);
  }

  // 对外最小 API（若引擎或插件调用）
  window.MZMedia = window.MZMedia || {
    init: function () { ensureAudioContext(); setupMediaErrorHandling(); },
    getContext: function () { return ensureAudioContext(); }
  };

  // 文档加载后尽早初始化（不会强制播放，仅预热）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { window.MZMedia.init(); });
  } else {
    window.MZMedia.init();
  }
  } // end initMZMedia

  init();
})();


// --- mz_plugin_params.js ---
// MZ Plugin Parameter Alias Compatibility
//
// Some deployed games rename a plugin file in plugins.js (for example by
// adding an author prefix) while the plugin still requests parameters using
// its original internal name. RPG Maker MZ performs an exact lookup and
// returns {}, which often becomes JSON.parse(undefined) during plugin load.
//
// Keep exact MZ behavior first. Only when the requested key was not
// registered do we try the currently executing plugin filename and then a
// unique, separator-delimited suffix match.

(function() {
    'use strict';

    // 只在 MZ 环境下执行，避免与 MV 的 PluginManager 行为冲突
    function isMZ() {
        if (typeof Utils !== 'undefined' && Utils.RPGMAKER_NAME) {
            return Utils.RPGMAKER_NAME === 'MZ';
        }
        if (typeof DataManager !== 'undefined' && typeof DataManager.saveGame === 'function') {
            return true;
        }
        if (typeof DataManager !== 'undefined' && typeof DataManager.maxSaveFiles === 'function') {
            return false;
        }
        return null;
    }

    function init() {
        var env = isMZ();
        if (env === false) return;
        if (env === null) { setTimeout(init, 100); return; }
        initMZParams();
    }

    function initMZParams() {

    var warnedAliases = Object.create(null);

    function hasOwn(object, key) {
        return Object.prototype.hasOwnProperty.call(object || {}, key);
    }

    function currentPluginName() {
        try {
            var script = document.currentScript;
            if (!script || !script.src) return '';
            var path = decodeURIComponent(String(script.src)).split(/[?#]/)[0];
            var filename = path.split('/').pop() || '';
            return filename.replace(/\.js$/i, '');
        } catch (_) {
            return '';
        }
    }

    function suffixCandidates(parameters, requestedKey) {
        var keys = Object.keys(parameters || {});
        return keys.filter(function(candidateKey) {
            if (candidateKey.length <= requestedKey.length) return false;
            if (candidateKey.slice(-requestedKey.length) !== requestedKey) return false;
            var separator = candidateKey.charAt(candidateKey.length - requestedKey.length - 1);
            return separator === '/' || separator === '\\' || separator === '_' ||
                separator === '-' || separator === '.';
        });
    }

    function warnAlias(requestedName, resolvedKey) {
        var warningKey = String(requestedName).toLowerCase() + '->' + resolvedKey;
        if (warnedAliases[warningKey]) return;
        warnedAliases[warningKey] = true;
        console.warn(
            '[MZ PluginParams] Using registered plugin parameters:',
            resolvedKey,
            'for requested name:',
            requestedName
        );
    }

    function wrapParameters(manager, original) {
        if (typeof original !== 'function' || original.__arkMZAliasWrapped) {
            return original;
        }

        function parametersWithAlias(name) {
            var exactResult = original.apply(this, arguments);
            var requestedName = String(name == null ? '' : name);
            var requestedKey = requestedName.toLowerCase();
            var parameters = this._parameters || manager._parameters || {};

            // A registered plugin is allowed to have an intentionally empty
            // parameter object. Never replace an exact registration.
            if (!requestedKey || hasOwn(parameters, requestedKey)) {
                return exactResult;
            }

            var matches = suffixCandidates(parameters, requestedKey);
            if (matches.length === 1) {
                warnAlias(requestedName, matches[0]);
                return parameters[matches[0]];
            }

            // If multiple renamed files share the same internal suffix, only
            // the currently executing registered plugin may disambiguate them.
            // Never map an unrelated missing-plugin query to the caller.
            if (matches.length > 1) {
                var scriptName = currentPluginName();
                var scriptKey = scriptName.toLowerCase();
                if (matches.indexOf(scriptKey) >= 0) {
                    warnAlias(requestedName, scriptKey);
                    return parameters[scriptKey];
                }
            }

            return exactResult;
        }

        parametersWithAlias.__arkMZAliasWrapped = true;
        parametersWithAlias.__arkMZAliasOriginal = original;
        return parametersWithAlias;
    }

    function installOnManager(manager) {
        if (!manager || manager.__arkMZPluginParamsInstalled) return;
        manager.__arkMZPluginParamsInstalled = true;

        var descriptor = Object.getOwnPropertyDescriptor(manager, 'parameters');
        var assigned = descriptor && descriptor.value;

        Object.defineProperty(manager, 'parameters', {
            configurable: true,
            enumerable: true,
            get: function() {
                return assigned;
            },
            set: function(value) {
                assigned = wrapParameters(manager, value);
            }
        });

        if (typeof assigned === 'function') {
            assigned = wrapParameters(manager, assigned);
        }
    }

    if (typeof window.PluginManager !== 'undefined') {
        installOnManager(window.PluginManager);
        return;
    }

    var pluginManager;
    Object.defineProperty(window, 'PluginManager', {
        configurable: true,
        enumerable: true,
        get: function() {
            return pluginManager;
        },
        set: function(value) {
            pluginManager = value;
            installOnManager(value);
        }
    });
    } // end initMZParams

    init();
})();


// --- mz_webgl_compat.js ---
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


// --- mz_bootstrap.js ---
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


