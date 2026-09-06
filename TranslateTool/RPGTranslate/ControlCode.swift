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

    /// 拆分文本为 控制码段 + 普通文本段
    /// 注意：%1 这类占位符**不拆分**（随文本一起交给翻译引擎，多数引擎会原样保留），
    /// 只拆分 \X 系列控制码。使用线性逐字符扫描，不用正则（避免任何回溯性能风险）
    static func split(_ text: String) -> [Part] {
        var parts: [Part] = []
        var plain = ""
        func flush() {
            if !plain.isEmpty {
                parts.append(Part(isCode: false, value: plain))
                plain = ""
            }
        }
        let chars = Array(text)
        var i = 0
        let n = chars.count
        while i < n {
            let c = chars[i]
            if c != "\\" || i + 1 >= n {
                plain.append(c)
                i += 1
                continue
            }
            let next = chars[i + 1]
            var consumed = 0
            if next.isLetter {
                // \X 或 \X[参数]：字母连续读取
                var j = i + 2
                while j < n && chars[j].isLetter { j += 1 }
                if j < n && chars[j] == "[" {
                    var k = j + 1
                    while k < n && chars[k] != "]" { k += 1 }
                    consumed = (k < n) ? (k + 1) : j  // 未闭合 [ 时只吞 \X
                } else {
                    consumed = j
                }
            } else if "\\^|!><{}$.".contains(next) {
                consumed = i + 2
            }
            if consumed > 0 {
                flush()
                parts.append(Part(isCode: true, value: String(chars[i..<consumed])))
                i = consumed
            } else {
                plain.append(c)
                i += 1
            }
        }
        flush()
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
