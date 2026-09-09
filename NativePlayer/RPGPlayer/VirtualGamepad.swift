//
//  VirtualGamepad.swift
//  rpgtransplayer
//
//  虚拟手柄（虚拟键盘），参考开源项目 OnscreenController 的设计理念：
//  - 全局触摸追踪视图（TouchTrackingView），而非每按钮单独处理
//  - D-Pad 分为 9 个区域，支持斜向移动（单指同时触发两个方向）
//  - 多点触控支持
//  原项目: https://github.com/glhaynes/OnscreenController
//  原协议: MIT License (Copyright © 2023 Grady Haynes)
//  本文件为 UIKit 重写版，非直接复制源码。
//
//  键位映射（RPG Maker MV/MZ 标准）：
//  - 方向键: ArrowUp/Down/Left/Right (keyCode 38/40/37/39)
//  - A 确认: Enter (keyCode 13)
//  - B 取消: Escape (keyCode 27)
//  - X 奔跑: Shift (keyCode 16)
//  - Y 菜单: F9 (keyCode 120)
//

import UIKit
import WebKit

// MARK: - 触摸追踪视图
/// 参考 OnscreenController 的 TouchTrackingView：全屏透明视图，追踪所有触摸点。
final class TouchTrackingView: UIView {
    var onTouchesChanged: (([CGPoint]) -> Void)?

    override init(frame: CGRect) {
        super.init(frame: frame)
        isMultipleTouchEnabled = true
        backgroundColor = .clear
        isUserInteractionEnabled = true
    }

    required init?(coder: NSCoder) { fatalError() }

    private func notifyTouches(_ touches: Set<UITouch>) {
        let points = touches.map { $0.location(in: self) }
        onTouchesChanged?(points)
    }

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        if let all = event?.allTouches { notifyTouches(all) }
    }

    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        if let all = event?.allTouches { notifyTouches(all) }
    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        if let all = event?.allTouches {
            let remaining = all.filter { $0.phase != .ended && $0.phase != .cancelled }
            notifyTouches(remaining)
        }
    }

    override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?) {
        if let all = event?.allTouches {
            let remaining = all.filter { $0.phase != .ended && $0.phase != .cancelled }
            notifyTouches(remaining)
        }
    }
}

// MARK: - 虚拟手柄
final class VirtualGamepad: UIView {
    // 按钮标识
    enum Button: String, CaseIterable {
        case up, down, left, right
        case a, b, x, y // A=确认, B=取消, X=奔跑, Y=菜单
    }

    // D-Pad 9 区域
    private enum DPadRegion {
        case upLeft, up, upRight
        case left, center, right
        case downLeft, down, downRight

        var buttons: [Button] {
            switch self {
            case .upLeft:   return [.up, .left]
            case .up:       return [.up]
            case .upRight:  return [.up, .right]
            case .left:     return [.left]
            case .center:   return []
            case .right:    return [.right]
            case .downLeft: return [.down, .left]
            case .down:     return [.down]
            case .downRight:return [.down, .right]
            }
        }
    }

    weak var webView: WKWebView?

    private var touchTrackingView: TouchTrackingView!
    private var dpadContainer: UIView!
    private var actionContainer: UIView!

    // 各按钮的触摸区域 frame（在 self 坐标系中）
    private var dpadRegions: [(DPadRegion, CGRect)] = []
    private var actionButtonFrames: [(Button, CGRect)] = []

    // 当前按下的按钮
    private var pressedButtons: Set<Button> = []

    // 布局常量
    private let dpadSize: CGFloat = 140
    private let actionBtnSize: CGFloat = 52
    private let actionSpacing: CGFloat = 12

    override init(frame: CGRect) {
        super.init(frame: frame)
        setupUI()
    }

    required init?(coder: NSCoder) { fatalError() }

    private func setupUI() {
        backgroundColor = .clear
        isMultipleTouchEnabled = true

        // 触摸追踪视图（全屏）
        touchTrackingView = TouchTrackingView()
        touchTrackingView.onTouchesChanged = { [weak self] points in
            self?.handleTouches(points)
        }
        addSubview(touchTrackingView)

        // D-Pad 容器（左下）
        dpadContainer = UIView()
        dpadContainer.backgroundColor = .clear
        addSubview(dpadContainer)
        drawDPad()

        // 功能按钮容器（右下）
        actionContainer = UIView()
        actionContainer.backgroundColor = .clear
        addSubview(actionContainer)
        drawActionButtons()
    }

