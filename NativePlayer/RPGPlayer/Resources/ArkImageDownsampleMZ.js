(function () {
    'use strict';

    var DEBUG = true;
    function log() {
        if (DEBUG) console.log.apply(console, ['[ark-mz]'].concat(Array.prototype.slice.call(arguments)));
    }

    function decodedUrl(url) {
        if (!url) return '';
        var s = String(url);
        try { s = decodeURIComponent(s); } catch (e) {}
        return s;
    }

    function imageSizeOf(bitmap) {
        var img = bitmap && bitmap._image;
        if (img) return (img.naturalWidth || img.width || 0) + 'x' + (img.naturalHeight || img.height || 0);
        var canvas = bitmap && bitmap._canvas;
        if (canvas) return (canvas.width || 0) + 'x' + (canvas.height || 0);
        var bt = bitmap && bitmap._baseTexture;
        var res = bt && bt.resource;
        var src = res && (res.source || res.src);
        if (src) return (src.naturalWidth || src.width || 0) + 'x' + (src.naturalHeight || src.height || 0);
        return '0x0';
    }

    function actualBitmapSize(bitmap) {
        if (!bitmap) return null;
        var img = bitmap._image;
        if (img) {
            var iw = img.naturalWidth || img.width || 0;
            var ih = img.naturalHeight || img.height || 0;
            if (iw > 0 && ih > 0) return [iw, ih];
        }
        var canvas = bitmap._canvas;
        if (canvas && canvas.width > 0 && canvas.height > 0) return [canvas.width, canvas.height];
        var bt = bitmap._baseTexture;
        var res = bt && bt.resource;
        var src = res && (res.source || res.src);
        if (src) {
            var sw = src.naturalWidth || src.width || 0;
            var sh = src.naturalHeight || src.height || 0;
            if (sw > 0 && sh > 0) return [sw, sh];
        }
        return null;
    }

    function unicodePathVariants(path) {
        var variants = [path];
        if (path && typeof path.normalize === 'function') {
            try { variants.push(path.normalize('NFC')); } catch (e) {}
            try { variants.push(path.normalize('NFD')); } catch (e) {}
        }
        var out = [];
        var seen = {};
        for (var i = 0; i < variants.length; i++) {
            var v = variants[i];
            if (v && !seen[v]) {
                seen[v] = true;
                out.push(v);
            }
        }
        return out;
    }

    var dimMap = window._arkDims || {};
    var dimMapCI = {};
    Object.keys(dimMap).forEach(function (key) {
        dimMapCI[key.toLowerCase()] = dimMap[key];
        unicodePathVariants(key).forEach(function (variant) {
            dimMapCI[variant.toLowerCase()] = dimMap[key];
        });
    });

    function cacheDim(path, dim, aliases) {
        if (!path || !dim) return;
        var keys = [path];
        if (aliases && aliases.length) keys = keys.concat(aliases);
        keys.forEach(function (key) {
            unicodePathVariants(key).forEach(function (variant) {
                dimMap[variant] = dim;
                dimMapCI[variant.toLowerCase()] = dim;
            });
        });
    }

    function dimForPath(path) {
        var variants = unicodePathVariants(path);
        for (var i = 0; i < variants.length; i++) {
            var key = variants[i];
            var dim = dimMap[key] || dimMapCI[key.toLowerCase()];
            if (dim) return dim;
        }
        return null;
    }

    var nativeDimMisses = {};
    function fetchNativeDim(path, rawUrl) {
        if (!window._arkLazyDimLookup || !path || (nativeDimMisses[path] || 0) > 3) return null;
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', (location.protocol || 'rpgmz:') + '//game/__ark_downsample_dim__?path=' + encodeURIComponent(path), false);
            xhr.send(null);
            if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText) {
                var payload = JSON.parse(xhr.responseText);
                if (payload && payload.width > 0 && payload.height > 0) {
                    var dim = [payload.width, payload.height];
                    cacheDim(path, dim, payload.aliases || []);
                    return dim;
                }
            }
        } catch (e) {
            log('[DIM] native lookup failed raw=', rawUrl, 'decoded=', path, 'err=', e && e.message);
        }
        nativeDimMisses[path] = (nativeDimMisses[path] || 0) + 1;
        return null;
    }

    function normalizeUrl(url) {
        var path = decodedUrl(url);
        path = path.replace(/^[a-z]+:\/\/[^/]+\//, '');
        path = path.replace(/^\/+/, '');
        return path;
    }

    function lookupDim(url) {
        if (!url) return null;
        var path = normalizeUrl(url);
        var dim = dimForPath(path);
        if (dim) return dim;
        if (path.indexOf('www/') === 0) {
            dim = dimForPath(path.slice(4));
            if (dim) return dim;
        } else {
            dim = dimForPath('www/' + path);
            if (dim) return dim;
        }
        if (path.endsWith('.png')) {
            dim = dimForPath(path.replace(/\.png$/, '.rpgmvp'));
            if (dim) return dim;
        } else if (path.endsWith('.rpgmvp')) {
            dim = dimForPath(path.replace(/\.rpgmvp$/, '.png'));
            if (dim) return dim;
        }
        return fetchNativeDim(path, url);
    }

    function arkScale(bitmap) {
        if (!bitmap || !bitmap._arkOrigW) return 1;
        var actual = actualBitmapSize(bitmap);
        if (!actual || actual[0] <= 0) return 1;
        return actual[0] / bitmap._arkOrigW;
    }

    function fixBaseTexture(bt, origW, origH) {
        if (!bt || !origW || !origH || bt._arkDimSet) return;
        bt._arkDimSet = true;
        bt._arkOrigW = origW;
        bt._arkOrigH = origH;
        try { bt.width = origW; } catch (e) {}
        try { bt.height = origH; } catch (e) {}
        try { bt.realWidth = origW; } catch (e) {}
        try { bt.realHeight = origH; } catch (e) {}
    }

    function ensureArkDim(bitmap) {
        if (!bitmap || bitmap._arkOrigW || !bitmap.url) return;
        var dim = lookupDim(bitmap.url);
        if (dim) {
            bitmap._arkOrigW = dim[0];
            bitmap._arkOrigH = dim[1];
        }
    }

    function patchBitmap() {
        if (typeof Bitmap === 'undefined' || Bitmap.__arkMZDownsamplePatched) return;

        var widthDesc = Object.getOwnPropertyDescriptor(Bitmap.prototype, 'width');
        var heightDesc = Object.getOwnPropertyDescriptor(Bitmap.prototype, 'height');
        if (widthDesc && widthDesc.get && widthDesc.configurable) {
            Object.defineProperty(Bitmap.prototype, 'width', {
                get: function () {
                    ensureArkDim(this);
                    return this._arkOrigW || widthDesc.get.call(this);
                },
                configurable: true
            });
        }
        if (heightDesc && heightDesc.get && heightDesc.configurable) {
            Object.defineProperty(Bitmap.prototype, 'height', {
                get: function () {
                    ensureArkDim(this);
                    return this._arkOrigH || heightDesc.get.call(this);
                },
                configurable: true
            });
        }

        var baseDesc = Object.getOwnPropertyDescriptor(Bitmap.prototype, 'baseTexture');
        if (baseDesc && baseDesc.get && baseDesc.configurable) {
            Object.defineProperty(Bitmap.prototype, 'baseTexture', {
                get: function () {
                    ensureArkDim(this);
                    var bt = baseDesc.get.call(this);
                    if (bt && this._arkOrigW && this._arkOrigH) {
                        fixBaseTexture(bt, this._arkOrigW, this._arkOrigH);
                    }
                    return bt;
                },
                configurable: true
            });
        }

        if (Bitmap.prototype._createBaseTexture) {
            var origCreateBaseTexture = Bitmap.prototype._createBaseTexture;
            Bitmap.prototype._createBaseTexture = function (source) {
                origCreateBaseTexture.call(this, source);
                ensureArkDim(this);
                if (this._baseTexture && this._arkOrigW && this._arkOrigH) {
                    fixBaseTexture(this._baseTexture, this._arkOrigW, this._arkOrigH);
                }
            };
        }

        if (Bitmap.prototype._onLoad) {
            var origOnLoad = Bitmap.prototype._onLoad;
            Bitmap.prototype._onLoad = function () {
                ensureArkDim(this);
                var ret = origOnLoad.apply(this, arguments);
                if (this._baseTexture && this._arkOrigW && this._arkOrigH) {
                    fixBaseTexture(this._baseTexture, this._arkOrigW, this._arkOrigH);
                }
                return ret;
            };
        }

        if (Bitmap.prototype.blt) {
            var origBlt = Bitmap.prototype.blt;
            Bitmap.prototype.blt = function (source, sx, sy, sw, sh, dx, dy, dw, dh) {
                ensureArkDim(source);
                var s = arkScale(source);
                if (s < 1) {
                    if (typeof dw !== 'number' || isNaN(dw)) dw = sw;
                    if (typeof dh !== 'number' || isNaN(dh)) dh = sh;
                    sx = Math.round(sx * s);
                    sy = Math.round(sy * s);
                    sw = Math.round(sw * s);
                    sh = Math.round(sh * s);
                }
                return origBlt.call(this, source, sx, sy, sw, sh, dx, dy, dw, dh);
            };
        }

        if (Bitmap.prototype.getPixel) {
            var origGetPixel = Bitmap.prototype.getPixel;
            Bitmap.prototype.getPixel = function (x, y) {
                var s = arkScale(this);
                if (s < 1) {
                    x = Math.round(x * s);
                    y = Math.round(y * s);
                }
                return origGetPixel.call(this, x, y);
            };
        }

        if (Bitmap.prototype.getAlphaPixel) {
            var origGetAlphaPixel = Bitmap.prototype.getAlphaPixel;
            Bitmap.prototype.getAlphaPixel = function (x, y) {
                var s = arkScale(this);
                if (s < 1) {
                    x = Math.round(x * s);
                    y = Math.round(y * s);
                }
                return origGetAlphaPixel.call(this, x, y);
            };
        }

        Bitmap.__arkMZDownsamplePatched = true;
        log('Bitmap patched');
    }

    function patchSprite() {
        if (typeof Sprite === 'undefined' || Sprite.__arkMZDownsamplePatched) return;

        if (Sprite.prototype._refresh) {
            var origRefresh = Sprite.prototype._refresh;
            Sprite.prototype._refresh = function () {
                var bitmap = this._bitmap;
                if (bitmap) {
                    ensureArkDim(bitmap);
                    if (bitmap._baseTexture && bitmap._arkOrigW && bitmap._arkOrigH) {
                        fixBaseTexture(bitmap._baseTexture, bitmap._arkOrigW, bitmap._arkOrigH);
                    }
                }
                return origRefresh.apply(this, arguments);
            };
        }

        Sprite.__arkMZDownsamplePatched = true;
        log('Sprite patched');
    }

    function patchTextureFrameSafety() {
        if (typeof PIXI === 'undefined' || !PIXI.Texture || !PIXI.Texture.prototype) return;
        if (PIXI.Texture.__arkMZFrameSafetyPatched) return;
        var desc = Object.getOwnPropertyDescriptor(PIXI.Texture.prototype, 'frame');
        if (!desc || !desc.set || !desc.configurable) return;
        var origSet = desc.set;
        var logCount = 0;
        Object.defineProperty(PIXI.Texture.prototype, 'frame', {
            get: desc.get,
            set: function (rect) {
                try {
                    return origSet.call(this, rect);
                } catch (e) {
                    var bt = this.baseTexture;
                    if (bt && rect && bt._arkOrigW && bt._arkOrigH) {
                        fixBaseTexture(bt, bt._arkOrigW, bt._arkOrigH);
                        if (logCount < 20) {
                            logCount++;
                            log('[FrameSafety] retry #' + logCount,
                                'frame=' + rect.x + ',' + rect.y + '+' + rect.width + 'x' + rect.height,
                                'bt=' + bt.width + 'x' + bt.height,
                                'err=' + (e && e.message));
                        }
                        return origSet.call(this, rect);
                    }
                    throw e;
                }
            },
            configurable: true
        });
        PIXI.Texture.__arkMZFrameSafetyPatched = true;
        log('Texture frame safety patched');
    }

    function autoLookNpcImageSuffix() {
        try {
            var raw = localStorage.getItem('GameLanguage');
            if (!raw) return '';
            var data = JSON.parse(raw);
            return data && data.dataName ? data.dataName : '';
        } catch (e) {
            return '';
        }
    }

    function ensureFlyCatAutoLookNpcHud(scene) {
        if (!scene || typeof Scene_Map === 'undefined' || !(scene instanceof Scene_Map)) return;
        if (typeof scene.openLookNpc !== 'function') return;
        if (typeof scene.createLookNpcWindow !== 'function') return;
        if (typeof scene.createTimeWindow !== 'function') return;
        if (typeof ImageManager === 'undefined' || typeof Sprite === 'undefined') return;

        var created = false;
        var img = autoLookNpcImageSuffix();
        if (!scene._timeSprite && typeof scene.addChild === 'function') {
            scene._timeSprite = new Sprite();
            scene._timeSprite.bitmap = ImageManager.loadPicture('time' + img);
            scene.addChild(scene._timeSprite);
            created = true;
        }
        if (!scene._timeSprite_1 && typeof Sprite_AutoLookButton !== 'undefined' && typeof scene.addChild === 'function') {
            scene._timeSprite_1 = new Sprite_AutoLookButton();
            if (scene._timeSprite_1.setClickHandler) {
                scene._timeSprite_1.setClickHandler(scene.openLookNpc.bind(scene));
            }
            scene._timeSprite_1.bitmap = ImageManager.loadPicture('xunlu' + img);
            scene._timeSprite_1.x = 10;
            scene._timeSprite_1.y = 106;
            scene.addChild(scene._timeSprite_1);
            created = true;
        }
        if (!scene._timeSprite_2 && typeof scene.addChild === 'function') {
            scene._timeSprite_2 = new Sprite();
            scene._timeSprite_2.bitmap = ImageManager.loadPicture('autolook' + img);
            scene._timeSprite_2.x = 350;
            scene._timeSprite_2.y = 0;
            scene._timeSprite_2.visible = false;
            scene.addChild(scene._timeSprite_2);
            created = true;
        }
        if (!scene._lookNpcWindow) {
            try {
                scene.createLookNpcWindow();
                created = true;
            } catch (e1) {
                log('[Compat] AutoLookNpc createLookNpcWindow failed', e1 && e1.message);
            }
        }
        if (!scene._timeWindow) {
            try {
                scene.createTimeWindow();
                created = true;
            } catch (e2) {
                log('[Compat] AutoLookNpc createTimeWindow failed', e2 && e2.message);
            }
        }
        if (created && !scene._arkMZAutoLookNpcHudLogged) {
            scene._arkMZAutoLookNpcHudLogged = true;
            log('[Compat] AutoLookNpc HUD repaired before Scene_Map.update');
        }
    }

    function patchFlyCatAutoLookNpcCompat() {
        if (typeof Scene_Map === 'undefined' || !Scene_Map.prototype || Scene_Map.__arkMZAutoLookNpcCompatPatched) return;
        if (typeof Scene_Map.prototype.update !== 'function') return;
        var origUpdate = Scene_Map.prototype.update;
        Scene_Map.prototype.update = function () {
            ensureFlyCatAutoLookNpcHud(this);
            return origUpdate.apply(this, arguments);
        };
        Scene_Map.__arkMZAutoLookNpcCompatPatched = true;
        log('AutoLookNpc compat patched');
    }

    function patch() {
        patchTextureFrameSafety();
        patchBitmap();
        patchSprite();
        patchFlyCatAutoLookNpcCompat();
    }

    var tries = 0;
    var timer = setInterval(function () {
        tries++;
        try { patch(); } catch (e) { log('patch failed', e && e.message); }
        if ((typeof Bitmap !== 'undefined' && Bitmap.__arkMZDownsamplePatched) || tries > 200) {
            clearInterval(timer);
        }
    }, 50);
})();
