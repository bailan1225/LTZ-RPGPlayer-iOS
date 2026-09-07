import UIKit

/// 翻译设置（键名与播放器 App 一致，用户习惯可复用）
final class SettingsViewController: UITableViewController, UITextFieldDelegate {

    private let defaults = UserDefaults.standard
    private var engineControl: UISegmentedControl!
    private var sourceField: UITextField!
    private var targetField: UITextField!
    private var urlField: UITextField!
    private var keyField: UITextField!

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "翻译设置"
        tableView = UITableView(frame: .zero, style: .insetGrouped)

        engineControl = UISegmentedControl(items: ["离线词典", "MyMemory", "自定义API"])
        engineControl.selectedSegmentIndex = defaults.integer(forKey: "tr_engine")
        engineControl.addTarget(self, action: #selector(engineChanged), for: .valueChanged)

        sourceField = makeField(placeholder: "如 ja / en", text: defaults.string(forKey: "tr_source") ?? "ja", secure: false)
        targetField = makeField(placeholder: "如 zh-CN", text: defaults.string(forKey: "tr_target") ?? "zh-CN", secure: false)
        urlField = makeField(placeholder: "https://…?q={text}&key={key}", text: defaults.string(forKey: "tr_api_url") ?? "", secure: false)
        keyField = makeField(placeholder: "API Key（旧 key 过期直接重填）", text: defaults.string(forKey: "tr_api_key") ?? "", secure: true)
    }

    private func makeField(placeholder: String, text: String, secure: Bool) -> UITextField {
        let f = UITextField()
        f.placeholder = placeholder
        f.text = text
        f.isSecureTextEntry = secure
        f.autocapitalizationType = .none
        f.autocorrectionType = .no
        f.clearButtonMode = .whileEditing
        f.delegate = self
        f.addTarget(self, action: #selector(fieldChanged), for: .editingChanged)
        return f
    }

    @objc private func engineChanged() {
        defaults.set(engineControl.selectedSegmentIndex, forKey: "tr_engine")
    }

    @objc private func fieldChanged() {
        defaults.set(sourceField.text ?? "", forKey: "tr_source")
        defaults.set(targetField.text ?? "", forKey: "tr_target")
        defaults.set(urlField.text ?? "", forKey: "tr_api_url")
        defaults.set(keyField.text ?? "", forKey: "tr_api_key")
    }

    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        textField.resignFirstResponder()
        return true
    }

    // MARK: - Table

    override func numberOfSections(in tableView: UITableView) -> Int { 4 }

    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        switch section {
        case 0: return 1
        case 1: return 2
        case 2: return 2
        case 3: return 2
        default: return 0
        }
    }

    override func tableView(_ tableView: UITableView, titleForHeaderInSection section: Int) -> String? {
        switch section {
        case 0: return "翻译引擎"
        case 1: return "语言"
        case 2: return "自定义 API（引擎选自定义API时生效）"
        case 3: return ""
        default: return nil
        }
    }

    override func tableView(_ tableView: UITableView, titleForFooterInSection section: Int) -> String? {
        switch section {
        case 0: return "MyMemory 免费接口有每日限额；自定义API 地址中 {text} 为原文、{key} 为密钥占位符，返回 JSON 的 translatedText / translation 字段或纯文本。"
        case 3: return "离线词典：把 dict.json（键=原文，值=译文，UTF-8）放入「文件App → 我的 iPhone → RPG 翻译器」，优先于内置词典。"
        default: return nil
        }
    }

    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = UITableViewCell(style: .default, reuseIdentifier: nil)
        cell.selectionStyle = .none
        switch (indexPath.section, indexPath.row) {
        case (0, 0):
            cell.contentView.addSubview(engineControl)
            engineControl.translatesAutoresizingMaskIntoConstraints = false
            NSLayoutConstraint.activate([
                engineControl.leadingAnchor.constraint(equalTo: cell.contentView.leadingAnchor, constant: 16),
                engineControl.trailingAnchor.constraint(equalTo: cell.contentView.trailingAnchor, constant: -16),
                engineControl.topAnchor.constraint(equalTo: cell.contentView.topAnchor, constant: 8),
                engineControl.bottomAnchor.constraint(equalTo: cell.contentView.bottomAnchor, constant: -8)
            ])
        case (1, 0):
            cell.textLabel?.text = "源语言"
            cell.accessoryView = sourceField
            sourceField.frame = CGRect(x: 0, y: 0, width: 180, height: 32)
        case (1, 1):
            cell.textLabel?.text = "目标语言"
            cell.accessoryView = targetField
            targetField.frame = CGRect(x: 0, y: 0, width: 180, height: 32)
        case (2, 0):
            cell.textLabel?.text = "API 地址"
            cell.accessoryView = urlField
            urlField.frame = CGRect(x: 0, y: 0, width: 200, height: 32)
        case (2, 1):
            cell.textLabel?.text = "API Key"
            cell.accessoryView = keyField
            keyField.frame = CGRect(x: 0, y: 0, width: 180, height: 32)
        case (3, 0):
            cell.textLabel?.text = "清除翻译缓存"
            cell.textLabel?.textColor = .systemRed
            cell.accessoryType = .none
        case (3, 1):
            cell.textLabel?.text = "崩溃日志"
            cell.textLabel?.textColor = .systemBlue
            cell.accessoryType = .none
        default:
            break
        }
        return cell
    }

    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        guard indexPath.section == 3 else { return }
        if indexPath.row == 0 {
            let fm = FileManager.default
            let docs = fm.urls(for: .documentDirectory, in: .userDomainMask)[0]
            let cacheDir = docs.appendingPathComponent("transCache", isDirectory: true)
            try? fm.removeItem(at: cacheDir)
            let alert = UIAlertController(title: "已清除", message: "翻译缓存已删除，下次翻译会重新请求在线引擎。", preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "好", style: .default))
            present(alert, animated: true)
        } else {
            let fm = FileManager.default
            let docs = fm.urls(for: .documentDirectory, in: .userDomainMask)[0]
            let url = docs.appendingPathComponent("crash.log")
            let text = (try? String(contentsOf: url, encoding: .utf8)) ?? "（还没有崩溃日志）"
            let ac = UIActivityViewController(
                activityItems: ["RPG 翻译器崩溃日志：\n" + text], applicationActivities: nil)
            if let pop = ac.popoverPresentationController {
                pop.sourceView = view
                pop.sourceRect = view.bounds
            }
            present(ac, animated: true)
        }
    }
}
