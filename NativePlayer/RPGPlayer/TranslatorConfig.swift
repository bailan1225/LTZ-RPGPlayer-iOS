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

/// 读取内置 common_core.js（核心 polyfill：Utils.isNwjs 拦截 + PIXI 渲染器崩溃回退 Canvas）
enum ArkCoreJS {
    static var source: String {
        guard let url = Bundle.main.url(forResource: "common_core", withExtension: "js"),
              let s = try? String(contentsOf: url, encoding: .utf8) else {
            return "// common_core.js missing"
        }
        return s
    }
}

/// 读取内置 common_fs.js（Node fs 模块 polyfill，游戏插件兼容性）
enum ArkFSJS {
    static var source: String {
        guard let url = Bundle.main.url(forResource: "common_fs", withExtension: "js"),
              let s = try? String(contentsOf: url, encoding: .utf8) else {
            return "// common_fs.js missing"
        }
        return s
    }
}

/// 读取内置 common_media.js（媒体模块 polyfill）
enum ArkMediaJS {
    static var source: String {
        guard let url = Bundle.main.url(forResource: "common_media", withExtension: "js"),
              let s = try? String(contentsOf: url, encoding: .utf8) else {
            return "// common_media.js missing"
        }
        return s
    }
}





/// 读取内置 mac_audio.js（音频修复，iOS/macOS 通用）
enum ArkAudioJS {
    static var source: String {
        guard let url = Bundle.main.url(forResource: "mac_audio", withExtension: "js"),
              let s = try? String(contentsOf: url, encoding: .utf8) else {
            return "// mac_audio.js missing"
        }
        return s
    }
}

/// ArkRPG 全量兼容层：按依赖顺序加载所有剩余文件（音频解码/图片降采样/运行时翻译/视频/插件兼容）
enum ArkFullCompatJS {
    /// 按依赖顺序排列的文件名（不含扩展名）
    private static let fileOrder: [String] = [
        // 1. Vorbis .ogg 音频解码（iOS WebView 原生不支持 .ogg）
        "stbvorbis_stream_asm",
        "stbvorbis_stream",
        "worklet_stbvorbis",
        // 2. 音频流
        "audio_streaming",
        "compat_audio_streaming",
        "n_x_audio_streaming",
        // 3. 图片降采样（减少内存/闪退）
        "ark_image_downsample",
        "ark_image_downsample_mz",
        // 4. 运行时 JSON 词典翻译
        "rpg_text_translation",
        // 5. 内联视频
        "inline_video",
        // 6. 插件兼容层（按字母序）
        "compat_chimaki_spine",
        "compat_dktools_localization",
        "compat_drill_layer_tiled_gif",
        "compat_galv_quest_log",
        "compat_kns_talk_portrait",
        "compat_pdx_keybindings_remap",
        "compat_san_imp_color_cache",
        "compat_srd_game_upgrade",
        "compat_srd_preloader_core",
        "compat_touch_ui",
        "compat_yep_fps_synch_option",
        "compat_globalmap",
        "compat_koffi_modmanager",
        "compat_mv3d",
        "compat_parallel_bgs",
        "compat_pixi_apng"
    ]

    static var source: String {
        var s = ""
        for name in fileOrder {
            if let url = Bundle.main.url(forResource: name, withExtension: "js"),
               let t = try? String(contentsOf: url, encoding: .utf8) {
                s += "/* === \(name).js === */\n" + t + "\n"
            }
        }
        return s.isEmpty ? "// ArkFullCompatJS: no files found" : s
    }

    /// 已加载的文件数量（用于调试）
    static var loadedCount: Int {
        fileOrder.reduce(0) { count, name in
            Bundle.main.url(forResource: name, withExtension: "js") != nil ? count + 1 : count
        }
    }
}
