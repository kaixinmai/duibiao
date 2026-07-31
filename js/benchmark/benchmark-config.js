/**
 * 碳对标智能体 - 业务矩阵配置
 * 维度：功能类型 / 时间 / 空间 / 对象
 */
var BenchmarkMatrix = {
  agentId: 'data-benchmark',
  agentName: '数据对标智能体',

  functionTypes: {
    ranking: { label: '排名', keywords: ['排名', '排行', '名次', '第几'] },
    comparison: { label: '对比', keywords: ['对比', '比较', '差距', '对标', '差异', '标杆'] }
  },

  timeDimensions: {
    yearly: { label: '年度', keywords: ['年', '年度', '全年'] },
    monthly: { label: '月度', keywords: ['月', '月度', '当月', '本月'] }
  },

  spaceDimensions: {
    national: { label: '全国', keywords: ['全国', '国内', '全行业'] },
    regional: { label: '区域', keywords: ['区域', '地区', '华北', '华东', '华南', '华中', '西南', '西北', '东北'] }
  },

  objectDimensions: {
    enterprise: { label: '企业级', keywords: ['企业', '公司', '集团'] },
    process: { label: '工序级', keywords: ['工序', '产线', '车间', '高炉', '转炉'] }
  },

  industries: ['钢铁', '电力', '化工', '水泥', '有色', '建材', '造纸'],

  regions: ['华北', '华东', '华南', '华中', '西南', '西北', '东北'],

  /** 槽位定义（仅用于展示标签，不再用于追问） */
  slotSchema: [
    { key: 'functionType', label: '功能类型', question: '' },
    { key: 'timeDimension', label: '时间维度', question: '' },
    { key: 'timeValue', label: '具体时间', question: '' },
    { key: 'spaceDimension', label: '空间范围', question: '' },
    { key: 'industry', label: '行业', question: '' },
    { key: 'objectDimension', label: '分析粒度', question: '' }
  ],

  /** 首页引导预设问题（河南钢铁集团演示场景） */
  presetQuestions: [
    {
      id: 'p1',
      text: '查询2026年6月河南钢铁集团钢铁行业全国排名',
      icon: '📊'
    },
    {
      id: 'p2',
      text: '对比河南钢铁集团与标杆企业的碳排放差距',
      icon: '📈'
    },
    {
      id: 'p3',
      text: '2026年6月钢铁企业碳配额履约与碳价影响分析',
      icon: '💰'
    },
    {
      id: 'p4',
      text: '河南钢铁集团生产经营与排污指标综合对标',
      icon: '🏭'
    }
  ],

  getLabel: function (dimension, key) {
    var map = this[dimension];
    return map && map[key] ? map[key].label : key;
  }
};
