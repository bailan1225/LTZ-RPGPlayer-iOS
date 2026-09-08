import UIKit

@main
final class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        CrashReporter.install()
        UserDefaults.standard.register(defaults: [
            "tr_engine": 0,
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
        gamesVC.tabBarItem = UITabBarItem(title: "游戏", image: UIImage(systemName: "gamecontroller"), selectedImage: nil)

        let translateVC = TranslateHubViewController()
        translateVC.tabBarItem = UITabBarItem(title: "翻译", image: UIImage(systemName: "character.bubble"), selectedImage: nil)

        let settingsVC = SettingsViewController()
        settingsVC.tabBarItem = UITabBarItem(title: "设置", image: UIImage(systemName: "gearshape"), selectedImage: nil)

        let tab = UITabBarController()
        tab.viewControllers = [
            UINavigationController(rootViewController: gamesVC),
            UINavigationController(rootViewController: translateVC),
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

            本 App 一个包集成两件事：游戏（播放器）+ 翻译（iOS 版 mtool），
            游戏、词典、翻译、存档全部共用本 App 的文稿目录，无需导出转移。

            Tab 1 游戏：放游戏 → 点游戏 → 「▶ 播放」直接开玩（横屏、词典自动命中、作弊器）；
            Tab 2 翻译：点游戏 → 批量翻译 / 校对 / 导出，翻译结果自动存 translations/游戏名.json，
                       翻译完回到「游戏」Tab 播放即是中文。
            Tab 3 设置：翻译引擎（默认「离线词典」，零网络；批量翻译时再选 Agnes / AQUA / 自定义 API），
                       翻译语言锁定中文，可测试连接、可保存。

            1. 放游戏：把含 www/data（或 data）的游戏文件夹，用爱思助手直接拖进本 App 的 Documents 文件夹
               （或 文件App → 我的 iPhone → RPG 翻译器），然后回 App 点「刷新列表」。
               目录名含 [ ] 空格等字符也能自动处理。

            2. 自定义 API：设置页选「自定义API」，API 地址填 https://…/chat/completions，
               Key 自填，模型填 glm-4-flash / agnes-2.5-flash / deepseek-chat 等，
               支持 DeepSeek/通义/OpenAI 兼容接口。

            3. 首次打开游戏若弹出「允许本地网络」请点允许（用于本机 127.0.0.1 加载游戏，
               不会访问局域网设备）。
            """
            try? text.write(to: guide, atomically: true, encoding: .utf8)
        }
    }
}
