import UIKit

// MARK: - 主题定义

/// 应用主题（换皮肤）
enum AppTheme: String, CaseIterable {
    case system = "跟随系统"
    case light = "浅色"
    case dark = "深色"
    case blue = "海洋蓝"
    case green = "森林绿"
    case purple = "梦幻紫"
    case orange = "活力橙"
    case pink = "樱花粉"

    var id: String { rawValue }

    /// 主色调（导航栏/按钮/强调色）
    var accent: UIColor {
        switch self {
        case .system: return .systemBlue
        case .light: return .systemBlue
        case .dark: return .systemBlue
        case .blue: return UIColor(red: 0.0, green: 0.48, blue: 1.0, alpha: 1.0)
        case .green: return UIColor(red: 0.2, green: 0.7, blue: 0.4, alpha: 1.0)
        case .purple: return UIColor(red: 0.55, green: 0.35, blue: 0.95, alpha: 1.0)
        case .orange: return UIColor(red: 1.0, green: 0.55, blue: 0.1, alpha: 1.0)
        case .pink: return UIColor(red: 0.95, green: 0.4, blue: 0.6, alpha: 1.0)
        }
    }

    /// 背景色
    var background: UIColor {
        switch self {
        case .system: return .systemBackground
        case .light: return .white
        case .dark: return UIColor(white: 0.1, alpha: 1.0)
        case .blue: return UIColor(red: 0.95, green: 0.97, blue: 1.0, alpha: 1.0)
        case .green: return UIColor(red: 0.95, green: 1.0, blue: 0.96, alpha: 1.0)
        case .purple: return UIColor(red: 0.98, green: 0.96, blue: 1.0, alpha: 1.0)
        case .orange: return UIColor(red: 1.0, green: 0.97, blue: 0.93, alpha: 1.0)
        case .pink: return UIColor(red: 1.0, green: 0.96, blue: 0.98, alpha: 1.0)
        }
    }

    /// 次要背景色（卡片/单元格）
    var secondaryBackground: UIColor {
        switch self {
        case .system: return .secondarySystemBackground
        case .light: return UIColor(white: 0.96, alpha: 1.0)
        case .dark: return UIColor(white: 0.17, alpha: 1.0)
        case .blue: return UIColor(red: 0.9, green: 0.94, blue: 1.0, alpha: 1.0)
        case .green: return UIColor(red: 0.9, green: 0.97, blue: 0.91, alpha: 1.0)
        case .purple: return UIColor(red: 0.94, green: 0.91, blue: 1.0, alpha: 1.0)
        case .orange: return UIColor(red: 1.0, green: 0.93, blue: 0.87, alpha: 1.0)
        case .pink: return UIColor(red: 1.0, green: 0.91, blue: 0.95, alpha: 1.0)
        }
    }

    /// 文字主色
    var text: UIColor {
        switch self {
        case .system: return .label
        case .light: return .darkText
        case .dark: return .white
        default: return .darkText
        }
    }

    /// 文字次要色
    var secondaryText: UIColor {
        switch self {
        case .system: return .secondaryLabel
        case .light: return .darkGray
        case .dark: return .lightGray
        default: return UIColor(white: 0.4, alpha: 1.0)
        }
    }

    /// 导航栏样式
    var navigationBarStyle: UIBarStyle {
        switch self {
        case .dark: return .black
        default: return .default
        }
    }

    /// 是否深色模式（影响状态栏）
    var isDark: Bool {
        switch self {
        case .dark: return true
        case .system: return UITraitCollection.current.userInterfaceStyle == .dark
        default: return false
        }
    }
}

// MARK: - 主题管理器

/// 全局主题管理器（单例）
final class ThemeManager {
    static let shared = ThemeManager()

    private let defaults = UserDefaults.standard
    private let themeKey = "app_theme"

    /// 当前主题
    private(set) var current: AppTheme {
        didSet {
            defaults.set(current.rawValue, forKey: themeKey)
            apply()
        }
    }

    /// 主题变化回调
    var onThemeChange: ((AppTheme) -> Void)?

    private init() {
        let saved = defaults.string(forKey: themeKey) ?? AppTheme.system.rawValue
        current = AppTheme(rawValue: saved) ?? .system
    }

    /// 切换主题
    func setTheme(_ theme: AppTheme) {
        current = theme
    }

    /// 应用主题到全局
    func apply() {
        let theme = current

        // 导航栏外观
        let navAppearance = UINavigationBarAppearance()
        navAppearance.configureWithOpaqueBackground()
        navAppearance.backgroundColor = theme.accent
        navAppearance.titleTextAttributes = [.foregroundColor: UIColor.white]
        navAppearance.largeTitleTextAttributes = [.foregroundColor: UIColor.white]

        UINavigationBar.appearance().standardAppearance = navAppearance
        UINavigationBar.appearance().scrollEdgeAppearance = navAppearance
        UINavigationBar.appearance().compactAppearance = navAppearance
        UINavigationBar.appearance().tintColor = .white
        UINavigationBar.appearance().barStyle = theme.navigationBarStyle

        // 工具栏
        let toolAppearance = UIToolbarAppearance()
        toolAppearance.configureWithOpaqueBackground()
        toolAppearance.backgroundColor = theme.secondaryBackground
        UIToolbar.appearance().standardAppearance = toolAppearance
        UIToolbar.appearance().scrollEdgeAppearance = toolAppearance
        UIToolbar.appearance().tintColor = theme.accent

        // TabBar
        let tabAppearance = UITabBarAppearance()
        tabAppearance.configureWithOpaqueBackground()
        tabAppearance.backgroundColor = theme.secondaryBackground
        UITabBar.appearance().standardAppearance = tabAppearance
        UITabBar.appearance().scrollEdgeAppearance = tabAppearance
        UITabBar.appearance().tintColor = theme.accent

        // 全局视图
        UIView.appearance().tintColor = theme.accent

        // 通知主题变化
        onThemeChange?(theme)

        // 刷新所有可见窗口
        for scene in UIApplication.shared.connectedScenes {
            guard let windowScene = scene as? UIWindowScene else { continue }
            for window in windowScene.windows {
                window.subviews.forEach { view in
                    view.setNeedsDisplay()
                    view.setNeedsLayout()
                }
            }
        }
    }
}

// MARK: - UIViewController 主题扩展

extension UIViewController {
    /// 应用当前主题到视图控制器
    func applyTheme() {
        let theme = ThemeManager.shared.current
        view.backgroundColor = theme.background

        // 导航栏
        navigationController?.navigationBar.tintColor = .white
        navigationController?.navigationBar.barStyle = theme.navigationBarStyle

        // 状态栏
        setNeedsStatusBarAppearanceUpdate()
    }

    /// 主题色
    var themeAccent: UIColor { ThemeManager.shared.current.accent }
    var themeBackground: UIColor { ThemeManager.shared.current.background }
    var themeSecondaryBackground: UIColor { ThemeManager.shared.current.secondaryBackground }
    var themeText: UIColor { ThemeManager.shared.current.text }
    var themeSecondaryText: UIColor { ThemeManager.shared.current.secondaryText }
}
