// === Common Polyfills Bundle (merged from 7 files) ===
// Order: core -> crypto -> fs -> media -> syncXHR -> pixiTextureFix -> audio

/* === common_core.js === */
// Core Polyfills: Process, Environment, PIXI Safety

// --- Utils.isNwjs 同步拦截器（必须在 IIFE 外、document start 最早执行）---
// 问题根源：
//   common_fs.js 安装了 window.require（模块兼容性需要）且设置了 window.process，
//   导致 RPG Maker MV Utils.isNwjs() = typeof require==='function' && typeof process==='object' = true。
//   游戏因此走 NW.js 分支，调用 require('nw.gui')，返回的空对象上 .Window.get() 报 TypeError。
//
// 修复策略：
//   用 Object.defineProperty 拦截 window.Utils 的赋值（rpg_core.js 在 document 加载时同步执行），
//   在 Utils 刚被定义的那一刻立即覆盖 isNwjs，无需轮询，无竞争条件。
//
// 注意：var 声明会触发属性赋值（setter），即使 rpg_core.js 用 var Utils = function(){...} 也适用。
(function() {
    if (typeof window.Utils !== 'undefined') {
        // 极少数情况：Utils 已先于此脚本定义，直接 patch
        if (!window.Utils.__ark_isNwjsPatch) {
            window.Utils.isNwjs = function() { return false; };
            window.Utils.__ark_isNwjsPatch = true;
            console.log('[Polyfill] Utils.isNwjs patched immediately (already defined)');
        }
        return;
    }
    var _Utils;
    Object.defineProperty(window, 'Utils', {
        configurable: true,
        enumerable: true,
        get: function() { return _Utils; },
        set: function(val) {
            _Utils = val;
            if (val && !val.__ark_isNwjsPatch) {
                val.isNwjs = function() { return false; };
                val.__ark_isNwjsPatch = true;
                console.log('[Polyfill] Utils.isNwjs patched synchronously via property interceptor');
            }
        }
    });
    console.log('[Polyfill] Utils.isNwjs interceptor installed');
})();

(function() {
    console.log("Initializing RPGMV Emulator Core Polyfills...");

    // --- PIXI WebGL Renderer 崩溃安全修复 ---
    // 问题：PIXI.Renderer / PIXI.WebGLRenderer 创建失败被 try/catch 静默吞掉，
    //       导致 Graphics._renderer = null，游戏进入死循环渲染失败（黑屏）
    // 修复：拦截 PIXI 渲染器构造函数，失败时回退到 CanvasRenderer
    (function patchPIXIRenderer() {
        function tryPatch() {
            if (typeof PIXI === 'undefined') {
                setTimeout(tryPatch, 100);
                return;
            }
            if (PIXI.__ark_rendererPatched) return;
            PIXI.__ark_rendererPatched = true;

            // PIXI v5+ uses PIXI.Renderer
            if (typeof PIXI.Renderer !== 'undefined' && !PIXI.Renderer.__ark_patched) {
                var OrigRenderer = PIXI.Renderer;
                PIXI.Renderer = function(options) {
                    try {
                        var inst = new OrigRenderer(options);
                        console.log('[PIXIPatch] PIXI.Renderer created OK');
                        return inst;
                    } catch (e) {
                        console.error('[PIXIPatch] PIXI.Renderer failed:', e.message, '→ falling back to CanvasRenderer');
                        if (typeof PIXI.CanvasRenderer !== 'undefined') {
                            try { return new PIXI.CanvasRenderer(options); } catch (e2) { console.error('[PIXIPatch] CanvasRenderer also failed:', e2); }
                        }
                        // 返回安全空对象，阻止 _renderer=null 死循环
                        return {
                            type: -1,
                            view: document.createElement('canvas'),
                            render: function() {},
                            resize: function() {},
                            destroy: function() {},
                            plugins: {},
                            gl: null
                        };
                    }
                };
                Object.keys(OrigRenderer).forEach(function(k) { PIXI.Renderer[k] = OrigRenderer[k]; });
                PIXI.Renderer.prototype = OrigRenderer.prototype;
                PIXI.Renderer.__ark_patched = true;
                console.log('[PIXIPatch] PIXI.Renderer patched with fallback');
            }

            // PIXI v4 uses PIXI.WebGLRenderer
            if (typeof PIXI.WebGLRenderer !== 'undefined' && !PIXI.WebGLRenderer.__ark_patched) {
                var OrigWebGLRenderer = PIXI.WebGLRenderer;
                PIXI.WebGLRenderer = function(width, height, options) {
                    try {
                        return new OrigWebGLRenderer(width, height, options);
                    } catch (e) {
                        console.error('[PIXIPatch] PIXI.WebGLRenderer failed:', e.message, '→ CanvasRenderer');
                        if (typeof PIXI.CanvasRenderer !== 'undefined') {
                            try { return new PIXI.CanvasRenderer(width, height, options); } catch (e2) {}
                        }
                        return {
                            type: -1,
                            view: document.createElement('canvas'),
                            render: function() {},
                            resize: function() {},
                            destroy: function() {},
                            gl: null
                        };
                    }
                };
                Object.keys(OrigWebGLRenderer).forEach(function(k) { PIXI.WebGLRenderer[k] = OrigWebGLRenderer[k]; });
                PIXI.WebGLRenderer.prototype = OrigWebGLRenderer.prototype;
                PIXI.WebGLRenderer.__ark_patched = true;
                console.log('[PIXIPatch] PIXI.WebGLRenderer patched with fallback');
            }
        }
        tryPatch();
        document.addEventListener('DOMContentLoaded', tryPatch);
    })();

    // --- ModManager 早期 Stub ---
    // main.js 在 window.onload 里调用 ModManager.getModsList().then(...)
    // 若 modManager.js 尚未加载完成，此调用会 throw。
    // Stub 让 promise 链正常建立，真实 ModManager 加载后会覆盖此 stub。
    if (typeof window.ModManager === 'undefined') {
        window.ModManager = {
            _isStub: true,
            getModsList: function() {
                console.log('[ModManagerStub] getModsList called');
                return Promise.resolve([]);
            },
            loadMods: function() {
                return Promise.resolve();
            },
            setParameters: function() {}
        };
        console.log('[ModManagerStub] Early stub installed');
    }

    // --- StorageManager.isLocalMode 修复 ---
    // 注意：Utils.isNwjs 已由文件顶部的 Object.defineProperty 拦截器同步 patch（无竞争条件）。
    // 此处仅修复 StorageManager.isLocalMode，轮询等待 StorageManager 定义后执行。
    (function patchStorageManagerLocalMode() {
        function applyPatch() {
            if (typeof StorageManager === 'undefined') return false;
            if (StorageManager.__ark_localModePatch) return true;
            StorageManager.isLocalMode = function() { return false; };
            StorageManager.__ark_localModePatch = true;
            console.log('[StorageFix] StorageManager.isLocalMode patched → always false');
            return true;
        }
        if (!applyPatch()) {
            var attempts = 0;
            var iv = setInterval(function() {
                attempts++;
                if (applyPatch() || attempts > 300) clearInterval(iv);
            }, 50);
        }
    })();

    // --- PIXI.DisplayObject.prototype.removeStageReference 缺失补丁 ---
    // 背景：pixi.js v3 的 removeStageReference 仅定义在 DisplayObjectContainer.prototype，
    //       基类 DisplayObject 只有 setStageReference，没有对应的 remove 版本。
    //       当场景树中存在纯 DisplayObject（非 Container）子节点时，
    //       递归调用 removeStageReference 会抛出 "not a function" 错误。
    //
    // 注意：此 polyfill 仅针对基类 PIXI.DisplayObject.prototype，
    //       不覆写 DisplayObjectContainer.prototype.removeStageReference（那是 7f6b2a1 已明确删除的覆写）。
    //       BaseSchemeHandler.patchPixiJS() 在源码层的字符串替换形成双重防护（已修复 CRLF 匹配问题）。
    (function installPixiDisplayObjectRemoveStageRefPolyfill() {
        function apply() {
            if (typeof PIXI === 'undefined' || !PIXI.DisplayObject) return false;
            // 只在基类缺少该方法时补充，不影响 DisplayObjectContainer 原型链上已有的实现
            if (!PIXI.DisplayObject.prototype.removeStageReference) {
                PIXI.DisplayObject.prototype.removeStageReference = function() {
                    this.stage = null;
                };
                console.log('[PixiFix] PIXI.DisplayObject.prototype.removeStageReference polyfilled');
            }
            return true;
        }
        if (!apply()) {
            var _pixiRsrAttempts = 0;
            var _pixiRsrIv = setInterval(function() {
                _pixiRsrAttempts++;
                if (apply() || _pixiRsrAttempts > 300) clearInterval(_pixiRsrIv);
            }, 50);
        }
    })();

    // --- Process Mock (Node.js compatibility) ---
    if (typeof window.process === 'undefined') {
        window.process = {
            // 插件用 process.title !== 'browser' 判定 Node 环境（如 LN_FilmicFilter），
            // 缺省会让 WebView 被误判为 Node 而走 fs 分支崩溃
            title: 'browser',
            platform: 'darwin', // 伪装成 macOS
            versions: {},
            mainModule: { filename: 'index.html' },
            argv: ['index.html', ''],
            execPath: 'index.html',
            env: {
                NODE_ENV: 'production',
                STEAM_DECK: '0'
            },
            browser: true,
            arch: 'arm64',
            cwd: function() { return '.'; },
            _events: {},
            on: function(event, listener) {
                if (typeof listener !== 'function') return;
                this._events[event] = this._events[event] || [];
                this._events[event].push(listener);
            },
            addListener: function(event, listener) { this.on(event, listener); },
            once: function(event, listener) {
                var self = this;
                if (typeof listener !== 'function') return;
                function wrapper() {
                    try { listener.apply(null, arguments); } catch (e) { console.error(e); }
                    self.removeListener(event, wrapper);
                }
                this.on(event, wrapper);
            },
            removeListener: function(event, listener) {
                var list = this._events[event];
                if (!list) return;
                var idx = list.indexOf(listener);
                if (idx !== -1) list.splice(idx, 1);
            },
            off: function(event, listener) { this.removeListener(event, listener); },
            removeAllListeners: function(event) {
                if (event) this._events[event] = [];
                else this._events = {};
            },
            emit: function(event) {
                var list = this._events[event];
                if (!list || list.length === 0) return false;
                var args = Array.prototype.slice.call(arguments, 1);
                list.slice().forEach(function(fn) {
                    try { fn.apply(null, args); } catch (e) { console.error('[Polyfill] process event handler error', e); }
                });
                return true;
            },
            exit: function(code) { console.warn('[Polyfill] process.exit(' + (code || 0) + ') suppressed in WebView'); },
            nextTick: function(cb) { if (typeof cb === 'function') return setTimeout(cb, 0); },
            hrtime: function(prev) {
                var nowMs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
                var seconds = Math.floor(nowMs / 1000);
                var nanoseconds = Math.floor((nowMs - seconds * 1000) * 1e6);
                if (prev && Array.isArray(prev) && prev.length === 2) {
                    var sec = seconds - prev[0];
                    var nsec = nanoseconds - prev[1];
                    if (nsec < 0) {
                        sec -= 1;
                        nsec += 1e9;
                    }
                    return [sec, nsec];
                }
                return [seconds, nanoseconds];
            }
        };
    }

    // --- Game_Interpreter.command355 (Script Command) Safety Wrapper ---
    // Fix for: eval code@ error when executing Script commands
    // This wrapper provides better error diagnostics for debugging
    (function() {
        var retries = 0;
        function patchCommand355() {
            if (typeof Game_Interpreter === 'undefined' || !Game_Interpreter.prototype.command355) {
                retries++;
                if (retries > 50) {
                    console.warn('[ScriptSafety] Game_Interpreter.command355 not found after 5s, giving up');
                    return;
                }
                setTimeout(patchCommand355, 100);
                return;
            }

            // Don't patch twice
            if (Game_Interpreter.prototype.command355.__ark_patched) return;

            var origCommand355 = Game_Interpreter.prototype.command355;
            Game_Interpreter.prototype.command355 = function() {
                var args = arguments;
                var command = this.currentCommand();
                if (command && command.code === 355) {
                    var script = command.parameters[0];
                    try {
                        return origCommand355.apply(this, args);
                    } catch (e) {
                        console.error('[ArkRPG] Script command error:');
                        console.error('  Error:', e.message || e);
                        console.error('  Script content:', JSON.stringify(script));
                        console.error('  Event ID:', this._eventId);
                        console.error('  Command index:', this._index);
                        if (e.stack) {
                            console.error('  Stack:', e.stack.split('\n').slice(0, 5).join('\n'));
                        }
                        throw e;
                    }
                }
                return origCommand355.apply(this, args);
            };
            Game_Interpreter.prototype.command355.__ark_patched = true;
            console.log('[ScriptSafety] command355 safety wrapper applied');
        }

        // Try immediately
        patchCommand355();
        // Also retry after DOM loads
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', patchCommand355);
        }
    })();
})();


