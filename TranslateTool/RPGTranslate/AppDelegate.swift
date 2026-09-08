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

            单页工作流：导入游戏 → 选中 → 翻译成中文 → 导出 zip 交给第三方 Player 运行。

            页面：
            · 游戏页：上面是游戏列表（点选切换），下方是对应游戏的翻译操作：
              开始翻译（进度条）/ 校对译文 / 应用翻译文件（mtool/JSON）/
              导出翻译后的游戏（zip，供第三方 Player）/ 恢复原版。
            · 设置页：翻译引擎（默认「离线词典」零网络；批量翻译选 Agnes / AQUA / 自定义 API），
              翻译语言锁定中文，可测试连接、可保存。

            1. 放游戏：把含 www/data（或 data）的游戏文件夹，用爱思助手/文件App
               放进本 App 的 Documents 文件夹；zip 压缩包放入后回 App 会自动提示解压导入。

            2. 翻译：选中游戏 →「开始翻译」（需先在设置页配置翻译引擎）。

            3. 游玩：翻译完 →「导出翻译后的游戏（zip）」→ 文件App → 共享 →
               用 RPG Pocket / QuestPlay / RPGEmu（App Store 免费下载）打开即可玩中文版。
            """
            try? text.write(to: guide, atomically: true, encoding: .utf8)
        }
    }
}
