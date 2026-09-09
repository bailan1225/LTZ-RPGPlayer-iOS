/*:
 * @target MZ
 * @plugindesc [v1.0.0] Load JSON dictionary and translate message text for MV/MZ.
 * @author ArkRPG
 *
 * @param Enabled
 * @text Enabled
 * @type boolean
 * @default true
 *
 * @param DictionaryPath
 * @text Dictionary Path
 * @type string
 * @default ./translations/translation.json
 *
 * @param NormalizeNewline
 * @text Normalize Newline
 * @type boolean
 * @default true
 *
 * @param Debug
 * @text Debug Log
 * @type boolean
 * @default false
 *
 * @param TranslateDatabaseNames
 * @text Translate Database Names
 * @desc Translate name fields in database (items, skills, etc). Disable if names are used as resource file identifiers.
 * @type boolean
 * @default true
 *
 * @param TranslateSystemTerms
 * @text Translate System Terms
 * @desc Translate $dataSystem.terms.commands/elements/etc. Disable if plugins (e.g. MOG_BattleCommands) use term names as image file identifiers.
 * @type boolean
 * @default false
 *
 * @help
 * JSON format:
 * {
 *   "原文": "译文"
 * }
 *
 * Notes:
 * - This plugin avoids asynchronous translation in Window_Message flow.
 * - It waits dictionary loading during boot, then translates synchronously.
 */

