// AudioStreaming plugin compat
// 1. ResourceHandler polyfill (AudioStreaming._load calls ResourceHandler.fetchWithRetry)
// 2. WebAudio._load re-wrap at Scene_Boot.start (auto-resume suspended AudioContext)
// 3. WebAudio._buffer compatibility for games/events that inspect MV's legacy buffer
// 4. WebAudio._startPlaying fix: restore streaming path if overridden by later plugin
//    (e.g. WebAudioOffsetFix.js replaces _startPlaying with the XHR _buffer path)
// Trigger: game plugins.js contains AudioStreaming

(function() {
    // --- Runtime Plugin Patches ---
    function applyRuntimePatches() {
        var checkInterval = setInterval(function() {
            if (typeof Scene_Boot !== 'undefined') {
                clearInterval(checkInterval);

                var _Scene_Boot_start = Scene_Boot.prototype.start;
                Scene_Boot.prototype.start = function() {
                    // Re-wrap WebAudio._load to auto-resume suspended AudioContext.
                    // AudioStreaming's async _load may fire before first user touch.
                    if (WebAudio && WebAudio.prototype._load && !WebAudio.prototype._load.__arkLoadPatched2) {
                        var _finalLoad = WebAudio.prototype._load;
                        WebAudio.prototype._load = function(url) {
                            if (WebAudio._context && WebAudio._context.state === 'suspended') {
                                WebAudio._context.resume().catch(function(){});
                            }
                            var ret = _finalLoad.apply(this, arguments);
                            if (ret && typeof ret.then === 'function') {
                                ret.catch(function(e) {
                                    console.error('[Audio Fix] _load async FAILED: url=' + url + ' err=' + e);
                                });
                            }
                            return ret;
                        };
                        WebAudio.prototype._load.__arkLoadPatched2 = true;
                    }

                    // ResourceHandler polyfill: AudioStreaming._load calls
                    // ResourceHandler.fetchWithRetry() unconditionally. If the game
                    // doesn't define ResourceHandler, every audio load throws
                    // "ReferenceError: Can't find variable: ResourceHandler".
                    if (!window.ResourceHandler) {
                        window.ResourceHandler = {
                            _defaultRetryInterval: [500, 1000, 3000],
                            _reloaders: [],
                            fetchWithRetry: async function(method, url, _retryCount) {
                                _retryCount = _retryCount || 0;
                                var response;
                                try {
                                    response = await fetch(url, { credentials: 'same-origin' });
                                } catch(e) {
                                    if (_retryCount < this._defaultRetryInterval.length) {
                                        await new Promise(function(r){ setTimeout(r, this._defaultRetryInterval[_retryCount]); }.bind(this));
                                        return this.fetchWithRetry(method, url, _retryCount + 1);
                                    }
                                    throw new Error('Failed to load: ' + url);
                                }
                                if (!response.ok) {
                                    throw new Error('Failed to load: ' + url + ' (HTTP ' + response.status + ')');
                                }
                                if (method === 'stream') {
                                    if (response.body) {
                                        return response.body.getReader();
                                    }
                                    // Fallback: no streaming support — read all at once
                                    var value = new Uint8Array(await response.arrayBuffer());
                                    return {
                                        _done: false,
                                        read: function() {
                                            if (!this._done) {
                                                this._done = true;
                                                return Promise.resolve({ done: false, value: value });
                                            }
                                            return Promise.resolve({ done: true });
                                        }
                                    };
                                }
                                return await response[method]();
                            }
                        };
                        console.log('[Audio Fix] ResourceHandler polyfill installed');
                    }

                    // AudioStreaming stores decoded audio in _chunks instead of MV's
                    // legacy _buffer field. Some games/events poll _buffer directly
                    // as a readiness signal, for example:
                    //   !!AudioManager._bgmBuffer._buffer
                    // Expose the first streamed AudioBuffer through _buffer so those
                    // checks can continue without modifying game data.
                    if (WebAudio && !WebAudio.prototype.__arkStreamingBufferCompat) {
                        Object.defineProperty(WebAudio.prototype, '_buffer', {
                            get: function() {
                                if (this._chunks && this._chunks.length > 0) {
                                    for (var i = 0; i < this._chunks.length; i++) {
                                        if (this._chunks[i] && this._chunks[i].buffer) {
                                            return this._chunks[i].buffer;
                                        }
                                    }
                                }
                                return this.__arkLegacyBuffer || null;
                            },
                            set: function(value) {
                                this.__arkLegacyBuffer = value;
                            },
                            configurable: true
                        });
                        WebAudio.prototype.__arkStreamingBufferCompat = true;
                        console.log('[Audio Fix] _buffer compatibility installed for AudioStreaming');
                    }

                    // Fix: WebAudio._startPlaying streaming path restore.
                    // Some game plugins (e.g. WebAudioOffsetFix.js by kido) override
                    // WebAudio.prototype._startPlaying after AudioStreaming loads,
                    // reverting to the original XHR _buffer path. In streaming mode
                    // _buffer is always null → _isPlaying never set → silence.
                    //
                    // Detection: AudioStreaming's _startPlaying calls _createSourceNodes().
                    // Original MV's calls _refreshSourceNode(). If '_createSourceNodes'
                    // is absent from the function body, the method has been replaced.
                    //
                    // The negative-offset clamp from WebAudioOffsetFix.js is preserved:
                    //   if (this._offset < 0) this._offset = 0;
                    if (WebAudio && WebAudio.prototype._startPlaying && !WebAudio.prototype._startPlaying.__arkStartPlayingPatched) {
                        var _origStartPlaying = WebAudio.prototype._startPlaying;
                        if (_origStartPlaying.toString().indexOf('_createSourceNodes') < 0) {
                            console.log('[Audio Fix] _startPlaying overridden by plugin (no _createSourceNodes). Restoring streaming path.');
                            WebAudio.prototype._startPlaying = function() {
                                if (this._chunks && this._chunks.length > 0) {
                                    // AudioStreaming streaming path
                                    if (this._offset < 0) this._offset = 0;
                                    this._isPlaying = true;
                                    this._startTime = WebAudio._context.currentTime - (this._offset || 0) / (this._pitch || 1);
                                    this._removeNodes();
                                    this._createNodes();
                                    this._connectNodes();
                                    this._createSourceNodes();
                                    return;
                                }
                                // Fallback to original (XHR-loaded _buffer path)
                                return _origStartPlaying.apply(this, arguments);
                            };
                            WebAudio.prototype._startPlaying.__arkStartPlayingPatched = true;
                        }
                    }

                    _Scene_Boot_start.call(this);
                };
            }
        }, 100);
    }
    applyRuntimePatches();
})();
