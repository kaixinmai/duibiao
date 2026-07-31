/**
 * 场景一 · 数字碳表业务系统内嵌 · 双碳智能体
 * 从驾驶舱等模块的动态智能体入口进入；会话与存储与其他场景隔离。
 */
window.DemoSceneProfile = {
  id: 'digital-carbon',
  agentName: '双碳智能体',
  agentDesc:
    '数字碳表系统的统一智能入口：支持智能问答与对标分析，协助您从驾驶舱指标快速下钻到可执行的双碳结论。',
  loginUserName: '张工',
  avatarSrc: '../../assets/agent-jiajia-still.png',
  avatarFallback: '碳',
  backHref: '../../cockpit.html',
  backLabel: '← 返回驾驶舱',
  placeholder: '请输入数字碳表相关问题，如：查询本月粗钢碳排放强度全国排名',
  welcomeHint: '对标常见问法，点击即可提问',
  quickStartHint: '典型对标分析场景，一键进入',
  historyKey: 'demo_digital_carbon_history',
  activeKey: 'demo_digital_carbon_active',
  legacyKey: 'demo_digital_carbon_legacy',
  sessionStoreKey: 'demo_digital_carbon_sessions',
  reportBrandName: '数字碳表智能对标分析报告',
  welcomeSuggestions: [
    { text: '给我进行一下今年的对标分析', prompt: '给我进行一下今年的对标分析' },
    { text: '对比粗钢碳排放强度与行业标杆差距', prompt: '对比粗钢碳排放强度与行业标杆差距' },
    { text: '根据上传材料更新智能对标报告', prompt: '根据上传材料更新报告' },
  ],
  presetQuestions: [
    { id: 'dc1', text: '给我进行一下今年的对标分析', icon: '📊' },
    { id: 'dc2', text: '对比粗钢碳排放强度与行业标杆差距', icon: '📈' },
    { id: 'dc3', text: '分析碳配额履约进度与碳价影响', icon: '💰' },
    { id: 'dc4', text: '根据上传材料更新智能对标报告', icon: '📎' },
  ],
};
