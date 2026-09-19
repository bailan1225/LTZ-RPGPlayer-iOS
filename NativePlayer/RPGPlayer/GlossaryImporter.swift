import Foundation

/// 外部翻译词库导入器（MTool / @parvineyvazov/json-translator 等导出的 {原文: 译文} JSON）。
///
/// MTool 词库的键常出现在运行时阶段：控制码被抽成成串的 ESC（\u{1B}）占位块（多在句尾），
/// 而本 App 的批量写回（ControlCode.plain）与运行时词典（translator.js）都按「反斜杠控制码剥离、
/// 纯文本」口径匹配。导入时统一归一化，保证三种来源口径一致：
///   1. 键：删除 ESC 占位块后取 ControlCode.plain，与 data 内文本的 plain 相同；
///   2. 值：删除 ESC 占位块，保留译文语序与 %1、\V[1] 等（若有），交给 recombine；
///   3. 额外存一份「空白折叠」键，命中运行时的 normed 查询。
/// 导入结果写入 Documents/translations/<原文件名>.json：
///   - 运行时：TranslatorConfig 合并 translations/*.json 注入，播放游戏离线命中、不联网；
///   - 批量翻译：DataTranslator.overrides() 合并 translations/*.json，命中直接采用、不发请求。
enum GlossaryImporter {

    struct Outcome {
        var entries: Int = 0       // 去重后写入词条数
        var rawPairs: Int = 0      // 文件中「值≠原文」的有效对数
        var skipped: Int = 0       // 跳过（空 / 未译 / 无法解析）
        var fileName: String = ""
    }

    enum ImportError: LocalizedError {
        case notJSON
        case noTranslations
        var errorDescription: String? {
            switch self {
            case .notJSON:
                return "不是有效的词库文件（应为 JSON，且内容是 {原文: 译文} 的对象）"
            case .noTranslations:
                return "没有可导入的译文：词库似乎还没翻译（译文与原文相同）或为空"
            }
        }
    }

    /// 删除连续 ESC（MTool 控制码占位块）
    private static func stripESC(_ s: String) -> String {
        s.replacingOccurrences(of: "\u{1B}+", with: "", options: .regularExpression)
    }

    /// 词库键归一化：去 ESC 后取 ControlCode.plain（与批量写回 / 运行时 plain 口径一致）
    private static func normalizeKey(_ s: String) -> String {
        ControlCode.plain(of: stripESC(s)).trimmingCharacters(in: .whitespacesAndNewlines)
    }

    /// 词库值归一化：去 ESC（MTool 占位），保留译文与其中的变量/控制码，首尾去空白
    private static func normalizeValue(_ s: String) -> String {
        stripESC(s).trimmingCharacters(in: .whitespacesAndNewlines)
    }

    /// 从已解析 JSON 中取出 [String: String] 词库；兼容顶层对象与常见包裹键
    private static func dictionary(from obj: Any) -> [String: String]? {
        if let d = obj as? [String: String] { return d }
        if let root = obj as? [String: Any] {
            for key in ["translations", "data", "dictionary", "mapping", "dict"] {
                if let d = root[key] as? [String: String] { return d }
            }
        }
        return nil
    }

    /// 解析并归一化词库数据（纯函数，便于测试）
    static func normalize(jsonData: Data) -> (dict: [String: String], rawPairs: Int, skipped: Int)? {
        guard let root = try? JSONSerialization.jsonObject(with: jsonData),
              let raw = dictionary(from: root) else { return nil }
        var out: [String: String] = [:]
        var rawPairs = 0
        var skipped = 0
        for (k, v) in raw {
            let key = normalizeKey(k)
            let val = normalizeValue(v)
            // 值与原文相同 = 未译；空键/空值跳过
            if key.isEmpty || val.isEmpty || v == k {
                skipped += 1
                continue
            }
            rawPairs += 1
            out[key] = val
            // 空白折叠键：命中运行时 translator.js 的 normed 查询
            let normKey = key
                .replacingOccurrences(of: "\\s+", with: " ", options: .regularExpression)
                .trimmingCharacters(in: .whitespacesAndNewlines)
            if normKey != key && !normKey.isEmpty && out[normKey] == nil {
                out[normKey] = val
            }
        }
        return (out, rawPairs, skipped)
    }

    /// 读取文件选择器返回的词库文件，归一化后写入 Documents/translations/<原名>.json（重名覆盖，便于更新）
    static func importFile(at src: URL) throws -> Outcome {
        let accessing = src.startAccessingSecurityScopedResource()
        defer { if accessing { src.stopAccessingSecurityScopedResource() } }

        let data: Data
        do {
            data = try Data(contentsOf: src)
        } catch {
            throw ImportError.notJSON
        }
        guard let parsed = normalize(jsonData: data) else { throw ImportError.notJSON }
        guard !parsed.dict.isEmpty else { throw ImportError.noTranslations }

        let fm = FileManager.default
        let docs = fm.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let dir = docs.appendingPathComponent("translations", isDirectory: true)
        try fm.createDirectory(at: dir, withIntermediateDirectories: true)

        var name = src.deletingPathExtension().lastPathComponent.trimmingCharacters(in: .whitespaces)
        if name.isEmpty { name = "imported" }
        let dest = dir.appendingPathComponent(name + ".json")
        let outData = try JSONSerialization.data(withJSONObject: parsed.dict, options: [.prettyPrinted])
        try outData.write(to: dest, options: .atomic)

        var o = Outcome()
        o.entries = parsed.dict.count
        o.rawPairs = parsed.rawPairs
        o.skipped = parsed.skipped
        o.fileName = dest.lastPathComponent
        return o
    }
}
