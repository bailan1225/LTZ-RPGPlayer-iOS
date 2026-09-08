import UIKit

/// 翻译文件管理器（mtool 风格）：管理 translations/*.json（{原文:译文} 词典）与 dict.json，
/// 支持查看/编辑/导出/删除；这些文件同时也是播放游戏时的运行时词典
final class TranslationFilesViewController: UITableViewController {

    private var files: [URL] = []

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "翻译文件"
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            title: "新建词典", style: .plain, target: self, action: #selector(createDict))
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "cell")
        refresh()
        NotificationCenter.default.addObserver(
            self, selector: #selector(refresh),
            name: UIApplication.didBecomeActiveNotification, object: nil)
    }

    private static var filesDir: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("translations", isDirectory: true)
    }

    private static var docs: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }

    @objc private func refresh() {
        let fm = FileManager.default
        var list: [URL] = []
        let tr = Self.filesDir
        try? fm.createDirectory(at: tr, withIntermediateDirectories: true)
        if let fs = try? fm.contentsOfDirectory(at: tr, includingPropertiesForKeys: nil) {
            list.append(contentsOf: fs.filter { $0.pathExtension == "json" })
        }
        let userDict = Self.docs.appendingPathComponent("dict.json")
        if fm.fileExists(atPath: userDict.path) { list.append(userDict) }
        files = list.sorted { $0.lastPathComponent < $1.lastPathComponent }
        tableView.reloadData()
    }

    @objc private func createDict() {
        let a = UIAlertController(title: "新建词典", message: "输入文件名（不用写 .json），会创建空的 {原文: 译文} 文件：", preferredStyle: .alert)
        a.addTextField { tf in
            tf.placeholder = "如 mydict"
            tf.autocorrectionType = .no
        }
        a.addAction(UIAlertAction(title: "取消", style: .cancel))
        a.addAction(UIAlertAction(title: "创建", style: .default) { [weak self] _ in
            guard let self = self,
                  let name = a.textFields?.first?.text?.trimmingCharacters(in: .whitespaces),
                  !name.isEmpty else { return }
            let url = Self.filesDir.appendingPathComponent("\(name).json")
            guard !FileManager.default.fileExists(atPath: url.path) else {
                self.toast("同名文件已存在")
                return
            }
            do {
                try "{}".write(to: url, atomically: true, encoding: .utf8)
                self.refresh()
                self.pushEditor(url)
            } catch {
                self.toast("创建失败")
            }
        })
        present(a, animated: true)
    }

    private func pushEditor(_ url: URL) {
        let vc = TranslationFileEditorViewController(fileURL: url)
        navigationController?.pushViewController(vc, animated: true)
    }

    private func countEntries(_ url: URL) -> Int {
        guard let d = try? Data(contentsOf: url),
              let o = try? JSONSerialization.jsonObject(with: d) as? [String: String] else { return -1 }
        return o.count
    }

    private func toast(_ msg: String) {
        let a = UIAlertController(title: nil, message: msg, preferredStyle: .alert)
        a.addAction(UIAlertAction(title: "好", style: .default))
        present(a, animated: true)
    }

    // MARK: - Table

    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        max(files.count, 1)
    }

    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = UITableViewCell(style: .subtitle, reuseIdentifier: nil)
        if files.isEmpty {
            cell.textLabel?.text = "还没有翻译文件"
            cell.textLabel?.textColor = .secondaryLabel
            cell.accessoryType = .none
        } else {
            let f = files[indexPath.row]
            let n = countEntries(f)
            cell.textLabel?.text = f.lastPathComponent
            cell.textLabel?.textColor = .label
            cell.detailTextLabel?.text = n >= 0 ? "\(n) 条词条" : "无效 JSON"
            cell.accessoryType = .disclosureIndicator
        }
        return cell
    }

    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        guard !files.isEmpty else { return }
        pushEditor(files[indexPath.row])
    }

    override func tableView(_ tableView: UITableView, trailingSwipeActionsConfigurationForRowAt indexPath: IndexPath)
        -> UISwipeActionsConfiguration? {
        guard !files.isEmpty else { return nil }
        let f = files[indexPath.row]
        let export = UIContextualAction(style: .normal, title: "导出") { [weak self] _, _, done in
            guard let self = self else { return }
            let ac = UIActivityViewController(activityItems: [f], applicationActivities: nil)
            if let pop = ac.popoverPresentationController {
                pop.sourceView = self.view
                pop.sourceRect = self.tableView.rectForRow(at: indexPath)
            }
            self.present(ac, animated: true)
            done(true)
        }
        export.backgroundColor = .systemBlue
        let delete = UIContextualAction(style: .destructive, title: "删除") { [weak self] _, _, done in
            guard let self = self else { return }
            try? FileManager.default.removeItem(at: f)
            self.refresh()
            done(true)
        }
        return UISwipeActionsConfiguration(actions: [delete, export])
    }

    override func tableView(_ tableView: UITableView, titleForFooterInSection section: Int) -> String? {
        "translations/ 下的 JSON 词典在播放游戏时会自动加载（离线命中）；「新建词典」可先建空文件再手动填词条。"
    }
}

