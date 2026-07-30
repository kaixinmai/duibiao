/**
 * 场景二 · 集团碳账本智能体（独立工程配置）
 * 面向集团大屏：区域/行业排放、碳市场资产、履约与资讯问答。
 */
window.DemoSceneProfile = {
  id: 'group-ledger',
  agentName: '集团碳账本智能体',
  agentDesc:
    '我专注于集团碳账本场景：区域与行业碳排放总览、电厂配额缺口、碳市场资产与履约进度，帮您把集团大屏指标翻译成可决策的对标解读。',
  avatarSrc: '../../assets/agent-jiajia.png',
  avatarFallback: '账',
  backHref: '../../ledger.html',
  backLabel: '← 返回集团碳账本大屏',
  placeholder: '请输入集团碳账本相关问题，如：对比山东与新疆区域碳排放差距',
  welcomeHint: '集团碳账本常见问题，点击即可提问',
  quickStartHint: '典型集团账本分析场景，一键进入',
  historyKey: 'demo_group_ledger_history',
  activeKey: 'demo_group_ledger_active',
  legacyKey: 'demo_group_ledger_legacy',
  sessionStoreKey: 'demo_group_ledger_sessions',
  reportBrandName: '集团碳账本智能对标分析报告',
  welcomeSuggestions: [
    { text: '对比山东与新疆区域碳排放总量差距', prompt: '对比山东与新疆区域碳排放总量差距' },
    { text: '查询电厂碳排放与预计配额缺口', prompt: '查询电厂碳排放与预计配额缺口' },
    { text: '解读集团碳市场资产与本年成交情况', prompt: '解读集团碳市场资产与本年成交情况' },
  ],
  presetQuestions: [
    { id: 'gl1', text: '对比山东与新疆区域碳排放总量差距', icon: '🗺️' },
    { id: 'gl2', text: '查询电厂碳排放与预计配额缺口', icon: '⚡' },
    { id: 'gl3', text: '解读集团碳市场资产与本年成交情况', icon: '💹' },
    { id: 'gl4', text: '分行业查看电力与化工排放占比', icon: '🏭' },
  ],
};
