import UIKit
import WebKit

/// 自定义 URL scheme 处理器：rpg://game/<path> 直接读本地文件返回。
/// 替代本地 HTTP 服务器 —— 消除 "Could not connect" / 本地网络权限弹窗 / 端口问题，
/// MV/MZ 的 XHR/fetch、音频、localStorage/IndexedDB 全部正常工作；
/// 每个游戏用独立 GameViewController + handler，origin 天然隔离，存档互不污染。
final class GameSchemeHandler: NSObject, WKURLSchemeHandler {

    private let root: URL
    /// 文件名(小写)→URL 索引：避免每次请求全目录扫描（游戏加载上千资源时 O(n²) 卡顿/白屏）
    private var fileIndex: [String: URL] = [:]
    private var indexBuilt = false
    private let indexLock = NSLock()

    init(root: URL) {
        self.root = root.standardizedFileURL
        super.init()
        buildIndex()
    }

    private func buildIndex() {
        indexLock.lock()
        defer { indexLock.unlock() }
        guard !indexBuilt else { return }
        indexBuilt = true
        var rels: [String] = []
        var stack = [root]
        while let dir = stack.popLast() {
            guard let items = try? FileManager.default.contentsOfDirectory(
                at: dir, includingPropertiesForKeys: nil, options: [.skipsHiddenFiles]) else { continue }
            for item in items {
                var isDir: ObjCBool = false
                if FileManager.default.fileExists(atPath: item.path, isDirectory: &isDir) {
                    if isDir.boolValue {
                        stack.append(item)
                    } else {
                        let rel = item.path.hasPrefix(root.path + "/")
                            ? String(item.path.dropFirst((root.path + "/").count))
                            : item.lastPathComponent
                        rels.append(rel)
                    }
                }
            }
        }
        var index: [String: URL] = [:]
        for rel in rels { index[rel.lowercased()] = root.appendingPathComponent(rel) }
        fileIndex = index
    }

    /// 精确命中失败时做大小写不敏感匹配（兼容插件/资源文件名大小写不一致）
    private func resolve(_ url: URL) -> URL? {
        if FileManager.default.fileExists(atPath: url.path) { return url }
        let name = url.lastPathComponent.lowercased()
        if let hit = fileIndex[name] { return hit }
        let dir = url.deletingLastPathComponent()
        if let items = try? FileManager.default.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil) {
            for item in items where item.lastPathComponent.compare(url.lastPathComponent, options: .caseInsensitive) == .orderedSame {
                return item
            }
        }
        return nil
    }

    private func mimeType(_ ext: String) -> String {
        switch ext.lowercased() {
        case "html", "htm": return "text/html"
        case "js": return "application/javascript"
        case "json": return "application/json"
        case "css": return "text/css"
        case "png": return "image/png"
        case "jpg", "jpeg": return "image/jpeg"
        case "gif": return "image/gif"
        case "webp": return "image/webp"
        case "ico": return "image/x-icon"
        case "svg": return "image/svg+xml"
        case "woff": return "font/woff"
        case "woff2": return "font/woff2"
        case "ttf": return "font/ttf"
        case "otf": return "font/otf"
        case "ogg": return "audio/ogg"
        case "m4a": return "audio/mp4"
        case "mp3": return "audio/mpeg"
        case "wav": return "audio/wav"
        case "mp4": return "video/mp4"
        case "webm": return "video/webm"
        case "mov": return "video/quicktime"
        default: return "application/octet-stream"
        }
    }

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let url = urlSchemeTask.request.url else {
            urlSchemeTask.didFailWithError(NSError(domain: "GameScheme", code: -1, userInfo: nil))
            return
        }
        var path = url.path
        if path.isEmpty || path == "/" { path = "/index.html" }
        let rel = path.hasPrefix("/") ? String(path.dropFirst()) : path
        let fileURL = root.appendingPathComponent(rel).standardizedFileURL
        // 目录穿越防护：只允许 root 范围内
        let rootPath = root.path
        guard fileURL.path == rootPath || fileURL.path.hasPrefix(rootPath + "/") else {
            urlSchemeTask.didFailWithError(NSError(domain: "GameScheme", code: 403, userInfo: nil))
            return
        }
        var isDir: ObjCBool = false
        guard let resolved = resolve(fileURL),
              FileManager.default.fileExists(atPath: resolved.path, isDirectory: &isDir) else {
            urlSchemeTask.didFailWithError(NSError(domain: "GameScheme", code: 404,
                                                   userInfo: [NSLocalizedDescriptionKey: "404 \(rel)"]))
            return
        }
        var finalURL = resolved
        if isDir.boolValue {
            guard let idx = resolve(resolved.appendingPathComponent("index.html")),
                  FileManager.default.fileExists(atPath: idx.path) else {
                urlSchemeTask.didFailWithError(NSError(domain: "GameScheme", code: 404, userInfo: nil))
                return
            }
            finalURL = idx
        }
        guard let data = try? Data(contentsOf: finalURL) else {
            urlSchemeTask.didFailWithError(NSError(domain: "GameScheme", code: 500, userInfo: nil))
            return
        }
        let mime = mimeType(finalURL.pathExtension)
        let response = URLResponse(url: url, mimeType: mime,
                                   expectedContentLength: data.count,
                                   textEncodingName: mime.hasPrefix("text/") ? "utf-8" : nil)
        urlSchemeTask.didReceive(response)
        urlSchemeTask.didReceive(data)
        urlSchemeTask.didFinish()
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {}
}

