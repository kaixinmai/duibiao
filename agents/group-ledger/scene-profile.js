/**
 * 场景二 · 集团碳账本智能体（独立工程配置）
 * 内核：冀东集团范围 · 北水企业检索 · 多源汇聚对标报告
 */
window.DemoSceneProfile = {
  id: 'group-ledger',
  agentName: '集团碳账本智能体',
  agentDesc:
    '我是集团碳账本（冀东）智能体：支持按「北水」等关键词检索下属企业，汇聚佳华双碳云图与本地库数据，仅输出冀东范围内企业的对标分析报告。',
  avatarSrc: '../../assets/agent-jiajia.png',
  avatarFallback: '账',
  backHref: '../../ledger.html',
  backLabel: '← 返回大屏',
  placeholder: '请输入问题，如：北水企业今年对标分析；或直接点「对标智能体」',
  welcomeHint: '冀东碳账本常见问法，点击即可提问',
  quickStartHint: '典型冀东对标场景，一键进入',
  historyKey: 'demo_group_ledger_history',
  activeKey: 'demo_group_ledger_active',
  legacyKey: 'demo_group_ledger_legacy',
  sessionStoreKey: 'demo_group_ledger_sessions',
  reportBrandName: '冀东集团智能对标分析报告',
  welcomeSuggestions: [
    { text: '给我进行一下今年的对标分析', prompt: '给我进行一下今年的对标分析' },
    { text: '查询北水相关企业碳排放强度', prompt: '查询冀东水泥唐山北水工厂今年碳排放强度' },
    { text: '对比冀东水泥与行业标杆差距', prompt: '对比冀东水泥集团与水泥行业标杆差距' },
  ],
  presetQuestions: [
    { id: 'gl1', text: '给我进行一下今年的对标分析', icon: '📊' },
    { id: 'gl2', text: '查询冀东水泥唐山北水工厂今年碳排放强度', icon: '🏭' },
    { id: 'gl3', text: '对比冀东水泥集团与水泥行业标杆差距', icon: '📈' },
    { id: 'gl4', text: '分析冀东北水建材配额缺口', icon: '💹' },
  ],
};
