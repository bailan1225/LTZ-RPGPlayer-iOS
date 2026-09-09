import UIKit

@main
final class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        CrashReporter.install()
        // 首次启动默认值（register 不会覆盖用户已保存的设置）
        UserDefaults.standard.register(defaults: [
            "tr_enabled": true,
            "tr_engine": 4,        // 默认 AQUA（免费、出中文）
            "tr_target": "zh-CN",
            "tr_source": "ja"
        ])
        createFirstRunStructure()

        // 应用主题（换皮肤）
        ThemeManager.shared.apply()

        let window = UIWindow(frame: UIScreen.main.bounds)

        // 去掉底部 Tab Bar，全部功能通过悬浮球/导航栏按钮访问
        let gamesVC = GamesViewController()
        let nav = UINavigationController(rootViewController: gamesVC)

        window.rootViewController = nav
        window.makeKeyAndVisible()
        self.window = window
        return true
    }

    /// 首次启动创建引导目录与说明文件（文件App / 爱思助手可见），只执行一次
    private func createFirstRunStructure() {
        let fm = FileManager.default
        let docs = fm.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let translations = docs.appendingPathComponent("translations", isDirectory: true)
        try? fm.createDirectory(at: translations, withIntermediateDirectories: true)

        let guide = docs.appendingPathComponent("使用说明.txt")
        if !fm.fileExists(atPath: guide.path) {
            let text = """
            【RPG Player 使用说明】

            1. 导入游戏：点右上角 + 选 zip 直接导入；或把含 www/data 的游戏文件夹
               用爱思助手拖进本 App 的 Documents（文件App → 我的 iPhone → RPG Player）。

            2. 翻译游戏：在「游戏」页点选游戏 → 「开始翻译」（默认 AQUA 引擎，出中文）。
               翻译完自动写回游戏并保存 translations/游戏名.json，运行时离线命中。
               也可在「设置」页切换引擎 / 填 Key / 调并发 / 测试连接。

            3. 运行游戏：点选游戏 → 「▶ 运行游戏」。支持 MV/MZ、加密游戏（游戏内置 Decrypter 自动解密）、
               作弊器（游戏内悬浮球）、存档导入导出。

            4. 翻译文件：「游戏」页左上角「翻译文件」可管理/编辑/导出 translations/*.json。
               也支持放入 mtool 或其他工具导出的 {原文:译文} JSON。

            5. 导出：点选游戏 → 「导出翻译后的游戏（zip）」可打包给第三方 Player 使用。

            6. 游戏通过内置协议直接加载本地文件，不需要联网，也不会请求「本地网络」权限。
            """
            try? text.write(to: guide, atomically: true, encoding: .utf8)
        }
    }
}