/// 游戏运行页：WKWebView 以 rpg:// 自定义协议加载游戏，并注入翻译/作弊/控制台捕获脚本
final class GameViewController: UIViewController, WKScriptMessageHandler, WKNavigationDelegate, WKUIDelegate {

    private let gameDir: URL
    private var webView: WKWebView!
    private let defaults = UserDefaults.standard
    private var loadingView: UIView?
    private var loadingDeadline: DispatchWorkItem?
    private var currentTarget: (index: URL, readRoot: URL)?
    private var pageLoaded = false
    private var schemeHandler: GameSchemeHandler?

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
        // 先解析游戏目标并解密加密资源（.rpgmvp 等 → 真实格式），再建加载器索引，
        // 否则 scheme handler 的索引里只有加密文件名，解密后的新文件名会 404
        let safeDir = SafePath.sanitize(gameDir)
        currentTarget = GameDetector.resolveLoadTarget(for: safeDir)
        if let target = currentTarget, GameDecryptor.needsDecryption(in: target.readRoot) {
            showLoading("正在解密游戏资源…")
            let r = GameDecryptor.decryptIfNeeded(in: target.readRoot)
            if r.ok && r.files > 0 {
                CrashReporter.log("decrypted \(r.files) encrypted files")
            } else if !r.ok {
                CrashReporter.log("decrypt failed: encryption key not found")
            }
            hideLoading()
        }
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
        webView?.stopLoading()
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
        // 4) 注入控制台/错误捕获（诊断"不能玩"根因：JS 报错、XHR 失败、未捕获异常全量进日志）
        contentController.addUserScript(WKUserScript(
            source: """
            (function () {
              if (window.__rpgConsoleHooked) return;
              window.__rpgConsoleHooked = true;
              ["log", "warn", "error", "info"].forEach(function (level) {
                var orig = console[level];
                console[level] = function () {
                  try {
                    var args = Array.prototype.slice.call(arguments).map(function (a) {
                      try {
                        if (a && a.message) return a.message;
                        if (typeof a === "string") return a;
                        return JSON.stringify(a);
                      } catch (e) { return String(a); }
                    });
                    window.webkit.messageHandlers.rpgConsole.postMessage(level + ": " + args.join(" "));
                  } catch (e) {}
                  orig.apply(console, arguments);
                };
              });
              window.addEventListener("error", function (e) {
                try {
                  window.webkit.messageHandlers.rpgConsole.postMessage("error: " + (e.message || "") + " @" + (e.filename || "") + ":" + (e.lineno || ""));
                } catch (err) {}
              });
              window.addEventListener("unhandledrejection", function (e) {
                try {
                  window.webkit.messageHandlers.rpgConsole.postMessage("rejection: " + ((e.reason && e.reason.message) || String(e.reason)));
                } catch (err) {}
              });
            })();
            """,
            injectionTime: .atDocumentStart, forMainFrameOnly: true))
        contentController.add(self, name: "rpgTr")
        contentController.add(self, name: "rpgCheat")
        contentController.add(self, name: "rpgConsole")

