/**
 * 场景一 · 数字碳表智能体（独立工程配置）
 * 会话存储与文案均与其他场景隔离，后续可在此目录扩展专属业务逻辑。
 */
window.DemoSceneProfile = {
  id: 'digital-carbon',
  agentName: '数字碳表智能体',
  agentDesc:
    '我专注于企业数字碳表场景：碳排放核算、工序强度、存证进度、碳资产与交易对标，帮助您从驾驶舱指标快速下钻到可执行的对标结论。',
  avatarSrc: '../../assets/agent-jiajia.png',
  avatarFallback: '碳',
  backHref: '../../cockpit.html',
  backLabel: '← 返回数字碳表驾驶舱',
  placeholder: '请输入数字碳表相关问题，如：查询本月粗钢碳排放强度全国排名',
  welcomeHint: '数字碳表常见问题，点击即可提问',
  quickStartHint: '典型数字碳表分析场景，一键进入',
  historyKey: 'demo_digital_carbon_history',
  activeKey: 'demo_digital_carbon_active',
  legacyKey: 'demo_digital_carbon_legacy',
  sessionStoreKey: 'demo_digital_carbon_sessions',
  reportBrandName: '数字碳表智能对标分析报告',
  welcomeSuggestions: [
    { text: '查询本月企业碳排放量与工序排放结构', prompt: '查询本月企业碳排放量与工序排放结构' },
    { text: '对比粗钢碳排放强度与行业标杆差距', prompt: '对比粗钢碳排放强度与行业标杆差距' },
    { text: '分析碳配额履约进度与碳价影响', prompt: '分析碳配额履约进度与碳价影响' },
  ],
  presetQuestions: [
    { id: 'dc1', text: '查询本月企业碳排放量与工序排放结构', icon: '📊' },
    { id: 'dc2', text: '对比粗钢碳排放强度与行业标杆差距', icon: '📈' },
    { id: 'dc3', text: '分析碳配额履约进度与碳价影响', icon: '💰' },
    { id: 'dc4', text: '查看月度存证完成情况与缺口提示', icon: '📋' },
  ],
};
