import UIKit

/// 翻译设置页（纯词典模式）：只保留运行时翻译开关与词典使用说明。
/// 在线引擎已移除——播放器只适配翻译器/iOS mtool 导出的翻译文件，零网络依赖。
final class SettingsViewController: UITableViewController {

    private let defaults = UserDefaults.standard

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "翻译设置"
        tableView = UITableView(frame: .zero, style: .insetGrouped)
    }

    // MARK: - 数据源

    override func numberOfSections(in tableView: UITableView) -> Int { 2 }

    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        section == 0 ? 1 : 0
    }

    override func tableView(_ tableView: UITableView, titleForHeaderInSection section: Int) -> String? {
        section == 0 ? "翻译" : "词典（自动加载）"
    }

    override func tableView(_ tableView: UITableView, titleForFooterInSection section: Int) -> String? {
        switch section {
        case 0:
            return "开启后，游戏文本命中词典即自动替换为译文（保留 \\C[...] 等控制码）。"
        default:
            return "① 用「RPG 翻译器」翻译游戏后，映射自动保存为 translations/游戏名.json，放入本 App 文稿目录的 translations/ 文件夹即可离线命中；\n\n② 也可放入任意 {原文: 译文} JSON（mtool 分享的精修汉化、词典等）；\n\n③ dict.json（UTF-8）放文稿目录可覆盖内置词典。\n\n文件App → 我的 iPhone → RPG Player 即可看到这些文件夹。"
        }
    }

    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = UITableViewCell(style: .default, reuseIdentifier: nil)
        if indexPath.section == 0 {
            cell.textLabel?.text = "启用翻译"
            let sw = UISwitch()
            sw.isOn = defaults.bool(forKey: "tr_enabled")
            sw.addTarget(self, action: #selector(switchChanged(_:)), for: .valueChanged)
            cell.accessoryView = sw
        }
        return cell
    }

    @objc private func switchChanged(_ sw: UISwitch) {
        defaults.set(sw.isOn, forKey: "tr_enabled")
    }
}
