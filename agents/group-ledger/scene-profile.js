/**
 * 场景二 · 集团碳账本业务系统内嵌 · 双碳智能体
 * 从大屏/驾驶舱等模块的动态智能体入口进入；会话与存储与其他场景隔离。
 * 内核：冀东集团范围 · 北水企业检索 · 多源汇聚对标报告
 */
window.DemoSceneProfile = {
  id: 'group-ledger',
  agentName: '双碳智能体',
  agentDesc:
    '集团碳账本系统的统一智能入口：支持智能问答与对标分析，可按「水泥」「冀东」「北水」等关键词从金隅集团 400+ 下属企业中单选分析对象，汇聚佳华双碳云图与本地库数据。',
  loginUserName: '李工',
  avatarSrc: '../../assets/agent-jiajia-still.png',
  avatarFallback: '碳',
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
    { text: '根据上传材料更新智能对标报告', prompt: '根据上传材料更新报告' },
  ],
  presetQuestions: [
    { id: 'gl1', text: '给我进行一下今年的对标分析', icon: '📊' },
    { id: 'gl2', text: '查询冀东水泥唐山北水工厂今年碳排放强度', icon: '🏭' },
    { id: 'gl3', text: '对比冀东水泥集团与水泥行业标杆差距', icon: '📈' },
    { id: 'gl4', text: '根据上传材料更新智能对标报告', icon: '📎' },
  ],
};
