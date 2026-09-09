import Foundation

/// 生成注入给网页的翻译配置（window.RPG_T = {...}）
enum TranslatorConfig {

    static func injectionSource() -> String {
        let defaults = UserDefaults.standard
        let engines = ["offline", "mymemory", "custom", "agnes", "aqua"]
        let idx = defaults.integer(forKey: "tr_engine")
        let engine = engines.indices.contains(idx) ? engines[idx] : "offline"

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
            "model": defaults.string(forKey: "tr_model") ?? "",
            "memEmail": defaults.string(forKey: "tr_mem_email") ?? "",
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

/// 读取内置 translator.js 注入脚本
enum TranslatorJS {
    static var source: String {
        guard let url = Bundle.main.url(forResource: "translator", withExtension: "js"),
              let s = try? String(contentsOf: url, encoding: .utf8) else {
            return "// translator.js missing"
        }
        return s
    }
}

/// 读取内置 ark_optimizations.js（整合 ArkRPG 开源项目的核心优化：视口/坐标/性能/纹理GC/输入映射）
enum ArkOptimizationsJS {
    static var source: String {
        guard let url = Bundle.main.url(forResource: "ark_optimizations", withExtension: "js"),
              let s = try? String(contentsOf: url, encoding: .utf8) else {
            return "// ark_optimizations.js missing"
        }
        return s
    }
}

/// 读取内置 ark_rpg_cheat_menu.js（ArkRPG 同款现代作弊器，MIT 协议，整合 RPGMakerCheatMenu + ParamonosCheatUI 功能）
enum ArkCheatMenuJS {
    static var source: String {
        guard let url = Bundle.main.url(forResource: "ark_rpg_cheat_menu", withExtension: "js"),
              let s = try? String(contentsOf: url, encoding: .utf8) else {
            return "// ark_rpg_cheat_menu.js missing"
        }
        return s
    }
}

/// 读取内置 common_polyfills.js（通用 polyfill 包：core+crypto+fs+media+syncXHR+pixiTextureFix+audio）
enum ArkCommonPolyfillsJS {
    static var source: String {
        guard let url = Bundle.main.url(forResource: "common_polyfills", withExtension: "js"),
              let s = try? String(contentsOf: url, encoding: .utf8) else {
            return "// common_polyfills.js missing"
        }
        return s
    }
}

/// 读取内置 mv_compat.js（MV 兼容包：存档+媒体+插件参数，含环境判断）
enum ArkMVCompatJS {
    static var source: String {
        guard let url = Bundle.main.url(forResource: "mv_compat", withExtension: "js"),
              let s = try? String(contentsOf: url, encoding: .utf8) else {
            return "// mv_compat.js missing"
        }
        return s
    }
}

/// 读取内置 mz_compat.js（MZ 兼容包：存档+媒体+插件参数+WebGL+启动，含环境判断）
enum ArkMZCompatJS {
    static var source: String {
        guard let url = Bundle.main.url(forResource: "mz_compat", withExtension: "js"),
              let s = try? String(contentsOf: url, encoding: .utf8) else {
            return "// mz_compat.js missing"
        }
        return s
    }
}

/// ArkRPG 全量兼容层：按依赖顺序加载所有剩余文件（音频解码/图片降采样/运行时翻译/视频/插件兼容）
enum ArkFullCompatJS {
    static var source: String {
        guard let url = Bundle.main.url(forResource: "full_compat", withExtension: "js"),
              let s = try? String(contentsOf: url, encoding: .utf8) else {
            return "// full_compat.js missing"
        }
        return s
    }
}
