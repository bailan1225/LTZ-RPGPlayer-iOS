import UIKit

/// 翻译详情页：扫描统计 / 开始翻译 / 进度 / 导出 / 恢复原版
final class TranslateViewController: UITableViewController {

    private let game: GameInfo
    private let defaults = UserDefaults.standard

    private var stats: ScanStats?
    private var summary: TranslateSummary?
    private var lastMapping: [String: String] = [:]
    private var isRunning = false
    private var cancelFlag = false

    private lazy var progressView: UIProgressView = {
        let p = UIProgressView(progressViewStyle: .default)
        p.progress = 0
        return p
    }()
    private var phaseLabel = UILabel()

    init(game: GameInfo) {
        self.game = game
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    override func viewDidLoad() {
        super.viewDidLoad()
        title = game.root.lastPathComponent
        phaseLabel.numberOfLines = 0
        phaseLabel.font = .systemFont(ofSize: 13)
        phaseLabel.textColor = .secondaryLabel
        phaseLabel.text = " "
        refreshStats()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        refreshStats()
    }

    private var scanTask: DispatchWorkItem?

    private func refreshStats() {
        scanTask?.cancel()
        let w = DispatchWorkItem { [weak self] in
            guard let self = self else { return }
            let s = DataTranslator.scanStats(self.game)
            DispatchQueue.main.async { [weak self] in
                guard let self = self, !(self.scanTask?.isCancelled ?? true) else { return }
                self.stats = s
                self.tableView.reloadData()
            }
        }
        scanTask = w
        DispatchQueue.global(qos: .userInitiated).async(execute: w)
    }

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

    // MARK: - 操作

    private func startTranslate() {
        guard !isRunning else { return }
        let cfg = config()
        isRunning = true
        cancelFlag = false
        _ = DataTranslator.backupData(game)
        phaseLabel.text = "准备中…"
        progressView.progress = 0
        tableView.reloadData()

        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }
            DataTranslator.run(game: self.game, config: cfg,
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
                    self.lastMapping = sum.mapping
                    self.phaseLabel.text = sum.refsTotal == 0 && sum.translatedUnique == 0
                        ? "未找到可翻译文本（检查游戏是否为 MV/MZ 且 data 完整）"
                        : "完成：翻译 \(sum.translatedUnique) 条，写回 \(sum.refsChanged) 处 / \(sum.filesChanged) 个文件"
                    self.progressView.progress = 1
                    self.tableView.reloadData()
                    if sum.failedUnique > 0 && sum.failedUnique > sum.translatedUnique {
                        let detail = sum.lastError.isEmpty
                            ? "\n\n常见原因：Key 未填/无效、免费额度用尽、模型名不支持、网络不通。检查设置后重新翻译（已成功的不会重复翻）。"
                            : "\n\nAPI 返回：(sum.lastError)"
                        let alert = UIAlertController(
                            title: "翻译失败较多（(sum.failedUnique) 条）",
                            message: "可能原因：\n① 引擎 Key 未填或无效\n② 自定义 API 地址未以 /chat/completions 结尾\n③ 免费额度用尽\n④ 模型名不支持（Agnes 默认 agnes-2.5-flash / AQUA 默认 glm-4-flash）(detail)",
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

    private func exportGame() {
        let msg: String
        if let ex = DataTranslator.exportGame(game, mapping: lastMapping) {
            _ = ex
            msg = "已导出到：文件App → 我的 iPhone → RPG 翻译器 → Exports\n把 \(self.game.root.lastPathComponent) 文件夹拷贝/移动到「RPG Player」的文稿目录即可游玩。"
        } else {
            msg = "导出失败，请重试。"
        }
        let alert = UIAlertController(title: "导出", message: msg, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "好", style: .default))
        present(alert, animated: true)
    }

    private func restore() {
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
                let ok = DataTranslator.restoreData(self.game, from: b)
                let msg = ok ? "已还原，刷新游戏列表后重新扫描即可。" : "还原失败。"
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

    // MARK: - Table

    override func numberOfSections(in tableView: UITableView) -> Int { 3 }

    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        switch section {
        case 0: return 2
        case 1: return 3
        case 2: return isRunning ? 2 : 6
        default: return 0
        }
    }

    override func tableView(_ tableView: UITableView, titleForHeaderInSection section: Int) -> String? {
        switch section {
        case 0: return "游戏"
        case 1: return "扫描结果"
        case 2: return "操作"
        default: return nil
        }
    }

    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = UITableViewCell(style: .value1, reuseIdentifier: nil)
        cell.selectionStyle = .none
        switch (indexPath.section, indexPath.row) {
        case (0, 0):
            cell.textLabel?.text = "游戏目录"
            cell.detailTextLabel?.text = game.root.lastPathComponent
            cell.detailTextLabel?.numberOfLines = 2
        case (0, 1):
            cell.textLabel?.text = "data 位置"
            cell.detailTextLabel?.text = game.dataDir.path.replacingOccurrences(of: FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].path + "/", with: "")
        case (1, 0):
            cell.textLabel?.text = "数据文件"
            cell.detailTextLabel?.text = stats.map { "\($0.fileCount) 个" } ?? "扫描中…"
        case (1, 1):
            cell.textLabel?.text = "文本位置"
            cell.detailTextLabel?.text = stats.map { "\($0.refCount) 处" } ?? "…"
        case (1, 2):
            cell.textLabel?.text = "待翻译条目（去重）"
            cell.detailTextLabel?.text = stats.map { "\($0.uniqueCount) 条" } ?? "…"
        case (2, 0):
            cell.textLabel?.text = isRunning ? "取消翻译" : "开始翻译"
            cell.textLabel?.textColor = isRunning ? .systemRed : .systemBlue
            cell.selectionStyle = .default
        case (2, 1):
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
        case (2, 2):
            cell.textLabel?.text = "校对译文（手动精修）"
            cell.textLabel?.textColor = .systemIndigo
            cell.selectionStyle = .default
        case (2, 3):
            cell.textLabel?.text = "应用翻译文件（mtool/JSON）"
            cell.textLabel?.textColor = .systemBlue
            cell.selectionStyle = .default
        case (2, 4):
            cell.textLabel?.text = "导出到文件App"
            cell.textLabel?.textColor = .systemGreen
            cell.selectionStyle = .default
        case (2, 5):
            cell.textLabel?.text = "恢复原版 data"
            cell.textLabel?.textColor = .systemOrange
            cell.selectionStyle = .default
        default:
            break
        }
        return cell
    }

    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        guard indexPath.section == 2 else { return }
        switch indexPath.row {
        case 0:
            isRunning ? stopTranslate() : startTranslate()
        case 2:
            let vc = ReviewViewController(game: game)
            let nav = UINavigationController(rootViewController: vc)
            nav.modalPresentationStyle = .fullScreen
            present(nav, animated: true)
        case 3:
            applyTranslationFile()
        case 4:
            exportGame()
        case 5:
            restore()
        default:
            break
        }
    }

    // MARK: - 应用 mtool/外部翻译文件

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
                message: "用文件App把 mtool 或其他工具导出的 JSON 翻译文件（{原文: 译文} 格式）放入：\n\n文件App → 我的 iPhone → RPG 翻译器 → translations 文件夹\n\n放好后重新点此项选择文件应用。\n\n提示：命名为 override.json 的词典会在翻译时自动优先命中（精修/术语一致）。",
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
        let backed = DataTranslator.backupData(game) != nil
        let r = DataTranslator.applyMapping(obj, to: game)
        let msg = "应用完成：写回 \(r.refs) 处 / \(r.files) 个文件"
            + (backed ? "（已自动备份原 data）" : "（备份失败，请手动备份）")
        let a = UIAlertController(title: "完成", message: msg, preferredStyle: .alert)
        a.addAction(UIAlertAction(title: "好", style: .default))
        present(a, animated: true)
    }
}
