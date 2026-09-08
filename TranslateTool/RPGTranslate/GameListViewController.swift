import UIKit

/// 游戏列表：识别 Documents 下所有含 data/System.json 的 MV/MZ 游戏
final class GameListViewController: UITableViewController {

    private var games: [GameInfo] = []

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "游戏"
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            barButtonSystemItem: .add, target: self, action: #selector(importGame))
        navigationItem.leftBarButtonItem = UIBarButtonItem(
            title: "翻译文件", style: .plain, target: self, action: #selector(openTranslationFiles))
        tableView.register(SubtitleCell.self, forCellReuseIdentifier: "cell")
        refresh()
        NotificationCenter.default.addObserver(
            self, selector: #selector(refresh),
            name: UIApplication.didBecomeActiveNotification, object: nil)
    }

    /// subtitle 风格 cell（显示"已翻译 N 条"）
    private final class SubtitleCell: UITableViewCell {
        override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
            super.init(style: .subtitle, reuseIdentifier: reuseIdentifier)
        }
        required init?(coder: NSCoder) { fatalError() }
    }

    @objc private func openTranslationFiles() {
        navigationController?.pushViewController(TranslationFilesViewController(), animated: true)
    }

    private static var documents: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }

    @objc private func refresh() {
        games = DataTranslator.findGames(in: Self.documents)
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

    /// iOS 17 侧载环境下系统文件夹选择器会闪退，这里不直接弹选择器，
    /// 改为导入指南 + 刷新（文件App / 爱思助手直拖是最稳妥的导入方式）
    @objc private func importGame() {
        let sheet = UIAlertController(title: "导入游戏", message: nil, preferredStyle: .actionSheet)
        sheet.addAction(UIAlertAction(title: "解压导入（zip 放进本 App 文档目录后在此选择）", style: .default) { [weak self] _ in
            guard let self = self else { return }
            let zips = ZipExtractor.pendingZips(in: Self.documents)
            if zips.isEmpty {
                let tip = UIAlertController(
                    title: "没有找到 zip",
                    message: "请用文件App / 爱思助手将游戏压缩包（.zip）放入本 App 的文档目录，然后再点「解压导入」。",
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
            ask.addAction(UIAlertAction(title: "解压导入", style: .default) { _ in self.importZip(z) })
            ask.addAction(UIAlertAction(title: "取消", style: .cancel))
            self.present(ask, animated: true)
        })
        sheet.addAction(UIAlertAction(title: "手动复制文件夹指南", style: .default) { [weak self] _ in
            guard let self = self else { return }
            let guide = UIAlertController(
                title: "手动复制",
                message: "把含 www/data（或 data）的游戏文件夹放入本 App 的文档目录：\n\n① 文件App：打开「文件」→「我的 iPhone」→「RPG 翻译器」，把整个游戏文件夹拖入\n\n② 爱思助手：连接设备 → 应用 → RPG 翻译器 → 浏览 → 把游戏文件夹拖进 Documents\n\n（如果是 zip 压缩包，直接在本页或 + 文件选择器里点「解压导入」即可）",
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

    /// 后台解压导入：解压 -> 定位游戏根 -> 移动到 Documents/<游戏名> -> 删除 zip -> 刷新
    private func importZip(_ zip: URL) {
        let progress = UIAlertController(
            title: "正在解压导入…",
            message: "大文件可能需要一会儿，请勿关闭 App",
            preferredStyle: .alert)
        present(progress, animated: true)
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            var result = ""
            var ok = false
            do {
                let docs = Self.documents
                let base = zip.deletingPathExtension().lastPathComponent
                let dest = docs.appendingPathComponent("\(base)_import", isDirectory: true)
                try? FileManager.default.removeItem(at: dest)
                try FileManager.default.createDirectory(at: dest, withIntermediateDirectories: true)
                let n = try ZipExtractor.extract(zip, to: dest)
                let gameRoot = ZipExtractor.locateGameRoot(in: dest) ?? dest
                let final = docs.appendingPathComponent(base, isDirectory: true)
                try? FileManager.default.removeItem(at: final)
                if gameRoot.path != dest.path {
                    try FileManager.default.moveItem(at: gameRoot, to: final)
                    try? FileManager.default.removeItem(at: dest)
                } else {
                    try FileManager.default.moveItem(at: dest, to: final)
                }
                try? FileManager.default.removeItem(at: zip)
                ok = true
                result = "导入成功：\(base)\n共解压 \(n) 个文件"
            } catch {
                result = "导入失败：\(error.localizedDescription)"
            }
            DispatchQueue.main.async {
                self?.dismiss(animated: true) {
                    self?.refresh()
                    let done = UIAlertController(
                        title: ok ? "导入完成" : "导入失败",
                        message: result,
                        preferredStyle: .alert)
                    done.addAction(UIAlertAction(title: "好", style: .default))
                    self?.present(done, animated: true)
                }
            }
        }
    }

    /// 打开 App 时发现 Documents 根目录有 zip -> 弹窗确认导入
    private func checkPendingZips() {
        guard let z = ZipExtractor.pendingZips(in: Self.documents).first else { return }
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

    // MARK: - Table

    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        max(games.count, 1)
    }

    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "cell", for: indexPath)
        if games.isEmpty {
            cell.textLabel?.text = "还没有游戏"
            cell.textLabel?.textColor = .secondaryLabel
            cell.accessoryType = .none
        } else {
            let info = games[indexPath.row]
            cell.textLabel?.text = displayName(for: info)
            cell.textLabel?.textColor = .label
            let n = DataTranslator.savedMapping(for: info).count
            cell.detailTextLabel?.text = n > 0 ? "已翻译 \(n) 条（播放时自动命中）" : "未翻译 · 可直接播放（词典自动命中）"
            cell.accessoryType = .disclosureIndicator
        }
        return cell
    }

    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        guard !games.isEmpty else { return }
        let info = games[indexPath.row]
        let a = UIAlertController(
            title: displayName(for: info),
            message: info.root.lastPathComponent,
            preferredStyle: .actionSheet)
        a.addAction(UIAlertAction(title: "翻译 / 校对 / 导出", style: .default) { [weak self] _ in
            guard let self = self else { return }
            self.navigationController?.pushViewController(TranslateViewController(game: info), animated: true)
        })
        a.addAction(UIAlertAction(title: "导出翻译后的游戏（zip，供第三方 Player 运行）", style: .default) { [weak self] _ in
            guard let self = self else { return }
            self.exportGame(info)
        })
        a.addAction(UIAlertAction(title: "取消", style: .cancel))
        if let pop = a.popoverPresentationController {
            pop.sourceView = view
            pop.sourceRect = tableView.rectForRow(at: indexPath)
        }
        present(a, animated: true)
    }

    /// 把翻译后的游戏整包导出为 zip 到 Documents/Exports，供 RPG Pocket / QuestPlay / RPGEmu 等第三方 Player 导入运行
    private func exportGame(_ info: GameInfo) {
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
                let name = self?.displayName(for: info) ?? info.root.lastPathComponent
                let zipURL = exportDir.appendingPathComponent("\(name).zip")
                // 导出前修复多语言插件名（日文/中文 js），保证第三方 Player 能正常加载插件
                GameDetector.fixPluginAliases(in: info.root)
                let items = ZipWriter.collectFiles(in: info.root)
                guard !items.isEmpty else { throw ZipWriter.ZipWriterError.cannotCreate }
                try ZipWriter.createStoredZip(items: items, to: zipURL)
                ok = true
                result = "已导出：\(zipURL.lastPathComponent)\n（\(items.count) 个文件）\n\n用法：\n1. 安装任意第三方 Player（RPG Pocket / QuestPlay / RPGEmu，App Store 免费）\n2. 用「文件」App → 我的 iPhone → RPG 翻译器 → Exports，找到该 zip\n3. 长按 zip →「共享」→ 选择该 Player，或直接在 Player 内从文件App 导入\n\n导入后即可运行中文版，无需再经过本 App 的播放器。"
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

    override func tableView(_ tableView: UITableView, titleForFooterInSection section: Int) -> String? {
        "把含 www/data（或 data）的游戏文件夹或 zip 压缩包放入本 App 的文稿目录，自动识别 MV/MZ。\n\n翻译完可点「导出翻译后的游戏（zip）」交给第三方 Player（RPG Pocket / QuestPlay / RPGEmu）运行，或直接点「播放游戏」使用内置播放器（横屏）。"
    }
}
