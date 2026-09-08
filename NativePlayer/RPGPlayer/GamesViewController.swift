import UIKit
import UniformTypeIdentifiers

/// 单页版：上半游戏列表，下半选中游戏的翻译/运行操作（合并原列表页与翻译页，去掉冗余跳转）
final class GamesViewController: UITableViewController {

    private var games: [GameInfo] = []
    private var selectedIndex: Int?
    private let defaults = UserDefaults.standard

    private var stats: ScanStats?
    private var summary: TranslateSummary?
    private var isRunning = false
    private var cancelFlag = false
    private var scanTask: DispatchWorkItem?
    private var importQueue: [URL] = []
    private var importing = false

    private lazy var progressView: UIProgressView = {
        let p = UIProgressView(progressViewStyle: .default)
        p.progress = 0
        return p
    }()
    private var phaseLabel = UILabel()

    private static var documents: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "游戏翻译"
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            barButtonSystemItem: .add, target: self, action: #selector(importGame))
        navigationItem.leftBarButtonItem = UIBarButtonItem(
            title: "翻译文件", style: .plain, target: self, action: #selector(openTranslationFiles))
        phaseLabel.numberOfLines = 0
        phaseLabel.font = .systemFont(ofSize: 13)
        phaseLabel.textColor = .secondaryLabel
        phaseLabel.text = " "
        tableView.register(SubtitleCell.self, forCellReuseIdentifier: "cell")
        refresh()
        NotificationCenter.default.addObserver(
            self, selector: #selector(refresh),
            name: UIApplication.didBecomeActiveNotification, object: nil)
    }

