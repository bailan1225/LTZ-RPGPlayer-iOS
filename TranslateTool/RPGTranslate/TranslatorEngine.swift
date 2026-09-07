import Foundation

/// 翻译引擎配置（与播放器 App 的 key 保持一致，方便用户习惯复用）
enum TranslationEngine: Int {
    case offline = 0
    case mymemory = 1
    case custom = 2
}

struct TranslationConfig {
    var engine: TranslationEngine = .offline
    var source = "ja"
    var target = "zh-CN"
    var apiUrl = ""
    var apiKey = ""
    var prompt = ""   // 自定义 API 翻译风格提示词（AiNiee 思路），用 {prompt} 占位符附加
}

/// 批量翻译引擎：内置离线词典 + MyMemory 在线接口 + 自定义 API
/// 所有翻译结果增量缓存到 Documents/transCache/<target>.json，断点续翻
final class TranslatorEngine {

    let config: TranslationConfig

    private var dict: [String: String] = [:]
    private var cache: [String: String] = [:]
    private let cacheURL: URL
    private let session: URLSession
    private let maxTextLength = 450   // MyMemory 单条上限约 500 字符，留余量

    init(config: TranslationConfig) {
        self.config = config
        let fm = FileManager.default
        let docs = fm.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let cacheDir = docs.appendingPathComponent("transCache", isDirectory: true)
        try? fm.createDirectory(at: cacheDir, withIntermediateDirectories: true)
        cacheURL = cacheDir.appendingPathComponent("\(config.target).json")
        let s = URLSessionConfiguration.ephemeral
        s.timeoutIntervalForRequest = 20
        s.timeoutIntervalForResource = 40
        session = URLSession(configuration: s)
        loadDict()
        loadCache()
    }

    // MARK: - 词典

    /// 动态并入术语表/词典（两阶段翻译：术语结果并入后，对话自动命中）
    func mergeDict(_ m: [String: String]) {
        for (k, v) in m where !k.isEmpty && !v.isEmpty { dict[k] = v }
    }

    private func loadDict() {
        let fm = FileManager.default
        // 内置词典
        if let url = Bundle.main.url(forResource: "dict", withExtension: "json"),
           let data = try? Data(contentsOf: url),
           let obj = try? JSONSerialization.jsonObject(with: data) as? [String: String] {
            for (k, v) in obj { dict[k] = v }
        }
        // 用户自定义词典（Documents/dict.json 覆盖内置）
        let docs = fm.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let userDict = docs.appendingPathComponent("dict.json")
        if fm.fileExists(atPath: userDict.path),
           let data = try? Data(contentsOf: userDict),
           let obj = try? JSONSerialization.jsonObject(with: data) as? [String: String] {
            for (k, v) in obj { dict[k] = v }
        }
    }

    // MARK: - 缓存

    private func loadCache() {
        if let data = try? Data(contentsOf: cacheURL),
           let obj = try? JSONSerialization.jsonObject(with: data) as? [String: String] {
            cache = obj
        }
    }

    func saveCache() {
        guard let data = try? JSONSerialization.data(withJSONObject: cache) else { return }
        try? data.write(to: cacheURL, options: .atomic)
    }

    // MARK: - 主入口（回调必定在主线程或调用线程；nil = 翻译失败/无结果，调用方保留原文）

    func translate(_ raw: String, completion: @escaping (String?) -> Void) {
        let text = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { completion(nil); return }

        // 缓存命中
        if let hit = cache[text] {
            completion(hit.isEmpty ? nil : hit)
            return
        }
        // 词典命中
        if let d = dict[text] {
            cache[text] = d
            completion(d)
            return
        }
        if config.engine == .offline {
            completion(nil)
            return
        }

        let target = config.target
        let source = config.source

        func finish(_ result: String?) {
            // 只缓存成功结果；失败项下次运行会重试（换 Key / 网络恢复后有效）
            if let r = result, !r.isEmpty, r != text {
                cache[text] = r
                completion(r)
            } else {
                completion(nil)
            }
        }

        switch config.engine {
        case .mymemory:
            var comps = URLComponents(string: "https://api.mymemory.translated.net/get")!
            comps.queryItems = [
                URLQueryItem(name: "q", value: String(text.prefix(maxTextLength))),
                URLQueryItem(name: "langpair", value: "\(source)|\(target)")
            ]
            request(comps.url, parse: { data in
                guard let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                      let rd = obj["responseData"] as? [String: Any],
                      let t = rd["translatedText"] as? String else { return nil }
                return t
            }, completion: finish)
        case .custom:
            guard !config.apiUrl.isEmpty else { completion(nil); return }
            var urlStr = config.apiUrl
                .replacingOccurrences(of: "{text}", with: percentEncode(String(text.prefix(maxTextLength))))
                .replacingOccurrences(of: "{key}", with: percentEncode(config.apiKey))
                .replacingOccurrences(of: "{prompt}", with: percentEncode(config.prompt))
            // 兜底：若模板未替换成功（缺占位符），以 query 附加
            if urlStr.contains("{text}") {
                urlStr = urlStr.replacingOccurrences(of: "{text}", with: percentEncode(text))
            }
            if urlStr.contains("{prompt}") {
                urlStr = urlStr.replacingOccurrences(of: "{prompt}", with: percentEncode(config.prompt))
            }
            request(URL(string: urlStr), parse: { data in
                guard let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
                    // 可能是纯文本响应
                    return String(data: data, encoding: .utf8)
                }
                if let t = obj["translatedText"] as? String { return t }
                if let t = obj["translation"] as? String { return t }
                if let t = obj["data"] as? [String: Any], let s = t["translations"] as? [[String: Any]], let x = s.first?["translatedText"] as? String { return x }
                return nil
            }, completion: finish)
        case .offline:
            completion(nil)
        }
    }

    private func percentEncode(_ s: String) -> String {
        var allowed = CharacterSet.alphanumerics
        allowed.insert(charactersIn: "-._~")
        return s.addingPercentEncoding(withAllowedCharacters: allowed) ?? s
    }

    private func request(_ url: URL?, parse: @escaping (Data) -> String?, completion: @escaping (String?) -> Void) {
        guard let url = url else { completion(nil); return }
        var req = URLRequest(url: url)
        req.setValue("Mozilla/5.0 RPGTranslate", forHTTPHeaderField: "User-Agent")
        session.dataTask(with: req) { data, _, _ in
            guard let data = data else { completion(nil); return }
            let result = parse(data)?
                .trimmingCharacters(in: .whitespacesAndNewlines)
            completion(result)
        }.resume()
    }

    /// 当前缓存中的翻译条数（供界面展示）
    var cachedCount: Int { cache.count }
}
