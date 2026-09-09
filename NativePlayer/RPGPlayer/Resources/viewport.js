/**
 * viewport.js
 * 设置 viewport meta，修正 body/html 全屏样式；
 * 注入全局 resumeAudioContext() 函数，并在 touch/click/keydown/pointerdown 上绑定，
 * 确保 iOS WebView AudioContext 在用户首次交互后可自动恢复。
 * 注入时机：atDocumentEnd（Phase 2）
 */
var meta = document.querySelector('meta[name="viewport"]');
if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'viewport';
    document.head.appendChild(meta);
}
meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';

var style = document.createElement('style');
style.innerHTML = 'body, html { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important; overflow: hidden !important; -webkit-touch-callout: none; -webkit-user-select: none; background-color: black !important; }';
document.head.appendChild(style);

var audioResumeScript = document.createElement('script');
audioResumeScript.innerHTML = [
    'function resumeAudioContext() {',
    '    if (window.AudioContext || window.webkitAudioContext) {',
    '        if (window._audioContexts) {',
    '            window._audioContexts.forEach(function(ctx) {',
    '                if (ctx.state === "suspended") {',
    '                    ctx.resume().catch(function(e){});',
    '                }',
    '            });',
    '        }',
    '        if (window.WebAudio && window.WebAudio._context && window.WebAudio._context.state === "suspended") {',
    '            window.WebAudio._context.resume().catch(function(e){});',
    '        }',
    '    }',
    '}',
    'document.addEventListener("touchstart", resumeAudioContext);',
    'document.addEventListener("click", resumeAudioContext);',
    'document.addEventListener("keydown", resumeAudioContext);',
    'document.addEventListener("pointerdown", resumeAudioContext);'
].join('\n');
document.head.appendChild(audioResumeScript);
