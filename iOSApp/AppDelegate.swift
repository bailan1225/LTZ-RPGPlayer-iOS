import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        window = UIWindow(frame: UIScreen.main.bounds)
        
        let controller: UIDocumentPickerViewController = UIDocumentPickerViewController(documentTypes: ["public.url"], in: .open)
        controller.delegate = self
        
        let vc = UIViewController()
        vc.view.backgroundColor = .systemBackground
        vc.title = "LTZ RPG Player"
        
        let label = UILabel()
        label.text = "请使用 Safari 打开本页面
点击地址栏的 \"共享\" 按钮
选择 \"复制链接\" 粘贴到游戏中"
        label.numberOfLines = 0
        label.textAlignment = .center
        label.font = .systemFont(ofSize: 16)
        label.translatesAutoresizingMaskIntoConstraints = false
        vc.view.addSubview(label)
        
        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: vc.view.centerXAnchor),
            label.centerYAnchor.constraint(equalTo: vc.view.centerYAnchor),
            label.leadingAnchor.constraint(equalTo: vc.view.leadingAnchor, constant: 20),
            label.trailingAnchor.constraint(equalTo: vc.view.trailingAnchor, constant: -20)
        ])
        
        window?.rootViewController = UINavigationController(rootViewController: vc)
        window?.makeKeyAndVisible()
        return true
    }
    
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        print("Received URL: (url)")
        return true
    }
}

extension AppDelegate: UIDocumentPickerDelegate {
    func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
        // Handle picked URL
    }
}