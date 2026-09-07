import UIKit
import WebKit
import Network

/// 轻量本地 HTTP 服务器：WKWebView 以 http://127.0.0.1:<port> 加载游戏，
/// 彻底规避 file:// 下 XHR 相对资源加载失败（Failed to load: data/xxx.json）与 CORS 限制，
/// 同时保证 localStorage/IndexedDB（游戏存档）正常工作。仅监听 loopback，无网络权限要求。
final class LocalHTTPServer {
    private var listener: NWListener?
    private let root: URL
    private let queue: DispatchQueue

    init(root: URL) {
        self.root = root.standardizedFileURL
        self.queue = DispatchQueue(label: "localhttp", qos: .userInitiated)
    }

    /// 异步启动监听随机端口；就绪后回调 onReady(port)，失败回调 onFailure。
    /// 注意：NWListener 是异步启动，必须先等 state == .ready 再让 WKWebView 发起请求，
    /// 否则会出现 "Could not connect to the server"。
    func start(onReady: @escaping (UInt16) -> Void, onFailure: @escaping () -> Void) {
        guard listener == nil else { return }
        do {
            let params = NWParameters.tcp
            params.allowLocalEndpointReuse = true
            params.requiredInterfaceType = .loopback
            let l = try NWListener(using: params, on: .any)
            l.newConnectionHandler = { [weak self] conn in self?.handle(conn) }
            l.stateUpdateHandler = { [weak self] state in
                switch state {
                case .ready:
                    self?.listener = l
                    if let p = l.port { onReady(p.rawValue) }
                case .failed, .cancelled:
                    self?.listener = nil
                    onFailure()
                default:
                    break
                }
            }
            l.start(queue: queue)
        } catch {
            onFailure()
        }
    }

    func stop() {
        listener?.cancel()
        listener = nil
    }

    private func handle(_ conn: NWConnection) {
        conn.start(queue: queue)
        receive(conn, data: Data())
    }

    private func receive(_ conn: NWConnection, data: Data) {
        conn.receive(minimumIncompleteLength: 1, maximumLength: 65536) { [weak self] chunk, _, isComplete, error in
            guard let self = self else { conn.cancel(); return }
            var acc = data
            if let chunk = chunk { acc.append(chunk) }
            // 请求头以 

 结束
            if let range = acc.range(of: Data("\r\n\r\n".utf8)) {
                let head = String(data: acc[..<range.lowerBound], encoding: .utf8) ?? ""
                self.respond(conn, head: head)
                return
            }
            if isComplete || error != nil {
                if !acc.isEmpty, let head = String(data: acc, encoding: .utf8) {
                    self.respond(conn, head: head)
                } else {
                    conn.cancel()
                }
                return
            }
            self.receive(conn, data: acc)
        }
    }

    private func respond(_ conn: NWConnection, head: String) {
        let lines = head.components(separatedBy: "\r\n")
        guard let requestLine = lines.first else { conn.cancel(); return }
        let parts = requestLine.split(separator: " ").map(String.init)
        guard parts.count >= 2, parts[0] == "GET" else { conn.cancel(); return }
        var path = parts[1]
        if let qi = path.firstIndex(of: "?") { path = String(path[..<qi]) }
        // 日文/中文/带空格文件名：浏览器会百分号编码，这里解码还原
        let decoded = path.removingPercentEncoding ?? path
        let rel = decoded.hasPrefix("/") ? String(decoded.dropFirst()) : decoded
        let fileURL = root.appendingPathComponent(rel).standardizedFileURL
        // 目录穿越防护：只允许 root 范围内
        let rootPath = root.path
        guard fileURL.path == rootPath || fileURL.path.hasPrefix(rootPath + "/") else { conn.cancel(); return }

        var isDir: ObjCBool = false
        guard let resolved = resolveFile(fileURL),
              FileManager.default.fileExists(atPath: resolved.path, isDirectory: &isDir) else {
            send(conn, status: 404, mime: "text/plain", body: Data("404 Not Found".utf8))
            return
        }
        if isDir.boolValue {
            guard let idx = resolveFile(resolved.appendingPathComponent("index.html")),
                  let body = try? Data(contentsOf: idx) else {
                send(conn, status: 404, mime: "text/plain", body: Data("404 Not Found".utf8))
                return
            }
            send(conn, status: 200, mime: "text/html; charset=utf-8", body: body)
            return
        }
        guard let body = try? Data(contentsOf: resolved) else {
            send(conn, status: 500, mime: "text/plain", body: Data("500".utf8))
            return
        }
        send(conn, status: 200, mime: mimeType(resolved.pathExtension), body: body)
    }

