/**
 * 场景三 · 绿色低碳管理平台智能体（独立工程配置）
 * 内核：企业/工序录入 · 材料上传 · 多源汇聚 · 仅针对输入工序出报告
 */
window.DemoSceneProfile = {
  id: 'green-platform',
  agentName: '绿色低碳管理智能体',
  agentDesc:
    '我是绿色低碳管理平台智能体：可录入企业与工序碳排放数值，上传年报/五年行动方案等材料，汇聚佳华双碳云图等多源数据，仅针对您输入的工序生成分析报告。',
  avatarSrc: '../../assets/agent-jiajia.png',
  avatarFallback: '绿',
  backHref: '../../scene-green.html',
  backLabel: '← 返回说明页',
  placeholder: '请输入问题，如：基于已录入工序做今年对标分析',
  welcomeHint: '绿色低碳管理常见问法，点击即可提问',
  quickStartHint: '典型绿色管理场景，一键进入',
  historyKey: 'demo_green_platform_history',
  activeKey: 'demo_green_platform_active',
  legacyKey: 'demo_green_platform_legacy',
  sessionStoreKey: 'demo_green_platform_sessions',
  reportBrandName: '绿色低碳管理智能对标分析报告',
  welcomeSuggestions: [
    { text: '基于已录入工序做今年对标分析', prompt: '基于已录入工序，给我进行一下今年的对标分析' },
    { text: '解读上传年报中的排放披露', prompt: '结合已上传年报，解读重点工序排放披露要点' },
    { text: '对比工序强度与行业标杆差距', prompt: '对比已录入工序碳排放强度与行业标杆差距' },
  ],
  presetQuestions: [
    { id: 'gp1', text: '基于已录入工序，给我进行一下今年的对标分析', icon: '📊' },
    { id: 'gp2', text: '结合已上传年报，解读重点工序排放披露要点', icon: '📄' },
    { id: 'gp3', text: '对比已录入工序碳排放强度与行业标杆差距', icon: '📈' },
    { id: 'gp4', text: '根据五年行动方案梳理工序改造优先级', icon: '🎯' },
  ],
};
