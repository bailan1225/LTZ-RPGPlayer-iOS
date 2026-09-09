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

/// 读取内置 Cheat.js 注入脚本（保留备用）
enum CheatJS {
    static var source: String {
        guard let url = Bundle.main.url(forResource: "Cheat", withExtension: "js"),
              let s = try? String(contentsOf: url, encoding: .utf8) else {
            return "// Cheat.js missing"
        }
        return s
    }
}

/// 读取内置 Cheat_Menu.js（RPGMakerCheatMenu 开源项目，ArkRPG 同款）
enum CheatMenuJS {
    static var source: String {
        guard let url = Bundle.main.url(forResource: "Cheat_Menu", withExtension: "js"),
              let s = try? String(contentsOf: url, encoding: .utf8) else {
            return "// Cheat_Menu.js missing"
        }
        return s
    }
}

/// 读取内置 ArkOptimizations.js（整合 ArkRPG 开源项目的核心优化：视口/坐标/性能/纹理GC/输入映射）
enum ArkOptimizationsJS {
    static var source: String {
        guard let url = Bundle.main.url(forResource: "ArkOptimizations", withExtension: "js"),
              let s = try? String(contentsOf: url, encoding: .utf8) else {
            return "// ArkOptimizations.js missing"
        }
        return s
    }
}

/// 读取内置 ArkRPG_CheatMenu.js（ArkRPG 同款现代作弊器，MIT 协议，整合 RPGMakerCheatMenu + ParamonosCheatUI 功能）
enum ArkCheatMenuJS {
    static var source: String {
        guard let url = Bundle.main.url(forResource: "ArkRPG_CheatMenu", withExtension: "js"),
              let s = try? String(contentsOf: url, encoding: .utf8) else {
            return "// ArkRPG_CheatMenu.js missing"
        }
        return s
    }
}

/// 读取内置 common_crypto.js（Node crypto 模块 polyfill：SHA-256 + AES-CBC，加密游戏运行时解密用）
enum ArkCryptoJS {
    static var source: String {
        guard let url = Bundle.main.url(forResource: "common_crypto", withExtension: "js"),
              let s = try? String(contentsOf: url, encoding: .utf8) else {
            return "// common_crypto.js missing"
        }
        return s
    }
}

/// 读取内置 common_sync_xhr.js（同步 XHR 修复，部分游戏插件依赖同步请求）
enum ArkSyncXHRJS {
    static var source: String {
        guard let url = Bundle.main.url(forResource: "common_sync_xhr", withExtension: "js"),
              let s = try? String(contentsOf: url, encoding: .utf8) else {
            return "// common_sync_xhr.js missing"
        }
        return s
    }
}

/// 读取内置 pixi_base_texture_fix.js（PIXI 基础纹理修复，解决部分游戏纹理加载失败）
enum ArkPixiTextureFixJS {
    static var source: String {
        guard let url = Bundle.main.url(forResource: "pixi_base_texture_fix", withExtension: "js"),
              let s = try? String(contentsOf: url, encoding: .utf8) else {
            return "// pixi_base_texture_fix.js missing"
        }
        return s
    }
}

/// 读取内置 mz_webgl_compat.js（MZ WebGL 兼容修复）
enum ArkMZWebGLCompatJS {
    static var source: String {
        guard let url = Bundle.main.url(forResource: "mz_webgl_compat", withExtension: "js"),
              let s = try? String(contentsOf: url, encoding: .utf8) else {
            return "// mz_webgl_compat.js missing"
        }
        return s
    }
}
