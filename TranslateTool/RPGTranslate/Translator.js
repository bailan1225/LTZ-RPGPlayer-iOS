// RPG Player 内置翻译注入脚本（RPG Maker MV / MZ 通用）
// 挂钩 Window_Base.drawTextEx：命中缓存/离线词典时同步替换文本；
// 未命中时异步翻译，完成后延后一帧刷新所在窗口。所有路径均不向游戏抛出异常。
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
    apiKey: cfg.apiKey || "",
    cacheVersion: cfg.cacheVersion || 1,
    translateUI: !!cfg.translateUI,
    dictionary: (cfg.dictionary && typeof cfg.dictionary === "object") ? cfg.dictionary : {}
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

  // 原型安全的词典读取：避免 "__proto__/constructor" 等键命中继承属性
  function dictGet(s) {
    try {
      if (Object.prototype.hasOwnProperty.call(state.dictionary, s)) return state.dictionary[s];
    } catch (e) {}
    return undefined;
  }

  var CODE_RE = /\\([A-Za-z]+)(\[[^\]]*\])?/g;

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

  function recombine(parts, tr) {
    if (typeof tr !== "string") return null;
    var arr = tr.split("\u0001");
    var i = 0;
    return parts.map(function (p) {
      if (p.c === 1) return p.v;
      var v = arr[i++];
      return (v && v.length) ? v : p.v;
    }).join("");
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

  function translatePlain(plain, done) {
    var trimmed = norm(plain);
    if (!trimmed) { done(null); return; }
    var d1 = dictGet(trimmed);
    var d2 = dictGet(plain);
    if (typeof d1 === "string") { done(d1); return; }
    if (typeof d2 === "string") { done(d2); return; }
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
        done((typeof t === "string" && norm(t) !== trimmed) ? norm(t) : null);
      });
      return;
    }
    if (state.engine === "custom") {
      var api = state.apiUrl;
      if (!api) { done(null); return; }
      api = api.replace("{text}", encodeURIComponent(trimmed));
      api = api.replace("{key}", encodeURIComponent(state.apiKey || ""));
      xhrGet(api, function (err, text) {
        if (err || !text) { done(null); return; }
        var t = text;
        try {
          var j = JSON.parse(text);
          if (j && typeof j.translatedText === "string") t = j.translatedText;
          else if (j && typeof j.translation === "string") t = j.translation;
          else if (typeof j === "string") t = j;
        } catch (e) {}
        done((typeof t === "string" && norm(t) !== trimmed) ? norm(t) : null);
      });
      return;
    }
    done(null);
  }

  function scheduleRefresh(self) {
    setTimeout(function () {
      try {
        if (self && typeof self.refresh === "function") self.refresh();
      } catch (e) {}
    }, 0);
  }

  function patchDrawTextEx() {
    if (window.__rpgTrPatched) return true;
    if (!window.Window_Base) return false;
    var orig = Window_Base.prototype.drawTextEx;
    if (typeof orig !== "function") return false;

    Window_Base.prototype.drawTextEx = function (text, x, y) {
      try {
        var self = this;
        var useText = text;
        if (state.enabled && typeof text === "string" && /[^\s\\]/.test(text)) {
          var parts = splitParts(text);
          var plain = plainOf(parts);
          var normed = norm(plain);
          if (normed) {
            var k = keyOf(normed);
            var hit = cache[k];
            if (typeof hit === "string") {
              useText = hit;
            } else {
              var sync = dictGet(normed) || dictGet(plain);
              if (typeof sync === "string") {
                var out = recombine(parts, sync);
                if (out && out !== text) { cache[k] = out; saveCache(); useText = out; }
              } else if (!sessionPending[k]) {
                sessionPending[k] = true;
                var origText = text;
                translatePlain(plain, function (tr) {
                  delete sessionPending[k];
                  if (!tr || typeof tr !== "string") { cache[k] = origText; saveCache(); return; }
                  var out2 = recombine(parts, tr);
                  if (!out2 || out2 === origText) return;
                  cache[k] = out2;
                  saveCache();
                  scheduleRefresh(self);
                });
              }
            }
          }
        }
        return orig.call(this, useText, x, y);
      } catch (e) {
        return orig.apply(this, arguments);
      }
    };
    window.__rpgTrPatched = true;
    return true;
  }

  function patchBitmapDrawText() {
    if (window.__rpgTrBitmapPatched || !window.Bitmap) return;
    var orig = Bitmap.prototype.drawText;
    if (typeof orig !== "function") return;
    Bitmap.prototype.drawText = function (text, x, y, maxWidth, lineHeight, align) {
      try {
        if (state.enabled && typeof text === "string" && /[^\s\\]/.test(text)) {
          var parts = splitParts(text);
          var plain = plainOf(parts);
          var normed = norm(plain);
          if (normed) {
            var hit = cache[keyOf(normed)];
            if (typeof hit === "string") {
              text = hit;
            } else {
              var sync = dictGet(normed) || dictGet(plain);
              if (typeof sync === "string") {
                var out = recombine(parts, sync);
                if (out) { cache[keyOf(normed)] = out; saveCache(); text = out; }
              }
            }
          }
        }
        return orig.call(this, text, x, y, maxWidth, lineHeight, align);
      } catch (e) {
        return orig.apply(this, arguments);
      }
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

  // ---------- 错误上报（诊断用）：MV 报错页不显示错误文本，这里补上 ----------
  (function () {
    function showError(msg, stack) {
      try {
        var box = document.getElementById("rpgtr-error");
        if (!box) {
          box = document.createElement("div");
          box.id = "rpgtr-error";
          box.style.cssText = "position:fixed;top:8px;left:8px;right:8px;z-index:100001;" +
            "background:rgba(120,20,20,0.95);color:#fff;padding:10px 12px;border-radius:10px;" +
            "font:12px/1.5 -apple-system,sans-serif;white-space:pre-wrap;word-break:break-all;";
          document.documentElement.appendChild(box);
        }
        box.textContent = "【游戏错误】" + (msg || "unknown") + (stack ? "\n" + stack : "");
      } catch (e) {}
    }
    function patchCatch() {
      if (!window.SceneManager || !SceneManager.catchException) return false;
      if (window.__rpgTrErrorPatched) return true;
      var orig = SceneManager.catchException;
      SceneManager.catchException = function (e) {
        try {
          var msg = (e && (e.message || e.toString())) || "unknown";
          showError(msg, e && e.stack);
          try {
            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.rpgTr) {
              window.webkit.messageHandlers.rpgTr.postMessage({ type: "gameError", message: msg, stack: (e && e.stack) || "" });
            }
          } catch (_) {}
        } catch (_) {}
        return orig.apply(this, arguments);
      };
      window.__rpgTrErrorPatched = true;
      return true;
    }
    try {
      window.addEventListener("error", function (ev) {
        showError(ev.message || "uncaught error", (ev.error && ev.error.stack) || "");
      });
    } catch (e) {}
    (function pollCatch() {
      if (!patchCatch() && !window.__rpgTrErrorPatched) setTimeout(pollCatch, 500);
    })();
  })();
})();
