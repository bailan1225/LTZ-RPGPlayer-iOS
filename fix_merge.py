# -*- coding: utf-8 -*-
import io

root = 'NativePlayer/RPGPlayer/'
for name in ['TranslatorEngine.swift', 'DataTranslator.swift', 'ControlCode.swift', 'TranslatorConfig.swift']:
    p = root + name
    b = open(p, 'rb').read()
    if b[:3] == b'\xef\xbb\xbf':
        b = b[3:]
    s = b.decode('utf-8').replace('\r\n', '\n')
    io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
    print('fixed', name)

add = '''

// MARK: - 从 UserDefaults 读取翻译配置（与翻译器 key 完全一致，设置页共用）

extension TranslationConfig {
    static func loadFromDefaults(_ defaults: UserDefaults = .standard) -> TranslationConfig {
        let engines = [TranslationEngine.offline, .mymemory, .custom, .agnes, .aqua]
        let idx = defaults.integer(forKey: "tr_engine")
        return TranslationConfig(
            engine: engines.indices.contains(idx) ? engines[idx] : .offline,
            source: defaults.string(forKey: "tr_source") ?? "ja",
            target: defaults.string(forKey: "tr_target") ?? "zh-CN",
            apiUrl: defaults.string(forKey: "tr_api_url") ?? "",
            apiKey: defaults.string(forKey: "tr_api_key") ?? "",
            prompt: defaults.string(forKey: "tr_prompt") ?? "",
            model: defaults.string(forKey: "tr_model") ?? "",
            memEmail: defaults.string(forKey: "tr_mem_email") ?? "")
    }
}
'''
p = root + 'TranslatorEngine.swift'
s = io.open(p, encoding='utf-8').read()
if 'loadFromDefaults' not in s:
    io.open(p, 'w', encoding='utf-8', newline='\n').write(s.rstrip() + '\n' + add)
print('loadFromDefaults:', 'loadFromDefaults' in io.open(p, encoding='utf-8').read())
