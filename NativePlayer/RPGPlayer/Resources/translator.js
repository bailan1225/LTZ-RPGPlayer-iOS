// RPG Player 内置翻译注入脚本（纯词典模式）
// 只做离线命中：TranslatorConfig 已把 translations/*.json + dict.json 合并注入到 window.RPG_T.dictionary。
// 无网络请求、无异步、无 localStorage 读写——错误面最小，MV/MZ 通用。
// 挂钩 Window_Base.drawTextEx（+ 可选 Bitmap.drawText），命中词典即同步替换文本，保留全部控制码。
(function () {
  "use strict";
  if (window.__rpgTrInjected) return;
  window.__rpgTrInjected = true;

  var cfg = window.RPG_T || {};
  var state = {
    enabled: !!cfg.enabled,
    translateUI: !!cfg.translateUI,
    dictionary: (cfg.dictionary && typeof cfg.dictionary === "object") ? cfg.dictionary : {},
    hits: 0,
    misses: 0
  };

  // 诊断：注入后 3 秒报告词典状态
  setTimeout(function () {
    try {
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.rpgTr) {
        window.webkit.messageHandlers.rpgTr.postMessage({
          type: "dictStatus",
          enabled: state.enabled,
          dictCount: Object.keys(state.dictionary).length,
          hits: state.hits,
          misses: state.misses
        });
      }
    } catch (e) {}
  }, 3000);

  function norm(s) { return String(s).replace(/\s+/g, " ").trim(); }

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

  // 命中词典则返回替换后的文本，否则返回 null（保持原文）
  function applyText(text) {
    if (!state.enabled || typeof text !== "string" || !/[^\s\\]/.test(text)) return null;
    var parts = splitParts(text);
    var plain = plainOf(parts);
    var normed = norm(plain);
    if (!normed) return null;
    // 多级匹配：标准化后 → 原文 → 去除首尾空白
    var hit = dictGet(normed) || dictGet(plain) || dictGet(plain.trim()) || dictGet(normed.trim());
    if (typeof hit !== "string") {
      state.misses++;
      return null;
    }
    state.hits++;
    var out = recombine(parts, hit);
    return (out && out !== text) ? out : null;
  }

  function patchDrawTextEx() {
    if (window.__rpgTrPatched) return true;
    if (!window.Window_Base) return false;
    var orig = Window_Base.prototype.drawTextEx;
    if (typeof orig !== "function") return false;

    Window_Base.prototype.drawTextEx = function (text, x, y) {
      try {
        var out = applyText(text);
        return orig.call(this, (out || text), x, y);
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
        var out = applyText(text);
        return orig.call(this, (out || text), x, y, maxWidth, lineHeight, align);
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
    resetSession: function () { /* 纯词典模式无会话状态 */ },
    getState: function () {
      return { enabled: state.enabled, mode: "dict", dictCount: Object.keys(state.dictionary).length };
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
