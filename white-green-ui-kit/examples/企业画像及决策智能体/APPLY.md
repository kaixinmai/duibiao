# 示例：企业画像及决策智能体如何挂白绿皮

本示例对应我方平台中的 **企业画像及决策智能体**（企业服务 · `E-ENT-01`）。

合作方若交付同结构 dist（`index.html` + `carbon-target-agent.css` + `carbon-target-agent.js`，根节点为 `.cta-shell`），按下列方式即可全局换皮。

---

## 接入前（合作方原包）

```html
<head>
  <title>企业画像及决策智能体</title>
  <link rel="stylesheet" href="./carbon-target-agent.css" />
  <!-- 仅有深蓝科技风，无白绿皮 -->
</head>
<body>
  <div class="cta-shell">...</div>
</body>
```

## 接入后（拷贝本 Kit 到 dist 根目录）

```html
<head>
  <title>企业画像及决策智能体</title>
  <link rel="stylesheet" href="./carbon-target-agent.css" />
  <!-- 白绿 UI Kit：必须在业务 CSS 之后 -->
  <link rel="stylesheet" href="./white-green-ui-kit/css/theme-green.css" id="gc-theme-green" />
  <link rel="stylesheet" href="./white-green-ui-kit/css/theme-green-overrides.css" />
  <link rel="stylesheet" href="./white-green-ui-kit/css/cta-shell-green.css" />
</head>
<body>
  <div class="cta-shell">...</div>
</body>
```

目录关系：

```
企业画像及决策智能体dist/
├── index.html
├── carbon-target-agent.css
├── carbon-target-agent.js
├── config.js
└── white-green-ui-kit/          ← 整包拷贝进来
    ├── css/
    ├── inject/
    └── README.md
```

---

## 验收对照（本智能体）

打开问答页后应看到：

1. **侧栏**「企业画像及决策智能体」标题为深色字，不是白字/荧光字  
2. **新建会话** 按钮浅绿底、主绿字  
3. **欢迎区** 说明文字 `#475467`，强调词主绿实心  
4. **提问芯片 / 场景卡** 白底深字，hover 浅绿  
5. **底部输入** 白底绿描边，发送钮纯绿圆钮  
6. **dashboard/**（进入系统）若单独打开，**不要**挂本 Kit，保持原业务页视觉  

---

## 若类名不是 cta-shell？

- 使用 `pp-shell` 的门户壳：同样挂三套 CSS 即可（`cta-shell-green.css` 已覆盖 `.pp-shell`）  
- 完全自定义 DOM：需要按 `DESIGN-SPEC.md` 色板自行映射，或联系我方扩展选择器  

---

## 给我方联调时请说明

- dist 入口 HTML 路径  
- 是否已挂 `white-green-ui-kit`  
- 截图：侧栏 + 欢迎区 + 输入条各一张  
