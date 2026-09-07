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

游戏目录支持三种形态，**自动识别、可任意嵌套**（App 会递归查找 Documents 下最多 3 层）：
- 标准游戏根：含 `index.html` 的那一层文件夹
- 嵌套 www：文件夹内含 `www/`（`www/index.html` 或 `www/js` 核心文件）
- 裸 www：文件夹本身就是 `www`（`js/` 直接在其下）——App 会自动生成 `index.html` 后运行

导入方式（任选其一）：
- **方式一（最快，电脑+爱思助手）**：爱思助手 → 我的设备 → 应用 → RPG Player → 浏览 → 直接把整个游戏文件夹拖进 `Documents` 目录。
- 方式二：iPhone 上打开「文件」App → 我的 iPhone → **RPG Player** → 把整个游戏文件夹（含 `index.html` 或 `www` 那一层）拷进来。
- 方式三：打开 App 的「游戏」页，点右上角 **+** → 按弹窗提示选「刷新列表」（iOS 17 侧载环境下系统文件夹选择器会闪退，故不再使用，文件App / 爱思直拖最稳）。

列表出现游戏名后点击即可游玩。**游戏运行页为横屏**，列表页为竖屏。

## 翻译设置

App 第二个 Tab「翻译设置」——**纯词典模式**：只保留总开关，无在线引擎、无网络请求、无密钥（减少错误面、完全离线）：

| 项目 | 说明 |
|---|---|
| 启用翻译 | 总开关（游戏页工具栏的气泡按钮也可随时开关） |

- **外部翻译文件（推荐，与翻译器打通）**：用「RPG 翻译器」翻译游戏后，映射自动保存为 `translations/游戏名.json`——把该文件（或整个 translations 文件夹）放入本 App 文稿目录 `translations/`，打开游戏即离线命中，人名/物品/术语与精修完全一致。
- **任意 mtool 兼容词典**：`{原文: 译文}` JSON（mtool 分享的精修汉化等）放 `translations/` 同样生效，多个文件全部合并加载。
- **离线词典**：`dict.json`（键=原文，值=译文，UTF-8）放文稿目录覆盖内置；内置样例含常用日文 RPG 词汇。
- **翻译状态**：游戏列表显示每个游戏「已翻译 N 条（播放时自动命中）」——由翻译器生成 `translations/<目录名>.json` 后自动出现。
- 命中词典后整段替换并保留 `\C[...]` 等控制码；界面类 UI 文本默认不翻译以免布局错乱。

## 作弊器（单机）

游戏页工具栏的 **礼物图标** 按钮可开关作弊面板（游戏内浮层，MV/MZ 通用）：

- 金钱 +10000 / 金钱改满
- 全员恢复 / 全员满级
- 全道具 / 全装备（各 x99）
- 不遇敌（切换）
- 无敌（切换，我方不掉血）
- 穿墙（切换，无视碰撞直接走）
- 一击必杀（切换，攻击敌人直接秒杀）
- 战斗直接胜利 / 战斗直接逃跑（战斗中一键）
- 快速存档 / 快速读档（槽位 0 一键）
- 对敌伤害 x1 / x10 / x100（循环切换）
- 游戏速度 x1 / x2 / x4（循环切换）

作弊器直接操作内存中的游戏对象，**重新进入游戏场景后部分开关（如不遇敌、无敌、穿墙）自动重置为关闭**，可再次打开面板启用。仅用于单机游戏，请勿用于联机/对战环境。

## 游戏页工具栏

- **刷新**：重新加载游戏
- **作弊器**（礼物图标）：开/关作弊面板
- **翻译开关**（气泡图标）：实时开/关运行时翻译，开时清空会话缓存重新命中

## 崩溃日志

列表页左上角 **「日志」** 按钮：一键分享 `crash.log`（App 崩溃时自动记录，用于排查闪退）。遇到崩溃把日志内容发回来即可定位。

## 常见问题

- **白屏 / 黑屏**：确认放入的是含 `index.html` 或 `www` 的那一层文件夹；游戏页已强制横屏（MV/MZ 游戏按 816×624 横屏设计，插件窗口在竖屏下会错位重叠，横屏即正常）。
- **游戏加载方式**：App 内自带本地 HTTP 服务器，游戏以 `http://127.0.0.1` 加载——XHR、相对路径、存档（localStorage）全部按标准浏览器行为工作，不会再报 "Failed to load: data/xxx.json"。
- **首次打开游戏会弹「允许本地网络」**：请点允许（用于本机 127.0.0.1 回环加载游戏，不访问局域网设备）；误点拒绝后可在 系统设置 → 隐私 → 本地网络 里重新打开。
- **初始目录**：App 首次启动自动创建 `translations/` 文件夹和「使用说明.txt」（文件App → 我的 iPhone → RPG Player 可见），爱思助手拖文件时可以直接看到结构。
- **多语言插件名**：游戏 `js/plugins/` 下的插件文件如果是日文/中文名或带语言后缀（如 `YEP_CoreEngine_zh.js`、`YEP_CoreEngine_ja.js`），启动时会自动与 `plugins.js` 引用的名字模糊匹配并建立别名，无需手动改名，加载不再报 "Failed to load: js/plugins/xxx.js"。
- **存档位置**：与浏览器相同，保存在 WKWebView 的 localStorage/IndexedDB，卸载 App 或换 Bundle ID 会丢。
- **游戏内要联网的资源**：App 已允许任意 HTTP(S) 加载，游戏内联网素材一般可直接使用。
- **翻译无效果**：检查「启用翻译」是否打开；纯词典模式需 `translations/` 或 `dict.json` 中有对应词条（翻译器翻完游戏即自动具备）。

## 说明

- 本项目只提供播放器外壳与翻译注入，**不含任何 RPG Maker 引擎/运行时版权内容**，游戏资源由你自己提供。
- MV/MZ 游戏均为 HTML5/JS 应用，在 WKWebView 中直接运行，因此一套外壳同时兼容两个版本。