/// 词典编辑器：JSON 文本编辑 + 保存校验 + 导出
final class TranslationFileEditorViewController: UIViewController {

    private let fileURL: URL
    private var textView: UITextView!

    init(fileURL: URL) {
        self.fileURL = fileURL
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    override func viewDidLoad() {
        super.viewDidLoad()
        title = fileURL.lastPathComponent
        view.backgroundColor = .systemBackground

        let toolbar = UIToolbar()
        toolbar.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(toolbar)
        let save = UIBarButtonItem(title: "保存", style: .done, target: self, action: #selector(save))
        let export = UIBarButtonItem(title: "导出", style: .plain, target: self, action: #selector(exportFile))
        let space = UIBarButtonItem(barButtonSystemItem: .flexibleSpace, target: nil, action: nil)
        toolbar.setItems([space, export, save], animated: false)

        textView = UITextView()
        textView.translatesAutoresizingMaskIntoConstraints = false
        textView.font = .monospacedSystemFont(ofSize: 13, weight: .regular)
        textView.autocorrectionType = .no
        textView.autocapitalizationType = .none
        textView.keyboardDismissMode = .interactive
        textView.text = (try? String(contentsOf: fileURL, encoding: .utf8)) ?? "{}"
        view.addSubview(textView)

        NSLayoutConstraint.activate([
            toolbar.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            toolbar.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            toolbar.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            textView.topAnchor.constraint(equalTo: toolbar.bottomAnchor),
            textView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            textView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            textView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor)
        ])
    }

    @objc private func save() {
        guard let data = textView.text.data(using: .utf8) else {
            toast("编码错误，无法保存")
            return
        }
        guard let obj = try? JSONSerialization.jsonObject(with: data),
              JSONSerialization.isValidJSONObject(obj) else {
            toast("JSON 格式无效（注意每个键值都要加英文引号、用英文逗号分隔）")
            return
        }
        do {
            // 统一转成 {原文: 译文} 的漂亮格式
            if let dict = obj as? [String: String] {
                let pretty = try JSONSerialization.data(withJSONObject: dict, options: [.prettyPrinted])
                try pretty.write(to: fileURL, options: .atomic)
            } else {
                try data.write(to: fileURL, options: .atomic)
            }
            toast("已保存")
        } catch {
            toast("保存失败：\(error.localizedDescription)")
        }
    }

    @objc private func exportFile() {
        let ac = UIActivityViewController(activityItems: [fileURL], applicationActivities: nil)
        if let pop = ac.popoverPresentationController {
            pop.sourceView = view
            pop.sourceRect = view.bounds
        }
        present(ac, animated: true)
    }

    private func toast(_ msg: String) {
        let a = UIAlertController(title: nil, message: msg, preferredStyle: .alert)
        a.addAction(UIAlertAction(title: "好", style: .default))
        present(a, animated: true)
    }
}