/* === common_crypto.js === */
// common_crypto.js
// Polyfill for Node's `crypto` module in WebView environments.
// Provides: createHash (SHA-256), createCipheriv/createDecipheriv (AES-CBC).
(function(){
  var root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this);
  if (!root) return;
  var DIAG_PREFIX = '[ArkCryptoDiag]';
  var webCrypto = root.crypto || {};
  var nodeCrypto = root.__arkNodeCrypto = root.__arkNodeCrypto || {};
  if (!nodeCrypto.webcrypto) nodeCrypto.webcrypto = webCrypto;
  if (!nodeCrypto.subtle && webCrypto.subtle) nodeCrypto.subtle = webCrypto.subtle;
  if (!nodeCrypto.getRandomValues && webCrypto.getRandomValues) {
    nodeCrypto.getRandomValues = function(arr) { return webCrypto.getRandomValues(arr); };
  }
  if (!nodeCrypto.randomUUID) {
    if (webCrypto.randomUUID) {
      nodeCrypto.randomUUID = function() { return webCrypto.randomUUID(); };
    } else {
      nodeCrypto.randomUUID = function() {
        var b = new Uint8Array(16);
        if (nodeCrypto.getRandomValues) nodeCrypto.getRandomValues(b);
        else {
          for (var i = 0; i < 16; i++) b[i] = (Math.random() * 256) | 0;
        }
        b[6] = (b[6] & 0x0f) | 0x40;
        b[8] = (b[8] & 0x3f) | 0x80;
        var h = [];
        for (var i = 0; i < b.length; i++) h.push((b[i] + 0x100).toString(16).slice(1));
        return h[0]+h[1]+h[2]+h[3]+'-'+h[4]+h[5]+'-'+h[6]+h[7]+'-'+h[8]+h[9]+'-'+h[10]+h[11]+h[12]+h[13]+h[14]+h[15];
      };
    }
  }
  // Some runtimes provide a partial or non-extensible window.crypto; keep Node-style methods on nodeCrypto.

  // Minimal, self-contained SHA-256 implementation (synchronous)
  function sha256(ascii) {
    function rightRotate(value, amount) {
      return (value>>>amount) | (value<<(32-amount));
    }

    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length'
    var i, j;
    var result = ''

    var words = [];
    var asciiBitLength = ascii[lengthProperty]*8;

    var K = [
      0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
      0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
      0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
      0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
      0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
      0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
      0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
      0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
    ];

    var H = [
      0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19
    ];

    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return;
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }

    words[asciiBitLength >> 5] |= 0x80 << (24 - asciiBitLength % 32);
    words[((asciiBitLength + 64 >> 9) << 4) + 15] = asciiBitLength;

    var w = new Array(64);
    for (var blockStart = 0; blockStart < words.length; blockStart += 16) {
      for (i = 0; i < 16; i++) w[i] = words[blockStart + i] | 0;
      for (i = 16; i < 64; i++) {
        var s0 = rightRotate(w[i-15], 7) ^ rightRotate(w[i-15], 18) ^ (w[i-15] >>> 3);
        var s1 = rightRotate(w[i-2], 17) ^ rightRotate(w[i-2], 19) ^ (w[i-2] >>> 10);
        w[i] = (w[i-16] + s0 + w[i-7] + s1) | 0;
      }

      var a = H[0]; var b = H[1]; var c = H[2]; var d = H[3];
      var e = H[4]; var f = H[5]; var g = H[6]; var h = H[7];

      for (i = 0; i < 64; i++) {
        var S1 = rightRotate(e,6) ^ rightRotate(e,11) ^ rightRotate(e,25);
        var ch = (e & f) ^ (~e & g);
        var temp1 = (h + S1 + ch + K[i] + w[i]) | 0;
        var S0 = rightRotate(a,2) ^ rightRotate(a,13) ^ rightRotate(a,22);
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var temp2 = (S0 + maj) | 0;

        h = g; g = f; f = e; e = (d + temp1) | 0;
        d = c; c = b; b = a; a = (temp1 + temp2) | 0;
      }

      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0;
      H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0;
      H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }

    for (i = 0; i < H.length; i++) {
      for (j = 3; j + 1; j--) {
        var bv = (H[i] >> (j * 8)) & 255;
        var hex = (bv < 16 ? '0' : '') + bv.toString(16);
        result += hex;
      }
    }
    return result;
  }

  function hexToBase64(hex) {
    var bytes = [];
    for (var i = 0; i < hex.length; i += 2) {
      bytes.push(String.fromCharCode(parseInt(hex.substr(i, 2), 16)));
    }
    var bin = bytes.join('');
    if (typeof root.btoa === 'function') return root.btoa(bin);
    if (typeof Buffer !== 'undefined') return Buffer.from(bin, 'binary').toString('base64');
    if (typeof btoa === 'function') return btoa(bin);
    try {
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      var i = 0, len = bin.length, out = '';
      while (i < len) {
        var c1 = bin.charCodeAt(i++) & 0xff;
        if (i == len) { out += chars.charAt(c1 >> 2); out += chars.charAt((c1 & 0x3) << 4); out += '=='; break; }
        var c2 = bin.charCodeAt(i++);
        if (i == len) { out += chars.charAt(c1 >> 2); out += chars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4)); out += chars.charAt((c2 & 0xF) << 2); out += '='; break; }
        var c3 = bin.charCodeAt(i++);
        out += chars.charAt(c1 >> 2); out += chars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += chars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6)); out += chars.charAt(c3 & 0x3F);
      }
      return out;
    } catch (e) { return ''; }
  }

  // crypto.createHash
  if (!nodeCrypto.createHash) nodeCrypto.createHash = function(alg) {
    alg = String(alg || '').toLowerCase();
    var acc = '';
    return {
      update: function(data, inputEncoding) {
        if (typeof data === 'string') {
          acc += data;
        } else if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
          var u = data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
          var s = '';
          for (var i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
          acc += s;
        } else if (data && data.toString) {
          acc += data.toString();
        }
        return this;
      },
      digest: function(enc) {
        enc = enc || 'hex';
        var hex = sha256(acc);
        if (enc === 'hex') return hex;
        if (enc === 'base64') return hexToBase64(hex);
        if (enc === 'binary') {
          var out = new Uint8Array(hex.length/2);
          for (var i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i*2,2),16);
          return out;
        }
        return hex;
      }
    };
  };

  // --- AES-CBC cipher/decipher support ---
  var _AES_S = [
    0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
    0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
    0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
    0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
    0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
    0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
    0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
    0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
    0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
    0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
    0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
    0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
    0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
    0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
    0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
    0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16
  ];
  var _AES_SI = [
    0x52,0x09,0x6a,0xd5,0x30,0x36,0xa5,0x38,0xbf,0x40,0xa3,0x9e,0x81,0xf3,0xd7,0xfb,
    0x7c,0xe3,0x39,0x82,0x9b,0x2f,0xff,0x87,0x34,0x8e,0x43,0x44,0xc4,0xde,0xe9,0xcb,
    0x54,0x7b,0x94,0x32,0xa6,0xc2,0x23,0x3d,0xee,0x4c,0x95,0x0b,0x42,0xfa,0xc3,0x4e,
    0x08,0x2e,0xa1,0x66,0x28,0xd9,0x24,0xb2,0x76,0x5b,0xa2,0x49,0x6d,0x8b,0xd1,0x25,
    0x72,0xf8,0xf6,0x64,0x86,0x68,0x98,0x16,0xd4,0xa4,0x5c,0xcc,0x5d,0x65,0xb6,0x92,
    0x6c,0x70,0x48,0x50,0xfd,0xed,0xb9,0xda,0x5e,0x15,0x46,0x57,0xa7,0x8d,0x9d,0x84,
    0x90,0xd8,0xab,0x00,0x8c,0xbc,0xd3,0x0a,0xf7,0xe4,0x58,0x05,0xb8,0xb3,0x45,0x06,
    0xd0,0x2c,0x1e,0x8f,0xca,0x3f,0x0f,0x02,0xc1,0xaf,0xbd,0x03,0x01,0x13,0x8a,0x6b,
    0x3a,0x91,0x11,0x41,0x4f,0x67,0xdc,0xea,0x97,0xf2,0xcf,0xce,0xf0,0xb4,0xe6,0x73,
    0x96,0xac,0x74,0x22,0xe7,0xad,0x35,0x85,0xe2,0xf9,0x37,0xe8,0x1c,0x75,0xdf,0x6e,
    0x47,0xf1,0x1a,0x71,0x1d,0x29,0xc5,0x89,0x6f,0xb7,0x62,0x0e,0xaa,0x18,0xbe,0x1b,
    0xfc,0x56,0x3e,0x4b,0xc6,0xd2,0x79,0x20,0x9a,0xdb,0xc0,0xfe,0x78,0xcd,0x5a,0xf4,
    0x1f,0xdd,0xa8,0x33,0x88,0x07,0xc7,0x31,0xb1,0x12,0x10,0x59,0x27,0x80,0xec,0x5f,
    0x60,0x51,0x7f,0xa9,0x19,0xb5,0x4a,0x0d,0x2d,0xe5,0x7a,0x9f,0x93,0xc9,0x9c,0xef,
    0xa0,0xe0,0x3b,0x4d,0xae,0x2a,0xf5,0xb0,0xc8,0xeb,0xbb,0x3c,0x83,0x53,0x99,0x61,
    0x17,0x2b,0x04,0x7e,0xba,0x77,0xd6,0x26,0xe1,0x69,0x14,0x63,0x55,0x21,0x0c,0x7d
  ];
  var _AES_RC = [0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36];

  function _aes_xt(a) { return ((a << 1) ^ (((a >>> 7) & 1) * 0x1b)) & 0xff; }

  function _aes_gm(a, b) {
    var p = 0;
    for (var i = 0; i < 8; i++) {
      if (b & 1) p ^= a;
      var hi = a & 0x80;
      a = (a << 1) & 0xff;
      if (hi) a ^= 0x1b;
      b >>>= 1;
    }
    return p;
  }

  function _aes_expand(key) {
    var kl = key.length, nk = kl >> 2, nr = nk + 6, tw = 4 * (nr + 1);
    var w = new Uint8Array(tw * 4);
    for (var i = 0; i < kl; i++) w[i] = key[i];
    for (var i = nk; i < tw; i++) {
      var t0 = w[(i-1)*4], t1 = w[(i-1)*4+1], t2 = w[(i-1)*4+2], t3 = w[(i-1)*4+3];
      if (i % nk === 0) {
        var u = t0; t0 = _AES_S[t1]; t1 = _AES_S[t2]; t2 = _AES_S[t3]; t3 = _AES_S[u];
        t0 ^= _AES_RC[(i / nk - 1) | 0];
      } else if (nk > 6 && i % nk === 4) {
        t0 = _AES_S[t0]; t1 = _AES_S[t1]; t2 = _AES_S[t2]; t3 = _AES_S[t3];
      }
      w[i*4]   = w[(i-nk)*4]   ^ t0;
      w[i*4+1] = w[(i-nk)*4+1] ^ t1;
      w[i*4+2] = w[(i-nk)*4+2] ^ t2;
      w[i*4+3] = w[(i-nk)*4+3] ^ t3;
    }
    return w;
  }

  function _aes_encBlock(block, rk, nr) {
    var s = new Uint8Array(block);
    var i, r, t;
    for (i = 0; i < 16; i++) s[i] ^= rk[i];
    for (r = 1; r < nr; r++) {
      var o = r * 16;
      for (i = 0; i < 16; i++) s[i] = _AES_S[s[i]];
      t = s[1]; s[1] = s[5]; s[5] = s[9]; s[9] = s[13]; s[13] = t;
      t = s[2]; s[2] = s[10]; s[10] = t; t = s[6]; s[6] = s[14]; s[14] = t;
      t = s[15]; s[15] = s[11]; s[11] = s[7]; s[7] = s[3]; s[3] = t;
      for (i = 0; i < 16; i += 4) {
        var a = s[i], b = s[i+1], c = s[i+2], d = s[i+3];
        s[i]   = _aes_xt(a) ^ (_aes_xt(b) ^ b) ^ c ^ d;
        s[i+1] = a ^ _aes_xt(b) ^ (_aes_xt(c) ^ c) ^ d;
        s[i+2] = a ^ b ^ _aes_xt(c) ^ (_aes_xt(d) ^ d);
        s[i+3] = (_aes_xt(a) ^ a) ^ b ^ c ^ _aes_xt(d);
      }
      for (i = 0; i < 16; i++) s[i] ^= rk[o + i];
    }
    for (i = 0; i < 16; i++) s[i] = _AES_S[s[i]];
    t = s[1]; s[1] = s[5]; s[5] = s[9]; s[9] = s[13]; s[13] = t;
    t = s[2]; s[2] = s[10]; s[10] = t; t = s[6]; s[6] = s[14]; s[14] = t;
    t = s[15]; s[15] = s[11]; s[11] = s[7]; s[7] = s[3]; s[3] = t;
    for (i = 0; i < 16; i++) s[i] ^= rk[nr * 16 + i];
    return s;
  }

  function _aes_decBlock(block, rk, nr) {
    var s = new Uint8Array(block);
    var i, r, t;
    for (i = 0; i < 16; i++) s[i] ^= rk[nr * 16 + i];
    for (r = nr - 1; r > 0; r--) {
      var o = r * 16;
      t = s[13]; s[13] = s[9]; s[9] = s[5]; s[5] = s[1]; s[1] = t;
      t = s[2]; s[2] = s[10]; s[10] = t; t = s[6]; s[6] = s[14]; s[14] = t;
      t = s[3]; s[3] = s[7]; s[7] = s[11]; s[11] = s[15]; s[15] = t;
      for (i = 0; i < 16; i++) s[i] = _AES_SI[s[i]];
      for (i = 0; i < 16; i++) s[i] ^= rk[o + i];
      for (i = 0; i < 16; i += 4) {
        var a = s[i], b = s[i+1], c = s[i+2], d = s[i+3];
        s[i]   = _aes_gm(a,14) ^ _aes_gm(b,11) ^ _aes_gm(c,13) ^ _aes_gm(d,9);
        s[i+1] = _aes_gm(a,9)  ^ _aes_gm(b,14) ^ _aes_gm(c,11) ^ _aes_gm(d,13);
        s[i+2] = _aes_gm(a,13) ^ _aes_gm(b,9)  ^ _aes_gm(c,14) ^ _aes_gm(d,11);
        s[i+3] = _aes_gm(a,11) ^ _aes_gm(b,13) ^ _aes_gm(c,9)  ^ _aes_gm(d,14);
      }
    }
    t = s[13]; s[13] = s[9]; s[9] = s[5]; s[5] = s[1]; s[1] = t;
    t = s[2]; s[2] = s[10]; s[10] = t; t = s[6]; s[6] = s[14]; s[14] = t;
    t = s[3]; s[3] = s[7]; s[7] = s[11]; s[11] = s[15]; s[15] = t;
    for (i = 0; i < 16; i++) s[i] = _AES_SI[s[i]];
    for (i = 0; i < 16; i++) s[i] ^= rk[i];
    return s;
  }

  function _toU8(d) {
    if (d instanceof Uint8Array) return d;
    if (typeof d === 'string') return new TextEncoder().encode(d);
    if (d && d._bytes) {
      var b = new Uint8Array(d.length);
      for (var i = 0; i < d.length; i++) b[i] = (d[i] !== undefined ? d[i] : d._bytes[i]) & 0xff;
      return b;
    }
    if (Array.isArray(d)) return new Uint8Array(d);
    if (d && typeof d.length === 'number') {
      var b = new Uint8Array(d.length);
      for (var i = 0; i < d.length; i++) b[i] = d[i] & 0xff;
      return b;
    }
    return new Uint8Array(0);
  }

  function _makeBuf(bytes) {
    if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
      return Buffer.from(bytes);
    }
    var o = { length: bytes.length, _bytes: new Uint8Array(bytes) };
    for (var i = 0; i < bytes.length; i++) o[i] = bytes[i];
    return o;
  }

  function _aes_cbcEnc(data, key, iv) {
    var kb = _toU8(key), ivb = _toU8(iv);
    var nr = (kb.length >> 2) + 6, rk = _aes_expand(kb);
    var pad = 16 - (data.length % 16);
    var p = new Uint8Array(data.length + pad);
    p.set(data);
    for (var i = data.length; i < p.length; i++) p[i] = pad;
    var out = new Uint8Array(p.length), prev = ivb;
    for (var i = 0; i < p.length; i += 16) {
      for (var j = 0; j < 16; j++) p[i + j] ^= prev[j];
      var enc = _aes_encBlock(p.subarray(i, i + 16), rk, nr);
      out.set(enc, i);
      prev = enc;
    }
    return out;
  }

  function _aes_cbcDec(data, key, iv) {
    var kb = _toU8(key), ivb = _toU8(iv);
    var nr = (kb.length >> 2) + 6, rk = _aes_expand(kb);
    var out = new Uint8Array(data.length), prev = ivb;
    for (var i = 0; i < data.length; i += 16) {
      var blk = data.subarray(i, i + 16);
      var dec = _aes_decBlock(blk, rk, nr);
      for (var j = 0; j < 16; j++) out[i + j] = dec[j] ^ prev[j];
      prev = new Uint8Array(blk);
    }
    var pad = out[out.length - 1];
    if (pad >= 1 && pad <= 16) {
      var valid = true;
      for (var i = out.length - pad; i < out.length; i++) {
        if (out[i] !== pad) { valid = false; break; }
      }
      if (valid) out = out.subarray(0, out.length - pad);
    }
    return out;
  }

  function _parseAESCBC(algorithm) {
    var m = /^aes-(128|192|256)-cbc$/i.exec(algorithm);
    if (!m) return 0;
    return parseInt(m[1]) >> 3;
  }

  if (!nodeCrypto.createCipheriv) nodeCrypto.createCipheriv = function(algorithm, key, iv) {
    var kl = _parseAESCBC(algorithm);
    if (!kl) throw new Error('Unsupported cipher: ' + algorithm);
    var kb = _toU8(key), ivb = _toU8(iv), chunks = [];
    return {
      update: function(data) { chunks.push(_toU8(data)); return _makeBuf(new Uint8Array(0)); },
      final: function() {
        var total = 0;
        for (var i = 0; i < chunks.length; i++) total += chunks[i].length;
        var all = new Uint8Array(total), off = 0;
        for (var i = 0; i < chunks.length; i++) { all.set(chunks[i], off); off += chunks[i].length; }
        chunks = [];
        return _makeBuf(_aes_cbcEnc(all, kb, ivb));
      }
    };
  };

  if (!nodeCrypto.createDecipheriv) nodeCrypto.createDecipheriv = function(algorithm, key, iv) {
    var kl = _parseAESCBC(algorithm);
    if (!kl) throw new Error('Unsupported cipher: ' + algorithm);
    var kb = _toU8(key), ivb = _toU8(iv), chunks = [];
    return {
      update: function(data) { chunks.push(_toU8(data)); return _makeBuf(new Uint8Array(0)); },
      final: function() {
        var total = 0;
        for (var i = 0; i < chunks.length; i++) total += chunks[i].length;
        var all = new Uint8Array(total), off = 0;
        for (var i = 0; i < chunks.length; i++) { all.set(chunks[i], off); off += chunks[i].length; }
        chunks = [];
        return _makeBuf(_aes_cbcDec(all, kb, ivb));
      }
    };
  };

  // Best-effort mirror for legacy code that directly accesses window.crypto.createHash/createDecipheriv.
  if (webCrypto && webCrypto !== nodeCrypto) {
    try {
      if (!webCrypto.createHash && nodeCrypto.createHash) webCrypto.createHash = nodeCrypto.createHash;
      if (!webCrypto.createCipheriv && nodeCrypto.createCipheriv) webCrypto.createCipheriv = nodeCrypto.createCipheriv;
      if (!webCrypto.createDecipheriv && nodeCrypto.createDecipheriv) webCrypto.createDecipheriv = nodeCrypto.createDecipheriv;
    } catch (e) {}
  }

  try {
    console.log(
      DIAG_PREFIX + ' init',
      'nodeCrypto.createHash=' + typeof nodeCrypto.createHash,
      'nodeCrypto.createCipheriv=' + typeof nodeCrypto.createCipheriv,
      'nodeCrypto.createDecipheriv=' + typeof nodeCrypto.createDecipheriv,
      'webCrypto.createHash=' + typeof webCrypto.createHash,
      'webCrypto.createCipheriv=' + typeof webCrypto.createCipheriv,
      'webCrypto.createDecipheriv=' + typeof webCrypto.createDecipheriv,
      'sameObject=' + (webCrypto === nodeCrypto),
      'webCryptoExtensible=' + (webCrypto && typeof Object.isExtensible === 'function' ? Object.isExtensible(webCrypto) : 'unknown')
    );
  } catch (e) {
    console.warn(DIAG_PREFIX + ' init log failed:', e && e.message ? e.message : e);
  }
})();


