/**
 * 集团碳账本 · 冀东集团演示数据包
 * 仅服务 group-ledger 场景；字段形状对齐 HenanSteelData，便于复用报告/图表链路。
 * steelOutput 在此口径下表示水泥（熟料折算）产量。
 */
var JidongGroupData = {
  groupName: '金隅冀东',
  scopeNote: '本内核输出金隅集团（含冀东水泥）下属企业智能对标分析报告',
  industry: '水泥',
  enterpriseName: '冀东水泥集团',
  shortName: '冀东水泥',
  legalEntity: '唐山冀东水泥股份有限公司',
  creditCode: '91130200701234567X',
  region: '河北唐山',
  address: '河北省唐山市丰润区',

  /** 熟料线 / 一体化企业生产设施清单（演示） */
  facilitiesProfile: {
    count: 29,
    items: [
      { process: '熟料烧成', name: '回转窑生产线', spec: '5000t/d × 6 线 + 2500t/d × 4 线', capacityWanT: 1860, capacityUnit: '万t熟料/a' },
      { process: '原料制备', name: '石灰石破碎及生料磨', spec: '立磨/辊压机联合粉磨', capacityWanT: 2100, capacityUnit: '万t生料/a' },
      { process: '水泥粉磨', name: '水泥粉磨站/粉磨线', spec: '辊压机+球磨机 18 套', capacityWanT: 2680, capacityUnit: '万t水泥/a' },
      { process: '余热发电', name: '窑头窑尾余热发电', spec: '9MW×4 + 4.5MW×3', capacityWanT: null, capacityUnit: '—' },
      { process: '矿山开采', name: '自有石灰石矿山', spec: '配套熟料线原料保障', capacityWanT: 2400, capacityUnit: '万t/a' },
    ],
    notes: [
      '全国碳市场水泥配额以硅酸盐水泥熟料生产线为核定加总单元；粉磨站单独对标电耗与吨水泥强度',
      '余热发电并网电量计入综合能耗折算与绿电占比观察口径',
      '设施清单为集团演示汇总，单厂报告按法人边界裁剪',
    ],
  },

  /** 粉磨站设施清单（演示） */
  facilitiesProfileMill: {
    count: 1,
    items: [
      { process: '水泥粉磨', name: '水泥粉磨生产线', spec: '辊压机+球磨机 2 套', capacityWanT: 120, capacityUnit: '万t水泥/a' },
      { process: '原料烘干', name: '混合材烘干系统', spec: '热风炉/余热利用', capacityWanT: null, capacityUnit: '—' },
      { process: '包装输送', name: '包装与散装发运', spec: '包装机 + 散装库', capacityWanT: 120, capacityUnit: '万t/a' },
      { process: '公辅动力', name: '压缩空气与供配电', spec: '站内公辅', capacityWanT: null, capacityUnit: '—' },
    ],
    notes: [
      '粉磨站无熟料烧成窑系统，排放以电耗与烘干热源为主',
      '外购熟料碳足迹需与集团熟料线配额协同解读',
    ],
  },

  sources: {
    xxxSite: '行业公开信息网站（演示）',
    baidu: '百度公开检索摘要（演示）',
    cloudFacility: '佳华双碳云图 · 生产设施信息',
    cloudPollutant: '佳华双碳云图 · 污染物排放信息',
    cloudProduction: '佳华双碳云图 · 产量信息（污碳模型推演-机器人）',
    cloudEmission: '佳华双碳云图 · 碳排放信息（污碳模型推演-机器人）',
    cloudIntensity: '佳华双碳云图 · 碳排放强度信息（污碳模型推演-机器人）',
    localDb: '本地数据库 · 金隅/冀东集团碳排放数据',
    uploads: '用户上传材料（节能减碳分析报告 / 环评报告 / 核查报告等）',
  },

  uploads: [],
  learningNotes: [],
  hiddenSections: [],

  /** 冀东范围内可选企业（含「北水」关键字示例） */
  enterprises: [
    {
      id: 'jd-group',
      name: '冀东水泥集团',
      keywords: ['冀东', '集团'],
      region: '河北唐山',
      isDefault: true,
    },
    {
      id: 'jd-beishui-plant',
      name: '冀东水泥唐山北水工厂',
      keywords: ['北水', '唐山', '冀东'],
      region: '河北唐山',
    },
    {
      id: 'jd-beishui-material',
      name: '冀东北水建材有限公司',
      keywords: ['北水', '建材', '冀东'],
      region: '河北唐山',
    },
    {
      id: 'jd-beishui-mill',
      name: '冀东水泥承德北水粉磨站',
      keywords: ['北水', '承德', '粉磨', '冀东'],
      region: '河北承德',
    },
  ],

  industryBenchmark: {
    total: 310,
    avgIntensity: 0.82,
    best: 0.65,
    median: 0.80,
    distribution: [0.65, 0.68, 0.71, 0.74, 0.77, 0.80, 0.83, 0.86, 0.89, 0.93, 0.97, 1.02],
    avgEnergy: 108,
    bestEnergy: 92,
  },

  /** 企业周期数据：key = enterpriseId + '@' + period */
  enterprisePeriods: {
    'jd-group': {
      '2024': {
        year: '2024',
        source: 'demo-ledger',
        steelOutput: 2860,
        steelOutputUnit: '万吨',
        crudeSteelOutput: 2680,
        co2Emission: 2288,
        co2Unit: '万吨',
        co2Intensity: 0.80,
        intensityUnit: 'tCO₂/t',
        clinkerIntensity: 0.86,
        energyTotal: 302,
        energyTotalUnit: '万吨标煤',
        energyPerTon: 106,
        energyUnit: 'kgce/t',
        industryEnergyAvg: 108,
        carbonQuota: 2220,
        quotaSurplus: -68,
        carbonPriceAvg: 86.4,
        carbonPriceUnit: '元/t',
        carbonCost: 19.8,
        pollutants: { so2: 920, nox: 4860, pm: 3120, unit: '吨/年' },
        greenPowerRatio: 16.2,
        reductionAchieved: 48.6,
        revenue: 312,
        revenueUnit: '亿元',
        facilities: 28,
        scaleRank: 42,
        employees: 18600,
        emissionBreakdown: { fossilFuel: 980, process: 1120, netPower: 168, embeddedCarbon: 20, unit: '万吨CO₂' },
        processEmissions: { 熟料烧成: 1680, 水泥粉磨: 280, 原料制备: 168, 余热公辅: 160, total: 2288, unit: '万吨CO₂' },
        processBench: [
          { name: '熟料烧成（窑系统/分解炉）', intensity: 0.86, energy: 114, rank: 96, emission: 1680 },
          { name: '水泥粉磨生产线', intensity: 0.15, energy: 38, rank: 58, emission: 280 },
          { name: '原料制备 / 矿山开采', intensity: 0.065, energy: 24, rank: 118, emission: 168 },
          { name: '余热发电与公辅', intensity: 0.055, energy: 20, rank: 132, emission: 160 },
        ],
      },
      '2025': {
        year: '2025',
        source: 'demo-ledger',
        steelOutput: 2740,
        steelOutputUnit: '万吨',
        crudeSteelOutput: 2560,
        co2Emission: 2140,
        co2Unit: '万吨',
        co2Intensity: 0.78,
        intensityUnit: 'tCO₂/t',
        clinkerIntensity: 0.84,
        energyTotal: 285,
        energyTotalUnit: '万吨标煤',
        energyPerTon: 104,
        energyUnit: 'kgce/t',
        industryEnergyAvg: 107,
        carbonQuota: 2090,
        quotaSurplus: -50,
        carbonPriceAvg: 79.2,
        carbonPriceUnit: '元/t',
        carbonCost: 17.0,
        pollutants: { so2: 860, nox: 4520, pm: 2880, unit: '吨/年' },
        greenPowerRatio: 19.5,
        reductionAchieved: 56.2,
        revenue: 298,
        revenueUnit: '亿元',
        facilities: 28,
        scaleRank: 40,
        employees: 18200,
        emissionBreakdown: { fossilFuel: 900, process: 1060, netPower: 155, embeddedCarbon: 25, unit: '万吨CO₂' },
        processEmissions: { 熟料烧成: 1560, 水泥粉磨: 260, 原料制备: 160, 余热公辅: 160, total: 2140, unit: '万吨CO₂' },
        processBench: [
          { name: '熟料烧成（窑系统/分解炉）', intensity: 0.84, energy: 112, rank: 92, emission: 1560 },
          { name: '水泥粉磨生产线', intensity: 0.145, energy: 37, rank: 55, emission: 260 },
          { name: '原料制备 / 矿山开采', intensity: 0.062, energy: 23, rank: 114, emission: 160 },
          { name: '余热发电与公辅', intensity: 0.052, energy: 19, rank: 128, emission: 160 },
        ],
      },
      '2026': {
        year: '2026',
        source: 'demo-ledger',
        steelOutput: 2680,
        steelOutputUnit: '万吨',
        crudeSteelOutput: 2500,
        co2Emission: 2064,
        co2Unit: '万吨',
        co2Intensity: 0.77,
        intensityUnit: 'tCO₂/t',
        clinkerIntensity: 0.83,
        energyTotal: 273,
        energyTotalUnit: '万吨标煤',
        energyPerTon: 102,
        energyUnit: 'kgce/t',
        industryEnergyAvg: 106,
        carbonQuota: 2010,
        quotaSurplus: -54,
        carbonPriceAvg: 82.5,
        carbonPriceUnit: '元/t',
        carbonCost: 17.0,
        pollutants: { so2: 820, nox: 4300, pm: 2720, unit: '吨/年' },
        greenPowerRatio: 22.0,
        reductionAchieved: 38.4,
        revenue: 286,
        revenueUnit: '亿元',
        facilities: 29,
        scaleRank: 38,
        employees: 17800,
        emissionBreakdown: { fossilFuel: 860, process: 1020, netPower: 148, embeddedCarbon: 36, unit: '万吨CO₂' },
        processEmissions: { 熟料烧成: 1500, 水泥粉磨: 250, 原料制备: 154, 余热公辅: 160, total: 2064, unit: '万吨CO₂' },
        processBench: [
          { name: '熟料烧成（窑系统/分解炉）', intensity: 0.83, energy: 110, rank: 88, emission: 1500 },
          { name: '水泥粉磨生产线', intensity: 0.14, energy: 36, rank: 52, emission: 250 },
          { name: '原料制备 / 矿山开采', intensity: 0.06, energy: 22, rank: 110, emission: 154 },
          { name: '余热发电与公辅', intensity: 0.05, energy: 18, rank: 126, emission: 160 },
        ],
      },
      '2026-06': {
        year: '2026',
        month: '06',
        source: 'demo-ledger',
        steelOutput: 228,
        steelOutputUnit: '万吨',
        crudeSteelOutput: 212,
        co2Emission: 174,
        co2Unit: '万吨',
        co2Intensity: 0.76,
        intensityUnit: 'tCO₂/t',
        clinkerIntensity: 0.82,
        energyTotal: 23.0,
        energyTotalUnit: '万吨标煤',
        energyPerTon: 101,
        energyUnit: 'kgce/t',
        industryEnergyAvg: 106,
        carbonQuota: 168,
        quotaSurplus: -6,
        carbonPriceAvg: 83.1,
        carbonPriceUnit: '元/t',
        carbonCost: 1.44,
        pollutants: { so2: 68, nox: 352, pm: 220, unit: '吨' },
        greenPowerRatio: 22.8,
        reductionAchieved: 4.1,
        revenue: 24.2,
        revenueUnit: '亿元',
        facilities: 29,
        scaleRank: 38,
        employees: 17800,
        processBench: [
          { name: '熟料烧成（窑系统/分解炉）', intensity: 0.82, energy: 109, rank: 86, emission: 126 },
          { name: '水泥粉磨生产线', intensity: 0.135, energy: 35, rank: 50, emission: 22 },
          { name: '原料制备 / 矿山开采', intensity: 0.058, energy: 21, rank: 108, emission: 13 },
          { name: '余热发电与公辅', intensity: 0.048, energy: 17, rank: 124, emission: 13 },
        ],
      },
    },
    'jd-beishui-plant': {
      '2026': {
        year: '2026',
        source: 'demo-ledger',
        steelOutput: 420,
        steelOutputUnit: '万吨',
        crudeSteelOutput: 398,
        co2Emission: 336,
        co2Unit: '万吨',
        co2Intensity: 0.80,
        intensityUnit: 'tCO₂/t',
        clinkerIntensity: 0.86,
        energyTotal: 44.2,
        energyTotalUnit: '万吨标煤',
        energyPerTon: 105,
        energyUnit: 'kgce/t',
        industryEnergyAvg: 106,
        carbonQuota: 320,
        quotaSurplus: -16,
        carbonPriceAvg: 82.5,
        carbonPriceUnit: '元/t',
        carbonCost: 2.77,
        pollutants: { so2: 128, nox: 680, pm: 410, unit: '吨/年' },
        greenPowerRatio: 18.6,
        reductionAchieved: 6.2,
        revenue: 46,
        revenueUnit: '亿元',
        facilities: 4,
        scaleRank: 96,
        employees: 2100,
        emissionBreakdown: { fossilFuel: 142, process: 168, netPower: 22, embeddedCarbon: 4, unit: '万吨CO₂' },
        processEmissions: { 熟料烧成: 248, 水泥粉磨: 42, 原料制备: 24, 余热公辅: 22, total: 336, unit: '万吨CO₂' },
        processBench: [
          { name: '熟料烧成（窑系统/分解炉）', intensity: 0.86, energy: 112, rank: 102, emission: 248 },
          { name: '水泥粉磨生产线', intensity: 0.15, energy: 38, rank: 58, emission: 42 },
          { name: '原料制备 / 矿山开采', intensity: 0.07, energy: 24, rank: 118, emission: 24 },
          { name: '余热发电与公辅', intensity: 0.055, energy: 19, rank: 130, emission: 22 },
        ],
      },
      '2026-06': {
        year: '2026',
        month: '06',
        source: 'demo-ledger',
        steelOutput: 36.5,
        steelOutputUnit: '万吨',
        crudeSteelOutput: 34.2,
        co2Emission: 29.1,
        co2Unit: '万吨',
        co2Intensity: 0.80,
        intensityUnit: 'tCO₂/t',
        energyTotal: 3.8,
        energyTotalUnit: '万吨标煤',
        energyPerTon: 105,
        energyUnit: 'kgce/t',
        industryEnergyAvg: 106,
        carbonQuota: 27.8,
        quotaSurplus: -1.3,
        carbonPriceAvg: 83.1,
        carbonPriceUnit: '元/t',
        carbonCost: 0.24,
        pollutants: { so2: 11, nox: 56, pm: 34, unit: '吨' },
        greenPowerRatio: 19.0,
        facilities: 4,
        scaleRank: 96,
        employees: 2100,
      },
    },
    'jd-beishui-material': {
      '2026': {
        year: '2026',
        source: 'demo-ledger',
        steelOutput: 186,
        steelOutputUnit: '万吨',
        crudeSteelOutput: 170,
        co2Emission: 156,
        co2Unit: '万吨',
        co2Intensity: 0.84,
        intensityUnit: 'tCO₂/t',
        energyTotal: 20.5,
        energyTotalUnit: '万吨标煤',
        energyPerTon: 110,
        energyUnit: 'kgce/t',
        industryEnergyAvg: 106,
        carbonQuota: 148,
        quotaSurplus: -8,
        carbonPriceAvg: 82.5,
        carbonPriceUnit: '元/t',
        carbonCost: 1.29,
        pollutants: { so2: 72, nox: 390, pm: 255, unit: '吨/年' },
        greenPowerRatio: 14.2,
        reductionAchieved: 2.8,
        revenue: 21,
        revenueUnit: '亿元',
        facilities: 2,
        scaleRank: 148,
        employees: 860,
        emissionBreakdown: { fossilFuel: 68, process: 72, netPower: 14, embeddedCarbon: 2, unit: '万吨CO₂' },
      },
      '2026-06': {
        year: '2026',
        month: '06',
        source: 'demo-ledger',
        steelOutput: 15.8,
        steelOutputUnit: '万吨',
        crudeSteelOutput: 14.5,
        co2Emission: 13.3,
        co2Unit: '万吨',
        co2Intensity: 0.84,
        intensityUnit: 'tCO₂/t',
        energyTotal: 1.74,
        energyTotalUnit: '万吨标煤',
        energyPerTon: 110,
        energyUnit: 'kgce/t',
        industryEnergyAvg: 106,
        carbonQuota: 12.6,
        quotaSurplus: -0.7,
        carbonPriceAvg: 83.1,
        carbonPriceUnit: '元/t',
        carbonCost: 0.11,
        pollutants: { so2: 6, nox: 32, pm: 21, unit: '吨' },
        greenPowerRatio: 14.5,
        facilities: 2,
        scaleRank: 148,
        employees: 860,
      },
    },
    'jd-beishui-mill': {
      '2026': {
        year: '2026',
        source: 'demo-ledger',
        steelOutput: 96,
        steelOutputUnit: '万吨',
        crudeSteelOutput: 0,
        co2Emission: 42,
        co2Unit: '万吨',
        co2Intensity: 0.44,
        intensityUnit: 'tCO₂/t',
        energyTotal: 3.65,
        energyTotalUnit: '万吨标煤',
        energyPerTon: 38,
        energyUnit: 'kgce/t',
        industryEnergyAvg: 42,
        carbonQuota: 40,
        quotaSurplus: -2,
        carbonPriceAvg: 82.5,
        carbonPriceUnit: '元/t',
        carbonCost: 0.35,
        pollutants: { so2: 18, nox: 96, pm: 120, unit: '吨/年' },
        greenPowerRatio: 26.0,
        reductionAchieved: 1.1,
        revenue: 8.6,
        revenueUnit: '亿元',
        facilities: 1,
        scaleRank: 68,
        employees: 320,
        emissionBreakdown: { fossilFuel: 6, process: 4, netPower: 30, embeddedCarbon: 2, unit: '万吨CO₂' },
        processEmissions: { 水泥粉磨: 28, 原料烘干: 6, 包装输送: 3, 公辅动力: 5, total: 42, unit: '万吨CO₂' },
        processBench: [
          { name: '水泥粉磨生产线', intensity: 0.44, energy: 38, rank: 68, emission: 28 },
          { name: '原料烘干', intensity: 0.1, energy: 12, rank: 86, emission: 6 },
          { name: '包装与输送', intensity: 0.035, energy: 5, rank: 104, emission: 3 },
          { name: '公辅动力系统', intensity: 0.052, energy: 7, rank: 112, emission: 5 },
        ],
      },
      '2026-06': {
        year: '2026',
        month: '06',
        source: 'demo-ledger',
        steelOutput: 8.2,
        steelOutputUnit: '万吨',
        crudeSteelOutput: 0,
        co2Emission: 3.5,
        co2Unit: '万吨',
        co2Intensity: 0.43,
        intensityUnit: 'tCO₂/t',
        energyTotal: 0.30,
        energyTotalUnit: '万吨标煤',
        energyPerTon: 37,
        energyUnit: 'kgce/t',
        industryEnergyAvg: 42,
        carbonQuota: 3.3,
        quotaSurplus: -0.2,
        carbonPriceAvg: 83.1,
        carbonPriceUnit: '元/t',
        carbonCost: 0.03,
        pollutants: { so2: 1.5, nox: 8, pm: 10, unit: '吨' },
        greenPowerRatio: 26.5,
        facilities: 1,
        scaleRank: 68,
        employees: 320,
        processBench: [
          { name: '水泥粉磨生产线', intensity: 0.43, energy: 37, rank: 66, emission: 2.4 },
          { name: '原料烘干', intensity: 0.095, energy: 11, rank: 84, emission: 0.5 },
          { name: '包装与输送', intensity: 0.034, energy: 5, rank: 102, emission: 0.25 },
          { name: '公辅动力系统', intensity: 0.05, energy: 7, rank: 110, emission: 0.35 },
        ],
      },
    },
  },

  activeEnterpriseId: 'jd-group',

  getEnterpriseMeta: function (id) {
    var target = id || this.activeEnterpriseId;
    for (var i = 0; i < this.enterprises.length; i++) {
      if (this.enterprises[i].id === target) return this.enterprises[i];
    }
    return this.enterprises[0];
  },

  setActiveEnterprise: function (id) {
    var meta = this.getEnterpriseMeta(id);
    this.activeEnterpriseId = meta.id;
    this.enterpriseName = meta.name;
    this.shortName = meta.name;
    return meta;
  },

  _orgMerged: false,

  /** 将 CSV 导入的金隅组织并入企业检索池（离线嵌入，不依赖外部路径） */
  initOrgEnterprises: function () {
    if (this._orgMerged || typeof JinyuOrgEnterprises === 'undefined') return;
    this._orgMerged = true;
    var self = this;
    var byName = {};
    this.enterprises.forEach(function (e) {
      byName[e.name] = e;
    });
    JinyuOrgEnterprises.forEach(function (jy) {
      if (byName[jy.name]) {
        var ex = byName[jy.name];
        ex.csvId = jy.csvId;
        ex.parentId = jy.parentId;
        ex.keywords = (ex.keywords || []).concat(jy.keywords || []);
        return;
      }
      var region = jy.region;
      if (/^\d+$/.test(String(region || ''))) {
        region = self.inferRegionFromName(jy.name) || region;
      }
      var ent = {
        id: jy.id,
        csvId: jy.csvId,
        name: jy.name,
        shortName: jy.shortName,
        keywords: (jy.keywords || []).slice(),
        region: region,
        parentId: jy.parentId,
        fromCsv: true,
      };
      self.enterprises.push(ent);
      byName[jy.name] = ent;
    });
  },

  inferRegionFromName: function (name) {
    var m = String(name || '').match(
      /(北京|天津|河北|山西|内蒙古|辽宁|吉林|黑龙江|上海|江苏|浙江|安徽|福建|江西|山东|河南|湖北|湖南|广东|广西|海南|重庆|四川|贵州|云南|西藏|陕西|甘肃|青海|宁夏|新疆|唐山|承德|保定|石家庄|邯郸|邢台|张家口|秦皇岛|廊坊|沧州|衡水|鞍山|包头|宝鸡|博爱)/
    );
    return m ? m[1] : '';
  },

  _hashSeed: function (id) {
    var s = String(id || '');
    var h = 0;
    for (var i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) >>> 0;
    }
    return h || 1;
  },

  /** CSV 企业无演示周期数据时，生成稳定可复现的合成指标 */
  buildSyntheticPeriod: function (key, enterpriseId) {
    var meta = this.getEnterpriseMeta(enterpriseId);
    var seed = this._hashSeed(meta.id);
    var bench = this.industryBenchmark;
    var year = String(key || '2026').slice(0, 4);
    var jitter = ((seed % 97) - 48) / 1000;
    var intensity = Math.round((bench.avgIntensity + jitter) * 100) / 100;
    var energy = Math.round(bench.avgEnergy + (seed % 11) - 5);
    var output = Math.round(80 + (seed % 420));
    var emission = Math.round(output * intensity * 10) / 10;
    var isMill = /粉磨/.test(String(meta.name || ''));
    return {
      year: year,
      source: 'demo-synthetic',
      steelOutput: output,
      steelOutputUnit: '万吨',
      crudeSteelOutput: isMill ? 0 : Math.round(output * 0.94),
      co2Emission: emission,
      co2Unit: '万吨',
      co2Intensity: intensity,
      intensityUnit: 'tCO₂/t',
      clinkerIntensity: isMill ? null : Math.round(intensity * 1.08 * 1000) / 1000,
      energyTotal: Math.round((output * energy) / 1000 * 10) / 10,
      energyTotalUnit: '万吨标煤',
      energyPerTon: energy,
      energyUnit: 'kgce/t',
      industryEnergyAvg: isMill ? 42 : bench.avgEnergy,
      carbonQuota: Math.round(emission * 0.98),
      quotaSurplus: Math.round(emission * 0.02 * -1),
      carbonPriceAvg: 82.5,
      carbonPriceUnit: '元/t',
      carbonCost: Math.round((emission * 0.02 * 82.5) / 10) / 10,
      pollutants: {
        so2: Math.round(output * 0.3),
        nox: Math.round(output * 1.6),
        pm: Math.round(output * 1.0),
        unit: '吨/年',
      },
      greenPowerRatio: Math.round(12 + (seed % 18)),
      reductionAchieved: Math.round(output * 0.02 * 10) / 10,
      revenue: Math.round(output * 0.11 * 10) / 10,
      revenueUnit: '亿元',
      facilities: Math.max(1, (seed % 6) + 1),
      scaleRank: (seed % 180) + 20,
      employees: Math.round(200 + (seed % 800)),
      emissionBreakdown: {
        fossilFuel: Math.round(emission * (isMill ? 0.15 : 0.42) * 10) / 10,
        process: Math.round(emission * (isMill ? 0.1 : 0.48) * 10) / 10,
        netPower: Math.round(emission * (isMill ? 0.7 : 0.08) * 10) / 10,
        embeddedCarbon: Math.round(emission * 0.02 * 10) / 10,
        unit: '万吨CO₂',
      },
      processBench: isMill
        ? [
            { name: '水泥粉磨生产线', intensity: intensity, energy: energy, rank: (seed % 80) + 10, emission: Math.round(emission * 0.65 * 10) / 10 },
            { name: '原料烘干', intensity: Math.round(intensity * 0.22 * 1000) / 1000, energy: Math.round(energy * 0.3), rank: (seed % 70) + 20, emission: Math.round(emission * 0.15 * 10) / 10 },
            { name: '包装与输送', intensity: Math.round(intensity * 0.08 * 1000) / 1000, energy: Math.round(energy * 0.12), rank: (seed % 60) + 30, emission: Math.round(emission * 0.08 * 10) / 10 },
            { name: '公辅动力系统', intensity: Math.round(intensity * 0.12 * 1000) / 1000, energy: Math.round(energy * 0.18), rank: (seed % 60) + 40, emission: Math.round(emission * 0.12 * 10) / 10 },
          ]
        : [
            { name: '熟料烧成', intensity: Math.round(intensity * 0.62 * 1000) / 1000, energy: energy + 8, rank: (seed % 80) + 10, emission: Math.round(emission * 0.7 * 10) / 10 },
            { name: '水泥粉磨', intensity: Math.round(intensity * 0.18 * 1000) / 1000, energy: Math.round(energy * 0.35), rank: (seed % 70) + 15, emission: Math.round(emission * 0.15 * 10) / 10 },
            { name: '矿山开采', intensity: Math.round(intensity * 0.08 * 1000) / 1000, energy: Math.round(energy * 0.22), rank: (seed % 60) + 20, emission: Math.round(emission * 0.08 * 10) / 10 },
          ],
    };
  },

  _scoreEnterprise: function (ent, q) {
    var ql = String(q || '').trim();
    if (!ql) return 1;
    var name = ent.name || '';
    var short = ent.shortName || '';
    if (name === ql || short === ql) return 200;
    if (name.indexOf(ql) >= 0) return 150 - name.indexOf(ql);
    if (short.indexOf(ql) >= 0) return 140;
    var kws = ent.keywords || [];
    for (var i = 0; i < kws.length; i++) {
      var k = kws[i];
      if (!k || k.length < 2) continue;
      if (k.indexOf(ql) >= 0 || ql.indexOf(k) >= 0) return 120 - i;
    }
    var chars = ql.split('');
    var hit = 0;
    for (var j = 0; j < chars.length; j++) {
      if (name.indexOf(chars[j]) >= 0) hit++;
    }
    if (hit >= Math.max(2, Math.ceil(ql.length * 0.6))) return 60 + hit;
    return 0;
  },

  searchEnterprises: function (keyword) {
    this.initOrgEnterprises();
    var q = String(keyword || '').trim();
    if (!q) return this.enterprises.slice(0, 12);
    var scored = this.enterprises
      .map(function (ent) {
        return { ent: ent, score: this._scoreEnterprise(ent, q) };
      }, this)
      .filter(function (x) {
        return x.score > 0;
      })
      .sort(function (a, b) {
        return b.score - a.score || a.ent.name.localeCompare(b.ent.name, 'zh-CN');
      });
    return scored.slice(0, 10).map(function (x) {
      return x.ent;
    });
  },

  /** 仅允许冀东范围内企业 */
  isInScope: function (nameOrId) {
    var t = String(nameOrId || '');
    if (!t) return false;
    if (this.getEnterpriseMeta(t) && this.enterprises.some(function (e) { return e.id === t; })) {
      return true;
    }
    return this.enterprises.some(function (e) {
      return e.name === t || e.id === t || t.indexOf('冀东') >= 0;
    });
  },

  getPeriod: function (key, enterpriseId) {
    var eid = enterpriseId || this.activeEnterpriseId;
    var pack = this.enterprisePeriods[eid];
    if (pack) {
      if (pack[key]) return pack[key];
      if (key && pack[String(key).slice(0, 4)]) return pack[String(key).slice(0, 4)];
      return pack['2026'] || pack['2026-06'] || pack['2024'];
    }
    return this.buildSyntheticPeriod(key, eid);
  },

  getBenchmarkProfiles: function (periodKey) {
    var self = this.getPeriod(periodKey);
    var bench = this.industryBenchmark;
    var output = self.steelOutput;
    var bestInt = bench.best;
    var avgInt = bench.avgIntensity;
    return {
      benchmark: {
        name: '行业标杆（前5%）',
        steelOutput: output,
        co2Emission: Math.round(output * bestInt * 10) / 10,
        co2Intensity: bestInt,
        energyPerTon: bench.bestEnergy,
        carbonQuota: Math.round(output * bestInt * 10) / 10,
        quotaSurplus: Math.round(output * (self.co2Intensity - bestInt) * 10) / 10,
        carbonPriceAvg: self.carbonPriceAvg,
        carbonCost: Math.round((output * bestInt * self.carbonPriceAvg) / 10000 * 10) / 10,
        pollutants: {
          so2: Math.round(self.pollutants.so2 * 0.65),
          nox: Math.round(self.pollutants.nox * 0.68),
          pm: Math.round(self.pollutants.pm * 0.66),
        },
      },
      industryAvg: {
        name: '行业均值（全国水泥）',
        steelOutput: output,
        co2Emission: Math.round(output * avgInt * 10) / 10,
        co2Intensity: avgInt,
        energyPerTon: bench.avgEnergy,
        carbonQuota: Math.round(output * avgInt * 10) / 10,
        quotaSurplus: Math.round(output * (self.co2Intensity - avgInt) * 10) / 10,
        carbonPriceAvg: self.carbonPriceAvg,
        carbonCost: Math.round((output * avgInt * self.carbonPriceAvg) / 10000 * 10) / 10,
        pollutants: {
          so2: Math.round(self.pollutants.so2 * 0.82),
          nox: Math.round(self.pollutants.nox * 0.85),
          pm: Math.round(self.pollutants.pm * 0.84),
        },
      },
    };
  },

  classifyUpload: function (fileName) {
    var n = String(fileName || '');
    if (/环评|环境影响/.test(n)) return 'eia';
    if (/核查报告|排放核查|温室气体/.test(n)) return 'verify';
    if (/节能|减碳|降碳|碳达峰|双碳/.test(n)) return 'energy';
    if (/年报|annual/.test(n)) return 'annual';
    return 'misc';
  },

  mockParseSummary: function (fileName, category) {
    if (category === 'eia') {
      return '已提取环评批复边界、敏感目标与排污许可关键约束（演示解析）';
    }
    if (category === 'verify') {
      return '已提取核查终值：熟料/水泥产量、企业层级排放、碳排放强度、生产线排放与综合能耗（演示解析）';
    }
    if (category === 'energy') {
      return '已提取节能减碳措施清单、阶段目标与已完成技改项（演示解析）';
    }
    if (category === 'annual') {
      return '已提取产量、能耗与排放披露段落（演示解析）';
    }
    return '已收录材料并建立检索片段，用于校正对标结论（演示解析）';
  },

  mockLearningDelta: function (fileName, category) {
    if (category === 'eia') {
      return {
        title: '环评约束校正',
        intensityAdj: -0.01,
        advice:
          '结合环评批复边界，建议将窑尾脱硝与粉磨除尘联锁纳入生产线对标短板清单，并同步更新排污许可台账口径。',
        sectionNote:
          '已根据上传《环评报告》校正污染物与设施边界口径，生产设施对标中补充敏感目标防护距离复核结论。',
        fieldHints: [],
      };
    }
    if (category === 'verify') {
      return {
        title: '核查报告底数对齐',
        intensityAdj: 0,
        advice:
          '已对齐核查终值口径，后续对标以核查熟料/水泥产量与强度为准，并突出窑系统排放贡献与余热发电对强度改善的作用。',
        sectionNote:
          '已根据上传《温室气体排放核查报告》写入产量、排放、强度、生产线排放与设施产能等历史底数。',
        fieldHints: [
          { hint: '企业层级碳排放强度', value: 0.77 },
          { hint: '综合能耗强度', value: 102 },
        ],
      };
    }
    if (category === 'energy') {
      return {
        title: '节能减碳措施吸收',
        intensityAdj: -0.02,
        advice:
          '已吸收节能减碳分析报告中的窑系统热工优化与余热发电建议，将熟料烧成、粉磨线能效对标目标上调一档，并写入降碳行动优先级。',
        sectionNote:
          '已根据上传《节能减碳分析报告》更新能耗对标与减排潜力拆分权重，强化窑—磨联动技改路径。',
        fieldHints: [{ hint: '综合能耗强度', value: 98 }],
      };
    }
    return {
      title: '材料学习校正',
      intensityAdj: -0.005,
      advice: '已将上传材料中的关键披露纳入报告修订意见。',
      sectionNote:
        '已根据上传材料更新能耗对标、产量与强度相关条目；具体字段变更见下方修改说明。',
      fieldHints: [],
    };
  },

  parseUploadContent: function (fileName, category, extractedText) {
    var text = String(extractedText || '');
    var delta = this.mockLearningDelta(fileName, category);
    var changelog = [];
    var fieldPatches = [];

    function pushPatch(hint, value, reason) {
      var v = Number(value);
      if (isNaN(v)) return;
      fieldPatches = fieldPatches.filter(function (f) {
        return f.hint !== hint;
      });
      fieldPatches.push({ hint: hint, value: v, reason: reason || '' });
    }

    function take(re, hint, digits, reason) {
      var m = text.match(re);
      if (!m) return;
      var v = parseFloat(String(m[1]).replace(/,/g, ''));
      if (isNaN(v)) return;
      if (digits != null) {
        var p = Math.pow(10, digits);
        v = Math.round(v * p) / p;
      }
      pushPatch(hint, v, reason || '从文件正文识别');
    }

    if (text.length > 20) {
      take(
        /(?:综合)?能耗(?:强度)?[^0-9]{0,16}(-?[0-9]+(?:\.[0-9]+)?)\s*(?:kgce|千克标煤)/i,
        '综合能耗强度',
        1
      );
      take(/(?:吨熟料|吨水泥)?(?:综合)?能耗[^0-9]{0,12}(-?[0-9]+(?:\.[0-9]+)?)/i, '综合能耗强度', 1);
      take(/(?:碳)?排放强度[^0-9]{0,16}(-?[0-9]+(?:\.[0-9]+)?)/i, '企业层级碳排放强度', 4);
      take(/熟料(?:产量)?[^0-9]{0,12}(-?[0-9]+(?:\.[0-9]+)?)\s*万?\s*吨/, '熟料产量', 2);
      take(/水泥(?:产量)?[^0-9]{0,12}(-?[0-9]+(?:\.[0-9]+)?)\s*万?\s*吨/, '水泥产量', 2);
    }

    if (!fieldPatches.length && delta.fieldHints && delta.fieldHints.length) {
      delta.fieldHints.forEach(function (f) {
        pushPatch(f.hint, f.value, '按材料类别模板映射');
      });
    }

    fieldPatches.forEach(function (f) {
      changelog.push(
        '解析得到「' + f.hint + '」= ' + f.value + (f.reason ? '（' + f.reason + '）' : '')
      );
    });
    if (delta.sectionNote) changelog.push('叙述优化点：' + delta.sectionNote);
    if (delta.advice) changelog.push('建议补充点：' + delta.advice);
    if (!changelog.length) {
      changelog.push('已收录《' + fileName + '》，将对报告相关结论做校正');
    }

    return {
      summary:
        (text.length > 40
          ? '已解析约 ' + text.length + ' 字，提取 ' + fieldPatches.length + ' 项指标'
          : this.mockParseSummary(fileName, category)) +
        (fieldPatches.length ? '，待融合写入报告' : ''),
      delta: delta,
      changelog: changelog,
      fieldPatches: fieldPatches,
      extractedTextPreview: text.slice(0, 400),
    };
  },

  addUpload: function (fileMeta) {
    var cat = fileMeta.category || this.classifyUpload(fileMeta.name);
    var parsed =
      fileMeta.parsed ||
      this.parseUploadContent(fileMeta.name, cat, fileMeta.extractedText || '');
    var item = {
      id: 'up-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      name: fileMeta.name,
      size: fileMeta.size || 0,
      type: fileMeta.type || '',
      category: cat,
      summary: parsed.summary || fileMeta.summary || this.mockParseSummary(fileMeta.name, cat),
      delta: parsed.delta || this.mockLearningDelta(fileMeta.name, cat),
      changelog: parsed.changelog || [],
      fieldPatches: parsed.fieldPatches || [],
      extractedTextPreview: parsed.extractedTextPreview || '',
      at: new Date().toISOString(),
    };
    this.uploads.push(item);
    this.learningNotes.push({
      file: item.name,
      title: item.delta.title,
      note:
        (item.changelog && item.changelog.length
          ? item.changelog.join('；')
          : item.delta.sectionNote) || item.summary,
      advice: item.delta.advice,
      intensityAdj: item.delta.intensityAdj,
      source: 'upload',
      changelog: item.changelog.slice(),
    });
    return item;
  },

  removeUpload: function (id) {
    this.uploads = this.uploads.filter(function (u) {
      return u.id !== id;
    });
    this.learningNotes = this.uploads.map(function (u) {
      return {
        file: u.name,
        title: u.delta.title,
        note:
          (u.changelog && u.changelog.length
            ? u.changelog.join('；')
            : u.delta.sectionNote) || u.summary,
        advice: u.delta.advice,
        intensityAdj: u.delta.intensityAdj,
        source: 'upload',
        changelog: (u.changelog || []).slice(),
      };
    });
  },

  /** 将上传材料的 fieldPatches 写入当前企业周期底数（水泥口径，无修订引擎时直写） */
  applyUploadOptimizations: function (uploadItem, periodHint) {
    var period = periodHint || String(new Date().getFullYear());
    var eid = this.activeEnterpriseId;
    var appliedChanges = [];
    var patches = (uploadItem && uploadItem.fieldPatches) || [];
    var pack = this.enterprisePeriods[eid];
    if (!pack) {
      this.enterprisePeriods[eid] = {};
      pack = this.enterprisePeriods[eid];
    }
    if (!pack[period]) {
      pack[period] = Object.assign({}, this.getPeriod(period, eid));
    }
    var profile = pack[period];

    patches.forEach(function (p) {
      var before = null;
      var hint = String(p.hint || '');
      if (/综合能耗|能耗强度/.test(hint)) {
        before = profile.energyPerTon;
        profile.energyPerTon = p.value;
      } else if (/碳排放强度|企业层级/.test(hint)) {
        before = profile.co2Intensity;
        profile.co2Intensity = p.value;
      } else if (/熟料产量/.test(hint)) {
        before = profile.crudeSteelOutput;
        profile.crudeSteelOutput = p.value;
      } else if (/水泥产量|产量/.test(hint)) {
        before = profile.steelOutput;
        profile.steelOutput = p.value;
      } else {
        appliedChanges.push(
          '拟将「' + p.hint + '」改为 ' + p.value + '（依据《' + uploadItem.name + '》，已记入待核对清单）'
        );
        return;
      }
      appliedChanges.push(
        '报告「' +
          p.hint +
          '」：' +
          (before != null ? before + ' → ' : '') +
          p.value +
          '（依据《' +
          uploadItem.name +
          '》' +
          (p.reason ? '，' + p.reason : '') +
          '）'
      );
    });

    if (uploadItem.delta && uploadItem.delta.intensityAdj) {
      var prev = profile.co2Intensity;
      profile.co2Intensity =
        Math.round((Number(profile.co2Intensity) + Number(uploadItem.delta.intensityAdj)) * 1000) /
        1000;
      if (prev !== profile.co2Intensity) {
        appliedChanges.push(
          '报告「企业层级碳排放强度」：' +
            prev +
            ' → ' +
            profile.co2Intensity +
            '（依据《' +
            uploadItem.name +
            '》学习校正）'
        );
      }
    }

    if (uploadItem.delta && uploadItem.delta.sectionNote) {
      appliedChanges.push(
        '报告叙述：' + uploadItem.delta.sectionNote + '（依据《' + uploadItem.name + '》）'
      );
    }
    if (uploadItem.delta && uploadItem.delta.advice) {
      appliedChanges.push(
        '降碳行动建议：补充「' +
          String(uploadItem.delta.advice).slice(0, 60) +
          '…」（依据《' +
          uploadItem.name +
          '》）'
      );
    }

    if (!appliedChanges.length) {
      appliedChanges.push(
        '已将《' +
          uploadItem.name +
          '》写入学习笔记；未识别到可写入数值字段，报告叙述与建议清单已同步更新'
      );
    }

    return { changes: appliedChanges, changelog: appliedChanges };
  },

  /**
   * 报告生成后的对话补充修正（水泥口径简易版；若存在通用修订引擎则委托）
   */
  applyChatRevision: function (text, periodHint) {
    var hint = String(periodHint || new Date().getFullYear());
    var yearMatch = String(text || '').match(/(20\d{2})\s*年?/);
    var period = yearMatch ? yearMatch[1] : hint;
    var t = String(text || '');
    var changes = [];

    if (typeof window !== 'undefined' && window.ReportRevisionEngine) {
      var profile = this.getPeriod(period);
      var modelHint = {
        provinceName: '河北',
        enterpriseIntensity: profile.co2Intensity,
        quotaCombined: {
          name: '水泥熟料生产线',
          intensity: profile.clinkerIntensity != null ? profile.clinkerIntensity : profile.co2Intensity,
          rank: 96,
          provinceAvg: 0.86,
          industryAvg: 0.82,
          industryAdvanced: 0.65,
        },
      };
      var metricResult = window.ReportRevisionEngine.applyChatText(
        this,
        t,
        null,
        profile,
        { modelHint: modelHint }
      );
      var sectionChanges = [];
      if (window.ReportSectionRegistry) {
        var intents = window.ReportSectionRegistry.parseSectionIntents(t);
        sectionChanges = window.ReportSectionRegistry.applyVisibility(this, intents);
      }
      var all = []
        .concat((metricResult && metricResult.changes) || [])
        .concat(sectionChanges || []);
      return {
        period: period,
        changes: all.length ? all : ['已按对话写入补充说明'],
        matches: (metricResult && metricResult.matches) || [],
      };
    }

    var eid = this.activeEnterpriseId;
    var pack = this.enterprisePeriods[eid];
    if (!pack) {
      this.enterprisePeriods[eid] = {};
      pack = this.enterprisePeriods[eid];
    }
    if (!pack[period]) {
      pack[period] = Object.assign({}, this.getPeriod(period, eid));
    }
    var p = pack[period];

    var mInt = t.match(/(?:强度|碳排放强度)[^0-9]{0,12}(-?[0-9]+(?:\.[0-9]+)?)/);
    if (mInt) {
      var beforeInt = p.co2Intensity;
      p.co2Intensity = parseFloat(mInt[1]);
      changes.push('企业层级碳排放强度：' + beforeInt + ' → ' + p.co2Intensity);
    }
    var mEn = t.match(/(?:能耗|综合能耗)[^0-9]{0,12}(-?[0-9]+(?:\.[0-9]+)?)/);
    if (mEn) {
      var beforeEn = p.energyPerTon;
      p.energyPerTon = parseFloat(mEn[1]);
      changes.push('综合能耗强度：' + beforeEn + ' → ' + p.energyPerTon);
    }
    if (!changes.length) {
      changes.push('已按对话写入补充说明');
    }
    return { period: period, changes: changes, matches: [] };
  },
};

if (typeof JinyuOrgEnterprises !== 'undefined') {
  JidongGroupData.initOrgEnterprises();
}
