(function () {
    'use strict';

    var DEBUG = true;
    function log() {
        if (DEBUG) console.log.apply(console, ['[ark]'].concat(Array.prototype.slice.call(arguments)));
    }

    var diagCounts = {};
    function diag(tag, limit) {
        if (!DEBUG) return;
        var count = diagCounts[tag] || 0;
        if (count >= limit) return;
        diagCounts[tag] = count + 1;
        console.log.apply(console, ['[ark]', '[DIAG]', tag + '#' + diagCounts[tag]].concat(Array.prototype.slice.call(arguments, 2)));
    }

    function shortStack() {
        try {
            throw new Error();
        } catch (e) {
            return String(e.stack || '').split('\n').slice(2, 7).join(' <- ');
        }
    }

    function decodedUrl(url) {
        if (!url) return '';
        var s = String(url);
        try { s = decodeURIComponent(s); } catch (e) {}
        return s;
    }

    function isDiagUrl(url) {
        var s = decodedUrl(url);
        return s.indexOf('img/pictures/') >= 0 ||
            s.indexOf('img/karryn/map/') >= 0 ||
            s.indexOf('img/battlebacks1/') >= 0 ||
            s.indexOf('img/battlebacks2/') >= 0 ||
            s.indexOf('img/system/') >= 0 ||
            s.indexOf('img/titles') >= 0 ||
            s.indexOf('Menu__layer') >= 0 ||
            s.indexOf('Bar_waitress_sex') >= 0;
    }

    function isWatchUrl(url) {
        if (!url) return false;
        var s = String(url);
        return s.indexOf('titles1') >= 0 &&
            (s.indexOf('%E6%A0%87%E9%A2%98') >= 0 || s.indexOf('标题') >= 0);
    }

    function isMenuGifUrl(url) {
        if (!url) return false;
        return String(url).indexOf('Menu__layer_gif') >= 0;
    }

    function isStandWatchUrl(url) {
        if (!url) return false;
        var s = String(url);
        return s.indexOf('actor01_pose01_body_0003') >= 0 ||
            s.indexOf('hair/01_1') >= 0 ||
            s.indexOf('hairDress/01_1') >= 0;
    }

    function isMenuPictureWatchUrl(url) {
        if (!url) return false;
        var s = String(url);
        try { s = decodeURIComponent(s); } catch (e) {}
        return s.indexOf('img/pictures/メニュー') >= 0 ||
            s.indexOf('img/pictures/背景') >= 0 ||
            s.indexOf('img/pictures/冒険者') >= 0;
    }

    function isKnownFullImageSpriteUrl(url) {
        return isSpecialActionSeqUrl(url) || isMenuPictureWatchUrl(url) || isKarrynMapLayerUrl(url);
    }

    function isFullImageSpriteUrl(url) {
        return isKnownFullImageSpriteUrl(url);
    }

    function isSpecialActionSeqUrl(url) {
        if (!url) return false;
        var s = String(url);
        try { s = decodeURIComponent(s); } catch (e) {}
        return s.indexOf('img/Special__actionSeq/') >= 0;
    }

    function isKarrynMapLayerUrl(url) {
        if (!url) return false;
        var s = decodedUrl(url);
        return s.indexOf('img/karryn/map/') >= 0 ||
            s.indexOf('img/pictures/map_move') >= 0;
    }

    function isPictureUrl(url) {
        return decodedUrl(url).indexOf('img/pictures/') >= 0;
    }

    function shouldCheckFullImageSprite(sprite, bitmap) {
        if (!sprite || !bitmap) return false;
        if (isKnownFullImageSpriteUrl(bitmap._url)) return true;
        return typeof Sprite_Picture !== 'undefined' &&
            sprite instanceof Sprite_Picture &&
            isPictureUrl(bitmap._url);
    }

    function isLargePictureBitmap(bitmap) {
        if (!bitmap || !bitmap._arkOrigW || !bitmap._arkOrigH) return false;
        var gw = 0;
        var gh = 0;
        if (typeof Graphics !== 'undefined') {
            gw = Graphics.width || Graphics.boxWidth || Graphics._width || 0;
            gh = Graphics.height || Graphics.boxHeight || Graphics._height || 0;
        }
        if (gw > 0 && gh > 0) {
            return bitmap._arkOrigW >= gw * 0.65 && bitmap._arkOrigH >= gh * 0.65;
        }
        return bitmap._arkOrigW >= 700 && bitmap._arkOrigH >= 500;
    }

    function isExcludedTilingUrl(url) {
        if (!url) return false;
        var s = String(url);
        try { s = decodeURIComponent(s); } catch (e) {}
        s = s.replace(/^[a-z]+:\/\/[^/]+\//, '').replace(/^\/+/, '').toLowerCase();
        return s.indexOf('img/titles1/') === 0 || s.indexOf('img/titles2/') === 0;
    }

    function imageSizeOf(bitmap) {
        var img = bitmap && bitmap._image;
        if (!img) return 'no-image';
        return (img.naturalWidth || img.width || 0) + 'x' + (img.naturalHeight || img.height || 0);
    }

    function baseTextureState(bt) {
        if (!bt) return 'no-bt';
        var src = bt.source;
        var srcW = src && (src.naturalWidth || src.width || 0);
        var srcH = src && (src.naturalHeight || src.height || 0);
        return 'bt(width=' + bt.width + ',height=' + bt.height +
            ',_width=' + bt._width + ',_height=' + bt._height +
            ',real=' + bt.realWidth + 'x' + bt.realHeight +
            ',src=' + srcW + 'x' + srcH +
            ',arkDimSet=' + !!bt._arkDimSet + ')';
    }

    function actualBitmapSize(bitmap) {
        if (!bitmap) return null;
        var img = bitmap._image;
        if (img) {
            var iw = img.naturalWidth || img.width || 0;
            var ih = img.naturalHeight || img.height || 0;
            if (iw > 0 && ih > 0) return [iw, ih];
        }
        var canvas = bitmap.__canvas;
        if (canvas && canvas.width > 0 && canvas.height > 0) return [canvas.width, canvas.height];
        var bt = bitmap.__baseTexture;
        var src = bt && bt.source;
        if (src) {
            var sw = src.naturalWidth || src.width || 0;
            var sh = src.naturalHeight || src.height || 0;
            if (sw > 0 && sh > 0) return [sw, sh];
        }
        return null;
    }

    function isOnePixelMissingStub(bitmap) {
        if (!bitmap || bitmap._arkOrigW || bitmap._arkOrigH) return false;
        var actual = actualBitmapSize(bitmap);
        return !!actual && actual[0] <= 1 && actual[1] <= 1;
    }

    function setTextureFrameUnchecked(texture, rect) {
        if (!texture || !rect) return false;
        try { texture._frame = rect; } catch (e) {}
        try { texture.noFrame = false; } catch (e) {}
        try { texture.valid = !!(rect.width && rect.height && texture.baseTexture && texture.baseTexture.hasLoaded); } catch (e) {}
        try {
            if (!texture.trim && !texture.rotate) texture.orig = rect;
        } catch (e) {}
        if (texture.valid && typeof texture._updateUvs === 'function') {
            try { texture._updateUvs(); } catch (e) {}
        }
        return true;
    }

    function ensureArkDim(bitmap) {
        if (!bitmap || bitmap._arkOrigW || !bitmap._url) return;
        var dim = lookupDim(bitmap._url);
        if (dim) {
            bitmap._arkOrigW = dim[0];
            bitmap._arkOrigH = dim[1];
        }
    }

    var dimMap = window._arkDims || {};
    var dimKeys = Object.keys(dimMap);
    log('dimMap entries:', dimKeys.length);
    var faceKeys = dimKeys.filter(function(k) { return k.indexOf('faces') >= 0; });
    if (faceKeys.length > 0) {
        log('face entries:', faceKeys.slice(0, 3).join(', '), '...');
    } else {
        log('WARN: no face entries in dimMap');
    }

    var dimMapCI = {};
    for (var ki = 0; ki < dimKeys.length; ki++) {
        var key = dimKeys[ki];
        dimMapCI[key.toLowerCase()] = dimMap[key];
        var variants = unicodePathVariants(key);
        for (var vi = 0; vi < variants.length; vi++) {
            dimMapCI[variants[vi].toLowerCase()] = dimMap[key];
        }
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

    function dimForPath(path) {
        var variants = unicodePathVariants(path);
        for (var i = 0; i < variants.length; i++) {
            var key = variants[i];
            var dim = dimMap[key] || dimMapCI[key.toLowerCase()];
            if (dim) return dim;
        }
        return null;
    }

    function cacheDim(path, dim, aliases) {
        if (!path || !dim) return;
        var keys = [path];
        if (aliases && aliases.length) keys = keys.concat(aliases);
        for (var i = 0; i < keys.length; i++) {
            var variants = unicodePathVariants(keys[i]);
            for (var j = 0; j < variants.length; j++) {
                var key = variants[j];
                dimMap[key] = dim;
                dimMapCI[key.toLowerCase()] = dim;
            }
        }
    }

    var nativeDimMisses = {};
    function fetchNativeDim(path, rawUrl) {
        if (!window._arkLazyDimLookup || !path || (nativeDimMisses[path] || 0) > 3) return null;
        try {
            var xhr = new XMLHttpRequest();
            var endpoint = (location.protocol || 'rpgmv:') + '//game/__ark_downsample_dim__?path=' + encodeURIComponent(path);
            xhr.open('GET', endpoint, false);
            xhr.send(null);
            if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText) {
                var payload = JSON.parse(xhr.responseText);
                if (payload && payload.width > 0 && payload.height > 0) {
                    var dim = [payload.width, payload.height];
                    cacheDim(path, dim, payload.aliases || []);
                    if (isWatchUrl(rawUrl) || isMenuPictureWatchUrl(rawUrl)) {
                        log('[DIM] hit native raw=', rawUrl, 'decoded=', path, 'dim=', dim[0] + 'x' + dim[1]);
                    }
                    return dim;
                }
            }
        } catch (e) {
            if (isWatchUrl(rawUrl) || isMenuPictureWatchUrl(rawUrl)) {
                log('[DIM] native lookup failed raw=', rawUrl, 'decoded=', path, 'err=', e && e.message);
            }
        }
        nativeDimMisses[path] = (nativeDimMisses[path] || 0) + 1;
        return null;
    }

    function lookupDim(url) {
        if (!url) return null;
        var rawUrl = String(url);
        var path = url.replace(/^[a-z]+:\/\/[^/]+\//, '');
        try { path = decodeURIComponent(path); } catch(e) {}
        var dim = dimForPath(path);
        if (dim) {
            if (isWatchUrl(rawUrl) || isMenuPictureWatchUrl(rawUrl)) log('[DIM] hit exact raw=', rawUrl, 'decoded=', path, 'dim=', dim[0] + 'x' + dim[1]);
            return dim;
        }
        if (path.endsWith('.rpgmvp')) {
            var png = path.replace(/\.rpgmvp$/, '.png');
            dim = dimForPath(png);
            if (dim) {
                if (isWatchUrl(rawUrl) || isMenuPictureWatchUrl(rawUrl)) log('[DIM] hit png-alias raw=', rawUrl, 'decoded=', path, 'alias=', png, 'dim=', dim[0] + 'x' + dim[1]);
                return dim;
            }
        }
        if (path.endsWith('.png')) {
            var rpgmvp = path.replace(/\.png$/, '.rpgmvp');
            dim = dimForPath(rpgmvp);
            if (dim) {
                if (isWatchUrl(rawUrl) || isMenuPictureWatchUrl(rawUrl)) log('[DIM] hit rpgmvp-alias raw=', rawUrl, 'decoded=', path, 'alias=', rpgmvp, 'dim=', dim[0] + 'x' + dim[1]);
                return dim;
            }
        }
        dim = fetchNativeDim(path, rawUrl);
        if (dim) return dim;
        if (isWatchUrl(rawUrl) || isMenuPictureWatchUrl(rawUrl)) {
            log('[DIM] MISS raw=', rawUrl, 'decoded=', path,
                'exact=', !!dimMap[path],
                'ci=', !!dimMapCI[path.toLowerCase()]);
        }
        return null;
    }

    function arkScale(bitmap) {
        if (!bitmap._arkOrigW) return 1;
        var c = bitmap.__canvas;
        if (c && c.width > 0) return c.width / bitmap._arkOrigW;
        var img = bitmap._image;
        if (img && img.naturalWidth) return img.naturalWidth / bitmap._arkOrigW;
        return 1;
    }

    function fixBaseTexture(bt, origW, origH) {
        if (!bt) return;
        if (bt._arkDimSet) return;
        bt._arkDimSet = true;

        try { bt._width = origW; } catch (e) {}
        try { bt._height = origH; } catch (e) {}
        try { if (bt.realWidth !== undefined) bt.realWidth = origW; } catch (e) {}
        try { if (bt.realHeight !== undefined) bt.realHeight = origH; } catch (e) {}

        try {
            Object.defineProperty(bt, 'width', {
                get: function () { return origW; },
                set: function () {},
                configurable: true,
                enumerable: true
            });
        } catch (e) {}
        try {
            Object.defineProperty(bt, 'height', {
                get: function () { return origH; },
                set: function () {},
                configurable: true,
                enumerable: true
            });
        } catch (e) {}

        var origUpdate = bt.update;
        bt.update = function () {
            origUpdate.call(this);
            try { this._width = origW; } catch (e) {}
            try { this._height = origH; } catch (e) {}
        };
    }

    function patch() {
        if (typeof Bitmap === 'undefined') return false;
        if (Bitmap.__arkDownsamplePatched) return true;

        // ── PIXI.Texture.frame setter safety net ──────────────────────
        // 最终防线：当 frame 超出 baseTexture 物理维度时，推算原始维度并修复。
        // 非降采样图片的 frame 永远在物理维度内，安全网不会误触发。
        if (typeof PIXI !== 'undefined' && PIXI.Texture && PIXI.Texture.prototype) {
            var _frameDesc = Object.getOwnPropertyDescriptor(PIXI.Texture.prototype, 'frame');
            if (_frameDesc && _frameDesc.set && !_frameDesc._arkPatched) {
                var _origFrameSetter = _frameDesc.set;
                var _safetyLogCount = 0;
                Object.defineProperty(PIXI.Texture.prototype, 'frame', {
                    get: _frameDesc.get,
                    set: function (rect) {
                        var bt = this.baseTexture;
                        if (bt && rect) {
                            var src = bt.source;
                            var physW = src && (src.naturalWidth || src.width) || 0;
                            var physH = src && (src.naturalHeight || src.height) || 0;
                            var btW = bt.width || bt._width || 0;
                            var btH = bt.height || bt._height || 0;
                            var frameOverflow = physW > 0 && physH > 0 &&
                                (rect.x + rect.width > physW || rect.y + rect.height > physH);
                            var baseOverflow = btW > 0 && btH > 0 &&
                                (rect.x + rect.width > btW || rect.y + rect.height > btH);
                            if ((frameOverflow || baseOverflow) &&
                                ((physW > 0 && physW <= 1 && physH > 0 && physH <= 1) ||
                                 (btW > 0 && btW <= 1 && btH > 0 && btH <= 1)) &&
                                typeof PIXI !== 'undefined' && PIXI.Rectangle) {
                                if (_safetyLogCount < 30) {
                                    _safetyLogCount++;
                                    log('[FrameSafetyStub] #' + _safetyLogCount,
                                        'phys=' + physW + 'x' + physH,
                                        'bt=' + btW + 'x' + btH,
                                        'frame=' + rect.x + ',' + rect.y + '+' + rect.width + 'x' + rect.height);
                                }
                                return setTextureFrameUnchecked(this, new PIXI.Rectangle(0, 0, 1, 1));
                            }
                            if (!bt._arkDimSet && physW > 1 && physH > 1 && (frameOverflow || baseOverflow) && window._arkDownsampleScale && window._arkDownsampleScale < 1) {
                                var scale = window._arkDownsampleScale;
                                var origW = Math.ceil(physW / scale);
                                var origH = Math.ceil(physH / scale);
                                fixBaseTexture(bt, origW, origH);
                                // Backfill associated Bitmap so blt/getPixel also work
                                if (bt._arkBitmap && !bt._arkBitmap._arkOrigW) {
                                    bt._arkBitmap._arkOrigW = origW;
                                    bt._arkBitmap._arkOrigH = origH;
                                }
                                if (_safetyLogCount < 30) {
                                    _safetyLogCount++;
                                    log('[FrameSafety] #' + _safetyLogCount,
                                        'phys=' + physW + 'x' + physH,
                                        'inferred=' + origW + 'x' + origH,
                                        'frame=' + rect.x + ',' + rect.y + '+' + rect.width + 'x' + rect.height);
                                }
                            }
                        }
                        try {
                            return _origFrameSetter.call(this, rect);
                        } catch (e) {
                            var bt2 = this.baseTexture;
                            var src2 = bt2 && bt2.source;
                            var physW2 = src2 && (src2.naturalWidth || src2.width) || 0;
                            var physH2 = src2 && (src2.naturalHeight || src2.height) || 0;
                            var btW2 = bt2 && (bt2.width || bt2._width) || 0;
                            var btH2 = bt2 && (bt2.height || bt2._height) || 0;
                            if (rect &&
                                ((physW2 <= 1 && physH2 <= 1) || (btW2 <= 1 && btH2 <= 1)) &&
                                typeof PIXI !== 'undefined' && PIXI.Rectangle) {
                                if (_safetyLogCount < 30) {
                                    _safetyLogCount++;
                                    log('[FrameSafetyStubCatch] #' + _safetyLogCount,
                                        'phys=' + physW2 + 'x' + physH2,
                                        'bt=' + btW2 + 'x' + btH2,
                                        'frame=' + rect.x + ',' + rect.y + '+' + rect.width + 'x' + rect.height,
                                        'err=' + (e && e.message));
                                }
                                return setTextureFrameUnchecked(this, new PIXI.Rectangle(0, 0, 1, 1));
                            }
                            throw e;
                        }
                    },
                    configurable: true
                });
                _frameDesc._arkPatched = true;
                log('PIXI.Texture.frame setter safety net installed');
            }
        }

        var widthDesc = Object.getOwnPropertyDescriptor(Bitmap.prototype, 'width');
        var heightDesc = Object.getOwnPropertyDescriptor(Bitmap.prototype, 'height');
        if (widthDesc && widthDesc.get) {
            Object.defineProperty(Bitmap.prototype, 'width', {
                get: function () {
                    if (!this._arkOrigW && this._url) {
                        var dim = lookupDim(this._url);
                        if (dim) {
                            this._arkOrigW = dim[0];
                            this._arkOrigH = dim[1];
                        }
                    }
                    if (this._arkOrigW) return this._arkOrigW;
                    return widthDesc.get.call(this);
                },
                configurable: true
            });
        }
        if (heightDesc && heightDesc.get) {
            Object.defineProperty(Bitmap.prototype, 'height', {
                get: function () {
                    if (!this._arkOrigH && this._url) {
                        var dim = lookupDim(this._url);
                        if (dim) {
                            this._arkOrigW = dim[0];
                            this._arkOrigH = dim[1];
                        }
                    }
                    if (this._arkOrigH) return this._arkOrigH;
                    return heightDesc.get.call(this);
                },
                configurable: true
            });
        }

        if (Bitmap.prototype._requestImage) {
            var origRequestImage = Bitmap.prototype._requestImage;
            var _reqLogCount = 0;
            Bitmap.prototype._requestImage = function (url) {
                var dim = lookupDim(url);
                if (dim) {
                    this._arkOrigW = dim[0];
                    this._arkOrigH = dim[1];
                    this._arkApplied = true;
                } else {
                    if (url && (url.indexOf('/faces/') >= 0 || url.indexOf('/titles') >= 0 || url.indexOf('/pictures/') >= 0)) {
                        log('NO-DIM:', url);
                    }
                }
                if (_reqLogCount < 20 && dim) {
                    _reqLogCount++;
                    log('REQ#' + _reqLogCount, url, '→', dim[0] + 'x' + dim[1]);
                }
                return origRequestImage.call(this, url);
            };
            log('_requestImage patched');
        } else {
            log('WARN: Bitmap.prototype._requestImage not found');
        }

        if (Bitmap.prototype._createBaseTexture) {
            var origCreateBaseTexture = Bitmap.prototype._createBaseTexture;
            Bitmap.prototype._createBaseTexture = function (source) {
                if (this.__baseTexture) {
                    return;
                }
                origCreateBaseTexture.call(this, source);
                // Backlink so frame setter safety net can find this Bitmap
                if (this.__baseTexture) {
                    this.__baseTexture._arkBitmap = this;
                }
                if (!this._arkOrigW && this._url) {
                    var dim = lookupDim(this._url);
                    if (dim) {
                        this._arkOrigW = dim[0];
                        this._arkOrigH = dim[1];
                    }
                }
                if (this._arkOrigW && this._arkOrigH) {
                    fixBaseTexture(this.__baseTexture, this._arkOrigW, this._arkOrigH);
                }
            };
        }

        var btPubDesc = Object.getOwnPropertyDescriptor(Bitmap.prototype, 'baseTexture');
        if (btPubDesc && btPubDesc.get && btPubDesc.configurable) {
            Object.defineProperty(Bitmap.prototype, 'baseTexture', {
                get: function () {
                    if (!this._arkOrigW && this._url) {
                        var dim = lookupDim(this._url);
                        if (dim) {
                            this._arkOrigW = dim[0];
                            this._arkOrigH = dim[1];
                        }
                    }
                    var bt = btPubDesc.get.call(this);
                    if (bt && !bt._arkBitmap) bt._arkBitmap = this;
                    if (bt && !bt._arkDimSet && this._arkOrigW && this._arkOrigH) {
                        fixBaseTexture(bt, this._arkOrigW, this._arkOrigH);
                    }
                    return bt;
                },
                configurable: true
            });
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

        if (Bitmap.prototype.blt) {
            var origBlt = Bitmap.prototype.blt;
            var _bltLogCount = 0;
            var _faceLogCount = 0;
            Bitmap.prototype.blt = function (source, sx, sy, sw, sh, dx, dy, dw, dh) {
                // Fallback: if _arkOrigW not set yet, try looking up from dimMap
                if (!source._arkOrigW && source._url) {
                    var dim = lookupDim(source._url);
                    if (dim) {
                        source._arkOrigW = dim[0];
                        source._arkOrigH = dim[1];
                    }
                }
                var s = arkScale(source);
                var isFace = source._url && source._url.indexOf('faces') >= 0;
                if (isFace && _faceLogCount < 10) {
                    _faceLogCount++;
                    var cw = source.__canvas ? source.__canvas.width : 'null';
                    var iw = source._image ? source._image.naturalWidth : 'noImg';
                    var ready = source.isReady ? source.isReady() : '?';
                    log('FACE-BLT#' + _faceLogCount, 'scale=' + s.toFixed(4),
                        'ready=' + ready, '__cw=' + cw, 'imgNW=' + iw,
                        'origW=' + source._arkOrigW, 'url=' + source._url,
                        'src(' + sx + ',' + sy + ',' + sw + ',' + sh + ')',
                        'dst(' + dx + ',' + dy + ',' + dw + ',' + dh + ')');
                } else if (_bltLogCount < 5 && source._arkOrigW) {
                    _bltLogCount++;
                    log('blt#' + _bltLogCount, 'scale=' + s.toFixed(4),
                        'origW=' + source._arkOrigW,
                        'src(' + sx + ',' + sy + ',' + sw + ',' + sh + ')',
                        'dst(' + dx + ',' + dy + ',' + dw + ',' + dh + ')');
                }
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

        if (Bitmap.prototype.bltImage) {
            var origBltImage = Bitmap.prototype.bltImage;
            Bitmap.prototype.bltImage = function (source, sx, sy, sw, sh, dx, dy, dw, dh) {
                if (!source._arkOrigW && source._url) {
                    var dim = lookupDim(source._url);
                    if (dim) {
                        source._arkOrigW = dim[0];
                        source._arkOrigH = dim[1];
                    }
                }
                var s = arkScale(source);
                if (s < 1) {
                    if (typeof dw !== 'number' || isNaN(dw)) dw = sw;
                    if (typeof dh !== 'number' || isNaN(dh)) dh = sh;
                    sx = Math.round(sx * s);
                    sy = Math.round(sy * s);
                    sw = Math.round(sw * s);
                    sh = Math.round(sh * s);
                }
                return origBltImage.call(this, source, sx, sy, sw, sh, dx, dy, dw, dh);
            };
        }

        Bitmap.__arkDownsamplePatched = true;
        return true;
    }

    // Patch Bitmap._onLoad as a fallback to ensure _arkOrigW is set
    // before load listeners fire (covers cached bitmaps, purge+decode path, etc.)
    function patchBitmapOnLoad() {
        if (typeof Bitmap === 'undefined' || !Bitmap.prototype._onLoad) return false;
        if (Bitmap.__arkOnLoadPatched) return true;

        var origOnLoad = Bitmap.prototype._onLoad;
        Bitmap.prototype._onLoad = function() {
            if (!this._arkOrigW && this._url) {
                var dim = lookupDim(this._url);
                if (dim) {
                    this._arkOrigW = dim[0];
                    this._arkOrigH = dim[1];
                }
            }
            return origOnLoad.apply(this, arguments);
        };

        Bitmap.__arkOnLoadPatched = true;
        return true;
    }

    // Patch pixi-tilemap: two changes for downsampled textures:
    //
    // 1. Scale atlas upload positions:
    //    Original: images uploaded at quadrant offsets (0, 1024, 0, 1024)
    //    Downsampled: upload at (0, 1024*scale, 0, 1024*scale)
    //    This ensures the vertex data's shiftU (always 0 or 1024) maps correctly
    //    when combined with scaled uSamplerSize.
    //
    // 2. Scale uSamplerSize:
    //    Original: 1/2048 (pixel coords → UV for 2048-wide atlas)
    //    Downsampled: scale/2048 (accounts for smaller images in atlas)
    //
    // pixi v4.5.4 uses property setters on shader.uniforms that immediately
    // call gl.uniformXfv when a value is assigned, so we must assign a NEW
    // array (not modify in-place) to trigger the setter.
    function patchTilemap() {
        if (typeof PIXI === 'undefined' || !PIXI.tilemap || !PIXI.tilemap.TileRenderer) return false;
        if (PIXI.tilemap.TileRenderer.__arkPatched) return true;

        var _lastScale = 1;
        var origBindTextures = PIXI.tilemap.TileRenderer.prototype.bindTextures;
        if (origBindTextures) {
            PIXI.tilemap.TileRenderer.prototype.bindTextures = function (renderer, shader, textures) {
                var scale = 1;
                for (var i = 0; i < textures.length; i++) {
                    var t = textures[i];
                    if (t && t.baseTexture && t.baseTexture.source) {
                        var src = t.baseTexture.source;
                        var srcW = src.naturalWidth || src.width;
                        var logW = t.baseTexture.width;
                        if (srcW > 0 && logW > srcW) {
                            scale = srcW / logW;
                            break;
                        }
                    }
                }

                // Scale atlas quadrant positions so downsampled images are placed
                // at (0, 1024*scale, 0, 1024*scale) instead of (0, 1024, 0, 1024).
                // This makes vertex shiftU (hardcoded 0/1024) combined with scaled
                // uSamplerSize map to the correct atlas pixels.
                if (scale !== _lastScale) {
                    _lastScale = scale;
                    var bounds = this.boundSprites;
                    if (bounds) {
                        for (var bi = 0; bi < bounds.length; bi++) {
                            for (var bj = 0; bj < bounds[bi].length; bj++) {
                                bounds[bi][bj].position.x = 1024 * scale * (bj & 1);
                                bounds[bi][bj].position.y = 1024 * scale * (bj >> 1);
                            }
                        }
                        log('atlas positions scaled by', scale);
                    }
                }

                origBindTextures.call(this, renderer, shader, textures);

                if (scale < 1) {
                    var uss = shader.uniforms.uSamplerSize;
                    if (uss) {
                        var sv = scale / 2048;
                        var newArr = [];
                        for (var j = 0; j < uss.length; j++) {
                            newArr.push(sv);
                        }
                        shader.uniforms.uSamplerSize = newArr;
                    }
                }
            };
        }

        PIXI.tilemap.TileRenderer.__arkPatched = true;
        log('tilemap patched');
        return true;
    }

    // Patch Sprite._refresh to ensure baseTexture is fixed before PIXI frame validation.
    function patchSprite() {
        if (typeof Sprite === 'undefined') return false;
        if (Sprite.__arkPatched) return true;

        var _spriteSetterLogCount = 0;
        var _stubRefreshLogCount = 0;
        var bitmapDesc = Object.getOwnPropertyDescriptor(Sprite.prototype, 'bitmap');
        if (bitmapDesc && bitmapDesc.set && bitmapDesc.configurable) {
            var origSpriteBitmapSetter = bitmapDesc.set;
            Object.defineProperty(Sprite.prototype, 'bitmap', {
                get: bitmapDesc.get,
                set: function(value) {
                    var prev = this._bitmap;
                    if (value && isDiagUrl(value._url)) {
                        diag('SpriteBitmapSet', 80,
                            'url=', value._url,
                            'fullImageTarget=', isFullImageSpriteUrl(value._url),
                            'same=', prev === value,
                            'ready=', value.isReady && value.isReady(),
                            'ark=', value._arkOrigW + 'x' + value._arkOrigH,
                            'img=', imageSizeOf(value),
                            'frame=', this._frame && JSON.stringify(this._frame),
                            'scale=', this.scale && (this.scale.x + 'x' + this.scale.y),
                            'ctor=', this.constructor && this.constructor.name,
                            'stack=', shortStack());
                    }
                    if (value && isKnownFullImageSpriteUrl(value._url)) {
                        this._arkFullImageDownsampleSprite = true;
                        this._arkSpecialActionSeqSprite = isSpecialActionSeqUrl(value._url);
                        ensureArkDim(value);
                        if ((isSpecialActionSeqUrl(value._url) || isMenuPictureWatchUrl(value._url)) && _spriteSetterLogCount < 60) {
                            _spriteSetterLogCount++;
                            log('[SpriteFull] bitmap set #' + _spriteSetterLogCount,
                                'same=', prev === value,
                                'ready=', value.isReady && value.isReady(),
                                'noRefresh=', !!this._Drill_COAS_noRefreshFrame,
                                'url=', value._url,
                                'frame=', this._frame && JSON.stringify(this._frame),
                                'ark=', value._arkOrigW + 'x' + value._arkOrigH,
                                'img=', imageSizeOf(value),
                                baseTextureState(value.__baseTexture));
                        }
                    } else {
                        this._arkFullImageDownsampleSprite = false;
                        this._arkSpecialActionSeqSprite = false;
                    }
                    origSpriteBitmapSetter.call(this, value);
                    if (value && value.isReady && value.isReady()) {
                        applyFullImageDownsampleSprite(this, 'setter-ready');
                    }
                },
                configurable: true
            });
        }

        var _origUpdate = Sprite.prototype.update;
        if (_origUpdate) {
            Sprite.prototype.update = function() {
                _origUpdate.apply(this, arguments);
                if (this._arkFullImageDownsampleSprite ||
                    this._arkSpecialActionSeqSprite ||
                    shouldCheckFullImageSprite(this, this._bitmap)) {
                    applyFullImageDownsampleSprite(this, 'update');
                }
            };
        }

        if (typeof Sprite_Picture !== 'undefined' && Sprite_Picture.prototype.update && !Sprite_Picture.__arkCoasPatched) {
            var _origPictureUpdate = Sprite_Picture.prototype.update;
            Sprite_Picture.prototype.update = function() {
                _origPictureUpdate.apply(this, arguments);
                if (this._arkFullImageDownsampleSprite ||
                    this._arkSpecialActionSeqSprite ||
                    shouldCheckFullImageSprite(this, this._bitmap)) {
                    applyFullImageDownsampleSprite(this, 'picture-update');
                }
            };
            Sprite_Picture.__arkCoasPatched = true;
            log('Sprite_Picture full-image patched');
        }

        var _origRefresh = Sprite.prototype._refresh;
            Sprite.prototype._refresh = function() {
                var bitmap = this._bitmap;
                if (bitmap) {
                    ensureArkDim(bitmap);
                    if (isOnePixelMissingStub(bitmap)) {
                        if (this._frame) {
                            try { this._frame.x = 0; } catch (e) {}
                            try { this._frame.y = 0; } catch (e) {}
                            try { this._frame.width = 1; } catch (e) {}
                            try { this._frame.height = 1; } catch (e) {}
                        }
                        if (this._realFrame) {
                            try { this._realFrame.x = 0; } catch (e) {}
                            try { this._realFrame.y = 0; } catch (e) {}
                            try { this._realFrame.width = 1; } catch (e) {}
                            try { this._realFrame.height = 1; } catch (e) {}
                        }
                        if (this.texture && typeof PIXI !== 'undefined' && PIXI.Rectangle) {
                            try { this.texture.frame = new PIXI.Rectangle(0, 0, 1, 1); } catch (e) {}
                        }
                        if (_stubRefreshLogCount < 80) {
                            _stubRefreshLogCount++;
                            log('[StubFrameClamp] #' + _stubRefreshLogCount,
                                'url=', bitmap._url,
                                'frame=', this._frame && JSON.stringify(this._frame),
                                'realFrame=', this._realFrame && JSON.stringify(this._realFrame),
                                'texFrame=', this.texture && JSON.stringify(this.texture.frame),
                                'ctor=', this.constructor && this.constructor.name,
                                baseTextureState(bitmap.__baseTexture));
                        }
                    }
                    if (bitmap._arkOrigW && bitmap._arkOrigH) {
                        var actualForDiag = isDiagUrl(bitmap._url) ? actualBitmapSize(bitmap) : null;
                        var bt = bitmap.baseTexture;
                        if (bt && !bt._arkDimSet) {
                            fixBaseTexture(bt, bitmap._arkOrigW, bitmap._arkOrigH);
                        }
                        if (bt && this.texture) {
                            this.texture.baseTexture = bt;
                        }
                        if (actualForDiag && actualForDiag[0] < bitmap._arkOrigW && actualForDiag[1] < bitmap._arkOrigH) {
                            diag('SpriteRefreshBT', 100,
                                'url=', bitmap._url,
                                'orig=', bitmap._arkOrigW + 'x' + bitmap._arkOrigH,
                                'actual=', actualForDiag[0] + 'x' + actualForDiag[1],
                                'fullImageTarget=', isFullImageSpriteUrl(bitmap._url),
                                'frame=', this._frame && JSON.stringify(this._frame),
                                'realFrame=', this._realFrame && JSON.stringify(this._realFrame),
                                'texFrame=', this.texture && JSON.stringify(this.texture.frame),
                                'scale=', this.scale && (this.scale.x + 'x' + this.scale.y),
                                'ctor=', this.constructor && this.constructor.name,
                                baseTextureState(bt),
                                'stack=', shortStack());
                        }
                    }
                }
            _origRefresh.call(this);
            if (this._arkFullImageDownsampleSprite ||
                this._arkSpecialActionSeqSprite ||
                shouldCheckFullImageSprite(this, bitmap)) {
                applyFullImageDownsampleSprite(this, 'refresh');
            }
        };

        Sprite.__arkPatched = true;
        return true;
    }

    var _coasApplyLogCount = 0;
    function applySpecialActionSeqSprite(sprite, phase) {
        applyFullImageDownsampleSprite(sprite, phase);
    }

    function shouldApplyFullImageDownsampleSprite(sprite, bitmap, actualW, actualH) {
        if (!sprite || !bitmap || !bitmap._arkOrigW || !bitmap._arkOrigH) return false;
        var knownFullImage = isKnownFullImageSpriteUrl(bitmap._url);
        var genericPicture = !knownFullImage &&
            typeof Sprite_Picture !== 'undefined' &&
            sprite instanceof Sprite_Picture &&
            isPictureUrl(bitmap._url);
        var largeGenericPicture = genericPicture && isLargePictureBitmap(bitmap);
        if (!knownFullImage && !genericPicture) return false;
        if (actualW <= 0 || actualH <= 0) return false;
        if (actualW >= bitmap._arkOrigW && actualH >= bitmap._arkOrigH) return false;
        if (typeof TilingSprite !== 'undefined' && sprite instanceof TilingSprite) return false;

        var frame = sprite._frame;
        if (!frame) return knownFullImage;
        if (frame.x && Math.abs(frame.x) > 0.0001) return false;
        if (frame.y && Math.abs(frame.y) > 0.0001) return false;

        var fw = frame.width || 0;
        var fh = frame.height || 0;
        if ((knownFullImage || largeGenericPicture) && Math.abs(fw - bitmap._arkOrigW) < 1 && Math.abs(fh - bitmap._arkOrigH) < 1) return true;
        if (Math.abs(fw - actualW) < 1 && Math.abs(fh - actualH) < 1) return true;

        var texFrame = sprite.texture && sprite.texture.frame;
        if (texFrame) {
            var tw = texFrame.width || 0;
            var th = texFrame.height || 0;
            if ((knownFullImage || largeGenericPicture) && Math.abs(tw - bitmap._arkOrigW) < 1 && Math.abs(th - bitmap._arkOrigH) < 1) return true;
            if (Math.abs(tw - actualW) < 1 && Math.abs(th - actualH) < 1) return true;
        }
        var realFrame = sprite._realFrame;
        if (realFrame) {
            var rw = realFrame.width || 0;
            var rh = realFrame.height || 0;
            if (genericPicture && Math.abs(rw - actualW) < 1 && Math.abs(rh - actualH) < 1) return true;
            if (largeGenericPicture && Math.abs(rw - bitmap._arkOrigW) < 1 && Math.abs(rh - bitmap._arkOrigH) < 1) return true;
        }
        return false;
    }

    function applyFullImageDownsampleSprite(sprite, phase) {
        var bitmap = sprite && sprite._bitmap;
        if (!bitmap) return;

        ensureArkDim(bitmap);
        if (!bitmap._arkOrigW || !bitmap._arkOrigH) return;

        var actual = actualBitmapSize(bitmap);
        if (!actual) return;
        var actualW = actual[0];
        var actualH = actual[1];
        if (actualW <= 0 || actualH <= 0) return;
        if (actualW >= bitmap._arkOrigW && actualH >= bitmap._arkOrigH) return;
        if (!shouldApplyFullImageDownsampleSprite(sprite, bitmap, actualW, actualH)) return;

        if (sprite._Drill_COAS_noRefreshFrame && sprite._frame) {
            if (!sprite._frame.width || sprite._frame.width > actualW) {
                try { sprite._frame.width = actualW; } catch (e) {}
            }
            if (!sprite._frame.height || sprite._frame.height > actualH) {
                try { sprite._frame.height = actualH; } catch (e) {}
            }
        }

        var src = (bitmap.__baseTexture && bitmap.__baseTexture.source) || bitmap._image || bitmap.__canvas;
        if (!src || typeof PIXI === 'undefined' || !PIXI.BaseTexture || !PIXI.Rectangle) return;

        var key = bitmap._url + '|' + actualW + 'x' + actualH;
        if (!bitmap._arkFullImageBaseTexture || bitmap._arkFullImageBaseTextureKey !== key) {
            bitmap._arkFullImageBaseTexture = new PIXI.BaseTexture(src);
            if (bitmap.__baseTexture) {
                try { bitmap._arkFullImageBaseTexture.scaleMode = bitmap.__baseTexture.scaleMode; } catch (e) {}
            }
            try { bitmap._arkFullImageBaseTexture.mipmap = false; } catch (e) {}
            try { bitmap._arkFullImageBaseTexture.width = actualW; } catch (e) {}
            try { bitmap._arkFullImageBaseTexture.height = actualH; } catch (e) {}
            try { bitmap._arkFullImageBaseTexture.realWidth = actualW; } catch (e) {}
            try { bitmap._arkFullImageBaseTexture.realHeight = actualH; } catch (e) {}
            if (typeof bitmap._arkFullImageBaseTexture.update === 'function') {
                try { bitmap._arkFullImageBaseTexture.update(); } catch (e) {}
            }
            if (bitmap._arkFullImageBaseTexture.hasLoaded !== undefined) {
                try { bitmap._arkFullImageBaseTexture.hasLoaded = true; } catch (e) {}
            }
            bitmap._arkFullImageBaseTextureKey = key;
        }

        var bt = bitmap._arkFullImageBaseTexture;
        try { sprite.texture.baseTexture = bt; } catch (e) {}
        if (sprite._realFrame) {
            try { sprite._realFrame.x = 0; } catch (e) {}
            try { sprite._realFrame.y = 0; } catch (e) {}
            try { sprite._realFrame.width = actualW; } catch (e) {}
            try { sprite._realFrame.height = actualH; } catch (e) {}
            try { sprite.texture.frame = sprite._realFrame; } catch (e) {}
        } else if (typeof PIXI !== 'undefined' && PIXI.Rectangle) {
            try { sprite.texture.frame = new PIXI.Rectangle(0, 0, actualW, actualH); } catch (e) {}
        }
        try { sprite.texture._updateID++; } catch (e) {}

        var sx = bitmap._arkOrigW / actualW;
        var sy = bitmap._arkOrigH / actualH;
        var last = sprite._arkFullImageScaleFix;
        var lastApplied = sprite._arkFullImageAppliedScale;
        var curX = sprite.scale ? sprite.scale.x : 1;
        var curY = sprite.scale ? sprite.scale.y : 1;
        var baseX = curX;
        var baseY = curY;
        if (last && lastApplied &&
            Math.abs(curX - lastApplied.x) < 0.0001 &&
            Math.abs(curY - lastApplied.y) < 0.0001) {
            baseX = curX / last.x;
            baseY = curY / last.y;
        }
        try { sprite.scale.x = baseX * sx; } catch (e) {}
        try { sprite.scale.y = baseY * sy; } catch (e) {}
        sprite._arkFullImageScaleFix = { x: sx, y: sy };
        sprite._arkFullImageAppliedScale = {
            x: sprite.scale ? sprite.scale.x : baseX * sx,
            y: sprite.scale ? sprite.scale.y : baseY * sy
        };

        if ((isSpecialActionSeqUrl(bitmap._url) || isMenuPictureWatchUrl(bitmap._url)) && _coasApplyLogCount < 120) {
            _coasApplyLogCount++;
            log('[SpriteFull] apply #' + _coasApplyLogCount,
                phase,
                'url=', bitmap._url,
                'noRefresh=', !!sprite._Drill_COAS_noRefreshFrame,
                'orig=', bitmap._arkOrigW + 'x' + bitmap._arkOrigH,
                'actual=', actualW + 'x' + actualH,
                'frame=', sprite._frame && JSON.stringify(sprite._frame),
                'realFrame=', sprite._realFrame && JSON.stringify(sprite._realFrame),
                'texFrame=', sprite.texture && JSON.stringify(sprite.texture.frame),
                'scaleFix=', sx + 'x' + sy,
                'baseScale=', baseX + 'x' + baseY,
                'scale=', sprite.scale && (sprite.scale.x + 'x' + sprite.scale.y),
                baseTextureState(bt));
        }
        if (isDiagUrl(bitmap._url)) {
            diag('SpriteFullApply', 80,
                phase,
                'url=', bitmap._url,
                'orig=', bitmap._arkOrigW + 'x' + bitmap._arkOrigH,
                'actual=', actualW + 'x' + actualH,
                'frame=', sprite._frame && JSON.stringify(sprite._frame),
                'realFrame=', sprite._realFrame && JSON.stringify(sprite._realFrame),
                'texFrame=', sprite.texture && JSON.stringify(sprite.texture.frame),
                'scaleFix=', sx + 'x' + sy,
                'baseScale=', baseX + 'x' + baseY,
                'scale=', sprite.scale && (sprite.scale.x + 'x' + sprite.scale.y),
                'ctor=', sprite.constructor && sprite.constructor.name,
                'stack=', shortStack());
        }
    }

    function patchSpriteTint() {
        if (typeof Sprite === 'undefined' || !Sprite.prototype._executeTint) return false;
        if (Sprite.__arkTintPatched) return true;

        var origExecuteTint = Sprite.prototype._executeTint;
        Sprite.prototype._executeTint = function(x, y, w, h) {
            var bitmap = this._bitmap;
            if (!bitmap || !bitmap._arkOrigW || !bitmap._arkOrigH) {
                return origExecuteTint.call(this, x, y, w, h);
            }

            var actual = actualBitmapSize(bitmap);
            if (!actual || actual[0] >= bitmap._arkOrigW || actual[1] >= bitmap._arkOrigH) {
                return origExecuteTint.call(this, x, y, w, h);
            }

            var source = bitmap.canvas;
            if (!source || source.width <= 1 || source.height <= 1) {
                return origExecuteTint.call(this, x, y, w, h);
            }

            var sxScale = source.width / bitmap._arkOrigW;
            var syScale = source.height / bitmap._arkOrigH;
            var sx = Math.max(0, x * sxScale);
            var sy = Math.max(0, y * syScale);
            var sw = Math.max(1, Math.min(source.width - sx, w * sxScale));
            var sh = Math.max(1, Math.min(source.height - sy, h * syScale));

            var context = this._context;
            var tone = this._colorTone;
            var color = this._blendColor;

            context.globalCompositeOperation = 'copy';
            context.drawImage(source, sx, sy, sw, sh, 0, 0, w, h);

            if (Graphics.canUseSaturationBlend()) {
                var gray = Math.max(0, tone[3]);
                context.globalCompositeOperation = 'saturation';
                context.fillStyle = 'rgba(255,255,255,' + gray / 255 + ')';
                context.fillRect(0, 0, w, h);
            }

            var r1 = Math.max(0, tone[0]);
            var g1 = Math.max(0, tone[1]);
            var b1 = Math.max(0, tone[2]);
            if (tone[4] == 1) context.globalCompositeOperation = 'color';
            else context.globalCompositeOperation = 'lighter';
            context.fillStyle = Utils.rgbToCssColor(r1, g1, b1);
            context.fillRect(0, 0, w, h);

            if (Graphics.canUseDifferenceBlend()) {
                context.globalCompositeOperation = 'difference';
                context.fillStyle = 'white';
                context.fillRect(0, 0, w, h);

                var r2 = Math.max(0, -tone[0]);
                var g2 = Math.max(0, -tone[1]);
                var b2 = Math.max(0, -tone[2]);
                if (tone[4] == 1) context.globalCompositeOperation = 'color';
                else context.globalCompositeOperation = 'lighter';
                context.fillStyle = Utils.rgbToCssColor(r2, g2, b2);
                context.fillRect(0, 0, w, h);

                context.globalCompositeOperation = 'difference';
                context.fillStyle = 'white';
                context.fillRect(0, 0, w, h);
            }

            var r3 = Math.max(0, color[0]);
            var g3 = Math.max(0, color[1]);
            var b3 = Math.max(0, color[2]);
            var a3 = Math.max(0, color[3]);
            context.globalCompositeOperation = 'source-atop';
            context.fillStyle = Utils.rgbToCssColor(r3, g3, b3);
            context.globalAlpha = a3 / 255;
            context.fillRect(0, 0, w, h);

            context.globalCompositeOperation = 'destination-in';
            context.globalAlpha = 1;
            context.drawImage(source, sx, sy, sw, sh, 0, 0, w, h);

            if (isStandWatchUrl(bitmap._url)) {
                log('[Tint] scaled',
                    'url=', bitmap._url,
                    'orig=', bitmap._arkOrigW + 'x' + bitmap._arkOrigH,
                    'source=', source.width + 'x' + source.height,
                    'srcRect=', [sx, sy, sw, sh].join(','),
                    'dst=', w + 'x' + h);
            }
        };

        Sprite.__arkTintPatched = true;
        log('Sprite tint patched');
        return true;
    }

    function patchDrillAnimationSurround() {
        if (typeof Drill_ASu_Sprite === 'undefined') return false;
        if (!Drill_ASu_Sprite.prototype.drill_sprite_updateAuto) return false;
        if (Drill_ASu_Sprite.__arkPatched) return true;

        var origUpdateAuto = Drill_ASu_Sprite.prototype.drill_sprite_updateAuto;
        Drill_ASu_Sprite.prototype.drill_sprite_updateAuto = function() {
            origUpdateAuto.apply(this, arguments);
            applyDrillActionSeqSprite(this._drill_ballSprite, 'ball');
            applyDrillActionSeqSprite(this._drill_ballShadowSprite, 'shadow');
        };

        Drill_ASu_Sprite.__arkPatched = true;
        log('Drill_AnimationSurround patched');
        return true;
    }

    var _drillActionSeqLogCount = 0;
    function applyDrillActionSeqSprite(sprite, phase) {
        var bitmap = sprite && sprite._bitmap;
        if (!bitmap || !isSpecialActionSeqUrl(bitmap._url)) return;

        ensureArkDim(bitmap);
        if (!bitmap._arkOrigW || !bitmap._arkOrigH) return;

        var actual = actualBitmapSize(bitmap);
        if (!actual) return;
        var actualW = actual[0];
        var actualH = actual[1];
        if (actualW <= 0 || actualH <= 0) return;
        if (actualW >= bitmap._arkOrigW && actualH >= bitmap._arkOrigH) return;

        var src = (bitmap.__baseTexture && bitmap.__baseTexture.source) || bitmap._image || bitmap.__canvas;
        if (!src || typeof PIXI === 'undefined' || !PIXI.BaseTexture || !PIXI.Rectangle) return;

        var key = bitmap._url + '|' + actualW + 'x' + actualH;
        if (!bitmap._arkSpriteBaseTexture || bitmap._arkSpriteBaseTextureKey !== key) {
            bitmap._arkSpriteBaseTexture = new PIXI.BaseTexture(src);
            if (bitmap.__baseTexture) {
                try { bitmap._arkSpriteBaseTexture.scaleMode = bitmap.__baseTexture.scaleMode; } catch (e) {}
            }
            try { bitmap._arkSpriteBaseTexture.mipmap = false; } catch (e) {}
            try { bitmap._arkSpriteBaseTexture.width = actualW; } catch (e) {}
            try { bitmap._arkSpriteBaseTexture.height = actualH; } catch (e) {}
            try { bitmap._arkSpriteBaseTexture.realWidth = actualW; } catch (e) {}
            try { bitmap._arkSpriteBaseTexture.realHeight = actualH; } catch (e) {}
            if (typeof bitmap._arkSpriteBaseTexture.update === 'function') {
                try { bitmap._arkSpriteBaseTexture.update(); } catch (e) {}
            }
            if (bitmap._arkSpriteBaseTexture.hasLoaded !== undefined) {
                try { bitmap._arkSpriteBaseTexture.hasLoaded = true; } catch (e) {}
            }
            bitmap._arkSpriteBaseTextureKey = key;
        }

        var sx = bitmap._arkOrigW / actualW;
        var sy = bitmap._arkOrigH / actualH;

        try { sprite.texture.baseTexture = bitmap._arkSpriteBaseTexture; } catch (e) {}
        try { sprite.texture.frame = new PIXI.Rectangle(0, 0, actualW, actualH); } catch (e) {}
        try { sprite.texture._updateID++; } catch (e) {}

        try { sprite.scale.x *= sx; } catch (e) {}
        try { sprite.scale.y *= sy; } catch (e) {}

        if (_drillActionSeqLogCount < 20) {
            _drillActionSeqLogCount++;
            log('[DrillASu] apply',
                phase,
                'url=', bitmap._url,
                'orig=', bitmap._arkOrigW + 'x' + bitmap._arkOrigH,
                'actual=', actualW + 'x' + actualH,
                'scaleFix=', sx + 'x' + sy,
                'spriteScale=', sprite.scale && (sprite.scale.x + 'x' + sprite.scale.y),
                'texFrame=', sprite.texture && JSON.stringify(sprite.texture.frame),
                'actualBT=', baseTextureState(bitmap._arkSpriteBaseTexture),
                'sharedBT=', baseTextureState(bitmap.__baseTexture));
        }
    }

    // Patch TilingSprite to handle downsampled textures.
    //
    // Problem: PIXI TilingSpriteRenderer checks isSimple:
    //   isSimple = tex.frame.width === baseTex.width && tex.frame.height === baseTex.height
    // When true, it uses REPEAT wrap mode on the WebGL texture. But the actual texture
    // is downsampled (e.g., 360x252 instead of 1440x1008), so REPEAT causes 4x tiling.
    //
    // fixBaseTexture makes baseTex.width return 1440 (original), and _refresh sets
    // texture.frame to _frame (also 1440 from move()). So isSimple=true → wrong tiling.
    //
    // Fix: For TilingSprite, do NOT use fixBaseTexture. Instead:
    // 1. Let baseTexture keep its actual size (360x252)
    // 2. Scale the TilingSprite itself to fill the original area
    // 3. Scale tileTransform inversely so tile scrolling speed stays correct
    function patchTilingSprite() {
        if (typeof TilingSprite === 'undefined') { log('WARN: TilingSprite not defined'); return false; }
        if (!TilingSprite.prototype._onBitmapLoad) { log('WARN: TilingSprite._onBitmapLoad not found'); return false; }
        if (TilingSprite.__arkPatched) return true;

        var _tsLogCount = 0;

        var _origTsOnBitmapLoad = TilingSprite.prototype._onBitmapLoad;
        TilingSprite.prototype._onBitmapLoad = function() {
            var bitmap = this._bitmap;
            if (bitmap) {
                if (!bitmap._arkOrigW && bitmap._url) {
                    var dim = lookupDim(bitmap._url);
                    if (dim) {
                        bitmap._arkOrigW = dim[0];
                        bitmap._arkOrigH = dim[1];
                    }
                }
                if (isWatchUrl(bitmap._url)) {
                    log('[TS] onBitmapLoad before original',
                        'url=', bitmap._url,
                        'ark=', bitmap._arkOrigW + 'x' + bitmap._arkOrigH,
                        'img=', imageSizeOf(bitmap),
                        baseTextureState(bitmap.__baseTexture));
                }
            }
            _origTsOnBitmapLoad.call(this);
            safeApplyTilingDownsample(this, 'onBitmapLoad');
            if (bitmap && isWatchUrl(bitmap._url)) {
                log('[TS] onBitmapLoad after original',
                    'url=', bitmap._url,
                    'textureFrame=', this.texture && JSON.stringify(this.texture.frame),
                    baseTextureState(bitmap.__baseTexture));
            }
        };

        var _origTsRenderWebGL = TilingSprite.prototype._renderWebGL;
        var _renderLogCount = 0;
        TilingSprite.prototype._renderWebGL = function(renderer) {
            if (_renderLogCount < 10) {
                _renderLogCount++;
                var bm = this._bitmap;
                log('[TS] RENDER #' + _renderLogCount,
                    '_w=', this._width, '_h=', this._height,
                    'bm=', !!bm, 'arkW=', bm && bm._arkOrigW,
                    'bmUrl=', bm && bm._url,
                    'texValid=', this.texture && this.texture.valid);
            }
            if (this._bitmap && isWatchUrl(this._bitmap._url)) {
                log('[TS] WATCH render',
                    'url=', this._bitmap._url,
                    '_width=', this._width, '_height=', this._height,
                    'texValid=', this.texture && this.texture.valid,
                    'texFrame=', this.texture && JSON.stringify(this.texture.frame),
                    'texBT=', baseTextureState(this.texture && this.texture.baseTexture),
                    'sharedBT=', baseTextureState(this._bitmap.__baseTexture));
            }
            _origTsRenderWebGL.call(this, renderer);
        };

        var _origTsRefresh = TilingSprite.prototype._refresh;
        var _refreshLogCount = 0;
        TilingSprite.prototype._refresh = function() {
            var bitmap = this._bitmap;
            if (bitmap) {
                if (!bitmap._arkOrigW && bitmap._url) {
                    var dim = lookupDim(bitmap._url);
                    if (dim) {
                        bitmap._arkOrigW = dim[0];
                        bitmap._arkOrigH = dim[1];
                    }
                }
                if (bitmap._arkOrigW && bitmap._arkOrigH) {
                    if (this._frame.width === 0 && this._frame.height === 0) {
                        try { this._frame.width = bitmap._arkOrigW; } catch (e) {}
                        try { this._frame.height = bitmap._arkOrigH; } catch (e) {}
                    }
                }
            }
            if (_refreshLogCount < 10) {
                _refreshLogCount++;
                log('[TS] _refresh #' + _refreshLogCount,
                    '_width=', this._width, '_height=', this._height,
                    '_frame=', JSON.stringify(this._frame),
                    'texFrame=', this.texture && JSON.stringify(this.texture.frame));
            }
            if (bitmap && isWatchUrl(bitmap._url)) {
                log('[TS] WATCH refresh before original',
                    'url=', bitmap._url,
                    '_width=', this._width, '_height=', this._height,
                    '_frame=', JSON.stringify(this._frame),
                    'texFrame=', this.texture && JSON.stringify(this.texture.frame),
                    'img=', imageSizeOf(bitmap),
                    baseTextureState(bitmap.__baseTexture));
            }
            _origTsRefresh.call(this);
            safeApplyTilingDownsample(this, 'refresh');
            if (bitmap && isWatchUrl(bitmap._url)) {
                log('[TS] WATCH refresh after original',
                    'url=', bitmap._url,
                    'texFrame=', this.texture && JSON.stringify(this.texture.frame),
                    baseTextureState(bitmap.__baseTexture));
            }
        };

        // Override bitmap setter to handle already-loaded bitmaps (MV v1.6.1).
        var bitmapDesc = Object.getOwnPropertyDescriptor(TilingSprite.prototype, 'bitmap');
        log('[TS] bitmap descriptor: set=', !!(bitmapDesc && bitmapDesc.set));
        if (bitmapDesc && bitmapDesc.set) {
            var origTsBitmapSetter = bitmapDesc.set;
            Object.defineProperty(TilingSprite.prototype, 'bitmap', {
                get: bitmapDesc.get,
                set: function(value) {
                    var prev = this._bitmap;
                    log('[TS] bitmap setter: prev=', !!prev, 'new=', !!value,
                        'ready=', value && value.isReady && value.isReady(),
                        'url=', value && value._url);
                    if (value && isWatchUrl(value._url)) {
                        log('[TS] WATCH setter before original',
                            'url=', value._url,
                            'ready=', value.isReady && value.isReady(),
                            'ark=', value._arkOrigW + 'x' + value._arkOrigH,
                            'img=', imageSizeOf(value),
                            baseTextureState(value.__baseTexture));
                    }
                    origTsBitmapSetter.call(this, value);
                    if (value && isWatchUrl(value._url)) {
                        log('[TS] WATCH setter after original',
                            'url=', value._url,
                            'texFrame=', this.texture && JSON.stringify(this.texture.frame),
                            baseTextureState(value.__baseTexture));
                    }
                    if (value && value !== prev && value.isReady && value.isReady()) {
                        log('[TS] bitmap setter: calling _onBitmapLoad for ready bitmap');
                        this._onBitmapLoad();
                    }
                },
                configurable: true
            });
        }

        TilingSprite.__arkPatched = true;
        log('TilingSprite patched');
        return true;
    }

    function safeApplyTilingDownsample(sprite, phase) {
        try {
            applyTilingDownsample(sprite, phase);
        } catch (e) {
            log('[TS] apply skipped:', e && e.message ? e.message : e);
        }
    }

    function applyTilingDownsample(sprite, phase) {
        var bitmap = sprite && sprite._bitmap;
        if (!bitmap || isExcludedTilingUrl(bitmap._url)) return;

        if (!bitmap._arkOrigW && bitmap._url) {
            var dim = lookupDim(bitmap._url);
            if (dim) {
                bitmap._arkOrigW = dim[0];
                bitmap._arkOrigH = dim[1];
            }
        }
        if (!bitmap._arkOrigW || !bitmap._arkOrigH) return;

        var actual = actualBitmapSize(bitmap);
        if (!actual) return;
        var actualW = actual[0];
        var actualH = actual[1];
        if (actualW <= 0 || actualH <= 0) return;
        if (actualW >= bitmap._arkOrigW && actualH >= bitmap._arkOrigH) return;

        var src = (bitmap.__baseTexture && bitmap.__baseTexture.source) || bitmap._image || bitmap.__canvas;
        if (!src || typeof PIXI === 'undefined' || !PIXI.BaseTexture || !PIXI.Rectangle) return;

        var key = bitmap._url + '|' + actualW + 'x' + actualH;
        if (!bitmap._arkTilingBaseTexture || bitmap._arkTilingBaseTextureKey !== key) {
            bitmap._arkTilingBaseTexture = new PIXI.BaseTexture(src);
            try { bitmap._arkTilingBaseTexture.mipmap = false; } catch (e) {}
            if (bitmap.__baseTexture) {
                try { bitmap._arkTilingBaseTexture.scaleMode = bitmap.__baseTexture.scaleMode; } catch (e) {}
            }
            try { bitmap._arkTilingBaseTexture.width = actualW; } catch (e) {}
            try { bitmap._arkTilingBaseTexture.height = actualH; } catch (e) {}
            try { bitmap._arkTilingBaseTexture.realWidth = actualW; } catch (e) {}
            try { bitmap._arkTilingBaseTexture.realHeight = actualH; } catch (e) {}
            if (typeof bitmap._arkTilingBaseTexture.update === 'function') {
                try { bitmap._arkTilingBaseTexture.update(); } catch (e) {}
            }
            if (bitmap._arkTilingBaseTexture.hasLoaded !== undefined) {
                try { bitmap._arkTilingBaseTexture.hasLoaded = true; } catch (e) {}
            }
            bitmap._arkTilingBaseTextureKey = key;
        }

        try { sprite.texture.baseTexture = bitmap._arkTilingBaseTexture; } catch (e) {}
        try { sprite.texture.frame = new PIXI.Rectangle(0, 0, actualW, actualH); } catch (e) {}
        try { sprite.texture._updateID++; } catch (e) {}
        try { sprite.tilingTexture = null; } catch (e) {}

        if (!sprite._arkTileScaleBase) {
            sprite._arkTileScaleBase = {
                x: sprite.tileScale ? sprite.tileScale.x : 1,
                y: sprite.tileScale ? sprite.tileScale.y : 1
            };
        }
        if (sprite.tileScale) {
            try { sprite.tileScale.x = sprite._arkTileScaleBase.x * (bitmap._arkOrigW / actualW); } catch (e) {}
            try { sprite.tileScale.y = sprite._arkTileScaleBase.y * (bitmap._arkOrigH / actualH); } catch (e) {}
        }

        if (sprite._width === 0 && sprite._height === 0) {
            try { sprite._width = bitmap._arkOrigW; } catch (e) {}
            try { sprite._height = bitmap._arkOrigH; } catch (e) {}
        }

        if (isWatchUrl(bitmap._url) || isMenuGifUrl(bitmap._url)) {
            log('[TS] APPLY', phase,
                'url=', bitmap._url,
                'orig=', bitmap._arkOrigW + 'x' + bitmap._arkOrigH,
                'actual=', actualW + 'x' + actualH,
                'baseScale=', sprite._arkTileScaleBase.x + 'x' + sprite._arkTileScaleBase.y,
                'tileScale=', sprite.tileScale && (sprite.tileScale.x + 'x' + sprite.tileScale.y),
                'texFrame=', sprite.texture && JSON.stringify(sprite.texture.frame),
                'tilingBT=', baseTextureState(bitmap._arkTilingBaseTexture),
                'sharedBT=', baseTextureState(bitmap.__baseTexture));
        }
        if (isDiagUrl(bitmap._url)) {
            diag('TilingApply', 100,
                phase,
                'url=', bitmap._url,
                'orig=', bitmap._arkOrigW + 'x' + bitmap._arkOrigH,
                'actual=', actualW + 'x' + actualH,
                '_width=', sprite._width,
                '_height=', sprite._height,
                '_frame=', sprite._frame && JSON.stringify(sprite._frame),
                'texFrame=', sprite.texture && JSON.stringify(sprite.texture.frame),
                'baseScale=', sprite._arkTileScaleBase && (sprite._arkTileScaleBase.x + 'x' + sprite._arkTileScaleBase.y),
                'tileScale=', sprite.tileScale && (sprite.tileScale.x + 'x' + sprite.tileScale.y),
                'ctor=', sprite.constructor && sprite.constructor.name,
                'stack=', shortStack());
        }
    }

    // As a plugin, we execute after all game plugins.
    // Bitmap/Sprite/TilingSprite/PIXI are all available at this point.
    patch();
    patchBitmapOnLoad();
    patchTilemap();
    patchSprite();
    patchSpriteTint();
    patchDrillAnimationSurround();
    patchTilingSprite();
    log('all patches applied');
}());
