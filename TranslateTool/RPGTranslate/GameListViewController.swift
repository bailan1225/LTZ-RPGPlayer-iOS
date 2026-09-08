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
        let alert = UIAlertController(
            title: "导入游戏",
            message: "把含 www/data（或 data）的游戏文件夹放入本 App 的文稿目录：\n\n① 文件App：打开「文件」→「我的 iPhone」→「RPG 翻译器」，把整个游戏文件夹拷入\n\n② 爱思助手：连接设备 → 应用 → RPG 翻译器 → 浏览 → 把游戏文件夹直接拖进 Documents\n\n拷入后点「刷新列表」即可自动识别 MV/MZ。",
            preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "刷新列表", style: .default) { [weak self] _ in
            self?.refresh()
        })
        alert.addAction(UIAlertAction(title: "好", style: .cancel))
        present(alert, animated: true)
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
        a.addAction(UIAlertAction(title: "▶ 播放游戏（带翻译+作弊器）", style: .default) { [weak self] _ in
            guard let self = self else { return }
            let vc = GameViewController(gameDir: info.root)
            self.navigationController?.pushViewController(vc, animated: true)
        })
        a.addAction(UIAlertAction(title: "翻译 / 校对 / 导出", style: .default) { [weak self] _ in
            guard let self = self else { return }
            self.navigationController?.pushViewController(TranslateViewController(game: info), animated: true)
        })
        a.addAction(UIAlertAction(title: "取消", style: .cancel))
        if let pop = a.popoverPresentationController {
            pop.sourceView = view
            pop.sourceRect = tableView.rectForRow(at: indexPath)
        }
        present(a, animated: true)
    }

    override func tableView(_ tableView: UITableView, titleForFooterInSection section: Int) -> String? {
        "把含 www/data（或 data）的游戏文件夹放入本 App 的文稿目录（文件App / 爱思助手直拖），自动识别 MV/MZ。\n\n游戏、词典、翻译、存档全部在本 App 内共用：翻译完直接点「播放」即可玩到中文版，无需导出转移。游戏运行页为横屏。"
    }
}
