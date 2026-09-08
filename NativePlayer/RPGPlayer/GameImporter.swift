import Foundation

/// 游戏导入时的自动修复：解密、viewport 注入、目录结构整理、格式检测。
/// 在导入阶段完成所有修复，运行时零开销、零等待。
enum GameImporter {

    // MARK: - Viewport / 居中 CSS 注入

    /// 在 index.html 中注入 viewport meta 和游戏居中 CSS（如果没有）。
    /// 修复横屏时游戏画面偏移/消失的问题。
    static func fixViewport(in gameRoot: URL) {
        guard let index = findIndexHTML(in: gameRoot),
              var html = try? String(contentsOf: index, encoding: .utf8) else { return }

        var changed = false

        // 1) 注入 viewport meta（如果没有）
        if !html.contains("name=\"viewport\"") && !html.contains("name='viewport'") {
            let meta = "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover\">"
            if let range = html.range(of: "</head>") {
                html.insert(contentsOf: meta, at: range.lowerBound)
                changed = true
            } else if let range = html.range(of: "<body") {
                html.insert(contentsOf: meta + "\n", at: range.lowerBound)
                changed = true
            }
        }

        // 2) 注入游戏居中 CSS（如果没有）
        if !html.contains("rpg-player-center-css") {
            let css = """
            <style id="rpg-player-center-css">
            html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#000;}
            canvas{display:block;margin:0 auto;}
            #ggs-page,#gameCanvas,#GameCanvas{width:100%!important;height:100%!important;}
            </style>
            """
            if let range = html.range(of: "</head>") {
                html.insert(contentsOf: css, at: range.lowerBound)
                changed = true
            }
        }

        if changed {
            try? html.write(to: index, atomically: true, encoding: .utf8)
        }
    }

    // MARK: - 工具方法

    /// 查找 index.html（优先 www/index.html，其次根目录）
    static func findIndexHTML(in root: URL) -> URL? {
        let candidates = [
            root.appendingPathComponent("www").appendingPathComponent("index.html"),
            root.appendingPathComponent("index.html")
        ]
        for c in candidates where FileManager.default.fileExists(atPath: c.path) {
            return c
        }
        // 递归查找（最多 3 层）
        if let found = findFileRecursive(named: "index.html", in: root, maxDepth: 3) {
            return found
        }
        return nil
    }

    private static func findFileRecursive(named name: String, in dir: URL, maxDepth: Int, currentDepth: Int = 0) -> URL? {
        guard currentDepth < maxDepth else { return nil }
        let fm = FileManager.default
        guard let items = try? fm.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil) else { return nil }
        for item in items {
            var isDir: ObjCBool = false
            guard fm.fileExists(atPath: item.path, isDirectory: &isDir) else { continue }
            if !isDir.boolValue && item.lastPathComponent == name {
                return item
            }
            if isDir.boolValue, let found = findFileRecursive(named: name, in: item, maxDepth: maxDepth, currentDepth: currentDepth + 1) {
                return found
            }
        }
        return nil
    }

    /// 检测游戏类型（MV / MZ / 未知）
    static func detectGameType(in root: URL) -> String {
        let fm = FileManager.default
        // MZ 特征：www/js/rpg_core.js 里有 "RPG Maker MZ" 或 System.json 有 "encryptionKey"
        let systemJSON = root.appendingPathComponent("www").appendingPathComponent("data").appendingPathComponent("System.json")
        if fm.fileExists(atPath: systemJSON.path),
           let data = try? Data(contentsOf: systemJSON),
           let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            if json["encryptionKey"] != nil { return "MZ (encrypted)" }
            if let version = json["engineVersion"] as? String, version.contains("MZ") { return "MZ" }
        }
        // MV 特征：www/js/rpg_core.js
        let rpgCore = root.appendingPathComponent("www").appendingPathComponent("js").appendingPathComponent("rpg_core.js")
        if fm.fileExists(atPath: rpgCore.path) {
            if let content = try? String(contentsOf: rpgCore, encoding: .utf8),
               content.contains("RPG Maker MZ") { return "MZ" }
            return "MV"
        }
        // 根目录直接有 js/rpg_core.js（非标准布局）
        let rootCore = root.appendingPathComponent("js").appendingPathComponent("rpg_core.js")
        if fm.fileExists(atPath: rootCore.path) { return "MV (root layout)" }
        return "Unknown"
    }
}
