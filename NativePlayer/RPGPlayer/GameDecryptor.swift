import Foundation

/// RPG Maker MV/MZ 加密资源解密。
/// 加密格式：.rpgmvp(图片) / .rpgmvo(音频) / .rpgmvm(影片)
///   = 16 字节 "RPGMV" 头 + XOR(循环 encryptionKey) 数据
/// key 来源：MZ 在 www/data/System.json 的 "encryptionKey"(32 位 hex)；
///          MV 在 www/data/Encryptionkey.js 的 $encryptionKey = [0x.., ...] 数字数组。
/// 预解密方案：把加密文件解密为真实格式(png/jpg/gif/webp/ogg/m4a/mp3/wav/mp4)并删除加密原件，
///   同时把 System.json 的 hasEncryptedImages/Audio/Movies 置 false ——
///   游戏 JS 随即按原扩展名请求，加载完全正常，运行时零开销。
final class GameDecryptor {

    static func needsDecryption(in root: URL) -> Bool {
        guard let it = FileManager.default.enumerator(
            at: root, includingPropertiesForKeys: nil, options: [.skipsHiddenFiles]) else { return false }
        for case let url as URL in it
        where ["rpgmvp", "rpgmvo", "rpgmvm"].contains(url.pathExtension.lowercased()) {
            return true
        }
        return false
    }

    @discardableResult
    static func decryptIfNeeded(in root: URL) -> (files: Int, ok: Bool) {
        guard needsDecryption(in: root) else { return (0, true) }
        guard let key = loadKey(in: root) else {
            CrashReporter.log("decrypt aborted: no key found")
            return (0, false)
        }
        var count = 0
        var fallbackCount = 0
        var failed: [String] = []
        let fm = FileManager.default
        guard let it = fm.enumerator(
            at: root, includingPropertiesForKeys: nil, options: [.skipsHiddenFiles]) else { return (0, false) }
        for case let url as URL in it {
            let ext = url.pathExtension.lowercased()
            guard ["rpgmvp", "rpgmvo", "rpgmvm"].contains(ext),
                  let data = try? Data(contentsOf: url) else { continue }
            // 先算 XOR 结果，用于判断是否回退
            let body = data.dropFirst(16)
            var xorResult = Data(count: body.count)
            let kc = key.count
            body.enumerated().forEach { i, b in xorResult[i] = kc > 0 ? b ^ key[i % kc] : b }
            let didFallback = (data.first != 0 && !isValidMagic(xorResult))
            guard let plain = decrypt(data, key: key) else {
                failed.append(url.lastPathComponent)
                continue
            }
            if didFallback { fallbackCount += 1 }
            let realExt = magicExtension(plain, kind: ext)
            let dest = url.deletingPathExtension().appendingPathExtension(realExt)
            if dest.path != url.path {
                if fm.fileExists(atPath: dest.path) { try? fm.removeItem(at: dest) }
                if (try? plain.write(to: dest, options: .atomic)) != nil {
                    try? fm.removeItem(at: url)
                    count += 1
                } else {
                    failed.append(url.lastPathComponent)
                }
            }
        }
        disableEncryptionFlags(in: root)
        var log = "decrypted \(count) files"
        if fallbackCount > 0 { log += " (magic-fallback: \(fallbackCount))" }
        if !failed.isEmpty { log += " failed: \(failed.prefix(10).joined(separator: ", "))\(failed.count > 10 ? "..." : "")" }
        CrashReporter.log(log)
        return (count, true)
    }

