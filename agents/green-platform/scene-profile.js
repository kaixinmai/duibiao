/**
 * 场景三 · 绿色低碳管理平台智能体（独立工程配置）
 * 平台大屏尚未接入时，先独立对话工程与存储，避免与前两场景数据串扰。
 */
window.DemoSceneProfile = {
  id: 'green-platform',
  agentName: '绿色低碳管理智能体',
  agentDesc:
    '我专注于绿色低碳管理平台场景：双碳目标、减排项目、绿电替代与综合能效管理。当前演示以对话能力为主，后续将对接平台大屏数据。',
  avatarSrc: '../../assets/agent-jiajia.png',
  avatarFallback: '绿',
  backHref: '../../index.html',
  backLabel: '← 返回场景选择',
  placeholder: '请输入绿色低碳管理相关问题，如：查询绿电替代率提升空间',
  welcomeHint: '绿色低碳管理常见问题，点击即可提问',
  quickStartHint: '典型绿色低碳管理场景，一键进入',
  historyKey: 'demo_green_platform_history',
  activeKey: 'demo_green_platform_active',
  legacyKey: 'demo_green_platform_legacy',
  sessionStoreKey: 'demo_green_platform_sessions',
  reportBrandName: '绿色低碳管理智能对标分析报告',
  welcomeSuggestions: [
    { text: '查询绿电替代率与提升空间', prompt: '查询绿电替代率与提升空间' },
    { text: '对比减排项目投资回收期', prompt: '对比减排项目投资回收期' },
    { text: '分析双碳目标年度完成进度', prompt: '分析双碳目标年度完成进度' },
  ],
  presetQuestions: [
    { id: 'gp1', text: '查询绿电替代率与提升空间', icon: '🌿' },
    { id: 'gp2', text: '对比减排项目投资回收期', icon: '🔧' },
    { id: 'gp3', text: '分析双碳目标年度完成进度', icon: '🎯' },
    { id: 'gp4', text: '梳理重点工序节能改造优先级', icon: '📌' },
  ],
};
