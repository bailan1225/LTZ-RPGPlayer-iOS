import UIKit
import WebKit

/// ArkRPG 风格虚拟手柄：十字方向键 + 功能按钮，模拟键盘事件
final class VirtualGamepad: UIView {

    weak var webView: WKWebView?

    // MARK: - 方向键
    private var dpadUp: GamepadButton!
    private var dpadDown: GamepadButton!
    private var dpadLeft: GamepadButton!
    private var dpadRight: GamepadButton!

    // MARK: - 功能按钮（RPG Maker 映射）
    private var buttonA: GamepadButton!   // Enter/Space = 确认
    private var buttonB: GamepadButton!   // Escape = 取消/菜单
    private var buttonX: GamepadButton!   // Shift = 奔跑
    private var buttonY: GamepadButton!   // F9 = 调试/菜单

    // MARK: - 布局常量
    private let dpadSize: CGFloat = 130
    private let btnSize: CGFloat = 48
    private let dpadBtnSize: CGFloat = 42

    init(webView: WKWebView) {
        self.webView = webView
        super.init(frame: .zero)
        backgroundColor = .clear
        isUserInteractionEnabled = true
        setupButtons()
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    private func setupButtons() {
        // 方向键
        dpadUp = makeDpadButton("▲", key: "ArrowUp")
        dpadDown = makeDpadButton("▼", key: "ArrowDown")
        dpadLeft = makeDpadButton("◀", key: "ArrowLeft")
        dpadRight = makeDpadButton("▶", key: "ArrowRight")

        // 功能按钮
        buttonA = makeActionButton("A", key: "Enter", color: UIColor(red: 0.2, green: 0.6, blue: 0.9, alpha: 0.75))
        buttonB = makeActionButton("B", key: "Escape", color: UIColor(red: 0.9, green: 0.3, blue: 0.3, alpha: 0.75))
        buttonX = makeActionButton("X", key: "Shift", color: UIColor(red: 0.9, green: 0.7, blue: 0.2, alpha: 0.75))
        buttonY = makeActionButton("Y", key: "F9", color: UIColor(red: 0.5, green: 0.8, blue: 0.4, alpha: 0.75))

        [dpadUp, dpadDown, dpadLeft, dpadRight, buttonA, buttonB, buttonX, buttonY].forEach { addSubview($0) }
    }

    private func makeDpadButton(_ title: String, key: String) -> GamepadButton {
        let btn = GamepadButton(key: key)
        btn.setTitle(title, for: .normal)
        btn.titleLabel?.font = .systemFont(ofSize: 14, weight: .bold)
        btn.setTitleColor(UIColor.white.withAlphaComponent(0.9), for: .normal)
        btn.backgroundColor = UIColor.white.withAlphaComponent(0.18)
        btn.layer.borderWidth = 1
        btn.layer.borderColor = UIColor.white.withAlphaComponent(0.25).cgColor
        btn.layer.cornerRadius = 8
        return btn
    }

    private func makeActionButton(_ title: String, key: String, color: UIColor) -> GamepadButton {
        let btn = GamepadButton(key: key)
        btn.setTitle(title, for: .normal)
        btn.titleLabel?.font = .systemFont(ofSize: 16, weight: .bold)
        btn.setTitleColor(.white, for: .normal)
        btn.backgroundColor = color
        btn.layer.cornerRadius = btnSize / 2
        btn.layer.borderWidth = 1.5
        btn.layer.borderColor = UIColor.white.withAlphaComponent(0.3).cgColor
        return btn
    }

    // MARK: - 布局

    override func layoutSubviews() {
        super.layoutSubviews()
        let w = bounds.width
        let h = bounds.height

        // 方向键在左下角
        let dpadX: CGFloat = 20
        let dpadY = h - dpadSize - 24
        // 十字布局
        dpadUp.frame = CGRect(x: dpadX + dpadBtnSize, y: dpadY, width: dpadBtnSize, height: dpadBtnSize)
        dpadDown.frame = CGRect(x: dpadX + dpadBtnSize, y: dpadY + dpadBtnSize * 2, width: dpadBtnSize, height: dpadBtnSize)
        dpadLeft.frame = CGRect(x: dpadX, y: dpadY + dpadBtnSize, width: dpadBtnSize, height: dpadBtnSize)
        dpadRight.frame = CGRect(x: dpadX + dpadBtnSize * 2, y: dpadY + dpadBtnSize, width: dpadBtnSize, height: dpadBtnSize)

        // 功能按钮在右下角（菱形布局，A在右、B在下、X在上、Y在左）
        let centerX = w - 90
        let centerY = h - 90
        buttonA.frame = CGRect(x: centerX + btnSize * 0.7, y: centerY - btnSize/2, width: btnSize, height: btnSize)
        buttonB.frame = CGRect(x: centerX - btnSize/2, y: centerY + btnSize * 0.7, width: btnSize, height: btnSize)
        buttonX.frame = CGRect(x: centerX - btnSize/2, y: centerY - btnSize * 1.2, width: btnSize, height: btnSize)
        buttonY.frame = CGRect(x: centerX - btnSize * 1.2, y: centerY - btnSize/2, width: btnSize, height: btnSize)
    }
}

// MARK: - 手柄按钮（支持长按连续触发）

final class GamepadButton: UIButton {
    let key: String
    private var repeatTimer: Timer?

    init(key: String) {
        self.key = key
        super.init(frame: .zero)
        addTarget(self, action: #selector(down), for: .touchDown)
        addTarget(self, action: #selector(up), for: [.touchUpInside, .touchUpOutside, .touchCancel])
    }

    required init?(coder: NSCoder) { fatalError() }

    @objc private func down() {
        backgroundColor = backgroundColor?.withAlphaComponent(0.5)
        sendKey(down: true)
        // 长按重复（方向键和确认键）
        repeatTimer?.invalidate()
        repeatTimer = Timer.scheduledTimer(withTimeInterval: 0.12, repeats: true) { [weak self] _ in
            self?.sendKey(down: true)
        }
    }

    @objc private func up() {
        backgroundColor = backgroundColor?.withAlphaComponent(0.75)
        repeatTimer?.invalidate()
        repeatTimer = nil
        sendKey(down: false)
    }

    private func sendKey(down: Bool) {
        guard let webView = (superview as? VirtualGamepad)?.webView else { return }
        let type = down ? "keydown" : "keyup"
        let js = """
        (function(){
          var ev = new KeyboardEvent('\(type)', {
            key: '\(key)', code: '\(key)', bubbles: true, cancelable: true
          });
          window.dispatchEvent(ev);
          document.dispatchEvent(ev);
        })();
        """
        webView.evaluateJavaScript(js, completionHandler: nil)
    }
}
