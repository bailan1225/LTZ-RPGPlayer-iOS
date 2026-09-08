import Foundation
import Compression

/// 极简只读 ZIP 解压器（游戏包通用场景）
/// 支持：stored(0) / deflate(8)；UTF-8 与 Shift-JIS 文件名；无加密、无分卷。
/// 解压用系统 Compression 框架（COMPRESSION_ZLIB），零第三方依赖。
enum ZipExtractor {

    struct Entry {
        let name: String
        let isDir: Bool
        let method: UInt16
        let csize: UInt64
        let usize: UInt64
        let localOffset: UInt64
    }

    /// Documents 根目录下待导入的 zip（跳过隐藏文件）
    static func pendingZips(in dir: URL) -> [URL] {
        let fm = FileManager.default
        guard let items = try? fm.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil) else { return [] }
        return items
            .filter { $0.pathExtension.lowercased() == "zip" }
            .filter { !$0.lastPathComponent.hasPrefix(".") }
            .sorted { $0.lastPathComponent < $1.lastPathComponent }
    }

    /// 解压 zip 到 dest（dest 需已存在），返回解压出的文件数
    @discardableResult
    static func extract(_ zip: URL, to dest: URL) throws -> Int {
        let data = try Data(contentsOf: zip)
        let entries = try readCentralDirectory(data)
        let fm = FileManager.default
        var count = 0
        for e in entries {
            // 路径穿越防护：绝对路径 / 上级目录一律跳过
            if e.name.hasPrefix("/") || e.name.contains("../") { continue }
            let target = dest.appendingPathComponent(e.name)
            if e.isDir {
                try? fm.createDirectory(at: target, withIntermediateDirectories: true)
                continue
            }
            try? fm.createDirectory(at: target.deletingLastPathComponent(), withIntermediateDirectories: true)
            let payload = try readEntryData(data, e)
            try payload.write(to: target, options: .atomic)
            count += 1
        }
        return count
    }

    /// 在解压目录中定位游戏根：自身是游戏根则返回自身，否则 BFS 找第一个含 www/index.html 的子目录
    static func locateGameRoot(in dir: URL) -> URL? {
        let fm = FileManager.default
        if GameDetector.isGameDir(dir) { return dir }
        var queue = [dir]
        var i = 0
        while i < queue.count {
            let d = queue[i]
            i += 1
            guard let items = try? fm.contentsOfDirectory(at: d, includingPropertiesForKeys: nil) else { continue }
            for item in items {
                var isDir: ObjCBool = false
                guard fm.fileExists(atPath: item.path, isDirectory: &isDir), isDir.boolValue else { continue }
                if GameDetector.isGameDir(item) { return item }
                queue.append(item)
            }
        }
        return nil
    }

    // MARK: - ZIP 结构解析

    private static func readCentralDirectory(_ data: Data) throws -> [Entry] {
        let tail = data.count
        guard tail >= 22 else { throw ZipError.badArchive("文件太小") }
        let maxScan = min(tail, 65557)
        var eocd = -1
        var i = tail - 22
        while i >= tail - maxScan {
            if i >= 0, data[i] == 0x50, data[i + 1] == 0x4b, data[i + 2] == 0x05, data[i + 3] == 0x06 {
                eocd = i
                break
            }
            i -= 1
        }
        guard eocd >= 0 else { throw ZipError.badArchive("未找到目录") }
        let total = Int(u16(data, eocd + 10))
        let cdSize = Int(u32(data, eocd + 12))
        let cdOffset = Int(u32(data, eocd + 16))
        guard cdOffset >= 0, cdSize >= 0, cdOffset + cdSize <= tail else {
            throw ZipError.badArchive("目录越界")
        }
        var entries: [Entry] = []
        var pos = cdOffset
        let cdEnd = cdOffset + cdSize
        var seen = 0
        while pos + 46 <= cdEnd, seen < total {
            guard data[pos] == 0x50, data[pos + 1] == 0x4b,
                  data[pos + 2] == 0x01, data[pos + 3] == 0x02 else {
                throw ZipError.badArchive("目录条目损坏")
            }
            let method = u16(data, pos + 10)
            let csizeRaw = u32(data, pos + 20)
            let usizeRaw = u32(data, pos + 24)
            let nameLen = Int(u16(data, pos + 28))
            let extraLen = Int(u16(data, pos + 30))
            let commentLen = Int(u16(data, pos + 32))
            let localOffsetRaw = u32(data, pos + 42)
            guard pos + 46 + nameLen <= data.count else { throw ZipError.badArchive("条目名越界") }
            // ZIP64 标记（>4GB）暂不支持，明确报错
            if csizeRaw == 0xFFFFFFFF || usizeRaw == 0xFFFFFFFF || localOffsetRaw == 0xFFFFFFFF {
                throw ZipError.unsupported("ZIP64（超大压缩包）暂不支持")
            }
            let nameData = data.subdata(in: (pos + 46)..<(pos + 46 + nameLen))
            let name = decodeName(nameData)
            entries.append(Entry(
                name: name,
                isDir: name.hasSuffix("/"),
                method: method,
                csize: UInt64(csizeRaw),
                usize: UInt64(usizeRaw),
                localOffset: UInt64(localOffsetRaw)))
            pos += 46 + nameLen + extraLen + commentLen
            seen += 1
        }
        return entries
    }

    private static func readEntryData(_ data: Data, _ e: Entry) throws -> Data {
        guard e.method == 0 || e.method == 8 else {
            throw ZipError.unsupported("压缩方式 \(e.method) 不支持")
        }
        let off = Int(e.localOffset)
        guard off >= 0, off + 30 <= data.count,
              data[off] == 0x50, data[off + 1] == 0x4b,
              data[off + 2] == 0x03, data[off + 3] == 0x04 else {
            throw ZipError.badArchive("本地头损坏")
        }
        let nameLen = Int(u16(data, off + 26))
        let extraLen = Int(u16(data, off + 28))
        let dataStart = off + 30 + nameLen + extraLen
        let csize = Int(e.csize)
        guard dataStart + csize <= data.count else { throw ZipError.badArchive("数据越界") }
        let payload = data.subdata(in: dataStart..<(dataStart + csize))
        if e.method == 0 { return payload }
        return try inflate(payload, expected: Int(e.usize))
    }

    private static func inflate(_ src: Data, expected: Int) throws -> Data {
        var out = Data(count: expected)
        let written = out.withUnsafeMutableBytes { (dp: UnsafeMutableRawBufferPointer) -> Int in
            src.withUnsafeBytes { (sp: UnsafeRawBufferPointer) -> Int in
                guard let db = dp.bindMemory(to: UInt8.self).baseAddress,
                      let sb = sp.bindMemory(to: UInt8.self).baseAddress else { return 0 }
                return compression_decode_buffer(db, expected, sb, src.count, nil, COMPRESSION_ZLIB)
            }
        }
        guard written > 0 else { throw ZipError.badArchive("解压失败（数据可能损坏）") }
        return written == expected ? out : Data(out.prefix(written))
    }

    /// zip 文件名编码：优先 UTF-8，回退 Shift-JIS（日文老游戏常见）
    private static func decodeName(_ d: Data) -> String {
        if let s = String(data: d, encoding: .utf8) { return s }
        if let s = String(data: d, encoding: .shiftJIS) { return s }
        return String(decoding: d, as: UTF8.self)
    }

    enum ZipError: Error, LocalizedError {
        case badArchive(String)
        case unsupported(String)
        var errorDescription: String? {
            switch self {
            case .badArchive(let m), .unsupported(let m): return m
            }
        }
    }

    // MARK: - 字节读取（小端）

    private static func u16(_ d: Data, _ i: Int) -> UInt16 {
        UInt16(d[i]) | (UInt16(d[i + 1]) << 8)
    }

    private static func u32(_ d: Data, _ i: Int) -> UInt32 {
        UInt32(d[i]) | (UInt32(d[i + 1]) << 8) | (UInt32(d[i + 2]) << 16) | (UInt32(d[i + 3]) << 24)
    }
}