    /// 读取加密 key：优先 System.json 的 encryptionKey(32 位 hex)，其次 MV 的 Encryptionkey.js 数字数组
    static func loadKey(in root: URL) -> [UInt8]? {
        if let system = findFile(named: "System.json", under: root),
           let data = try? Data(contentsOf: system),
           let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let hex = json["encryptionKey"] as? String {
            var key: [UInt8] = []
            var h = hex.trimmingCharacters(in: .whitespacesAndNewlines)
            while h.count >= 2 {
                let sub = String(h.prefix(2))
                if let v = UInt8(sub, radix: 16) { key.append(v) }
                h = String(h.dropFirst(2))
            }
            if !key.isEmpty {
                CrashReporter.log("decrypt key from System.json: \(key.count) bytes")
                return key
            }
        }
        if let ek = findFile(named: "Encryptionkey.js", under: root),
           let txt = try? String(contentsOf: ek, encoding: .utf8) {
            // 只提取 $encryptionKey = [ ... ] 数组内的内容，避免匹配到代码里的其他数字
            if let range = txt.range(of: #"\$encryptionKey\s*=\s*\[(.*?)\]"#, options: .regularExpression) {
                let arrayContent = String(txt[range])
                let pattern = "0[xX][0-9a-fA-F]+|[0-9]+"
                if let regex = try? NSRegularExpression(pattern: pattern) {
                    let ns = arrayContent as NSString
                    let ms = regex.matches(in: arrayContent, range: NSRange(location: 0, length: ns.length))
                    var key: [UInt8] = []
                    for m in ms {
                        let token = ns.substring(with: m.range)
                        if token.lowercased().hasPrefix("0x") {
                            if let v = UInt8(token.dropFirst(2), radix: 16) { key.append(v) }
                        } else if let v = UInt8(token) { key.append(v) }
                    }
                    if !key.isEmpty {
                        CrashReporter.log("decrypt key from Encryptionkey.js: \(key.count) bytes")
                        return key
                    }
                }
            }
            // 兜底：旧的全文匹配（兼容非标准写法）
            let pattern = "0[xX][0-9a-fA-F]+|[0-9]+"
            if let regex = try? NSRegularExpression(pattern: pattern) {
                let ns = txt as NSString
                let ms = regex.matches(in: txt, range: NSRange(location: 0, length: ns.length))
                var key: [UInt8] = []
                for m in ms {
                    let token = ns.substring(with: m.range)
                    if token.lowercased().hasPrefix("0x") {
                        if let v = UInt8(token.dropFirst(2), radix: 16) { key.append(v) }
                    } else if let v = UInt8(token) { key.append(v) }
                }
                if !key.isEmpty {
                    CrashReporter.log("decrypt key from Encryptionkey.js (fallback): \(key.count) bytes")
                    return key
                }
            }
        }
        CrashReporter.log("decrypt key NOT FOUND")
        return nil
    }

    /// 解密：去 16 字节头 + XOR 循环 key（与 rpg_core.js 算法一致）。
    /// 关键：第一字节为 0 表示该文件未加密（16 字节全 0 头 + 原数据），只去头不做 XOR；
    /// 否则为 "RPGMV" 头 + XOR 加密数据。
    /// 加固：XOR 后验证魔数，若不是有效图片/音频格式，回退只去头（防止 key 读错导致全坏）。
    static func decrypt(_ data: Data, key: [UInt8]) -> Data? {
        guard data.count > 16 else { return nil }
        let body = data.dropFirst(16)
        // 未加密文件（全 0 头）：只去头，保持原数据不变
        if data.first == 0 { return Data(body) }
        // XOR 解密
        var out = Data(count: body.count)
        let kc = key.count
        body.enumerated().forEach { i, b in
            out[i] = kc > 0 ? b ^ key[i % kc] : b
        }
        // 魔数验证：如果 XOR 后不是有效格式，回退只去头（可能该文件实际未加密但头非0）
        if !isValidMagic(out) {
            return Data(body)
        }
        return out
    }

