import UIKit

@main
final class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        CrashReporter.install()
        UserDefaults.standard.register(defaults: [
            "tr_engine": 3,
            "tr_source": "ja",
            "tr_target": "zh-CN",
            "tr_api_url": "",
            "tr_api_key": "",
            "tr_model": "",
            "tr_mem_email": "",
            "tr_enabled": true,
            "tr_cache_version": 0,
            "tr_prompt": ""
        ])
        createFirstRunStructure()

        let window = UIWindow(frame: UIScreen.main.bounds)

        let gamesVC = GameListViewController()
        gamesVC.tabBarItem = UITabBarItem(title: "游戏", image: UIImage(systemName: "folder"), selectedImage: nil)

        let settingsVC = SettingsViewController()
        settingsVC.tabBarItem = UITabBarItem(title: "设置", image: UIImage(systemName: "gearshape"), selectedImage: nil)

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
        let dirs = ["translations", "Saves", "Exports", "Backups"]
        for d in dirs {
            try? fm.createDirectory(at: docs.appendingPathComponent(d, isDirectory: true),
                                    withIntermediateDirectories: true)
        }

        let guide = docs.appendingPathComponent("使用说明.txt")
        if !fm.fileExists(atPath: guide.path) {
            let text = """
            【RPG 翻译器 使用说明】

            1. 放游戏：把含 www/data（或 data）的游戏文件夹，用爱思助手直接拖进本 App 的 Documents 文件夹
               （或 文件App → 我的 iPhone → RPG 翻译器），然后回 App 点「刷新列表」。
               目录名含 [ ] 空格等字符也能自动处理。

            2. 点游戏 → 「播放游戏」直接开玩（运行时翻译+作弊器+存档管理）；
               或「翻译 / 校对 / 导出」批量翻译，翻译结果自动存 translations/游戏名.json，
               导出的整份游戏在 Exports/，原版备份在 Backups/。

            3. 自定义 API：设置页选「自定义API」，API 地址填 https://…/chat/completions，
               Key 自填，模型填 glm-4-flash / agnes-2.5-flash / deepseek-chat 等，
               支持 DeepSeek/通义/OpenAI 兼容接口。

            4. 首次打开游戏若弹出「允许本地网络」请点允许（用于本机 127.0.0.1 加载游戏，
               不会访问局域网设备）。
            """
            try? text.write(to: guide, atomically: true, encoding: .utf8)
        }
    }
}