    private final class SubtitleCell: UITableViewCell {
        override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
            super.init(style: .subtitle, reuseIdentifier: reuseIdentifier)
        }
        required init?(coder: NSCoder) { fatalError() }
    }

    @objc private func openTranslationFiles() {
        navigationController?.pushViewController(TranslationFilesViewController(), animated: true)
    }

    @objc private func refresh() {
        games = DataTranslator.findGames(in: Self.documents)
        if let i = selectedIndex, i >= games.count { selectedIndex = nil }
        tableView.reloadData()
        checkPendingZips()
    }

    private func displayName(for info: GameInfo) -> String {
        let docs = Self.documents
        if info.root.path == docs.path { return "（根目录）" }
        if info.root.path.hasPrefix(docs.path + "/") {
            return String(info.root.path.dropFirst(docs.path.count + 1))
        }
        return info.root.lastPathComponent
    }

    /// 游戏封面缩略图：查找 MV/MZ 的 icon.png（www/icon.png 或根目录 icon.png）
    private func gameIcon(for root: URL) -> UIImage? {
        let fm = FileManager.default
        let candidates = [
            root.appendingPathComponent("www").appendingPathComponent("icon.png"),
            root.appendingPathComponent("icon.png")
        ]
        for c in candidates where fm.fileExists(atPath: c.path) {
            if let img = UIImage(contentsOfFile: c.path) { return img }
        }
        return nil
    }

    private var selectedGame: GameInfo? {
        guard let i = selectedIndex, i < games.count else { return nil }
        return games[i]
    }

    // MARK: - 导入

    @objc private func importGame() {
        let sheet = UIAlertController(title: "导入游戏", message: nil, preferredStyle: .actionSheet)
        sheet.addAction(UIAlertAction(title: "从文件选择 zip 导入", style: .default) { [weak self] _ in
            guard let self = self else { return }
            let picker = UIDocumentPickerViewController(forOpeningContentTypes: [.zip])
            picker.delegate = self
            picker.allowsMultipleSelection = true
            self.present(picker, animated: true)
        })
        sheet.addAction(UIAlertAction(title: "解压导入（zip 已放入本 App 文档目录）", style: .default) { [weak self] _ in
            guard let self = self else { return }
            let zips = self.pendingZipCandidates()
            if zips.isEmpty {
                let tip = UIAlertController(
                    title: "没有找到 zip",
                    message: "请用文件App / 爱思助手将游戏压缩包（.zip）放入本 App 的文档目录，或从「文件」App 直接共享 zip 到本 App，然后再点导入。",
                    preferredStyle: .alert)
                tip.addAction(UIAlertAction(title: "好", style: .cancel))
                self.present(tip, animated: true)
                return
            }
            let z = zips[0]
            let ask = UIAlertController(
                title: "确认解压导入",
                message: "\(z.lastPathComponent)\n\n将解压并导入为游戏，导入成功后自动删除该压缩包。",
                preferredStyle: .alert)
            ask.addAction(UIAlertAction(title: "解压导入", style: .default) { _ in self.enqueueImports([z]) })
            ask.addAction(UIAlertAction(title: "取消", style: .cancel))
            self.present(ask, animated: true)
        })
        sheet.addAction(UIAlertAction(title: "手动复制文件夹指南", style: .default) { [weak self] _ in
            guard let self = self else { return }
            let guide = UIAlertController(
                title: "手动复制",
                message: "把含 www/data（或 data）的游戏文件夹放入本 App 的文档目录：\n\n① 文件App：打开「文件」→「我的 iPhone」→「RPG Player」，把整个游戏文件夹拖入\n\n② 爱思助手：连接设备 → 应用 → RPG Player → 浏览 → 把游戏文件夹拖进 Documents\n\n③ zip 压缩包：从「文件」App 长按 zip →「共享」→「拷贝到 RPG Player」，回 App 自动提示导入；或在文件选择器里直接选。",
                preferredStyle: .alert)
            guide.addAction(UIAlertAction(title: "好", style: .cancel))
            self.present(guide, animated: true)
        })
        sheet.addAction(UIAlertAction(title: "取消", style: .cancel))
        if let pop = sheet.popoverPresentationController {
            pop.sourceView = view
            pop.sourceRect = CGRect(x: view.bounds.midX, y: view.bounds.midY, width: 1, height: 1)
        }
        present(sheet, animated: true)
    }

    /// Documents 根目录 + Incoming（文件App 共享进来）里的待导入 zip
    private func pendingZipCandidates() -> [URL] {
        let fm = FileManager.default
        let docs = Self.documents
        var zips = ZipExtractor.pendingZips(in: docs)
        let incoming = docs.appendingPathComponent("Incoming", isDirectory: true)
        if fm.fileExists(atPath: incoming.path) {
            zips += ZipExtractor.pendingZips(in: incoming)
        }
        return zips.sorted { $0.lastPathComponent < $1.lastPathComponent }
    }

    private func enqueueImports(_ urls: [URL]) {
        importQueue.append(contentsOf: urls)
        processNextImport()
    }

    private func processNextImport() {
        guard !importing, !importQueue.isEmpty else { return }
        importing = true
        let url = importQueue.removeFirst()
        importZip(url) { [weak self] in
            self?.importing = false
            self?.processNextImport()
        }
    }

    /// 递归清理压缩包里的 Mac/Windows 垃圾（__MACOSX、.DS_Store、Thumbs.db）
    private func cleanupJunkRecursive(in dir: URL) {
        let fm = FileManager.default
        guard let items = try? fm.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil) else { return }
        for it in items {
            var isDir: ObjCBool = false
            guard fm.fileExists(atPath: it.path, isDirectory: &isDir) else { continue }
            if isDir.boolValue {
                if it.lastPathComponent == "__MACOSX" {
                    try? fm.removeItem(at: it)
                } else {
                    cleanupJunkRecursive(in: it)
                }
            } else if it.lastPathComponent == ".DS_Store" || it.lastPathComponent == "Thumbs.db" {
                try? fm.removeItem(at: it)
            }
        }
    }

    /// 后台解压导入：解压 -> 清理垃圾 -> 定位游戏根 -> 移动到 Documents/<游戏名>（重名自动加序号）-> 删 zip -> 选中并刷新
    private func importZip(_ zip: URL, completion: (() -> Void)? = nil) {
        let progress = UIAlertController(
            title: "正在解压导入…",
            message: "大文件可能需要一会儿，请勿关闭 App",
            preferredStyle: .alert)
        present(progress, animated: true)
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            var result = ""
            var ok = false
            var finalPath = ""
            do {
                let docs = Self.documents
                let base = zip.deletingPathExtension().lastPathComponent
                let dest = docs.appendingPathComponent("\(base)_import", isDirectory: true)
                try? FileManager.default.removeItem(at: dest)
                try FileManager.default.createDirectory(at: dest, withIntermediateDirectories: true)
                let n = try ZipExtractor.extract(zip, to: dest)
                self?.cleanupJunkRecursive(in: dest)
                let gameRoot = ZipExtractor.locateGameRoot(in: dest) ?? dest
                var final = docs.appendingPathComponent(base, isDirectory: true)
                var suffix = 2
                while FileManager.default.fileExists(atPath: final.path) {
                    final = docs.appendingPathComponent("\(base)_\(suffix)", isDirectory: true)
                    suffix += 1
                }
                if gameRoot.path != dest.path {
                    try FileManager.default.moveItem(at: gameRoot, to: final)
                    try? FileManager.default.removeItem(at: dest)
                } else {
                    try FileManager.default.moveItem(at: dest, to: final)
                }
                try? FileManager.default.removeItem(at: zip)
                // 自动修复格式：解密加密资源（运行时零开销）
                var fixMsg = ""
                if GameDecryptor.needsDecryption(in: final) {
                    let r = GameDecryptor.decryptIfNeeded(in: final)
                    if r.ok && r.files > 0 { fixMsg = "\n已自动解密 \(r.files) 个加密文件" }
                }
                // 自动修复：注入 viewport（横屏居中显示）
                GameImporter.fixViewport(in: final)
                ok = true
                finalPath = final.path
                result = "导入成功：\(final.lastPathComponent)\n共解压 \(n) 个文件\(fixMsg)"
            } catch {
                result = "导入失败：\(error.localizedDescription)"
            }
            DispatchQueue.main.async {
                self?.dismiss(animated: true) {
                    guard let self = self else { completion?(); return }
                    self.refresh()
                    if ok {
                        if let idx = self.games.firstIndex(where: { $0.root.path == finalPath }) {
                            self.selectedIndex = idx
                            self.stats = nil
                            self.summary = nil
                            self.isRunning = false
                            self.cancelFlag = false
                            self.phaseLabel.text = " "
                            self.progressView.progress = 0
                            self.refreshStats()
                        }
                    }
                    let done = UIAlertController(
                        title: ok ? "导入完成" : "导入失败",
                        message: result,
                        preferredStyle: .alert)
                    done.addAction(UIAlertAction(title: "好", style: .default) { _ in completion?() })
                    self.present(done, animated: true)
                }
            }
        }
    }

    /// 打开 App 时发现 Documents/Incoming 有 zip -> 弹窗确认导入
    private func checkPendingZips() {
        guard let z = pendingZipCandidates().first else { return }
        let ask = UIAlertController(
            title: "发现压缩包",
            message: "\(z.lastPathComponent)\n\n要解压并导入为游戏吗？（导入成功后自动删除该压缩包）",
            preferredStyle: .alert)
        ask.addAction(UIAlertAction(title: "解压导入", style: .default) { [weak self] _ in
            self?.importZip(z)
        })
        ask.addAction(UIAlertAction(title: "稍后", style: .cancel))
        present(ask, animated: true)
    }

    // MARK: - 翻译操作

    private func config() -> TranslationConfig {
        var c = TranslationConfig()
        c.engine = TranslationEngine(rawValue: defaults.integer(forKey: "tr_engine")) ?? .offline
        c.source = defaults.string(forKey: "tr_source") ?? "ja"
        c.target = defaults.string(forKey: "tr_target") ?? "zh-CN"
        c.apiUrl = defaults.string(forKey: "tr_api_url") ?? ""
        c.apiKey = defaults.string(forKey: "tr_api_key") ?? ""
        c.prompt = defaults.string(forKey: "tr_prompt") ?? ""
        c.model = defaults.string(forKey: "tr_model") ?? ""
        c.memEmail = defaults.string(forKey: "tr_mem_email") ?? ""
        return c
    }

    private func engineName(_ e: TranslationEngine) -> String {
        switch e {
        case .offline: return "离线词典"
        case .mymemory: return "MyMemory"
        case .custom: return "自定义API"
        case .agnes: return "Agnes"
        case .aqua: return "AQUA"
        }
    }

    private func startTranslate() {
        guard !isRunning, let game = selectedGame else { return }
        let cfg = config()
        isRunning = true
        cancelFlag = false
        _ = DataTranslator.backupData(game)
        phaseLabel.text = "使用 \(engineName(cfg.engine)) 准备中…"
        progressView.progress = 0
        tableView.reloadData()

        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }
            DataTranslator.run(game: game, config: cfg,
                               progress: { p in
                DispatchQueue.main.async {
                    self.phaseLabel.text = p.phase + (p.total > 0 ? " \(p.done)/\(p.total)" : "")
                    if p.total > 0 { self.progressView.progress = Float(p.done) / Float(p.total) }
                }
            }, cancelled: { self.cancelFlag },
               completion: { sum in
                DispatchQueue.main.async {
                    self.isRunning = false
                    self.summary = sum
                    self.phaseLabel.text = sum.refsTotal == 0 && sum.translatedUnique == 0
                        ? "未找到可翻译文本（检查游戏是否为 MV/MZ 且 data 完整）"
                        : "完成：翻译 \(sum.translatedUnique) 条，写回 \(sum.refsChanged) 处 / \(sum.filesChanged) 个文件"
                    self.progressView.progress = 1
                    self.tableView.reloadData()
                    if sum.failedUnique > 0 && sum.failedUnique > sum.translatedUnique {
                        let detail = sum.lastError.isEmpty
                            ? "\n\n常见原因：Key 未填/无效、免费额度用尽、模型名不支持、网络不通。检查设置后重新翻译（已成功的不会重复翻）。"
                            : "\n\nAPI 返回：\(sum.lastError)"
                        let alert = UIAlertController(
                            title: "翻译失败较多（\(sum.failedUnique) 条）",
                            message: "可能原因：\n① 引擎 Key 未填或无效\n② 自定义 API 地址未以 /chat/completions 结尾\n③ 免费额度用尽\n④ 模型名不支持（Agnes 默认 agnes-2.5-flash / AQUA 默认 glm-4-flash）\(detail)",
                            preferredStyle: .alert)
                        alert.addAction(UIAlertAction(title: "好", style: .default))
                        self.present(alert, animated: true)
                    }
                }
            })
        }
    }

    private func stopTranslate() {
        cancelFlag = true
        isRunning = false
        phaseLabel.text = "已取消"
        tableView.reloadData()
    }

    /// 把翻译后的游戏整包导出为 zip 到 Documents/Exports，供 RPG Pocket / QuestPlay / RPGEmu 等第三方 Player 导入运行
    private func exportGame() {
        guard let game = selectedGame else { return }
        let progress = UIAlertController(
            title: "正在打包…",
            message: "大游戏可能需要一会儿，请勿关闭 App",
            preferredStyle: .alert)
        present(progress, animated: true)
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            var result = ""
            var ok = false
            do {
                let docs = Self.documents
                let exportDir = docs.appendingPathComponent("Exports", isDirectory: true)
                try FileManager.default.createDirectory(at: exportDir, withIntermediateDirectories: true)
                // 导出前修复多语言插件名（日文/中文 js），保证第三方 Player 能正常加载插件
                GameDetector.fixPluginAliases(in: game.root)
                let items = ZipWriter.collectFiles(in: game.root)
                guard !items.isEmpty else { throw ZipWriter.ZipWriterError.cannotCreate }
                let zipURL = exportDir.appendingPathComponent("\(game.root.lastPathComponent).zip")
                try ZipWriter.createStoredZip(items: items, to: zipURL)
                ok = true
                result = "已导出：\(zipURL.lastPathComponent)（\(items.count) 个文件）\n\n用法：\n1. 用「文件」App → 我的 iPhone → RPG Player → Exports\n2. 长按 zip →「共享」→ 选择 RPG Pocket / QuestPlay / RPGEmu 导入\n3. 导入后即可运行中文版"
            } catch {
                result = "导出失败：\(error.localizedDescription)"
            }
            DispatchQueue.main.async {
                self?.dismiss(animated: true) {
                    let done = UIAlertController(
                        title: ok ? "导出完成" : "导出失败",
                        message: result,
                        preferredStyle: .alert)
                    done.addAction(UIAlertAction(title: "好", style: .default))
                    self?.present(done, animated: true)
                }
            }
        }
    }

    private func restore() {
        guard let game = selectedGame else { return }
        let backups = DataTranslator.backups(for: game)
        guard !backups.isEmpty else {
            let a = UIAlertController(title: "没有备份", message: "开始翻译时会自动备份原 data，翻译后可一键还原。", preferredStyle: .alert)
            a.addAction(UIAlertAction(title: "好", style: .default))
            present(a, animated: true)
            return
        }
        let sheet = UIAlertController(title: "恢复原版 data", message: "选择备份时间点（翻译前的 data 快照）", preferredStyle: .actionSheet)
        for b in backups {
            let name = b.lastPathComponent.replacingOccurrences(of: "data_", with: "")
            sheet.addAction(UIAlertAction(title: name, style: .default) { [weak self] _ in
                guard let self = self else { return }
                let ok = DataTranslator.restoreData(game, from: b)
                let msg = ok ? "已还原，重新扫描即可。" : "还原失败。"
                let a = UIAlertController(title: ok ? "已还原" : "失败", message: msg, preferredStyle: .alert)
                a.addAction(UIAlertAction(title: "好", style: .default))
                self.present(a, animated: true)
            })
        }
        sheet.addAction(UIAlertAction(title: "取消", style: .cancel))
        if let pop = sheet.popoverPresentationController {
            pop.sourceView = view
            pop.sourceRect = view.bounds
        }
        present(sheet, animated: true)
    }

    /// 一键修复已导入游戏的格式：解密加密资源 + 注入 viewport/居中 CSS
    private func fixSelectedGame() {
        guard let game = selectedGame else { return }
        let alert = UIAlertController(title: "修复游戏格式", message: "将自动解密加密资源并注入横屏适配。修复过程中请勿关闭 App。", preferredStyle: .alert)
        present(alert, animated: true)
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            var msg = ""
            // 1) 解密
            if GameDecryptor.needsDecryption(in: game.root) {
                let r = GameDecryptor.decryptIfNeeded(in: game.root)
                if r.ok && r.files > 0 { msg += "已解密 \(r.files) 个文件\n" }
            }
            // 2) 注入 viewport
            GameImporter.fixViewport(in: game.root)
            msg += "已注入 viewport/居中 CSS"
            DispatchQueue.main.async {
                alert.dismiss(animated: true) {
                    let a = UIAlertController(title: "修复完成", message: msg, preferredStyle: .alert)
                    a.addAction(UIAlertAction(title: "好", style: .default))
                    self?.present(a, animated: true)
                }
            }
        }
    }

    private func applyTranslationFile() {
        let fm = FileManager.default
        let docs = fm.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let dir = docs.appendingPathComponent("translations", isDirectory: true)
        try? fm.createDirectory(at: dir, withIntermediateDirectories: true)
        let files = ((try? fm.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil)) ?? [])
            .filter { $0.pathExtension.lowercased() == "json" }
            .sorted { $0.lastPathComponent < $1.lastPathComponent }
        guard !files.isEmpty else {
            let a = UIAlertController(
                title: "没有翻译文件",
                message: "用文件App把 mtool 或其他工具导出的 JSON 翻译文件（{原文: 译文} 格式）放入：\n\n文件App → 我的 iPhone → RPG Player → translations 文件夹\n\n放好后重新点此项选择文件应用。\n\n提示：命名为 override.json 的词典会在翻译时自动优先命中（精修/术语一致）。",
                preferredStyle: .alert)
            a.addAction(UIAlertAction(title: "好", style: .default))
            present(a, animated: true)
            return
        }
        let sheet = UIAlertController(title: "应用翻译文件", message: "选择 translations 里的 JSON（应用前自动备份 data）", preferredStyle: .actionSheet)
        for f in files {
            sheet.addAction(UIAlertAction(title: f.lastPathComponent, style: .default) { [weak self] _ in
                guard let self = self else { return }
                self.applyFile(f)
            })
        }
        sheet.addAction(UIAlertAction(title: "取消", style: .cancel))
        if let pop = sheet.popoverPresentationController {
            pop.sourceView = view
            pop.sourceRect = view.bounds
        }
        present(sheet, animated: true)
    }

    private func applyFile(_ url: URL) {
        guard let data = try? Data(contentsOf: url),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: String],
              !obj.isEmpty else {
            let a = UIAlertController(title: "格式不正确", message: "翻译文件需要是 {原文: 译文} 的 JSON 对象。", preferredStyle: .alert)
            a.addAction(UIAlertAction(title: "好", style: .default))
            present(a, animated: true)
            return
        }
        guard let game = selectedGame else { return }
        let backed = DataTranslator.backupData(game) != nil
        let r = DataTranslator.applyMapping(obj, to: game)
        let msg = "应用完成：写回 \(r.refs) 处 / \(r.files) 个文件"
            + (backed ? "（已自动备份原 data）" : "（备份失败，请手动备份）")
        let a = UIAlertController(title: "完成", message: msg, preferredStyle: .alert)
        a.addAction(UIAlertAction(title: "好", style: .default))
        present(a, animated: true)
    }

    private func refreshStats() {
        guard let i = selectedIndex, i < games.count else { return }
        scanTask?.cancel()
        let w = DispatchWorkItem { [weak self] in
            guard let self = self else { return }
            let s = DataTranslator.scanStats(self.games[i])
            DispatchQueue.main.async { [weak self] in
                guard let self = self, !(self.scanTask?.isCancelled ?? true) else { return }
                self.stats = s
                self.tableView.reloadData()
            }
        }
        scanTask = w
        DispatchQueue.global(qos: .userInitiated).async(execute: w)
    }

    // MARK: - Table

    // 滑动删除游戏（清理游戏文件、备份与词典）
    override func tableView(_ tableView: UITableView, canEditRowAt indexPath: IndexPath) -> Bool {
        indexPath.section == 0 && !games.isEmpty
    }

    override func tableView(_ tableView: UITableView, commit editingStyle: UITableViewCell.EditingStyle, forRowAt indexPath: IndexPath) {
        guard editingStyle == .delete, indexPath.section == 0, indexPath.row < games.count else { return }
        let info = games[indexPath.row]
        let name = displayName(for: info)
        let confirm = UIAlertController(title: "删除游戏", message: "确定删除「\(name)」？\n\n将同时删除：\n· 游戏文件（含已翻译写回的内容）\n· 该游戏的备份与词典\n\n此操作不可恢复。", preferredStyle: .alert)
        confirm.addAction(UIAlertAction(title: "删除", style: .destructive) { [weak self] _ in
            self?.deleteGame(info, at: indexPath)
        })
        confirm.addAction(UIAlertAction(title: "取消", style: .cancel))
        present(confirm, animated: true)
    }

    private func deleteGame(_ info: GameInfo, at indexPath: IndexPath) {
        let fm = FileManager.default
        let docs = fm.urls(for: .documentDirectory, in: .userDomainMask)[0]
        // 游戏目录（含翻译写回的内容）
        try? fm.removeItem(at: info.root)
        // 备份目录
        for b in DataTranslator.backups(for: info) { try? fm.removeItem(at: b) }
        // 翻译词典
        let dict = docs.appendingPathComponent("translations")
            .appendingPathComponent(info.root.lastPathComponent + ".json")
        try? fm.removeItem(at: dict)
        // 若删除的是当前选中游戏，清理选中状态
        if selectedIndex == indexPath.row {
            selectedIndex = nil
            stats = nil
            summary = nil
            isRunning = false
            cancelFlag = false
            phaseLabel.text = " "
            progressView.progress = 0
        }
        refresh()
    }

    override func numberOfSections(in tableView: UITableView) -> Int { 2 }

    override func tableView(_ tableView: UITableView, titleForHeaderInSection section: Int) -> String? {
        section == 0 ? "游戏" : "操作"
    }

    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if section == 0 { return max(games.count, 1) }
        return selectedGame == nil ? 1 : 11
    }

    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if indexPath.section == 0 {
            let cell = tableView.dequeueReusableCell(withIdentifier: "cell", for: indexPath)
            if games.isEmpty {
                cell.textLabel?.text = "还没有游戏（点右上角 + 导入）"
                cell.textLabel?.textColor = .secondaryLabel
                cell.accessoryType = .none
            } else {
                let info = games[indexPath.row]
                cell.textLabel?.text = displayName(for: info)
                cell.textLabel?.textColor = .label
                let n = DataTranslator.savedMapping(for: info).count
                let type = GameImporter.detectGameType(in: info.root)
                cell.detailTextLabel?.text = "\(type) · " + (n > 0 ? "已翻译 \(n) 条" : "未翻译")
                cell.accessoryType = indexPath.row == selectedIndex ? .checkmark : .none
                if let icon = gameIcon(for: info.root) {
                    cell.imageView?.image = icon
                    cell.imageView?.layer.cornerRadius = 6
                    cell.imageView?.layer.masksToBounds = true
                } else {
                    cell.imageView?.image = UIImage(systemName: "gamecontroller")
                    cell.imageView?.tintColor = .systemOrange
                }
            }
            return cell
        }
        guard let game = selectedGame else {
            let cell = UITableViewCell(style: .default, reuseIdentifier: nil)
            cell.textLabel?.text = "请先选择上方游戏"
            cell.textLabel?.textColor = .secondaryLabel
            cell.selectionStyle = .none
            return cell
        }
        let cell = UITableViewCell(style: .value1, reuseIdentifier: nil)
        cell.selectionStyle = .none
        switch indexPath.row {
        case 0:
            cell.textLabel?.text = "数据文件"
            cell.detailTextLabel?.text = stats.map { "\($0.fileCount) 个" } ?? "扫描中…"
        case 1:
            cell.textLabel?.text = "文本位置"
            cell.detailTextLabel?.text = stats.map { "\($0.refCount) 处" } ?? "…"
        case 2:
            cell.textLabel?.text = "待翻译条目（去重）"
            cell.detailTextLabel?.text = stats.map { "\($0.uniqueCount) 条" } ?? "…"
        case 3:
            cell.textLabel?.text = isRunning ? "取消翻译" : "开始翻译"
            cell.textLabel?.textColor = isRunning ? .systemRed : .systemBlue
            cell.selectionStyle = .default
        case 4:
            cell.contentView.addSubview(progressView)
            cell.contentView.addSubview(phaseLabel)
            progressView.translatesAutoresizingMaskIntoConstraints = false
            phaseLabel.translatesAutoresizingMaskIntoConstraints = false
            NSLayoutConstraint.activate([
                progressView.leadingAnchor.constraint(equalTo: cell.contentView.leadingAnchor, constant: 16),
                progressView.trailingAnchor.constraint(equalTo: cell.contentView.trailingAnchor, constant: -16),
                progressView.topAnchor.constraint(equalTo: cell.contentView.topAnchor, constant: 14),
                phaseLabel.leadingAnchor.constraint(equalTo: cell.contentView.leadingAnchor, constant: 16),
                phaseLabel.trailingAnchor.constraint(equalTo: cell.contentView.trailingAnchor, constant: -16),
                phaseLabel.topAnchor.constraint(equalTo: progressView.bottomAnchor, constant: 8),
                phaseLabel.bottomAnchor.constraint(equalTo: cell.contentView.bottomAnchor, constant: -12)
            ])
        case 5:
            cell.textLabel?.text = "校对译文（手动精修）"
            cell.textLabel?.textColor = .systemIndigo
            cell.selectionStyle = .default
        case 6:
            cell.textLabel?.text = "应用翻译文件（mtool/JSON）"
            cell.textLabel?.textColor = .systemBlue
            cell.selectionStyle = .default
        case 7:
            cell.textLabel?.text = "导出翻译后的游戏（zip，供第三方 Player）"
            cell.textLabel?.textColor = .systemGreen
            cell.selectionStyle = .default
        case 8:
            cell.textLabel?.text = "恢复原版 data"
            cell.textLabel?.textColor = .systemOrange
            cell.selectionStyle = .default
        case 9:
            cell.textLabel?.text = "🔧 修复游戏格式（解密/viewport）"
            cell.textLabel?.textColor = .systemPurple
            cell.selectionStyle = .default
        case 10:
            cell.textLabel?.text = "▶ 运行游戏"
            cell.textLabel?.textColor = .systemGreen
            cell.selectionStyle = .default
        default:
            break
        }
        return cell
    }

    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        if indexPath.section == 0 {
            guard indexPath.row < games.count else { return }
            selectedIndex = indexPath.row
            stats = nil
            summary = nil
            isRunning = false
            cancelFlag = false
            phaseLabel.text = " "
            progressView.progress = 0
            tableView.reloadData()
            refreshStats()
            return
        }
        guard selectedGame != nil else { return }
        switch indexPath.row {
        case 3:
            isRunning ? stopTranslate() : startTranslate()
        case 5:
            guard let game = selectedGame else { return }
            let vc = ReviewViewController(game: game)
            let nav = UINavigationController(rootViewController: vc)
            nav.modalPresentationStyle = .fullScreen
            present(nav, animated: true)
        case 6:
            applyTranslationFile()
        case 7:
            exportGame()
        case 8:
            restore()
        case 9:
            fixSelectedGame()
        case 10:
            guard let game = selectedGame else { return }
            let vc = GameViewController(gameDir: game.root)
            navigationController?.pushViewController(vc, animated: true)
        default:
            break
        }
    }

    override func tableView(_ tableView: UITableView, titleForFooterInSection section: Int) -> String? {
        section == 0
            ? "把含 www/data（或 data）的游戏文件夹或 zip 压缩包放入本 App 的文稿目录，自动识别 MV/MZ。\n\n翻译完点「导出翻译后的游戏（zip）」交给第三方 Player（RPG Pocket / QuestPlay / RPGEmu）运行。"
            : nil
    }
}


