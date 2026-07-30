# 合作方 · 交给 Cursor 自动挂白绿皮（复制整段）

把 `white-green-ui-kit` 文件夹放进智能体项目后，**整段复制到 Cursor Chat**，让 Cursor 执行即可。人几乎不用改 HTML。

---

## ↓↓↓ 从下一行开始复制 ↓↓↓

你是前端助手。请把「白绿 UI Kit」自动挂到本仓库的问答详情页，尽量少让人手工操作。

### 背景
- 项目里已有（或刚拷入）目录 `white-green-ui-kit/`（含 `css/`、`tools/apply.mjs`、`README.md`）。
- 目标：不改业务 JS、不改布局，只给问答详情 HTML 挂上白绿主题 CSS，盖住原深蓝科技风。
- 外跳页（`business/`、`dashboard/`、`cockpit`、报告系统、`login` 等）**禁止**挂载。

### 你必须做的事（按顺序）

1. 在仓库中定位 `white-green-ui-kit` 目录（若缺失，告知用户先解压/拷贝该包）。
2. 优先执行一键脚本（在含该 kit 的智能体 dist 根目录）：
   ```bash
   node white-green-ui-kit/tools/apply.mjs --root .
   ```
   若当前 cwd 不对，先 `cd` 到智能体 dist 根（与 `index.html` 同级，或含多个 agent 的上级），再跑脚本。
3. 若环境无 Node：改为手动编辑——在每个问答详情 `index.html`（及 `*agent*.html`）的 `</head>` 前、业务 CSS **之后**插入：
   ```html
   <link rel="stylesheet" href="./white-green-ui-kit/css/theme-green.css" id="gc-theme-green" />
   <link rel="stylesheet" href="./white-green-ui-kit/css/theme-green-overrides.css" />
   <link rel="stylesheet" href="./white-green-ui-kit/css/cta-shell-green.css" />
   ```
   相对路径按 HTML 与 kit 的实际位置计算；已存在 `gc-theme-green` / `cta-shell-green` 的文件跳过。
4. 不要修改 `carbon-target-agent.js` 等业务逻辑；不要改 dashboard/business。
5. 完成后列出：改了哪些 HTML、跳过了哪些、如何本地打开验收。

### 验收标准
- 问答页底为浅薄荷白，侧栏/气泡/输入/发送钮为白绿体系
- dashboard / business 页面颜色未变

### 参考
- 规范：`white-green-ui-kit/DESIGN-SPEC.md`
- 企业画像示例：`white-green-ui-kit/examples/企业画像及决策智能体/APPLY.md`

现在开始执行。

## ↑↑↑ 复制到此为止 ↑↑↑