    // MARK: - 绘制 D-Pad
    private func drawDPad() {
        // 十字形 D-Pad 背景
        let crossPath = UIBezierPath()
        let center = CGPoint(x: dpadSize / 2, y: dpadSize / 2)
        let armWidth = dpadSize * 0.32
        let armLength = dpadSize * 0.42

        // 横臂
        crossPath.append(UIBezierPath(rect: CGRect(
            x: center.x - armLength, y: center.y - armWidth / 2,
            width: armLength * 2, height: armWidth
        )))
        // 竖臂
        crossPath.append(UIBezierPath(rect: CGRect(
            x: center.x - armWidth / 2, y: center.y - armLength,
            width: armWidth, height: armLength * 2
        )))

        let shapeLayer = CAShapeLayer()
        shapeLayer.path = crossPath.cgPath
        shapeLayer.fillColor = UIColor.white.withAlphaComponent(0.18).cgColor
        shapeLayer.strokeColor = UIColor.white.withAlphaComponent(0.4).cgColor
        shapeLayer.lineWidth = 1.5
        dpadContainer.layer.addSublayer(shapeLayer)

        // 方向箭头标签
        let arrows: [(String, CGPoint)] = [
            ("▲", CGPoint(x: center.x, y: center.y - armLength * 0.55)),
            ("▼", CGPoint(x: center.x, y: center.y + armLength * 0.55)),
            ("◀", CGPoint(x: center.x - armLength * 0.55, y: center.y)),
            ("▶", CGPoint(x: center.x + armLength * 0.55, y: center.y)),
        ]
        for (text, pos) in arrows {
            let label = UILabel()
            label.text = text
            label.font = .systemFont(ofSize: 14, weight: .bold)
            label.textColor = .white.withAlphaComponent(0.6)
            label.textAlignment = .center
            label.sizeToFit()
            label.center = pos
            dpadContainer.addSubview(label)
        }
    }

    // MARK: - 绘制功能按钮（菱形布局 A/B/X/Y）
    private func drawActionButtons() {
        // 菱形布局：Y(上) A(右) B(下) X(左)
        let center = CGPoint(x: actionBtnSize + actionSpacing, y: actionBtnSize + actionSpacing)
        let offset = actionBtnSize * 0.65

        let buttons: [(Button, String, UIColor, CGPoint)] = [
            (.y, "Y", .systemPurple, CGPoint(x: center.x, y: center.y - offset)),
            (.a, "A", .systemGreen,   CGPoint(x: center.x + offset, y: center.y)),
            (.b, "B", .systemRed,     CGPoint(x: center.x, y: center.y + offset)),
            (.x, "X", .systemBlue,    CGPoint(x: center.x - offset, y: center.y)),
        ]

        for (btn, title, color, pos) in buttons {
            let circle = UIView()
            circle.backgroundColor = color.withAlphaComponent(0.5)
            circle.layer.cornerRadius = actionBtnSize / 2
            circle.layer.borderWidth = 1.5
            circle.layer.borderColor = color.withAlphaComponent(0.7).cgColor
            circle.bounds = CGRect(x: 0, y: 0, width: actionBtnSize, height: actionBtnSize)
            circle.center = pos

            let label = UILabel()
            label.text = title
            label.font = .systemFont(ofSize: 18, weight: .black)
            label.textColor = .white
            label.textAlignment = .center
            label.frame = circle.bounds
            circle.addSubview(label)

            actionContainer.addSubview(circle)
        }
    }

    // MARK: - 布局
    override func layoutSubviews() {
        super.layoutSubviews()
        touchTrackingView.frame = bounds

        // D-Pad 左下
        let dpadX: CGFloat = 20
        let dpadY = bounds.height - dpadSize - 20
        dpadContainer.frame = CGRect(x: dpadX, y: dpadY, width: dpadSize, height: dpadSize)

        // 功能按钮右下
        let actionW = actionBtnSize * 2 + actionSpacing * 2
        let actionH = actionBtnSize * 2 + actionSpacing * 2
        let actionX = bounds.width - actionW - 20
        let actionY = bounds.height - actionH - 20
        actionContainer.frame = CGRect(x: actionX, y: actionY, width: actionW, height: actionH)

        // 计算 D-Pad 9 区域（在 self 坐标系中）
        calculateDPadRegions()
        // 计算功能按钮区域
        calculateActionButtonFrames()
    }

