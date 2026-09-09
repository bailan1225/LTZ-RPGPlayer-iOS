(function() {
  'use strict';

  if (window.__arkTextureGCInstalled) return;
  window.__arkTextureGCInstalled = true;

  var config = {
    pixiMaxIdle: 60,
    pixiCheckCountMax: 30,
    animationTrimDelay: 1200,
    sceneTrimDelay: 300,
    logEveryRun: false
  };

  var loggedRuntimeHooks = false;
  var runtimeHooks = {
    spriteAnimation: false,
    sceneMap: false,
    sceneBattle: false,
    sceneManager: false
  };
  var activeAnimations = 0;
  var pendingTrim = 0;
  var lastTrimAt = 0;

  function log(message) {
    console.log('[TextureGC] ' + message);
  }

  function warn(message, error) {
    console.warn('[TextureGC] ' + message, error);
  }

  function getRenderer() {
    try {
      if (window.Graphics) {
        if (Graphics._renderer) return Graphics._renderer;
        if (Graphics.app && Graphics.app.renderer) return Graphics.app.renderer;
        if (Graphics._app && Graphics._app.renderer) return Graphics._app.renderer;
      }
    } catch (e) {
      warn('renderer lookup failed', e);
    }
    return null;
  }

  function configurePixiGC() {
    try {
      if (window.PIXI && PIXI.settings) {
        if (typeof PIXI.settings.GC_MAX_IDLE === 'number') {
          PIXI.settings.GC_MAX_IDLE = Math.min(PIXI.settings.GC_MAX_IDLE, config.pixiMaxIdle);
        }
        if (typeof PIXI.settings.GC_MAX_CHECK_COUNT === 'number') {
          PIXI.settings.GC_MAX_CHECK_COUNT = Math.min(PIXI.settings.GC_MAX_CHECK_COUNT, config.pixiCheckCountMax);
        }
      }

      var renderer = getRenderer();
      var textureGC = renderer && renderer.textureGC;
      if (!textureGC) return false;

      if (typeof textureGC.maxIdle === 'number') {
        textureGC.maxIdle = Math.min(textureGC.maxIdle, config.pixiMaxIdle);
      }
      if (typeof textureGC.checkCountMax === 'number') {
        textureGC.checkCountMax = Math.min(textureGC.checkCountMax, config.pixiCheckCountMax);
      }
      return true;
    } catch (e) {
      warn('configure PIXI textureGC failed', e);
      return false;
    }
  }

  function runPixiGC(reason) {
    try {
      configurePixiGC();
      var renderer = getRenderer();
      var textureGC = renderer && renderer.textureGC;
      if (!textureGC || typeof textureGC.run !== 'function') return false;
      textureGC.run();
      if (config.logEveryRun) log('PIXI textureGC run: ' + reason);
      return true;
    } catch (e) {
      warn('PIXI textureGC run failed: ' + reason, e);
      return false;
    }
  }

  function destroyBitmapTexture(bitmap) {
    if (!bitmap) return false;
    try {
      if (typeof bitmap.destroy === 'function') {
        bitmap.destroy();
        return true;
      }

      var baseTexture = bitmap._baseTexture || bitmap.baseTexture;
      if (baseTexture && typeof baseTexture.destroy === 'function') {
        baseTexture.destroy();
        bitmap._baseTexture = null;
        return true;
      }
    } catch (e) {
      warn('bitmap texture destroy failed', e);
    }
    return false;
  }

  function removeImageCacheEntry(cache, items, key) {
    var entry = items[key];
    var bitmap = entry && (entry.bitmap || entry._bitmap || entry);
    if (cache && typeof cache.remove === 'function') {
      try {
        cache.remove(key);
      } catch (e) {
        warn('ImageCache.remove failed for ' + key, e);
        delete items[key];
      }
    } else {
      delete items[key];
    }
    destroyBitmapTexture(bitmap);
  }

  function purgeImageCache(predicate, reason) {
    try {
      if (!window.ImageManager || !ImageManager._imageCache) return 0;
      var cache = ImageManager._imageCache;
      var items = cache._items;
      if (!items) return 0;

      var removed = 0;
      Object.keys(items).forEach(function(key) {
        if (!predicate(key)) return;
        removeImageCacheEntry(cache, items, key);
        removed += 1;
      });

      if (removed > 0) log('purged ' + removed + ' image cache entries: ' + reason);
      return removed;
    } catch (e) {
      warn('image cache purge failed: ' + reason, e);
      return 0;
    }
  }

  function isAnimationCacheKey(key) {
    return /(^|\/)img\/animations\//i.test(key) || /(^|\/)animations\//i.test(key);
  }

  function trimAnimations(reason) {
    if (activeAnimations > 0) return;
    purgeImageCache(isAnimationCacheKey, reason);
    runPixiGC(reason);
  }

  function scheduleTrim(reason, delay, includeAnimationCache) {
    var now = Date.now();
    if (now - lastTrimAt < 250 && pendingTrim) return;

    clearTimeout(pendingTrim);
    pendingTrim = setTimeout(function() {
      pendingTrim = 0;
      lastTrimAt = Date.now();
      if (includeAnimationCache) trimAnimations(reason);
      runPixiGC(reason);
    }, delay);
  }

  function wrapMethod(owner, name, wrapper) {
    if (!owner || typeof owner[name] !== 'function' || owner[name].__arkTextureGCWrapped) return false;
    var original = owner[name];
    var wrapped = wrapper(original);
    wrapped.__arkTextureGCWrapped = true;
    owner[name] = wrapped;
    return true;
  }

  function hookSpriteAnimation() {
    if (!window.Sprite_Animation || !Sprite_Animation.prototype) return false;
    var proto = Sprite_Animation.prototype;

    wrapMethod(proto, 'setup', function(original) {
      return function() {
        if (!this.__arkTextureGCActive) {
          this.__arkTextureGCActive = true;
          activeAnimations += 1;
        }
        return original.apply(this, arguments);
      };
    });

    wrapMethod(proto, 'remove', function(original) {
      return function() {
        var result = original.apply(this, arguments);
        if (this.__arkTextureGCActive) {
          this.__arkTextureGCActive = false;
          activeAnimations = Math.max(0, activeAnimations - 1);
        }
        if (activeAnimations === 0) {
          scheduleTrim('animation-remove', config.animationTrimDelay, true);
        }
        return result;
      };
    });

    wrapMethod(proto, 'destroy', function(original) {
      return function() {
        if (this.__arkTextureGCActive) {
          this.__arkTextureGCActive = false;
          activeAnimations = Math.max(0, activeAnimations - 1);
        }
        var result = original.apply(this, arguments);
        if (activeAnimations === 0) {
          scheduleTrim('animation-destroy', config.animationTrimDelay, true);
        }
        return result;
      };
    });

    runtimeHooks.spriteAnimation = true;
    return true;
  }

  function hookSceneTrims() {
    if (!runtimeHooks.sceneMap && window.Scene_Map && Scene_Map.prototype) {
      runtimeHooks.sceneMap = wrapMethod(Scene_Map.prototype, 'terminate', function(original) {
        return function() {
          var result = original.apply(this, arguments);
          scheduleTrim('scene-map-terminate', config.sceneTrimDelay, true);
          return result;
        };
      });
    }

    if (!runtimeHooks.sceneBattle && window.Scene_Battle && Scene_Battle.prototype) {
      runtimeHooks.sceneBattle = wrapMethod(Scene_Battle.prototype, 'terminate', function(original) {
        return function() {
          var result = original.apply(this, arguments);
          activeAnimations = 0;
          scheduleTrim('scene-battle-terminate', config.sceneTrimDelay, true);
          return result;
        };
      });
    }

    if (!runtimeHooks.sceneManager && window.SceneManager) {
      runtimeHooks.sceneManager = wrapMethod(SceneManager, 'changeScene', function(original) {
        return function() {
          var result = original.apply(this, arguments);
          scheduleTrim('scene-change', config.sceneTrimDelay, false);
          return result;
        };
      });
    }

    return runtimeHooks.sceneMap || runtimeHooks.sceneBattle || runtimeHooks.sceneManager;
  }

  function installRuntimeHooks() {
    if (!runtimeHooks.spriteAnimation) hookSpriteAnimation();
    hookSceneTrims();

    var sceneHooked = runtimeHooks.sceneMap || runtimeHooks.sceneBattle || runtimeHooks.sceneManager;
    var fullyHooked = runtimeHooks.spriteAnimation && sceneHooked;
    if (fullyHooked && !loggedRuntimeHooks) {
      loggedRuntimeHooks = true;
      log('runtime hooks installed');
    }
    return fullyHooked;
  }

  window.__arkTextureGC = {
    trim: function(reason) {
      scheduleTrim(reason || 'manual', 0, true);
    },
    runPixiGC: runPixiGC,
    configurePixiGC: configurePixiGC,
    activeAnimations: function() {
      return activeAnimations;
    }
  };

  var ticks = 0;
  var timer = setInterval(function() {
    var configured = configurePixiGC();
    var hooked = installRuntimeHooks();
    ticks += 1;
    if (configured && hooked) {
      log('installed');
      clearInterval(timer);
    } else if (ticks > 80) {
      if (hooked || configured) log('partially installed');
      clearInterval(timer);
    }
  }, 250);
})();
