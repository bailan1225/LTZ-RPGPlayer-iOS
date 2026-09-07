import UIKit
import WebKit

/// 游戏运行页：WKWebView 加载游戏 index.html，并注入翻译脚本
final class GameViewController: UIViewController, WKScriptMessageHandler, WKNavigationDelegate {

    private let gameDir: URL
    private var webView: WKWebView!
    private let defaults = UserDefaults.standard
    private var pageLoaded = false

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
        navigationController?.setToolbarHidden(true, animated: false)
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
        let save = UIBarButtonItem(
            image: UIImage(systemName: "externaldrive"),
            style: .plain, target: self, action: #selector(manageSaves))
        save.tintColor = .systemTeal
        save.accessibilityLabel = "存档管理"
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
        toolbarItems = [reload, .flexibleSpace(), save, .flexibleSpace(), cheat, .flexibleSpace(), toggle]
        navigationController?.setToolbarHidden(false, animated: false)
    }

    @objc private func toggleCheat() {
        webView.evaluateJavaScript("window.RPGCheat && window.RPGCheat.toggle();") { _, _ in }
    }

    // MARK: - 存档管理（mtool 风格：备份/恢复 localStorage）

    private static var docs: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }

    private static var savesDir: URL {
        let d = docs.appendingPathComponent("Saves", isDirectory: true)
        try? FileManager.default.createDirectory(at: d, withIntermediateDirectories: true)
        return d
    }

    private var gameDisplayName: String {
        SafePath.originalName(for: gameDir) ?? gameDir.lastPathComponent
    }

    @objc private func manageSaves() {
        let a = UIAlertController(title: "存档管理（\(gameDisplayName)）", message: nil, preferredStyle: .actionSheet)
        a.addAction(UIAlertAction(title: "备份当前存档", style: .default) { [weak self] _ in self?.backupSaves() })
        a.addAction(UIAlertAction(title: "恢复存档", style: .default) { [weak self] _ in self?.listSaves() })
        a.addAction(UIAlertAction(title: "取消", style: .cancel))
        if let pop = a.popoverPresentationController {
            pop.sourceView = view
            pop.sourceRect = view.bounds
        }
        present(a, animated: true)
    }

    private func backupSaves() {
        guard pageLoaded else {
            toast("游戏还没加载完，稍后再备份")
            return
        }
        let js = "(function(){var o={};for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);o[k]=localStorage.getItem(k);}return JSON.stringify(o);})()"
        webView.evaluateJavaScript(js) { [weak self] result, error in
            guard let self = self else { return }
            if let json = result as? String, !json.isEmpty, json != "{}" {
                let name = "\(self.gameDisplayName)_\(Self.timestamp()).json"
                let url = Self.savesDir.appendingPathComponent(name)
                do {
                    try json.write(to: url, atomically: true, encoding: .utf8)
                    self.toast("存档已备份：\(name)")
                } catch {
                    self.toast("备份写入失败")
                }
            } else {
                self.toast("没有可备份的存档（\(error?.localizedDescription ?? "空")）")
            }
        }
    }

    private func listSaves() {
        let files = ((try? FileManager.default.contentsOfDirectory(
            at: Self.savesDir, includingPropertiesForKeys: nil)) ?? [])
            .filter { $0.pathExtension == "json" }
            .sorted { $0.lastPathComponent > $1.lastPathComponent }
        guard !files.isEmpty else {
            toast("还没有存档备份")
            return
        }
        let a = UIAlertController(title: "恢复存档", message: "选择要恢复的备份（会覆盖当前游戏存档）", preferredStyle: .actionSheet)
        for f in files {
            a.addAction(UIAlertAction(title: f.lastPathComponent, style: .default) { [weak self] _ in
                self?.restoreSaves(from: f)
            })
        }
        a.addAction(UIAlertAction(title: "取消", style: .cancel))
        if let pop = a.popoverPresentationController {
            pop.sourceView = view
            pop.sourceRect = view.bounds
        }
        present(a, animated: true)
    }

    private func restoreSaves(from file: URL) {
        guard let data = try? Data(contentsOf: file),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: String],
              !obj.isEmpty else {
            toast("备份文件无效")
            return
        }
        // 序列化注入语句：先清空再写入
        var js = "localStorage.clear();"
        for (k, v) in obj {
            let kk = (k as NSString).replacingOccurrences(of: "\\", with: "\\\\")
                .replacingOccurrences(of: "'", with: "\\'")
            let vv = (v as NSString).replacingOccurrences(of: "\\", with: "\\\\")
                .replacingOccurrences(of: "'", with: "\\'")
            js += "localStorage.setItem('\(kk)','\(vv)');"
        }
        js += "location.reload();"
        webView.evaluateJavaScript(js) { [weak self] _, error in
            self?.toast(error == nil ? "存档已恢复，正在重载…" : "恢复失败：\(error?.localizedDescription ?? "")")
        }
    }

    private static func timestamp() -> String {
        let f = DateFormatter()
        f.dateFormat = "yyyyMMdd_HHmmss"
        return f.string(from: Date())
    }

    private func toast(_ msg: String) {
        DispatchQueue.main.async {
            let alert = UIAlertController(title: nil, message: msg, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "好", style: .default))
            self.present(alert, animated: true)
        }
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
        webView.loadFileURL(target.index, allowingReadAccessTo: rootDir)
    }

    // MARK: - WKScriptMessageHandler

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        print("rpgTr:", message.body)
    }

    // MARK: - WKNavigationDelegate

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        pageLoaded = true
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        print("nav error:", error.localizedDescription)
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        print("provisional error:", error.localizedDescription)
        CrashReporter.log("GameViewController provisional error: \(error.localizedDescription)")
    }
}
