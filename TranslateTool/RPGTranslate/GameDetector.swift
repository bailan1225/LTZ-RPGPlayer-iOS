import Foundation

/// 游戏目录识别与 index.html 生成
/// 支持三种目录形态：
///  1. 标准游戏根（含 index.html）
///  2. 嵌套 www（www/index.html 或 www/js 核心文件）
///  3. 裸 www（目录本身是 www，js 直接在其下）——自动生成 index.html
enum GameDetector {

    /// 游戏目录类型
    enum Kind {
        /// 目录含 index.html（MV/MZ 部署根）
        case standard
        /// 目录含 www/index.html
        case nestedWWW
        /// 目录含 www/（www/js 有核心文件，根缺 index.html）→ 需生成
        case needsGeneratedRoot
        /// 目录本身就是 www（js 直接在其下）→ 需生成
        case bareWWW
    }

    private static let mvCore = ["rpg_core.js", "rpg_managers.js", "rpg_objects.js",
                                 "rpg_scenes.js", "rpg_windows.js", "rpg_sprites.js"]
    private static let mzCore = ["rmmz_core.js", "rmmz_managers.js", "rmmz_objects.js",
                                 "rmmz_scenes.js", "rmmz_windows.js", "rmmz_sprites.js"]

    /// 是否为可识别的游戏目录
    static func isGameDir(_ url: URL) -> Bool {
        let fm = FileManager.default
        if fm.fileExists(atPath: url.appendingPathComponent("index.html").path) { return true }
        let www = url.appendingPathComponent("www")
        if fm.fileExists(atPath: www.appendingPathComponent("index.html").path) { return true }
        if hasCoreJS(www) { return true }
        if hasCoreJS(url) { return true }
        return false
    }

    static func kind(of dir: URL) -> Kind {
        let fm = FileManager.default
        if fm.fileExists(atPath: dir.appendingPathComponent("index.html").path) { return .standard }
        let www = dir.appendingPathComponent("www")
        if fm.fileExists(atPath: www.appendingPathComponent("index.html").path) { return .nestedWWW }
        if hasCoreJS(www) { return .needsGeneratedRoot }
        return .bareWWW
    }

    /// 返回最终可加载的 index.html URL；缺失时按 MV/MZ 实际文件自动生成
    static func ensureIndexHTML(for dir: URL) -> URL? {
        let fm = FileManager.default
        let direct = dir.appendingPathComponent("index.html")
        if fm.fileExists(atPath: direct.path) { return direct }
        let www = dir.appendingPathComponent("www")
        let wwwIndex = www.appendingPathComponent("index.html")
        if fm.fileExists(atPath: wwwIndex.path) { return wwwIndex }
        // 生成到 www（needsGeneratedRoot）或目录自身（bareWWW）
        let targetDir = hasCoreJS(www) ? www : dir
        let target = targetDir.appendingPathComponent("index.html")
        do {
            let html = indexHTMLTemplate(for: targetDir)
            try html.write(to: target, atomically: true, encoding: .utf8)
            return target
        } catch {
            return nil
        }
    }

    /// 解析实际加载目标：优先 www 部署结构（index 与 data 同目录，读权限最小化），
    /// 其次根 index.html + 根 data，最后兜底根 index 或自动生成
    static func resolveLoadTarget(for dir: URL) -> (index: URL, readRoot: URL)? {
        let fm = FileManager.default
        let rootIndex = dir.appendingPathComponent("index.html")
        let rootSystem = dir.appendingPathComponent("data/System.json")
        let www = dir.appendingPathComponent("www")
        let wwwIndex = www.appendingPathComponent("index.html")

        // 优先 www 部署结构（MV/MZ 部署产物：index 与 data 都在 www 内）
        if fm.fileExists(atPath: wwwIndex.path) {
            return (wwwIndex, www)
        }
        // 开发结构：根 index + 根 data
        if fm.fileExists(atPath: rootIndex.path), fm.fileExists(atPath: rootSystem.path) {
            return (rootIndex, dir)
        }
        if fm.fileExists(atPath: rootIndex.path) {
            return (rootIndex, dir)
        }
        guard let gen = ensureIndexHTML(for: dir) else { return nil }
        return (gen, gen.deletingLastPathComponent())
    }

    private static func hasCoreJS(_ dir: URL) -> Bool {
        let js = dir.appendingPathComponent("js")
        let fm = FileManager.default
        for name in mvCore + mzCore {
            if fm.fileExists(atPath: js.appendingPathComponent(name).path) { return true }
        }
        return false
    }

    // MARK: - 多语言插件名修复（日文/中文/语言后缀的 js 文件名）

    /// 常见语言后缀（插件文件名本地化变体，如 YEP_CoreEngine_zh.js / _ja.js）
    private static let langSuffixes = ["ja", "jp", "jap", "zh", "zhs", "zht", "cn", "chi",
                                       "chs", "cht", "en", "eng", "ko", "kr", "de", "fr",
                                       "es", "it", "ru", "tw", "hk"]

