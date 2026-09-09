// ChimakiSpine compatibility layer for WKWebView.
//
// ChimakiSpine is shipped by some RPG Maker MV games as NW.js V8 bytecode and
// loaded through nw.Window.evalNWBin(). JavaScriptCore cannot execute that
// bytecode, so this file provides the command/API surface used by those games.

(function() {
    'use strict';

    var TAG = '[ChimakiSpineCompat]';
    var BIN_PATTERN = /(?:^|\/)ChimakiSpine\.bin(?:[?#].*)?$/i;
    var installed = false;

    function log(message) {
        console.log(TAG + ' ' + message);
    }

    function warn(message) {
        console.warn(TAG + ' ' + message);
    }

    function fail(message, error) {
        console.error(TAG + ' ' + message, error || '');
    }

    function createManager() {
        var entries = Object.create(null);
        var layer = null;

        function entryFor(id) {
            id = String(id || '');
            if (!entries[id]) {
                entries[id] = {
                    id: id,
                    loading: false,
                    error: null,
                    container: null,
                    loader: null,
                    // LOAD/SET/SKIN are also used as a preload/configuration
                    // sequence. Only PLAY reveals a fresh or hidden model.
                    // A fresh model is therefore hidden, defaulting to the
                    // screen center until its transform is configured.
                    x: 960,
                    y: 540,
                    scale: 1,
                    mix: null,
                    skin: null,
                    animation: null,
                    visible: false
                };
            }
            return entries[id];
        }

        function ensureLayer() {
            if (!window.PIXI || !PIXI.Container) return null;
            if (!layer || layer._destroyed) {
                layer = new PIXI.Container();
                layer.name = 'ChimakiSpineLayer';
            }

            var scene = window.SceneManager && SceneManager._scene;
            var parent = scene && (scene._spriteset || scene);
            if (parent && layer.parent !== parent) {
                if (layer.parent) layer.parent.removeChild(layer);
                // Games drive their UI (title menus, H-scene buttons) as
                // pictures over full-screen spine scenes, so the spine layer
                // must render BELOW Spriteset_Base._pictureContainer.
                // addChild would stack it above every picture (menus become
                // invisible while their touch hot-spots keep working).
                var pictures = parent._pictureContainer;
                if (pictures && pictures.parent === parent) {
                    parent.addChildAt(layer, parent.getChildIndex(pictures));
                } else if (parent._windowLayer && parent._windowLayer.parent === parent) {
                    parent.addChildAt(layer, parent.getChildIndex(parent._windowLayer));
                } else {
                    parent.addChild(layer);
                }
            }
            return layer;
        }

        function detachLayer() {
            if (layer && layer.parent) {
                layer.parent.removeChild(layer);
            }
        }

        function applyEntry(entry) {
            var container = entry.container;
            if (!container || !container.spine) return;

            container.position.set(entry.x, entry.y);
            container.scale.set(entry.scale, entry.scale);
            container.visible = entry.visible;

            if (entry.mix !== null && container.spine.stateData) {
                container.spine.stateData.defaultMix = entry.mix;
            }

            if (entry.skin !== null) {
                try {
                    container.spine.skeleton.setSkinByName(entry.skin);
                    container.spine.skeleton.setSlotsToSetupPose();
                } catch (error) {
                    fail('Skin "' + entry.skin + '" is unavailable for model "' + entry.id + '".', error);
                }
            }

            if (entry.animation !== null) {
                try {
                    container.spine.state.setAnimation(0, entry.animation, true);
                } catch (error) {
                    fail('Animation "' + entry.animation + '" is unavailable for model "' + entry.id + '".', error);
                }
            }
        }

        function createContainer(entry, spineData) {
            var hostLayer = ensureLayer();
            if (!hostLayer) {
                throw new Error('PIXI.Container is unavailable.');
            }

            var spine = new PIXI.spine.Spine(spineData);
            var container = new PIXI.Container();
            container.name = 'ChimakiSpine:' + entry.id;
            container.spine = spine;
            container.addChild(spine);
            hostLayer.addChild(container);
            entry.container = container;
            applyEntry(entry);
        }

        function resourceError(resource) {
            if (!resource) return 'loader returned no resource';
            if (resource.error) return String(resource.error.message || resource.error);
            if (!resource.spineData) return 'pixi-spine did not produce spineData';
            return null;
        }

        // This game's patched pixi-spine removes ".png" from atlas page names
        // when Decrypter.hasEncryptedImages is true. ChimakiSpine.bin normally
        // restores the encrypted image path itself. Request the logical .png
        // URL here so MVSchemeHandler can resolve it to and decrypt .rpgmvp.
        function encryptedAtlasImageLoader(loader, namePrefix, baseUrl, imageOptions) {
            if (baseUrl && baseUrl.lastIndexOf('/') !== baseUrl.length - 1) {
                baseUrl += '/';
            }
            return function(line, callback) {
                var imageLine = String(line || '');
                var filename = imageLine.substring(imageLine.lastIndexOf('/') + 1);
                if (filename.indexOf('.') === -1) {
                    imageLine += '.png';
                }

                var name = namePrefix + imageLine;
                var url = baseUrl + imageLine;
                var cachedResource = loader.resources[name];
                if (cachedResource) {
                    var completeCached = function() {
                        callback(cachedResource.texture ? cachedResource.texture.baseTexture : null);
                    };
                    if (cachedResource.texture || cachedResource.error) {
                        completeCached();
                    } else {
                        cachedResource.onAfterMiddleware.add(completeCached);
                    }
                    return;
                }

                loader.add(name, url, imageOptions, function(resource) {
                    if (!resource.error && resource.texture) {
                        callback(resource.texture.baseTexture);
                    } else {
                        fail('Failed to load atlas page for model: ' + url,
                            resource.error || new Error('texture was not created'));
                        callback(null);
                    }
                });
            };
        }

        function load(id, texturePageCount) {
            var entry = entryFor(id);
            if (entry.container) {
                applyEntry(entry);
                ensureLayer();
                return entry;
            }
            if (entry.loading) return entry;

            if (!window.PIXI || !PIXI.loaders || !PIXI.loaders.Loader ||
                !PIXI.spine || !PIXI.spine.Spine) {
                entry.error = new Error('pixi-spine runtime is unavailable.');
                fail('Cannot load model "' + entry.id + '": pixi-spine runtime is unavailable.');
                return entry;
            }

            entry.loading = true;
            entry.error = null;

            var url = 'img/spine/' + encodeURIComponent(entry.id) + '/' +
                encodeURIComponent(entry.id) + '.json';
            var atlasUrl = 'img/spine/' + encodeURIComponent(entry.id) + '/' +
                encodeURIComponent(entry.id) + '.atlas';
            var resourceName = 'ark_chimaki_spine_' + entry.id + '_' + Date.now();
            var loader = new PIXI.loaders.Loader();
            entry.loader = loader;

            if (loader.onError && loader.onError.add) {
                loader.onError.add(function(error, currentLoader, resource) {
                    fail('Resource request failed for model "' + entry.id + '": ' +
                        (resource && resource.url ? resource.url : url), error);
                });
            }

            log('Loading model "' + entry.id + '" from ' + url +
                (texturePageCount ? ' (' + texturePageCount + ' atlas page(s))' : '') + '.');

            loader.add(resourceName, url, {
                metadata: {
                    spineAtlasFile: atlasUrl,
                    imageLoader: encryptedAtlasImageLoader
                }
            }).load(function(activeLoader, resources) {
                entry.loading = false;
                entry.loader = null;
                var resource = resources && resources[resourceName];
                var errorText = resourceError(resource);
                if (errorText) {
                    entry.error = resource && resource.error || new Error(errorText);
                    fail('Failed to load model "' + entry.id + '" from ' + url + ': ' + errorText,
                        entry.error);
                    return;
                }

                try {
                    createContainer(entry, resource.spineData);
                    log('Loaded model "' + entry.id + '".');
                } catch (error) {
                    entry.error = error;
                    fail('Failed to create model "' + entry.id + '".', error);
                }
            });
            return entry;
        }

        function setTransform(id, x, y, scale, mix) {
            var entry = entryFor(id);
            entry.x = isFinite(Number(x)) ? Number(x) : entry.x;
            entry.y = isFinite(Number(y)) ? Number(y) : entry.y;
            entry.scale = isFinite(Number(scale)) ? Number(scale) : entry.scale;
            entry.mix = mix !== undefined && mix !== null && mix !== '' && isFinite(Number(mix))
                ? Number(mix)
                : null;
            applyEntry(entry);
        }

        function changeSkin(id, skin) {
            var entry = entryFor(id);
            entry.skin = String(skin || '');
            applyEntry(entry);
        }

        function play(id, animation) {
            var entry = entryFor(id);
            entry.animation = String(animation || '');
            entry.visible = true;
            applyEntry(entry);
        }

        function hide(id) {
            if (id !== undefined && id !== null && String(id) !== '') {
                var entry = entryFor(id);
                entry.visible = false;
                applyEntry(entry);
                return;
            }
            Object.keys(entries).forEach(function(key) {
                entries[key].visible = false;
                applyEntry(entries[key]);
            });
        }

        function clear(id) {
            if (id === undefined || id === null || String(id) === '') {
                Object.keys(entries).forEach(clear);
                return;
            }

            id = String(id);
            var entry = entries[id];
            if (!entry) return;
            if (entry.loader && entry.loader.reset) entry.loader.reset();
            if (entry.container) {
                if (entry.container.parent) entry.container.parent.removeChild(entry.container);
                entry.container.destroy({ children: true });
            }
            delete entries[id];
        }

        return {
            loadSpine: load,
            loadResource: load,
            addSpine: load,
            setSpine: setTransform,
            changeSkin: changeSkin,
            playSpine: play,
            hideSpine: hide,
            hideAllSpine: function() { hide(); },
            removeSpine: clear,
            clearSpine: clear,
            getSpineContainer: function(id) {
                var entry = entries[String(id || '')];
                return entry ? entry.container : null;
            },
            isLoading: function(id) {
                var entry = entries[String(id || '')];
                return !!(entry && entry.loading);
            },
            hasError: function(id) {
                var entry = entries[String(id || '')];
                return !!(entry && entry.error);
            },
            ensureLayer: ensureLayer,
            detachLayer: detachLayer,
            _entries: entries
        };
    }

    function installInterpreter(manager) {
        if (!window.Game_Interpreter || !Game_Interpreter.prototype) {
            throw new Error('Game_Interpreter is unavailable.');
        }
        if (Game_Interpreter.prototype._arkChimakiSpinePatched) return;

        var originalPluginCommand = Game_Interpreter.prototype.pluginCommand;
        Game_Interpreter.prototype.pluginCommand = function(command, args) {
            originalPluginCommand.apply(this, arguments);
            if (String(command || '').toUpperCase() !== 'C_SPINE') return;

            args = args || [];
            var action = String(args[0] || '').toUpperCase();
            var id = args[1];
            switch (action) {
            case 'LOAD':
                manager.loadSpine(id, Number(args[2]) || 0);
                if (manager.isLoading(id)) {
                    this._arkChimakiSpineWaitId = String(id);
                    this.setWaitMode('arkChimakiSpine');
                }
                break;
            case 'SET':
                manager.setSpine(id, args[2], args[3], args[4], args[5]);
                break;
            case 'SKIN':
                manager.changeSkin(id, args[2]);
                break;
            case 'PLAY':
                manager.playSpine(id, args[2]);
                break;
            case 'CLEAR':
                manager.clearSpine(id);
                break;
            case 'HIDE':
                manager.hideSpine(id);
                break;
            default:
                warn('Unknown C_SPINE command: ' + args.join(' '));
                break;
            }
        };

        var originalUpdateWaitMode = Game_Interpreter.prototype.updateWaitMode;
        Game_Interpreter.prototype.updateWaitMode = function() {
            if (this._waitMode === 'arkChimakiSpine') {
                var waiting = manager.isLoading(this._arkChimakiSpineWaitId);
                if (!waiting) {
                    this._waitMode = '';
                    this._arkChimakiSpineWaitId = null;
                }
                return waiting;
            }
            return originalUpdateWaitMode.apply(this, arguments);
        };

        Game_Interpreter.prototype._arkChimakiSpinePatched = true;
    }

    function installSceneHooks(manager) {
        if (!window.Scene_Base || !Scene_Base.prototype ||
            Scene_Base.prototype._arkChimakiSpinePatched) return;

        var originalStart = Scene_Base.prototype.start;
        Scene_Base.prototype.start = function() {
            var result = originalStart.apply(this, arguments);
            manager.ensureLayer();
            return result;
        };

        var originalTerminate = Scene_Base.prototype.terminate;
        Scene_Base.prototype.terminate = function() {
            manager.detachLayer();
            return originalTerminate.apply(this, arguments);
        };

        Scene_Base.prototype._arkChimakiSpinePatched = true;
    }

    function isUsableExistingManager(manager) {
        if (!manager || typeof manager.getSpineContainer !== 'function') {
            return false;
        }
        return typeof manager.loadSpine === 'function' ||
            typeof manager.loadResource === 'function' ||
            typeof manager.addSpine === 'function';
    }

    function install() {
        if (installed) return window.$spineManager;

        if (isUsableExistingManager(window.$spineManager)) {
            installed = true;
            log('Existing $spineManager is usable; preserving the game-provided implementation.');
            return window.$spineManager;
        }

        var manager = createManager();
        installInterpreter(manager);
        installSceneHooks(manager);
        window.$spineManager = manager;
        installed = true;
        log('Installed JavaScript replacement for ChimakiSpine.bin.');
        return manager;
    }

    function hookEvalNWBin() {
        if (!window.nw || !nw.Window || typeof nw.Window.get !== 'function') {
            fail('NW.js polyfill is unavailable; cannot hook evalNWBin.');
            return;
        }
        if (nw.Window.get._arkChimakiSpineHooked) return;

        var originalGet = nw.Window.get;
        var hookedGet = function() {
            var win = originalGet.apply(this, arguments);
            var originalEvalNWBin = win.evalNWBin;
            win.evalNWBin = function(frame, path) {
                var normalizedPath = String(path || '').replace(/\\/g, '/');
                if (BIN_PATTERN.test(normalizedPath)) {
                    try {
                        return install();
                    } catch (error) {
                        fail('Failed to install replacement for "' + normalizedPath + '".', error);
                        throw error;
                    }
                }
                if (typeof originalEvalNWBin === 'function') {
                    return originalEvalNWBin.apply(this, arguments);
                }
            };
            return win;
        };
        hookedGet._arkChimakiSpineHooked = true;
        nw.Window.get = hookedGet;
        if (window.mockNW && mockNW.Window) mockNW.Window.get = hookedGet;
        log('Hooked nw.Window.evalNWBin.');
    }

    hookEvalNWBin();
})();
