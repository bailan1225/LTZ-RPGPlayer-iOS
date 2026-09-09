// mz_mac_audio.js — macOS WebKit OGG Vorbis 直接解码 polyfill
//
// 背景：macOS WebKit（包括 iOS 模拟器和 Designed for iPad 应用所使用的 WebKit）
// 不支持 AudioContext.decodeAudioData() 解码 OGG Vorbis，而 iOS 真机 WKWebView 支持。
// 本 polyfill 在 mac 环境下注入，使用 stbvorbis（纯 JS OGG 解码器）拦截
// decodeAudioData 调用，将 OGG 数据转为 AudioBuffer，无需服务端转码。
//
// 注意：本文件仅在 mac 环境（isiOSAppOnMac / Catalyst）由 Swift 层选择性注入。

(function () {
    'use strict';

    var LOG_PREFIX = '[MZ Mac Audio]';
    var STBVORBIS_LIB_URL = 'rpgmz://game/js/libs/stbvorbis_stream.js';

    // ─── OGG 文件头识别 ───────────────────────────────────────────────────────
    function isOggData(arrayBuffer) {
        if (!arrayBuffer || arrayBuffer.byteLength < 4) { return false; }
        var view = new Uint8Array(arrayBuffer, 0, 4);
        // OggS magic: 0x4F 0x67 0x67 0x53
        return view[0] === 0x4F && view[1] === 0x67 && view[2] === 0x67 && view[3] === 0x53;
    }

    // ─── 将 stbvorbis 流式解码结果合并为 AudioBuffer ─────────────────────────
    function decodeOggWithStbvorbis(context, arrayBuffer, successCb, errorCb) {
        var chunks = [];
        var sampleRate = 0;
        var numChannels = 0;

        try {
            stbvorbis.decode(arrayBuffer.slice(0), function (event) {
                if (event.error) {
                    var err = new Error(LOG_PREFIX + ' stbvorbis error: ' + event.error);
                    console.error(err.message);
                    if (errorCb) { errorCb(err); }
                    return;
                }
                if (event.data && event.data.length > 0) {
                    // 每次回调可含多个声道的 Float32Array 片段
                    if (sampleRate === 0) {
                        sampleRate = event.sampleRate;
                        numChannels = event.data.length;
                    }
                    chunks.push(event.data.map(function (ch) {
                        return ch.slice(0); // 复制，避免 stbvorbis 复用缓冲区
                    }));
                }
                if (event.eof) {
                    // 把所有片段拼接为单个 AudioBuffer
                    try {
                        var totalFrames = chunks.reduce(function (acc, c) { return acc + c[0].length; }, 0);
                        var audioBuffer = context.createBuffer(numChannels, totalFrames, sampleRate);
                        var offset = 0;
                        for (var i = 0; i < chunks.length; i++) {
                            for (var ch = 0; ch < numChannels; ch++) {
                                audioBuffer.getChannelData(ch).set(chunks[i][ch], offset);
                            }
                            offset += chunks[i][0].length;
                        }
                        console.log(LOG_PREFIX + ' decoded OGG: ' + numChannels + 'ch ' + sampleRate + 'Hz ' + totalFrames + ' frames');
                        if (successCb) { successCb(audioBuffer); }
                    } catch (e) {
                        console.error(LOG_PREFIX + ' AudioBuffer build failed: ' + e);
                        if (errorCb) { errorCb(e); }
                    }
                }
            });
        } catch (e) {
            console.error(LOG_PREFIX + ' stbvorbis.decode threw: ' + e);
            if (errorCb) { errorCb(e); }
        }
    }

    // ─── 补丁 decodeAudioData ──────────────────────────────────────────────────
    function patchDecodeAudioData() {
        if (AudioContext.prototype.decodeAudioData.__arkOggPatched) { return; }

        var _orig = AudioContext.prototype.decodeAudioData;
        AudioContext.prototype.decodeAudioData = function (arrayBuffer, successCb, errorCb) {
            var ctx = this;
            if (!isOggData(arrayBuffer)) {
                return _orig.call(ctx, arrayBuffer, successCb, errorCb);
            }

            // OGG 数据，先尝试 stbvorbis，失败则 fallback 到原生解码
            var promise = new Promise(function (resolve, reject) {
                decodeOggWithStbvorbis(
                    ctx,
                    arrayBuffer,
                    function (buf) { if (successCb) { successCb(buf); } resolve(buf); },
                    function (stbErr) {
                        console.warn(LOG_PREFIX + ' stbvorbis failed, falling back to native decodeAudioData: ' + stbErr);
                        try {
                            _orig.call(ctx, arrayBuffer,
                                function (buf) { if (successCb) { successCb(buf); } resolve(buf); },
                                function (nativeErr) { if (errorCb) { errorCb(nativeErr); } reject(nativeErr); }
                            );
                        } catch (e) {
                            if (errorCb) { errorCb(e); } reject(e);
                        }
                    }
                );
            });
            return promise;
        };
        AudioContext.prototype.decodeAudioData.__arkOggPatched = true;
        console.log(LOG_PREFIX + ' AudioContext.decodeAudioData patched for OGG (stbvorbis + native fallback)');
    }

    // ─── 确保 stbvorbis 已加载后打补丁 ───────────────────────────────────────
    function waitForStbvorbisAndPatch() {
        if (typeof stbvorbis !== 'undefined' && typeof stbvorbis.decode === 'function') {
            patchDecodeAudioData();
            return;
        }
        var attempts = 0;
        var iv = setInterval(function () {
            attempts++;
            if (typeof stbvorbis !== 'undefined' && typeof stbvorbis.decode === 'function') {
                clearInterval(iv);
                patchDecodeAudioData();
            } else if (attempts > 200) {
                clearInterval(iv);
                console.warn(LOG_PREFIX + ' stbvorbis not available after 10s, OGG playback on mac may fail');
            }
        }, 50);
    }

    // ─── 动态加载 stbvorbis（若游戏或 AudioStreaming 未自行加载）──────────────
    // stbvorbis_stream.js 由 scheme handler 从 bundle 提供，游戏目录中不存在。
    function loadStbvorbis() {
        if (typeof stbvorbis !== 'undefined') {
            waitForStbvorbisAndPatch();
            return;
        }
        var script = document.createElement('script');
        script.src = STBVORBIS_LIB_URL;
        script.onload = function () {
            console.log(LOG_PREFIX + ' stbvorbis loaded from bundle');
            waitForStbvorbisAndPatch();
        };
        script.onerror = function () {
            console.error(LOG_PREFIX + ' Failed to load stbvorbis from ' + STBVORBIS_LIB_URL);
        };
        (document.head || document.documentElement).appendChild(script);
    }

    // 入口：文档准备好后加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadStbvorbis);
    } else {
        loadStbvorbis();
    }
})();
