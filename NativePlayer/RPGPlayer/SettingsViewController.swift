import UIKit

/// 翻译设置页
final class SettingsViewController: UITableViewController, UITextFieldDelegate {

    private let defaults = UserDefaults.standard
    private var fieldKeys: [Int: String] = [:]
    private var nextTag = 1

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "翻译设置"
        tableView = UITableView(frame: .zero, style: .insetGrouped)
    }

    // MARK: - 单元格构建

    private func makeSwitchCell(_ title: String, key: String) -> UITableViewCell {
        let cell = UITableViewCell(style: .default, reuseIdentifier: nil)
        cell.textLabel?.text = title
        let sw = UISwitch()
        sw.isOn = defaults.bool(forKey: key)
        sw.addTarget(self, action: #selector(switchChanged(_:)), for: .valueChanged)
        cell.accessoryView = sw
        return cell
    }

    private func makeEngineCell() -> UITableViewCell {
        let cell = UITableViewCell(style: .default, reuseIdentifier: nil)
        cell.textLabel?.text = "翻译引擎"
        let seg = UISegmentedControl(items: ["离线词典", "MyMemory", "自定义API"])
        seg.selectedSegmentIndex = defaults.integer(forKey: "tr_engine")
        seg.addTarget(self, action: #selector(engineChanged(_:)), for: .valueChanged)
        cell.accessoryView = seg
        return cell
    }

    private func makeTextFieldCell(_ title: String, key: String, defaultValue: String) -> UITableViewCell {
        let cell = UITableViewCell(style: .default, reuseIdentifier: nil)
        cell.textLabel?.text = title
        let field = UITextField(frame: CGRect(x: 0, y: 0, width: 200, height: 32))
        field.text = defaults.string(forKey: key) ?? defaultValue
        field.placeholder = defaultValue
        field.textAlignment = .right
        field.autocorrectionType = .no
        field.autocapitalizationType = .none
        field.clearButtonMode = .whileEditing
        field.tag = nextTag
        field.delegate = self
        field.addTarget(self, action: #selector(textChanged(_:)), for: .editingChanged)
        cell.accessoryView = field
        fieldKeys[nextTag] = key
        nextTag += 1
        return cell
    }

    // MARK: - 数据源

    override func numberOfSections(in tableView: UITableView) -> Int { 2 }

    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        section == 0 ? 5 : 1
    }

    override func tableView(_ tableView: UITableView, titleForHeaderInSection section: Int) -> String? {
        section == 0 ? "翻译" : "缓存"
    }

    override func tableView(_ tableView: UITableView, titleForFooterInSection section: Int) -> String? {
        section == 0
            ? "离线词典对所有引擎都生效；MyMemory 为免费在线接口（无需密钥，有每日限额）；自定义API地址中的 {text} 会被替换为要翻译的原文。"
            : nil
    }

    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if indexPath.section == 0 {
            switch indexPath.row {
            case 0: return makeSwitchCell("启用翻译", key: "tr_enabled")
            case 1: return makeEngineCell()
            case 2: return makeTextFieldCell("源语言（ja/en 等）", key: "tr_source", defaultValue: "ja")
            case 3: return makeTextFieldCell("目标语言（如 zh-CN）", key: "tr_target", defaultValue: "zh-CN")
            default: return makeTextFieldCell("自定义API地址（可留空）", key: "tr_api_url", defaultValue: "")
            }
        }
        let cell = UITableViewCell(style: .default, reuseIdentifier: nil)
        cell.textLabel?.text = "清除翻译缓存"
        cell.textLabel?.textColor = .systemRed
        return cell
    }

    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        guard indexPath.section == 1 else { return }
        let v = defaults.integer(forKey: "tr_cache_version") + 1
        defaults.set(v, forKey: "tr_cache_version")
        let alert = UIAlertController(title: "已清除", message: "下次打开游戏时生效。", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "好", style: .default))
        present(alert, animated: true)
    }

    // MARK: - 事件

    @objc private func switchChanged(_ sw: UISwitch) {
        defaults.set(sw.isOn, forKey: "tr_enabled")
    }

    @objc private func engineChanged(_ seg: UISegmentedControl) {
        defaults.set(seg.selectedSegmentIndex, forKey: "tr_engine")
    }

    @objc private func textChanged(_ field: UITextField) {
        if let key = fieldKeys[field.tag] {
            defaults.set(field.text ?? "", forKey: key)
        }
    }
}
