import Foundation

/// 生成注入给网页的翻译配置（window.RPG_T = {...}）
enum TranslatorConfig {

    static func injectionSource() -> String {
        let defaults = UserDefaults.standard

        // 词典：translations/*.json（翻译器/iOS mtool 导出的 {原文: 译文}，优先）→
        //       Documents/dict.json（自定义）→ 内置样例 dict
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
        // （翻译器/iOS mtool/他人分享的 {原文: 译文} 格式），运行时直接命中，离线、术语一致
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

        // 纯词典模式：只注入开关与词典，无在线引擎配置（减少错误面、零网络依赖）
        let payload: [String: Any] = [
            "enabled": defaults.bool(forKey: "tr_enabled"),
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
