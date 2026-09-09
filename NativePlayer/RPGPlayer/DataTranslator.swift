import Foundation

/// 游戏信息：根目录 + data 目录
struct GameInfo {
    let root: URL    // 含 www 或 data 的那一层
    let dataDir: URL // www/data 或 data
}

/// 定位路径（写回用）
enum PathComp: Equatable {
    case key(String)
    case index(Int)
}

/// 一条可翻译文本引用
struct TextRef {
    let path: [PathComp]
    let text: String  // 原文（含控制码）
    let plain: String // 提取后的纯文本（翻译输入）
    let term: Bool    // 术语（System 术语/数据库名称等）：优先翻译并作为术语表，保证对话中术语一致
}

/// 扫描统计（翻译前展示用）
struct ScanStats {
    var fileCount = 0
    var refCount = 0
    var uniqueCount = 0
}

/// 翻译结果摘要
struct TranslateSummary {
    var filesProcessed = 0
    var filesChanged = 0
    var refsTotal = 0
    var refsChanged = 0
    var translatedUnique = 0
    var failedUnique = 0
    var mapping: [String: String] = [:]
    var lastError = ""
}

/// 进度回调
struct TranslateProgress {
    var phase: String   // 扫描中 / 翻译中 x/y / 写回中
    var done: Int
    var total: Int
}

/// RPG Maker MV/MZ 游戏 data 批量翻译器
/// 提取：System 术语/游戏标题、数据库通用字段（name/description/message 等）、
///       地图与公共/战斗事件指令文本（显示文章/选项/滚动文本/显示名称）
/// 写回：保持 JSON 结构不变，仅替换字符串值；保留原文件 BOM（MZ 有、MV 无）
final class DataTranslator {

    // MARK: - 识别

    static func info(forGameRoot dir: URL) -> GameInfo? {
        let fm = FileManager.default
        let www = dir.appendingPathComponent("www")
        let d1 = www.appendingPathComponent("data")
        let d2 = dir.appendingPathComponent("data")
        if fm.fileExists(atPath: d1.appendingPathComponent("System.json").path) {
            return GameInfo(root: dir, dataDir: d1)
        }
        if fm.fileExists(atPath: d2.appendingPathComponent("System.json").path) {
            return GameInfo(root: dir, dataDir: d2)
        }
        return nil
    }

