# 开源项目致谢与协议声明 (Open Source Acknowledgements)

本项目（rpgtransplayer / RPG TransPlayer）在开发过程中参考或使用了以下开源项目的代码、设计理念或资源。在此向原作者表示感谢。

---

## 1. ArkRPG（核心优化与作弊器）

- **项目地址**: 参考自 ArkRPG iOS 应用（App Store 第三方 RPG Maker 播放器）
- **用途**: 游戏运行时核心优化、现代 UI 作弊器、兼容层
- **集成文件**:
  - `Resources/ArkOptimizations.js` — 整合 6 大优化模块（视口/坐标修复/性能/纹理GC/输入映射）
  - `Resources/ArkRPG_CheatMenu.js` — 现代 UI 作弊器（侧边栏分类 + 搜索 + 卡片网格）
  - `Resources/common_crypto.js` — Node crypto 模块 polyfill（SHA-256 + AES-CBC）
  - `Resources/common_sync_xhr.js` — 同步 XHR 修复
  - `Resources/pixi_base_texture_fix.js` — PIXI 基础纹理修复
  - `Resources/mz_webgl_compat.js` — MZ WebGL 兼容修复
- **作弊器功能**: God Mode / No Clip / HP-MP-TP 设置 / 经验属性金钱道具武器防具 / 变量开关 / 传送 / 移动速度 / 禁用随机遇敌 / 强制战斗结果 / 游戏加速（0.5x-10x）/ 自动跳过对话
- **协议**: MIT License（整合自 RPGMakerCheatMenu + ParamonosCheatUI）

## 2. RPG Maker MV Cheat Menu Plugin（作弊器基础）

- **项目地址**: https://github.com/emerladCoder/RPG-Maker-MV-Cheat-Menu-Plugin
- **作者**: emerladCoder (及社区贡献者)
- **用途**: 作弊菜单核心功能实现（已整合进 ArkRPG_CheatMenu.js）
- **协议**: MIT License

## 3. Paramonos RPG Maker MV/MZ Cheat UI Plugin（功能扩展）

- **项目地址**: https://github.com/paramonos/RPG-Maker-MV-MZ-Cheat-UI-Plugin
- **作者**: paramonos
- **用途**: 作弊 UI 功能扩展（禁用随机遇敌 / 强制战斗结果 / 游戏加速 / 自动跳过对话，已整合进 ArkRPG_CheatMenu.js）
- **协议**: MIT License

## 4. OnscreenController（虚拟手柄设计参考）

- **项目地址**: https://github.com/glhaynes/OnscreenController
- **作者**: Grady Haynes
- **用途**: 虚拟手柄（虚拟键盘）的设计参考——全局触摸追踪视图 + D-Pad 9 区域映射 + 多点触控
- **集成方式**: `VirtualGamepad.swift` 为 UIKit 重写版，参考其设计理念，非直接复制源码
- **协议**: MIT License

---

## 协议说明

- 本项目自身代码以 **MIT License** 开源。
- 各第三方开源项目的版权和协议归原作者所有。
- 如任何原作者认为本项目的使用方式超出了其协议允许范围，请通过 GitHub Issue 联系，我们将立即整改。

## 联系方式

- 项目仓库: https://github.com/bailan1225/LTZ-RPGPlayer-iOS
