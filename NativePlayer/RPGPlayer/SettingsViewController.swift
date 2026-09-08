import UIKit

/// 设置页：翻译（引擎/参数/并发）+ 词典说明
final class SettingsViewController: UITableViewController, UITextFieldDelegate {

    private let defaults = UserDefaults.standard
    private let engines = ["离线词典", "MyMemory", "自定义 API", "Agnes", "AQUA"]

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "设置"
    }

    private struct ParamRow { let key: String; let label: String; let secure: Bool }

    private func paramRows() -> [ParamRow] {
        switch defaults.integer(forKey: "tr_engine") {
        case 1:
            return [ParamRow(key: "tr_source", label: "源语言", secure: false),
                    ParamRow(key: "tr_target", label: "目标语言", secure: false),
                    ParamRow(key: "tr_mem_email", label: "MyMemory 邮箱（提额）", secure: false)]
        case 2:
            return [ParamRow(key: "tr_source", label: "源语言", secure: false),
                    ParamRow(key: "tr_target", label: "目标语言", secure: false),
                    ParamRow(key: "tr_api_url", label: "API 地址（OpenAI 兼容）", secure: false),
                    ParamRow(key: "tr_api_key", label: "API Key", secure: true),
                    ParamRow(key: "tr_model", label: "模型名", secure: false),
                    ParamRow(key: "tr_prompt", label: "提示词", secure: false)]
        case 3:
            return [ParamRow(key: "tr_source", label: "源语言", secure: false),
                    ParamRow(key: "tr_target", label: "目标语言", secure: false),
                    ParamRow(key: "tr_api_key", label: "API Key", secure: true),
                    ParamRow(key: "tr_model", label: "模型名", secure: false)]
        case 4:
            return [ParamRow(key: "tr_source", label: "源语言", secure: false),
                    ParamRow(key: "tr_target", label: "目标语言", secure: false),
                    ParamRow(key: "tr_api_key", label: "API Key", secure: true),
                    ParamRow(key: "tr_model", label: "模型名", secure: false)]
        default:
            return []
        }
    }

    override func numberOfSections(in tableView: UITableView) -> Int { 5 }

    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        switch section {
        case 0: return 1
        case 1: return engines.count
        case 2: return paramRows().count
        case 3: return 1
        default: return 0
        }
    }

    override func tableView(_ tableView: UITableView, titleForHeaderInSection section: Int) -> String? {
        switch section {
        case 0: return "翻译"
        case 1: return "翻译引擎"
        case 2: return "引擎参数"
        case 3: return "翻译性能"
        default: return "词典（自动加载）"
        }
    }

    override func tableView(_ tableView: UITableView, titleForFooterInSection section: Int) -> String? {
        switch section {
        case 1:
            return "在线引擎用于「游戏列表左滑 → 翻译」批量翻译整游戏文本；离线词典模式只命中已导入的翻译文件。"
        case 2:
            let e = defaults.integer(forKey: "tr_engine")
            if e == 4 {
                return "AQUA：API 地址固定 https://api.ltzy.top/v1，只需填控制台 Key。翻译工具端点失败自动回退免费对话模型，始终输出中文。"
            }
            if e == 3 {
                return "Agnes：官方 OpenAI 兼容接口 https://apihub.agnes-ai.com/v1/chat/completions，默认模型 agnes-2.5-flash。"
            }
            if e == 2 {
                return "自定义 API：OpenAI 兼容 /chat/completions 端点，支持 DeepSeek、通义、硅基流动等；地址缺 /chat/completions 会自动补全。"
            }
            if e == 1 {
                return "MyMemory 免费在线翻译；填邮箱额度从 ~5000 字符/天提升到 ~50000。"
            }
            return nil
        case 3:
            return "并发越高翻译越快；免费通道限流严格，过高易失败（默认：MyMemory 2 / 自定义 6 / Agnes 8 / AQUA 6）。"
        default:
            return "翻译结果自动保存为 translations/游戏名.json（mtool 格式），播放时离线命中；也可放入任意 {原文: 译文} JSON（含精修汉化）。文件App → 我的 iPhone → RPG Player 可见。"
        }
    }

    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        switch indexPath.section {
        case 0:
            let cell = UITableViewCell(style: .default, reuseIdentifier: nil)
            cell.textLabel?.text = "启用翻译"
            let sw = UISwitch()
            sw.isOn = defaults.bool(forKey: "tr_enabled")
            sw.addTarget(self, action: #selector(switchChanged(_:)), for: .valueChanged)
            cell.accessoryView = sw
            return cell
        case 1:
            let cell = UITableViewCell(style: .default, reuseIdentifier: nil)
            cell.textLabel?.text = engines[indexPath.row]
            cell.accessoryType = defaults.integer(forKey: "tr_engine") == indexPath.row ? .checkmark : .none
            return cell
        case 2:
            let rows = paramRows()
            let row = rows[indexPath.row]
            let cell = UITableViewCell(style: .default, reuseIdentifier: nil)
            cell.textLabel?.text = row.label
            cell.textLabel?.font = .systemFont(ofSize: 13)
            cell.textLabel?.textColor = .secondaryLabel
            let tf = UITextField(frame: CGRect(x: 0, y: 0, width: 190, height: 32))
            tf.text = defaults.string(forKey: row.key) ?? ""
            tf.isSecureTextEntry = row.secure
            tf.textAlignment = .right
            tf.font = .systemFont(ofSize: 14)
            tf.tag = indexPath.row + 100
            tf.autocorrectionType = .no
            tf.autocapitalizationType = .none
            tf.addTarget(self, action: #selector(textChanged(_:)), for: .editingChanged)
            tf.delegate = self
            cell.accessoryView = tf
            return cell
        case 3:
            let cell = UITableViewCell(style: .default, reuseIdentifier: nil)
            cell.textLabel?.text = "翻译并发数"
            let conc = defaults.integer(forKey: "tr_concurrency")
            let label = UILabel(frame: CGRect(x: 0, y: 0, width: 44, height: 32))
            label.text = conc == 0 ? "自动" : "\(conc)"
            label.font = .systemFont(ofSize: 14)
            label.textColor = .secondaryLabel
            label.textAlignment = .right
            cell.accessoryView = label
            return cell
        default:
            return UITableViewCell(style: .default, reuseIdentifier: nil)
        }
    }

    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        switch indexPath.section {
        case 1:
            defaults.set(indexPath.row, forKey: "tr_engine")
            tableView.reloadData()
        case 3:
            let alert = UIAlertController(title: "翻译并发数", message: nil, preferredStyle: .actionSheet)
            let opts = ["自动", "2", "4", "6", "8", "12", "16"]
            for (i, name) in opts.enumerated() {
                let v = i == 0 ? 0 : (Int(name) ?? 4)
                alert.addAction(UIAlertAction(title: name, style: .default) { [weak self] _ in
                    self?.defaults.set(v, forKey: "tr_concurrency")
                    self?.tableView.reloadData()
                })
            }
            alert.addAction(UIAlertAction(title: "取消", style: .cancel))
            if let pop = alert.popoverPresentationController {
                pop.sourceView = tableView.cellForRow(at: indexPath)
                pop.sourceRect = tableView.cellForRow(at: indexPath)?.bounds ?? .zero
            }
            present(alert, animated: true)
        default:
            break
        }
    }

    @objc private func switchChanged(_ sw: UISwitch) {
        defaults.set(sw.isOn, forKey: "tr_enabled")
    }

    @objc private func textChanged(_ tf: UITextField) {
        let rows = paramRows()
        let idx = tf.tag - 100
        guard idx >= 0, idx < rows.count else { return }
        defaults.set(tf.text ?? "", forKey: rows[idx].key)
    }

    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        textField.resignFirstResponder()
        return true
    }
}
