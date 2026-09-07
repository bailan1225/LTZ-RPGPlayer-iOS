import Foundation

/// 生成注入给网页的翻译配置（window.RPG_T = {...}）
enum TranslatorConfig {

    static func injectionSource() -> String {
        let defaults = UserDefaults.standard
        let engines = ["offline", "mymemory", "custom"]
        let idx = defaults.integer(forKey: "tr_engine")
        let engine = engines.indices.contains(idx) ? engines[idx] : "mymemory"

        // 词典优先级：translations/*.json（mtool 格式外部翻译文件，覆盖）→
        //           Documents/dict.json（自定义）→ 内置样例 dict
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
        // 外部翻译文件：文件App → 我的 iPhone → RPG Player → translations 下的所有 JSON
        // （mtool/他人分享的 {原文: 译文} 格式），运行时直接命中，离线、术语一致
        let trDir = docs.appendingPathComponent("translations", isDirectory: true)
        if let files = try? fm.contentsOfDirectory(at: trDir, includingPropertiesForKeys: nil) {
            for f in files.sorted(by: { $0.lastPathComponent < $1.lastPathComponent })
            where f.pathExtension.lowercased() == "json" {
                if let data = try? Data(contentsOf: f),
                   let json = try? JSONSerialization.jsonObject(with: data) as? [String: String] {
                    for (k, v) in json { dict[k] = v }
                }
            }
        }

        let payload: [String: Any] = [
            "enabled": defaults.bool(forKey: "tr_enabled"),
            "engine": engine,
            "source": defaults.string(forKey: "tr_source") ?? "ja",
            "target": defaults.string(forKey: "tr_target") ?? "zh-CN",
            "apiUrl": defaults.string(forKey: "tr_api_url") ?? "",
            "apiKey": defaults.string(forKey: "tr_api_key") ?? "",
            "prompt": defaults.string(forKey: "tr_prompt") ?? "",
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
