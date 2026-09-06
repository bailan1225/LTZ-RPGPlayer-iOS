// RPG Player 内置翻译注入脚本（RPG Maker MV / MZ 通用）
// 通过挂钩 Window_Base.drawTextEx，对带控制码的整段文本做缓存翻译；
// 命中缓存同步替换，未命中则异步翻译后触发所在窗口刷新重绘。
(function () {
  "use strict";
  if (window.__rpgTrInjected) return;
  window.__rpgTrInjected = true;

  var cfg = window.RPG_T || {};
  var state = {
    enabled: !!cfg.enabled,
    engine: cfg.engine || "offline",
    source: cfg.source || "ja",
    target: cfg.target || "zh-CN",
    apiUrl: cfg.apiUrl || "",
    cacheVersion: cfg.cacheVersion || 1,
    translateUI: !!cfg.translateUI,
    dictionary: cfg.dictionary || {}
  };
  var cacheKey = "rpgTrCache_v" + state.cacheVersion + "_" + state.target;
  var cache = {};
  var sessionPending = {};

  function loadCache() {
    try {
      var raw = localStorage.getItem(cacheKey);
      if (raw) cache = JSON.parse(raw) || {};
    } catch (e) { cache = {}; }
  }
  function saveCache() {
    try { localStorage.setItem(cacheKey, JSON.stringify(cache)); } catch (e) {}
  }
  loadCache();

  function norm(s) { return String(s).replace(/\s+/g, " ").trim(); }
  function keyOf(s) { return state.target + "|" + s; }

  var CODE_RE = /\\([A-Za-z]+)(\[[^\]]*\])?/g;

  // 把文本切成「控制码 / 普通文本」片段
  function splitParts(text) {
    var parts = [], last = 0, m;
    CODE_RE.lastIndex = 0;
    while ((m = CODE_RE.exec(text))) {
      if (m.index > last) parts.push({ c: 0, v: text.slice(last, m.index) });
      parts.push({ c: 1, v: m[0] });
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push({ c: 0, v: text.slice(last) });
    return parts;
  }

  function plainOf(parts) {
    return parts.filter(function (p) { return p.c === 0; })
      .map(function (p) { return p.v; }).join("\u0001");
  }

  function xhrGet(url, done) {
    var xhr = new XMLHttpRequest();
    try {
      xhr.open("GET", url, true);
      xhr.timeout = 10000;
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) done(null, xhr.responseText);
        else done(new Error("HTTP " + xhr.status));
      };
      xhr.onerror = function () { done(new Error("network")); };
      xhr.ontimeout = function () { done(new Error("timeout")); };
      xhr.send();
    } catch (e) { done(e); }
  }

  // 纯文本翻译（不含控制码），离线词典优先，其次在线引擎
  function translatePlain(plain, done) {
    var trimmed = norm(plain);
    if (!trimmed) { done(null); return; }
    if (state.dictionary[trimmed]) { done(state.dictionary[trimmed]); return; }
    if (state.dictionary[plain]) { done(state.dictionary[plain]); return; }
    if (!state.enabled) { done(null); return; }

    if (state.engine === "mymemory") {
      var url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(trimmed) +
        "&langpair=" + encodeURIComponent(state.source + "|" + state.target);
      xhrGet(url, function (err, text) {
        if (err || !text) { done(null); return; }
        var t = text;
        try {
          var j = JSON.parse(text);
          if (j && j.responseData && j.responseData.translatedText) t = j.responseData.translatedText;
        } catch (e) {}
        done(t && norm(t) !== trimmed ? norm(t) : null);
      });
      return;
    }
    if (state.engine === "custom") {
      var api = state.apiUrl;
      if (!api) { done(null); return; }
      api = api.replace("{text}", encodeURIComponent(trimmed));
      xhrGet(api, function (err, text) {
        if (err || !text) { done(null); return; }
        var t = text;
        try {
          var j = JSON.parse(text);
          if (j && j.translatedText) t = j.translatedText;
          else if (j && j.translation) t = j.translation;
          else if (typeof j === "string") t = j;
        } catch (e) {}
        done(t && norm(t) !== trimmed ? norm(t) : null);
      });
      return;
    }
    done(null);
  }

  // 整段文本（含控制码）的缓存翻译
  function processText(text, done) {
    var parts = splitParts(text);
    var plain = plainOf(parts);
    if (!norm(plain)) { done(null); return; }
    var k = keyOf(norm(plain));
    if (cache[k]) { done(cache[k]); return; }
    if (sessionPending[k]) { done(null); return; }
    sessionPending[k] = true;
    translatePlain(plain, function (tr) {
      delete sessionPending[k];
      if (!tr) {
        cache[k] = text;
        saveCache();
        done(null);
        return;
      }
      var arr = tr.split("\u0001");
      var i = 0;
      var out = parts.map(function (p) {
        if (p.c === 1) return p.v;
        var v = arr[i++];
        return v && v.length ? v : p.v;
      }).join("");
      if (out === text) { done(null); return; }
      cache[k] = out;
      saveCache();
      done(out);
    });
  }

  // 同步查缓存（供绘制时直接替换）
  function cacheLookup(text) {
    var parts = splitParts(text);
    var plain = plainOf(parts);
    if (!norm(plain)) return null;
    return cache[keyOf(norm(plain))] || null;
  }

  function patchDrawTextEx() {
    if (window.__rpgTrPatched) return true;
    if (!window.Window_Base) return false;
    var orig = Window_Base.prototype.drawTextEx;
    if (typeof orig !== "function") return false;

    Window_Base.prototype.drawTextEx = function (text, x, y) {
      var self = this;
      var useText = text;
      if (state.enabled && typeof text === "string" && /[^\s\\]/.test(text)) {
        var hit = cacheLookup(text);
        if (hit) {
          useText = hit;
        } else {
          var original = text;
          processText(original, function (tr) {
            if (!tr || tr === original) return;
            if (self && typeof self.refresh === "function") {
              try { self.refresh(); } catch (e) {}
            }
          });
        }
      }
      return orig.call(this, useText, x, y);
    };
    window.__rpgTrPatched = true;
    return true;
  }

  function patchBitmapDrawText() {
    if (window.__rpgTrBitmapPatched || !window.Bitmap) return;
    var orig = Bitmap.prototype.drawText;
    if (typeof orig !== "function") return;
    Bitmap.prototype.drawText = function (text, x, y, maxWidth, lineHeight, align) {
      if (state.enabled && typeof text === "string" && /[^\s\\]/.test(text)) {
        var hit = cacheLookup(text);
        if (hit) text = hit;
      }
      return orig.call(this, text, x, y, maxWidth, lineHeight, align);
    };
    window.__rpgTrBitmapPatched = true;
  }

  (function poll() {
    if (!patchDrawTextEx() && !window.__rpgTrPatched) {
      setTimeout(poll, 400);
      return;
    }
    if (state.translateUI) patchBitmapDrawText();
  })();

  window.RPGTranslator = {
    setEnabled: function (v) {
      state.enabled = !!v;
      try {
        if (window.SceneManager && SceneManager._scene && SceneManager._scene.refresh) {
          SceneManager._scene.refresh();
        }
      } catch (e) {}
    },
    resetSession: function () { sessionPending = {}; },
    getState: function () {
      return { enabled: state.enabled, engine: state.engine, target: state.target, cacheKey: cacheKey };
    }
  };

  try {
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.rpgTr) {
      window.webkit.messageHandlers.rpgTr.postMessage({ type: "ready", state: window.RPGTranslator.getState() });
    }
  } catch (e) {}
})();
