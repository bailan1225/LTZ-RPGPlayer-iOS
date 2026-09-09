(function() {
  'use strict';

  var disableFilters = true;
  // A/B 测试用帧率显示。测完改回 false — 会引入极小 rAF 开销。
  var SHOW_FPS_OVERLAY = false;

  // ─────────────────────────────────────────────────────────────────────────────
  // iOS A 系列 GPU 专属补丁 — 这两条是地图移动卡顿的最大嫌疑：
  //   1) WebGL antialias=false：关闭 MSAA，省 fill-rate
  //   2) PIXI.settings.CAN_UPLOAD_SAME_BUFFER=false：A 系列 GPU 是 tiles-based
  //      (TBDR)，复用同一 ArrayBuffer 跨帧上传子数据会触发 pipeline stall。
  //      PixiJS v5 默认 isMobile.any ? false : true；桌面/未识别 UA 会变 true。
  //      行走动画/瓦片滚动每帧都更新纹理，正好对应"移动卡、静止不卡"现象。
  //   MIPMAP_TEXTURES=0：RPG Maker 多为像素美术，关闭 mipmap 链生成省显存带宽。
  // ─────────────────────────────────────────────────────────────────────────────
  (function patchGetContext() {
    try {
      var origGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, attrs) {
        if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
          var patched = Object.assign({}, attrs || {});
          patched.antialias = false;
          patched.powerPreference = 'high-performance';
          var ctx = origGetContext.call(this, type, patched);
          if (ctx) return ctx;
          return origGetContext.call(this, type, attrs);
        }
        return origGetContext.apply(this, arguments);
      };
      console.log('[Perf] WebGL context patched (antialias=false, high-performance)');
    } catch (e) {
      console.warn('[Perf] WebGL context patch failed:', e);
    }
  })();

  (function interceptPIXI() {
    function patchPixiSettings(p) {
      if (!p || !p.settings || p.__arkPerfPatched) return;
      try {
        var s = p.settings;
        if (typeof s.CAN_UPLOAD_SAME_BUFFER !== 'undefined') {
          s.CAN_UPLOAD_SAME_BUFFER = false;
        }
        if (typeof s.MIPMAP_TEXTURES !== 'undefined') {
          s.MIPMAP_TEXTURES = 0;
        }
        p.__arkPerfPatched = true;
        console.log('[Perf] PIXI settings patched (CAN_UPLOAD_SAME_BUFFER=false, MIPMAP_TEXTURES=0)');
      } catch (e) {
        console.warn('[Perf] PIXI settings patch failed:', e);
      }
    }

    var _pixi = window.PIXI || null;
    if (_pixi) patchPixiSettings(_pixi);

    try {
      Object.defineProperty(window, 'PIXI', {
        configurable: true,
        enumerable: true,
        get: function() { return _pixi; },
        set: function(v) { _pixi = v; patchPixiSettings(v); }
      });
    } catch (e) {
      console.warn('[Perf] PIXI property interceptor failed:', e);
    }
  })();

  function applyGraphicsTweaks() {
    if (typeof window.Graphics === 'undefined') return false;
    try {
      if (disableFilters && typeof Graphics._disableFilters !== 'undefined') {
        Graphics._disableFilters = true;
      }
      return true;
    } catch (e) {
      console.warn('[Perf] applyGraphicsTweaks failed:', e);
      return false;
    }
  }

  function applyPixiPrefs() {
    if (typeof window.PIXI === 'undefined' || !PIXI.settings || !PIXI.ENV) return false;
    try {
      if (PIXI.settings.PREFER_ENV !== PIXI.ENV.WEBGL) {
        PIXI.settings.PREFER_ENV = PIXI.ENV.WEBGL;
      }
      return true;
    } catch (e) {
      console.warn('[Perf] applyPixiPrefs failed:', e);
      return false;
    }
  }

  var ticks = 0;
  // Poll at 200ms (5Hz) instead of 20ms (50Hz) — same result, 10x less CPU overhead
  var timer = setInterval(function() {
    var ok1 = applyGraphicsTweaks();
    var ok2 = applyPixiPrefs();
    ticks += 1;
    if (ok1 && ok2) {
      console.log('[Perf] Applied filter tweaks');
      clearInterval(timer);
    }
    // stop retrying after ~6 seconds (30 ticks × 200ms)
    if (ticks > 30) clearInterval(timer);
  }, 200);

  // ─────────────────────────────────────────────────────────────────────────────
  // FPS Overlay — 用 rAF 时间戳测量真实渲染帧率。
  // 由文件顶部的 SHOW_FPS_OVERLAY 开关控制。
  // 独立 rAF 链，不与游戏 ticker 共享状态，不影响测量结果。
  // ─────────────────────────────────────────────────────────────────────────────
  if (SHOW_FPS_OVERLAY) {
    (function initFPSOverlay() {
      function createOverlay() {
        var el = document.createElement('div');
        el.id = '__ark_fps__';
        el.style.cssText = [
          'position:fixed',
          'top:8px',
          'left:8px',
          'z-index:2147483647',
          'background:rgba(0,0,0,0.55)',
          'color:#0f0',
          'font:bold 14px/1.4 monospace',
          'padding:3px 7px',
          'border-radius:4px',
          'pointer-events:none',
          'user-select:none',
          '-webkit-user-select:none',
          'white-space:pre'
        ].join(';');
        el.textContent = 'FPS --';
        document.body.appendChild(el);
        return el;
      }

      var overlay = null;
      var frameTimes = [];
      var WINDOW = 30;
      var lastPaint = 0;

      function tick(ts) {
        frameTimes.push(ts);
        if (frameTimes.length > WINDOW + 1) frameTimes.shift();

        if (frameTimes.length >= 2 && ts - lastPaint > 333) {
          lastPaint = ts;
          var n    = frameTimes.length;
          var span = frameTimes[n - 1] - frameTimes[0];
          var fps  = span > 0 ? Math.round((n - 1) / span * 1000) : 0;

          var colour = fps >= 55 ? '#0f0' : fps >= 40 ? '#ff0' : '#f44';
          if (!overlay) overlay = createOverlay();
          overlay.style.color = colour;
          overlay.textContent = 'FPS ' + fps;
        }

        requestAnimationFrame(tick);
      }

      if (document.body) {
        requestAnimationFrame(tick);
      } else {
        document.addEventListener('DOMContentLoaded', function() {
          requestAnimationFrame(tick);
        });
      }
    })();
  }
})();
