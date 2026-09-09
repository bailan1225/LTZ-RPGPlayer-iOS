// compat_PDX_KeybindingsRemap.js
// Compatibility fix for the PDX_KeybindingsRemap plugin (used in Didnapper2 etc.)
//
// Problem:
//   PDX_KeybindingsRemap completely rewrites Input state management:
//   - _currentState entries are { state, pressedTime, lastPressed } OBJECTS, not booleans
//   - Input.isTriggered/isPressed read `.state` and `.pressedTime` from these objects
//   - InputBridge.press() from common_input.js writes _currentState[name] = true (boolean)
//   - true.state === undefined → isTriggered/isPressed always return false → ALL input broken
//
// Fix:
//   Patch InputBridge.press / InputBridge.release to call Input._updateCurrentState()
//   (added by PDX_KeybindingsRemap) at call-time, writing the correct object format.
//   Falls back to the standard boolean format if _updateCurrentState is not available
//   (i.e., PDX_KeybindingsRemap hasn't loaded yet, or game runs without it).
//
// Note on _previousState:
//   PDX_KeybindingsRemap's Input.update() copies _currentState → _previousState each frame.
//   We must NOT write _previousState[name] = false here; that would store a boolean and
//   corrupt the `{ ...previousState[name] }` spread logic in update().
//
// Trigger: game plugins.js contains PDX_KeybindingsRemap

(function () {
    if (!window.InputBridge) {
        console.warn('[Compat_KeybindingsRemap] InputBridge not found at document start, skipping patch');
        return;
    }

    // Capture helpers from InputBridge (defined in common_input.js)
    var _getKeyCode = InputBridge._getKeyCode.bind(InputBridge);

    InputBridge.press = function (keyName) {
        var keyCode = _getKeyCode(keyName);
        if (keyCode && typeof Input !== 'undefined' && Input.keyMapper) {
            var name = Input.keyMapper[keyCode];
            if (name) {
                this._held[name] = true;

                if (typeof Input._updateCurrentState === 'function') {
                    // PDX_KeybindingsRemap format: { state, pressedTime, lastPressed }
                    // _updateCurrentState lowercases the name internally.
                    Input._updateCurrentState(name, true);

                    // Reset pressedTime to 0 so isTriggered() fires on the first frame.
                    // _updateCurrentState preserves pressedTime on re-press (only resets on release),
                    // but virtual keyboard presses should always be treated as fresh triggers.
                    var key = name.toLowerCase();
                    if (Input._currentState[key]) {
                        Input._currentState[key].pressedTime = 0;
                    }
                } else {
                    // Standard RPGMaker boolean format (fallback)
                    if (Input._currentState) Input._currentState[name] = true;
                    // Do NOT write _previousState here — PDX_KeybindingsRemap's update()
                    // spreads _currentState into _previousState; a boolean value would corrupt it.
                    // For non-PDX games the standard code already handles this.
                }

                // Signal to PDX_KeyboardNameInput (and similar plugins) that a
                // controller-like device triggered this input, enabling processHandling
                // in Window_NameInput even without a physical gamepad connected.
                Input._lastInputIsController = true;
                return;
            }
        }
        // Unrecognized key: no-op (avoids calling the old boolean-writing implementation)
    };

    InputBridge.release = function (keyName) {
        var keyCode = _getKeyCode(keyName);
        if (keyCode && typeof Input !== 'undefined' && Input.keyMapper) {
            var name = Input.keyMapper[keyCode];
            if (name) {
                delete this._held[name];

                if (typeof Input._updateCurrentState === 'function') {
                    // PDX_KeybindingsRemap: sets state=false, pressedTime=0
                    Input._updateCurrentState(name, false);
                } else {
                    if (Input._currentState) Input._currentState[name] = false;
                }
                return;
            }
        }
        // Unrecognized key: no-op
    };

    // -------------------------------------------------------------------
    // Patch sendInput (used for raw string keys like "Z", "X", "Q", "E")
    //
    // Problem:
    //   sendInput() writes _currentState[name] = true (boolean) BEFORE
    //   dispatching the keydown event. When _onKeyDown fires and calls
    //   _updateCurrentState('Ok', true), it does:
    //     _currentState['ok'] = _currentState['ok'] || { state: true, ... }
    //   Because _currentState['ok'] = true (truthy), the `||` short-circuits
    //   and keeps the boolean. Property writes (.state, .lastPressed) on a
    //   primitive silently fail. Input is still broken.
    //
    // Fix:
    //   Call _origSendInput (which dispatches the event), then check whether
    //   _currentState[name] is still a non-object (i.e., the boolean was not
    //   overwritten). If so, delete the stale boolean and call
    //   _updateCurrentState ourselves to create the correct object format.
    //
    //   Keyup does not need this fix: sendInput writes false (falsy), and
    //   false || {...} correctly creates the {state: false, ...} object.
    // -------------------------------------------------------------------
    var _origSendInput = InputBridge.sendInput.bind(InputBridge);

    InputBridge.sendInput = function (type, key, code, keyCode) {
        // Always call original to get _held management + event dispatch
        _origSendInput(type, key, code, keyCode);

        // Post-fix for keydown only when PDX_KeybindingsRemap is active
        if (type !== 'keydown') return;
        if (typeof Input === 'undefined' || typeof Input._updateCurrentState !== 'function') return;
        if (!Input.keyMapper) return;

        var name = Input.keyMapper[parseInt(keyCode)];
        if (!name) return;

        var lname = name.toLowerCase();
        if (!Input._currentState) return;

        // If _currentState[lname] is NOT a proper object (boolean, undefined, etc.)
        // the _updateCurrentState call inside _onKeyDown was blocked by the boolean write.
        // Delete the stale primitive and re-invoke _updateCurrentState to create the object.
        if (typeof Input._currentState[lname] !== 'object' || Input._currentState[lname] === null) {
            delete Input._currentState[lname];
            Input._updateCurrentState(name, true);
            // Ensure pressedTime=0 so isTriggered fires on this frame
            if (Input._currentState[lname]) Input._currentState[lname].pressedTime = 0;
        }

        Input._lastInputIsController = true;
    };

    console.log('[Compat_KeybindingsRemap] InputBridge.press/release/sendInput patched for PDX_KeybindingsRemap');
})();