        config.userContentController = contentController
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        // rpg:// 自定义协议：直接读本地文件，不走网络（currentTarget 已在 viewDidLoad 解析）
        let handler = GameSchemeHandler(root: currentTarget?.readRoot ?? gameDir)
        schemeHandler = handler
        config.setURLSchemeHandler(handler, forURLScheme: "rpg")

        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.uiDelegate = self
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
        showLoading("正在加载游戏…")
    }

    private func showLoading(_ text: String) {
        if loadingView == nil {
            let box = UIView()
            box.backgroundColor = UIColor(white: 0, alpha: 0.55)
            box.layer.cornerRadius = 14
            let label = UILabel()
            label.textAlignment = .center
            label.textColor = .white
            label.font = .systemFont(ofSize: 15)
            label.tag = 7
            let spin = UIActivityIndicatorView(style: .large)
            spin.color = .white
            spin.startAnimating()
            box.addSubview(label)
            box.addSubview(spin)
            label.translatesAutoresizingMaskIntoConstraints = false
            spin.translatesAutoresizingMaskIntoConstraints = false
            NSLayoutConstraint.activate([
                spin.centerXAnchor.constraint(equalTo: box.centerXAnchor),
                spin.topAnchor.constraint(equalTo: box.topAnchor, constant: 18),
                label.topAnchor.constraint(equalTo: spin.bottomAnchor, constant: 10),
                label.leadingAnchor.constraint(equalTo: box.leadingAnchor, constant: 16),
                label.trailingAnchor.constraint(equalTo: box.trailingAnchor, constant: -16),
                label.bottomAnchor.constraint(equalTo: box.bottomAnchor, constant: -18)
            ])
            box.translatesAutoresizingMaskIntoConstraints = false
            loadingView = box
        }
        guard let box = loadingView else { return }
        (box.viewWithTag(7) as? UILabel)?.text = text
        if box.superview == nil {
            view.addSubview(box)
            NSLayoutConstraint.activate([
                box.centerXAnchor.constraint(equalTo: view.centerXAnchor),
                box.centerYAnchor.constraint(equalTo: view.centerYAnchor)
            ])
        }
    }

    private func hideLoading() {
        loadingView?.removeFromSuperview()
        loadingView = nil
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
        guard let target = currentTarget else {
            let alert = UIAlertController(title: "无法识别游戏目录",
                                          message: "\(gameDir.lastPathComponent) 里没有找到 index.html 或 www/js 核心文件。",
                                          preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "好", style: .default))
            present(alert, animated: true)
            return
        }
        // 加载超时防护：90 秒未完成（didFinish 未到）自动收起浮层并记录，避免"一直加载"
        loadingDeadline?.cancel()
        let deadline = DispatchWorkItem { [weak self] in
            CrashReporter.log("loading timeout: didFinish not received within 90s")
            self?.hideLoading()
        }
        loadingDeadline = deadline
        DispatchQueue.main.asyncAfter(deadline: .now() + 90, execute: deadline)
        // 多语言插件名修复（日文/中文/语言后缀 js）：plugins.js 引用名与文件不匹配时建别名
        GameDetector.fixPluginAliases(in: target.readRoot)
        // rpg://<游戏名十六进制>/<相对路径> —— 每游戏唯一 host：同一游戏存档稳定，跨游戏天然隔离
        // （host 仅允许字母数字，游戏名转十六进制保证 URL 合法）
        let host = target.readRoot.lastPathComponent.utf8.map { String(format: "%02x", $0) }.joined()
        let rootPath = target.readRoot.standardizedFileURL.path
        var rel = target.index.standardizedFileURL.path
        if rel.hasPrefix(rootPath) { rel = String(rel.dropFirst(rootPath.count)) }
        rel = rel.hasPrefix("/") ? String(rel.dropFirst()) : rel
        let base = URL(string: "rpg://\(host)/")!
        webView.load(URLRequest(url: base.appendingPathComponent(rel)))
    }

    // MARK: - WKScriptMessageHandler

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "rpgConsole", let text = message.body as? String {
            // JS 控制台/报错进崩溃日志，供列表页「日志」查看定位问题
            CrashReporter.log("[js] " + text)
            return
        }
        print("rpgTr:", message.body)
    }

    // MARK: - WKNavigationDelegate

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        hideLoading()
        loadingDeadline?.cancel()
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        print("nav error:", error.localizedDescription)
        CrashReporter.log("nav error: \(error.localizedDescription)")
        loadingDeadline?.cancel()
        showLoading("加载出错：\(error.localizedDescription)\n点左上角刷新重试")
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        print("provisional error:", error.localizedDescription)
        CrashReporter.log("provisional error: \(error.localizedDescription)")
        loadingDeadline?.cancel()
        showLoading("加载失败：\(error.localizedDescription)\n点左上角刷新重试")
    }

    // MARK: - WKUIDelegate（作弊器 prompt 输入：设置变量/开关/金钱）

    func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String,
                 defaultText: String?, initiatedByFrame frame: WKFrameInfo,
                 completionHandler: @escaping (String?) -> Void) {
        let alert = UIAlertController(title: "作弊器输入", message: prompt, preferredStyle: .alert)
        alert.addTextField { tf in
            tf.text = defaultText ?? ""
            tf.keyboardType = .numbersAndPunctuation
            tf.autocorrectionType = .no
        }
        alert.addAction(UIAlertAction(title: "确定", style: .default) { _ in
            completionHandler(alert.textFields?.first?.text)
        })
        alert.addAction(UIAlertAction(title: "取消", style: .cancel) { _ in completionHandler(nil) })
        present(alert, animated: true)
    }

    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let alert = UIAlertController(title: "提示", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "好", style: .default) { _ in completionHandler() })
        present(alert, animated: true)
    }
}
