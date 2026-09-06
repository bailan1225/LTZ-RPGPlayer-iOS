import UIKit
import UniformTypeIdentifiers

/// 游戏列表：列出 Documents 下所有含 index.html 的游戏目录
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

    private static var documents: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }

    @objc private func refreshGames() {
        let docs = Self.documents
        let fm = FileManager.default
        let all = (try? fm.contentsOfDirectory(at: docs, includingPropertiesForKeys: nil,
                                               options: [.skipsHiddenFiles])) ?? []
        games = all
            .filter { $0.hasDirectoryPath && fm.fileExists(atPath: $0.appendingPathComponent("index.html").path) }
            .sorted { $0.lastPathComponent < $1.lastPathComponent }
        tableView.reloadData()
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
            cell.textLabel?.text = games[indexPath.row].lastPathComponent
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
        "把含 index.html 的游戏文件夹放入：文件App → 我的 iPhone → RPG Player（或通过 iTunes 文件共享），回到本页自动刷新。"
    }
}
