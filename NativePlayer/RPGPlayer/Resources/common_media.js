// Media Utilities (Common): MediaRecorder Polyfill

(function() {
    console.log("Initializing Common Media Polyfills...");

    // --- 音频安全补丁: 防止访问 undefined 对象的 .name 属性 ---
    // Fix: TypeError: undefined is not an object (evaluating 'currentBgs.name')
    function installAudioSafetyPatches() {
        if (typeof AudioManager === 'undefined') return false;

        try {
            if (!AudioManager.__arkBgsSafe) {
                // 1. 安全地获取 currentBgs，确保永远返回有 .name 的对象
                Object.defineProperty(AudioManager, 'currentBgs', {
                    get: function() {
                        return this._currentBgs || { name: '', volume: 1, pitch: 1, pan: 0 };
                    },
                    configurable: true,
                    enumerable: false
                });

                // 2. 拦截 findPlayingBgsIndex 调用，防止 bgs 参数为 undefined 时崩溃
                if (AudioManager.findPlayingBgsIndex) {
                    var origFind = AudioManager.findPlayingBgsIndex;
                    AudioManager.findPlayingBgsIndex = function(bgs, startingIndex) {
                        if (!bgs) return -1;
                        try {
                            return origFind.apply(this, arguments);
                        } catch(e) {
                            return -1;
                        }
                    };
                }

                // 3. 拦截 isBgsPlaying，确保即使 _currentBgs 为空也不崩溃
                if (AudioManager.isBgsPlaying) {
                    var origIsPlaying = AudioManager.isBgsPlaying;
                    AudioManager.isBgsPlaying = function() {
                        try {
                            var bgs = this._currentBgs;
                            if (!bgs) return false;
                            return origIsPlaying.call(this);
                        } catch(e) {
                            return false;
                        }
                    };
                }

                AudioManager.__arkBgsSafe = true;
                console.log('[Audio Safety] BGS safety patches installed');
            }
            return true;
        } catch (e) {
            console.warn('[Audio Safety] Cannot install BGS patches:', e);
            return false;
        }
    }

    // 立即尝试一次，然后定时重试
    if (!installAudioSafetyPatches()) {
        var retryCount = 0;
        var safetyInterval = setInterval(function() {
            retryCount++;
            if (installAudioSafetyPatches() || retryCount > 50) {
                clearInterval(safetyInterval);
            }
        }, 100);
    }

    // --- PictureLive2D 修复: 为插件自定义的音频对象添加安全 _sourceNode 属性 ---
    // Fix: TypeError: undefined is not an object (evaluating 'this._sourceNode.disconnect')
    // Fix: TypeError: undefined is not an object (evaluating 'd.playbackRate.value')
    //   Z_Wolfzq_Base.js 的 AudioManager.setShapePitch 读取 _sourceNode.playbackRate.value，
    //   SafeEmptySource 缺少该属性导致崩溃。添加带 value 的 playbackRate stub。
    (function() {
        // 覆盖 AudioBufferSourceNode 所有可能被引擎/插件访问的属性与方法：
        //   buffer, loop, loopStart, loopEnd        — rpg_core.js 直接赋值/读取
        //   playbackRate.value / .setValueAtTime()  — rpg_core.js & Z_Wolfzq_Base
        //   connect / disconnect / start / stop     — 节点生命周期
        var SafeEmptySource = {
            buffer: null,
            loop: false,
            loopStart: 0,
            loopEnd: 0,
            playbackRate: {
                value: 1,
                setValueAtTime: function() {}
            },
            connect: function() { return this; },
            disconnect: function() {},
            start: function() {},
            stop: function() {}
        };

        try {
            Object.defineProperty(Object.prototype, '_sourceNode', {
                get: function() {
                    if (this.hasOwnProperty('__sourceNode')) {
                        return this.__sourceNode !== undefined ? this.__sourceNode : SafeEmptySource;
                    }
                    return SafeEmptySource;
                },
                set: function(value) {
                    this.__sourceNode = value;
                },
                configurable: true,
                enumerable: false
            });
            console.log('[Audio Safety] _sourceNode polyfill installed');
        } catch (e) {
            console.warn('[Audio Safety] Cannot install _sourceNode polyfill:', e);
        }
    })();

    // --- MediaRecorder (MakeScreenMovie.js fix) ---
    if (typeof MediaRecorder === 'undefined') {
        window.MediaRecorder = class {
            constructor(stream, options) {
                this.stream = stream;
                this.options = options;
                this.state = 'inactive';
            }
            start() { this.state = 'recording'; }
            stop() { this.state = 'inactive'; if(this.onstop) this.onstop(); }
            pause() { this.state = 'paused'; }
            resume() { this.state = 'recording'; }
            requestData() {}
            static isTypeSupported(type) { return true; }
        };
    }
})();