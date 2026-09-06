import UIKit
import UniformTypeIdentifiers

/// 游戏列表：递归扫描 Documents 下所有可识别的游戏目录（含 index.html 或 www）
final class GamesViewController: UITableViewController, UIDocumentPickerDelegate {

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

    @objc private func importGame() {
        let picker = UIDocumentPickerViewController(forOpeningContentTypes: [.folder], asCopy: true)
        picker.delegate = self
        picker.allowsMultipleSelection = true
        present(picker, animated: true)
    }

    func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
        let docs = Self.documents
        let fm = FileManager.default
        for url in urls {
            let target = docs.appendingPathComponent(url.lastPathComponent)
            try? fm.removeItem(at: target)
            do {
                try fm.moveItem(at: url, to: target)
            } catch {
                try? fm.copyItem(at: url, to: target)
            }
        }
        refreshGames()
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
        "导入游戏（任选其一）：\n① App 内点右上角 +，在文件里选中游戏文件夹（含 index.html 或 www 均可，自动识别）\n② 文件App → 我的 iPhone → RPG Player，把整个游戏文件夹拷进来\n③ 爱思助手 → 应用 → RPG Player → 浏览，直接把游戏文件夹拖进 Documents\n\n游戏运行页为横屏。"
    }
}