extension GamesViewController: UIDocumentPickerDelegate {
    func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
        let fm = FileManager.default
        let docs = Self.documents
        var copied: [URL] = []
        var skipped: [String] = []
        for url in urls {
            guard url.pathExtension.lowercased() == "zip" else {
                skipped.append("\(url.lastPathComponent)（不是 .zip）")
                continue
            }
            // 系统文件选择器返回的安全作用域 URL：必须先 start 才能读取文件内容
            let accessing = url.startAccessingSecurityScopedResource()
            let dest = docs.appendingPathComponent(url.lastPathComponent)
            do {
                if fm.fileExists(atPath: dest.path) { try? fm.removeItem(at: dest) }
                try fm.copyItem(at: url, to: dest)
                copied.append(dest)
            } catch {
                skipped.append("\(url.lastPathComponent)（复制失败：\(error.localizedDescription)）")
            }
            if accessing { url.stopAccessingSecurityScopedResource() }
        }
        guard !copied.isEmpty else {
            let msg = skipped.isEmpty
                ? "请选择 .zip 压缩包。"
                : "未能导入：\n" + skipped.joined(separator: "\n") + "\n\n请确认选中的是 .zip 文件。"
            let a = UIAlertController(title: "没有可导入的 zip", message: msg, preferredStyle: .alert)
            a.addAction(UIAlertAction(title: "好", style: .default))
            present(a, animated: true)
            return
        }
        if !skipped.isEmpty {
            let a = UIAlertController(
                title: "部分文件未导入",
                message: skipped.joined(separator: "\n"),
                preferredStyle: .alert)
            a.addAction(UIAlertAction(title: "好", style: .default))
            present(a, animated: true)
        }
        enqueueImports(copied)
    }
}
