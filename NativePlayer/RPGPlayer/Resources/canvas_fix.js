/**
 * canvas_fix.js
 *
 * 解决"游戏画布小于 WebView / 窗口时，点击坐标偏移"的问题。
 *
 * ── 根本原因 ──────────────────────────────────────────────────────────
 *   Community_Basic 等插件把 canvas CSS 尺寸固定为游戏逻辑分辨率（如 745px），
 *   但 Graphics._realScale 仍按 window.innerWidth / gameWidth 计算（如 1.224）。
 *
 *   RPG Maker: pageToCanvasX(x) = (x - canvas.offsetLeft) / _realScale
 *
 *   实际比例 1.0，但 _realScale 1.224 → 坐标被缩小 → 点击偏左偏上。
 *
 * ── 修复 ──────────────────────────────────────────────────────────────
 *   1. 修补 Graphics._updateRealScale：改用 getBoundingClientRect 计算实际比例。
 *   2. 覆盖 Graphics.pageToCanvasX/Y：直接用 getBoundingClientRect 转换，
 *      作为双重保险（兼容不调用 _updateRealScale 的 MZ 版本）。
 *   3. 上报画布逻辑尺寸给 Mac 原生层（NSWindow 限制窗口大小用）。
 *
 * 注入时机：atDocumentEnd（Phase 2，在 viewport.js 之后）
 */
(function () {
    'use strict';

    function getCanvas() {
        if (typeof Graphics !== 'undefined' && Graphics._canvas) return Graphics._canvas;
        return document.querySelector('canvas');
    }

    // ────────────────────────────────────────────────────────────────────
    // 核心修复：修补 Graphics._updateRealScale 和 pageToCanvasX/Y
    // ────────────────────────────────────────────────────────────────────

    var realScalePatched = false;

    function patchGraphicsScale() {
        if (realScalePatched) return true;
        if (typeof Graphics === 'undefined') return false;

        realScalePatched = true;

        if (typeof Graphics._updateRealScale === 'function') {
            var origUpdateRealScale = Graphics._updateRealScale.bind(Graphics);
            Graphics._updateRealScale = function () {
                if (this._canvas) {
                    var rect = this._canvas.getBoundingClientRect();
                    if (rect.width > 0 && this._width > 0) {
                        this._realScale = rect.width / this._width;
                        return;
                    }
                }
                origUpdateRealScale();
            };
            Graphics._updateRealScale();
        }

        Graphics.pageToCanvasX = function (x) {
            if (this._canvas) {
                var rect = this._canvas.getBoundingClientRect();
                if (rect.width > 0 && this._width > 0) {
                    return Math.round((x - rect.left) * (this._width / rect.width));
                }
            }
            return 0;
        };
        Graphics.pageToCanvasY = function (y) {
            if (this._canvas) {
                var rect = this._canvas.getBoundingClientRect();
                if (rect.height > 0 && this._height > 0) {
                    return Math.round((y - rect.top) * (this._height / rect.height));
                }
            }
            return 0;
        };

        console.log('[CanvasFix] patched: realScale=' +
            (Graphics._realScale ? Graphics._realScale.toFixed(4) : '?') +
            ' canvas=' + (Graphics._width || '?') + 'x' + (Graphics._height || '?'));
        return true;
    }

    // ────────────────────────────────────────────────────────────────────
    // 上报画布逻辑尺寸（Mac NSWindow 限制用）
    // ────────────────────────────────────────────────────────────────────

    var sizeReported = false;

    function reportCanvasSize() {
        if (sizeReported) return;
        if (typeof Graphics === 'undefined') return;
        var w = 0, h = 0;
        if (typeof Graphics._width === 'number' && Graphics._width > 0) {
            w = Graphics._width; h = Graphics._height;
        } else if (typeof Graphics.width === 'number' && Graphics.width > 0) {
            w = Graphics.width; h = Graphics.height;
        }
        if (w <= 0 || h <= 0) return;
        sizeReported = true;
        try {
            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nativeBridge) {
                window.webkit.messageHandlers.nativeBridge.postMessage({ type: 'canvasSize', width: w, height: h });
                console.log('[CanvasFix] canvasSize reported: ' + w + 'x' + h);
            }
        } catch (e) {
            console.warn('[CanvasFix] canvasSize report failed: ' + e);
        }
    }

    // ────────────────────────────────────────────────────────────────────
    // 轮询：等待 Graphics 就绪
    // ────────────────────────────────────────────────────────────────────

    var pollCount = 0;
    var MAX_POLLS = 150; // 30s

    function poll() {
        pollCount++;
        patchGraphicsScale();
        reportCanvasSize();
        if ((!realScalePatched || !sizeReported) && pollCount < MAX_POLLS) {
            setTimeout(poll, 200);
        }
    }

    poll();
    document.addEventListener('DOMContentLoaded', poll);
    window.addEventListener('load', function () {
        setTimeout(poll, 500);
        setTimeout(poll, 1500);
    });
})();
