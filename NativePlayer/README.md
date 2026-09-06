# RPG Player（RPG Maker MV / MZ 自带翻译的 iOS 播放器）

一个免签名的 iOS 播放器（**需要 iOS 16 及以上**）：用 WKWebView 直接运行 RPG Maker MV / MZ 游戏（游戏文件夹自带运行时，无需把游戏打包进 App），并内置**实时翻译**功能，把对话框 / 选择项 / 滚动文本自动翻译成目标语言。

本目录是 `LTZ-RPGPlayer-iOS` 仓库中的独立原生工程（`NativePlayer/`），与仓库根目录已有的 Capacitor 工程互不影响。

- 支持 MV 与 MZ（只要是「文件夹内带 index.html」的游戏即可）
- 不需要开发者账号签名，构建出的 IPA 未签名，可用**爱思助手（i4）自签**安装
- 翻译：内置离线词典 + 在线引擎（MyMemory 免费接口 / 自定义 API），翻译结果自动缓存到游戏存档域，重复文本秒出
- 游戏通过 文件App / iTunes 文件共享 导入，一次放入，列表自动识别

## 目录结构

```
NativePlayer/
├── project.yml                 # XcodeGen 工程描述（CI 用）
├── RPGPlayer/
│   ├── AppDelegate.swift
│   ├── GamesViewController.swift    # 游戏列表 / 导入
│   ├── GameViewController.swift     # WKWebView 运行页
│   ├── SettingsViewController.swift # 翻译设置
│   ├── TranslatorConfig.swift       # 把设置生成注入 JS 的配置
│   ├── Translator.js                # 翻译注入脚本（核心）
│   ├── dict.json                    # 内置离线词典样例
│   ├── Info.plist
│   └── Assets.xcassets/             # 应用图标
└── tools/make_icon.py               # 图标生成脚本（可重新生成）

仓库根 .github/workflows/build-native-ipa.yml 负责云编译。
```

## 获取 IPA（无需本机装 Xcode）

1. 代码推送到 `LTZ-RPGPlayer-iOS` 仓库 main 分支后，工作流 **Build native RPGPlayer IPA (unsigned)** 会自动构建（仅当 `NativePlayer/` 或工作流文件变化时触发）。
2. 也可以到 **Actions → Build native RPGPlayer IPA (unsigned) → Run workflow** 手动触发。
3. 构建完成后进入该次运行的 **Artifacts**，下载 `RPGPlayer-unsigned-ipa`（zip 内含 `RPGPlayer-unsigned.ipa`）。

> 也可以在本机有 macOS + Xcode 时构建：
> `brew install xcodegen && cd NativePlayer && xcodegen generate && xcodebuild -project RPGPlayer.xcodeproj -scheme RPGPlayer -configuration Release -sdk iphoneos -derivedDataPath build CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO build`，再把 `build/Build/Products/Release-iphoneos/RPGPlayer.app` 放进 `Payload/` 后压缩成 `.ipa`。

## 用爱思助手（i4）自签安装

1. iPhone 连接电脑，打开爱思助手。
2. 顶部「应用游戏」→ 把 `RPGPlayer-unsigned.ipa` 拖入（或点击导入安装）。
3. 若弹出登录，输入你的 Apple ID（免费账号即可，仅用于签名，不上传）。
4. 安装完成后：**设置 → 通用 → VPN与设备管理** 信任开发者描述文件。
5. 每次签名有效期约 7 天，到期后重新用爱思助手签名安装一次（存档在 App 沙盒内，重装同 Bundle ID 的版本不会丢）。

## 导入游戏

- 方式一（推荐）：iPhone 上打开「文件」App → 我的 iPhone → **RPG Player** → 把整个游戏文件夹（含 `index.html` 的那一层）放进来。
- 方式二：电脑上用 iTunes / 访达的文件共享，把游戏文件夹拖到「RPG Player」的文稿里。
- 打开 App 的「游戏」页，点右上角 **+** 也可从文件 App 选择文件夹导入。
- 列表出现游戏名后点击即可游玩。

## 翻译设置

App 第二个 Tab「翻译设置」：

| 项目 | 说明 |
|---|---|
| 启用翻译 | 总开关（游戏页工具栏的气泡按钮也可随时开关） |
| 翻译引擎 | 离线词典 / MyMemory（免费在线接口，无需密钥，有每日限额）/ 自定义API |
| 源语言 | 原文语言代码，默认 `ja`（日文游戏）；英文游戏改成 `en` |
| 目标语言 | 默认 `zh-CN` |
| 自定义API地址 | 把 `{text}` 作为原文占位符，返回 JSON 的 `translatedText` / `translation` 字段或纯文本 |
| 清除翻译缓存 | 下次打开游戏生效 |

- **离线词典**：把 `dict.json`（键=原文，值=译文，UTF-8）放入「文件」App 的 RPG Player 文件夹，App 会优先读取；内置样例含常用日文 RPG 词汇。
- 翻译命中缓存后会整段替换（保留 `\C[...]` 等控制码），首次出现某句时网络翻译会有零点几秒延迟，翻译完成后该对话框会重绘一次——这是正常现象。
- 若译文过长超出对话框宽度，可换更短的翻译引擎或修改源/目标语言；界面类 UI 文本默认不翻译以免布局错乱。

## 常见问题

- **白屏 / 黑屏**：确认放入的是含 `index.html` 的那一层文件夹；部分游戏需要横屏，可旋转设备。
- **存档位置**：与浏览器相同，保存在 WKWebView 的 localStorage/IndexedDB，卸载 App 或换 Bundle ID 会丢。
- **游戏内要联网的资源**：App 已允许任意 HTTP(S) 加载，游戏内联网素材一般可直接使用。
- **翻译无效果**：检查「启用翻译」是否打开；在线引擎需联网；MyMemory 有每日限额，超限会短暂回落为原文。

## 说明

- 本项目只提供播放器外壳与翻译注入，**不含任何 RPG Maker 引擎/运行时版权内容**，游戏资源由你自己提供。
- MV/MZ 游戏均为 HTML5/JS 应用，在 WKWebView 中直接运行，因此一套外壳同时兼容两个版本。
