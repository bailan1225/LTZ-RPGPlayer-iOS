import UIKit
import WebKit
import UniformTypeIdentifiers

/// 自定义 URL scheme 处理器：rpg://game/<path> 直接读本地文件返回。
/// 替代本地 HTTP 服务器 —— 消除 "Could not connect" / 本地网络权限弹窗 / 端口问题，
/// MV/MZ 的 XHR/fetch、音频、localStorage/IndexedDB 全部正常工作；
/// 每个游戏用独立 GameViewController + handler，origin 天然隔离，存档互不污染。
final class GameSchemeHandler: NSObject, WKURLSchemeHandler {

    private let root: URL
    private let decryptKey: [UInt8]?
    /// 文件名(小写)→URL 索引：避免每次请求全目录扫描（游戏加载上千资源时 O(n²) 卡顿/白屏）
    private var fileIndex: [String: URL] = [:]
    private var indexBuilt = false
    private let indexLock = NSLock()
    /// 跟踪活跃任务，stop 时标记取消（防止异步读取完成后对已取消任务调用 didFinish 崩溃）
    private var activeTasks = Set<ObjectIdentifier>()
    private let taskLock = NSLock()

    init(root: URL) {
        self.root = root.standardizedFileURL
        self.decryptKey = GameDecryptor.loadKey(in: root)
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
        for rel in rels {
            // 用文件名（小写）做 key，与 resolve 的 url.lastPathComponent.lowercased() 匹配
            let filename = (rel as NSString).lastPathComponent.lowercased()
            index[filename] = root.appendingPathComponent(rel)
        }
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

    /// fallback：请求 .png/.ogg/.mp4 但文件还是 .rpgmvp/.rpgmvo/.rpgmvm（预解密遗漏），
    /// 实时解密返回 Data。只在常规 resolve 失败后调用。
    /// 检查图片/音频数据魔数是否有效（用于检测旧版本解坏的残留文件）
    static func isValidMediaMagic(_ data: Data) -> Bool {
        guard data.count >= 4 else { return false }
        let bytes = [UInt8](data.prefix(12))
        // PNG
        if bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47 { return true }
        // JPEG
        if bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF { return true }
        // GIF
        if bytes[0] == 0x47 && bytes[1] == 0x49 && bytes[2] == 0x46 { return true }
        // WEBP (RIFF....WEBP)
        if bytes[0] == 0x52 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x46
           && bytes[8] == 0x57 && bytes[9] == 0x45 && bytes[10] == 0x42 && bytes[11] == 0x50 { return true }
        // OGG
        if bytes[0] == 0x4F && bytes[1] == 0x67 && bytes[2] == 0x67 && bytes[3] == 0x53 { return true }
        // MP3 (ID3 or sync)
        if (bytes[0] == 0x49 && bytes[1] == 0x44 && bytes[2] == 0x33) || (bytes[0] == 0xFF && bytes[1] == 0xFB) { return true }
        // WAV (RIFF....WAVE)
        if bytes[0] == 0x52 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x46
           && bytes[8] == 0x57 && bytes[10] == 0x41 && bytes[11] == 0x56 { return true }
        // M4A/MP4 (ftyp at offset 4)
        if data.count >= 8 && bytes[4] == 0x66 && bytes[5] == 0x74 && bytes[6] == 0x79 && bytes[7] == 0x70 { return true }
        return false
    }

    private func resolveEncryptedFallback(_ fileURL: URL) -> Data? {
        guard let key = decryptKey else { return nil }
        let extMap = ["png": "rpgmvp", "jpg": "rpgmvp", "jpeg": "rpgmvp", "gif": "rpgmvp", "webp": "rpgmvp",
                      "ogg": "rpgmvo", "m4a": "rpgmvo", "mp3": "rpgmvo", "wav": "rpgmvo",
                      "mp4": "rpgmvm", "webm": "rpgmvm"]
        let ext = fileURL.pathExtension.lowercased()
        guard let encExt = extMap[ext] else { return nil }
        let encURL = fileURL.deletingPathExtension().appendingPathExtension(encExt)
        guard FileManager.default.fileExists(atPath: encURL.path),
              let data = try? Data(contentsOf: encURL),
              let plain = GameDecryptor.decrypt(data, key: key) else { return nil }
        return plain
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
        let startTime = Date()
        let taskID = ObjectIdentifier(urlSchemeTask)
        taskLock.lock()
        activeTasks.insert(taskID)
        taskLock.unlock()

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

        // 异步读取文件：避免大文件阻塞 WKURLSchemeHandler 线程导致 The operation was aborted
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }
            // 检查任务是否已取消
            self.taskLock.lock()
            let isActive = self.activeTasks.contains(taskID)
            self.taskLock.unlock()
            guard isActive else { return }

            // 慢资源日志：超过 500ms 的本地文件读取会记录
            defer {
                let elapsed = Date().timeIntervalSince(startTime)
                if elapsed > 0.5 {
                    CrashReporter.log(String(format: "scheme slow: %.2fs %@", elapsed, rel))
                }
            }

            var isDir: ObjCBool = false
            if let resolved = self.resolve(fileURL),
               FileManager.default.fileExists(atPath: resolved.path, isDirectory: &isDir) {
                var finalURL = resolved
                if isDir.boolValue {
                    guard let idx = self.resolve(resolved.appendingPathComponent("index.html")),
                          FileManager.default.fileExists(atPath: idx.path) else {
                        self.failTask(urlSchemeTask, code: 404, message: "404 \(rel)")
                        return
                    }
                    finalURL = idx
                }
                guard let data = try? Data(contentsOf: finalURL) else {
                    self.failTask(urlSchemeTask, code: 500, message: "read error \(rel)")
                    return
                }
                // 损坏检测：旧版本可能把 .rpgmvp 解坏成 .png（XOR key 错误），
                // 文件存在但魔数无效。此时自动从同名 .rpgmvp 重新解密。
                let ext = finalURL.pathExtension.lowercased()
                let isMedia = ["png","jpg","jpeg","gif","webp","ogg","m4a","mp3","wav","mp4","webm"].contains(ext)
                var finalData = data
                if isMedia, !GameSchemeHandler.isValidMediaMagic(data),
                   let repaired = self.resolveEncryptedFallback(fileURL) {
                    finalData = repaired
                    CrashReporter.log("scheme auto-repair corrupt: \(rel)")
                }
                let mime = self.mimeType(finalURL.pathExtension)
                let response = URLResponse(url: url, mimeType: mime,
                                           expectedContentLength: finalData.count,
                                           textEncodingName: mime.hasPrefix("text/") ? "utf-8" : nil)
                self.succeedTask(urlSchemeTask, response: response, data: finalData)
            } else if let decrypted = self.resolveEncryptedFallback(fileURL) {
                // fallback：请求 .png 但文件还是 .rpgmvp（预解密遗漏），实时解密返回
                let mime = self.mimeType(fileURL.pathExtension)
                let response = URLResponse(url: url, mimeType: mime,
                                           expectedContentLength: decrypted.count,
                                           textEncodingName: nil)
                self.succeedTask(urlSchemeTask, response: response, data: decrypted)
                CrashReporter.log("scheme decrypt-fallback: \(rel)")
            } else {
                // 最后尝试：fileIndex 全局查找同名文件（可能在不同目录，RPG Maker 资源名唯一）
                let name = fileURL.lastPathComponent.lowercased()
                if let hit = self.fileIndex[name], let data = try? Data(contentsOf: hit) {
                    let mime = self.mimeType(hit.pathExtension)
                    let response = URLResponse(url: url, mimeType: mime,
                                               expectedContentLength: data.count,
                                               textEncodingName: nil)
                    self.succeedTask(urlSchemeTask, response: response, data: data)
                    CrashReporter.log("scheme 404→index hit: \(rel) -> \(hit.lastPathComponent)")
                    return
                }
                let indexCount = self.fileIndex.count
                let hasName = self.fileIndex[name] != nil
                CrashReporter.log("scheme 404: \(rel) | index:\(indexCount) nameMatch:\(hasName)")
                self.failTask(urlSchemeTask, code: 404, message: "404 \(rel)")
            }
        }
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {
        let taskID = ObjectIdentifier(urlSchemeTask)
        taskLock.lock()
        activeTasks.remove(taskID)
        taskLock.unlock()
    }

