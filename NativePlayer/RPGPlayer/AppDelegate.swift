import UIKit

@main
final class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        CrashReporter.install()
        // 首次启动默认值（register 不会覆盖用户已保存的设置）；纯词典模式仅需翻译开关
        UserDefaults.standard.register(defaults: [
            "tr_enabled": true
        ])
        createFirstRunStructure()

        let window = UIWindow(frame: UIScreen.main.bounds)

        let gamesVC = GamesViewController()
        gamesVC.tabBarItem = UITabBarItem(title: "游戏", image: UIImage(systemName: "gamecontroller"), selectedImage: nil)

        let settingsVC = SettingsViewController()
        settingsVC.tabBarItem = UITabBarItem(title: "词典设置", image: UIImage(systemName: "character.bubble"), selectedImage: nil)

        let tab = UITabBarController()
        tab.viewControllers = [
            UINavigationController(rootViewController: gamesVC),
            UINavigationController(rootViewController: settingsVC)
        ]

        window.rootViewController = tab
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

            1. 放游戏：把含 index.html 或 www 的游戏文件夹，用爱思助手直接拖进本 App 的 Documents 文件夹
               （或 文件App → 我的 iPhone → RPG Player），然后回 App 点「刷新列表」。
               目录名含 [ ] 空格等字符也能自动处理，不影响。

            2. 放翻译文件：用「RPG 翻译器」翻完游戏后，把 translations/游戏名.json
               拷入本目录下的 translations/ 文件夹，打开游戏即离线命中（列表显示「已翻译 N 条」）。
               也支持任意 mtool 格式 {原文: 译文} JSON。

            3. 首次打开游戏若弹出「允许本地网络」请点允许（用于本机 127.0.0.1 加载游戏，
               不会访问局域网设备）。

            4. 游戏页工具栏：刷新 / 作弊器（礼物图标）/ 翻译开关（气泡图标）。
               列表页左上角「日志」可分享崩溃日志。
            """
            try? text.write(to: guide, atomically: true, encoding: .utf8)
        }
    }
}
