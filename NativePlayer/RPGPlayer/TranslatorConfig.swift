import Foundation

/// 生成注入给网页的翻译配置（window.RPG_T = {...}）
enum TranslatorConfig {

    static func injectionSource() -> String {
        let defaults = UserDefaults.standard
        let engines = ["offline", "mymemory", "custom"]
        let idx = defaults.integer(forKey: "tr_engine")
        let engine = engines.indices.contains(idx) ? engines[idx] : "mymemory"

        // 词典：优先用户 Documents/dict.json，其次内置样例
        var dict: [String: String] = [:]
        let fm = FileManager.default
        let docs = fm.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let userDict = docs.appendingPathComponent("dict.json")
        let dictURL = fm.fileExists(atPath: userDict.path)
            ? userDict
            : (Bundle.main.url(forResource: "dict", withExtension: "json") ?? userDict)
        if let data = try? Data(contentsOf: dictURL),
           let json = try? JSONSerialization.jsonObject(with: data) as? [String: String] {
            dict = json
        }

        let payload: [String: Any] = [
            "enabled": defaults.bool(forKey: "tr_enabled"),
            "engine": engine,
            "source": defaults.string(forKey: "tr_source") ?? "ja",
            "target": defaults.string(forKey: "tr_target") ?? "zh-CN",
            "apiUrl": defaults.string(forKey: "tr_api_url") ?? "",
            "apiKey": defaults.string(forKey: "tr_api_key") ?? "",
            "cacheVersion": defaults.integer(forKey: "tr_cache_version"),
            "translateUI": false,
            "dictionary": dict
        ]
        guard let data = try? JSONSerialization.data(withJSONObject: payload),
              let json = String(data: data, encoding: .utf8) else {
            return "window.RPG_T = {};"
        }
        return "window.RPG_T = " + json + ";"
    }
}

/// 读取内置 Translator.js 注入脚本
enum TranslatorJS {
    static var source: String {
        guard let url = Bundle.main.url(forResource: "Translator", withExtension: "js"),
              let s = try? String(contentsOf: url, encoding: .utf8) else {
            return "// Translator.js missing"
        }
        return s
    }
}

/// 读取内置 Cheat.js 注入脚本
enum CheatJS {
    static var source: String {
        guard let url = Bundle.main.url(forResource: "Cheat", withExtension: "js"),
              let s = try? String(contentsOf: url, encoding: .utf8) else {
            return "// Cheat.js missing"
        }
        return s
    }
}