    static func findGames(in root: URL, maxDepth: Int = 3) -> [GameInfo] {
        let fm = FileManager.default
        var found: [GameInfo] = []
        func scan(_ dir: URL, _ depth: Int) {
            guard depth <= maxDepth else { return }
            let subs = (try? fm.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil,
                                                    options: [.skipsHiddenFiles])) ?? []
            for s in subs where s.hasDirectoryPath {
                if let g = info(forGameRoot: s) {
                    found.append(g)
                } else {
                    scan(s, depth + 1)
                }
            }
        }
        scan(root, 1)
        return found.sorted { $0.root.path < $1.root.path }
    }

    // MARK: - 可翻译判定

    /// 日文特有汉字（JIS 常用汉字中与中文写法不同或日文独有的）
    private static let jpSpecificChars: Set<Character> = [
        "戦", "闘", "撃", "剣", "険", "獣", "臓", "霊", "闇", "焼",
        "壊", "歩", "渋", "濁", "窓", "総", "発", "髪", "馬", "鹿",
        "鳥", "魚", "鳴", "鶏", "塩", "麺", "黒", "歴", "変", "勉",
        "区", "画", "栄", "営", "衛", "鋭", "易", "疫", "駅", "越",
        "円", "塁", "縁", "艶", "王", "凹", "応", "往", "押", "温",
        "穏", "仮", "価", "禍", "塊", "潰", "括", "覚", "学", "岳",
        "楽", "喝", "渇", "缶", "巻", "陥", "勧", "寛", "観", "気",
        "祈", "季", "紀", "帰", "擬", "犠", "旧", "拠", "挙", "虚",
        "峡", "挟", "狭", "郷", "響", "驚", "凝", "巾", "斤", "均",
        "近", "金", "菌", "勤", "琴", "僅", "緊", "錦", "謹", "襟",
        "吟", "駆", "具", "愚", "虞", "誤", "口", "工", "広", "恒",
        "鉱", "構", "興", "溝", "穀", "骨", "込", "斉", "剤", "殺",
        "雑", "三", "山", "止", "氏", "示", "耳", "社", "者", "車",
        "写", "社", "若", "取", "手", "主", "守", "朱", "取", "狩",
        "首", "殊", "珠", "酒", "祭", "斎", "細", "菜", "最", "歳",
        "済", "斉", "静", "夕", "赤", "石", "昔", "析", "席", "脊",
        "隻", "千", "川", "穿", "浅", "戦", "争", "総", "臓", "蔵",
        "贈", "賊", "続", "卒", "孫", "損", "退", "帯", "滞", "台",
        "滝", "択", "沢", "担", "単", "炭", "短", "嘆", "団", "男",
        "段", "断", "弾", "遅", "痴", "虫", "著", "庁", "頂", "鳥",
        "朝", "貼", "超", "頂", "腸", "眺", "釣", "痛", "塚", "漬",
        "坪", "壺", "唾", "鉄", "転", "都", "渡", "塗", "賭", "土",
        "奴", "熱", "年", "念", "悩", "脳", "派", "肺", "俳", "廃",
        "配", "倍", "媒", "買", "売", "白", "薄", "畑", "肌", "八",
        "発", "髪", "伐", "閉", "壁", "癖", "別", "片", "辺", "変",
        "勉", "弁", "弁", "保", "舗", "母", "暮", "報", "豊", "褒",
        "法", "忘", "忙", "房", "防", "肪", "某", "冒", "紡", "訪",
        "葬", "臓", "蔵", "贈", "賊", "続", "卒", "孫", "損", "退"
    ]

    /// 中文特有字符（现代汉语常用单字，日文基本不用或用法不同）
    private static let zhSpecificChars: Set<Character> = [
        "们", "这", "那", "吗", "呢", "吧", "啊", "的", "了", "是",
        "在", "有", "和", "就", "不", "都", "也", "很", "到", "说",
        "要", "去", "你", "我", "他", "她", "它", "没", "么", "怎",
        "为", "可", "知", "现", "已", "还", "但", "因", "所", "如",
        "虽", "然", "过", "后", "其", "实", "真", "感", "觉", "时",
        "候", "地", "方", "东", "西", "事", "情", "问", "题", "办",
        "法", "样", "这", "那", "哪", "些", "呀", "哇", "哦", "哈",
        "嗯", "呗", "啦", "嘛", "哟", "哩", "喽", "呵", "唉", "嗨"
    ]

    static func shouldTranslate(_ text: String, target: String) -> Bool {
        let t = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !t.isEmpty else { return false }
        guard t.contains(where: { $0.isLetter }) else { return false }
        // 目标中文：判断是否已翻译
        if target.lowercased().hasPrefix("zh") {
            let hasHiragana = t.unicodeScalars.contains { $0.value >= 0x3040 && $0.value <= 0x309F }
            let hasKatakana = t.unicodeScalars.contains { $0.value >= 0x30A0 && $0.value <= 0x30FF }
            let hasCJK = t.unicodeScalars.contains { $0.value >= 0x4E00 && $0.value <= 0x9FFF }
            // 含假名 → 一定是日文，需要翻译
            if hasHiragana || hasKatakana { return true }
            // 含日文特有汉字 → 是日文，需要翻译
            if hasCJK && t.contains(where: { jpSpecificChars.contains($0) }) { return true }
            // 含中文特有字符 → 已翻译为中文，跳过
            if t.contains(where: { zhSpecificChars.contains($0) }) { return false }
            // 纯汉字且无法判断（可能是日文纯汉字词，也可能是中文）→ 保守翻译，缓存会去重
            if hasCJK { return true }
            // 纯英文/数字/符号 → 不需要翻译
            return false
        }
        return true
    }

    // MARK: - 扫描提取

    private static let genericKeys: Set<String> = [
        "name", "nickname", "profile", "description",
        "message1", "message2", "message3", "message4", "displayName"
    ]
    private static let genericFiles: Set<String> = [
        "Actors.json", "Classes.json", "Skills.json", "Items.json",
        "Weapons.json", "Armors.json", "Enemies.json", "States.json", "MapInfos.json"
    ]
    private static let skipFiles: Set<String> = [
        "Tilesets.json", "Animations.json", "Vehicles.json", "Regions.json", "Dependencies.json"
    ]

    /// 扫描一个 data 文件，返回（root, refs, hadBOM）；失败返回 nil
    private static func scanFile(_ url: URL) -> (root: Any, refs: [TextRef], hadBOM: Bool)? {
        guard let bytes = try? Data(contentsOf: url), !bytes.isEmpty else { return nil }
        let hadBOM = bytes.count >= 3 && bytes[0] == 0xEF && bytes[1] == 0xBB && bytes[2] == 0xBF
        let jsonData = hadBOM ? bytes.dropFirst(3) : bytes[...]
        guard let root = try? JSONSerialization.jsonObject(with: Data(jsonData), options: [.mutableContainers]) else {
            return nil
        }
        var refs: [TextRef] = []
        let name = url.lastPathComponent

        if name == "System.json" {
            collectSystem(root, into: &refs)
        } else if genericFiles.contains(name) {
            collectGeneric(root, path: [], into: &refs)
        } else if name.hasPrefix("Map") && name.hasSuffix(".json") {
            collectMap(root, into: &refs)
        } else if name == "CommonEvents.json" || name == "Troops.json" {
            collectEventsFile(root, into: &refs)
        } else if !skipFiles.contains(name) && name.hasSuffix(".json") {
            // 未知数据文件：仅收集通用键，降低漏翻
            collectGeneric(root, path: [], into: &refs)
        }
        return (root, refs, hadBOM)
    }

    static func scanStats(_ game: GameInfo) -> ScanStats {
        let fm = FileManager.default
        let files = ((try? fm.contentsOfDirectory(at: game.dataDir, includingPropertiesForKeys: nil)) ?? [])
            .filter { $0.pathExtension == "json" }
        var stats = ScanStats()
        var seen = Set<String>()
        // 预算：最多扫描 300 个文件、单文件 ≤ 32MB，保证任何情况下都能快速返回
        var processed = 0
        for f in files {
            if processed >= 300 { break }
            if let attrs = try? fm.attributesOfItem(atPath: f.path),
               let size = attrs[.size] as? Int,
               size > 32 * 1024 * 1024 { continue }
            guard let r = scanFile(f) else { continue }
            processed += 1
            stats.fileCount += 1
            stats.refCount += r.refs.count
            for ref in r.refs where shouldTranslate(ref.plain, target: currentTarget) {
                seen.insert(ref.plain)
            }
        }
        stats.uniqueCount = seen.count
        return stats
    }

    private static var currentTarget = "zh-CN"

    // MARK: - 各文件类型提取

    private static func add(_ refs: inout [TextRef], path: [PathComp], text: String, term: Bool = false) {
        guard !text.isEmpty else { return }
        let plain = ControlCode.plain(of: text)
        guard !plain.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        refs.append(TextRef(path: path, text: text, plain: plain, term: term))
    }

    /// System.json：游戏标题 + terms 下所有字符串（术语）
    private static func collectSystem(_ root: Any, into refs: inout [TextRef]) {
        guard let dict = root as? [String: Any] else { return }
        if let t = dict["gameTitle"] as? String {
            add(&refs, path: [.key("gameTitle")], text: t, term: true)
        }
        if let terms = dict["terms"] {
            collectSystemStrings(terms, path: [.key("terms")], into: &refs)
        }
    }

    private static func collectSystemStrings(_ node: Any, path: [PathComp], into refs: inout [TextRef]) {
        if let s = node as? String {
            add(&refs, path: path, text: s, term: true)
            return
        }
        if let d = node as? [String: Any] {
            for (k, v) in d {
                collectSystemStrings(v, path: path + [.key(k)], into: &refs)
            }
        } else if let a = node as? [Any] {
            for (i, v) in a.enumerated() {
                collectSystemStrings(v, path: path + [.index(i)], into: &refs)
            }
        }
    }

    /// 通用数据库文件：递归收集命中键的字符串（名称/简介/描述等，均为术语）
    private static func collectGeneric(_ root: Any, path: [PathComp], into refs: inout [TextRef]) {
        if let s = root as? String {
            if let last = path.last, case .key(let k) = last, genericKeys.contains(k) {
                add(&refs, path: path, text: s, term: true)
            }
            return
        }
        if let d = root as? [String: Any] {
            for (k, v) in d {
                collectGeneric(v, path: path + [.key(k)], into: &refs)
            }
        } else if let a = root as? [Any] {
            for (i, v) in a.enumerated() {
                collectGeneric(v, path: path + [.index(i)], into: &refs)
            }
        }
    }

    /// 地图：displayName（术语）+ 事件指令（对话）
    private static func collectMap(_ root: Any, into refs: inout [TextRef]) {
        guard let dict = root as? [String: Any] else { return }
        if let dn = dict["displayName"] as? String {
            add(&refs, path: [.key("displayName")], text: dn, term: true)
        }
        guard let events = dict["events"] as? [Any] else { return }
        for (i, ev) in events.enumerated() {
            guard let pages = (ev as? [String: Any])?["pages"] as? [Any] else { continue }
            for (j, pg) in pages.enumerated() {
                if let list = (pg as? [String: Any])?["list"] {
                    collectEventCommands(list, path: [.key("events"), .index(i), .key("pages"), .index(j), .key("list")], into: &refs)
                }
            }
        }
    }

    /// CommonEvents / Troops：name（术语）+ 事件指令（对话）
    private static func collectEventsFile(_ root: Any, into refs: inout [TextRef]) {
        guard let dict = root as? [String: Any] else { return }
        if let n = dict["name"] as? String {
            add(&refs, path: [.key("name")], text: n, term: true)
        }
        if let list = dict["list"] {
            collectEventCommands(list, path: [.key("list")], into: &refs)
        }
        if let pages = dict["pages"] as? [Any] {
            for (j, pg) in pages.enumerated() {
                if let list = (pg as? [String: Any])?["list"] {
                    collectEventCommands(list, path: [.key("pages"), .index(j), .key("list")], into: &refs)
                }
            }
        }
    }

    /// 事件指令文本（MV/MZ code 一致）
    /// 401/405 文章行、102 选项、402 选项分支、320 更改显示名称
    private static func collectEventCommands(_ list: Any, path: [PathComp], into refs: inout [TextRef]) {
        guard let arr = list as? [Any] else { return }
        for (i, cmd) in arr.enumerated() {
            guard let c = cmd as? [String: Any],
                  let code = c["code"] as? NSNumber else { continue }
            let p = path + [.index(i)]
            let params = c["parameters"] as? [Any]
            switch code.intValue {
            case 401, 405:
                if let s = params?.first as? String {
                    add(&refs, path: p + [.key("parameters"), .index(0)], text: s)
                }
            case 102:
                if let opts = params?.first as? [Any] {
                    for (j, o) in opts.enumerated() {
                        if let s = o as? String {
                            add(&refs, path: p + [.key("parameters"), .index(0), .index(j)], text: s)
                        }
                    }
                }
            case 402, 320:
                if let s = params?.first as? String {
                    add(&refs, path: p + [.key("parameters"), .index(0)], text: s)
                }
            default:
                break
            }
        }
    }

    // MARK: - 写回

    /// 全局覆盖词典（mtool/精修翻译文件）：Documents/translations/override.json，{原文: 译文}
    /// 翻译时命中该词典的句子直接采用，不发 API，保证术语与精修一致
    static func overrides() -> [String: String] {
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let url = docs.appendingPathComponent("translations/override.json")
        guard let d = try? Data(contentsOf: url),
              let obj = try? JSONSerialization.jsonObject(with: d) as? [String: String] else { return [:] }
        return obj
    }

    /// 应用外部翻译文件（mtool 或其他工具导出的 {原文: 译文} JSON），直接写回游戏 data
    static func applyMapping(_ mapping: [String: String], to game: GameInfo) -> (files: Int, refs: Int) {
        let fm = FileManager.default
        let files = ((try? fm.contentsOfDirectory(at: game.dataDir, includingPropertiesForKeys: nil)) ?? [])
            .filter { $0.pathExtension == "json" }
        var filesChanged = 0
        var refsChanged = 0
        for f in files {
            guard let r = scanFile(f) else { continue }
            let changed = writeBackFile(r, mapping: mapping, to: f)
            refsChanged += changed
            if changed > 0 { filesChanged += 1 }
        }
        return (filesChanged, refsChanged)
    }

    // MARK: - 校对 / 映射持久化

    /// 保存翻译结果映射到 translations/<游戏名>.json（mtool 兼容格式，供校对/复用/外部工具）
    static func saveMapping(_ mapping: [String: String], for game: GameInfo) {
        let fm = FileManager.default
        let docs = fm.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let dir = docs.appendingPathComponent("translations", isDirectory: true)
        try? fm.createDirectory(at: dir, withIntermediateDirectories: true)
        let url = dir.appendingPathComponent(game.root.lastPathComponent + ".json")
        if let data = try? JSONSerialization.data(withJSONObject: mapping, options: [.prettyPrinted]) {
            try? data.write(to: url, options: .atomic)
        }
    }

    /// 读取已保存的翻译映射（校对 / override 词典用）
    static func savedMapping(for game: GameInfo) -> [String: String] {
        let fm = FileManager.default
        let docs = fm.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let url = docs.appendingPathComponent("translations")
            .appendingPathComponent(game.root.lastPathComponent + ".json")
        guard let d = try? Data(contentsOf: url),
              let obj = try? JSONSerialization.jsonObject(with: d) as? [String: String] else { return [:] }
        return obj
    }

    private static func stringAt(_ node: Any, _ path: [PathComp]) -> String? {
        var cur: Any = node
        for comp in path {
            switch comp {
            case .key(let k):
                guard let d = cur as? [String: Any], let v = d[k] else { return nil }
                cur = v
            case .index(let idx):
                guard let a = cur as? [Any], idx >= 0 && idx < a.count else { return nil }
                cur = a[idx]
            }
        }
        return cur as? String
    }

    @discardableResult
    private static func setString(_ root: Any, _ value: String, at path: [PathComp]) -> Bool {
        guard !path.isEmpty else { return false }
        var node: Any = root
        for (i, comp) in path.enumerated() {
            if i == path.count - 1 {
                switch comp {
                case .key(let k):
                    if let d = node as? NSMutableDictionary {
                        d[k] = value
                        return true
                    }
                case .index(let idx):
                    if let a = node as? NSMutableArray, idx >= 0 && idx < a.count {
                        a[idx] = value
                        return true
                    }
                }
                return false
            }
            switch comp {
            case .key(let k):
                guard let d = node as? NSMutableDictionary, let next = d[k] else { return false }
                node = next
            case .index(let idx):
                guard let a = node as? NSMutableArray, idx >= 0 && idx < a.count else { return false }
                node = a[idx]
            }
        }
        return false
    }

    /// 按映射写回一个文件，返回修改条数
    private static func writeBackFile(_ file: (root: Any, refs: [TextRef], hadBOM: Bool),
                                      mapping: [String: String],
                                      to url: URL) -> Int {
        var changed = 0
        for ref in file.refs {
            guard let tr = mapping[ref.plain], !tr.isEmpty else { continue }
            let newText = ControlCode.recombine(original: ref.text, translation: tr)
            guard newText != ref.text else { continue }
            if setString(file.root, newText, at: ref.path) { changed += 1 }
        }
        guard changed > 0 else { return 0 }
        do {
            var data = try JSONSerialization.data(withJSONObject: file.root, options: [.prettyPrinted])
            data.append(0x0A)
            if file.hadBOM {
                var bom = Data([0xEF, 0xBB, 0xBF])
                bom.append(data)
                data = bom
            }
            try data.write(to: url, options: .atomic)
            return changed
        } catch {
            return 0
        }
    }

    // MARK: - 主流程

    static func run(game: GameInfo, config: TranslationConfig,
                    progress: @escaping (TranslateProgress) -> Void,
                    cancelled: @escaping () -> Bool,
                    completion: @escaping (TranslateSummary) -> Void) {
        currentTarget = config.target
        let fm = FileManager.default
        let files = (try? fm.contentsOfDirectory(at: game.dataDir, includingPropertiesForKeys: nil)) ?? []
            .filter { $0.pathExtension == "json" }
            .sorted { $0.lastPathComponent < $1.lastPathComponent }

        progress(TranslateProgress(phase: "扫描游戏文本…", done: 0, total: files.count))

        var scanned: [(url: URL, file: (root: Any, refs: [TextRef], hadBOM: Bool))] = []
        var unique: [String] = []
        var seen = Set<String>()
        var termSeen = Set<String>()
        for f in files {
            if cancelled() { completion(TranslateSummary()); return }
            guard let r = scanFile(f) else { continue }
            scanned.append((f, r))
            for ref in r.refs where shouldTranslate(ref.plain, target: config.target) {
                if !seen.contains(ref.plain) {
                    seen.insert(ref.plain)
                    unique.append(ref.plain)
                    if ref.term { termSeen.insert(ref.plain) }
                }
            }
        }

        guard !unique.isEmpty else {
            completion(TranslateSummary(filesProcessed: scanned.count))
            return
        }

        // 两阶段翻译（对应 mtool/MoriTranslates 思路）：
        //  阶段1 术语（System 术语/人名/物品/技能等名称）→ 并入术语表
        //  阶段2 对话：命中术语表/词典的句子直接采用，保证人名与物品名全篇一致、不发重复请求
        let engine = TranslatorEngine(config: config)
        let ovr = overrides()
        var mapping: [String: String] = ovr
        let total = unique.count
        // 并发：设置页可调（tr_concurrency：0=自动按引擎，1~16 手动）；调高更快，但免费通道限流严格时易 429/失败
        let presetConc = UserDefaults.standard.integer(forKey: "tr_concurrency")
        let autoConc: Int
        switch config.engine {
        case .offline: autoConc = 1
        case .mymemory: autoConc = 2   // MyMemory 免费接口限流严格
        case .custom: autoConc = 6
        case .agnes: autoConc = 8
        case .aqua: autoConc = 6       // AQUA 免费通道限流，过高触发 RATE_LIMITED
        }
        let concurrency = presetConc > 0 ? max(1, min(16, presetConc)) : autoConc
        let semaphore = DispatchSemaphore(value: concurrency)
        let resultQueue = DispatchQueue(label: "rpgtranslate.results")  // mapping 写入串行化
        let group = DispatchGroup()
        let workQueue = DispatchQueue.global(qos: .userInitiated)       // 提交/写回后台执行，不卡 UI

        var processed = 0   // 已处理条数（成功+失败），进度条按此推进，失败也看得见
        func batchTranslate(_ items: [String], _ phase: String, done: @escaping () -> Void) {
            let toTranslate = items.filter { mapping[$0] == nil }
            workQueue.async {
                var doneInBatch = 0
                for item in toTranslate {
                    if cancelled() { break }
                    semaphore.wait()
                    group.enter()
                    engine.translate(item) { result in
                        resultQueue.async {
                            if let r = result { mapping[item] = r }
                            doneInBatch += 1
                            processed += 1
                            if doneInBatch % 40 == 0 { engine.saveCache() }
                            DispatchQueue.main.async {
                                progress(TranslateProgress(phase: phase, done: processed, total: total))
                            }
                            semaphore.signal()
                            group.leave()
                        }
                    }
                }
                group.wait()
                engine.saveCache()
                DispatchQueue.main.async { done() }
            }
        }

        // 阶段 1：术语
        progress(TranslateProgress(phase: "翻译术语（人名/物品/技能）…", done: mapping.count, total: total))
        batchTranslate(unique.filter { termSeen.contains($0) }, "翻译术语（人名/物品/技能）…") {
            // 术语表并入引擎词典：后续对话直接命中
            engine.mergeDict(mapping)
            if cancelled() { completion(TranslateSummary()); return }

            // 阶段 2：对话
            progress(TranslateProgress(phase: "翻译对话…", done: mapping.count, total: total))
            batchTranslate(unique.filter { !termSeen.contains($0) }, "翻译对话…") {
                engine.saveCache()
                saveMapping(mapping, for: game)
                if cancelled() { completion(TranslateSummary()); return }

                // 写回（后台执行，大游戏不卡 UI）
                workQueue.async {
                    var summary = TranslateSummary(filesProcessed: scanned.count,
                                                   translatedUnique: mapping.count,
                                                   failedUnique: unique.count - mapping.count,
                                                   mapping: mapping)
                    for (i, item) in scanned.enumerated() {
                        if cancelled() { DispatchQueue.main.async { completion(summary) }; return }
                        let changed = writeBackFile(item.file, mapping: mapping, to: item.url)
                        summary.refsTotal += item.file.refs.count
                        summary.refsChanged += changed
                        if changed > 0 { summary.filesChanged += 1 }
                        DispatchQueue.main.async {
                            progress(TranslateProgress(phase: "写回文件…", done: i + 1, total: scanned.count))
                        }
                    }
                    saveMapping(mapping, for: game)
                    summary.lastError = engine.lastError
                    DispatchQueue.main.async { completion(summary) }
                }
            }
        }
    }

    // MARK: - 备份 / 恢复 / 导出

    static func backupData(_ game: GameInfo) -> URL? {
        let fm = FileManager.default
        let docs = fm.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let dir = docs.appendingPathComponent("Backups", isDirectory: true)
            .appendingPathComponent(game.root.lastPathComponent, isDirectory: true)
        try? fm.createDirectory(at: dir, withIntermediateDirectories: true)
        let df = DateFormatter()
        df.dateFormat = "yyyyMMdd_HHmmss"
        let dest = dir.appendingPathComponent("data_" + df.string(from: Date()))
        try? fm.removeItem(at: dest)
        do {
            try fm.copyItem(at: game.dataDir, to: dest)
            return dest
        } catch {
            return nil
        }
    }

    static func backups(for game: GameInfo) -> [URL] {
        let fm = FileManager.default
        let docs = fm.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let dir = docs.appendingPathComponent("Backups", isDirectory: true)
            .appendingPathComponent(game.root.lastPathComponent, isDirectory: true)
        let items = (try? fm.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil,
                                                 options: [.skipsHiddenFiles])) ?? []
        return items.filter { $0.hasDirectoryPath }.sorted { $0.lastPathComponent > $1.lastPathComponent }
    }

    static func restoreData(_ game: GameInfo, from backup: URL) -> Bool {
        let fm = FileManager.default
        do {
            try? fm.removeItem(at: game.dataDir)
            try fm.copyItem(at: backup, to: game.dataDir)
            return true
        } catch {
            return false
        }
    }

    /// 导出整份游戏 + 翻译映射表到 Documents/Exports（文件App / 爱思助手可见）
    static func exportGame(_ game: GameInfo, mapping: [String: String]) -> URL? {
        let fm = FileManager.default
        let docs = fm.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let ex = docs.appendingPathComponent("Exports", isDirectory: true)
        try? fm.createDirectory(at: ex, withIntermediateDirectories: true)
        let dest = ex.appendingPathComponent(game.root.lastPathComponent)
        try? fm.removeItem(at: dest)
        do {
            try fm.copyItem(at: game.root, to: dest)
        } catch {
            return nil
        }
        if !mapping.isEmpty {
            let mapURL = ex.appendingPathComponent(game.root.lastPathComponent + "_翻译映射.json")
            if let data = try? JSONSerialization.data(withJSONObject: mapping, options: [.prettyPrinted]) {
                try? data.write(to: mapURL, options: .atomic)
            }
        }
        return ex
    }
}
