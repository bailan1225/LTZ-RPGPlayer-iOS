(function () {
  'use strict';
  // 统一 MZ 媒体行为：初始化/解锁 AudioContext，监听媒体错误并尽量不中断游戏流程。

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
})();
