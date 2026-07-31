# 演示智能体工程拆分

三种演示场景各自独立对话工程，避免会话历史、文案预设与后续业务逻辑互相污染。

| 目录 | 场景 | 入口大屏 | 对话地址 |
|------|------|----------|----------|
| `digital-carbon/` | 数字碳表 | `/cockpit.html` | `/agents/digital-carbon/` |
| `group-ledger/` | 集团碳账本 | `/ledger.html` | `/agents/group-ledger/` |
| `green-platform/` | 绿色低碳管理平台 | 暂无大屏 | `/agents/green-platform/` |

每个目录至少包含：
- `scene-profile.js`：本场景专属名称、描述、预设问法、storage key
- `index.html`：对话页（复用仓库根目录共享壳层 JS/CSS）

后续若某场景业务逻辑分叉，优先在对应目录新增脚本，再改该目录 `index.html` 引用，不要直接改另外两个场景。
