import UIKit
import WebKit

/// 游戏运行页：WKWebView 加载游戏 index.html，并注入翻译脚本
final class GameViewController: UIViewController, WKScriptMessageHandler, WKNavigationDelegate {

    private let gameDir: URL
    private var webView: WKWebView!
    private let defaults = UserDefaults.standard

    init(gameDir: URL) {
        self.gameDir = gameDir
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    override func viewDidLoad() {
        super.viewDidLoad()
        title = SafePath.originalName(for: gameDir) ?? gameDir.lastPathComponent
        view.backgroundColor = .black
        UIApplication.shared.isIdleTimerDisabled = true
        setupWebView()
        setupToolbar()
        loadGame()
    }

    // MARK: - 屏幕方向：游戏运行页强制横屏

    override var supportedInterfaceOrientations: UIInterfaceOrientationMask { .landscape }
    override var preferredInterfaceOrientationForPresentation: UIInterfaceOrientation { .landscapeLeft }
    override var shouldAutorotate: Bool { true }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        forceOrientation(.landscapeLeft)
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        UIApplication.shared.isIdleTimerDisabled = false
        forceOrientation(.portrait)
    }

    private func forceOrientation(_ o: UIInterfaceOrientation) {
        if UIDevice.current.orientation.rawValue != o.rawValue {
            UIDevice.current.setValue(o.rawValue, forKey: "orientation")
        }
    }

    private func setupWebView() {
        let config = WKWebViewConfiguration()
        let contentController = WKUserContentController()

        // 1) 注入翻译配置（在游戏脚本之前）
        contentController.addUserScript(WKUserScript(
            source: TranslatorConfig.injectionSource(),
            injectionTime: .atDocumentStart, forMainFrameOnly: true))
        // 2) 注入翻译补丁脚本
        contentController.addUserScript(WKUserScript(
            source: TranslatorJS.source,
            injectionTime: .atDocumentStart, forMainFrameOnly: true))
        // 3) 注入作弊器脚本
        contentController.addUserScript(WKUserScript(
            source: CheatJS.source,
            injectionTime: .atDocumentStart, forMainFrameOnly: true))
        contentController.add(self, name: "rpgTr")
        contentController.add(self, name: "rpgCheat")

        config.userContentController = contentController
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        // iOS 17 触摸/键盘细节：点击更跟手、拖拽收起键盘
        webView.scrollView.bounces = false
        webView.scrollView.delaysContentTouches = false
        webView.scrollView.canCancelContentTouches = true
        webView.scrollView.keyboardDismissMode = .interactive
        view.addSubview(webView)
        webView.translatesAutoresizingMaskIntoConstraints = false
        // 全屏沉浸：用 view 边缘而非 safeArea，横屏时画面更大（不缩进刘海凹口）
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
    }

    private func setupToolbar() {
        let reload = UIBarButtonItem(barButtonSystemItem: .refresh, target: self, action: #selector(reload))
        let toggle = UIBarButtonItem(
            image: UIImage(systemName: "character.bubble"),
            style: .plain, target: self, action: #selector(toggleTranslate))
        toggle.tintColor = defaults.bool(forKey: "tr_enabled") ? .systemBlue : .secondaryLabel
        toggle.accessibilityLabel = "翻译开关"
        let cheat = UIBarButtonItem(
            image: UIImage(systemName: "gift"),
            style: .plain, target: self, action: #selector(toggleCheat))
        cheat.tintColor = .systemOrange
        cheat.accessibilityLabel = "作弊器"
        toolbarItems = [reload, .flexibleSpace(), cheat, .flexibleSpace(), toggle]
        navigationController?.setToolbarHidden(false, animated: false)
    }

    @objc private func toggleCheat() {
        webView.evaluateJavaScript("window.RPGCheat && window.RPGCheat.toggle();") { _, _ in }
    }

    @objc private func reload() {
        webView.stopLoading()
        loadGame()
    }

    @objc private func toggleTranslate() {
        let newValue = !defaults.bool(forKey: "tr_enabled")
        defaults.set(newValue, forKey: "tr_enabled")
        toolbarItems?.last?.tintColor = newValue ? .systemBlue : .secondaryLabel
        webView.evaluateJavaScript("window.RPGTranslator && window.RPGTranslator.setEnabled(\(newValue));") { _, _ in }
        if newValue {
            webView.evaluateJavaScript("window.RPGTranslator && window.RPGTranslator.resetSession();") { _, _ in }
        }
    }

    private func loadGame() {
        // 目录名含 [ ] 空格等特殊字符时 file:// 相对资源加载失败，先自动重命名为安全名
        let safeDir = SafePath.sanitize(gameDir)
        guard let target = GameDetector.resolveLoadTarget(for: safeDir) else {
            let alert = UIAlertController(title: "无法识别游戏目录",
                                          message: "\(safeDir.lastPathComponent) 里没有找到 index.html 或 www/js 核心文件。",
                                          preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "好", style: .default))
            present(alert, animated: true)
            return
        }
        // allowingReadAccessTo 必须是目录 URL（尾斜杠），否则子资源读取被拒
        let rootStr = target.readRoot.path.hasSuffix("/") ? target.readRoot.path : target.readRoot.path + "/"
        let rootDir = URL(fileURLWithPath: rootStr, isDirectory: true)
        // 多语言插件名修复（日文/中文/语言后缀 js）：plugins.js 引用名与文件不匹配时建别名
        GameDetector.fixPluginAliases(in: target.readRoot)
        webView.loadFileURL(target.index, allowingReadAccessTo: rootDir)
    }

    // MARK: - WKScriptMessageHandler

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        print("rpgTr:", message.body)
    }

    // MARK: - WKNavigationDelegate

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        print("nav error:", error.localizedDescription)
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        print("provisional error:", error.localizedDescription)
        CrashReporter.log("GameViewController provisional error: \(error.localizedDescription)")
    }
}