/* === common_fs.js === */
// File System Polyfills: Mock fs, path, require

(function() {
    console.log("Initializing FS Polyfills...");

    // Mock Path Module (纯 JS 实现)
    const mockPath = {
        join: function(...paths) {
            return paths.join('/').replace(/\/+/g, '/');
        },
        dirname: function(path) {
            if (path == null) return '.';
            // 与 Node.js 行为一致：去掉最后一个路径组件（含末尾斜杠）后返回父目录
            // 例：dirname("save/") = "."（不是 "save"），dirname("a/b") = "a"
            const normalized = path.replace(/\/+$/, ''); // 去除尾部斜杠
            const idx = normalized.lastIndexOf('/');
            if (idx === -1) return '.'; // 无斜杠，返回当前目录
            if (idx === 0) return '/';  // 根目录
            return normalized.substring(0, idx);
        },
        basename: function(path, ext) {
            if (path == null) return '';
            let name = path.substring(path.lastIndexOf('/') + 1);
            if (ext && name.endsWith(ext)) {
                name = name.substring(0, name.length - ext.length);
            }
            return name;
        },
        extname: function(path) {
            const index = path.lastIndexOf('.');
            return index > -1 ? path.substring(index) : '';
        },
        sep: '/',
        parse: function(p) {
            if (p == null) return { root: '', dir: '', base: '', ext: '', name: '' };
            var dir = p.substring(0, p.lastIndexOf('/'));
            var base = p.substring(p.lastIndexOf('/') + 1);
            var extIdx = base.lastIndexOf('.');
            var ext = extIdx > -1 ? base.substring(extIdx) : '';
            var name = extIdx > -1 ? base.substring(0, extIdx) : base;
            return { root: '', dir: dir, base: base, ext: ext, name: name };
        },
        resolve: function() {
            var parts = Array.prototype.slice.call(arguments);
            return parts.join('/').replace(/\/+/g, '/');
        },
        normalize: function(p) {
            return p ? p.replace(/\/+/g, '/') : '';
        }
    };

    // 生成成就存档的兜底压缩串（若 pako 可用则使用 deflate，否则直接返回 JSON 字符串）
    function fallbackAchievementZip() {
        const json = JSON.stringify({ unlockInfo: [] });
        try {
            if (window.pako && typeof window.pako.deflate === 'function') {
                return window.pako.deflate(json, { to: 'string', level: 1 });
            }
        } catch (e) {
            console.warn('[Polyfill] pako.deflate failed, fallback to raw json:', e);
        }
        return json;
    }

    const saveExistsCache = Object.create(null);

    // 存档写穿透缓存：writeFileSync 同步更新内存，磁盘落盘走异步 postMessage。
    // 旧实现的 prompt() 同步桥是 WKWebView 的 JS 对话框，WebKit 会中断页面音频，
    // Drill_GlobalGameTimer 这类每 300 帧自动存档的插件会让 BGM 周期性停顿；
    // 读路径（readFileSync/existsSync）先查本缓存，保证「写后读」不依赖落盘时序。
    const pendingSaveWrites = Object.create(null);

    // rename/unlink 仍走同步 prompt 桥（低频操作），执行前必须先排空未落盘的
    // 异步写：WKScriptMessage 异步送达，若不排空，原生侧处理 rename/delete 时
    // 文件可能还没写上盘（MZ 临时文件 write→rename 流程会被这个乱序打断）。
    function flushPendingSaveWrites() {
        for (const filename in pendingSaveWrites) {
            if (nativeWriteSave(filename, pendingSaveWrites[filename])) {
                delete pendingSaveWrites[filename];
            }
        }
    }

    // 仅将真正的 RPG Maker 存档文件统一映射到当前游戏的 save/ 目录。
    // MZ 原生存储会先写 *.rmmzsave_ 临时文件再 rename；部分插件使用 .bak/.tmp。
    // 不再通过 path.includes("save") 判断，避免误拦截 save-settings.json 等普通文件。
    function saveFilenameFromPath(path) {
        const normalized = String(path == null ? '' : path).replace(/\\/g, '/');
        const filename = normalized.substring(normalized.lastIndexOf('/') + 1);
        if (!filename || filename === '.' || filename === '..') return null;
        return /\.(?:rpgsave|rmmzsave)(?:\.(?:bak|tmp|temp)|_)?$/i.test(filename)
            ? filename
            : null;
    }

    function canonicalSavePath(path) {
        const filename = saveFilenameFromPath(path);
        return filename ? "save/" + filename : null;
    }

    // NativeBridge 以 Swift String 持久化 MZ/MV 存档。readFileSync 在未指定
    // encoding 时按 Node 语义返回 ArrayBuffer，因此复制存档前必须先按 UTF-8
    // 还原为原始字符串；直接 String(ArrayBuffer) 会写入 "[object ArrayBuffer]"。
    function saveContentString(data) {
        if (data == null) return '';
        if (typeof data === 'string') return data;

        var bytes = null;
        if (data instanceof ArrayBuffer) {
            bytes = new Uint8Array(data);
        } else if (typeof ArrayBuffer.isView === 'function' && ArrayBuffer.isView(data)) {
            bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        } else if (data._bytes instanceof Uint8Array) {
            bytes = data._bytes;
        }

        if (bytes) {
            return new TextDecoder('utf-8').decode(bytes);
        }
        return String(data);
    }

    function nativeWriteSave(filename, data) {
        const content = saveContentString(data);
        try {
            const result = prompt("__NATIVE_SAVE_WRITE__:" + filename, content);
            if (result === "1") return true;
            if (result === "0") return false;
        } catch (e) {
            console.warn("[Polyfill] synchronous save write failed, using bridge fallback: " + filename, e);
        }
        if (window.webkit && window.webkit.messageHandlers.nativeBridge) {
            window.webkit.messageHandlers.nativeBridge.postMessage({
                type: 'save',
                filename: filename,
                data: content
            });
            return true;
        }
        return false;
    }

    function nativeDeleteSave(filename) {
        try {
            return prompt("__NATIVE_SAVE_DELETE__:" + filename, "") === "1";
        } catch (e) {
            console.warn("[Polyfill] save delete failed: " + filename, e);
            return false;
        }
    }

    function nativeRenameSave(oldFilename, newFilename) {
        try {
            const payload = JSON.stringify([oldFilename, newFilename]);
            return prompt("__NATIVE_SAVE_RENAME__:" + payload, "") === "1";
        } catch (e) {
            console.warn("[Polyfill] save rename failed: " + oldFilename + " -> " + newFilename, e);
            return false;
        }
    }

    function queryNativeSaveExists(filename) {
        if (!filename) return false;
        if (saveExistsCache[filename] !== undefined) {
            return !!saveExistsCache[filename];
        }
        try {
            const result = prompt("__NATIVE_EXISTS__:" + filename, "");
            const exists = result === "1";
            saveExistsCache[filename] = exists;
            return exists;
        } catch (e) {
            return false;
        }
    }

    // 同步写入游戏包内文本配置文件（如 lng.txt）。
    // 通过 prompt 协议落到 NativeBridgeHandler —— 同步返回，确保 location.reload()
    // 在文件落盘之后触发，从而让 fs.readFileSync 在重启后读到最新值。
    function nativeWriteFile(path, data) {
        try {
            var p = String(path == null ? '' : path).replace(/\\/g, '/');
            // 与 readFileSync 同样的归一化：去掉任意 www/ 前缀，得到包内相对路径
            var cleanPath = p.replace(/^.*www\//, '');
            // 拒绝绝对路径与父目录穿越，防止误写到沙盒外
            if (!cleanPath || cleanPath.startsWith('/') || cleanPath.includes('..')) {
                console.warn("[Polyfill] nativeWriteFile rejected path: " + path);
                return false;
            }
            var result = prompt("__NATIVE_WRITE__:" + cleanPath, String(data == null ? '' : data));
            if (result !== "1") {
                console.warn("[Polyfill] nativeWriteFile native refused: " + cleanPath);
                return false;
            }
            // common_sync_xhr.js 会缓存成功的包内同步 GET/HEAD。配置写入成功后
            // 清空缓存，保证随后 readFileSync 仍能立即读到新内容。
            if (typeof window.__arkRpgClearSyncXhrCache === 'function') {
                window.__arkRpgClearSyncXhrCache();
            }
            return true;
        } catch (e) {
            console.warn("[Polyfill] nativeWriteFile failed: " + path, e);
            return false;
        }
    }

    // Mock OS Module (最小实现，供插件检测平台)
    const mockOS = {
        platform: function() { return 'darwin'; },
        type: function() { return 'Darwin'; },
        release: function() { return '23.0.0'; },
        arch: function() { return 'arm64'; },
        homedir: function() { return '/var/mobile'; },
        tmpdir: function() { return '/tmp'; },
        totalmem: function() { return 2 * 1024 * 1024 * 1024; },
        freemem: function() { return 1 * 1024 * 1024 * 1024; }
    };

    // Mock Process Module (最小实现，供插件检测平台)
    // title 必须为 'browser'：LN_FilmicFilter 等插件用
    //   typeof process !== 'undefined' && process.title !== 'browser'
    // 判定 Node 环境。title 缺省时（undefined !== 'browser'）会被误判为 Node，
    // 进而走 fs.mkdir/readdir 重扫 data/filters 的 NW 分支并崩溃。
    // 我们装 process 仅为让 Utils.isNwjs()（只查 typeof require/process）保持 true，
    // 本体是 WebView，title='browser' 才是插件作者预期的浏览器语义。
    const mockProcess = {
        title: 'browser',
        platform: 'darwin',
        env: {
            NODE_ENV: 'production',
            STEAM_DECK: '0'
        },
        version: '',
        versions: {},
        argv: ['index.html', ''],
        execPath: 'index.html',
        mainModule: { filename: 'index.html' },
        nextTick: function(fn) { setTimeout(fn, 0); },
        cwd: function() { return '.'; },
        browser: true,
        arch: 'arm64',
        platform: 'darwin'
    };

    function inferMockFFIReturn(signature) {
        const text = String(signature || '').trim();
        const lower = text.toLowerCase();

        // Steam/native bootstrap probes commonly abort the game when init returns false.
        if (lower.includes('steamapi_init') || lower.includes(' init(') || lower.endsWith(' init()')) {
            return true;
        }
        if (lower.includes('issubscribedapp') || lower.includes('steamrunning') || lower.includes('overlayenabled')) {
            return true;
        }
        if (lower.includes('shutdown')) {
            return undefined;
        }
        if (lower.startsWith('bool ')) {
            return true;
        }
        if (lower.startsWith('void ')) {
            return undefined;
        }
        if (lower.startsWith('char* ') || lower.startsWith('const char* ')) {
            return '';
        }
        if (lower.startsWith('int64') || lower.startsWith('uint64')) {
            return 1;
        }
        if (lower.startsWith('int ') || lower.startsWith('uint') || lower.startsWith('size_t')) {
            return 1;
        }
        if (lower.includes('*')) {
            return {};
        }
        return 0;
    }

    const _silentFFI = new Set(['NekoGakuen_SteamAPI_RunCallbacks']);
    function createNoopFFIFunction(name) {
        const fn = function() {
            if (!_silentFFI.has(name)) console.warn('[koffi] Mock FFI call ignored: ' + name);
            return inferMockFFIReturn(name);
        };
        fn.async = function() {
            if (!_silentFFI.has(name)) console.warn('[koffi] Mock async FFI call ignored: ' + name);
            return Promise.resolve(inferMockFFIReturn(name));
        };
        return fn;
    }

    const mockKoffiLibrary = {
        func: function(signature) {
            return createNoopFFIFunction(signature || 'anonymous');
        },
        symbol: function(signature) {
            return createNoopFFIFunction(signature || 'anonymous');
        },
        cdecl: function(signature) {
            return createNoopFFIFunction(signature || 'anonymous');
        },
        stdcall: function(signature) {
            return createNoopFFIFunction(signature || 'anonymous');
        },
        close: function() {}
    };

    const mockKoffi = {
        types: {
            void: 'void',
            bool: 'bool',
            char: 'char',
            int: 'int',
            uint32: 'uint32',
            uint64: 'uint64',
            size_t: 'size_t'
        },
        struct: function(name, fields) {
            return { __koffiKind: 'struct', name: name, fields: fields || {} };
        },
        union: function(name, fields) {
            return { __koffiKind: 'union', name: name, fields: fields || {} };
        },
        pointer: function(type) {
            return { __koffiKind: 'pointer', to: type };
        },
        opaque: function(name) {
            return { __koffiKind: 'opaque', name: name || 'opaque' };
        },
        array: function(type, length) {
            return { __koffiKind: 'array', type: type, length: length || 0 };
        },
        proto: function() {
            return createNoopFFIFunction('proto');
        },
        alias: function(name, type) {
            return type || name;
        },
        sizeof: function() { return 0; },
        alignof: function() { return 0; },
        load: function(libraryName) {
            console.warn('[koffi] Mock library load ignored: ' + libraryName);
            return mockKoffiLibrary;
        },
        open: function(libraryName) {
            console.warn('[koffi] Mock library open ignored: ' + libraryName);
            return mockKoffiLibrary;
        },
        func: function(signature) {
            return createNoopFFIFunction(signature || 'anonymous');
        },
        reset: function() {},
        errno: function() { return 0; },
        extension: '.dylib'
    };

    // Mock FS Module (文件系统)
    const mockFS = {
        existsSync: function(path) {
            const p = path.replace(/\\/g, '/');
            // 存档目录一律视为存在（mkdir 本就是 no-op，目录检查无意义）。
            // MV/MZ 插件的 localFileDirectoryPath 产物形如 "save/"、".../www/save"、
            // "...\save" 等；此前只匹配带前导斜杠的三种写法，"save/" 这类相对路径
            // 漏判后每次自动存档都会发一次同步 XHR HEAD 且恒 404（SAO β4 的
            // Drill_GlobalGameTimer 每 5 秒一次，既卡主线程又刷日志）。
            const dirTail = p.replace(/\/+$/, '');
            if (dirTail.substring(dirTail.lastIndexOf('/') + 1).toLowerCase() === 'save') return true;

            // 无论游戏提供默认 save/ 路径还是自定义绝对路径，存档均按文件名
            // 映射到当前游戏的统一 save/ 目录。
            const savePath = canonicalSavePath(p);
            if (savePath) {
                return queryNativeSaveExists(savePath.substring("save/".length));
            }

            let cleanPath = p.replace(/^.*www\//, '');
            
            try {
                const xhr = new XMLHttpRequest();
                // Dynamically use current protocol (rpgmv: or rpgmz:)
                const baseUrl = (location.protocol === 'file:') ? '' : (location.protocol + "//game/");
                xhr.open('HEAD', baseUrl + cleanPath, false);
                xhr.send(null);
                
                // [ArkRPG Fix] 
                // 如果是特殊配置文件（如 achievement.rmmzsave/global.rmmzsave），即使 404 也视为存在，
                // 随后 readFileSync 会拦截并返回空 JSON 对象，避免插件 crash。
                if (xhr.status !== 200 && (cleanPath.endsWith("achievement.rmmzsave")/* || cleanPath.endsWith("config.rmmzsave") || cleanPath.endsWith("global.rmmzsave") */)) {
                    console.log("[Polyfill] Spoofing existence for missing config file (status " + xhr.status + "): " + cleanPath);
                    return true;
                }
                
                return xhr.status === 200;
            } catch (e) {
                // [ArkRPG Fix] Catch block handling for when xhr.send throws (e.g. Network Error / status 0)
                if (cleanPath.endsWith("achievement.rmmzsave") || cleanPath.endsWith("config.rmmzsave") || cleanPath.endsWith("global.rmmzsave")) {
                    console.log("[Polyfill] Spoofing existence for missing config file (exception): " + cleanPath);
                    return true;
                }
                return false;
            }
        },
        readFileSync: function(path, encoding) {
            // 在 try/catch 之外声明，避免 catch 块访问不到 cleanPath 抛出 ReferenceError
            const p = path.replace(/\\/g, '/');
            let cleanPath = p;
            function isTextExt(name){
                const n = name.toLowerCase();
                return n.endsWith('.json') || n.endsWith('.json5') || n.endsWith('.txt') || n.endsWith('.ini') || n.endsWith('.csv') || n.endsWith('.js') || n.endsWith('.cfg') || n.endsWith('.yml') || n.endsWith('.yaml') || n.endsWith('.sl');
            }
            function decodeWithFallback(buf){
                var encs = ['utf-8','utf-16le','utf-16be','shift_jis','windows-1252','gbk','big5','euc-kr'];
                for (var i=0;i<encs.length;i++){
                    try {
                        var dec = new TextDecoder(encs[i], {fatal:false});
                        var txt = dec.decode(buf);
                        if (txt.charCodeAt(0) === 0xFEFF) txt = txt.slice(1);
                        return txt;
                    } catch(e){}
                }
                try { return new TextDecoder('utf-8').decode(buf); } catch(_){}
                return '';
            }
            try {
                cleanPath = canonicalSavePath(p) || p.replace(/^.*www\//, '');

                // 写穿透缓存命中：本会话刚写、尚未落盘的存档直接从内存返回
                const pendingName = cleanPath.indexOf("save/") === 0 ? cleanPath.substring(5) : null;
                if (pendingName && pendingSaveWrites[pendingName] !== undefined) {
                    const pendingHasEncoding = typeof encoding === 'string' ||
                        (encoding && typeof encoding === 'object' && typeof encoding.encoding === 'string');
                    if (pendingHasEncoding || isTextExt(cleanPath)) {
                        return pendingSaveWrites[pendingName];
                    }
                    // Node 语义：非文本扩展名且未指定 encoding 时返回 ArrayBuffer
                    return new TextEncoder().encode(pendingSaveWrites[pendingName]).buffer;
                }

                const xhr = new XMLHttpRequest();
                // Dynamically use current protocol
                const baseUrl = (location.protocol === 'file:') ? '' : (location.protocol + "//game/");
                const isText = isTextExt(cleanPath);
                // Node.js semantics: encoding specified → return string; no encoding + non-text → return ArrayBuffer
                const hasEncoding = typeof encoding === 'string' ||
                    (encoding && typeof encoding === 'object' && typeof encoding.encoding === 'string');
                const wantsText = isText || hasEncoding;
                xhr.responseType = 'arraybuffer';
                xhr.open('GET', baseUrl + cleanPath, false);
                xhr.send(null);
                if (xhr.status === 200) {
                    if (wantsText && xhr.response) {
                        return decodeWithFallback(xhr.response);
                    }
                    if (xhr.response) {
                        // 只为内嵌 NW.js EXE 代理恢复 Node 的 Buffer 语义。
                        // 普通游戏继续返回既有 ArrayBuffer，避免改变插件兼容行为。
                        if (typeof window.__ARKRPG_PROCESS_EXEC_PATH__ === 'string' &&
                            cleanPath === window.__ARKRPG_PROCESS_EXEC_PATH__) {
                            return Buffer.from(xhr.response);
                        }
                        return xhr.response;
                    }
                    return '';
                }
                
                // [ArkRPG Fix] 针对被 existsSync 欺骗进来的缺失配置文件，返回空串
                // 空串会让上层 zipToJson 走 "null" 分支，避免 pako.inflate 抛错
                if (cleanPath.endsWith("achievement.rmmzsave")/* || cleanPath.endsWith("config.rmmzsave") || cleanPath.endsWith("global.rmmzsave") */) {
                    console.warn("[Polyfill] Returning fallback zip for missing file: " + cleanPath);
                    return fallbackAchievementZip();
                }

                throw new Error("ENOENT: no such file or directory, open '" + path + "'");
            } catch (e) {
                // [ArkRPG Fix] Catch block handling for when xhr.send throws
                if (cleanPath && (cleanPath.endsWith("achievement.rmmzsave")/* || cleanPath.endsWith("config.rmmzsave") || cleanPath.endsWith("global.rmmzsave") */)) {
                    console.warn("[Polyfill] Returning fallback zip for missing file (exception): " + cleanPath);
                    return fallbackAchievementZip();
                }
                console.warn("[Polyfill] readFileSync failed for: " + path);
                throw e;
            }
        },
        writeFileSync: function(path, data, encoding) {
            try {
                const filename = saveFilenameFromPath(path);
                if (filename) {
                    const content = saveContentString(data);
                    if (window.webkit && window.webkit.messageHandlers.nativeBridge) {
                        // 异步落盘（见 pendingSaveWrites 注释）：WKScriptMessage 保序，
                        // 同文件多次写按序覆盖；进程崩溃最多丢最后一个未落盘的周期存档
                        window.webkit.messageHandlers.nativeBridge.postMessage({
                            type: 'save',
                            filename: filename,
                            data: content
                        });
                    } else if (!nativeWriteSave(filename, content)) {
                        throw new Error("native save write rejected: " + filename);
                    }
                    pendingSaveWrites[filename] = content;
                    saveExistsCache[filename] = true;
                } else {
                    // 非存档类配置文件（如 lng.txt）：同步写盘，确保后续 readFileSync 能读到最新值
                    nativeWriteFile(path, data);
                }
            } catch (e) {
                console.error("[Polyfill] writeFileSync error: " + e);
            }
        },
        copyFileSync: function(src, dest) {
            try {
                // 自定义存档目录插件会把 /var/mobile/Documents/.../file.rmmzsave
                // 与 save/file.rmmzsave 当成两个路径，但 ArkRPG 会把它们统一映射
                // 到同一个原生文件。此时复制等同于自我覆盖，必须直接跳过。
                var srcSavePath = canonicalSavePath(src);
                var destSavePath = canonicalSavePath(dest);
                if (srcSavePath && destSavePath && srcSavePath.toLowerCase() === destSavePath.toLowerCase()) {
                    console.log("[Polyfill] copyFileSync skipped for identical canonical save: " + srcSavePath);
                    return;
                }
                var data = mockFS.readFileSync(src);
                mockFS.writeFileSync(dest, data);
            } catch (e) {
                console.warn("[Polyfill] copyFileSync failed: " + src + " -> " + dest);
            }
        },
        mkdirSync: function() {},
        // 异步 mkdir：只做回调（目录操作在 WebView 中无意义）。
        // 部分插件（如 LN_FilmicFilter 的 NW 分支）只调异步版，
        // 缺失会抛 "mkdir is not a function"。
        mkdir: function(path, optionsOrCallback, callback) {
            var cb = typeof optionsOrCallback === 'function' ? optionsOrCallback : callback;
            setTimeout(function() { if (typeof cb === 'function') cb(null); }, 0);
        },
        openSync: function(path, flags) { console.log("[Polyfill] fs.openSync ignored: " + path); return 0; },
        closeSync: function(fd) {},
        writeSync: function(fd, data) {},
        appendFileSync: function(path, data) { console.log("[Polyfill] fs.appendFileSync ignored: " + path); },
        createWriteStream: function(path) {
            // 实现 Node.js fs.createWriteStream 的最小可用子集：
            //   write(chunk[, encoding][, callback])
            //   end([chunk][, encoding][, callback])
            //   on('finish' | 'close' | 'error', cb)
            // 内部缓冲所有 write，在 end 时通过 prompt 同步写盘。
            // 这样游戏流程中 `stream.end()` 后立即 `location.reload()` 仍能读到新内容。
            var buffer = "";
            var finished = false;
            var listeners = { finish: [], close: [], error: [] };

            function emit(event) {
                (listeners[event] || []).forEach(function (cb) {
                    try { cb(); } catch (e) { console.warn('[Polyfill] stream listener error:', e); }
                });
            }

            return {
                write: function(chunk, encoding, callback) {
                    if (finished) return false;
                    if (typeof chunk === 'string') {
                        buffer += chunk;
                    } else if (chunk == null) {
                        // skip
                    } else if (typeof chunk === 'number' || typeof chunk === 'boolean') {
                        buffer += String(chunk);
                    } else if (chunk && (chunk instanceof ArrayBuffer || chunk.buffer instanceof ArrayBuffer)) {
                        var u8 = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk.buffer ? chunk.buffer : chunk);
                        for (var i = 0; i < u8.length; i++) buffer += String.fromCharCode(u8[i]);
                    } else {
                        buffer += String(chunk);
                    }
                    if (typeof encoding === 'function') { encoding(); return true; }
                    if (typeof callback === 'function') callback();
                    return true;
                },
                end: function(chunk, encoding, callback) {
                    if (finished) return;
                    if (typeof chunk === 'string') buffer += chunk;
                    else if (typeof chunk === 'function') { callback = chunk; }
                    else if (chunk != null) buffer += String(chunk);
                    if (typeof encoding === 'function' && typeof callback === 'undefined') callback = encoding;
                    finished = true;
                    nativeWriteFile(path, buffer);
                    emit('finish');
                    emit('close');
                    if (typeof callback === 'function') callback();
                },
                on: function(event, cb) {
                    if (listeners[event]) listeners[event].push(cb);
                    return this;
                },
                once: function(event, cb) {
                    var self = this;
                    var wrapper = function() {
                        try { cb(); } catch (e) {}
                        var arr = listeners[event] || [];
                        var idx = arr.indexOf(wrapper);
                        if (idx !== -1) arr.splice(idx, 1);
                    };
                    return this.on(event, wrapper);
                },
                removeListener: function(event, cb) {
                    var arr = listeners[event];
                    if (!arr) return this;
                    var idx = arr.indexOf(cb);
                    if (idx !== -1) arr.splice(idx, 1);
                    return this;
                },
                emit: function(event) { emit(event); return this; },
                destroy: function() { finished = true; return this; },
                writable: true
            };
        },
        createReadStream: function(path) { return { on: function(ev, cb) { if(ev==='error') cb(new Error('ENOENT')); } }; },
        statSync: function(p) {
            var exists = mockFS.existsSync(p);
            return {
                isDirectory: function() { return false; },
                isFile: function() { return exists; },
                size: 0, mtimeMs: 0, mtime: new Date(0)
            };
        },
        lstatSync: function(p) { return mockFS.statSync(p); },
        unlinkSync: function(path) {
            const filename = saveFilenameFromPath(path);
            if (!filename) {
                console.log("[Polyfill] unlinkSync ignored for non-save file: " + path);
                return;
            }
            // 先排空未落盘的异步写，避免删完又被滞后的写消息复活
            flushPendingSaveWrites();
            if (!nativeDeleteSave(filename)) {
                throw new Error("Failed to delete save file: " + filename);
            }
            delete pendingSaveWrites[filename];
            saveExistsCache[filename] = false;
            console.log("[Polyfill] deleted save file: " + filename);
        },
        renameSync: function(oldPath, newPath) {
            const oldFilename = saveFilenameFromPath(oldPath);
            const newFilename = saveFilenameFromPath(newPath);
            if (!oldFilename || !newFilename) {
                console.log("[Polyfill] renameSync ignored for non-save file: " + oldPath + " -> " + newPath);
                return;
            }
            // 先排空未落盘的异步写，否则原生 rename 可能赶在写之前执行（文件不存在）
            flushPendingSaveWrites();
            if (!nativeRenameSave(oldFilename, newFilename)) {
                throw new Error("Failed to rename save file: " + oldFilename + " -> " + newFilename);
            }
            delete pendingSaveWrites[oldFilename];
            delete pendingSaveWrites[newFilename];
            saveExistsCache[oldFilename] = false;
            saveExistsCache[newFilename] = true;
            console.log("[Polyfill] renamed save file: " + oldFilename + " -> " + newFilename);
        },
        rename: function(oldPath, newPath, callback) {
            try {
                mockFS.renameSync(oldPath, newPath);
                if (typeof callback === 'function') callback(null);
            } catch (e) {
                if (typeof callback === 'function') callback(e);
            }
        },
        readFile: function(path, optionsOrCallback, callback) {
            var cb = typeof optionsOrCallback === 'function' ? optionsOrCallback : callback;
            try {
                var result = mockFS.readFileSync(path, typeof optionsOrCallback === 'string' ? optionsOrCallback : undefined);
                if (typeof cb === 'function') cb(null, result);
            } catch(e) {
                if (typeof cb === 'function') cb(e);
            }
        },
        writeFile: function(path, data, optionsOrCallback, callback) {
            // PDX_CoreAPI / PDX_StorageManager 使用异步 writeFile(path, content, callback)
            var cb = typeof optionsOrCallback === 'function' ? optionsOrCallback : callback;
            try {
                mockFS.writeFileSync(path, data);
                if (typeof cb === 'function') cb(null);
            } catch(e) {
                if (typeof cb === 'function') cb(e);
            }
        },
        unlink: function(path, callback) {
            try {
                mockFS.unlinkSync(path);
                if (typeof callback === 'function') callback(null);
            } catch(e) {
                if (typeof callback === 'function') callback(e);
            }
        },
        readdir: function(path, callback) {
            try {
                var result = mockFS.readdirSync(path);
                if (typeof callback === 'function') callback(null, result);
            } catch(e) {
                if (typeof callback === 'function') callback(e, []);
            }
        },
        readdirSync: function(path) {
            try {
                const p = String(path || '').replace(/\\/g, '/');
                let relPath;
                // Extract game-relative path using same normalization as existsSync/readFileSync
                if (p.includes('/save')) {
                    const idx = p.lastIndexOf('/save');
                    relPath = p.substring(idx + 1); // e.g. "save" or "save/subdir"
                } else {
                    relPath = p.replace(/^.*www\//, '').replace(/^\//, '');
                }
                relPath = relPath.replace(/\/+$/, ''); // strip trailing slash
                const result = prompt('__NATIVE_READDIR__:' + relPath, '[]');
                return JSON.parse(result || '[]');
            } catch (e) {
                return [];
            }
        }
    };

    // 注入全局 require
    // 无条件安装（不依赖 window.nw）：
    //   common_fs.js (f) 按字母序先于 common_nw.js (n) 加载，window.nw 此时尚未设置，
    //   若依赖 window.nw 条件则永远跳过 → mz_bootstrap.js 装了空 stub → require('path') = undefined。
    // isNwjs() 检测条件是 typeof require === 'function' && typeof process === 'object'，
    //   此处只装 require 不装 process，isNwjs() 仍为 false，存档路径不受影响。
    // ---- EventEmitter class（可被 ES6 class extends 使用）----
    var mockEventEmitter = (function() {
        function EventEmitter() {
            this._events = Object.create(null);
            this._maxListeners = 10;
        }
        EventEmitter.prototype.setMaxListeners = function(n) { this._maxListeners = n; return this; };
        EventEmitter.prototype.getMaxListeners = function() { return this._maxListeners; };
        EventEmitter.prototype.addListener = function(event, listener) {
            if (typeof listener !== 'function') return this;
            if (!this._events[event]) this._events[event] = [];
            this._events[event].push(listener);
            return this;
        };
        EventEmitter.prototype.on = EventEmitter.prototype.addListener;
        EventEmitter.prototype.once = function(event, listener) {
            if (typeof listener !== 'function') return this;
            var self = this;
            function wrapper() {
                self.removeListener(event, wrapper);
                listener.apply(this, arguments);
            }
            wrapper._originalListener = listener;
            return this.addListener(event, wrapper);
        };
        EventEmitter.prototype.removeListener = function(event, listener) {
            var list = this._events[event];
            if (!list) return this;
            var idx = -1;
            for (var i = list.length - 1; i >= 0; i--) {
                if (list[i] === listener || list[i]._originalListener === listener) { idx = i; break; }
            }
            if (idx !== -1) list.splice(idx, 1);
            return this;
        };
        EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
        EventEmitter.prototype.removeAllListeners = function(event) {
            if (event) this._events[event] = [];
            else this._events = Object.create(null);
            return this;
        };
        EventEmitter.prototype.emit = function(event) {
            var list = this._events[event];
            if (!list || !list.length) return false;
            var args = Array.prototype.slice.call(arguments, 1);
            list.slice().forEach(function(fn) { try { fn.apply(null, args); } catch(e) { console.warn('[EventEmitter] listener error:', e); } });
            return true;
        };
        EventEmitter.prototype.listeners = function(event) {
            return (this._events[event] || []).slice();
        };
        EventEmitter.prototype.listenerCount = function(event) {
            return (this._events[event] || []).length;
        };
        EventEmitter.listenerCount = function(emitter, event) { return emitter.listenerCount(event); };
        return EventEmitter;
    })();

    // ---- util module polyfill ----
    var mockUtil = {
        promisify: function(fn) {
            return function() {
                var args = Array.prototype.slice.call(arguments);
                var self = this;
                return new Promise(function(resolve, reject) {
                    args.push(function(err, result) {
                        if (err) reject(err); else resolve(result);
                    });
                    fn.apply(self, args);
                });
            };
        },
        inherits: function(ctor, superCtor) {
            ctor.prototype = Object.create(superCtor.prototype, {
                constructor: { value: ctor, enumerable: false, writable: true, configurable: true }
            });
        },
        format: function(fmt) {
            var args = Array.prototype.slice.call(arguments, 1);
            var i = 0;
            if (typeof fmt !== 'string') return Array.prototype.join.call(arguments, ' ');
            return fmt.replace(/%[sdjifoO%]/g, function(m) {
                if (m === '%%') return '%';
                var arg = args[i++];
                if (m === '%s') return String(arg);
                if (m === '%d' || m === '%i') return parseInt(arg, 10);
                if (m === '%f') return parseFloat(arg);
                if (m === '%j') { try { return JSON.stringify(arg); } catch(e) { return '[Circular]'; } }
                if (m === '%o' || m === '%O') { try { return JSON.stringify(arg, null, 2); } catch(e) { return String(arg); } }
                return m;
            });
        },
        inspect: function(obj) { try { return JSON.stringify(obj, null, 2); } catch(e) { return String(obj); } },
        deprecate: function(fn) { return fn; },
        callbackify: function(fn) {
            return function() {
                var args = Array.prototype.slice.call(arguments);
                var cb = args.pop();
                fn.apply(this, args).then(function(v) { cb(null, v); }, function(e) { cb(e); });
            };
        },
        isArray: Array.isArray,
        isString: function(v) { return typeof v === 'string'; },
        isNumber: function(v) { return typeof v === 'number'; },
        isObject: function(v) { return v !== null && typeof v === 'object'; },
        isFunction: function(v) { return typeof v === 'function'; },
        isNull: function(v) { return v === null; },
        isUndefined: function(v) { return v === undefined; },
        isBoolean: function(v) { return typeof v === 'boolean'; },
        types: {
            isPromise: function(v) { return v && typeof v.then === 'function'; },
            isMap: function(v) { return v instanceof Map; },
            isSet: function(v) { return v instanceof Set; },
            isRegExp: function(v) { return v instanceof RegExp; },
            isDate: function(v) { return v instanceof Date; }
        }
    };

    // 安全对象包装器：用 Proxy 确保任何未定义属性访问都返回安全的空函数/对象，
    // 彻底避免插件访问 nw.gui 不存在的属性时 TypeError。
    function makeSafeObject(target) {
        target = target || {};
        if (typeof Proxy === 'undefined') {
            // 旧浏览器不支持 Proxy：返回原对象（已包含常用属性）
            return target;
        }
        return new Proxy(target, {
            get: function(obj, prop) {
                if (prop in obj) return obj[prop];
                if (prop === Symbol.toPrimitive || prop === Symbol.iterator) return undefined;
                if (prop === 'then') return undefined; // 避免被当成 Promise
                // 未定义属性返回一个可调用、可访问的安全对象
                var safe = function() { return makeSafeObject({}); };
                return makeSafeObject(safe);
            },
            set: function(obj, prop, value) {
                obj[prop] = value;
                return true;
            }
        });
    }

    function makeSafeWindow() {
        var win = {
            _events: {},
            on: function(event, listener) {
                if (typeof listener !== 'function') return this;
                this._events[event] = this._events[event] || [];
                this._events[event].push(listener);
                return this;
            },
            addListener: function(e, l) { return this.on(e, l); },
            removeListener: function(event, listener) {
                var list = this._events[event];
                if (list) {
                    var idx = list.indexOf(listener);
                    if (idx !== -1) list.splice(idx, 1);
                }
                return this;
            },
            removeAllListeners: function(event) {
                if (event) this._events[event] = [];
                else this._events = {};
                return this;
            },
            emit: function(event) {
                var list = this._events[event];
                if (!list || !list.length) return false;
                var args = Array.prototype.slice.call(arguments, 1);
                list.slice().forEach(function(fn) { try { fn.apply(null, args); } catch(e) {} });
                return true;
            },
            close: function() { try { window.close(); } catch(_){} },
            reload: function() { location.reload(); },
            maximize: function() {}, minimize: function() {}, restore: function() {},
            focus: function() {}, blur: function() {}, show: function() {}, hide: function() {},
            enterFullscreen: function() {}, leaveFullscreen: function() {}, toggleFullscreen: function() {},
            showDevTools: function() {}, closeDevTools: function() {},
            isDevToolsOpen: function() { return false; },
            isFullscreen: function() { return false; },
            isMaximized: function() { return false; },
            isMinimized: function() { return false; },
            isVisible: function() { return true; },
            isClosing: function() { return false; },
            resizeTo: function() {}, moveTo: function() {}, resizeBy: function() {}, moveBy: function() {},
            setResizable: function() {}, setAlwaysOnTop: function() {}, setCloseListener: function() {},
            setMinimumSize: function() {}, setMaximumSize: function() {}, lockPosition: function() {},
            width: window.innerWidth, height: window.innerHeight, x: 0, y: 0,
            scale: { x: 1, y: 1 }, menu: null,
            window: window, document: document, location: location
        };
        return makeSafeObject(win);
    }

    if (typeof window.require === 'undefined') {
        window.require = function(moduleName) {
            console.log("[Polyfill] require called for: " + moduleName);
            if (moduleName === 'fs') return mockFS;
            if (moduleName === 'os') return mockOS;
            // Node 里 require('path/posix') 与 require('path') 等价（POSIX 实现）
            if (moduleName === 'path' || moduleName === 'path/posix') return mockPath;
            if (moduleName === 'process') return mockProcess;
            if (moduleName === 'events') return { EventEmitter: mockEventEmitter };
            if (moduleName === 'util') return mockUtil;
            if (moduleName === 'crypto') {
                const cryptoModule = window.__arkNodeCrypto || window.crypto;
                const source = window.__arkNodeCrypto ? '__arkNodeCrypto' : 'window.crypto';
                try {
                    console.log(
                        '[ArkCryptoDiag] require(crypto)',
                        'source=' + source,
                        'createHash=' + typeof (cryptoModule && cryptoModule.createHash),
                        'createCipheriv=' + typeof (cryptoModule && cryptoModule.createCipheriv),
                        'createDecipheriv=' + typeof (cryptoModule && cryptoModule.createDecipheriv),
                        'sameAsWindowCrypto=' + (cryptoModule === window.crypto)
                    );
                } catch (e) {
                    console.warn('[ArkCryptoDiag] require(crypto) log failed:', e && e.message ? e.message : e);
                }
                return cryptoModule;
            }
            if (moduleName === 'nw.gui') {
                // 优先返回 common_nw.js 设置的完整 mock（MZ 引擎）
                if (window.mockNW) return window.mockNW;
                // MV 引擎排除了 common_nw.js，此处提供内联最小 mock，
                // 防止插件（MovieManager.js、Community_Basic.js 等）直接调用
                // require('nw.gui').Window.get() 时因返回 {} 而崩溃。
                // 使用 Proxy 包装：任何未定义的属性访问都返回安全的空函数/对象，
                // 彻底避免 TypeError: undefined is not an object。
                var nwGuiTarget = {
                    Window: {
                        get: function() {
                            return makeSafeWindow();
                        },
                        open: function(url) { try { window.open(url); } catch(_){} }
                    },
                    App: {
                        argv: [], dataPath: '', fullArgv: [], filteredArgv: [],
                        manifest: { name: 'RPG Player' },
                        quit: function() { try { window.close(); } catch(_){} },
                        clearCache: function() {},
                        closeAllWindows: function() { try { window.close(); } catch(_){} }
                    },
                    Shell: { openExternal: function() {}, openItem: function() {} },
                    Menu: function() { return makeSafeObject({ append: function() {}, popup: function() {}, remove: function() {} }); },
                    MenuItem: function(o) { return o || {}; },
                    Clipboard: { get: function() { return makeSafeObject({ get: function() { return ''; }, set: function() {} }); } }
                };
                return makeSafeObject(nwGuiTarget);
            }
            if (moduleName === 'koffi' || moduleName.endsWith('/koffi') || moduleName.includes('koffi/')) {
                console.log('[Polyfill] Mocking koffi for: ' + moduleName);
                return mockKoffi;
            }
            
            // Loose matching for greenworks (plugins might require('./greenworks') or similar)
            if (moduleName.includes('greenworks')) {
                console.log("[Polyfill] Mocking greenworks for: " + moduleName);
                // 优先使用 common_nw.js 的 greenworksMock（API 更完整），
                // 插件加载时 common_nw.js 已执行完毕。
                if (window.greenworksMock) return window.greenworksMock;
                return {
                    // Core
                    initAPI: function() { console.log("[greenworks] initAPI called (Mock: Success)"); return true; }, 
                    init: function() { return true; },
                    isSteamRunning: function() { return true; },
                    // DLC / ownership
                    isSubscribedApp: function() { return true; },
                    
                    // User
                    getSteamId: function() { return { staticAccountId: '123456789', screenName: 'ArkPlayer', level: 1 }; }, 
                    getCurrentGameLanguage: function() { return 'english'; },
                    getUILanguage: function() { return 'english'; },
                    
                    // Overlay
                    activateGameOverlay: function() {},
                    activateGameOverlayToWebPage: function() {},
                    
                    // Stats & Achievements
                    getStatInt: function() { return 0; },
                    getStatFloat: function() { return 0.0; },
                    setStat: function() { return true; },
                    storeStats: function() { return true; },
                    resetAllStats: function() { return true; },
                    getAchievement: function() { return false; },
                    setAchievement: function() { return true; },
                    clearAchievement: function() { return true; },
                    getNumberOfAchievements: function() { return 0; },
                    getAchievementNames: function() { return []; },
                    
                    // Cloud (Disable to ensure local saves are used)
                    isCloudEnabled: function() { return false; },
                    enableCloud: function(flag) {},
                    getCloudQuota: function(success) { if(success) success(1000000, 0); },
                    
                    // Cloud File Ops (Fail gracefully if called)
                    saveTextToFile: function(file, content, success, error) { console.warn("[greenworks] Cloud save ignored"); if(success) success(); },
                    readTextFromFile: function(file, success, error) { console.warn("[greenworks] Cloud read ignored"); if(error) error("Cloud disabled"); },
                    writeFile: function(file, content, options, success, error) { console.warn("[greenworks] Cloud write ignored"); if(success) success(); },
                    readFile: function(file, success, error) { console.warn("[greenworks] Cloud read ignored"); if(error) error("Cloud disabled"); },
                    
                    // Workshop
                    ugcGetItems: function(options, type, func, success, error) { if(error) error(); }
                };
            }
            
            console.warn("[Polyfill] require module not found: " + moduleName);
            return {}; 
        };
    }

    // 兼容直接访问 window.os 的插件
    if (typeof window.os === 'undefined') {
        window.os = mockOS;
    }

    // 兼容直接访问 window.koffi 的插件
    if (typeof window.koffi === 'undefined') {
        window.koffi = mockKoffi;
    }

    // Buffer polyfill（Node.js global，WebKit 不内置）
    // 支持 Buffer.from(str, encoding) / Buffer.from(array) / Buffer.alloc / Buffer.isBuffer 等常见用法
    if (typeof window.Buffer === 'undefined') {
        window.Buffer = (function() {
            function Buffer(data, encoding) {
                if (typeof data === 'string') {
                    this._bytes = encodeString(data, encoding || 'utf8');
                } else if (data instanceof ArrayBuffer) {
                    this._bytes = new Uint8Array(data);
                } else if (data instanceof Uint8Array || Array.isArray(data)) {
                    this._bytes = new Uint8Array(data);
                } else if (data && data._bytes instanceof Uint8Array) {
                    this._bytes = new Uint8Array(data._bytes);
                } else if (typeof data === 'number') {
                    this._bytes = new Uint8Array(data);
                } else {
                    this._bytes = new Uint8Array(0);
                }
                this.length = this._bytes.length;
                // Expose bytes via numeric indices for Node.js Buffer compatibility.
                // Required for DRM/encryption code that modifies bytes via b[i] = v.
                for (var _i = 0; _i < this._bytes.length; _i++) this[_i] = this._bytes[_i];
            }

            function encodeString(str, encoding) {
                var enc = (encoding || 'utf8').toLowerCase().replace(/-/g, '');
                if (enc === 'base64') {
                    // atob returns binary string; convert to Uint8Array
                    var bin = atob(str.replace(/[^A-Za-z0-9+/=]/g, ''));
                    var bytes = new Uint8Array(bin.length);
                    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                    return bytes;
                } else if (enc === 'hex') {
                    var h = str.replace(/[^0-9a-fA-F]/g, '');
                    var bytes = new Uint8Array(Math.floor(h.length / 2));
                    for (var i = 0; i < bytes.length; i++) bytes[i] = parseInt(h.substr(i * 2, 2), 16);
                    return bytes;
                } else {
                    // utf8 / latin1 / binary
                    var encoded = new TextEncoder().encode(str);
                    return encoded;
                }
            }

            Buffer.prototype.toString = function(encoding) {
                var enc = (encoding || 'utf8').toLowerCase().replace(/-/g, '');
                // Always read from numeric-indexed properties, which may have been
                // mutated in-place via b[i] = v (e.g. DRM decryption loops).
                var len = this.length;
                var bytes = new Uint8Array(len);
                for (var i = 0; i < len; i++) bytes[i] = (this[i] !== undefined ? this[i] & 255 : 0);
                if (enc === 'base64') {
                    var binary = '';
                    for (var i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
                    return btoa(binary);
                } else if (enc === 'hex') {
                    var out = '';
                    for (var i = 0; i < bytes.length; i++) {
                        var h = bytes[i].toString(16);
                        out += h.length < 2 ? '0' + h : h;
                    }
                    return out;
                } else {
                    return new TextDecoder('utf-8').decode(bytes);
                }
            };

            Buffer.prototype.subarray = function(start, end) {
                var len = this.length;
                var from = start == null ? 0 : Number(start);
                var to = end == null ? len : Number(end);
                if (from < 0) from = Math.max(len + from, 0);
                else from = Math.min(from, len);
                if (to < 0) to = Math.max(len + to, 0);
                else to = Math.min(to, len);
                if (to < from) to = from;
                var bytes = new Uint8Array(to - from);
                for (var i = from; i < to; i++) bytes[i - from] = this[i] & 255;
                return new Buffer(bytes);
            };

            Buffer.prototype.slice = Buffer.prototype.subarray;

            Buffer.prototype.equals = function(other) {
                if (!other || typeof other.length !== 'number' || this.length !== other.length) return false;
                for (var i = 0; i < this.length; i++) {
                    if ((this[i] & 255) !== (other[i] & 255)) return false;
                }
                return true;
            };

            Buffer.prototype.readUInt16LE = function(offset) {
                var i = Number(offset) || 0;
                if (i < 0 || i + 2 > this.length) throw new RangeError('Index out of range');
                return (this[i] & 255) | ((this[i + 1] & 255) << 8);
            };

            Buffer.prototype.readUInt32LE = function(offset) {
                var i = Number(offset) || 0;
                if (i < 0 || i + 4 > this.length) throw new RangeError('Index out of range');
                return ((this[i] & 255) |
                    ((this[i + 1] & 255) << 8) |
                    ((this[i + 2] & 255) << 16) |
                    ((this[i + 3] & 255) << 24)) >>> 0;
            };

            Buffer.prototype.lastIndexOf = function(value, byteOffset, encoding) {
                var needle;
                if (typeof value === 'number') {
                    needle = new Buffer([value & 255]);
                } else if (typeof value === 'string') {
                    needle = Buffer.from(value, encoding);
                } else if (value && typeof value.length === 'number') {
                    needle = value;
                } else {
                    throw new TypeError('value must be a string, number, or Buffer');
                }
                if (needle.length === 0) return Math.min(this.length, byteOffset == null ? this.length : Number(byteOffset));
                var start = byteOffset == null ? this.length - needle.length : Number(byteOffset);
                if (start < 0) start = this.length + start;
                start = Math.min(start, this.length - needle.length);
                for (var i = start; i >= 0; i--) {
                    var matched = true;
                    for (var j = 0; j < needle.length; j++) {
                        if ((this[i + j] & 255) !== (needle[j] & 255)) {
                            matched = false;
                            break;
                        }
                    }
                    if (matched) return i;
                }
                return -1;
            };

            Buffer.from = function(data, encoding) {
                return new Buffer(data, encoding);
            };

            Buffer.alloc = function(size, fill) {
                var buf = new Buffer(size);
                if (fill !== undefined) {
                    var fillByte = (typeof fill === 'number') ? (fill & 255) : fill.charCodeAt(0) & 255;
                    buf._bytes.fill(fillByte);
                    for (var i = 0; i < size; i++) buf[i] = fillByte;
                }
                return buf;
            };

            Buffer.allocUnsafe = Buffer.alloc;

            Buffer.isBuffer = function(obj) {
                return obj instanceof Buffer;
            };

            Buffer.concat = function(list, totalLength) {
                var total = totalLength || list.reduce(function(s, b) { return s + b.length; }, 0);
                var buf = new Buffer(total);
                var offset = 0;
                list.forEach(function(b) {
                    for (var i = 0; i < b.length; i++) {
                        var byte = (b[i] !== undefined) ? b[i] : (b._bytes ? b._bytes[i] : 0);
                        buf[offset + i] = byte & 255;
                        buf._bytes[offset + i] = byte & 255;
                    }
                    offset += b.length;
                });
                return buf;
            };

            Buffer.isEncoding = function(encoding) {
                return ['utf8', 'utf-8', 'base64', 'hex', 'binary', 'latin1', 'ascii'].indexOf((encoding||'').toLowerCase()) !== -1;
            };

            Buffer.byteLength = function(str, encoding) {
                return new Buffer(str, encoding).length;
            };

            return Buffer;
        })();
        console.log("[Polyfill] Buffer global installed.");
    }

    // 兼容直接访问 window.process 的插件
    (function ensureProcessCompat() {
        const proc = (typeof window.process === 'undefined' || !window.process) ? mockProcess : window.process;
        if (!proc.env || typeof proc.env !== 'object') proc.env = {};
        if (!proc.versions || typeof proc.versions !== 'object') proc.versions = {};
        if (!Array.isArray(proc.argv) || proc.argv.length === 0) {
            proc.argv = ['index.html', ''];
        } else if (typeof proc.argv[0] !== 'string') {
            proc.argv[0] = String(proc.argv[0] || 'index.html');
        }
        if (typeof proc.platform !== 'string') proc.platform = 'darwin';
        if (typeof proc.version !== 'string') proc.version = '';
        // 外部先装的 process stub 同样可能缺 title（见 mockProcess 注释）
        if (typeof proc.title !== 'string' || !proc.title) proc.title = 'browser';
        if (typeof proc.browser !== 'boolean') proc.browser = true;
        if (typeof proc.arch !== 'string') proc.arch = 'arm64';
        if (typeof window.__ARKRPG_PROCESS_EXEC_PATH__ === 'string' && window.__ARKRPG_PROCESS_EXEC_PATH__) {
            proc.execPath = window.__ARKRPG_PROCESS_EXEC_PATH__;
        } else if (!proc.execPath) {
            proc.execPath = proc.argv[0] || 'index.html';
        }
        if (!proc.mainModule || typeof proc.mainModule !== 'object') {
            proc.mainModule = { filename: proc.execPath };
        } else if (typeof window.__ARKRPG_PROCESS_EXEC_PATH__ === 'string' &&
                   window.__ARKRPG_PROCESS_EXEC_PATH__) {
            proc.mainModule.filename = proc.execPath;
        }
        if (typeof proc.cwd !== 'function') proc.cwd = function() { return '.'; };
        if (typeof proc.nextTick !== 'function') proc.nextTick = function(fn) { setTimeout(fn, 0); };
        if (typeof proc.exit !== 'function') proc.exit = function(code) { console.warn('[Polyfill] process.exit(' + (code || 0) + ') suppressed in WebView'); };
        window.process = proc;
    })();

})();


/* === common_media.js === */
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

/* === common_sync_xhr.js === */
/**
 * common_sync_xhr.js
 * 同步 XHR（open(..., async=false)）兼容层。
 *
 * WebKit 的 WKURLSchemeHandler 无法服务同步子资源加载：主线程同步 XHR 到
 * rpgmv:// / rpgmz:// 会命中 WebLoaderStrategy::loadResourceSynchronously
 * 恒定失败（error=0），插件拿到的是网络错误而不是文件内容。
 * 受影响的常见插件：
 *   - NekoGakuen_MulitLanguage：插件加载期同步拉 data/text.csv，失败后整个
 *     插件半死（csvData 无效 → getLangDataText 运行时 TypeError）
 *   - NekoGakuen_FontManager：checkFontFile 同步探测字体
 *   - polyfill 自己的 fs.readFileSync（NW.js 分支的插件全走它，如 UTA_CommonSave）
 *
 * 方案：拦 prototype 的 send，async=false 且目标为本 app 自定义 scheme 时，
 * 改走 prompt() 同步桥（__NATIVE_SYNC_GET__，见 WebViewCoordinator），由原生
 * 侧按 scheme handler 同源的解析逻辑读文件、base64 回传。响应格式：
 *   "<status>|<mime>|<base64>"
 * 大文件由原生侧设上限返回 413（WebKit IPC 不适合传 MB 级字符串），插件语义
 * 等同于拿到非 200，与修复前的失败行为一致，不会更糟。
 *
 * prompt 是 WKUIDelegate 的同步对话框边界，iOS WebKit 可能在返回后
 * 把原本 running 的 AudioContext 留在
 * suspended；桥调用后只恢复这个“调用前已在运行”的 context，不触发
 * 未经用户授权的首次音频启动。
 *
 * 成功读取的包内只读 GET/HEAD 会做小容量会话缓存，避免插件每帧轮询同一文件时
 * 反复进入 prompt()。缓存只覆盖 game host、只保存 200，写文件时由
 * common_fs.js 主动清空。
 *
 * 异步 XHR 完全不受影响（原样走 origSend）；非本 app scheme 的同步请求同样
 * 原样放行。
 */
(function () {
    var proto = window.XMLHttpRequest && XMLHttpRequest.prototype;
    if (!proto || proto.__arkRpgSyncXhrPatched) return;
    proto.__arkRpgSyncXhrPatched = true;

    var origOpen = proto.open;
    var origSend = proto.send;
    var responseCache = Object.create(null);
    var responseCacheOrder = [];
    var responseCacheBytes = 0;
    var maxCacheEntries = 64;
    var maxCacheItemBytes = 256 * 1024;
    var maxCacheBytes = 2 * 1024 * 1024;

    function cacheKey(method, abs) {
        method = String(method || 'GET').toUpperCase();
        if (method !== 'GET' && method !== 'HEAD') return '';
        if (!/^rpgm[vzc]:\/\/game(?:\/|$)/i.test(abs)) return '';
        return method + ' ' + abs;
    }

    function cachedResponse(key) {
        return key && Object.prototype.hasOwnProperty.call(responseCache, key)
            ? responseCache[key]
            : null;
    }

    function storeResponse(key, response) {
        if (!key || typeof response !== 'string' || response.length > maxCacheItemBytes) return;
        if (Object.prototype.hasOwnProperty.call(responseCache, key)) return;
        while (responseCacheOrder.length >= maxCacheEntries ||
               responseCacheBytes + response.length > maxCacheBytes) {
            var oldest = responseCacheOrder.shift();
            if (!oldest) break;
            responseCacheBytes -= responseCache[oldest].length;
            delete responseCache[oldest];
        }
        responseCache[key] = response;
        responseCacheOrder.push(key);
        responseCacheBytes += response.length;
    }

    function clearResponseCache() {
        responseCache = Object.create(null);
        responseCacheOrder = [];
        responseCacheBytes = 0;
    }

    // common_fs.js 在成功写入包内配置后调用，防止同会话读到旧内容。
    window.__arkRpgClearSyncXhrCache = clearResponseCache;

    function webAudioContext() {
        return window.WebAudio && window.WebAudio._context;
    }

    function restoreRunningAudioAfterPrompt(context, wasRunning, generation) {
        if (!wasRunning || !context || typeof context.resume !== 'function') return;

        function restoreIfSuspended() {
            if (context.__arkPromptGeneration !== generation ||
                context.state !== 'suspended' ||
                context.__arkPromptResumePending === generation) return;
            context.__arkPromptResumePending = generation;
            try {
                var result = context.resume();
                if (result && typeof result.then === 'function') {
                    result.then(function() {
                        if (context.__arkPromptResumePending === generation) {
                            context.__arkPromptResumePending = 0;
                            if (context.__arkPromptGeneration === generation) {
                                console.log('[SyncXhr] restored AudioContext after prompt, state=' + context.state);
                            }
                        }
                    }).catch(function(error) {
                        if (context.__arkPromptResumePending === generation) {
                            context.__arkPromptResumePending = 0;
                            if (context.__arkPromptGeneration === generation) {
                                console.warn('[SyncXhr] AudioContext restore after prompt failed: ' + error);
                            }
                        }
                    });
                } else {
                    if (context.__arkPromptResumePending === generation) {
                        context.__arkPromptResumePending = 0;
                    }
                }
            } catch (error) {
                if (context.__arkPromptResumePending === generation) {
                    context.__arkPromptResumePending = 0;
                }
                console.warn('[SyncXhr] AudioContext restore after prompt threw: ' + error);
            }
        }

        // 大多数 WebKit 版本在 prompt() 返回时 state 已更新；也保留一个
        // microtask 复查，覆盖 statechange 延后投递的版本。
        restoreIfSuspended();
        if (typeof Promise !== 'undefined') {
            Promise.resolve().then(restoreIfSuspended);
        }
        if (typeof setTimeout === 'function') {
            setTimeout(restoreIfSuspended, 0);
        }
    }

    function b64ToBytes(b64) {
        var bin = atob(b64);
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return bytes;
    }

    proto.open = function (method, url, async) {
        this.__arkRpgSyncXhr = (async === false);
        this.__arkRpgSyncMethod = method;
        this.__arkRpgSyncUrl = url;
        return origOpen.apply(this, arguments);
    };

    proto.send = function (body) {
        if (!this.__arkRpgSyncXhr) {
            return origSend.apply(this, arguments);
        }
        var self = this;
        var abs = '';
        try {
            abs = new URL(this.__arkRpgSyncUrl, location.href).href;
        } catch (e) {}
        if (!/^rpgm[vzc]/i.test(abs)) {
            return origSend.apply(this, arguments);
        }

        var key = cacheKey(this.__arkRpgSyncMethod, abs);
        var resp = cachedResponse(key);
        if (resp === null) {
            var contextBeforePrompt = webAudioContext();
            var audioWasRunning = !!contextBeforePrompt && contextBeforePrompt.state === 'running';
            var promptGeneration = 0;
            if (contextBeforePrompt) {
                promptGeneration = (contextBeforePrompt.__arkPromptGeneration || 0) + 1;
                contextBeforePrompt.__arkPromptGeneration = promptGeneration;
            }
            try {
                resp = prompt('__NATIVE_SYNC_GET__:' + abs, '');
            } catch (e) {}
            restoreRunningAudioAfterPrompt(contextBeforePrompt, audioWasRunning, promptGeneration);
        }
        var status = 0, mime = '', b64 = '';
        if (typeof resp === 'string' && resp.length > 0) {
            var s1 = resp.indexOf('|');
            var s2 = resp.indexOf('|', s1 + 1);
            if (s1 > 0 && s2 > s1) {
                status = parseInt(resp.slice(0, s1), 10) || 0;
                mime = resp.slice(s1 + 1, s2);
                b64 = resp.slice(s2 + 1);
            }
        }
        if (!status) {
            // 桥不可用（老版本原生/协议不匹配）：退回原生同步请求，
            // 行为与修复前一致（会失败），不再尝试。
            console.warn('[SyncXhr] bridge unavailable, falling back: ' + abs);
            return origSend.apply(this, arguments);
        }
        if (status === 200) storeResponse(key, resp);

        function define(name, value) {
            try {
                Object.defineProperty(self, name, {
                    value: value, writable: true, configurable: true
                });
            } catch (e) {}
        }

        var isBinary = (this.responseType === 'arraybuffer' || this.responseType === 'blob');
        if (status === 200) {
            try {
                if (isBinary) {
                    var bytes = b64ToBytes(b64);
                    define('response', this.responseType === 'blob'
                        ? new Blob([bytes.buffer], { type: mime })
                        : bytes.buffer);
                    // 二进制模式下访问 responseText 按规范会抛 InvalidStateError，
                    // 不定义该属性，保留原生 getter 语义。
                } else {
                    var text = new TextDecoder('utf-8').decode(b64ToBytes(b64));
                    define('response', text);
                    define('responseText', text);
                }
                define('status', 200);
                define('statusText', 'OK');
            } catch (e) {
                define('status', 500);
                define('response', '');
                define('responseText', '');
            }
        } else {
            // 404 / 413（超上限）：与网络失败同视，插件按非 200 处理
            define('status', status);
            define('statusText', status === 413 ? 'Payload Too Large' : 'Not Found');
            define('response', '');
            define('responseText', '');
        }
        define('readyState', 4);

        // 同步 XHR 语义：事件在 send() 内同步派发（readystatechange → load → loadend），
        // property 型 handler（onload 等）与 addEventListener 均会被触发
        try { self.dispatchEvent(new Event('readystatechange')); } catch (e) {}
        try { self.dispatchEvent(new Event('load')); } catch (e) {}
        try { self.dispatchEvent(new Event('loadend')); } catch (e) {}
    };

    console.log('[SyncXhr] sync XHR prompt bridge installed');
})();


/* === pixi_base_texture_fix.js === */
/**
 * pixi_base_texture_fix.js
 *
 * 修复 Pixi.js v4 BaseTexture.prototype.update 在 source=null 时崩溃的问题。
 *
 * ── 根本原因 ──────────────────────────────────────────────────────────
 *   BaseTexture.prototype.destroy() 会把 this.source 设为 null。
 *   若 destroy() 之后某处仍触发 update()（如异步事件回调），则：
 *
 *       this.realWidth = this.source.naturalWidth  // TypeError: null is not an object
 *
 *   复现游戏：MELFIAS －Azure and Crimson Verge（pixi.js v4.5.4）
 *
 * ── 修复 ──────────────────────────────────────────────────────────────
 *   在 PIXI.BaseTexture.prototype.update 前置 null guard：
 *   若 this.source 为 null（已销毁），直接 return，不执行原逻辑。
 *
 * 注入时机：atDocumentEnd（Phase 2，pixi.js 作为同步 <script> 在 DOMContentLoaded 前已执行）
 */
(function () {
    'use strict';

    function patchPixiBaseTexture() {
        if (typeof PIXI === 'undefined' || !PIXI.BaseTexture || !PIXI.BaseTexture.prototype) {
            return false;
        }

        // 仅修补 Pixi v4：v4 的 source 直接挂在 BaseTexture 上（HTMLImageElement）。
        // v5 移除了 this.source，改为 this.resource.source；若在 v5 应用此补丁，
        // !this.source 恒为 true（undefined），导致所有 update() 被跳过，纹理无法加载。
        var majorVersion = parseInt((PIXI.VERSION || '0').split('.')[0], 10);
        if (majorVersion !== 4) {
            console.log('[PixiFix] Skipping patch — Pixi v' + (PIXI.VERSION || '?') + ' is not v4');
            return true;
        }

        var proto = PIXI.BaseTexture.prototype;

        // 避免重复 patch
        if (proto._arkUpdatePatched) return true;
        proto._arkUpdatePatched = true;

        var orig = proto.update;
        proto.update = function () {
            // source 为 null 说明 BaseTexture 已被 destroy()，直接跳过
            if (!this.source) return;
            return orig.apply(this, arguments);
        };

        console.log('[PixiFix] BaseTexture.prototype.update null-guard applied (pixi ' +
            (PIXI.VERSION || '?') + ')');
        return true;
    }

    if (!patchPixiBaseTexture()) {
        // pixi.js 尚未就绪（极少见），轮询等待
        var retries = 0;
        var timer = setInterval(function () {
            if (patchPixiBaseTexture() || ++retries > 50) {
                clearInterval(timer);
            }
        }, 100);
    }
}());


/* === mac_audio.js === */
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


