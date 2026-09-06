import Foundation

/// WKWebView file:// 特殊字符安全路径
/// 游戏目录名含 [ ] 空格等字符时，file URL 相对资源加载会失败（知名 WKWebView 问题），
/// 这里为游戏目录建立无特殊字符的符号链接，加载时使用链接路径
enum SafePath {

    private static var cacheDir: URL {
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        return docs.appendingPathComponent(".rpgcache", isDirectory: true)
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

    /// 为游戏目录建立符号链接，返回链接目录；失败返回 nil
    static func link(for gameDir: URL) -> URL? {
        let fm = FileManager.default
        try? fm.createDirectory(at: cacheDir, withIntermediateDirectories: true)
        let link = cacheDir.appendingPathComponent("g\(stableHash(gameDir.path) % 1000000)")
        try? fm.removeItem(at: link)
        do {
            try fm.createSymbolicLink(at: link, withDestinationURL: gameDir)
            return link
        } catch {
            return nil
        }
    }
}
