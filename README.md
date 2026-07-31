# 碳目标智能体 — 独立页面组件包

可直接复制到其他项目中使用，样式与交互与双碳智能体演示版保持一致。

## 文件清单

| 文件 | 说明 |
|------|------|
| `index.html` | 页面入口 |
| `carbon-target-agent.css` | 全部样式（含输入框、会话、思考过程、报告弹窗） |
| `carbon-target-agent.js` | 主逻辑（会话、演示数据、思考动画、发送交互） |
| `carbon-target-report.js` | 报告预览 / 下载 |
| `agent-icon.js` | 智能体头像路径解析 |
| `config.js` | 运行时配置（头像路径等） |
| `vendor/echarts.min.js` | 图表库（已内置，无需联网下载） |
| `assets/dual-carbon-agent-avatar.png` | 智能体头像 |

## 快速使用

### 方式一：静态服务器（推荐）

将整个文件夹放到项目的 `public/` 或静态资源目录，例如：

```
your-project/public/carbon-target-agent/
```

访问：`http://localhost:端口/carbon-target-agent/`

### 方式二：iframe 嵌入

```html
<iframe
  src="/carbon-target-agent/index.html"
  title="碳目标智能体"
  style="width:100%;height:100vh;border:0;"
  allow="microphone"
></iframe>
```

### 方式三：React / Vue 路由

把本目录作为静态资源目录挂载，路由指向 `index.html` 即可。

## 自定义

- **演示数据**：编辑 `carbon-target-agent.js` 中的 `MOCK`、`CAPABILITY_PROMPTS`
- **头像**：替换 `assets/dual-carbon-agent-avatar.png`，或在 `config.js` 修改 `ICON_REL`
- **标题/文案**：修改 `index.html` 中对应文本

## 依赖说明

- **零 npm 依赖**：纯 HTML + CSS + JavaScript
- **ECharts 已内置**：报告图表不依赖 CDN
- **浏览器**：Chrome / Edge / Firefox 最新版；Safari 14+

## 与主项目同步

本包由 `npm run package:carbon-target-kit` 从 `dist_minglu2/` 自动生成。

打包时间：2026/7/9 10:29:44
