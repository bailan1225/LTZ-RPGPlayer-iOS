import UIKit
import WebKit

/// 虚拟游戏手柄：方向键 + A/B 按钮，模拟键盘事件发送给 RPG Maker 游戏
final class VirtualGamepad: UIView {

    weak var webView: WKWebView?

    private var dpadButtons: [UIButton] = []
    private var actionButtons: [UIButton] = []

    // 方向键布局
    private let dpadSize: CGFloat = 120
    private let buttonSize: CGFloat = 44

    init(webView: WKWebView) {
        self.webView = webView
        super.init(frame: .zero)
        backgroundColor = .clear
        isUserInteractionEnabled = true
        setupDPad()
        setupActionButtons()
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    // MARK: - 方向键

    private func setupDPad() {
        let directions: [(String, String, CGFloat, CGFloat)] = [
            ("▲", "ArrowUp", 40, 0),
            ("▼", "ArrowDown", 40, 80),
            ("◀", "ArrowLeft", 0, 40),
            ("▶", "ArrowRight", 80, 40)
        ]
        for (title, key, x, y) in directions {
            let btn = makeButton(title: title, key: key)
            btn.frame = CGRect(x: x, y: y, width: buttonSize, height: buttonSize)
            addSubview(btn)
            dpadButtons.append(btn)
        }
        // 中心装饰
        let center = UIView(frame: CGRect(x: 40, y: 40, width: buttonSize, height: buttonSize))
        center.backgroundColor = UIColor.white.withAlphaComponent(0.15)
        center.layer.cornerRadius = 8
        addSubview(center)
    }

    // MARK: - 动作按钮

    private func setupActionButtons() {
        // B（取消/菜单）在左，A（确认）在右，模仿经典手柄布局
        let actions: [(String, String, UIColor)] = [
            ("B", "Escape", UIColor(red: 0.9, green: 0.3, blue: 0.3, alpha: 0.8)),
            ("A", "Enter", UIColor(red: 0.3, green: 0.6, blue: 0.9, alpha: 0.8))
        ]
        for (i, (title, key, color)) in actions.enumerated() {
            let btn = makeButton(title: title, key: key)
            btn.backgroundColor = color
            btn.frame = CGRect(x: CGFloat(i) * 54, y: 40, width: buttonSize, height: buttonSize)
            addSubview(btn)
            actionButtons.append(btn)
        }
    }

    private func makeButton(title: String, key: String) -> UIButton {
        let btn = UIButton(type: .custom)
        btn.setTitle(title, for: .normal)
        btn.titleLabel?.font = .systemFont(ofSize: 16, weight: .bold)
        btn.setTitleColor(.white, for: .normal)
        btn.backgroundColor = UIColor.white.withAlphaComponent(0.25)
        btn.layer.cornerRadius = 10
        btn.layer.borderWidth = 1
        btn.layer.borderColor = UIColor.white.withAlphaComponent(0.3).cgColor
        btn.tag = 0
        btn.addTarget(self, action: #selector(buttonDown(_:)), for: .touchDown)
        btn.addTarget(self, action: #selector(buttonUp(_:)), for: [.touchUpInside, .touchUpOutside, .touchCancel])
        // 用 associated object 存 key
        objc_setAssociatedObject(btn, &keyKey, key, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
        return btn
    }

    private var keyKey: UInt8 = 0

    @objc private func buttonDown(_ sender: UIButton) {
        sender.backgroundColor = sender.backgroundColor?.withAlphaComponent(0.6)
        if let key = objc_getAssociatedObject(sender, &keyKey) as? String {
            sendKey(key, down: true)
        }
    }

    @objc private func buttonUp(_ sender: UIButton) {
        sender.backgroundColor = sender.backgroundColor?.withAlphaComponent(0.25)
        if let key = objc_getAssociatedObject(sender, &keyKey) as? String {
            sendKey(key, down: false)
        }
    }

    /// 向游戏发送键盘事件
    private func sendKey(_ key: String, down: Bool) {
        let type = down ? "keydown" : "keyup"
        // RPG Maker MV/MZ 同时监听 KeyboardEvent 和 window 上的事件
        let js = """
        (function(){
          var ev = new KeyboardEvent('\(type)', {
            key: '\(key)', code: '\(key)', bubbles: true, cancelable: true
          });
          window.dispatchEvent(ev);
          document.dispatchEvent(ev);
          if (document.activeElement) document.activeElement.dispatchEvent(ev);
        })();
        """
        webView?.evaluateJavaScript(js, completionHandler: nil)
    }

    // MARK: - 布局

    override func layoutSubviews() {
        super.layoutSubviews()
        // 方向键在左下角
        let dpadX: CGFloat = 16
        let dpadY = bounds.height - dpadSize - 20
        for (i, btn) in dpadButtons.enumerated() {
            let positions: [CGPoint] = [
                CGPoint(x: dpadX + 40, y: dpadY),
                CGPoint(x: dpadX + 40, y: dpadY + 80),
                CGPoint(x: dpadX, y: dpadY + 40),
                CGPoint(x: dpadX + 80, y: dpadY + 40)
            ]
            btn.frame.origin = positions[i]
        }
        // 中心装饰
        if let center = subviews.first(where: { $0.backgroundColor == UIColor.white.withAlphaComponent(0.15) }) {
            center.frame = CGRect(x: dpadX + 40, y: dpadY + 40, width: buttonSize, height: buttonSize)
        }
        // 动作按钮在右下角
        let actionX = bounds.width - 120
        let actionY = bounds.height - 100
        for (i, btn) in actionButtons.enumerated() {
            btn.frame.origin = CGPoint(x: actionX + CGFloat(i) * 54, y: actionY)
        }
    }
}
