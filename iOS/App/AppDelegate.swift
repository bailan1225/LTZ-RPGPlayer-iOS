import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        window = UIWindow(frame: UIScreen.main.bounds)
        
        let webView = WKWebView()
        webView.frame = UIScreen.main.bounds
        webView.navigationDelegate = self
        
        // 加载本地 HTML
        if let htmlPath = Bundle.main.path(forResource: "index", ofType: "html") {
            let html = try? String(contentsOfFile: htmlPath)
            webView.loadHTMLString(html ?? "", baseURL: Bundle.main.bundleURL)
        }
        
        window?.rootViewController = UIViewController()
        window?.subviews.first?.addSubview(webView)
        window?.makeKeyAndVisible()
        return true
    }
}

extension AppDelegate: WKNavigationDelegate {
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        decisionHandler(.allow)
    }
}