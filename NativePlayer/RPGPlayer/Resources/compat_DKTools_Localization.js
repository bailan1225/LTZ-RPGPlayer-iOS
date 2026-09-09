// DKTools_Localization text-only translation
// 问题：DKTools_Localization 禁用后，游戏文本显示为 {MES00008} 等占位符。
// 原因：该插件负责将 {key} 标签替换为翻译文本（JSON 存于 locales/ 目录），
//       但同时重写资源路径导致黑屏，因此只能禁用其完整功能。
// 修复：独立加载 locale JSON 数据，仅提供文本翻译，不做资源路径重写。
//       同时提供 DKTools.Localization stub，避免其他插件引用 DKTools.Localization.locale 时崩溃。
// Trigger: game plugins.js contains DKTools_Localization

(function() {
    'use strict';

    var TAG = '[DKTools Loc Compat]';
    function L(msg) { try { console.log(TAG + ' ' + msg); } catch(e) {} }
    L('=== compat patch loaded @ ' + new Date().toISOString() + ' ===');
    try { L('navigator.language=' + navigator.language + ' navigator.languages=' + (navigator.languages || []).join(',')); } catch(e) {}
    try { L('window.location=' + (window.location && window.location.href)); } catch(e) {}

    var LOCALE_KEY = 'RPG Locale';
    var DEFAULT_LOCALE = 'en';
    var PARSE_DEPTH = 2;
    var REGEX_TAG = /\{(.*?)\}/g;
    var REGEX_VAR = /\\VAR\[(\d+)\]/g;

    // Locale tag → 游戏 locale 别名候选（CSV 列名 / locale 子目录名）
    // 用于把 navigator.language 推断出的标准 locale tag 匹配到游戏实际使用的短 locale 名
    // 例：zh-CN → cn（HILLS CSV 列名）；zh-TW → tw；ja → jp；ko → kr
    var LOCALE_ALIASES = {
        'zh-CN': ['cn', 'zh', 'zh_CN', 'zh-Hans', 'chs', 'zh-Hans-CN', 'zh-CN', 'tw', 'zh-TW', 'cht'],
        'zh-TW': ['tw', 'cht', 'zh_TW', 'zh-Hant', 'zh-Hant-TW', 'zh-TW'],
        'zh-HK': ['hk', 'zh-HK', 'zh-Hant-HK', 'zh-hk'],
        'en': ['eng'],
        'ja': ['jp', 'jpn', 'ja-JP'],
        'ko': ['kr', 'kor', 'ko-KR'],
        'ru': ['ru-RU', 'rus'],
        'fr': ['fr-FR', 'fra'],
        'es': ['es-ES', 'spa'],
        'de': ['de-DE', 'deu'],
        'it': ['it-IT', 'ita'],
        'pt-BR': ['ptbr', 'pt_br', 'pt-BR'],
        'vi-VN': ['vi', 'vie']
    };

    // 判断两个 locale tag 是否属于同一语言族（用于检测 saved locale 与系统语言是否一致）
    function sameLocaleFamily(a, b) {
        if (!a || !b) return false;
        if (a === b) return true;
        var aSet = [a].concat(LOCALE_ALIASES[a] || []);
        var bSet = [b].concat(LOCALE_ALIASES[b] || []);
        for (var i = 0; i < aSet.length; i++) {
            if (bSet.indexOf(aSet[i]) >= 0) return true;
        }
        return false;
    }

    var __locData = null;
    var __locCache = {};
    var __locale = DEFAULT_LOCALE;
    var __availableLocales = null;
    var __dkParams = null;
    var __localeListeners = [];
    var __pretranslatedMessageLines = [];
    var __standingPictureDiagCount = 0;

    var LOCALE_DISPLAY = {
        'en': 'English',
        'ja': '日本語',
        'jp': '日本語',
        'ko': '한국어',
        'kr': '한국어',
        'ru': 'Русский',
        'zh': '中文',
        'zh-CN': '简体中文',
        'zh-TW': '繁體中文',
        'zh-Hans': '简体中文',
        'zh-Hant': '繁體中文',
        'zh-hk': '繁體中文（香港）',
        'zh-HK': '繁體中文（香港）',
        'vi-VN': 'Tiếng Việt',
        'vi': 'Tiếng Việt',
        'pt-BR': 'Português (Brasil)',
        'pt': 'Português',
        'es': 'Español',
        'fr': 'Français',
        'de': 'Deutsch',
        'it': 'Italiano',
        'cn': '中文',
        'tw': '繁體中文',
        'text': 'Text'
    };

    var LOCALE_PROBE_FILES = [
        'main.json', 'system.json', 'title.json', 'menu.json',
        'options.json', 'CommonEvents.json', 'actors.json', 'index.json'
    ];

    var LOCALE_CANDIDATES = [
        'en', 'ja', 'jp', 'ko', 'kr', 'ru', 'zh', 'zh-CN', 'zh-TW',
        'zh-Hans', 'zh-Hant', 'zh-hk', 'zh-HK', 'vi-VN', 'vi',
        'pt-BR', 'pt', 'es', 'fr', 'de', 'it', 'cn', 'tw', 'text'
    ];

    function getLocaleDisplayName(loc) {
        if (__dkParams && __dkParams._displayNameByLocale) {
            var name = __dkParams._displayNameByLocale[loc];
            if (name) return name;
        }
        return LOCALE_DISPLAY[loc] || loc;
    }

    // Load DKTools_Localization parameters from the game's js/plugins.js.
    // Returns { First Launch: bool, Languages: [{Language, Locale, Primary}, ...], ... } or null.
    function loadDKToolsParams() {
        if (__dkParams !== null) return __dkParams;
        __dkParams = {}; // mark as attempted
        try {
            var text = xhrLoadText('js/plugins.js');
            L('loadDKToolsParams: js/plugins.js XHR result type=' + (typeof text) + ', length=' + (text ? text.length : 0));
            if (!text) return __dkParams;
            var nameIdx = text.indexOf('"name":"DKTools_Localization"');
            L('loadDKToolsParams: DKTools_Localization entry index=' + nameIdx);
            if (nameIdx < 0) return __dkParams;
            // Limit segment to this plugin entry — next "name":"..." or end of array
            var segment = text.substr(nameIdx, 4000);
            var nextName = segment.indexOf('"name":"', 50);
            if (nextName > 0) segment = segment.substr(0, nextName);

            var firstLaunch = false;
            var flMatch = segment.match(/"First Launch"\s*:\s*"([^"]*)"/);
            if (flMatch) firstLaunch = (flMatch[1] === 'true');

            var languages = [];
            // Capture the full JSON string value (with surrounding quotes) so we
            // can use JSON.parse to handle the nested escaping correctly.
            // plugins.js stores Languages as a JSON-stringified array of JSON-stringified objects,
            // so the value contains doubly-escaped quotes like \" and \\\".
            var langMatch = segment.match(/"Languages"\s*:\s*("(?:[^"\\]|\\.)*")/);
            if (langMatch) {
                try {
                    var unescaped = JSON.parse(langMatch[1]); // unwrap outer JSON string
                    var langArr = JSON.parse(unescaped) || [];  // parse inner array
                    // Each element is itself a JSON-stringified object — parse once more
                    for (var li = 0; li < langArr.length; li++) {
                        if (typeof langArr[li] === 'string') {
                            try { langArr[li] = JSON.parse(langArr[li]); } catch(e) {}
                        }
                    }
                    languages = langArr;
                } catch(e) {}
            }

            __dkParams = {
                'First Launch': firstLaunch,
                'Languages': languages,
                _displayNameByLocale: (function() {
                    var m = {};
                    for (var i = 0; i < languages.length; i++) {
                        if (languages[i].Locale) m[languages[i].Locale] = languages[i].Language;
                    }
                    return m;
                })()
            };
            L('loadDKToolsParams: parsed OK → First Launch=' + firstLaunch +
              ', Languages count=' + languages.length +
              ', locales=[' + languages.map(function(x){return x.Locale;}).join(',') + ']');
        } catch(e) {
            L('loadDKToolsParams: EXCEPTION ' + (e && e.message));
        }
        return __dkParams;
    }

    function probeAvailableLocales() {
        if (__availableLocales) return __availableLocales;
        // Prefer the game-declared Languages list (from DKTools_Localization params)
        var params = loadDKToolsParams();
        var found = [];
        var seen = {};
        if (params && params['Languages'] && params['Languages'].length > 0) {
            for (var k = 0; k < params['Languages'].length; k++) {
                var entry = params['Languages'][k];
                if (entry && entry.Locale && !seen[entry.Locale]) {
                    seen[entry.Locale] = true;
                    found.push(entry.Locale);
                }
            }
        }
        // Fallback: probe candidate folder names
        for (var i = 0; i < LOCALE_CANDIDATES.length; i++) {
            var loc = LOCALE_CANDIDATES[i];
            if (seen[loc]) continue;
            seen[loc] = true;
            for (var j = 0; j < LOCALE_PROBE_FILES.length; j++) {
                var url = 'locales/' + loc + '/' + LOCALE_PROBE_FILES[j];
                if (xhrLoadText(url)) {
                    found.push(loc);
                    break;
                }
            }
        }
        if (found.length === 0) found = [__locale];
        __availableLocales = found;
        L('probeAvailableLocales → [' + found.join(',') + ']');
        return found;
    }

    function resolveLocale(lang) {
        var lower = (lang || 'en').toLowerCase();
        var r;
        if (lower.indexOf('zh-hans') === 0) r = 'zh-CN';
        else if (lower.indexOf('zh-hant') === 0) r = 'zh-TW';
        else if (lower === 'zh-cn') r = 'zh-CN';
        else if (lower === 'zh-tw') r = 'zh-TW';
        else if (lower === 'zh-hk') r = 'zh-HK';
        else if (lower.indexOf('zh') === 0) r = 'zh-CN';
        else if (lower.indexOf('ja') === 0) r = 'ja';
        else if (lower.indexOf('ko') === 0) r = 'ko';
        else if (lower.indexOf('ru') === 0) r = 'ru';
        else if (lower.indexOf('fr') === 0) r = 'fr';
        else if (lower.indexOf('es') === 0) r = 'es';
        else if (lower.indexOf('de') === 0) r = 'de';
        else if (lower.indexOf('it') === 0) r = 'it';
        else if (lower.indexOf('pt') === 0) r = 'pt-BR';
        else if (lower.indexOf('vi') === 0) r = 'vi-VN';
        else r = DEFAULT_LOCALE;
        L('resolveLocale("' + lang + '") → "' + r + '"');
        return r;
    }

    try {
        var saved = localStorage.getItem(LOCALE_KEY);
        var userSelected = localStorage.getItem(LOCALE_KEY + '_userSelected') === 'true';
        var navLocale = resolveLocale(navigator.language);
        L('init: localStorage["' + LOCALE_KEY + '"]=' + JSON.stringify(saved) + ', userSelected=' + userSelected + ', navigator→"' + navLocale + '"');
        if (saved && typeof saved === 'string' && saved.length > 0) {
            if (userSelected) {
                __locale = saved;
                L('init: using saved locale "' + __locale + '" (user-selected, honored)');
            } else if (sameLocaleFamily(saved, navLocale)) {
                __locale = saved;
                L('init: using saved locale "' + __locale + '" (matches navigator family)');
            } else {
                L('init: saved locale "' + saved + '" mismatches navigator family "' + navLocale + '" — discarding (likely historical residue)');
                try { localStorage.removeItem(LOCALE_KEY); } catch (e) {}
                __locale = navLocale;
            }
        } else {
            __locale = navLocale;
            L('init: no saved locale, resolved from navigator → "' + __locale + '"');
        }
    } catch (e) {
        L('init: localStorage read threw ' + (e && e.message));
        __locale = resolveLocale(navigator.language);
    }

    function xhrLoadText(url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        try {
            xhr.send();
            if (xhr.status === 200 || xhr.status === 0) {
                return xhr.responseText;
            }
        } catch (e) {}
        return null;
    }

    function mergeJsonData(data, text, source) {
        try {
            var json = JSON.parse(text);
            if (Array.isArray(json)) {
                data[source] = json;
            } else if (typeof json === 'object' && json !== null) {
                var keys = Object.keys(json);
                for (var k = 0; k < keys.length; k++) {
                    if (data[keys[k]] === undefined) {
                        data[keys[k]] = json[keys[k]];
                    }
                }
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    var __localeFolderCaseCache = {};
    function findLocaleFolderCase(declaredLocale) {
        if (!declaredLocale) return declaredLocale;

        // Manifest 优先：Native 端已扫描实际目录，locale → dir 映射是 ground truth。
        // 跳过昂贵的 hasAny 探测，避免对 manifest 内已有但文件名不在探测白名单的 locale 误判。
        var manifest = window.__ArkLocaleManifest;
        if (manifest && typeof manifest === 'object') {
            var manifestKeys = Object.keys(manifest).filter(function(k) { return k.charAt(0) !== '_'; });
            for (var mi = 0; mi < manifestKeys.length; mi++) {
                if (manifestKeys[mi] === declaredLocale) return declaredLocale;
            }
            var dl = declaredLocale.toLowerCase();
            for (var mi = 0; mi < manifestKeys.length; mi++) {
                if (manifestKeys[mi].toLowerCase() === dl) return manifestKeys[mi];
            }
        }

        if (Object.prototype.hasOwnProperty.call(__localeFolderCaseCache, declaredLocale)) {
            return __localeFolderCaseCache[declaredLocale];
        }
        // Quick probe with just a few common filenames before falling back.
        function hasAny(loc) {
            return !!(xhrLoadText('locales/' + loc + '/main.json') ||
                      xhrLoadText('locales/' + loc + '/system.json') ||
                      xhrLoadText('locales/' + loc + '/title.json') ||
                      xhrLoadText('locales/' + loc + '/CommonEvents.json'));
        }
        var result = declaredLocale;
        if (!hasAny(declaredLocale)) {
            var variants = [
                declaredLocale.toUpperCase(),
                declaredLocale.toLowerCase()
            ];
            var dashIdx = declaredLocale.indexOf('-');
            if (dashIdx > 0) {
                var head = declaredLocale.substring(0, dashIdx);
                var tail = declaredLocale.substring(dashIdx + 1);
                variants.push(head.toLowerCase() + '-' + tail.toUpperCase());
                variants.push(head.toUpperCase() + '-' + tail.toUpperCase());
                variants.push(head.toUpperCase() + '-' + tail.toLowerCase());
                variants.push(head.charAt(0).toUpperCase() + head.slice(1).toLowerCase() + '-' + tail.toUpperCase());
            } else {
                variants.push(declaredLocale.charAt(0).toUpperCase() + declaredLocale.slice(1).toLowerCase());
            }
            var tried = {};
            tried[declaredLocale] = true;
            for (var i = 0; i < variants.length; i++) {
                if (tried[variants[i]]) continue;
                tried[variants[i]] = true;
                if (hasAny(variants[i])) {
                    result = variants[i];
                    break;
                }
            }
        }
        __localeFolderCaseCache[declaredLocale] = result;
        if (result !== declaredLocale) {
            L('findLocaleFolderCase("' + declaredLocale + '") → "' + result + '" (case-adjusted)');
        }
        return result;
    }

    function loadLocaleData(locale) {
        // Some games (e.g., Succubus! Dark Covenant) declare locale 'en' in
        // plugins.js but ship the folder as 'EN'. On case-sensitive filesystems
        // (iOS), the exact-case probe fails. Resolve the actual folder case first.
        var actualCase = findLocaleFolderCase(locale);
        var data = _loadLocaleDataRaw(actualCase);
        L('loadLocaleData("' + locale + '") folderCase="' + actualCase + '" → ' + Object.keys(data).length + ' keys');
        return data;
    }

    // RFC 4180 CSV 解析器：支持字段内引号转义、字段内换行、UTF-8 BOM。
    // 分号分隔（DKTools_Localization 惯例）；RPG Maker 控制符（\C[n] \n \!）原样保留。
    function parseRFC4180CSV(text, locale) {
        if (!text) return null;
        if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

        var rows = [];
        var row = [];
        var field = '';
        var inQuotes = false;

        for (var i = 0; i < text.length; i++) {
            var c = text.charAt(i);
            if (inQuotes) {
                if (c === '"') {
                    if (text.charAt(i + 1) === '"') { field += '"'; i++; }
                    else inQuotes = false;
                } else {
                    field += c;
                }
            } else {
                if (c === '"') {
                    inQuotes = true;
                } else if (c === ';') {
                    row.push(field); field = '';
                } else if (c === '\r') {
                    // skip; \n handles EOL
                } else if (c === '\n') {
                    row.push(field); rows.push(row); row = []; field = '';
                } else {
                    field += c;
                }
            }
        }
        if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }

        if (rows.length < 2) return null;

        var header = rows[0];
        var locIdx = -1;
        // Step 1：精确匹配
        for (var h = 0; h < header.length; h++) {
            if (header[h] === locale) { locIdx = h; break; }
        }
        // Step 2：大小写不敏感匹配
        if (locIdx < 0) {
            var lc = locale.toLowerCase();
            for (var h = 0; h < header.length; h++) {
                if (header[h] && header[h].toLowerCase() === lc) { locIdx = h; break; }
            }
        }
        // Step 3：locale 别名匹配（如 zh-CN → cn/tw，解决 CSV 列名是短 locale 的情况）
        if (locIdx < 0) {
            var aliases = LOCALE_ALIASES[locale] || [];
            for (var ai = 0; ai < aliases.length && locIdx < 0; ai++) {
                var alias = aliases[ai];
                var aliasLc = alias.toLowerCase();
                for (var h = 0; h < header.length; h++) {
                    if (header[h] && (header[h] === alias || header[h].toLowerCase() === aliasLc)) {
                        locIdx = h;
                        break;
                    }
                }
            }
        }
        // Step 4：兜底第二列（通常 en）
        if (locIdx < 0) locIdx = 1;
        L('parseRFC4180CSV: locale="' + locale + '" header=[' + header.slice(0, 10).join(',') + '] → col=' + locIdx + ' ("' + (header[locIdx] || '?') + '")');

        var map = {};
        for (var r = 1; r < rows.length; r++) {
            var cols = rows[r];
            if (cols.length > locIdx && cols[0]) {
                var v = cols[locIdx].replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                map[cols[0]] = v;
            }
        }
        return map;
    }

    function _loadLocaleDataRaw(locale) {
        var data = {};
        var loaded = 0;

        var manifest = window.__ArkLocaleManifest;
        var entry = manifest && manifest[locale];

        // Phase 1：manifest 提供的 JSON 文件清单（支持目录扫描、带空格/连字符文件名）
        if (entry && entry.jsons && entry.jsons.length) {
            for (var i = 0; i < entry.jsons.length; i++) {
                var fn = entry.jsons[i];
                var jtext = xhrLoadText('locales/' + locale + '/' + fn);
                if (jtext && mergeJsonData(data, jtext, fn)) loaded++;
            }
            if (loaded > 0) {
                console.log(TAG + ' Loaded ' + loaded + ' locale files for "' + locale + '" via manifest (' + Object.keys(data).length + ' keys)');
                return data;
            }
        }

        // Phase 2：白名单枚举（兼容未扫描 manifest 的旧场景）
        var bases = [
            'System', 'CommonEvents', 'CommonEvents_C', 'CommonEvents_S',
            'Actors', 'Classes', 'Skills', 'Items', 'Weapons', 'Armors',
            'Enemies', 'Troops', 'States', 'MapInfos',
            'Map', 'Map_C', 'Map_S',
            'PlugIn', 'menu', 'CharaName', 'MapnameInMap',
            'RecollectionMode', 'Animations', 'Tilesets',
            'achievements', 'float_texts', 'hints',
            'map_events', 'notes', 'options', 'room_names',
            'scenes', 'tutorials', 'main', 'dialog', 'dialogs',
            'system', 'ui', 'interface', 'common', 'maps',
            'battle', 'quest', 'quests', 'crafting', 'shop'
        ];

        for (var i = 0; i < bases.length; i++) {
            var url1 = 'locales/' + locale + '/' + bases[i] + '_' + locale + '.json';
            var text = xhrLoadText(url1);
            if (text && mergeJsonData(data, text, bases[i])) { loaded++; continue; }

            var url2 = 'locales/' + locale + '/' + bases[i] + '.json';
            text = xhrLoadText(url2);
            if (text && mergeJsonData(data, text, bases[i])) { loaded++; }
        }

        // Phase 3：CSV 加载（manifest 全局 CSV 优先 → 标准 fallback 路径）
        if (loaded === 0) {
            var csvText = null;
            if (manifest && manifest._globalCsv) csvText = xhrLoadText(manifest._globalCsv);
            if (!csvText) csvText = xhrLoadText('locales/' + locale + '/' + locale + '.csv');
            if (!csvText) csvText = xhrLoadText('locales/' + locale + '.csv');
            if (csvText) {
                var parsed = parseRFC4180CSV(csvText, locale);
                if (parsed) {
                    var keys = Object.keys(parsed);
                    for (var k = 0; k < keys.length; k++) {
                        data[keys[k]] = parsed[keys[k]];
                    }
                    loaded = keys.length;
                }
            }
        }

        if (loaded > 0) {
            console.log(TAG + ' Loaded ' + loaded + ' locale files for "' + locale + '" (' + Object.keys(data).length + ' keys)');
        }
        return data;
    }

    function translateText(text) {
        if (text == null) return text;
        text = String(text);
        if (text.length < 3 || !__locData) return text;

        if (__locCache[text]) return __locCache[text].text;

        var initialText = text;
        var needCache = false;
        var variables = [];

        var varReplace = function(t) {
            return t.replace(REGEX_VAR, function(s, m) {
                var id = Number(m);
                variables.push(id);
                needCache = true;
                return $gameVariables ? $gameVariables.value(id) : '';
            });
        };

        var textReplace = function(t) {
            return t.replace(REGEX_TAG, function(s, m) {
                if (__locData.hasOwnProperty(m)) {
                    needCache = true;
                    return __locData[m];
                }
                return m;
            });
        };

        for (var i = 0; i < PARSE_DEPTH; i++) {
            var temp = text;
            text = varReplace(text);
            text = textReplace(text);
            text = varReplace(text);
            if (!needCache && text === temp) break;
        }

        if (needCache && initialText.length >= 20) {
            __locCache[initialText] = { text: text, variables: variables };
        }

        return text;
    }

    function markPretranslatedMessageLine(text) {
        if (text == null) return;
        text = String(text);
        __pretranslatedMessageLines.push(text);
        if (__pretranslatedMessageLines.length > 256) {
            __pretranslatedMessageLines.splice(0, __pretranslatedMessageLines.length - 256);
        }
    }

    function consumePretranslatedMessageLine(text) {
        if (text == null || __pretranslatedMessageLines.length === 0) return false;
        text = String(text);
        var index = __pretranslatedMessageLines.indexOf(text);
        if (index < 0) return false;
        __pretranslatedMessageLines.splice(index, 1);
        return true;
    }

    function shouldLogStandingPictureTranslation(raw, translated) {
        if (__standingPictureDiagCount >= 40) return false;
        raw = raw == null ? '' : String(raw);
        translated = translated == null ? '' : String(translated);
        return raw.indexOf('day1_mainstory_0001') >= 0 ||
            raw.indexOf('{day') >= 0 && /\\(?:F|FF|FFF|FFFF|SK|SSK|SSSK|SSSSK|SA|SSA|SSSA|SSSSA)\[/.test(translated) ||
            /\\(?:F|FF|FFF|FFFF)\[/.test(translated) && /\\(?:SK|SSK|SSSK|SSSSK)\[/.test(translated);
    }

    function logStandingPictureTranslation(source, raw, translated) {
        if (!shouldLogStandingPictureTranslation(raw, translated)) return;
        __standingPictureDiagCount++;
        L('StandingPicture pretranslate #' + __standingPictureDiagCount +
          ' source=' + source +
          ' raw=' + JSON.stringify(String(raw).slice(0, 120)) +
          ' translated=' + JSON.stringify(String(translated).slice(0, 180)));
    }

    function pretranslateMessageLine(raw, source) {
        if (typeof raw !== 'string') return raw;
        var translated = translateText(raw);
        if (translated !== raw) {
            markPretranslatedMessageLine(translated);
            logStandingPictureTranslation(source, raw, translated);
        }
        return translated;
    }

    function installCommand101PreTranslationHook() {
        if (typeof Game_Interpreter === 'undefined' || !Game_Interpreter.prototype.command101) return false;
        if (Game_Interpreter.prototype.command101._arkDKLocCommand101Wrapper) return true;

        var _orig_command101 = Game_Interpreter.prototype.command101;
        var wrapped = function() {
            var list = this._list;
            if (list) {
                var idx = this._index + 1;
                while (idx < list.length && list[idx] && list[idx].code === 401) {
                    var params = list[idx].parameters;
                    if (params && typeof params[0] === 'string') {
                        var raw = params[0];
                        var translated = pretranslateMessageLine(raw, 'command101');
                        if (translated !== raw) {
                            params[0] = translated;
                        }
                    }
                    idx++;
                }
            }
            return _orig_command101.apply(this, arguments);
        };
        wrapped._arkDKLocCommand101Wrapper = true;
        wrapped._arkDKLocCommand101Original = _orig_command101;
        Game_Interpreter.prototype.command101 = wrapped;
        L('Game_Interpreter.command101 pre-translation hook installed');
        return true;
    }

    function installMessageStartPreTranslationHook() {
        if (typeof Window_Message === 'undefined' || !Window_Message.prototype.startMessage) return false;
        if (Window_Message.prototype.startMessage._arkDKLocStartMessageWrapper) return true;

        var _orig_startMessage = Window_Message.prototype.startMessage;
        var wrapped = function() {
            try {
                if (typeof $gameMessage !== 'undefined' && $gameMessage && Array.isArray($gameMessage._texts)) {
                    for (var i = 0; i < $gameMessage._texts.length; i++) {
                        if (typeof $gameMessage._texts[i] === 'string') {
                            $gameMessage._texts[i] = pretranslateMessageLine($gameMessage._texts[i], 'startMessage');
                        }
                    }
                }
            } catch (e) {
                L('Window_Message.startMessage pre-translation failed: ' + (e && e.message));
            }
            return _orig_startMessage.apply(this, arguments);
        };
        wrapped._arkDKLocStartMessageWrapper = true;
        wrapped._arkDKLocStartMessageOriginal = _orig_startMessage;
        Window_Message.prototype.startMessage = wrapped;
        L('Window_Message.startMessage pre-translation hook installed');
        return true;
    }

    // Load locale data first, resolve fallbacks, THEN install stub
    __locData = loadLocaleData(__locale);

    // Strategy C: stale localStorage entry from a prior buggy scene build
    // (e.g., bare "zh" saved when the real folder is "cn"/"zh-CN") will load
    // 0 keys here. If __locale came from saved and produced no data, discard
    // the saved value and re-resolve from the actual system language before
    // entering the fallback chain.
    var __savedLocaleAtLoad = saved;
    if ((!__locData || Object.keys(__locData).length === 0) &&
        saved && __locale === saved) {
        L('init: saved locale "' + saved + '" loaded 0 keys — discarding, re-resolving from navigator');
        try { localStorage.removeItem(LOCALE_KEY); } catch (e) {}
        __locale = resolveLocale(navigator.language);
        __locData = loadLocaleData(__locale);
    }

    if (!__locData || Object.keys(__locData).length === 0) {
        // Fallback chain: first try locale aliases (incl. cross-family like zh-CN → tw),
        // then a broad list of common locales. English is intentionally last so that
        // a Chinese-system user prefers tw (Traditional) over en when the game has no cn.
        var others = ['jp', 'ja', 'kr', 'ko', 'es', 'esp', 'fr', 'ru', 'ptbr', 'pt-BR', 'it', 'de', 'vi-VN', 'vi', 'en'];
        var fallbacks = (LOCALE_ALIASES[__locale] || []).concat(others);
        L('init: __locData empty, trying fallbacks=[' + fallbacks.join(',') + ']');
        for (var fi = 0; fi < fallbacks.length; fi++) {
            if (fallbacks[fi] === __locale) continue;
            var tryData = loadLocaleData(fallbacks[fi]);
            var tryKeys = tryData ? Object.keys(tryData).length : 0;
            if (tryData && tryKeys > 0) {
                __locale = fallbacks[fi];
                __locData = tryData;
                L('init: FALLBACK HIT → __locale="' + __locale + '" (' + tryKeys + ' keys)');
                break;
            }
        }
        if (!__locData || Object.keys(__locData).length === 0) {
            L('init: NO FALLBACK HIT — game will run without translation');
        }
    }

    // Self-heal localStorage: if final locale differs from what was saved and
    // we actually have data, persist the resolved locale so subsequent launches
    // skip the fallback chain entirely.
    if (__locData && Object.keys(__locData).length > 0 &&
        __savedLocaleAtLoad !== undefined && __locale !== __savedLocaleAtLoad) {
        try {
            localStorage.setItem(LOCALE_KEY, __locale);
            L('init: localStorage["' + LOCALE_KEY + '"] updated "' + __savedLocaleAtLoad + '" → "' + __locale + '"');
        } catch (e) {
            L('init: localStorage update failed: ' + (e && e.message));
        }
    }

    // --- LocalizationParam stub ---
    // YEP_OptionsCore eval's `LocalizationParam.get('Show Options Command')` etc.
    // Since DKTools_Localization is disabled, provide a minimal stub.
    window.LocalizationParam = {
        get: function(key) {
            if (key === 'Show Options Command') return false;
            return undefined;
        }
    };

    // --- DKTools.Localization stub ---
    // DKTools.js does `window.DKTools = {};` which overwrites any existing DKtools.
    // Use Object.defineProperty to intercept the assignment and inject Localization.
    (function installLocalizationStub() {
        var _dktoolsVal;
        var _installed = false;

        // Localization stub — uses closure over __locale / __locData so locale
        // fallback updates are automatically reflected without patching the object.
        var locObj = {};
        Object.defineProperty(locObj, 'locale', {
            get: function() { return __locale; },
            configurable: true
        });
        Object.defineProperty(locObj, 'language', {
            get: function() { return __locale; },
            configurable: true
        });
        Object.defineProperty(locObj, 'languages', {
            get: function() { return [__locale]; },
            configurable: true
        });
        Object.defineProperty(locObj, 'locales', {
            get: function() { return probeAvailableLocales(); },
            configurable: true
        });
        locObj._locale = __locale;
        locObj._data = __locData;
        locObj._isReady = true;
        locObj.getLanguageByLocale = function(loc) { return getLocaleDisplayName(loc); };
        locObj.getPrimaryLocale = function() {
            var params = loadDKToolsParams();
            if (params && params.Languages) {
                for (var i = 0; i < params.Languages.length; i++) {
                    var lang = params.Languages[i];
                    if (lang && lang.Primary === 'true') return lang.Locale || null;
                }
            }
            return null;
        };
        locObj.getPrimaryLanguage = function() {
            var params = loadDKToolsParams();
            if (params && params.Languages) {
                for (var i = 0; i < params.Languages.length; i++) {
                    var lang = params.Languages[i];
                    if (lang && lang.Primary === 'true') return lang.Language || null;
                }
            }
            return null;
        };
        locObj.getText = function(text) { return translateText(text); };
        locObj.selectLocale = function(loc) {
            L('selectLocale("' + loc + '") called, prev=__locale="' + __locale + '"');
            if (!loc) return Promise.resolve();
            var prev = __locale;
            __locale = loc;
            this._locale = loc;
            try {
                localStorage.setItem(LOCALE_KEY, loc);
                localStorage.setItem(LOCALE_KEY + '_userSelected', 'true');
            } catch(e) {}
            __availableLocales = null;
            probeAvailableLocales();
            __locData = loadLocaleData(loc);
            this._data = __locData;
            __locCache = {};
            L('selectLocale: __locData now has ' + Object.keys(__locData).length + ' keys');
            if (__localeListeners.length && prev !== loc) {
                for (var i = 0; i < __localeListeners.length; i++) {
                    try { __localeListeners[i](prev, loc); } catch(e) {}
                }
            }
            return Promise.resolve();
        };
        locObj.addChangeLocaleListener = function(fn) {
            if (typeof fn === 'function') __localeListeners.push(fn);
        };

        function ensureLocalization(val) {
            if (!val || val.Localization) return;
            val.Localization = locObj;
            if (!_installed) {
                L('DKTools.Localization stub installed (locale="' + __locale + '", locDataKeys=' + Object.keys(__locData || {}).length + ')');
                _installed = true;
            }
        }

        Object.defineProperty(window, 'DKTools', {
            get: function() { return _dktoolsVal; },
            set: function(val) {
                _dktoolsVal = val;
                ensureLocalization(val);
            },
            configurable: true,
            enumerable: true
        });

        // In case DKTools was already defined (shouldn't happen at atDocumentStart)
        if (window.DKTools && typeof window.DKTools === 'object') {
            _dktoolsVal = window.DKTools;
            ensureLocalization(window.DKTools);
        }
    })();

    // --- Text translation hooks ---

    function installHooks() {
        var _orig_bitmapDrawText = Bitmap.prototype.drawText;
        Bitmap.prototype.drawText = function(text, x, y, maxWidth, lineHeight, align) {
            _orig_bitmapDrawText.call(this, translateText(text), x, y, maxWidth, lineHeight, align);
        };

        installCommand101PreTranslationHook();
        installMessageStartPreTranslationHook();

        if (typeof TextManager !== 'undefined' && TextManager.basic) {
            var _orig_tm_basic = TextManager.basic;
            TextManager.basic = function(id) {
                return translateText(_orig_tm_basic.apply(this, arguments));
            };
        }

        if (typeof TextManager !== 'undefined' && TextManager.param) {
            var _orig_tm_param = TextManager.param;
            TextManager.param = function(id) {
                return translateText(_orig_tm_param.apply(this, arguments));
            };
        }

        if (typeof TextManager !== 'undefined' && TextManager.command) {
            var _orig_tm_command = TextManager.command;
            TextManager.command = function(id) {
                return translateText(_orig_tm_command.apply(this, arguments));
            };
        }

        if (typeof TextManager !== 'undefined' && TextManager.message) {
            var _orig_tm_message = TextManager.message;
            TextManager.message = function(id) {
                return translateText(_orig_tm_message.apply(this, arguments));
            };
        }

        var _inCompatEscapeHook = false;
        var _orig_convertEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
        Window_Base.prototype.convertEscapeCharacters = function(text) {
            if (_inCompatEscapeHook) {
                return _orig_convertEscapeCharacters.call(this, text);
            }
            _inCompatEscapeHook = true;
            try {
                var translated = consumePretranslatedMessageLine(text) ? text : translateText(text);
                return Window_Base.prototype.convertEscapeCharacters.call(this, translated);
            } finally {
                _inCompatEscapeHook = false;
            }
        };

        var _orig_drawTextEx = Window_Base.prototype.drawTextEx;
        Window_Base.prototype.drawTextEx = function(text, x, y) {
            return _orig_drawTextEx.call(this, translateText(text), x, y);
        };

        var _orig_textWidth = Window_Base.prototype.textWidth;
        Window_Base.prototype.textWidth = function(text) {
            return _orig_textWidth.call(this, translateText(text));
        };

        var _orig_actorName = Window_Base.prototype.actorName;
        Window_Base.prototype.actorName = function(n) {
            return translateText(_orig_actorName.call(this, n));
        };

        var _orig_partyMemberName = Window_Base.prototype.partyMemberName;
        Window_Base.prototype.partyMemberName = function(n) {
            return translateText(_orig_partyMemberName.call(this, n));
        };

        if (typeof Window_Command !== 'undefined') {
            var _orig_commandName = Window_Command.prototype.commandName;
            Window_Command.prototype.commandName = function(index) {
                return translateText(_orig_commandName.call(this, index));
            };
        }

        // Window_Base.prototype.wrapText polyfill
        // 原版由 DKTools_Localization.js 提供，被 Lunatlazur_BackLog / ChimakiMsgSkin_MV 等插件调用。
        if (typeof Window_Base !== 'undefined' && typeof Window_Base.prototype.wrapText !== 'function') {
            Window_Base.prototype.wrapText = function(text, maxWidth) {
                if (!text) return "";
                var locale = (typeof DKTools !== 'undefined' && DKTools.Localization && DKTools.Localization.locale) || 'en';
                var isCJK = /^(tw|cn|jp|zh|ja)/i.test(locale);

                var result = "";
                var currentLine = "";
                var currentWidth = 0;
                var lineHasVisibleContent = false;

                var regex = /(\x1b[a-zA-Z]+\[[^\]]*\]|\\+(?:[a-zA-Z]+\[[^\]]*\]|[!.\^]|[{}]))|(\n)|([^\s\\-]+)|(-)|([\s\S])/gi;
                var match;
                while ((match = regex.exec(text)) !== null) {
                    var token = match[0];
                    var isControlCode = !!match[1];
                    var isNewLine = !!match[2];
                    var isWord = !!match[3];

                    if (isNewLine) {
                        result += currentLine + "\n";
                        currentLine = "";
                        currentWidth = 0;
                        lineHasVisibleContent = false;
                        continue;
                    }

                    var tokenWidth = 0;
                    var isVisible = true;
                    if (isControlCode) {
                        if (/^\\I\[/i.test(token)) {
                            tokenWidth = Window_Base._iconWidth || 32;
                        } else {
                            tokenWidth = 0;
                            isVisible = false;
                        }
                    } else {
                        tokenWidth = this.textWidth(token);
                        if (token === " ") isVisible = false;
                    }

                    var spaceWidth = 0;
                    var needsSpace = false;
                    if (!isCJK && isWord && lineHasVisibleContent) {
                        var cleanLine = currentLine.replace(/(?:\x1b[a-zA-Z]+\[[^\]]*\]|\\+(?:[a-zA-Z]+\[[^\]]*\]|[!.\^]|[{}]))+$/gi, "");
                        if (cleanLine.length > 0) {
                            var lastChar = cleanLine.slice(-1);
                            if (lastChar !== " " && lastChar !== "-") {
                                needsSpace = true;
                                spaceWidth = this.textWidth(" ");
                            }
                        }
                    }

                    if (currentWidth + spaceWidth + tokenWidth > maxWidth) {
                        if (currentLine.length > 0) {
                            result += currentLine.replace(/\s+$/, "") + "\n";
                            if (token === " ") {
                                currentLine = "";
                                currentWidth = 0;
                                lineHasVisibleContent = false;
                            } else {
                                currentLine = token;
                                currentWidth = tokenWidth;
                                lineHasVisibleContent = isVisible;
                            }
                        } else {
                            result += token + "\n";
                            currentLine = "";
                            currentWidth = 0;
                            lineHasVisibleContent = false;
                        }
                    } else {
                        if (needsSpace) {
                            currentLine += " ";
                            currentWidth += spaceWidth;
                        }
                        currentLine += token;
                        currentWidth += tokenWidth;
                        if (isVisible) lineHasVisibleContent = true;
                    }
                }
                result += currentLine;
                return result;
            };
            L('Window_Base.prototype.wrapText polyfill installed');
        }

        L('Hooks installed');
    }

    L('BOOT SUMMARY: __locale="' + __locale + '", __locData keys=' + Object.keys(__locData || {}).length);
    try {
        var _bootSaved = localStorage.getItem(LOCALE_KEY);
        var _bootParams = loadDKToolsParams();
        var _bootAvail = probeAvailableLocales();
        L('BOOT SUMMARY: savedLocale=' + JSON.stringify(_bootSaved) +
          ', plugins.FirstLaunch=' + _bootParams['First Launch'] +
          ', plugins.LanguagesCount=' + (_bootParams['Languages'] || []).length +
          ', probedLocales=[' + _bootAvail.join(',') + ']');
    } catch(e) { L('BOOT SUMMARY: error ' + (e && e.message)); }

    if (__locData && Object.keys(__locData).length > 0) {
        if (typeof Window_Base !== 'undefined') {
            installHooks();
        } else {
            var _hookInterval = setInterval(function() {
                if (typeof Window_Base !== 'undefined' && typeof Window_Command !== 'undefined') {
                    clearInterval(_hookInterval);
                    installHooks();
                }
            }, 50);
        }
        var _command101HookAttempts = 0;
        var _command101HookInterval = setInterval(function() {
            _command101HookAttempts++;
            installCommand101PreTranslationHook();
            installMessageStartPreTranslationHook();
            if (_command101HookAttempts > 80) {
                clearInterval(_command101HookInterval);
            }
        }, 250);
    } else {
        L('WARNING: no locale data loaded for "' + __locale + '" — text translation will be a no-op');
    }

    // --- Scene_SelectLanguage ---
    // 在原生 DKTools_Localization 被禁用的情况下，自行实现一个轻量级语言选择场景。
    // 触发条件：localStorage 中无 'RPG Locale' 且可用语言数 > 1（Scene_Title.create 时检查）。
    // 选择完毕后：写入 localStorage、调用 selectLocale 重新加载 locale JSON、清空翻译缓存、pop 回标题。
    function installLanguageScene() {
        if (typeof Scene_Base === 'undefined' || typeof Scene_Title === 'undefined' ||
            typeof Window_Command === 'undefined' || typeof SceneManager === 'undefined' ||
            typeof Window_Help === 'undefined') {
            L('installLanguageScene: waiting for MV classes (Scene_Base=' + (typeof Scene_Base) + ', Scene_Title=' + (typeof Scene_Title) + ', Window_Command=' + (typeof Window_Command) + ', SceneManager=' + (typeof SceneManager) + ', Window_Help=' + (typeof Window_Help) + ')');
            return false;
        }
        if (window.__dkLocLangSceneInstalled) return true;
        window.__dkLocLangSceneInstalled = true;

        function Scene_SelectLanguage() {
            this.initialize.apply(this, arguments);
        }
        Scene_SelectLanguage.prototype = Object.create(Scene_Base.prototype);
        Scene_SelectLanguage.prototype.constructor = Scene_SelectLanguage;

        Scene_SelectLanguage.prototype.initialize = function() {
            Scene_Base.prototype.initialize.call(this);
        };

        Scene_SelectLanguage.prototype.create = function() {
            Scene_Base.prototype.create.call(this);
            this.createWindowLayer();
            this.createHelpWindow();
            this.createLanguageWindow();
        };

        Scene_SelectLanguage.prototype.createHelpWindow = function() {
            this._helpWindow = new Window_Help(2);
            this._helpWindow.setText('Please select a language\n请选择语言 / 言語を選択');
            this.addWindow(this._helpWindow);
        };

        Scene_SelectLanguage.prototype.createLanguageWindow = function() {
            this._languageWindow = new Window_LanguageList(this._helpWindow);
            this._languageWindow.setHandler('ok', this.onLanguageOk.bind(this));
            this._languageWindow.setHandler('cancel', this.onLanguageCancel.bind(this));
            this.addWindow(this._languageWindow);
        };

        Scene_SelectLanguage.prototype.start = function() {
            Scene_Base.prototype.start.call(this);
            var idx = this._languageWindow.findExt(__locale);
            if (idx >= 0) this._languageWindow.select(idx);
        };

        Scene_SelectLanguage.prototype.onLanguageOk = function() {
            var locale = this._languageWindow.currentExt();
            this._languageWindow.close();
            this.fadeOutAll();
            var self = this;
            setTimeout(function() {
                if (locale && window.DKTools && window.DKTools.Localization) {
                    window.DKTools.Localization.selectLocale(locale);
                }
                SceneManager.pop();
            }, self.fadeSpeed() * 4);
        };

        Scene_SelectLanguage.prototype.onLanguageCancel = function() {
            this._languageWindow.close();
            this.fadeOutAll();
            setTimeout(function() { SceneManager.pop(); }, this.fadeSpeed() * 4);
        };

        function Window_LanguageList() {
            this.initialize.apply(this, arguments);
        }
        Window_LanguageList.prototype = Object.create(Window_Command.prototype);
        Window_LanguageList.prototype.constructor = Window_LanguageList;

        Window_LanguageList.prototype.initialize = function(helpWindow) {
            this._helpWindow = helpWindow || null;
            Window_Command.prototype.initialize.call(this, 0, 0);
            this.updatePlacement();
        };

        Window_LanguageList.prototype.updatePlacement = function() {
            this.x = Math.floor((Graphics.boxWidth - this.width) / 2);
            this.y = Math.floor((Graphics.boxHeight - this.height) / 2);
        };

        Window_LanguageList.prototype.windowWidth = function() {
            return 360;
        };

        Window_LanguageList.prototype.windowHeight = function() {
            var rows = Math.min(this.maxItems(), 8);
            return rows * this.lineHeight() + this.standardPadding() * 2;
        };

        Window_LanguageList.prototype.makeCommandList = function() {
            var locales = probeAvailableLocales();
            for (var i = 0; i < locales.length; i++) {
                this.addCommand(getLocaleDisplayName(locales[i]), 'ok', true, locales[i]);
            }
        };

        Window_LanguageList.prototype.itemTextAlign = function() {
            return 'center';
        };

        Window_LanguageList.prototype.updateHelp = function() {
            if (this._helpWindow) {
                var locale = this.currentExt();
                this._helpWindow.setText(getLocaleDisplayName(locale) + '  [' + (locale || '') + ']');
            }
        };

        window.Scene_SelectLanguage = Scene_SelectLanguage;
        window.Window_LanguageList = Window_LanguageList;

        function shouldShowLanguageScene() {
            var saved;
            try { saved = localStorage.getItem(LOCALE_KEY); } catch(e) {}
            if (saved) { L('shouldShowLanguageScene → FALSE (saved locale exists: "' + saved + '")'); return false; }
            var availCount = probeAvailableLocales().length;
            if (availCount <= 1) { L('shouldShowLanguageScene → FALSE (only ' + availCount + ' available locale)'); return false; }
            var params = loadDKToolsParams();
            var fl = !!params['First Launch'];
            L('shouldShowLanguageScene → ' + fl.toString().toUpperCase() + ' (First Launch=' + params['First Launch'] + ', available=' + availCount + ')');
            return fl;
        }

        var _orig_Scene_Title_create = Scene_Title.prototype.create;
        Scene_Title.prototype.create = function() {
            _orig_Scene_Title_create.apply(this, arguments);
            var shown = !!window.__dkLocLangShown;
            var should = shouldShowLanguageScene();
            L('Scene_Title.create hook fired: shouldShow=' + should + ' alreadyShown=' + shown);
            if (should && !shown) {
                window.__dkLocLangShown = true;
                L('Scene_Title.create hook → SceneManager.push(Scene_SelectLanguage)');
                SceneManager.push(Scene_SelectLanguage);
            }
        };

        L('Scene_SelectLanguage installed');
        return true;
    }

    var _langSceneInterval = setInterval(function() {
        if (installLanguageScene()) {
            clearInterval(_langSceneInterval);
        }
    }, 50);

    // Safety: stop trying after 30s
    setTimeout(function() {
        if (_langSceneInterval) clearInterval(_langSceneInterval);
    }, 30000);
})();
