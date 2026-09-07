# RPG 翻译器（iOS 版 mtool）

一个独立的 iOS 工具 App（**iOS 16 及以上**），把 mtool 的核心能力搬上 iPhone，**一个 App 全流程**：

- **▶ 播放游戏**：点游戏 →「播放游戏」→ 内置 WKWebView 运行 MV/MZ（**本地 HTTP 服务器加载**：XHR/相对路径/存档全部按标准浏览器行为工作，不再报 "Failed to load: data/xxx.json"），带**运行时翻译**（自动加载 `translations/` 词典，离线命中）＋**作弊器**（金钱/满级/全道具/不遇敌/无敌/穿墙/一击必杀/战斗胜利·逃跑/快速存档·读档/伤害倍率/速度）＋**存档管理**（备份/恢复 localStorage，对应 mtool 存档功能）
- **多语言插件自动兼容**：`js/plugins/` 下插件文件名带语言变体（日文/中文名、`_ja`/`_zh`/`_cn` 等后缀）时，启动前自动与 `plugins.js` 引用名模糊匹配并建别名，不再报 "Failed to load: js/plugins/xxx.js"
- **批量翻译**：把 `www/data` 的地图事件文本和数据库文本批量提取、翻译、写回，导出整份中文游戏；**两阶段翻译**：先翻术语（人名/物品/技能名），再翻对话——对话中的人名物品自动命中术语表，全篇一致
- **翻译文件管理**：`translations/` 词典查看/编辑/新建/导出/删除（对应 mtool 翻译文件管理），播放时自动加载

与仓库 `NativePlayer/`（独立播放器）互不影响，也可独立安装使用。

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

1. **导入游戏**：把含 `www/data`（或 `data`）的游戏文件夹放进 App 文稿目录（文件App → 我的 iPhone → RPG 翻译器；或爱思助手直拖 Documents）；含 `[ ]` 空格等特殊字符的文件夹名会在播放时自动改安全名，不影响显示
2. 点游戏 →「**▶ 播放游戏（带翻译+作弊器）**」直接开玩；或「翻译 / 校对 / 导出」进批量翻译
3. **翻译设置**（第二个 Tab）：运行时翻译开关、引擎（离线词典 / MyMemory 免费在线 / 自定义API）、源/目标语言、API 地址、Key、**模型**、提示词、**MyMemory 邮箱（免费提额）**
   - **MyMemory**：免费匿名约 5000 字符/天；在 MyMemory 官网免费注册后，把邮箱填到设置里可提升到约 5 万字符/天
   - **自定义 API**：兼容两种方式——① URL 占位符（地址含 `{text}`，可选 `{key}` `{prompt}` `{model}`）；② **OpenAI 兼容接口（推荐）**：地址填 `https://…/chat/completions`（DeepSeek/通义/OpenAI/硅基流动等），自动 POST JSON（model、messages、提示词），Key 走 Bearer，返回 `choices[0].message.content`；API 地址/Key/模型编辑即存，切页自动保存
4. 点「开始翻译」→ 进度条实时显示；**自动备份原 data** 到 Backups，可随时「恢复原版」
5. 完成后点「**导出到文件App**」→ 整份游戏复制到 `Exports/`，同时生成 `游戏名_翻译映射.json`
6. 翻译结果自动保存为 `translations/游戏名.json`（mtool 格式）——**播放游戏时直接离线命中，不需要重新生成游戏**

## 校对译文（手动精修）

详情页「**校对译文（手动精修）**」→ 列出全部翻译结果（上=译文，下=原文），可搜索过滤、逐条点击修改；点「保存并写回」立即写回游戏 data，并同步更新 `translations/游戏名.json` 映射。翻译结果每次完成后自动保存为该文件，重启 App 也不丢。

## 翻译文件管理（对应 mtool）

列表页左上角「**翻译文件**」→ 管理 `translations/` 下的所有 `{原文: 译文}` 词典：

- 点开即可查看/编辑（保存时校验 JSON），可导出/删除（左滑）
- 「新建词典」先建空文件，再手动填词条
- 这些文件**播放游戏时自动加载**：命中即显示译文，离线、即时、术语一致

## mtool / 精修翻译文件兼容

- **应用翻译文件**：详情页「应用翻译文件（mtool/JSON）」→ 把 mtool 或其他工具导出的 `{原文: 译文}` JSON 放进 `translations/` 文件夹，选择后直接写回游戏（应用前自动备份）。适合复用他人分享的精修汉化、或校对后的映射
- **override 词典**：把任意 `{原文: 译文}` JSON 命名为 **`override.json`** 放入 `translations/`，之后每次「开始翻译」都会**优先命中**这些句子（不发 API、不重复翻译），保证人名/物品/术语与你的精修完全一致——对应 mtool 的词典/指令词典思路

## 存档管理

播放游戏时工具栏「**存档盘图标**」→ 备份当前存档（localStorage 导出到 `Saves/`）/ 恢复存档（选择备份自动重载）。存档是 WKWebView 的 localStorage，卸载 App 或换 Bundle ID 会丢，**玩前建议先备份**。

## 翻译引擎

- **离线词典**：内置 dict.json（键=原文，值=译文）；放入自定义 `dict.json` 到 App 文稿目录可覆盖内置
- **MyMemory**：免费在线接口，无需 Key，有每日限额；已做 3 并发限速与失败保留原文
- **自定义API**：地址中 `{text}` 为原文、`{key}` 为密钥占位符；支持 JSON（`translatedText` / `translation` / 标准 Google 风格）或纯文本响应
- **翻译提示词**（对应 AiNiee）：在「翻译提示词」填写（如"你是游戏翻译，保持 JRPG 风格"），用 `{prompt}` 占位符附加到自定义 API 请求；不填则不带
- **两阶段翻译**（对应 MoriTranslates）：先翻译 System 术语与数据库名称（人名/物品/技能），并入术语表后再翻对话，对话中命中术语的句子直接替换、不发 API
- 所有结果增量缓存到 `transCache/<目标语言>.json`，中断后续翻不重复请求；可在设置里清除缓存

## 构建

- 工作流：`.github/workflows/build-translate-ipa.yml`（推送到 `TranslateTool/**` 自动触发）
- 产物：`RPGTranslate-unsigned-ipa`（zip 内含 `RPGTranslate-unsigned.ipa`）
- 自签安装方式与播放器相同（爱思助手，Bundle ID `com.rpgtranslate.ios`）

## 安全

- 翻译前自动备份，可一键还原
- 只修改 `www/data` 下的 JSON 文本字段，不碰图片/音频/脚本
- 导出是复制到 Exports，原始游戏目录保持翻译后的状态（如需原始文件用「恢复原版」）
- 崩溃日志自动写入 `crash.log`，设置页可一键分享排查

