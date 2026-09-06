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

    private static func hasCoreJS(_ dir: URL) -> Bool {
        let js = dir.appendingPathComponent("js")
        let fm = FileManager.default
        for name in mvCore + mzCore {
            if fm.fileExists(atPath: js.appendingPathComponent(name).path) { return true }
        }
        return false
    }

    /// 按实际存在的文件生成 MV/MZ 标准 index.html
    private static func indexHTMLTemplate(for dir: URL) -> String {
        let jsDir = dir.appendingPathComponent("js")
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
