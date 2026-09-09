# 开源项目致谢与协议声明 (Open Source Acknowledgements)

本项目（rpgtransplayer / RPG TransPlayer）在开发过程中参考或使用了以下开源项目的代码、设计理念或资源。在此向原作者表示感谢。

---

## 1. RPG Maker MV Cheat Menu Plugin

- **项目地址**: https://github.com/emerladCoder/RPG-Maker-MV-Cheat-Menu-Plugin
- **作者**: emerladCoder (及社区贡献者)
- **用途**: 游戏内置作弊菜单（God Mode / No Clip / 经验/属性/金钱/道具/武器/防具修改 / 变量开关 / 存档位置传送 / 移动速度）
- **集成方式**: `Resources/Cheat_Menu.js` 直接注入游戏运行时
- **适配修改**: 移除了 NW.js `require('nw.gui')` 调用（iOS 无 NW.js 环境），改为 try/catch 兼容
- **协议**: 原项目未明确声明 LICENSE 文件，按 GitHub 默认条款使用。如原作者有补充协议声明，以原项目为准。

## 2. OnscreenController

- **项目地址**: https://github.com/glhaynes/OnscreenController
- **作者**: Grady Haynes
- **用途**: 虚拟手柄（虚拟键盘）的设计参考——全局触摸追踪视图 + D-Pad 9 区域映射 + 多点触控
- **集成方式**: `VirtualGamepad.swift` 为 UIKit 重写版，参考其设计理念，非直接复制源码
- **协议**: MIT License
- **MIT License 原文摘要**:
  > Copyright © 2023 Grady Haynes
  >
  > Permission is hereby granted, free of charge, to any person obtaining a copy
  > of this software and associated documentation files (the "Software"), to deal
  > in the Software without restriction, including without limitation the rights
  > to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  > copies of the Software, and to permit persons to whom the Software is
  > furnished to do so, subject to the following conditions:
  >
  > The above copyright notice and this permission notice shall be included in all
  > copies or substantial portions of the Software.

## 3. Paramonos RPG Maker MV/MZ Cheat UI Plugin（设计参考，未直接集成）

- **项目地址**: https://github.com/paramonos/RPG-Maker-MV-MZ-Cheat-UI-Plugin
- **作者**: paramonos
- **用途**: 作弊 UI 功能设计参考（Vue.js + Vuetify GUI 作弊面板）
- **状态**: 因依赖 NW.js 运行时和 Vue/Vuetify 框架，未直接集成到 iOS 版本；功能设计上作为参考
- **协议**: MIT License

---

## 协议说明

- 本项目自身代码以 **MIT License** 开源。
- 各第三方开源项目的版权和协议归原作者所有。
- 如任何原作者认为本项目的使用方式超出了其协议允许范围，请通过 GitHub Issue 联系，我们将立即整改。

## 联系方式

- 项目仓库: https://github.com/bailan1225/LTZ-RPGPlayer-iOS
