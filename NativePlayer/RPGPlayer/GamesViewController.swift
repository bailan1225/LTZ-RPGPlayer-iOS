import UIKit

/// 游戏列表：递归扫描 Documents 下所有可识别的游戏目录（含 index.html 或 www）
final class GamesViewController: UITableViewController {

    private var games: [URL] = []

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "RPG Player"
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            barButtonSystemItem: .add, target: self, action: #selector(importGame))
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "cell")
        refreshGames()
        NotificationCenter.default.addObserver(
            self, selector: #selector(refreshGames),
            name: UIApplication.didBecomeActiveNotification, object: nil)
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
                    found.append(s)
                } else {
                    scan(s, depth + 1)
                }
            }
        }

        // Documents 根本身也可能是裸 www 游戏（js 直接铺在根下）
        if GameDetector.isGameDir(docs) {
            found.append(docs)
        }
        scan(docs, 1)

        games = found.sorted { $0.path < $1.path }
        tableView.reloadData()
    }

    private func displayName(for url: URL) -> String {
        let docs = Self.documents
        if url.path == docs.path { return "（根目录）" }
        if url.path.hasPrefix(docs.path + "/") {
            let rel = String(url.path.dropFirst(docs.path.count + 1))
            return rel
        }
        return url.lastPathComponent
    }

    /// iOS 17 侧载环境下系统文件夹选择器会闪退，这里不直接弹选择器，
    /// 改为导入指南 + 刷新（文件App / 爱思助手直拖是最稳妥的导入方式）
    @objc private func importGame() {
        let alert = UIAlertController(
            title: "导入游戏",
            message: "把游戏文件夹放入本 App 的文稿目录（自动识别 index.html / www / 裸 www）：\n\n① 文件App：打开「文件」→「我的 iPhone」→「RPG Player」，把整个游戏文件夹拷入\n\n② 爱思助手：连接设备 → 应用 → RPG Player → 浏览 → 把游戏文件夹直接拖进 Documents\n\n拷入后点「刷新列表」即可自动识别。",
            preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "刷新列表", style: .default) { [weak self] _ in
            self?.refreshGames()
        })
        alert.addAction(UIAlertAction(title: "好", style: .cancel))
        present(alert, animated: true)
    }

    // MARK: - Table view

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
            cell.textLabel?.text = displayName(for: games[indexPath.row])
            cell.textLabel?.textColor = .label
            cell.accessoryType = .disclosureIndicator
        }
        return cell
    }

    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        guard !games.isEmpty else { return }
        let vc = GameViewController(gameDir: games[indexPath.row])
        navigationController?.pushViewController(vc, animated: true)
    }

    override func tableView(_ tableView: UITableView, titleForFooterInSection section: Int) -> String? {
        "导入游戏：文件App 或爱思助手把游戏文件夹放入本 App 的 Documents（含 index.html 或 www 均可，自动识别），回本 App 点右上角 + 选「刷新列表」。\n\n游戏运行页为横屏。"
    }
}