    private func calculateDPadRegions() {
        let f = dpadContainer.frame
        let cellW = f.width / 3
        let cellH = f.height / 3
        let regions: [DPadRegion] = [.upLeft, .up, .upRight, .left, .center, .right, .downLeft, .down, .downRight]
        dpadRegions = []
        for (i, region) in regions.enumerated() {
            let row = i / 3
            let col = i % 3
            let rect = CGRect(
                x: f.minX + CGFloat(col) * cellW,
                y: f.minY + CGFloat(row) * cellH,
                width: cellW, height: cellH
            )
            dpadRegions.append((region, rect))
        }
    }

    private func calculateActionButtonFrames() {
        actionButtonFrames = []
        let f = actionContainer.frame
        let center = CGPoint(x: f.midX, y: f.midY)
        let offset = actionBtnSize * 0.65
        let half = actionBtnSize / 2

        let mapping: [(Button, CGPoint)] = [
            (.y, CGPoint(x: center.x, y: center.y - offset)),
            (.a, CGPoint(x: center.x + offset, y: center.y)),
            (.b, CGPoint(x: center.x, y: center.y + offset)),
            (.x, CGPoint(x: center.x - offset, y: center.y)),
        ]
        for (btn, pos) in mapping {
            // 扩大触摸区域 1.3 倍
            let size = actionBtnSize * 1.3
            let rect = CGRect(
                x: pos.x - size / 2, y: pos.y - size / 2,
                width: size, height: size
            )
            actionButtonFrames.append((btn, rect))
        }
    }

    // MARK: - 触摸处理（参考 OnscreenController 的区域映射逻辑）
    private func handleTouches(_ points: [CGPoint]) {
        var newPressed: Set<Button> = []

        for point in points {
            // 检查 D-Pad 区域
            for (region, rect) in dpadRegions {
                if rect.contains(point) {
                    newPressed.formUnion(region.buttons)
                    break
                }
            }
            // 检查功能按钮区域
            for (btn, rect) in actionButtonFrames {
                if rect.contains(point) {
                    newPressed.insert(btn)
                    break
                }
            }
        }

        // 计算变化
        let pressed = newPressed.subtracting(pressedButtons)
        let released = pressedButtons.subtracting(newPressed)

        for btn in pressed {
            sendKey(button: btn, down: true)
        }
        for btn in released {
            sendKey(button: btn, down: false)
        }

        pressedButtons = newPressed

        // 更新按钮视觉状态
        updateVisualStates()
    }

    private func updateVisualStates() {
        // D-Pad 高亮（简化：改变透明度）
        let dpadPressed = pressedButtons.contains(.up) || pressedButtons.contains(.down) ||
                          pressedButtons.contains(.left) || pressedButtons.contains(.right)
        dpadContainer.alpha = dpadPressed ? 0.9 : 1.0

        // 功能按钮高亮
        for subview in actionContainer.subviews {
            guard let circle = subview as? UIView else { continue }
            let isPressed = actionButtonFrames.contains { btn, rect in
                rect.contains(circle.center) && pressedButtons.contains(btn)
            }
            circle.alpha = isPressed ? 0.5 : 1.0
        }
    }

    // MARK: - 发送键盘事件到 WebView
    private func sendKey(button: Button, down: Bool) {
        guard let webView = webView else { return }
        let (key, keyCode) = keyInfo(for: button)
        let type = down ? "keydown" : "keyup"
        let js = """
        (function(){
          var ev = new KeyboardEvent('\(type)', {
            key: '\(key)', code: '\(key)', bubbles: true, cancelable: true
          });
          Object.defineProperty(ev, 'keyCode', {value: \(keyCode)});
          Object.defineProperty(ev, 'which', {value: \(keyCode)});
          window.dispatchEvent(ev);
          document.dispatchEvent(ev);
        })();
        """
        webView.evaluateJavaScript(js, completionHandler: nil)
    }

    private func keyInfo(for button: Button) -> (key: String, keyCode: Int) {
        switch button {
        case .up:    return ("ArrowUp", 38)
        case .down:  return ("ArrowDown", 40)
        case .left:  return ("ArrowLeft", 37)
        case .right: return ("ArrowRight", 39)
        case .a:     return ("Enter", 13)
        case .b:     return ("Escape", 27)
        case .x:     return ("Shift", 16)
        case .y:     return ("F9", 120)
        }
    }
}