    /// 去掉尾部语言后缀：YEP_CoreEngine_zh → yep_coreengine
    private static func stripLang(_ s: String) -> String {
        let parts = s.components(separatedBy: CharacterSet(charactersIn: "_-"))
        if parts.count > 1, let last = parts.last, langSuffixes.contains(last.lowercased()) {
            return parts.dropLast().joined(separator: "_")
        }
        return s
    }

    /// 插件名与文件名是否匹配（大小写不敏感 + 忽略语言后缀）
    private static func pluginNameMatches(_ name: String, _ base: String) -> Bool {
        let a = name.lowercased()
        let b = base.lowercased()
        if a == b { return true }
        let sa = stripLang(a), sb = stripLang(b)
        return sa == b || a == sb || sa == sb
    }

    /// 插件别名修复：plugins.js 引用的插件名与实际文件（含日文/中文/语言后缀变体）不匹配时，
    /// 在 js/plugins/ 下建立硬链接别名（同卷安全、不复制内容、不修改原文件），保证
    /// loadScript('js/plugins/<name>.js') 能找到——修复"Failed to load: js/plugins/xxx.js"类白屏/报错。
    /// 幂等：目标已存在则跳过；每次启动游戏前调用。
    static func fixPluginAliases(in root: URL) {
        let fm = FileManager.default
        let jsDir = root.appendingPathComponent("js")
        let pluginsJS = jsDir.appendingPathComponent("plugins.js")
        let pluginsDir = jsDir.appendingPathComponent("plugins", isDirectory: true)
        guard fm.fileExists(atPath: pluginsJS.path),
              fm.fileExists(atPath: pluginsDir.path),
              let data = try? Data(contentsOf: pluginsJS),
              let text = String(data: data, encoding: .utf8),
              let regex = try? NSRegularExpression(pattern: "\"name\"\\s*:\\s*\"([^\"]+)\"")
        else { return }

        let range = NSRange(text.startIndex..<text.endIndex, in: text)
        let names = regex.matches(in: text, range: range).compactMap { m -> String? in
            guard let r = Range(m.range(at: 1), in: text) else { return nil }
            return String(text[r])
        }
        guard !names.isEmpty,
              let files = try? fm.contentsOfDirectory(at: pluginsDir, includingPropertiesForKeys: nil)
        else { return }

        for name in names {
            guard !name.isEmpty else { continue }
            let target = pluginsDir.appendingPathComponent(name + ".js")
            if fm.fileExists(atPath: target.path) { continue }
            guard let cand = files.first(where: {
                $0.pathExtension.lowercased() == "js" &&
                pluginNameMatches(name, $0.deletingPathExtension().lastPathComponent)
            }) else { continue }
            // 硬链接优先（同卷零拷贝），失败退回复制
            do { try fm.linkItem(at: cand, to: target) } catch {
                try? fm.copyItem(at: cand, to: target)
            }
        }
    }

    /// 按实际存在的文件生成 MV/MZ 标准 index.html
    private static func indexHTMLTemplate(for dir: URL) -> String {        let jsDir = dir.appendingPathComponent("js")
        let fm = FileManager.default

        func firstExisting(_ names: [String], in sub: String) -> String? {
            for n in names {
                let p = jsDir.appendingPathComponent(sub).appendingPathComponent(n)
                if fm.fileExists(atPath: p.path) { return "\(sub)/\(n)" }
            }
            return nil
        }
        func firstExistingRoot(_ names: [String]) -> String? {
            for n in names {
                let p = jsDir.appendingPathComponent(n)
                if fm.fileExists(atPath: p.path) { return n }
            }
            return nil
        }

        let isMV = firstExistingRoot(["rpg_core.js"]) != nil
        var libs: [String] = []
        if let f = firstExisting(["pixi.min.js", "pixi.js"], in: "libs") { libs.append(f) }
        if let f = firstExisting(["pixi-tilemap.min.js", "pixi-tilemap.js"], in: "libs") { libs.append(f) }
        if let f = firstExisting(["pixi-picture.min.js", "pixi-picture.js"], in: "libs") { libs.append(f) }
        if let f = firstExisting(["fpsmeter.min.js", "fpsmeter.js"], in: "libs") { libs.append(f) }
        if let f = firstExisting(["lz-string.min.js", "lz-string.js"], in: "libs") { libs.append(f) }

        let cores: [String] = isMV
            ? mvCore
            : mzCore

        var scripts = libs.map { "<script src=\"js/\($0)\"></script>" }
        for c in cores where fm.fileExists(atPath: jsDir.appendingPathComponent(c).path) {
            scripts.append("<script src=\"js/\(c)\"></script>")
        }
        if fm.fileExists(atPath: jsDir.appendingPathComponent("plugins.js").path) {
            scripts.append("<script src=\"js/plugins.js\"></script>")
        }
        scripts.append("<script src=\"js/main.js\"></script>")

        return """
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="format-detection" content="telephone=no">
        <title>RPG Player</title>
        <style>
        html, body { margin:0; padding:0; width:100%; height:100%; background:#000; overflow:hidden; }
        canvas { display:block; }
        </style>
        </head>
        <body>
        \(scripts.joined(separator: "\n"))
        </body>
        </html>
        """
    }
}
