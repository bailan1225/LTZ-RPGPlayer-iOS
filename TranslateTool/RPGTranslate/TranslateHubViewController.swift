import UIKit

/// 翻译工作台：列出可翻译的游戏，点选进入批量翻译；顶部进翻译文件管理
final class TranslateHubViewController: UITableViewController {

    private var games: [GameInfo] = []

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "翻译"
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            title: "翻译文件", style: .plain, target: self, action: #selector(openTranslationFiles))
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "cell")
        refresh()
        NotificationCenter.default.addObserver(
            self, selector: #selector(refresh),
            name: UIApplication.didBecomeActiveNotification, object: nil)
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

    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        max(games.count, 1)
    }

    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "cell", for: indexPath)
        if games.isEmpty {
            cell.textLabel?.text = "还没有可翻译的游戏"
            cell.textLabel?.textColor = .secondaryLabel
            cell.accessoryType = .none
        } else {
            let info = games[indexPath.row]
            cell.textLabel?.text = info.root.lastPathComponent
            cell.textLabel?.textColor = .label
            let n = DataTranslator.savedMapping(for: info).count
            cell.detailTextLabel?.text = n > 0 ? "已翻译 \(n) 条 · 点按继续翻译 / 校对" : "未翻译 · 点按开始批量翻译"
            cell.accessoryType = .disclosureIndicator
        }
        return cell
    }

    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        guard !games.isEmpty else { return }
        navigationController?.pushViewController(TranslateViewController(game: games[indexPath.row]), animated: true)
    }

    override func tableView(_ tableView: UITableView, titleForFooterInSection section: Int) -> String? {
        "批量提取游戏 data 里的地图与数据库文本 → AI 翻译 → 写回，并生成 translations/ 词典。翻译完回到「游戏」页即可直接播放中文版，无需导出转移。"
    }
}
