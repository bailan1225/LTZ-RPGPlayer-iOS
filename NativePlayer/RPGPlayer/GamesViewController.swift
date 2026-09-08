import UIKit
import UniformTypeIdentifiers

/// 游戏列表：递归扫描 Documents 下所有可识别的游戏目录（含 index.html 或 www），
/// 支持 zip 直接导入（系统文件选择器，与翻译器同款流程）
final class GamesViewController: UITableViewController, UIDocumentPickerDelegate {

    private var games: [URL] = []
    private var translationCounts: [String: Int] = [:]  // 目录名 → 已翻译词条数

    private static var translationsDir: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("translations", isDirectory: true)
    }

    /// 读取该游戏已保存的翻译词条数（translations/<目录名>.json，由翻译器/mtool 版生成）
    private func translationCount(for url: URL) -> Int? {
        let key = url.lastPathComponent
        if let hit = translationCounts[key] { return hit }
        let f = Self.translationsDir.appendingPathComponent(key + ".json")
        guard let d = try? Data(contentsOf: f),
              let o = try? JSONSerialization.jsonObject(with: d) as? [String: String] else {
            translationCounts[key] = 0
            return nil
        }
        translationCounts[key] = o.count
        return o.count
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "RPG Player"
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            barButtonSystemItem: .add, target: self, action: #selector(importGame))
        navigationItem.leftBarButtonItem = UIBarButtonItem(
            title: "日志", style: .plain, target: self, action: #selector(showLog))
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "cell")
        tableView.rowHeight = 64
        refreshGames()
        NotificationCenter.default.addObserver(
            self, selector: #selector(refreshGames),
            name: UIApplication.didBecomeActiveNotification, object: nil)
    }

    /// 崩溃日志查看（crash.log 由 CrashReporter 写入），支持一键分享排查
    @objc private func showLog() {
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let url = docs.appendingPathComponent("crash.log")
        let text = (try? String(contentsOf: url, encoding: .utf8)) ?? "（还没有崩溃日志）"
        let ac = UIActivityViewController(activityItems: ["RPG Player 崩溃日志：\n" + text], applicationActivities: nil)
        if let pop = ac.popoverPresentationController {
            pop.sourceView = view
            pop.sourceRect = view.bounds
        }
        present(ac, animated: true)
    }

    override var supportedInterfaceOrientations: UIInterfaceOrientationMask { .portrait }

    private static var documents: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }

    @objc private func refreshGames() {
        let docs = Self.documents
        let fm = FileManager.default
        var found: [URL] = []

        func scan(_ dir: URL, _ depth: Int) {
            guard depth <= 3 else { return }
            let subs = (try? fm.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil,
                                                    options: [.skipsHiddenFiles])) ?? []
            for s in subs where s.hasDirectoryPath {
                if GameDetector.isGameDir(s) {
                    // 目录名含特殊字符时自动重命名为安全名（WKWebView 才能正常加载）
                    found.append(SafePath.sanitize(s))
                } else {
                    scan(s, depth + 1)
                }
            }
        }

        // Documents 根本本身也可能是裸 www 游戏（js 直接铺在根下）
        if GameDetector.isGameDir(docs) {
            found.append(SafePath.sanitize(docs))
        }
        scan(docs, 1)

        games = found.sorted { $0.path < $1.path }
        tableView.reloadData()
    }

    private func displayName(for url: URL) -> String {
        if let original = SafePath.originalName(for: url) {
            return original
        }
        let docs = Self.documents
        if url.path == docs.path { return "（根目录）" }
        if url.path.hasPrefix(docs.path + "/") {
            let rel = String(url.path.dropFirst(docs.path.count + 1))
            return rel
        }
        return url.lastPathComponent
    }

    /// 游戏封面缩略图：查找 MV/MZ 的 icon.png（www/icon.png 或根目录 icon.png）
    private func gameIcon(for url: URL) -> UIImage? {
        let fm = FileManager.default
        let candidates = [
            url.appendingPathComponent("www").appendingPathComponent("icon.png"),
            url.appendingPathComponent("icon.png")
        ]
        for c in candidates where fm.fileExists(atPath: c.path) {
            if let img = UIImage(contentsOfFile: c.path) {
                return img
            }
        }
        return nil
    }

    @objc private func importGame() {
        let sheet = UIAlertController(title: "导入游戏", message: nil, preferredStyle: .actionSheet)
        sheet.addAction(UIAlertAction(title: "导入 zip 文件", style: .default) { [weak self] _ in
            self?.pickZip()
        })
        sheet.addAction(UIAlertAction(title: "导入文件夹（文件App / 爱思）", style: .default) { [weak self] _ in
            self?.showFolderGuide()
        })
        sheet.addAction(UIAlertAction(title: "刷新列表", style: .default) { [weak self] _ in
            self?.refreshGames()
        })
        sheet.addAction(UIAlertAction(title: "取消", style: .cancel))
        if let pop = sheet.popoverPresentationController {
            pop.sourceView = view
            pop.sourceRect = view.bounds
        }
        present(sheet, animated: true)
    }

    private func pickZip() {
        let picker = UIDocumentPickerViewController(forOpeningContentTypes: [.zip], asCopy: true)
        picker.delegate = self
        picker.allowsMultipleSelection = false
        present(picker, animated: true)
    }

    private func showFolderGuide() {
        let alert = UIAlertController(
            title: "导入文件夹",
            message: "把游戏文件夹放入本 App 的文稿目录（自动识别 index.html / www / 裸 www）：\n\n① 文件App：打开「文件」→「我的 iPhone」→「RPG Player」，把整个游戏文件夹拷入\n\n② 爱思助手：连接设备 → 应用 → RPG Player → 浏览 → 把游戏文件夹直接拖进 Documents\n\n拷入后点「刷新列表」即可自动识别。",
            preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "刷新列表", style: .default) { [weak self] _ in
            self?.refreshGames()
        })
        alert.addAction(UIAlertAction(title: "好", style: .cancel))
        present(alert, animated: true)
    }

    // MARK: - UIDocumentPickerDelegate（zip 导入）

    func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
        guard let src = urls.first else { return }
        // 安全作用域：必须先申请访问权限再读文件（否则复制必然失败）
        let scoped = src.startAccessingSecurityScopedResource()
        defer { if scoped { src.stopAccessingSecurityScopedResource() } }
        let docs = Self.documents
        let name = src.deletingPathExtension().lastPathComponent
        let dest = docs.appendingPathComponent(name, isDirectory: true)
        try? FileManager.default.createDirectory(at: dest, withIntermediateDirectories: true)
        do {
            let n = try ZipExtractor.extract(src, to: dest)
            refreshGames()
            let alert = UIAlertController(
                title: "导入完成",
                message: "已解压 \(n) 个文件到「\(name)」。\n若列表出现同名重复项，保留含 www/index.html 的那个，其余可自行删除。",
                preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "好", style: .default))
            present(alert, animated: true)
        } catch {
            try? FileManager.default.removeItem(at: dest)
            let alert = UIAlertController(title: "导入失败", message: "\(error.localizedDescription)", preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "好", style: .default))
            present(alert, animated: true)
        }
    }

    // MARK: - Table view

    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        max(games.count, 1)
    }

    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = UITableViewCell(style: .subtitle, reuseIdentifier: nil)
        if games.isEmpty {
            cell.textLabel?.text = "还没有游戏"
            cell.textLabel?.textColor = .secondaryLabel
            cell.accessoryType = .none
        } else {
            let url = games[indexPath.row]
            cell.textLabel?.text = displayName(for: url)
            cell.textLabel?.textColor = .label
            if let n = translationCount(for: url), n > 0 {
                cell.detailTextLabel?.text = "已翻译 \(n) 条（播放时自动命中）"
            }
            cell.accessoryType = .disclosureIndicator
            if let icon = gameIcon(for: url) {
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

    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        guard !games.isEmpty else { return }
        let vc = GameViewController(gameDir: games[indexPath.row])
        navigationController?.pushViewController(vc, animated: true)
    }

    override func tableView(_ tableView: UITableView,
                            trailingSwipeActionsConfigurationForRowAt indexPath: IndexPath) -> UISwipeActionsConfiguration? {
        guard !games.isEmpty else { return nil }
        let url = games[indexPath.row]
        let translate = UIContextualAction(style: .normal, title: "翻译") { [weak self] _, _, done in
            self?.translateGame(url)
            done(true)
        }
        translate.backgroundColor = .systemBlue
        let delete = UIContextualAction(style: .destructive, title: "删除") { [weak self] _, _, done in
            self?.confirmDelete(url)
            done(true)
        }
        return UISwipeActionsConfiguration(actions: [delete, translate])
    }

    /// 批量翻译选中游戏：整游戏 data 文本跑引擎，结果写 translations/<游戏名>.json + 写回游戏
    private func translateGame(_ url: URL) {
        guard let game = DataTranslator.info(forGameRoot: url) else {
            alert("无法识别", "该目录下没有找到 data/System.json。")
            return
        }
        let config = TranslationConfig.loadFromDefaults()
        if config.engine == .offline {
            // 离线：只应用已保存的翻译映射（translations/<游戏名>.json → 写回游戏 data）
            let map = DataTranslator.savedMapping(for: game)
            if map.isEmpty {
                alert("离线模式", "请先在「设置」中选择在线翻译引擎；或放入 translations/<游戏名>.json 后重试。")
                return
            }
            let r = DataTranslator.applyMapping(map, to: game)
            refreshGames()
            alert("已应用翻译", "写回 \(r.refs) 处（\(r.files) 个文件）。")
            return
        }
        let progressAlert = UIAlertController(title: "正在翻译…", message: "准备中", preferredStyle: .alert)
        progressAlert.addAction(UIAlertAction(title: "取消", style: .cancel))
        present(progressAlert, animated: true)
        var cancelled = false
        DataTranslator.run(game: game, config: config,
                           progress: { p in
            progressAlert.message = "\(p.phase)（\(p.done)/\(p.total)）"
        }, cancelled: { cancelled },
                           completion: { [weak self] summary in
            progressAlert.dismiss(animated: true)
            guard let self = self else { return }
            self.refreshGames()
            if summary.refsChanged > 0 || summary.translatedUnique > 0 {
                self.alert("翻译完成",
                           "新翻译 \(summary.translatedUnique) 条，写回 \(summary.refsChanged) 处。\n进入游戏自动离线命中，可左滑再次翻译增量补翻。")
            } else if summary.failedUnique > 0 {
                self.alert("部分失败", "有 \(summary.failedUnique) 条未翻译。\n原因：\(summary.lastError)")
            } else {
                self.alert("无新内容", "没有可翻译的新文本（或全部已缓存）。")
            }
        })
    }

    private func confirmDelete(_ url: URL) {
        let name = displayName(for: url)
        let alert = UIAlertController(title: "删除「\(name)」？",
                                      message: "将删除游戏文件、对应备份目录与 translations/<目录名>.json 词典。此操作不可恢复。",
                                      preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "删除", style: .destructive) { [weak self] _ in
            self?.deleteGame(url)
        })
        alert.addAction(UIAlertAction(title: "取消", style: .cancel))
        present(alert, animated: true)
    }

    private func deleteGame(_ url: URL) {
        let fm = FileManager.default
        let docs = Self.documents
        let key = url.lastPathComponent
        // 游戏目录
        try? fm.removeItem(at: url)
        // 对应备份目录（Backups/<目录名>）
        let backup = docs.appendingPathComponent("Backups", isDirectory: true)
            .appendingPathComponent(key, isDirectory: true)
        try? fm.removeItem(at: backup)
        // 翻译词典（translations/<目录名>.json）
        let mapFile = Self.translationsDir.appendingPathComponent(key + ".json")
        try? fm.removeItem(at: mapFile)
        translationCounts.removeValue(forKey: key)
        refreshGames()
    }

    private func alert(_ title: String, _ message: String) {
        let a = UIAlertController(title: title, message: message, preferredStyle: .alert)
        a.addAction(UIAlertAction(title: "好", style: .default))
        present(a, animated: true)
    }

    override func tableView(_ tableView: UITableView, titleForFooterInSection section: Int) -> String? {
        "导入游戏：右上角 + 可直接导入 zip；或文件App / 爱思助手把游戏文件夹放入本 App 的 Documents（含 index.html 或 www 均可，自动识别）。\n\n游戏运行页为横屏。"
    }
}