    /// 安全完成任务：检查任务是否仍活跃，避免对已取消任务调用 didFinish 崩溃
    private func succeedTask(_ task: WKURLSchemeTask, response: URLResponse, data: Data) {
        taskLock.lock()
        let isActive = activeTasks.contains(ObjectIdentifier(task))
        taskLock.unlock()
        guard isActive else { return }
        task.didReceive(response)
        task.didReceive(data)
        task.didFinish()
    }

    private func failTask(_ task: WKURLSchemeTask, code: Int, message: String) {
        taskLock.lock()
        let isActive = activeTasks.contains(ObjectIdentifier(task))
        taskLock.unlock()
        guard isActive else { return }
        task.didFailWithError(NSError(domain: "GameScheme", code: code,
                                      userInfo: [NSLocalizedDescriptionKey: message]))
    }
}

/// 游戏运行页：WKWebView 以 rpg:// 自定义协议加载游戏，并注入翻译/作弊/存档/控制台捕获脚本
final class GameViewController: UIViewController, WKScriptMessageHandler, WKNavigationDelegate, WKUIDelegate, UIDocumentPickerDelegate {

    private let gameDir: URL
    private var webView: WKWebView!
    private let defaults = UserDefaults.standard
    private var loadingView: UIView?
    private var loadingDeadline: DispatchWorkItem?
    private var currentTarget: (index: URL, readRoot: URL)?
    private var pageLoaded = false
    private var schemeHandler: GameSchemeHandler?
    private var floatingBall: FloatingBallView?

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
        setupFloatingBall()
        loadGame()
    }

    // MARK: - 屏幕方向：游戏运行页强制横屏

    override var supportedInterfaceOrientations: UIInterfaceOrientationMask { .landscape }
    override var preferredInterfaceOrientationForPresentation: UIInterfaceOrientation { .landscapeLeft }
    override var shouldAutorotate: Bool { true }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        forceOrientation(.landscapeLeft)
        // 横屏游戏：隐藏导航栏（返回按钮+标题占空间），点击游戏区域可呼出工具栏
        navigationController?.setNavigationBarHidden(true, animated: false)
        navigationController?.hidesBarsOnTap = true
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        UIApplication.shared.isIdleTimerDisabled = false
        webView?.stopLoading()
        // 保存悬浮球位置
        if let ball = floatingBall {
            let key = "ballPos_\(SafePath.originalName(for: gameDir) ?? gameDir.lastPathComponent)"
            defaults.set([ball.center.x, ball.center.y], forKey: key)
        }
        navigationController?.hidesBarsOnTap = false
        navigationController?.setNavigationBarHidden(false, animated: false)
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

        // 0) 注入游戏画面居中 CSS（修复横屏时 canvas 偏移/消失）
        contentController.addUserScript(WKUserScript(
            source: """
            (function () {
              var s = document.createElement('style');
              s.textContent = 'html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#000;}' +
                'canvas{display:block;margin:0 auto;}' +
                '#ggs-page,#gameCanvas,#GameCanvas{width:100%!important;height:100%!important;}';
              (document.head || document.documentElement).appendChild(s);
            })();
            """,
            injectionTime: .atDocumentStart, forMainFrameOnly: true))

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
        // 4) 注入存档桥接（导出/导入 MV/MZ 的 localStorage 存档，key 以 RPGMV 开头）
        contentController.addUserScript(WKUserScript(
            source: """
            (function () {
              if (window.__rpgSaveHooked) return;
              window.__rpgSaveHooked = true;
              window.RPGSave = {
                exportAll: function () {
                  var out = {};
                  for (var i = 0; i < localStorage.length; i++) {
                    var k = localStorage.key(i);
                    if (k && k.indexOf("RPGMV") === 0) { out[k] = localStorage.getItem(k); }
                  }
                  return JSON.stringify(out);
                },
                importBase64: function (b64) {
                  try {
                    var json = decodeURIComponent(escape(atob(b64)));
                    var obj = JSON.parse(json);
                    var n = 0;
                    for (var k in obj) {
                      if (obj.hasOwnProperty(k)) { localStorage.setItem(k, obj[k]); n++; }
                    }
                    return "ok:" + n;
                  } catch (e) { return "err:" + ((e && e.message) || String(e)); }
                }
              };
            })();
            """,
            injectionTime: .atDocumentStart, forMainFrameOnly: true))
        // 5) 注入控制台/错误捕获（诊断"不能玩"根因：JS 报错、XHR 失败、未捕获异常全量进日志）
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

    private func setupFloatingBall() {
        // 隐藏底部工具栏，用悬浮球代替（完全不遮挡游戏区域）
        navigationController?.setToolbarHidden(true, animated: false)

        let ball = FloatingBallView()
        ball.onMenu = { [weak self] in self?.showBallMenu() }
        view.addSubview(ball)
        floatingBall = ball

        // 恢复上次位置（每游戏独立），默认屏幕中间偏右（更醒目）
        let key = "ballPos_\(SafePath.originalName(for: gameDir) ?? gameDir.lastPathComponent)"
        if let arr = defaults.array(forKey: key) as? [CGFloat], arr.count == 2 {
            ball.center = CGPoint(x: arr[0], y: arr[1])
        } else {
            ball.center = CGPoint(x: view.bounds.midX + 80, y: view.bounds.midY)
        }
        updateBallAppearance()
    }

    private func showBallMenu() {
        let trOn = defaults.bool(forKey: "tr_enabled")
        let alert = UIAlertController(title: "游戏菜单", message: nil, preferredStyle: .actionSheet)
        // 常用选项
        alert.addAction(UIAlertAction(title: "✕ 返回列表", style: .default) { [weak self] _ in self?.backToList() })
        alert.addAction(UIAlertAction(title: "↻ 刷新游戏", style: .default) { [weak self] _ in self?.reload() })
        alert.addAction(UIAlertAction(title: trOn ? "💬 翻译：开（点此关闭）" : "💬 翻译：关（点此开启）", style: .default) { [weak self] _ in
            self?.toggleTranslate()
        })
        // 更多选项
        alert.addAction(UIAlertAction(title: "⋯ 更多（存档/作弊）", style: .default) { [weak self] _ in
            self?.showMoreMenu()
        })
        alert.addAction(UIAlertAction(title: "取消", style: .cancel))
        if let pop = alert.popoverPresentationController, let ball = floatingBall {
            pop.sourceView = ball
            pop.sourceRect = ball.bounds
        }
        present(alert, animated: true)
    }

    private func showMoreMenu() {
        let alert = UIAlertController(title: "更多", message: nil, preferredStyle: .actionSheet)
        alert.addAction(UIAlertAction(title: "💾 存档管理", style: .default) { [weak self] _ in self?.saveMenu() })
        alert.addAction(UIAlertAction(title: "🎁 作弊器", style: .default) { [weak self] _ in self?.toggleCheat() })
        alert.addAction(UIAlertAction(title: "返回", style: .cancel))
        if let pop = alert.popoverPresentationController, let ball = floatingBall {
            pop.sourceView = ball
            pop.sourceRect = ball.bounds
        }
        present(alert, animated: true)
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        guard let ball = floatingBall else { return }
        // 横屏/竖屏都保持悬浮球正常大小（用户可双击手动缩小）
        // 确保悬浮球在可见范围内
        let margin: CGFloat = 8
        let minX = margin + ball.bounds.width / 2
        let maxX = view.bounds.width - margin - ball.bounds.width / 2
        let minY = margin + ball.bounds.height / 2
        let maxY = view.bounds.height - margin - ball.bounds.height / 2
        let cx = min(max(ball.center.x, minX), maxX)
        let cy = min(max(ball.center.y, minY), maxY)
        if ball.center.x != cx || ball.center.y != cy {
            ball.center = CGPoint(x: cx, y: cy)
        }
        // 方向变化后通知 WebView 重算布局（修复横屏游戏画面偏移）
        DispatchQueue.main.async { [weak self] in
            self?.webView.evaluateJavaScript("window.dispatchEvent(new Event('resize')); if(typeof Graphics!=='undefined'&&Graphics._requestUpdate)Graphics._requestUpdate();", completionHandler: nil)
        }
    }

    @objc private func backToList() {
        // 保存悬浮球位置
        if let ball = floatingBall {
            let key = "ballPos_\(SafePath.originalName(for: gameDir) ?? gameDir.lastPathComponent)"
            defaults.set([ball.center.x, ball.center.y], forKey: key)
        }
        navigationController?.popViewController(animated: true)
    }

    /// 根据翻译状态更新悬浮球外观（翻译开=蓝色，关=橙色）
    private func updateBallAppearance() {
        guard let ball = floatingBall else { return }
        let trOn = defaults.bool(forKey: "tr_enabled")
        ball.backgroundColor = (trOn ? UIColor.systemBlue : UIColor.systemOrange).withAlphaComponent(0.88)
        ball.setImage(UIImage(systemName: trOn ? "character.bubble.fill" : "gamecontroller.fill"), for: .normal)
    }

    /// 存档目录：Documents/Saves/<游戏名>/ —— 文件 App 可直接访问（UIFileSharingEnabled）
    private var savesDir: URL {
        let name = SafePath.originalName(for: gameDir) ?? gameDir.lastPathComponent
        let dir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("Saves", isDirectory: true)
            .appendingPathComponent(name, isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }

    @objc private func saveMenu() {
        let alert = UIAlertController(title: "存档管理", message: "导出当前游戏存档为 JSON 文件，或用 JSON 文件恢复存档", preferredStyle: .actionSheet)
        alert.addAction(UIAlertAction(title: "导出存档", style: .default) { [weak self] _ in self?.exportSave() })
        alert.addAction(UIAlertAction(title: "导入存档…", style: .default) { [weak self] _ in self?.importSave() })
        alert.addAction(UIAlertAction(title: "取消", style: .cancel))
        if let pop = alert.popoverPresentationController {
            pop.barButtonItem = toolbarItems?.filter { $0.accessibilityLabel == "存档导入导出" }.first
        }
        present(alert, animated: true)
    }

    private func exportSave() {
        webView.evaluateJavaScript("window.RPGSave.exportAll()") { [weak self] result, err in
            guard let self = self else { return }
            guard err == nil, let json = result as? String, !json.isEmpty else {
                self.alert("导出失败", "游戏页面尚未就绪或没有可导出的存档。")
                return
            }
            let df = DateFormatter()
            df.dateFormat = "yyyyMMdd_HHmmss"
            let file = self.savesDir.appendingPathComponent("save_\(df.string(from: Date())).json")
            do {
                try json.write(to: file, atomically: true, encoding: .utf8)
                CrashReporter.log("save exported: \(file.lastPathComponent)")
                self.alert("已导出", "\(file.lastPathComponent)\n\n打开「文件」App → 我的 iPhone → RPGPlayer → Saves → \(self.savesDir.lastPathComponent) 即可取走。")
            } catch {
                self.alert("导出失败", error.localizedDescription)
            }
        }
    }

    private func importSave() {
        let picker = UIDocumentPickerViewController(forOpeningContentTypes: [.json])
        picker.delegate = self
        present(picker, animated: true)
    }

    func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
        guard let url = urls.first else { return }
        let scoped = url.startAccessingSecurityScopedResource()
        defer { if scoped { url.stopAccessingSecurityScopedResource() } }
        guard let json = try? String(contentsOf: url, encoding: .utf8) else {
            alert("导入失败", "无法读取所选文件。")
            return
        }
        let b64 = Data(json.utf8).base64EncodedString()
        webView.evaluateJavaScript("window.RPGSave.importBase64('\(b64)')") { [weak self] result, err in
            guard let self = self else { return }
            if let msg = result as? String {
                CrashReporter.log("save import: \(msg)")
                let ok = msg.hasPrefix("ok:")
                self.alert(ok ? "导入成功" : "导入失败",
                           ok ? "已恢复 \(msg.dropFirst(3)) 条存档记录，即将重新加载游戏。"
                              : "导入出错：\(msg)")
                if ok {
                    self.webView.stopLoading()
                    self.loadGame()
                }
            } else {
                self.alert("导入失败", "游戏页面尚未就绪。")
            }
        }
    }

    private func alert(_ title: String, _ message: String) {
        let a = UIAlertController(title: title, message: message, preferredStyle: .alert)
        a.addAction(UIAlertAction(title: "好", style: .default))
        present(a, animated: true)
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
        updateBallAppearance()
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

// MARK: - 悬浮球：可拖动、可缩小、点击展开菜单，完全不遮挡游戏区域

class FloatingBallView: UIButton {
    var onMenu: (() -> Void)?
    private var isMinimized = false
    private let normalSize: CGFloat = 46
    private let miniSize: CGFloat = 18

    init() {
        super.init(frame: CGRect(x: 0, y: 0, width: 46, height: 46))
        setup()
    }
    required init?(coder: NSCoder) { fatalError() }

    private func setup() {
        backgroundColor = UIColor.systemOrange.withAlphaComponent(0.88)
        setImage(UIImage(systemName: "gamecontroller.fill"), for: .normal)
        tintColor = .white
        layer.cornerRadius = 23
        layer.shadowColor = UIColor.black.cgColor
        layer.shadowOpacity = 0.35
        layer.shadowRadius = 5
        layer.shadowOffset = CGSize(width: 0, height: 2)

        let pan = UIPanGestureRecognizer(target: self, action: #selector(handlePan(_:)))
        addGestureRecognizer(pan)
        let doubleTap = UITapGestureRecognizer(target: self, action: #selector(handleDoubleTap))
        doubleTap.numberOfTapsRequired = 2
        addGestureRecognizer(doubleTap)
        let singleTap = UITapGestureRecognizer(target: self, action: #selector(handleTap))
        singleTap.require(toFail: doubleTap)
        addGestureRecognizer(singleTap)
    }

    @objc private func handleTap() { onMenu?() }

    @objc private func handleDoubleTap() {
        isMinimized.toggle()
        let size = isMinimized ? miniSize : normalSize
        UIView.animate(withDuration: 0.2) {
            self.bounds = CGRect(x: 0, y: 0, width: size, height: size)
            self.layer.cornerRadius = size / 2
            self.alpha = self.isMinimized ? 0.35 : 1.0
        }
    }

    @objc private func handlePan(_ g: UIPanGestureRecognizer) {
        guard let sv = superview else { return }
        center = CGPoint(x: center.x + g.translation(in: sv).x, y: center.y + g.translation(in: sv).y)
        g.setTranslation(.zero, in: sv)
        if g.state == .ended {
            let margin: CGFloat = 6
            let tx = center.x < sv.bounds.midX ? margin + bounds.width / 2 : sv.bounds.width - margin - bounds.width / 2
            let minY = margin + bounds.height / 2
            let maxY = sv.bounds.height - margin - bounds.height / 2
            let ty = min(max(center.y, minY), maxY)
            UIView.animate(withDuration: 0.25) { self.center = CGPoint(x: tx, y: ty) }
        }
    }
}
