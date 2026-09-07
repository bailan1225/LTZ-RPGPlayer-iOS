import UIKit

/// 翻译设置（键名与播放器 App 一致，用户习惯可复用）
final class SettingsViewController: UITableViewController, UITextFieldDelegate {

    private let defaults = UserDefaults.standard
    private var engineControl: UISegmentedControl!
    private var sourceField: UITextField!
    private var targetField: UITextField!
    private var urlField: UITextField!
    private var keyField: UITextField!
    private var modelField: UITextField!
    private var memEmailField: UITextField!
    private var promptField: UITextField!
    private var enabledSwitch: UISwitch!

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "翻译设置"
        tableView = UITableView(frame: .zero, style: .insetGrouped)

        engineControl = UISegmentedControl(items: ["离线词典", "MyMemory", "自定义API"])
        engineControl.selectedSegmentIndex = defaults.integer(forKey: "tr_engine")
        engineControl.addTarget(self, action: #selector(engineChanged), for: .valueChanged)

        enabledSwitch = UISwitch()
        enabledSwitch.isOn = defaults.bool(forKey: "tr_enabled")
        enabledSwitch.addTarget(self, action: #selector(enabledChanged), for: .valueChanged)

        sourceField = makeField(placeholder: "如 ja / en", text: defaults.string(forKey: "tr_source") ?? "ja", secure: false)
        targetField = makeField(placeholder: "如 zh-CN", text: defaults.string(forKey: "tr_target") ?? "zh-CN", secure: false)
        urlField = makeField(placeholder: "https://api.deepseek.com/v1/chat/completions", text: defaults.string(forKey: "tr_api_url") ?? "", secure: false)
        keyField = makeField(placeholder: "API Key（旧 key 过期直接重填）", text: defaults.string(forKey: "tr_api_key") ?? "", secure: true)
        modelField = makeField(placeholder: "如 glm-4-flash / agnes-2.5-flash / deepseek-chat", text: defaults.string(forKey: "tr_model") ?? "", secure: false)
        memEmailField = makeField(placeholder: "MyMemory 注册邮箱（免费提额）", text: defaults.string(forKey: "tr_mem_email") ?? "", secure: false)
        promptField = makeField(placeholder: "如：你是游戏翻译，保持 JRPG 风格，人名不译", text: defaults.string(forKey: "tr_prompt") ?? "", secure: false)
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

    @objc private func enabledChanged() {
        defaults.set(enabledSwitch.isOn, forKey: "tr_enabled")
    }

    @objc private func fieldChanged() {
        saveAllFields()
    }

    private func saveAllFields() {
        defaults.set(sourceField.text ?? "", forKey: "tr_source")
        defaults.set(targetField.text ?? "", forKey: "tr_target")
        defaults.set(urlField.text ?? "", forKey: "tr_api_url")
        defaults.set(keyField.text ?? "", forKey: "tr_api_key")
        defaults.set(modelField.text ?? "", forKey: "tr_model")
        defaults.set(memEmailField.text ?? "", forKey: "tr_mem_email")
        defaults.set(promptField.text ?? "", forKey: "tr_prompt")
    }

    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        textField.resignFirstResponder()
        return true
    }

    func textFieldDidEndEditing(_ textField: UITextField) {
        saveAllFields()
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        saveAllFields()
    }

    // MARK: - Table

    override func numberOfSections(in tableView: UITableView) -> Int { 5 }

    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        switch section {
        case 0: return 3
        case 1: return 2
        case 2: return 4
        case 3: return 2
        case 4: return 0
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
        case 0:
            return "MyMemory 免费匿名约 5000 字符/天，填注册邮箱（MyMemory 官网免费注册）可提升到约 5 万字符/天。\n\n自定义 API 兼容两种方式：\n① URL 占位符：地址含 {text}（{key} {prompt} {model} 可选）时直接替换；\n② OpenAI 兼容接口（推荐）：地址填 https://…/chat/completions，请求自动 POST JSON（含 model、messages、提示词），Key 走 Bearer，支持 DeepSeek/通义/OpenAI/硅基流动等，返回 choices[0].message.content。"
        case 3: return "离线词典：把 dict.json（键=原文，值=译文，UTF-8）放入「文件App → 我的 iPhone → RPG 翻译器」，优先于内置词典。"
        case 4:
            let ver = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "?"
            return "RPG 翻译器 v\(ver)（iOS 版 mtool）：批量翻译 / 校对 / 导出 / 内置播放 / 作弊 / 存档管理。翻译完的游戏可在「游戏」页播放或导出，映射自动存 translations/，供「RPG Player」离线使用。"
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
        case (0, 1):
            cell.textLabel?.text = "运行时翻译（播放游戏时）"
            cell.accessoryView = enabledSwitch
        case (0, 2):
            cell.textLabel?.text = "MyMemory 邮箱"
            cell.accessoryView = memEmailField
            memEmailField.frame = CGRect(x: 0, y: 0, width: 200, height: 32)
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
        case (2, 2):
            cell.textLabel?.text = "模型"
            cell.accessoryView = modelField
            modelField.frame = CGRect(x: 0, y: 0, width: 180, height: 32)
        case (2, 3):
            cell.textLabel?.text = "翻译提示词"
            cell.accessoryView = promptField
            promptField.frame = CGRect(x: 0, y: 0, width: 200, height: 32)
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
