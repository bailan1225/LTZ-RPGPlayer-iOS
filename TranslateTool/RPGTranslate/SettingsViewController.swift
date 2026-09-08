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
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            title: "保存", style: .done, target: self, action: #selector(saveTapped))
        tableView = UITableView(frame: .zero, style: .insetGrouped)

        engineControl = UISegmentedControl(items: ["离线词典", "MyMemory", "自定义API", "Agnes", "AQUA"])
        engineControl.selectedSegmentIndex = defaults.integer(forKey: "tr_engine")
        engineControl.addTarget(self, action: #selector(engineChanged), for: .valueChanged)

        enabledSwitch = UISwitch()
        enabledSwitch.isOn = defaults.bool(forKey: "tr_enabled")
        enabledSwitch.addTarget(self, action: #selector(enabledChanged), for: .valueChanged)

        sourceField = makeField(placeholder: "如 ja / en", text: defaults.string(forKey: "tr_source") ?? "ja", secure: false)
        targetField = makeField(placeholder: "如 zh-CN", text: defaults.string(forKey: "tr_target") ?? "zh-CN", secure: false)
        urlField = makeField(placeholder: "https://api.deepseek.com/v1/chat/completions", text: defaults.string(forKey: "tr_api_url") ?? "", secure: false)
        keyField = makeField(placeholder: "API Key（旧 key 过期直接重填）", text: defaults.string(forKey: "tr_api_key") ?? "", secure: true)
        modelField = makeField(placeholder: "如 glm-4-flash-250414 / agnes-2.5-flash / qwen2-7b-instruct", text: defaults.string(forKey: "tr_model") ?? "", secure: false)
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
        saveAllFields()
        tableView.reloadData()
    }

    @objc private func saveTapped() {
        saveAllFields()
        let alert = UIAlertController(
            title: "已保存",
            message: "设置已保存（引擎：\(engineControl?.titleForSegment(at: engineControl.selectedSegmentIndex) ?? "")）。回到游戏列表重新翻译即可生效。",
            preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "好", style: .default))
        present(alert, animated: true)
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

    private func apiCell(_ cell: UITableViewCell, _ title: String, _ field: UITextField, _ w: CGFloat) {
        cell.textLabel?.text = title
        field.frame = CGRect(x: 0, y: 0, width: w, height: 32)
        cell.accessoryView = field
    }

    private func testCell(_ cell: UITableViewCell) {
        cell.textLabel?.text = "测试翻译连接"
        cell.textLabel?.textColor = .systemBlue
        cell.accessoryType = .disclosureIndicator
        cell.selectionStyle = .default
    }

    /// 用当前引擎与配置发一条真实翻译请求，验证 Key / 地址 / 网络 / 额度
    @objc private func testTapped() {
        saveAllFields()
        let eng = TranslationEngine(rawValue: engineControl?.selectedSegmentIndex ?? defaults.integer(forKey: "tr_engine")) ?? .offline
        let cfg = TranslationConfig(
            engine: eng,
            source: sourceField.text ?? "ja",
            target: targetField.text ?? "zh-CN",
            apiUrl: urlField.text ?? "",
            apiKey: keyField.text ?? "",
            prompt: promptField.text ?? "",
            model: modelField.text ?? "",
            memEmail: memEmailField.text ?? "")
        let engine = TranslatorEngine(config: cfg)
        let loading = UIAlertController(title: "测试翻译连接", message: "正在发送测试请求…", preferredStyle: .alert)
        present(loading, animated: true)
        engine.translate("こんにちは、世界。") { result in
            DispatchQueue.main.async {
                loading.dismiss(animated: true) {
                    let ok = result != nil
                    var msg = ok ? "测试请求成功\n返回：\(result!)" : "未获得译文。\n请检查：API Key、地址、网络、额度。"
                    if !engine.lastError.isEmpty { msg += "\n\n错误信息：\(engine.lastError)" }
                    let alert = UIAlertController(title: ok ? "连接成功" : "连接失败",
                                                  message: msg, preferredStyle: .alert)
                    alert.addAction(UIAlertAction(title: "好", style: .default))
                    self.present(alert, animated: true)
                }
            }
        }
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
        case 0: return engineControl?.selectedSegmentIndex == 1 ? 3 : 2   // MyMemory 才显示邮箱行
        case 1: return 2
        case 2: return apiRows()
        case 3: return 2
        case 4: return 0
        default: return 0
        }
    }

    private func apiRows() -> Int {
        switch engineControl?.selectedSegmentIndex ?? defaults.integer(forKey: "tr_engine") {
        case 0, 1: return 1   // 离线/MyMemory：无需 API 配置
        case 2: return 5      // 自定义：地址/Key/模型/提示词/测试
        case 3: return 3      // Agnes：Key/模型/测试
        case 4: return 2      // AQUA：Key/测试（tools/translate 无需模型）
        default: return 0
        }
    }

    override func tableView(_ tableView: UITableView, titleForHeaderInSection section: Int) -> String? {
        switch section {
        case 0: return "翻译引擎"
        case 1: return "语言"
        case 2:
            switch engineControl?.selectedSegmentIndex ?? defaults.integer(forKey: "tr_engine") {
            case 0: return "API 设置（当前：离线词典，无需填写）"
            case 1: return "API 设置（当前：MyMemory，无需填写）"
            case 3: return "API 设置（当前：Agnes，只需填 API Key）"
            case 4: return "API 设置（当前：AQUA，只需填 API Key）"
            default: return "API 设置（当前：自定义API）"
            }
        case 3: return ""
        default: return nil
        }
    }

    override func tableView(_ tableView: UITableView, titleForFooterInSection section: Int) -> String? {
        switch section {
        case 0:
            return "MyMemory 免费匿名约 5000 字符/天，填注册邮箱（MyMemory 官网免费注册）可提升到约 5 万字符/天。\n\nAgnes：固定地址 https://apihub.agnes-ai.com/v1/chat/completions，模型默认 agnes-2.5-flash，只需填 Key。\n\nAQUA（acu.ltzy.top）：优先官方翻译工具端点 /v1/tools/translate（免费、自动识别源语言），解析失败自动回退免费对话模型 glm-4-flash-250414（健康 96）保证出译文。只需填 Key（acu.ltzy.top/console 创建，sk-）。\n\n每项填好后点右上角「保存」；也可直接点「测试翻译连接」验证 Key 与网络。\n\n自定义 API 兼容两种方式：\n① URL 占位符：地址含 {text}（{key} {prompt} {model} 可选）时直接替换；\n② OpenAI 兼容接口（推荐）：地址填 https://…/chat/completions，请求自动 POST JSON，Key 走 Bearer，支持 DeepSeek/通义/OpenAI/硅基流动等。"
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
            cell.selectionStyle = .none
        case (1, 0):
            cell.textLabel?.text = "源语言"
            cell.accessoryView = sourceField
            sourceField.frame = CGRect(x: 0, y: 0, width: 180, height: 32)
        case (1, 1):
            cell.textLabel?.text = "目标语言"
            cell.accessoryView = targetField
            targetField.frame = CGRect(x: 0, y: 0, width: 180, height: 32)
        case (2, let row):
            let eng = engineControl?.selectedSegmentIndex ?? defaults.integer(forKey: "tr_engine")
            switch eng {
            case 0, 1:
                cell.textLabel?.text = "当前引擎无需 API 配置"
                cell.textLabel?.textColor = .secondaryLabel
            case 2:
                switch row {
                case 0: apiCell(cell, "API 地址", urlField, 220)
                case 1: apiCell(cell, "API Key", keyField, 200)
                case 2: apiCell(cell, "模型", modelField, 190)
                case 3: apiCell(cell, "翻译提示词", promptField, 220)
                default: testCell(cell)
                }
            case 3:
                switch row {
                case 0: apiCell(cell, "API Key", keyField, 200)
                case 1: apiCell(cell, "模型（默认 agnes-2.5-flash）", modelField, 190)
                default: testCell(cell)
                }
            case 4:
                switch row {
                case 0: apiCell(cell, "API Key", keyField, 200)
                default: testCell(cell)
                }
            default:
                break
            }
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
        if indexPath.section == 2 {
            let eng = engineControl?.selectedSegmentIndex ?? defaults.integer(forKey: "tr_engine")
            let testRow = eng == 2 ? 4 : (eng == 3 ? 2 : (eng == 4 ? 1 : -1))
            if indexPath.row == testRow { testTapped() }
            return
        }
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
