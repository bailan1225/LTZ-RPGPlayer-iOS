import UIKit

/// 译文校对：列出已翻译的 原文→译文，逐条编辑精修（对应 mtool 的手动校对），
/// 保存后写回游戏 data，并更新 translations/<游戏名>.json 映射
final class ReviewViewController: UITableViewController {

    private let game: GameInfo
    private var mapping: [String: String] = [:]
    private var keys: [String] = []
    private var filtered: [String] = []
    private let search = UISearchController(searchResultsController: nil)

    init(game: GameInfo) {
        self.game = game
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "校对译文"
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            title: "保存并写回", style: .done, target: self, action: #selector(saveAndApply))
        navigationItem.leftBarButtonItem = UIBarButtonItem(
            title: "取消", style: .plain, target: self, action: #selector(dismissSelf))
        search.searchResultsUpdater = self
        search.obscuresBackgroundDuringPresentation = false
        navigationItem.searchController = search
        reloadData()
    }

    private func reloadData() {
        mapping = DataTranslator.savedMapping(for: game)
        keys = mapping.keys.sorted { $0 < $1 }
        applyFilter(search.searchBar.text ?? "")
    }

    private func applyFilter(_ q: String) {
        if q.isEmpty {
            filtered = keys
        } else {
            filtered = keys.filter {
                $0.localizedCaseInsensitiveContains(q) ||
                (mapping[$0] ?? "").localizedCaseInsensitiveContains(q)
            }
        }
        tableView.reloadData()
    }

    @objc private func dismissSelf() {
        dismiss(animated: true)
    }

    @objc private func saveAndApply() {
        DataTranslator.saveMapping(mapping, for: game)
        let r = DataTranslator.applyMapping(mapping, to: game)
        let a = UIAlertController(
            title: "已保存并写回",
            message: "译文已写入 translations/\(game.root.lastPathComponent).json，并写回游戏 data \(r.refs) 处 / \(r.files) 个文件。",
            preferredStyle: .alert)
        a.addAction(UIAlertAction(title: "好", style: .default) { [weak self] _ in
            self?.dismiss(animated: true)
        })
        present(a, animated: true)
    }

    // MARK: - Table

    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        filtered.count
    }

    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = UITableViewCell(style: .subtitle, reuseIdentifier: nil)
        let k = filtered[indexPath.row]
        cell.textLabel?.text = mapping[k]
        cell.textLabel?.numberOfLines = 0
        cell.textLabel?.font = .systemFont(ofSize: 15)
        cell.detailTextLabel?.text = k
        cell.detailTextLabel?.numberOfLines = 0
        cell.detailTextLabel?.font = .systemFont(ofSize: 12)
        cell.detailTextLabel?.textColor = .secondaryLabel
        cell.accessoryType = .disclosureIndicator
        return cell
    }

    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        let k = filtered[indexPath.row]
        let a = UIAlertController(title: "编辑译文", message: "原文：\n\(k)", preferredStyle: .alert)
        a.addTextField { tf in
            tf.text = self.mapping[k]
            tf.autocorrectionType = .no
            tf.clearButtonMode = .whileEditing
        }
        a.addAction(UIAlertAction(title: "取消", style: .cancel))
        a.addAction(UIAlertAction(title: "保存", style: .default) { [weak self] _ in
            guard let self = self,
                  let v = a.textFields?.first?.text, !v.isEmpty else { return }
            self.mapping[k] = v
            self.applyFilter(self.search.searchBar.text ?? "")
        })
        present(a, animated: true)
    }
}

extension ReviewViewController: UISearchResultsUpdating {
    func updateSearchResults(for searchController: UISearchController) {
        applyFilter(searchController.searchBar.text ?? "")
    }
}
