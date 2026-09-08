import Foundation

/// 极简 ZIP 打包器（stored 模式，流式写入，内存安全）
/// 支持：UTF-8 文件名（flag bit 11）、增量 CRC32 查表、分块拷贝大文件。
/// 用于把翻译后的游戏导出为 zip，供第三方 RPG Maker Player（RPG Pocket / QuestPlay / RPGEmu 等）导入运行。
enum ZipWriter {

    struct Item {
        let relPath: String
        let url: URL
    }

    /// 递归收集根目录下所有文件（相对路径）
    static func collectFiles(in root: URL) -> [Item] {
        let fm = FileManager.default
        var items: [Item] = []
        var stack = [root]
        let rootPath = root.path
        while let dir = stack.popLast() {
            guard let subs = try? fm.contentsOfDirectory(
                at: dir, includingPropertiesForKeys: nil, options: [.skipsHiddenFiles]) else { continue }
            for sub in subs {
                var isDir: ObjCBool = false
                guard fm.fileExists(atPath: sub.path, isDirectory: &isDir) else { continue }
                if isDir.boolValue {
                    stack.append(sub)
                } else {
                    let rel = sub.path.hasPrefix(rootPath + "/")
                        ? String(sub.path.dropFirst((rootPath + "/").count))
                        : sub.lastPathComponent
                    items.append(Item(relPath: rel, url: sub))
                }
            }
        }
        return items.sorted { $0.relPath < $1.relPath }
    }

    /// 创建 stored 模式 zip（不压缩，流式拷贝，适合大游戏）
    static func createStoredZip(items: [Item], to zipURL: URL) throws {
        try? FileManager.default.removeItem(at: zipURL)
        guard FileManager.default.createFile(atPath: zipURL.path, contents: nil) else {
            throw ZipWriterError.cannotCreate
        }
        let out = try FileHandle(forWritingTo: zipURL)
        defer { try? out.close() }
        let dos = dosDateTime(Date())
        var central: [Data] = []
        var offset: UInt64 = 0
        for item in items {
            let nameData = Data(item.relPath.utf8)
            let size = ((try? FileManager.default.attributesOfItem(atPath: item.url.path)[.size] as? NSNumber)??.int64Value) ?? 0
            let crc = try crc32OfFile(item.url)
            let lh = localHeader(name: nameData, crc: crc, size: size, dosTime: dos.time, dosDate: dos.date)
            try out.write(contentsOf: lh)
            try copyFile(item.url, to: out)
            central.append(centralHeader(name: nameData, crc: crc, size: size, dosTime: dos.time, dosDate: dos.date, offset: offset))
            offset += UInt64(lh.count) + UInt64(size)
        }
        let cdStart = offset
        for c in central {
            try out.write(contentsOf: c)
            offset += UInt64(c.count)
        }
        try out.write(contentsOf: eocdRecord(entries: central.count, cdSize: Int(offset - cdStart), cdOffset: Int(cdStart)))
    }

    enum ZipWriterError: Error, LocalizedError {
        case cannotCreate
        var errorDescription: String? { "无法创建输出文件" }
    }

    // MARK: - 记录构造

    private static func localHeader(name: Data, crc: UInt32, size: Int64, dosTime: UInt16, dosDate: UInt16) -> Data {
        var d = Data()
        d.append(Data([0x50, 0x4B, 0x03, 0x04]))
        d.append(u16(20))            // version needed 2.0
        d.append(u16(0x0800))        // flags: UTF-8 文件名
        d.append(u16(0))             // method: stored
        d.append(u16(dosTime))
        d.append(u16(dosDate))
        d.append(u32(crc))
        d.append(u32(UInt32(size)))
        d.append(u32(UInt32(size)))
        d.append(u16(UInt16(name.count)))
        d.append(u16(0))             // extra len
        d.append(name)
        return d
    }

    private static func centralHeader(name: Data, crc: UInt32, size: Int64, dosTime: UInt16, dosDate: UInt16, offset: UInt64) -> Data {
        var d = Data()
        d.append(Data([0x50, 0x4B, 0x01, 0x02]))
        d.append(u16(20))            // version made by
        d.append(u16(20))            // version needed
        d.append(u16(0x0800))        // flags: UTF-8
        d.append(u16(0))             // method: stored
        d.append(u16(dosTime))
        d.append(u16(dosDate))
        d.append(u32(crc))
        d.append(u32(UInt32(size)))
        d.append(u32(UInt32(size)))
        d.append(u16(UInt16(name.count)))
        d.append(u16(0))             // extra len
        d.append(u16(0))             // comment len
        d.append(u16(0))             // disk
        d.append(u16(0))             // internal attr
        d.append(u32(0))             // external attr
        d.append(u32(UInt32(offset)))
        d.append(name)
        return d
    }

    private static func eocdRecord(entries: Int, cdSize: Int, cdOffset: Int) -> Data {
        var d = Data()
        d.append(Data([0x50, 0x4B, 0x05, 0x06]))
        d.append(u16(0))             // disk
        d.append(u16(0))             // cd disk
        d.append(u16(UInt16(entries)))
        d.append(u16(UInt16(entries)))
        d.append(u32(UInt32(cdSize)))
        d.append(u32(UInt32(cdOffset)))
        d.append(u16(0))             // comment len
        return d
    }

    // MARK: - 工具

    private static let crcTable: [UInt32] = {
        var t = [UInt32](repeating: 0, count: 256)
        for i in 0..<256 {
            var c = UInt32(i)
            for _ in 0..<8 {
                c = (c & 1) != 0 ? (0xEDB88320 ^ (c >> 1)) : (c >> 1)
            }
            t[i] = c
        }
        return t
    }()

    private static func crc32OfFile(_ url: URL) throws -> UInt32 {
        let h = try FileHandle(forReadingFrom: url)
        defer { try? h.close() }
        var crc: UInt32 = 0xFFFFFFFF
        while true {
            let chunk = h.readData(ofLength: 1024 * 1024)
            if chunk.isEmpty { break }
            for b in chunk { crc = crcTable[Int((crc ^ UInt32(b)) & 0xFF)] ^ (crc >> 8) }
        }
        return crc ^ 0xFFFFFFFF
    }

    private static func copyFile(_ url: URL, to out: FileHandle) throws {
        let h = try FileHandle(forReadingFrom: url)
        defer { try? h.close() }
        while true {
            let chunk = h.readData(ofLength: 1024 * 1024)
            if chunk.isEmpty { break }
            try out.write(contentsOf: chunk)
        }
    }

    /// DOS 日期时间（zip 时间戳）
    private static func dosDateTime(_ d: Date) -> (time: UInt16, date: UInt16) {
        let c = Calendar(identifier: .gregorian).dateComponents([.year, .month, .day, .hour, .minute, .second], from: d)
        let y = UInt16(max(0, (c.year ?? 1980) - 1980))
        let mo = UInt16(c.month ?? 1)
        let da = UInt16(c.day ?? 1)
        let h = UInt16(c.hour ?? 0)
        let mi = UInt16(c.minute ?? 0)
        let se = UInt16((c.second ?? 0) / 2)
        let date = (y << 9) | (mo << 5) | da
        let time = (h << 11) | (mi << 5) | se
        return (time, date)
    }

    private static func u16(_ v: UInt16) -> Data {
        Data([UInt8(v & 0xFF), UInt8((v >> 8) & 0xFF)])
    }

    private static func u32(_ v: UInt32) -> Data {
        Data([UInt8(v & 0xFF), UInt8((v >> 8) & 0xFF), UInt8((v >> 16) & 0xFF), UInt8((v >> 24) & 0xFF)])
    }
}
