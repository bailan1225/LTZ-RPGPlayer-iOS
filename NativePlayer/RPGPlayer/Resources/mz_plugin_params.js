// MZ Plugin Parameter Alias Compatibility
//
// Some deployed games rename a plugin file in plugins.js (for example by
// adding an author prefix) while the plugin still requests parameters using
// its original internal name. RPG Maker MZ performs an exact lookup and
// returns {}, which often becomes JSON.parse(undefined) during plugin load.
//
// Keep exact MZ behavior first. Only when the requested key was not
// registered do we try the currently executing plugin filename and then a
// unique, separator-delimited suffix match.

(function() {
    'use strict';

    var warnedAliases = Object.create(null);

    function hasOwn(object, key) {
        return Object.prototype.hasOwnProperty.call(object || {}, key);
    }

    function currentPluginName() {
        try {
            var script = document.currentScript;
            if (!script || !script.src) return '';
            var path = decodeURIComponent(String(script.src)).split(/[?#]/)[0];
            var filename = path.split('/').pop() || '';
            return filename.replace(/\.js$/i, '');
        } catch (_) {
            return '';
        }
    }

    function suffixCandidates(parameters, requestedKey) {
        var keys = Object.keys(parameters || {});
        return keys.filter(function(candidateKey) {
            if (candidateKey.length <= requestedKey.length) return false;
            if (candidateKey.slice(-requestedKey.length) !== requestedKey) return false;
            var separator = candidateKey.charAt(candidateKey.length - requestedKey.length - 1);
            return separator === '/' || separator === '\\' || separator === '_' ||
                separator === '-' || separator === '.';
        });
    }

    function warnAlias(requestedName, resolvedKey) {
        var warningKey = String(requestedName).toLowerCase() + '->' + resolvedKey;
        if (warnedAliases[warningKey]) return;
        warnedAliases[warningKey] = true;
        console.warn(
            '[MZ PluginParams] Using registered plugin parameters:',
            resolvedKey,
            'for requested name:',
            requestedName
        );
    }

    function wrapParameters(manager, original) {
        if (typeof original !== 'function' || original.__arkMZAliasWrapped) {
            return original;
        }

        function parametersWithAlias(name) {
            var exactResult = original.apply(this, arguments);
            var requestedName = String(name == null ? '' : name);
            var requestedKey = requestedName.toLowerCase();
            var parameters = this._parameters || manager._parameters || {};

            // A registered plugin is allowed to have an intentionally empty
            // parameter object. Never replace an exact registration.
            if (!requestedKey || hasOwn(parameters, requestedKey)) {
                return exactResult;
            }

            var matches = suffixCandidates(parameters, requestedKey);
            if (matches.length === 1) {
                warnAlias(requestedName, matches[0]);
                return parameters[matches[0]];
            }

            // If multiple renamed files share the same internal suffix, only
            // the currently executing registered plugin may disambiguate them.
            // Never map an unrelated missing-plugin query to the caller.
            if (matches.length > 1) {
                var scriptName = currentPluginName();
                var scriptKey = scriptName.toLowerCase();
                if (matches.indexOf(scriptKey) >= 0) {
                    warnAlias(requestedName, scriptKey);
                    return parameters[scriptKey];
                }
            }

            return exactResult;
        }

        parametersWithAlias.__arkMZAliasWrapped = true;
        parametersWithAlias.__arkMZAliasOriginal = original;
        return parametersWithAlias;
    }

    function installOnManager(manager) {
        if (!manager || manager.__arkMZPluginParamsInstalled) return;
        manager.__arkMZPluginParamsInstalled = true;

        var descriptor = Object.getOwnPropertyDescriptor(manager, 'parameters');
        var assigned = descriptor && descriptor.value;

        Object.defineProperty(manager, 'parameters', {
            configurable: true,
            enumerable: true,
            get: function() {
                return assigned;
            },
            set: function(value) {
                assigned = wrapParameters(manager, value);
            }
        });

        if (typeof assigned === 'function') {
            assigned = wrapParameters(manager, assigned);
        }
    }

    if (typeof window.PluginManager !== 'undefined') {
        installOnManager(window.PluginManager);
        return;
    }

    var pluginManager;
    Object.defineProperty(window, 'PluginManager', {
        configurable: true,
        enumerable: true,
        get: function() {
            return pluginManager;
        },
        set: function(value) {
            pluginManager = value;
            installOnManager(value);
        }
    });
})();
