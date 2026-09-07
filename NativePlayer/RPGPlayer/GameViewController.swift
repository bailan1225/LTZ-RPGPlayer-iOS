import UIKit
import WebKit
import Network

/// 杞婚噺鏈湴 HTTP 鏈嶅姟鍣細WKWebView 浠?http://127.0.0.1:<port> 鍔犺浇娓告垙锛?/// 褰诲簳瑙勯伩 file:// 涓?XHR 鐩稿璧勬簮鍔犺浇澶辫触锛團ailed to load: data/xxx.json锛変笌 CORS 闄愬埗锛?/// 鍚屾椂淇濊瘉 localStorage/IndexedDB锛堟父鎴忓瓨妗ｏ級姝ｅ父宸ヤ綔銆備粎鐩戝惉 loopback锛屾棤缃戠粶鏉冮檺瑕佹眰銆?final class LocalHTTPServer {
    private var listener: NWListener?
    private let root: URL
    private let queue: DispatchQueue

    init(root: URL) {
        self.root = root.standardizedFileURL
        self.queue = DispatchQueue(label: "localhttp", qos: .userInitiated)
    }

    /// 鍚姩鐩戝惉闅忔満绔彛锛岃繑鍥?baseURL锛坔ttp://127.0.0.1:<port>/锛?    func start() -> URL? {
        if listener != nil { return baseURL() }
        do {
            let params = NWParameters.tcp
            params.allowLocalEndpointReuse = true
            params.requiredInterfaceType = .loopback
            let l = try NWListener(using: params, on: .any)
            l.newConnectionHandler = { [weak self] conn in self?.handle(conn) }
            l.start(queue: queue)
            listener = l
            return baseURL()
        } catch {
            return nil
        }
    }

    func stop() {
        listener?.cancel()
        listener = nil
    }

    private func baseURL() -> URL? {
        guard let port = listener?.port else { return nil }
        return URL(string: "http://127.0.0.1:\(port.rawValue)/")
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
            // 璇锋眰澶翠互 \r\n\r\n 缁撴潫
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
        defer { conn.cancel() }   // 鍗曡姹傚悗鍏抽棴锛岀畝鍗曞彲闈?        let lines = head.components(separatedBy: "\r\n")
        guard let requestLine = lines.first else { return }
        let parts = requestLine.split(separator: " ").map(String.init)
        guard parts.count >= 2, parts[0] == "GET" else { return }
        var path = parts[1]
        if let qi = path.firstIndex(of: "?") { path = String(path[..<qi]) }
        let decoded = path.removingPercentEncoding ?? path
        let rel = decoded.hasPrefix("/") ? String(decoded.dropFirst()) : decoded
        let fileURL = root.appendingPathComponent(rel).standardizedFileURL
        // 鐩綍绌胯秺闃叉姢锛氬彧鍏佽 root 鑼冨洿鍐?        let rootPath = root.path
        guard fileURL.path == rootPath || fileURL.path.hasPrefix(rootPath + "/") else { return }

        var isDir: ObjCBool = false
        guard FileManager.default.fileExists(atPath: fileURL.path, isDirectory: &isDir) else {
            send(conn, status: 404, mime: "text/plain", body: Data("404 Not Found".utf8))
            return
        }
        if isDir.boolValue {
            let idx = fileURL.appendingPathComponent("index.html")
            guard FileManager.default.fileExists(atPath: idx.path),
                  let body = try? Data(contentsOf: idx) else {
                send(conn, status: 404, mime: "text/plain", body: Data("404 Not Found".utf8))
                return
            }
            send(conn, status: 200, mime: "text/html; charset=utf-8", body: body)
            return
        }
        guard let body = try? Data(contentsOf: fileURL) else {
            send(conn, status: 500, mime: "text/plain", body: Data("500".utf8))
            return
        }
        send(conn, status: 200, mime: mimeType(fileURL.pathExtension), body: body)
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

/// 娓告垙杩愯椤碉細WKWebView 鍔犺浇娓告垙 index.html锛屽苟娉ㄥ叆缈昏瘧鑴氭湰
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

    // MARK: - 灞忓箷鏂瑰悜锛氭父鎴忚繍琛岄〉寮哄埗妯睆

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

        // 1) 娉ㄥ叆缈昏瘧閰嶇疆锛堝湪娓告垙鑴氭湰涔嬪墠锛?        contentController.addUserScript(WKUserScript(
            source: TranslatorConfig.injectionSource(),
            injectionTime: .atDocumentStart, forMainFrameOnly: true))
        // 2) 娉ㄥ叆缈昏瘧琛ヤ竵鑴氭湰
        contentController.addUserScript(WKUserScript(
            source: TranslatorJS.source,
            injectionTime: .atDocumentStart, forMainFrameOnly: true))
        // 3) 娉ㄥ叆浣滃紛鍣ㄨ剼鏈?        contentController.addUserScript(WKUserScript(
            source: CheatJS.source,
            injectionTime: .atDocumentStart, forMainFrameOnly: true))
        contentController.add(self, name: "rpgTr")
        contentController.add(self, name: "rpgCheat")

        config.userContentController = contentController
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        // iOS 17 瑙︽懜/閿洏缁嗚妭锛氱偣鍑绘洿璺熸墜銆佹嫋鎷芥敹璧烽敭鐩?        webView.scrollView.bounces = false
        webView.scrollView.delaysContentTouches = false
        webView.scrollView.canCancelContentTouches = true
        webView.scrollView.keyboardDismissMode = .interactive
        view.addSubview(webView)
        webView.translatesAutoresizingMaskIntoConstraints = false
        // 鍏ㄥ睆娌夋蹈锛氱敤 view 杈圭紭鑰岄潪 safeArea锛屾í灞忔椂鐢婚潰鏇村ぇ锛堜笉缂╄繘鍒樻捣鍑瑰彛锛?        NSLayoutConstraint.activate([
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
        toggle.accessibilityLabel = "缈昏瘧寮€鍏?
        let cheat = UIBarButtonItem(
            image: UIImage(systemName: "gift"),
            style: .plain, target: self, action: #selector(toggleCheat))
        cheat.tintColor = .systemOrange
        cheat.accessibilityLabel = "浣滃紛鍣?
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
        // 鐩綍鍚嶅惈 [ ] 绌烘牸绛夌壒娈婂瓧绗︽椂 file:// 鐩稿璧勬簮鍔犺浇澶辫触锛屽厛鑷姩閲嶅懡鍚嶄负瀹夊叏鍚?        let safeDir = SafePath.sanitize(gameDir)
        guard let target = GameDetector.resolveLoadTarget(for: safeDir) else {
            let alert = UIAlertController(title: "鏃犳硶璇嗗埆娓告垙鐩綍",
                                          message: "\(safeDir.lastPathComponent) 閲屾病鏈夋壘鍒?index.html 鎴?www/js 鏍稿績鏂囦欢銆?,
                                          preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "濂?, style: .default))
            present(alert, animated: true)
            return
        }
        // 澶氳瑷€鎻掍欢鍚嶄慨澶嶏紙鏃ユ枃/涓枃/璇█鍚庣紑 js锛夛細plugins.js 寮曠敤鍚嶄笌鏂囦欢涓嶅尮閰嶆椂寤哄埆鍚?        GameDetector.fixPluginAliases(in: target.readRoot)
        // 鏈湴 HTTP 鏈嶅姟鍣ㄥ姞杞斤細瑙勯伩 file:// 涓?XHR 鍔犺浇 data/*.json 澶辫触锛坕OS 17锛?        httpServer?.stop()
        let server = LocalHTTPServer(root: target.readRoot)
        guard let base = server.start() else {
            // 鏈嶅姟鍣ㄥ惎鍔ㄥけ璐ュ厹搴曪細鍥為€€ file:// 鐩存帴鍔犺浇
            let rootStr = target.readRoot.path.hasSuffix("/") ? target.readRoot.path : target.readRoot.path + "/"
            webView.loadFileURL(target.index, allowingReadAccessTo: URL(fileURLWithPath: rootStr, isDirectory: true))
            return
        }
        httpServer = server
        // index.html 鐩稿 root 鐨勮矾寰?        let rootPath = target.readRoot.standardizedFileURL.path
        var rel = target.index.standardizedFileURL.path
        if rel.hasPrefix(rootPath) {
            rel = String(rel.dropFirst(rootPath.count))
        }
        rel = rel.hasPrefix("/") ? String(rel.dropFirst()) : rel
        let url = base.appendingPathComponent(rel)
        webView.load(URLRequest(url: url))
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
