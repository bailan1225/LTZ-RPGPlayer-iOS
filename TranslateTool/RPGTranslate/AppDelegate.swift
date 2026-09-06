import UIKit

@main
final class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        UserDefaults.standard.register(defaults: [
            "tr_engine": 1,
            "tr_source": "ja",
            "tr_target": "zh-CN",
            "tr_api_url": "",
            "tr_api_key": ""
        ])

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
}