    /// 精确命中失败时在同目录做大小写不敏感匹配（兼容插件/资源文件名大小写不一致）
    private func resolveFile(_ url: URL) -> URL? {
        if FileManager.default.fileExists(atPath: url.path) { return url }
        let dir = url.deletingLastPathComponent()
        let name = url.lastPathComponent
        guard let items = try? FileManager.default.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil) else { return nil }
        for item in items where item.lastPathComponent.compare(name, options: .caseInsensitive) == .orderedSame {
            return item
        }
        return nil
    }

    private func send(_ conn: NWConnection, status: Int, mime: String, body: Data) {
        let reason = status == 200 ? "OK" : (status == 404 ? "Not Found" : "Error")
        var head = "HTTP/1.1 \(status) \(reason)\r\n"
        head += "Content-Type: \(mime)\r\n"
        head += "Content-Length: \(body.count)\r\n"
        head += "Connection: close\r\n"
        head += "Access-Control-Allow-Origin: *\r\n"
        head += "\r\n"
        var payload = Data(head.utf8)
        payload.append(body)
        // 数据发送完成后再断开，避免响应被截断导致白屏
        conn.send(content: payload, completion: .contentProcessed { _ in conn.cancel() })
    }

    private func mimeType(_ ext: String) -> String {
        switch ext.lowercased() {
        case "html", "htm": return "text/html; charset=utf-8"
        case "js": return "application/javascript; charset=utf-8"
        case "json": return "application/json; charset=utf-8"
        case "css": return "text/css; charset=utf-8"
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
}

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

    private var httpServer: LocalHTTPServer?

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        UIApplication.shared.isIdleTimerDisabled = false
        httpServer?.stop()
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
        let safeDir = SafePath.sanitize(gameDir)
        guard let target = GameDetector.resolveLoadTarget(for: safeDir) else {
            let alert = UIAlertController(title: "无法识别游戏目录",
                                          message: "(safeDir.lastPathComponent) 里没有找到 index.html 或 www/js 核心文件。",
                                          preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "好", style: .default))
            present(alert, animated: true)
            return
        }
        // 多语言插件名修复（日文/中文/语言后缀 js）：plugins.js 引用名与文件不匹配时建别名
        GameDetector.fixPluginAliases(in: target.readRoot)
        httpServer?.stop()
        let server = LocalHTTPServer(root: target.readRoot)
        httpServer = server
        // 等待服务器就绪（NWListener 异步启动）后再加载，避免 Could not connect
        server.start(onReady: { [weak self] port in
            DispatchQueue.main.async {
                guard let self = self else { return }
                let rootPath = target.readRoot.standardizedFileURL.path
                var rel = target.index.standardizedFileURL.path
                if rel.hasPrefix(rootPath) { rel = String(rel.dropFirst(rootPath.count)) }
                rel = rel.hasPrefix("/") ? String(rel.dropFirst()) : rel
                let base = URL(string: "http://127.0.0.1:(port)/")!
                self.webView.load(URLRequest(url: base.appendingPathComponent(rel)))
            }
        }, onFailure: { [weak self] in
            DispatchQueue.main.async {
                guard let self = self else { return }
                let rootStr = target.readRoot.path.hasSuffix("/") ? target.readRoot.path : target.readRoot.path + "/"
                self.webView.loadFileURL(target.index, allowingReadAccessTo: URL(fileURLWithPath: rootStr, isDirectory: true))
            }
        })
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
        CrashReporter.log("GameViewController provisional error: (error.localizedDescription)")
        let desc = error.localizedDescription.lowercased()
        if desc.contains("could not connect") || desc.contains("network connection") {
            let alert = UIAlertController(
                title: "无法连接本地服务器",
                message: "本机回环加载被系统拦截。请到 设置 → 隐私与安全性 → 本地网络 允许本 App，然后点左上角刷新重试。",
                preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "好", style: .default))
            present(alert, animated: true)
        }
    }
}
