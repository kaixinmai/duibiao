# 白绿 UI 设计包（合作方 Drop-in）

合作方 dist 还是旧深蓝皮时：把本包丢进项目，**尽量交给 Cursor 自动挂载**，人几乎不用改 HTML。  
示例口径：**企业画像及决策智能体**（`cta-shell`），同结构企业智能体通用。

---

## 推荐：两步（最少人工）

1. 把整个 `white-green-ui-kit` 拷到智能体 dist 根目录（与问答 `index.html` 同级）
2. 打开 Cursor，把 [`CURSOR-一键挂皮提示词.md`](./CURSOR-一键挂皮提示词.md) 里标注的提示词整段贴进 Chat → 发送  

Cursor 会跑 `tools/apply.mjs`（或等价改 HTML），自动在问答页挂上三套 CSS。  

给人看的极简版：[`给合作方-两步说明.md`](./给合作方-两步说明.md)

无 Cursor 时，在 dist 根执行：

```bash
node white-green-ui-kit/tools/apply.mjs --root .
```

---

## 包内结构

```
white-green-ui-kit/
├── 给合作方-两步说明.md              ← 转发给人的最短说明
├── CURSOR-一键挂皮提示词.md          ← 贴进对方 Cursor
├── README.md
├── DESIGN-SPEC.md
├── tools/apply.mjs                   ← 一键扫描并改 HTML
├── css/
│   ├── theme-green.css
│   ├── theme-green-overrides.css
│   └── cta-shell-green.css
├── inject/apply-white-green-theme.js ← 备选：运行时注入
├── snippets/head-links.html          ← 备选：手写 link
└── examples/企业画像及决策智能体/APPLY.md
```

外跳页（dashboard / business / 报告系统）**不要**挂本皮肤；脚本会自动跳过。

---

## 备选：手动三行 link（仅脚本失败时）

在业务 CSS **之后**、`</head>` 前：

```html
<link rel="stylesheet" href="./white-green-ui-kit/css/theme-green.css" id="gc-theme-green" />
<link rel="stylesheet" href="./white-green-ui-kit/css/theme-green-overrides.css" />
<link rel="stylesheet" href="./white-green-ui-kit/css/cta-shell-green.css" />
```

或只加：

```html
<script src="./white-green-ui-kit/inject/apply-white-green-theme.js"></script>
```

---

## 色彩体系（摘要）

| 用途 | 色值 |
|------|------|
| 底 | `#f5faf7` |
| 主色 | `#00b86b` |
| 正文 | `#101828` / `#475467` |
| 边 | `#d8ece2` |

详见 [DESIGN-SPEC.md](./DESIGN-SPEC.md)。

---

## 不要做什么

- ❌ 不要改本包 token 成别的品牌色（除非我方发版）
- ❌ 不要挂到 dashboard / business / 报告系统
- ❌ 不要为换皮改业务 JS
- ❌ 不要删原 CSS；保留即可，由白绿皮覆盖

---

## 验收

- [ ] 问答页白绿；发送钮纯绿
- [ ] dashboard / business 未变色
- [ ] 未改业务 JS

## 版本

- Kit `1.1.0` — 推荐路径改为 Cursor 一键挂皮 + `tools/apply.mjs`
