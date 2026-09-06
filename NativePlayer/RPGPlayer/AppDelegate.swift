import UIKit

@main
final class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // 首次启动默认值（register 不会覆盖用户已保存的设置）
        UserDefaults.standard.register(defaults: [
            "tr_enabled": true,
            "tr_engine": 1,
            "tr_source": "ja",
            "tr_target": "zh-CN",
            "tr_api_url": "",
            "tr_api_key": "",
            "tr_cache_version": 1
        ])

        let window = UIWindow(frame: UIScreen.main.bounds)

        let gamesVC = GamesViewController()
        gamesVC.tabBarItem = UITabBarItem(title: "游戏", image: UIImage(systemName: "gamecontroller"), selectedImage: nil)

        let settingsVC = SettingsViewController()
        settingsVC.tabBarItem = UITabBarItem(title: "翻译设置", image: UIImage(systemName: "character.bubble"), selectedImage: nil)

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
}
