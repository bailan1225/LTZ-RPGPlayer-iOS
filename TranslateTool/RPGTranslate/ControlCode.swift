import Foundation

/// RPG Maker 文本控制码拆分与重组
/// 支持：\N[1] \V[1] \C[1] \I[1] \P[1] \X[5] \T[1] \S[n] 等（字母+参数）
///       \G \$ \. \^ \| \! \> \< \{ \} 等（单字符）
///       %1 %2 等占位符（游戏消息参数，翻译时必须原样保留）
enum ControlCode {

    /// 一个分段：isCode=true 表示控制码/占位符原文（不翻译），false 为普通文本
    struct Part {
        let isCode: Bool
        let value: String
    }

    private static let pattern = try! NSRegularExpression(
        pattern: "\\([A-Za-z]+)\\[[^\\]]*\\]|\\\\[A-Za-z]|\\.",
        options: [])

    /// 拆分文本为 控制码段 + 普通文本段
    /// 注意：%1 这类占位符**不拆分**（随文本一起交给翻译引擎，多数引擎会原样保留），
    /// 只拆分 \X 系列控制码
    static func split(_ text: String) -> [Part] {
        var parts: [Part] = []
        let ns = text as NSString
        let range = NSRange(location: 0, length: ns.length)
        var last = 0
        for m in pattern.matches(in: text, range: range) {
            if m.range.location > last {
                parts.append(Part(isCode: false, value: ns.substring(with: NSRange(location: last, length: m.range.location - last))))
            }
            parts.append(Part(isCode: true, value: ns.substring(with: m.range)))
            last = m.range.location + m.range.length
        }
        if last < ns.length {
            parts.append(Part(isCode: false, value: ns.substring(with: NSRange(location: last, length: ns.length - last))))
        }
        return parts
    }

    /// 提取纯文本（去掉控制码与占位符）
    static func plain(of text: String) -> String {
        split(text)
            .filter { !$0.isCode }
            .map { $0.value }
            .joined(separator: "\u{1}")
    }

    /// 用译文重组：控制码原样保留，普通文本段按译文替换
    static func recombine(original: String, translation: String) -> String {
        let parts = split(original)
        let translatedPlain = split(translation)
            .filter { !$0.isCode }
            .map { $0.value }
        var i = 0
        var out = ""
        for p in parts {
            if p.isCode {
                out += p.value
            } else {
                if i < translatedPlain.count && !translatedPlain[i].isEmpty {
                    out += translatedPlain[i]
                } else {
                    out += p.value
                }
                i += 1
            }
        }
        return out
    }
}