(function() {
    'use strict';

    // --- 追踪名字框最终显示内容 ---
    function patchNameBoxLog() {
        if (typeof Window_NameBox !== 'undefined' && Window_NameBox.prototype && !Window_NameBox.prototype._rpgTextTranslationPatched) {
            var _Window_NameBox_refresh = Window_NameBox.prototype.refresh;
            Window_NameBox.prototype.refresh = function() {
                var before = this._name;
                if (!isAlreadyTranslated(before) && typeof translateText === 'function') {
                    this._name = translateText(before);
                }
                if (config && config.debug && typeof log === 'function') {
                    log('[NameBox.refresh] name:', JSON.stringify(before), '=>', JSON.stringify(this._name));
                }
                _Window_NameBox_refresh.call(this);
            };
            Window_NameBox.prototype._rpgTextTranslationPatched = true;
        }
    }

    var pluginName = 'RPGTextTranslation';
    var parameters = (typeof PluginManager !== 'undefined' && PluginManager.parameters)
        ? PluginManager.parameters(pluginName)
        : {};

    function readBool(value, defaultValue) {
        if (value === undefined || value === null || value === '') return defaultValue;
        return String(value).toLowerCase() === 'true';
    }

    var config = {
        enabled: readBool(parameters.Enabled, true),
        dictionaryPath: String(parameters.DictionaryPath || './translations/translation.json'),
        normalizeNewline: readBool(parameters.NormalizeNewline, true),
        debug: readBool(parameters.Debug, false),
        translateDatabaseNames: readBool(parameters.TranslateDatabaseNames, true),
        translateSystemTerms: readBool(parameters.TranslateSystemTerms, false)
    };

    var state = {
        loaded: false,
        failed: false,
        dict: Object.create(null),
        sourceIndex: null,
        translatedValues: Object.create(null),
        translatedCjkGlyphs: Object.create(null),
        hitCount: 0,
        missCount: 0
    };

    function log() {
        if (!config.debug) return;
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[RPGTextTranslation]');
        console.log.apply(console, args);
        // 同时打印到 native 日志，方便在 Xcode 控制台查看
        window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.logging &&
            window.webkit.messageHandlers.logging.postMessage({
            level: 'debug',
            message: args.join(' ')
        });
    }

    function normalizeText(text) {
        if (!config.normalizeNewline) return text;
        return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }

    function hasOwn(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    }

    function isKnownTranslation(text) {
        if (!text || typeof text !== 'string') return false;
        if (hasOwn(state.translatedValues, text)) return true;
        if (config.normalizeNewline) {
            var normalized = normalizeText(text);
            return normalized !== text && hasOwn(state.translatedValues, normalized);
        }
        return false;
    }

    // 查字典：先精确匹配，再尝试 normalizeNewline，未命中返回 null
    function lookupDict(key) {
        if (hasOwn(state.dict, key)) {
            state.hitCount += 1;
            return state.dict[key];
        }
        if (config.normalizeNewline) {
            var norm = normalizeText(key);
            if (norm !== key && hasOwn(state.dict, norm)) {
                state.hitCount += 1;
                return state.dict[norm];
            }
        }
        return null;
    }

    // 外部消息插件常把正文包在括号或引号中，而翻译字典只保存内部正文。
    // 精确匹配失败后先尝试剥离成对的最外层符号，命中时再原样补回。
    // 该检查必须早于按标点拆分，否则含句中逗号的完整字典键会被拆散。
    var OUTER_SYMBOL_PAIRS = {
        '(': ')', '（': '）',
        '[': ']', '［': '］',
        '{': '}', '｛': '｝',
        '「': '」', '『': '』',
        '【': '】', '《': '》', '〈': '〉',
        '“': '”', '‘': '’',
        '"': '"', "'": "'"
    };

    function lookupDictPreservingOuterSymbols(key) {
        var direct = lookupDict(key);
        if (direct !== null || !key || key.length < 2) return direct;

        var prefix = '';
        var suffix = '';
        var inner = key;
        while (inner.length >= 2) {
            var opening = inner.charAt(0);
            var closing = OUTER_SYMBOL_PAIRS[opening];
            if (!closing || inner.charAt(inner.length - 1) !== closing) break;
            prefix += opening;
            suffix = closing + suffix;
            inner = inner.slice(1, -1);

            var translated = lookupDict(inner);
            if (translated !== null) {
                return prefix + translated + suffix;
            }
        }
        return null;
    }

    // 精确匹配失败时，用字典索引从左到右做最长键匹配。字典键内部的
    // 标点和全角空格属于正文，不能预先拆开；未命中的标点/空白则原样保留。
    // 只有整段未命中内容全是分隔符时才接受结果，避免出现半句中文半句日文。
    // 控制符由 translateText 的 specialPattern 先行拆出，不会进入这里。
    var TRANSPARENT_SEPARATOR_PATTERN = /^[ \t\r\n\u3000!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~、。，．！？：；…‥—―〜～・（）［］【】「」『』〈〉《》〔〕〖〗〘〙〚〛〝〞〟〰]$/;

    function addSourceIndexKey(index, key) {
        if (!key) return;
        var buckets = key.length === 1 ? index.single : index.prefix;
        var prefix = key.length === 1 ? key : key.slice(0, 2);
        if (!hasOwn(buckets, prefix)) {
            buckets[prefix] = [];
        }
        buckets[prefix].push(key);
    }

    function buildSourceIndex(dict) {
        // 大型 MTool 字典可能接近十万项。逐字符 JS Trie 会产生数百万个
        // 对象，因此这里只保存原 key 引用，并按前两个 UTF-16 单元分桶。
        var index = {
            single: Object.create(null),
            prefix: Object.create(null),
            aliases: Object.create(null)
        };
        var keys = Object.keys(dict);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (!key) continue;

            var hasSemanticText = false;
            for (var semanticIndex = 0;
                 semanticIndex < key.length;
                 semanticIndex++) {
                if (!TRANSPARENT_SEPARATOR_PATTERN.test(
                    key.charAt(semanticIndex)
                )) {
                    hasSemanticText = true;
                    break;
                }
            }
            // 纯标点键不能抢占正文前后的装饰符。
            if (!hasSemanticText) continue;

            addSourceIndexKey(index, key);
        }

        // MTool 从 plugins.js 的嵌套 JSON 提取文本时，控制符前的片段常带有
        // 多层转义产生的尾反斜杠；插件运行时这些反斜杠属于后续控制符。
        // 仅当源文和译文都以反斜杠结尾时建立无反斜杠别名，原键仍优先。
        for (var aliasIndex = 0;
             aliasIndex < keys.length;
             aliasIndex++) {
            var aliasKey = keys[aliasIndex];
            var aliasValue = dict[aliasKey];
            if (!/\\+$/.test(aliasKey) ||
                typeof aliasValue !== 'string' ||
                !/\\+$/.test(aliasValue)) {
                continue;
            }
            var strippedKey = aliasKey.replace(/\\+$/, '');
            if (!strippedKey ||
                hasOwn(dict, strippedKey) ||
                hasOwn(index.aliases, strippedKey)) {
                continue;
            }
            index.aliases[strippedKey] =
                aliasValue.replace(/\\+$/, '');
            addSourceIndexKey(index, strippedKey);
        }
        return index;
    }

    function dictionaryMatchesAt(text, start) {
        var matches = [];
        if (!state.sourceIndex) return matches;

        function appendMatches(keys) {
            if (!keys) return;
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (text.substr(start, key.length) !== key) continue;
                matches.push({
                    end: start + key.length,
                    value: hasOwn(state.dict, key)
                        ? state.dict[key]
                        : state.sourceIndex.aliases[key]
                });
            }
        }

        var first = text.charAt(start);
        appendMatches(state.sourceIndex.single[first]);
        if (start + 1 < text.length) {
            appendMatches(
                state.sourceIndex.prefix[text.slice(start, start + 2)]
            );
        }
        return matches;
    }

    function betterSegmentPlan(current, candidate) {
        if (!candidate) return current;
        if (!current ||
            candidate.covered > current.covered ||
            (candidate.covered === current.covered &&
             candidate.hits < current.hits)) {
            return candidate;
        }
        return current;
    }

    function repeatedKanaPrefixEnd(text, index) {
        var rest = text.slice(index);
        var match = rest.match(/^([ぁ-んァ-ン])(?:[.．…‥]{2,})/);
        if (!match) return -1;

        var end = index + match[0].length;
        return text.charAt(end) === match[1] ? end : -1;
    }

    function displayAsciiTagEnd(text, index) {
        // 自定义菜单常把分类标签直接拼在正文前，例如
        // “[DLC]ばけーしょん！から”。翻译字典通常只收录后面的正文。
        // 这里只接受短小、成对方括号包裹的 ASCII 标识；普通英文仍然必须
        // 命中字典，避免放宽成任意中英混排。
        var rest = text.slice(index);
        var match = rest.match(
            /^(?:\[[A-Za-z0-9][A-Za-z0-9 _+.\-]{0,30}\]|［[A-Za-z0-9][A-Za-z0-9 _+.\-]{0,30}］)/
        );
        return match ? index + match[0].length : -1;
    }

    function lookupBySymbolSegments(text) {
        if (!text || !state.sourceIndex) return null;

        // 从后向前求解，确保不是简单贪心：若较短键能与后续键共同覆盖
        // 完整文本，它会优于一个导致后续正文未命中的较长键。
        var plans = new Array(text.length + 1);
        plans[text.length] = {
            result: '',
            covered: 0,
            hits: 0
        };

        for (var index = text.length - 1; index >= 0; index--) {
            var best = null;
            var character = text.charAt(index);
            if (TRANSPARENT_SEPARATOR_PATTERN.test(character) &&
                plans[index + 1]) {
                best = {
                    result: character + plans[index + 1].result,
                    covered: plans[index + 1].covered,
                    hits: plans[index + 1].hits
                };
            }

            // 保留插件界面附加的短 ASCII 标签，但只有标签后的正文已经能被
            // 原有规则完整覆盖时才建立计划。精确字典键仍在 translateText
            // 更早的位置优先命中。
            var displayTagEnd = displayAsciiTagEnd(text, index);
            if (displayTagEnd >= 0 && plans[displayTagEnd]) {
                best = betterSegmentPlan(best, {
                    result: text.slice(index, displayTagEnd) +
                        plans[displayTagEnd].result,
                    covered: plans[displayTagEnd].covered,
                    hits: plans[displayTagEnd].hits
                });
            }

            var matches = dictionaryMatchesAt(text, index);
            for (var matchIndex = 0;
                 matchIndex < matches.length;
                 matchIndex++) {
                var matched = matches[matchIndex];
                var tail = plans[matched.end];
                if (!tail) continue;
                best = betterSegmentPlan(best, {
                    result: matched.value + tail.result,
                    covered: matched.end - index + tail.covered,
                    hits: tail.hits + 1
                });
            }

            // 口吃/迟疑常写成 “え...えぇ”“あ……あなた”，而 MTool
            // 只为后半完整句生成字典键。仅在省略号后重复同一假名且后半能
            // 完整覆盖时丢弃前缀；这是精确及普通索引匹配失败后的兜底。
            var repeatedKanaEnd = repeatedKanaPrefixEnd(text, index);
            if (repeatedKanaEnd >= 0 && plans[repeatedKanaEnd]) {
                best = betterSegmentPlan(best, {
                    result: plans[repeatedKanaEnd].result,
                    covered: plans[repeatedKanaEnd].covered,
                    hits: plans[repeatedKanaEnd].hits
                });
            }
            plans[index] = best;
        }

        var plan = plans[0];
        if (!plan || plan.hits === 0) return null;
        state.hitCount += plan.hits;
        return plan.result;
    }

    // 多行整段未命中时逐行独立翻译，并原样保留换行。
    //
    // 不能要求所有行都命中：人物事典、任务说明等插件文本通常同时包含
    // 可翻译正文、空行、变量标签和字典中不存在的动态标题。任何一行未命中
    // 都不应导致其他已命中的行回退为原文。
    //
    // 符号拆分必须放在单行内部进行，避免把 "。\n\n" 合并为一个符号块，
    // 从而漏掉字典中以句号结尾的完整键。
    function lookupByLineSegments(text) {
        if (!text || !/[\r\n]/.test(text)) return null;

        var parts = text.split(/(\r\n|\r|\n)/);
        var result = '';
        var translatedAny = false;

        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];

            if (part === '\r\n' || part === '\r' || part === '\n') {
                result += part;
                continue;
            }

            if (!part || isKnownTranslation(part)) {
                result += part;
                continue;
            }

            var translated = lookupDictPreservingOuterSymbols(part);
            if (translated === null) {
                translated = lookupBySymbolSegments(part);
            }

            if (translated !== null) {
                result += translated;
                translatedAny = true;
            } else {
                result += part;
            }
        }

        return translatedAny ? result : null;
    }

    // 检测是否为资源路径或文件名（不应翻译）
    function isResourcePath(text) {
        if (!text || typeof text !== 'string') return false;
        
        // 检测文件扩展名
        var resourceExtensions = [
            '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp',  // 图片
            '.rpgmvp', '.rpgmvo', '.rpgmvm', '.rpgmvw',        // RPG Maker MV 加密资源
            '.ogg', '.m4a', '.mp3', '.wav',                    // 音频
            '.mp4', '.webm',                                    // 视频
            '.json', '.txt'                                     // 数据文件
        ];
        
        var lowerText = text.toLowerCase();
        for (var i = 0; i < resourceExtensions.length; i++) {
            if (lowerText.indexOf(resourceExtensions[i]) !== -1) {
                return true;
            }
        }
        
        // 检测路径特征（包含斜杠或反斜杠）
        if (text.indexOf('/') !== -1 || text.indexOf('\\') !== -1) {
            return true;
        }
        
        // 检测常见资源路径前缀
        var pathPrefixes = ['img/', 'audio/', 'movies/', 'data/', 'fonts/', 'icon/'];
        for (var j = 0; j < pathPrefixes.length; j++) {
            if (lowerText.indexOf(pathPrefixes[j]) !== -1) {
                return true;
            }
        }
        
        return false;
    }

    function translateText(text) {
        if (!config.enabled) return text;
        if (!state.loaded || !text || typeof text !== 'string') return text;
        if (isKnownTranslation(text)) return text;

        // 匹配所有特殊符号（如 \SE[5]、\C[2]、\n[1]、\{、\} 等）、%1/%2 占位符，以及 <WordWrap>/<br> 等 HTML-like 标签
        var specialPattern = /\\+(?:[A-Za-z]+(?:\[[^\]]*\])?|[^A-Za-z\s])|%\d+|<[^>]*>/g;
        var segments = [];
        var lastIndex = 0;
        var match;
        while ((match = specialPattern.exec(text)) !== null) {
            if (match.index > lastIndex) {
                segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
            }
            segments.push({ type: 'special', value: match[0] });
            lastIndex = match.index + match[0].length;
        }
        if (lastIndex < text.length) {
            segments.push({ type: 'text', value: text.slice(lastIndex) });
        }

        // 针对每个纯文本段做翻译，特殊符号原样保留
        var result = '';
        for (var i = 0; i < segments.length; i++) {
            var seg = segments[i];
            if (seg.type === 'special') {
                result += seg.value;
            } else if (seg.type === 'text' && seg.value) {
                var mainText = seg.value;
                // 跳过资源路径和文件名
                if (isResourcePath(mainText)) {
                    result += mainText;
                    continue;
                }
                // 剥离前后空格，匹配后补回
                var leadingSpaces = mainText.match(/^\s*/)[0];
                var trailingSpaces = mainText.match(/\s*$/)[0];
                var trimmedText = mainText.slice(leadingSpaces.length, mainText.length - trailingSpaces.length);

                if (isKnownTranslation(trimmedText)) {
                    result += mainText;
                    continue;
                }

                var translated = lookupDictPreservingOuterSymbols(trimmedText);
                if (config.debug && translated !== null) {
                    log('[translateText] HIT:', trimmedText.slice(0, 80), '=>', JSON.stringify(translated));
                }
                // 整段未命中且含换行：逐行独立翻译，未命中的行原样保留。
                // 每行内部再按符号回退，避免句号和换行被合并后破坏字典键。
                if (translated === null && /[\r\n]/.test(trimmedText)) {
                    translated = lookupByLineSegments(trimmedText);
                    if (translated !== null && config.debug) {
                        log('[translateText] HIT (split-by-line):', trimmedText.slice(0, 80), '=>', JSON.stringify(translated));
                    }
                }
                // 整段和完整多行均未命中时，按普通符号拆分文字部分查找。
                // 所有符号均原样保留，只有实际命中的文字片段会被替换。
                if (translated === null) {
                    translated = lookupBySymbolSegments(trimmedText);
                    if (translated !== null && config.debug) {
                        log('[translateText] HIT (split-by-symbol):', trimmedText.slice(0, 80), '=>', JSON.stringify(translated));
                    }
                }
                if (translated !== null) {
                    result += leadingSpaces + translated + trailingSpaces;
                } else {
                    state.missCount += 1;
                    if (config.debug) {
                        log('Miss #' + state.missCount + ':', mainText);
                    }
                    result += mainText;
                }
            }
        }
        return result;
    }

    function translateArray(arr) {
        if (!Array.isArray(arr)) return arr;
        for (var i = 0; i < arr.length; i++) {
            if (typeof arr[i] === 'string') {
                arr[i] = translateText(arr[i]);
            }
        }
        return arr;
    }

    function parseDictionaryObject(raw) {
        if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
            return Object.create(null);
        }

        var result = Object.create(null);
        var keys = Object.keys(raw);
        for (var i = 0; i < keys.length; i++) {
            var key = String(keys[i]);
            var value = raw[keys[i]];
            if (typeof value !== 'string') continue;

            var source = normalizeText(key);
            result[source] = value;
        }
        return result;
    }

    function collectTranslatedValues(dict) {
        var values = Object.create(null);
        var keys = Object.keys(dict);
        for (var i = 0; i < keys.length; i++) {
            var value = dict[keys[i]];
            if (typeof value !== 'string' || value === '') continue;
            // 只有译文本身也是另一个原文键时才可能发生 A -> B -> C。
            // 仅记录这些冲突值，避免为大型 MTool 字典再复制一整份值索引。
            if (hasOwn(dict, value)) values[value] = true;
            if (!config.normalizeNewline) continue;
            var normalized = normalizeText(value);
            if (hasOwn(dict, normalized)) values[normalized] = true;
        }
        return values;
    }

    // 自定义消息插件可能绕过 Window_Message，并把译文逐字交给 Canvas。
    // 记录字典译文中实际出现的 CJK 字符，使逐字绘制也能识别为译文。
    // 字符集合的规模远小于复制整份大型翻译字典。
    function collectTranslatedCjkGlyphs(dict) {
        var glyphs = Object.create(null);
        var keys = Object.keys(dict);
        for (var i = 0; i < keys.length; i++) {
            var value = dict[keys[i]];
            if (typeof value !== 'string') continue;
            for (var j = 0; j < value.length; j++) {
                var glyph = value.charAt(j);
                var code = value.charCodeAt(j);
                if (code >= 0xD800 && code <= 0xDBFF && j + 1 < value.length) {
                    var low = value.charCodeAt(j + 1);
                    if (low >= 0xDC00 && low <= 0xDFFF) {
                        glyph += value.charAt(++j);
                    }
                }
                if (hasCJK(glyph)) glyphs[glyph] = true;
            }
        }
        return glyphs;
    }

    function textUsesTranslatedCjkGlyph(text) {
        if (!state.loaded || !text || typeof text !== 'string') return false;
        for (var i = 0; i < text.length; i++) {
            var glyph = text.charAt(i);
            var code = text.charCodeAt(i);
            if (code >= 0xD800 && code <= 0xDBFF && i + 1 < text.length) {
                var low = text.charCodeAt(i + 1);
                if (low >= 0xDC00 && low <= 0xDFFF) {
                    glyph += text.charAt(++i);
                }
            }
            if (hasOwn(state.translatedCjkGlyphs, glyph)) return true;
        }
        return false;
    }

    function loadDictionary() {
        if (!config.enabled) {
            state.loaded = true;
            log('Dictionary load skipped because plugin is disabled');
            return;
        }

        log('Loading dictionary from path:', config.dictionaryPath);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', config.dictionaryPath);
        xhr.overrideMimeType('application/json');
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 400) {
                try {
                    var json = JSON.parse(xhr.responseText || '{}');
                    state.dict = parseDictionaryObject(json);
                    state.sourceIndex = buildSourceIndex(state.dict);
                    state.translatedValues = collectTranslatedValues(state.dict);
                    state.translatedCjkGlyphs =
                        collectTranslatedCjkGlyphs(state.dict);
                    state.loaded = true;
                    log('Dictionary loaded:', config.dictionaryPath, 'entries=', Object.keys(state.dict).length, 'responseBytes=', (xhr.responseText || '').length);
                } catch (e) {
                    state.failed = true;
                    state.loaded = true;
                    console.error('[RPGTextTranslation] Failed to parse dictionary:', e);
                }
            } else {
                state.failed = true;
                state.loaded = true;
                console.error('[RPGTextTranslation] Failed to load dictionary:', config.dictionaryPath, 'status=', xhr.status);
            }
        };
        xhr.onerror = function() {
            state.failed = true;
            state.loaded = true;
            console.error('[RPGTextTranslation] Network error while loading dictionary:', config.dictionaryPath);
        };
        xhr.send();
    }

    function patchBootReady() {
        if (typeof Scene_Boot === 'undefined') return;

        var _Scene_Boot_isReady = Scene_Boot.prototype.isReady;
        Scene_Boot.prototype.isReady = function() {
            if (!_Scene_Boot_isReady.call(this)) return false;
            return state.loaded;
        };
    }

    // 为 iOS WKWebView 注入可靠的译文字体。
    // 所有被识别为字典译文的 CJK 绘制统一使用系统字体，不再逐字探测游戏字体。
    var IOS_CJK_FONTS = 'PingFang SC, Hiragino Sans GB, STHeiti';

    // CJK Unicode ranges (CJK Unified, Extension A/B, Compatibility, Radicals, etc.)
    var CJK_REGEX = /[\u2E80-\u2FFF\u3000-\u303F\u3040-\u31FF\u3200-\u9FFF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF]/;

    function hasCJK(text) {
        return typeof text === 'string' && CJK_REGEX.test(text);
    }

    // 提取 CSS font 字符串中 size 之前的部分（含 weight/style），例如 "bold 28px/32px ..." => "bold 28px"
    function extractFontPrefix(fontStr) {
        var m = fontStr && fontStr.match(/^(.*?\b)(\d+(?:\.\d+)?(?:px|pt|em|rem)(?:\/\S+)?)/);
        return m ? m[1] + m[2] : '28px';
    }

    function systemFontFor(fontStr) {
        return extractFontPrefix(fontStr) + ' ' + IOS_CJK_FONTS;
    }

    function patchCanvasCJK() {
        var _fillText = CanvasRenderingContext2D.prototype.fillText;
        var _strokeText = CanvasRenderingContext2D.prototype.strokeText;
        var _measureText = CanvasRenderingContext2D.prototype.measureText;

        CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxWidth) {
            if (textUsesTranslatedCjkGlyph(String(text))) {
                var originalFont = this.font;
                this.font = systemFontFor(originalFont);
                try {
                    return maxWidth !== undefined
                        ? _fillText.call(this, text, x, y, maxWidth)
                        : _fillText.call(this, text, x, y);
                } finally {
                    this.font = originalFont;
                }
            }
            return maxWidth !== undefined
                ? _fillText.call(this, text, x, y, maxWidth)
                : _fillText.call(this, text, x, y);
        };

        CanvasRenderingContext2D.prototype.strokeText = function(text, x, y, maxWidth) {
            if (textUsesTranslatedCjkGlyph(String(text))) {
                var originalFont = this.font;
                this.font = systemFontFor(originalFont);
                try {
                    return maxWidth !== undefined
                        ? _strokeText.call(this, text, x, y, maxWidth)
                        : _strokeText.call(this, text, x, y);
                } finally {
                    this.font = originalFont;
                }
            }
            return maxWidth !== undefined
                ? _strokeText.call(this, text, x, y, maxWidth)
                : _strokeText.call(this, text, x, y);
        };

        CanvasRenderingContext2D.prototype.measureText = function(text) {
            if (textUsesTranslatedCjkGlyph(String(text))) {
                var originalFont = this.font;
                this.font = systemFontFor(originalFont);
                try {
                    return _measureText.call(this, text);
                } finally {
                    this.font = originalFont;
                }
            }
            return _measureText.call(this, text);
        };

        log('[patchCanvasCJK] Canvas translated CJK font policy installed');
    }

    // 已被 command101 多行翻译写回的文本，用 Set 标记，避免 Game_Message.add 再次翻译
    var _translatedTexts = typeof Set !== 'undefined' ? new Set() : null;
    var SKIP_TRANSLATED_MESSAGE_LINE = '\u001dRPGTEXTTRANSLATION_SKIP_LINE\u001d';

    function markTranslated(text) {
        if (_translatedTexts) _translatedTexts.add(text);
    }

    function isAlreadyTranslated(text) {
        return _translatedTexts ? _translatedTexts.has(text) : false;
    }

    function unmarkTranslated(text) {
        if (_translatedTexts) _translatedTexts.delete(text);
    }

    function translatedSlot(prefix, translatedLines, index, suffix) {
        if (index < translatedLines.length) {
            return prefix + translatedLines[index] + suffix;
        }
        // 字典译文比原始事件行少时，这些是原文排版产生的占位行，不应显示为空行。
        return prefix || suffix
            ? prefix + suffix
            : SKIP_TRANSLATED_MESSAGE_LINE;
    }

    // 拦截 command101（显示文本），预读所有连续 401 行，尝试多行合并匹配
    function patchInterpreterCommand101() {
        if (typeof Game_Interpreter === 'undefined') return;

        // 将行拆分为三部分：行首特殊 token 前缀、用于查字典的主文本、行内第一个 special 之后的后缀
        // 例如 "\N[1]いや…\N[1]は命の恩人" => { prefix:"\N[1]", mainText:"いや…", suffix:"\N[1]は命の恩人" }
        var leadingSpecialPattern = /^((?:\\+(?:[A-Za-z]+(?:\[[^\]]*\])?|[^A-Za-z\s])|<[^>]*>)+)/;
        var internalSpecialPattern = /\\+(?:[A-Za-z]+(?:\[[^\]]*\])?|[^A-Za-z\s])|%\d+|<[^>]*>/g;
        function splitLineForKey(line) {
            // 先剥离行首连续 special tokens
            var prefixMatch = line.match(leadingSpecialPattern);
            var prefix = prefixMatch ? prefixMatch[1] : '';
            var rest = line.slice(prefix.length);
            // 在 rest 中找第一个 special token，把之前的作为 mainText，之后（含该 token）作为 suffix
            internalSpecialPattern.lastIndex = 0;
            var m = internalSpecialPattern.exec(rest);
            if (m) {
                return { prefix: prefix, mainText: rest.slice(0, m.index), suffix: rest.slice(m.index) };
            }
            return { prefix: prefix, mainText: rest, suffix: '' };
        }

        // 名前インライン pattern 的备用拆分：
        // 例如 "……そういえばさ、\N[1]ってなんだか品があるよな～"
        //   => { namePrefix: "……そういえばさ、\N[1]", keyText: "ってなんだか品があるよな～" }
        // 仅当行中存在非行首的 \N[x] 或 \V[x] 时有效，否则返回 null
        var midNameTokenPattern = /\\+[NV]\[\d+\]/g;
        function splitLineForKeyAlt(line) {
            var prefixMatch = line.match(leadingSpecialPattern);
            var leadPrefix = prefixMatch ? prefixMatch[1] : '';
            var rest = line.slice(leadPrefix.length);
            // 找最后一个位于 rest 中非行首（index > 0）的 \N[x]/\V[x]
            midNameTokenPattern.lastIndex = 0;
            var lastM = null, m;
            while ((m = midNameTokenPattern.exec(rest)) !== null) {
                if (m.index > 0) lastM = m;
            }
            if (!lastM) return null;
            var afterToken = lastM.index + lastM[0].length;
            return {
                namePrefix: leadPrefix + rest.slice(0, afterToken),
                keyText: rest.slice(afterToken)
            };
        }

        var _command101 = Game_Interpreter.prototype.command101;
        Game_Interpreter.prototype.command101 = function() {
            var list = this._list;
            if (list) {
                var idx = this._index + 1;
                var lines = [];
                var indices = [];
                while (idx < list.length && list[idx].code === 401) {
                    lines.push(list[idx].parameters[0]);
                    indices.push(idx);
                    idx++;
                }
                if (lines.length > 1) {
                    var splitLines = lines.map(splitLineForKey);
                    var done = false;
                    var subHit = {};

                    // --- 主路径：全块 mainText 合并 key ---
                    var combined = splitLines.map(function(s) { return s.mainText; }).join('\n');
                    if (config.debug) log('[command101] trying multiline (' + lines.length + ' lines):', JSON.stringify(combined.slice(0, 120)));
                    var translated = lookupDictPreservingOuterSymbols(combined);
                    if (translated !== null) {
                        if (config.debug) log('[command101] HIT multiline:', combined.slice(0, 80));
                        var trLines = translated.split('\n');
                        for (var i = 0; i < indices.length; i++) {
                            var line = translatedSlot(
                                splitLines[i].prefix, trLines, i, splitLines[i].suffix
                            );
                            list[indices[i]].parameters[0] = line;
                            if (!splitLines[i].suffix &&
                                line !== SKIP_TRANSLATED_MESSAGE_LINE) {
                                markTranslated(line);
                            }
                        }
                        if (config.debug) log('[command101] multiline translated =>', translated.slice(0, 80));
                        done = true;
                    }

                    // --- 备用路径：名字内联（\N[1] 之后的文本作 key）---
                    if (!done) {
                        var altSplits = lines.map(splitLineForKeyAlt);
                        if (altSplits.some(function(s) { return s !== null; })) {
                            var altKey = lines.map(function(ln, i) {
                                return altSplits[i] ? altSplits[i].keyText : splitLines[i].mainText;
                            }).join('\n');
                            if (config.debug) log('[command101] trying alt (name-inline):', JSON.stringify(altKey.slice(0, 120)));
                            var altTr = lookupDictPreservingOuterSymbols(altKey);
                            if (altTr !== null) {
                                if (config.debug) log('[command101] HIT alt name-inline:', altKey.slice(0, 80));
                                var altTrLines = altTr.split('\n');
                                for (var j = 0; j < indices.length; j++) {
                                    var altLine;
                                    if (altSplits[j]) {
                                        // namePrefix 前可能含日文，不 mark，让 translateText 继续翻译
                                        altLine = altSplits[j].namePrefix +
                                            (j < altTrLines.length ? altTrLines[j] : '');
                                    } else {
                                        altLine = translatedSlot(
                                            splitLines[j].prefix, altTrLines, j,
                                            splitLines[j].suffix
                                        );
                                        if (altLine !== SKIP_TRANSLATED_MESSAGE_LINE) {
                                            markTranslated(altLine);
                                        }
                                    }
                                    list[indices[j]].parameters[0] = altLine;
                                }
                                if (config.debug) log('[command101] alt translated =>', altTr.slice(0, 80));
                                done = true;
                            }
                        }
                    }

                    // --- 子区间滑窗：同一消息框内部分行构成多行 key ---
                    if (!done && lines.length >= 3) {
                        for (var winSize = lines.length - 1; winSize >= 2; winSize--) {
                            for (var start = 0; start + winSize <= lines.length; start++) {
                                var skip = false;
                                for (var si = start; si < start + winSize; si++) {
                                    if (subHit[si]) { skip = true; break; }
                                }
                                if (skip) continue;
                                var subSplits = splitLines.slice(start, start + winSize);
                                var subKey = subSplits.map(function(s) { return s.mainText; }).join('\n');
                                var subTr = lookupDictPreservingOuterSymbols(subKey);

                                // 子区间也尝试 alt name-inline
                                var subAltSplits = null;
                                if (subTr === null) {
                                    subAltSplits = lines.slice(start, start + winSize).map(splitLineForKeyAlt);
                                    if (subAltSplits.some(function(s) { return s !== null; })) {
                                        var subAltKey = lines.slice(start, start + winSize).map(function(ln, ki) {
                                            return subAltSplits[ki] ? subAltSplits[ki].keyText : subSplits[ki].mainText;
                                        }).join('\n');
                                        subTr = lookupDictPreservingOuterSymbols(subAltKey);
                                        if (subTr !== null && config.debug) {
                                            log('[command101] sub-window alt HIT [' + start + '..' + (start+winSize-1) + ']:', subAltKey.slice(0, 80));
                                        }
                                    }
                                }
                                if (subTr !== null) {
                                    if (config.debug && !subAltSplits) {
                                        log('[command101] sub-window HIT [' + start + '..' + (start+winSize-1) + ']:', subKey.slice(0, 80));
                                    }
                                    var subTrLines = subTr.split('\n');
                                    for (var k = 0; k < winSize; k++) {
                                        var kk = start + k;
                                        var kLine = (subAltSplits && subAltSplits[k])
                                            ? subAltSplits[k].namePrefix +
                                                (k < subTrLines.length ? subTrLines[k] : '')
                                            : translatedSlot(
                                                subSplits[k].prefix, subTrLines, k,
                                                subSplits[k].suffix
                                            );
                                        list[indices[kk]].parameters[0] = kLine;
                                        if (!(subAltSplits && subAltSplits[k]) &&
                                            kLine !== SKIP_TRANSLATED_MESSAGE_LINE) {
                                            markTranslated(kLine);
                                        }
                                        subHit[kk] = true;
                                    }
                                }
                            }
                        }
                    }

                    // --- suffix 接龙：行内颜色 token 后的文本 + 后续行组成 key ---
                    if (!done) {
                        for (var sfi = 0; sfi < lines.length - 1; sfi++) {
                            if (subHit[sfi] || !splitLines[sfi].suffix) continue;
                            var sufSplit = splitLineForKey(splitLines[sfi].suffix);
                            if (!sufSplit.mainText) continue;
                            for (var sfw = 1; sfi + sfw < lines.length; sfw++) {
                                if (subHit[sfi + sfw]) break;
                                var sufKeyParts = [sufSplit.mainText];
                                for (var sfk = 1; sfk <= sfw; sfk++) {
                                    sufKeyParts.push(splitLines[sfi + sfk].mainText);
                                }
                                var sufKey = sufKeyParts.join('\n');
                                var sufTr = lookupDictPreservingOuterSymbols(sufKey);
                                if (sufTr !== null) {
                                    if (config.debug) log('[command101] suffix-continue HIT line ' + sfi + '+' + sfw + ':', sufKey.slice(0, 80));
                                    var sufTrLines = sufTr.split('\n');
                                    // sfi 行：保留 prefix+mainText，suffix 的 special token 保留，文本换成译文首行
                                    // 不 mark：mainText 仍需 translateText 翻译
                                    list[indices[sfi]].parameters[0] =
                                        splitLines[sfi].prefix + splitLines[sfi].mainText +
                                        sufSplit.prefix + (sufTrLines[0] || '');
                                    for (var sfw2 = 1; sfw2 <= sfw; sfw2++) {
                                        var sfwLine = translatedSlot(
                                            splitLines[sfi + sfw2].prefix,
                                            sufTrLines, sfw2,
                                            splitLines[sfi + sfw2].suffix
                                        );
                                        list[indices[sfi + sfw2]].parameters[0] = sfwLine;
                                        if (!splitLines[sfi + sfw2].suffix &&
                                            sfwLine !== SKIP_TRANSLATED_MESSAGE_LINE) {
                                            markTranslated(sfwLine);
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            return _command101.apply(this, arguments);
        };
    }

    function patchMessageTranslation() {
        if (typeof Game_Message === 'undefined') return;

        var _Game_Message_clear = Game_Message.prototype.clear;
        Game_Message.prototype.clear = function() {
            _Game_Message_clear.apply(this, arguments);
            this._rpgTextTranslationHasTranslatedText = false;
            this._rpgTextTranslationLastLineTranslated = false;
            this._rpgTextTranslationJoinAfterSkippedLine = false;
        };

        function shouldJoinTranslatedLines(previous, current) {
            var left = String(previous || '').replace(/\s+$/, '');
            var right = String(current || '').replace(/^\s+/, '');
            if (!left || !right || /[\n\f]$/.test(left) || /^[\n\f]/.test(right)) {
                return false;
            }
            // 新的引号/段落应保留换行；句号、问号和闭引号表示上一句已经结束。
            if (/^[「『“‘（【《〈｢]/.test(right) ||
                /[。！？!?…‥」』”’）】》〉]$/.test(left)) {
                return false;
            }
            // 避免把短说话人名称和正文连在一起；闭引号等短尾句仍可接回长句。
            return left.length >= 12 || /^[，。！？、；：」』）】》〉]/.test(right);
        }

        var _Game_Message_add = Game_Message.prototype.add;
        Game_Message.prototype.add = function(text) {
            if (text === SKIP_TRANSLATED_MESSAGE_LINE) {
                // 下一条译文原本紧跟在被合并字典项占用的原文续行之后。只在这个
                // 明确场景允许重新接回上一条，避免改变普通多行对话的人工排版。
                this._rpgTextTranslationJoinAfterSkippedLine =
                    this._rpgTextTranslationLastLineTranslated;
                return;
            }

            var output;
            var wasTranslated = false;
            if (isAlreadyTranslated(text)) {
                unmarkTranslated(text);
                output = text;
                wasTranslated = true;
            } else {
                output = translateText(text);
                wasTranslated = output !== text || isKnownTranslation(output);
            }

            var previous = this._texts && this._texts.length > 0
                ? this._texts[this._texts.length - 1]
                : null;
            if (wasTranslated &&
                this._rpgTextTranslationJoinAfterSkippedLine &&
                previous !== null &&
                shouldJoinTranslatedLines(previous, output)) {
                this._texts[this._texts.length - 1] = previous + output;
            } else {
                _Game_Message_add.call(this, output);
            }
            this._rpgTextTranslationJoinAfterSkippedLine = false;
            this._rpgTextTranslationHasTranslatedText =
                this._rpgTextTranslationHasTranslatedText || wasTranslated;
            this._rpgTextTranslationLastLineTranslated = wasTranslated;
        };

        var _Game_Message_setChoices = Game_Message.prototype.setChoices;
        Game_Message.prototype.setChoices = function(choices, defaultType, cancelType) {
            var translatedChoices = Array.isArray(choices) ? choices.slice(0) : choices;
            translateArray(translatedChoices);
            _Game_Message_setChoices.call(this, translatedChoices, defaultType, cancelType);
        };

        // 不 hook setSpeakerName：TRP_SkitMZ 等立绘插件用原名做角色识别，
        // 提前翻译会让 nameToInputList 匹配失败、立绘消失。显示层由 patchNameBoxLog 兜底。
    }

    function patchTranslatedMessageAutoWrap() {
        if (typeof Window_Message === 'undefined' || !Window_Message.prototype) return;
        if (Window_Message.prototype._rpgTextTranslationAutoWrapPatched) return;

        var wrapLogCount = 0;
        var wrapLogLimit = 12;
        var _Window_Message_processNormalCharacter =
            Window_Message.prototype.processNormalCharacter;

        Window_Message.prototype.processNormalCharacter = function(textState) {
            if (window.$gameMessage &&
                $gameMessage._rpgTextTranslationHasTranslatedText &&
                textState &&
                textState.text &&
                textState.index < textState.text.length) {
                var character = textState.text.charAt(textState.index);
                var characterWidth = this.textWidth(character);
                var right = this.contents && this.contents.width
                    ? this.contents.width - (this.textPadding ? this.textPadding() : 0)
                    : 0;
                if (right > 0 &&
                    textState.x > textState.left &&
                    textState.x + characterWidth > right) {
                    if (config.debug && wrapLogCount < wrapLogLimit) {
                        log(
                            '[TranslationWrap] x=' + textState.x.toFixed(2) +
                            ' charWidth=' + characterWidth.toFixed(2) +
                            ' right=' + right.toFixed(2) +
                            ' font=' + JSON.stringify(this.contents.fontFace) +
                            ' fontSize=' + this.contents.fontSize
                        );
                        wrapLogCount += 1;
                    }
                    // 将真实换行插入当前字符之前，让游戏及 MPP_MessageEX 自己处理
                    // 行高、动画、停顿和翻页；当前字符留到下一轮正常绘制。
                    textState.text =
                        textState.text.slice(0, textState.index) + '\n' +
                        textState.text.slice(textState.index);
                    this.processNewLine(textState);
                    return;
                }
            }
            return _Window_Message_processNormalCharacter.apply(this, arguments);
        };

        Window_Message.prototype._rpgTextTranslationAutoWrapPatched = true;
    }

    function patchDatabaseTerms() {
        if (typeof DataManager === 'undefined') return;

        function translateFields(array, fields) {
            if (!Array.isArray(array)) return;
            for (var i = 1; i < array.length; i++) {
                var item = array[i];
                if (!item) continue;
                for (var f = 0; f < fields.length; f++) {
                    var field = fields[f];
                    if (typeof item[field] === 'string') {
                        // 根据配置决定是否翻译名称字段
                        var isNameField = (field === 'name' || field === 'nickname');
                        if (isNameField && !config.translateDatabaseNames) {
                            // 跳过名称字段的翻译（可能被用作资源文件标识符）
                            continue;
                        } else if (isNameField) {
                            // 名称字段允许翻译；资源文件回退由 native scheme handler 处理
                            var before = item[field];
                            var after = translateText(item[field]);
                            if (config.debug) {
                                log('[patchDatabaseTerms] translate name:', before, '=>', after);
                            }
                            item[field] = after;
                        } else {
                            // 描述等其他字段正常翻译
                            item[field] = translateText(item[field]);
                        }
                    }
                }
            }
        }

        var _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
        DataManager.isDatabaseLoaded = function() {
            if (!_DataManager_isDatabaseLoaded.call(this)) return false;

            if (this._rpgTextTranslationPatched) {
                return true;
            }
            if (!state.loaded) {
                return false;
            }

            translateFields(window.$dataItems, ['name', 'description']);
            translateFields(window.$dataWeapons, ['name', 'description']);
            translateFields(window.$dataArmors, ['name', 'description']);
            translateFields(window.$dataSkills, ['name', 'description', 'message1', 'message2']);
            translateFields(window.$dataStates, ['name', 'message1', 'message2', 'message3', 'message4']);
            translateFields(window.$dataActors, ['name', 'nickname', 'profile']);
            translateFields(window.$dataClasses, ['name']);
            translateFields(window.$dataEnemies, ['name']);
            translateFields(window.$dataTroops, ['name']);
            translateFields(window.$dataMapInfos, ['name']);

            if (window.$dataSystem && config.translateSystemTerms) {
                translateArray(window.$dataSystem.elements);
                translateArray(window.$dataSystem.skillTypes);
                translateArray(window.$dataSystem.weaponTypes);
                translateArray(window.$dataSystem.armorTypes);
                translateArray(window.$dataSystem.equipTypes);
                translateArray(window.$dataSystem.terms && window.$dataSystem.terms.basic);
                translateArray(window.$dataSystem.terms && window.$dataSystem.terms.params);
                // terms.commands is intentionally excluded even when translateSystemTerms=true:
                // plugins like MOG_BattleCommands use command names as image file identifiers
                // (e.g. "アイテム" -> "Com_アイテム.rpgmvp"). Translating them breaks those paths.
            }

            this._rpgTextTranslationPatched = true;
            log('Database terms translated');
            return true;
        };
    }

    // 通用显示层 hook：覆盖普通窗口、自定义 Window_Selectable 和 drawTextEx。
    // 仅替换传给原绘制方法的局部参数，不回写插件数据，避免名称参与资源路径、
    // 状态判断或存档时受到影响。
    //
    // displayTranslationDepth 在原方法执行的整个期间保持 > 0。这样 drawTextEx
    // 内部若再次经过 drawText/textWidth，不会把已经翻译的结果重复翻译。
    function patchWindowTextDrawing() {
        if (typeof Window_Base === 'undefined' || !Window_Base.prototype) return;
        if (Window_Base.prototype._rpgTextTranslationDrawingPatched) return;

        var displayTranslationDepth = 0;

        function translateForDisplay(text) {
            if (displayTranslationDepth > 0 ||
                !state.loaded ||
                typeof text !== 'string' ||
                text === '') {
                return text;
            }
            return translateText(text);
        }

        function wrapTextMethod(methodName) {
            var original = Window_Base.prototype[methodName];
            if (typeof original !== 'function') return;

            Window_Base.prototype[methodName] = function(text) {
                var args = Array.prototype.slice.call(arguments);
                args[0] = translateForDisplay(text);
                displayTranslationDepth += 1;
                try {
                    return original.apply(this, args);
                } finally {
                    displayTranslationDepth -= 1;
                }
            };
        }

        wrapTextMethod('drawText');
        wrapTextMethod('drawTextEx');
        wrapTextMethod('textWidth');

        Window_Base.prototype._rpgTextTranslationDrawingPatched = true;
        log('[patchWindowTextDrawing] Window_Base drawText/drawTextEx/textWidth patched');
    }

    log('Plugin init config:', JSON.stringify(config));

    // Early exit if translation is disabled
    if (!config.enabled) {
        log('Translation disabled, skipping hooks');
        return;
    }

    patchBootReady();
    patchCanvasCJK();
    patchInterpreterCommand101();
    patchMessageTranslation();
    patchTranslatedMessageAutoWrap();
    patchDatabaseTerms();
    patchWindowTextDrawing();
    patchNameBoxLog();
    loadDictionary();

    if (config.debug) {
        setInterval(function() {
            if (!state.loaded) return;
            log('Stats: hits=' + state.hitCount + ', misses=' + state.missCount + ', failed=' + state.failed);
        }, 10000);
    }
})();
