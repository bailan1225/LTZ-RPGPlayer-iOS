import Foundation

/// WKWebView file:// 特殊字符安全路径
/// 游戏目录名含 [ ] 空格等字符时，file URL 相对资源加载会失败（知名 WKWebView 问题，符号链接也不可靠），
/// 这里把含特殊字符的游戏目录自动重命名为纯英文数字安全名（同卷原子移动，瞬间完成、不占空间），
/// 原名记录在映射表中，列表仍显示原名
enum SafePath {

    private static var docs: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }

    private static var mapURL: URL {
        docs.appendingPathComponent(".rpgcache/names.json")
    }

    private static var nameMap: [String: String] = {
        guard let d = try? Data(contentsOf: mapURL),
              let obj = try? JSONSerialization.jsonObject(with: d) as? [String: String] else { return [:] }
        return obj
    }()

    private static func saveMap() {
        if let d = try? JSONSerialization.data(withJSONObject: nameMap) {
            try? d.write(to: mapURL, options: .atomic)
        }
    }

    /// 路径是否含危险字符（方括号/井号/百分号/问号/空格）
    static func containsUnsafeChars(_ url: URL) -> Bool {
        let bad = CharacterSet(charactersIn: "[]#%? ")
        return url.path.unicodeScalars.contains { bad.contains($0) }
    }

    /// 稳定的路径哈希（不使用 hashValue，跨进程稳定）
    static func stableHash(_ s: String) -> UInt64 {
        var h: UInt64 = 5381
        for b in s.utf8 {
            h = ((h << 5) &+ h) &+ UInt64(b)
        }
        return h
    }

    /// 原名（若被自动重命名过）
    static func originalName(for url: URL) -> String? {
        nameMap[url.lastPathComponent]
    }

    /// 含特殊字符的目录自动重命名为安全名；无特殊字符或失败时原样返回
    static func sanitize(_ gameDir: URL) -> URL {
        guard containsUnsafeChars(gameDir) else { return gameDir }
        let fm = FileManager.default
        var safe = docs.appendingPathComponent("g\(stableHash(gameDir.path) % 1000000)")
        var n = 1
        while fm.fileExists(atPath: safe.path) {
            if nameMap[safe.lastPathComponent] == gameDir.lastPathComponent {
                return safe  // 已重命名过，幂等
            }
            n += 1
            safe = docs.appendingPathComponent("g\(stableHash(gameDir.path) % 1000000)_\(n)")
        }
        do {
            try fm.moveItem(at: gameDir, to: safe)
            nameMap[safe.lastPathComponent] = gameDir.lastPathComponent
            saveMap()
            return safe
        } catch {
            return gameDir
        }
    }
}
