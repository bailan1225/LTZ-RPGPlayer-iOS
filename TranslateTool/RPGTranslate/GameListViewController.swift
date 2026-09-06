import UIKit
import UniformTypeIdentifiers

/// 游戏列表：识别 Documents 下所有含 data/System.json 的 MV/MZ 游戏
final class GameListViewController: UITableViewController, UIDocumentPickerDelegate {

    private var games: [GameInfo] = []

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "RPG 翻译器"
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            barButtonSystemItem: .add, target: self, action: #selector(importGame))
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "cell")
        refresh()
        NotificationCenter.default.addObserver(
            self, selector: #selector(refresh),
            name: UIApplication.didBecomeActiveNotification, object: nil)
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
        refresh()
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
            cell.textLabel?.text = displayName(for: games[indexPath.row])
            cell.textLabel?.textColor = .label
            cell.accessoryType = .disclosureIndicator
        }
        return cell
    }

    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        guard !games.isEmpty else { return }
        let vc = TranslateViewController(game: games[indexPath.row])
        navigationController?.pushViewController(vc, animated: true)
    }

    override func tableView(_ tableView: UITableView, titleForFooterInSection section: Int) -> String? {
        "把含 www/data（或 data）的游戏文件夹放入 RPG 翻译器的文稿目录（文件App / 爱思助手直拖），自动识别 MV/MZ。翻译后导出整份游戏，放入「RPG Player」即可玩到中文版。"
    }
}
