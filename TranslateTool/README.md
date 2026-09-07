# RPG 翻译器（RPG Maker MV/MZ 游戏文本批量翻译工具）

一个独立的 iOS 工具 App（**iOS 16 及以上**）：把 RPG Maker MV/MZ 游戏 `www/data` 里的**地图事件文本**和**数据库文本**批量提取、翻译、写回，然后**导出整份游戏**——放进 RPG Player 播放器即可直接玩到中文版（文本已写入游戏文件，运行时不再依赖在线翻译）。

与仓库 `NativePlayer/`（播放器）互不影响，独立构建、独立安装。

## 它翻译什么

| 数据文件 | 翻译内容 |
|---|---|
| Map*.json | 事件对话/选项/滚动文本、地图显示名（MZ） |
| CommonEvents.json | 公共事件文本、事件名 |
| Troops.json | 战斗事件文本、队伍名 |
| System.json | 游戏标题、系统术语（攻击/防御/状态/消息等） |
| Actors / Classes / Skills / Items / Weapons / Armors / Enemies / States / MapInfos | 名称、简介、描述、战斗消息（message1-4）等 |

- 事件指令覆盖：显示文章（401）、显示选项（102）、选项分支（402）、滚动文本（405）、更改显示名称（320）；脚本指令（355/655）与注释（108/408）**不翻译**
- `\N[1]`、`\V[1]`、`\C[...]` 等控制码与 `%1` 占位符**原样保留**，只翻译纯文本
- 写回保持 JSON 结构不变，仅替换字符串值；保留原文件 BOM（MZ 带 BOM、MV 不带）
- 目标语言为中文时，已含中文且不含日文假名的文本自动跳过（避免把中文当原文）

## 使用流程

1. **导入游戏**：把含 `www/data`（或 `data`）的游戏文件夹放进 App 文稿目录（文件App → 我的 iPhone → RPG 翻译器；或爱思助手直拖 Documents）
2. 游戏列表自动识别 MV/MZ，点进游戏 → 查看扫描统计（文件数 / 文本位置数 / 去重待翻条目）
3. **翻译设置**（第二个 Tab）：引擎（离线词典 / MyMemory 免费在线 / 自定义API）、源/目标语言、API 地址与 Key
4. 点「开始翻译」→ 进度条实时显示；**自动备份原 data** 到 Backups，可随时「恢复原版」
5. 完成后点「**导出到文件App**」→ 整份游戏复制到 `Exports/`，同时生成 `游戏名_翻译映射.json`（原文→译文，可复用/校对）
6. 用文件App 把导出文件夹**拷贝/移动**到「RPG Player」文稿目录 → 打开播放器直接玩中文版

## 校对译文（手动精修）

详情页「**校对译文（手动精修）**」→ 列出全部翻译结果（上=译文，下=原文），可搜索过滤、逐条点击修改；点「保存并写回」立即写回游戏 data，并同步更新 `translations/游戏名.json` 映射。翻译结果每次完成后自动保存为该文件，重启 App 也不丢。

## mtool / 精修翻译文件兼容

- **应用翻译文件**：详情页「应用翻译文件（mtool/JSON）」→ 把 mtool 或其他工具导出的 `{原文: 译文}` JSON 放进 `translations/` 文件夹（文件App → 我的 iPhone → RPG 翻译器 → translations），选择后直接写回游戏（应用前自动备份）。适合复用他人分享的精修汉化、或校对后的映射
- **override 词典**：把任意 `{原文: 译文}` JSON 命名为 **`override.json`** 放入 `translations/`，之后每次「开始翻译」都会**优先命中**这些句子（不发 API、不重复翻译），保证人名/物品/术语与你的精修完全一致——对应 mtool 的词典/指令词典思路

## 翻译引擎

- **离线词典**：内置 dict.json（键=原文，值=译文）；放入自定义 `dict.json` 到 App 文稿目录可覆盖内置
- **MyMemory**：免费在线接口，无需 Key，有每日限额；已做 3 并发限速与失败保留原文
- **自定义API**：地址中 `{text}` 为原文、`{key}` 为密钥占位符；支持 JSON（`translatedText` / `translation` / 标准 Google 风格）或纯文本响应
- 所有结果增量缓存到 `transCache/<目标语言>.json`，中断后续翻不重复请求；可在设置里清除缓存

## 构建

- 工作流：`.github/workflows/build-translate-ipa.yml`（推送到 `TranslateTool/**` 自动触发）
- 产物：`RPGTranslate-unsigned-ipa`（zip 内含 `RPGTranslate-unsigned.ipa`）
- 自签安装方式与播放器相同（爱思助手，Bundle ID `com.rpgtranslate.ios`）

## 安全

- 翻译前自动备份，可一键还原
- 只修改 `www/data` 下的 JSON 文本字段，不碰图片/音频/脚本
- 导出是复制到 Exports，原始游戏目录保持翻译后的状态（如需原始文件用「恢复原版」）