    /// 验证解密后数据是否为有效图片/音频/视频魔数
    private static func isValidMagic(_ d: Data) -> Bool {
        let b = [UInt8](d.prefix(16))
        guard !b.isEmpty else { return false }
        // PNG
        if b.count >= 8, b[0] == 0x89, b[1] == 0x50, b[2] == 0x4E, b[3] == 0x47 { return true }
        // JPEG
        if b.count >= 3, b[0] == 0xFF, b[1] == 0xD8, b[2] == 0xFF { return true }
        // GIF
        if b.count >= 6, (b[0...5] == [0x47,0x49,0x46,0x38,0x39,0x61] || b[0...5] == [0x47,0x49,0x46,0x38,0x37,0x61]) { return true }
        // WEBP (RIFF....WEBP)
        if b.count >= 12, b[0...3] == [0x52,0x49,0x46,0x46], b[8...11] == [0x57,0x45,0x42,0x50] { return true }
        // OGG (OggS)
        if b.count >= 4, b[0...3] == [0x4F,0x67,0x67,0x53] { return true }
        // M4A/MP4 (....ftyp)
        if b.count >= 8, b[4...7] == [0x66,0x74,0x79,0x70] { return true }
        // MP3 (ID3 or 0xFF 0xFB)
        if b.count >= 3, (b[0] == 0x49 && b[1] == 0x44 && b[2] == 0x33) || (b[0] == 0xFF && b[1] == 0xFB) { return true }
        // WAV (RIFF....WAVE)
        if b.count >= 12, b[0...3] == [0x52,0x49,0x46,0x46], b[8...11] == [0x57,0x41,0x56,0x45] { return true }
        return false
    }

    /// 按加密源类别 + 解密后魔数判断真实扩展名
    static func magicExtension(_ d: Data, kind: String) -> String {
        let b = [UInt8](d.prefix(16))
        func ascii(_ r: Range<Int>) -> String {
            var s = ""
            for i in r where i < b.count { s.append(Character(UnicodeScalar(b[i]))) }
            return s
        }
        switch kind {
        case "rpgmvp":
            if b.count >= 8, b[0] == 0x89, b[1] == 0x50, b[2] == 0x4E, b[3] == 0x47 { return "png" }
            if b.count >= 3, b[0] == 0xFF, b[1] == 0xD8, b[2] == 0xFF { return "jpg" }
            if ascii(0..<6) == "GIF89a" || ascii(0..<6) == "GIF87a" { return "gif" }
            if ascii(0..<4) == "RIFF" && ascii(8..<12) == "WEBP" { return "webp" }
            return "png"
        case "rpgmvo":
            if ascii(0..<4) == "OggS" { return "ogg" }
            if b.count >= 8, ascii(4..<8) == "ftyp" { return "m4a" }
            if b.count >= 3, b[0] == 0x49, b[1] == 0x44, b[2] == 0x33 { return "mp3" }
            if ascii(0..<4) == "RIFF" && ascii(8..<12) == "WAVE" { return "wav" }
            return "m4a"
        case "rpgmvm":
            return "mp4"
        default:
            return "bin"
        }
    }

    /// 把 System.json 的 hasEncrypted* 全部置 false（游戏 JS 随即按原扩展名请求）
    static func disableEncryptionFlags(in root: URL) {
        guard let system = findFile(named: "System.json", under: root),
              let data = try? Data(contentsOf: system),
              var json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return }
        json["hasEncryptedImages"] = false
        json["hasEncryptedAudio"] = false
        json["hasEncryptedMovies"] = false
        if let out = try? JSONSerialization.data(withJSONObject: json, options: [.prettyPrinted, .sortedKeys]) {
            try? out.write(to: system, options: .atomic)
        }
    }

    /// 定位配置文件：优先 www/data、data、www 下，兜底递归搜
    static func findFile(named name: String, under root: URL) -> URL? {
        let candidates = [
            root.appendingPathComponent("www/data/\(name)"),
            root.appendingPathComponent("data/\(name)"),
            root.appendingPathComponent("www/\(name)")
        ]
        for c in candidates where FileManager.default.fileExists(atPath: c.path) { return c }
        if let it = FileManager.default.enumerator(
            at: root, includingPropertiesForKeys: nil, options: [.skipsHiddenFiles]) {
            for case let url as URL in it where url.lastPathComponent.lowercased() == name.lowercased() {
                return url
            }
        }
        return nil
    }
}
