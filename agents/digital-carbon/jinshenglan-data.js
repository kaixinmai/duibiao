/**
 * 数字碳表 · 金盛兰钢铁演示数据包
 * 客户自有数据（本地业务系统）+ 佳华双碳云图 + 互联网公开数据
 *
 * 2020–2023：来自《湖北金盛兰冶金科技有限公司 2020-2023 年度温室气体排放核查报告》
 * （中春环保科技（上海）有限公司，签发日期 2024-06-03，编号 94-02）经核查终值
 * 2024–2026：在 2023 核查底数上的演示外推，供「今年/年度对标」场景使用
 */
var JinshenglanData = {
  enterpriseName: '金盛兰钢铁',
  shortName: '金盛兰',
  legalEntity: '湖北金盛兰冶金科技有限公司',
  creditCode: '91421221068429284K',
  industry: '钢铁',
  industryCode: '3120',
  region: '湖北嘉鱼',
  address: '湖北省咸宁市嘉鱼县高铁岭镇白果树村',
  scopeNote:
    '本内核仅输出当前企业（湖北金盛兰冶金科技有限公司 / 金盛兰钢铁）对标分析报告；2020–2023 底数优先采用温室气体排放核查报告终值',

  /** 历史核查材料元信息 */
  verifyReport: {
    title: '湖北金盛兰冶金科技有限公司 2020-2023 年度温室气体排放核查报告',
    org: '中春环保科技（上海）有限公司',
    issuedAt: '2024-06-03',
    docNo: '94-02',
    basis: '《企业温室气体排放核算与报告填报说明 钢铁生产》',
  },

  sources: {
    bizSystem: '金盛兰业务系统（客户自有数据）',
    localDb: '本地数据库 · 金盛兰钢铁碳排放数据',
    web: '互联网公开数据（企业披露 / 行业资讯）',
    baidu: '百度公开检索摘要（演示）',
    cloudFacility: '佳华双碳云图 · 生产设施信息',
    cloudPollutant: '佳华双碳云图 · 污染物排放信息',
    cloudProduction: '佳华双碳云图 · 产量信息（污碳模型推演-机器人）',
    cloudEmission: '佳华双碳云图 · 碳排放信息（污碳模型推演-机器人）',
    cloudIntensity: '佳华双碳云图 · 碳排放强度信息（污碳模型推演-机器人）',
    uploads: '用户上传材料（节能减碳分析报告 / 环评报告 / 核查报告等）',
    verifyReport: '温室气体排放核查报告终值（2020–2023）',
  },

  industryBenchmark: {
    total: 232,
    avgIntensity: 1.95,
    best: 1.78,
    median: 1.92,
    distribution: [1.78, 1.82, 1.86, 1.9, 1.93, 1.95, 1.98, 2.02, 2.08, 2.15, 2.22, 2.35],
    avgEnergy: 557,
    bestEnergy: 510,
  },

  /**
   * 重点工序能效对标体系（演示）
   * 方法与取值综合参考：
   * - T/CISA 293-2022《钢铁企业重点工序能效标杆对标指南》
   * - T/CISA 416-2024《钢铁企业重点工序能效标杆评估规范》
   * - GB/T 28924-2023《钢铁企业能效指数计算导则》
   * - GB 21256-2025《粗钢生产主要工序单位产品能源消耗限额》（1/2/3级）
   * - 发改产业〔2023〕723号《工业重点领域能效标杆水平和基准水平（2023年版）》
   * 单位：kgce/t（转炉为负值属回收型工序口径）
   */
  energyStdFramework: {
    primaryMethod: 'T/CISA 293-2022 + T/CISA 416-2024',
    eeiMethod: 'GB/T 28924-2023',
    limitStandard: 'GB 21256-2025',
    policyDoc: '发改产业〔2023〕723号',
    standards: [
      {
        code: 'T/CISA 293-2022',
        title: '钢铁企业重点工序能效标杆对标指南',
        role: '对标方法、工序边界、对标调整（原料/煤质/炉龄等）',
        usedIn: '能耗对标 · 重点工序能效标杆对标与限额等级',
      },
      {
        code: 'T/CISA 416-2024',
        title: '钢铁企业重点工序能效标杆评估规范',
        role: '标杆评估、数据验证、能源折标系数（如电力 0.1229 kgce/kWh）',
        usedIn: '能耗对标 · 折标系数与评估口径说明',
      },
      {
        code: 'GB/T 28924-2023',
        title: '钢铁企业能效指数计算导则',
        role: '能效指数 EEI=报告期能耗/基准能耗（含负值工况算法）',
        usedIn: '能耗对标 · 工序能效指数（EEI）列',
      },
      {
        code: 'GB 21256-2025',
        title: '粗钢生产主要工序单位产品能源消耗限额',
        role: '1级标杆 / 2级准入 / 3级限定（强制限额，2026-07-01 起实施）',
        usedIn: '能耗对标 · 1/2/3级限额取值与对标结论',
      },
      {
        code: '发改产业〔2023〕723号',
        title: '工业重点领域能效标杆水平和基准水平（2023年版）',
        role: '炼焦/高炉/转炉等政策层标杆水平与基准水平取值',
        usedIn: '能耗对标 · 炼焦/高炉/转炉标杆与基准水平',
      },
    ],
    note:
      '工序能耗宜先按 T/CISA 293 做客观因素调整，再按 T/CISA 416 完成评估验证；能效指数按 GB/T 28924-2023 计算。本报告演示采用未调整台账能耗，限额等级对照 GB 21256-2025 与发改产业〔2023〕723号。',
    conversionHints: [
      { name: '电力', factor: 0.1229, unit: 'kgce/kWh', source: 'T/CISA 416-2024' },
      { name: '氮气', factor: 0.0169, unit: 'kgce/m³', source: 'T/CISA 416-2024' },
    ],
    processes: [
      {
        key: '焦化',
        name: '炼焦（捣固焦炉）',
        unit: 'kgce/t',
        level1: 110,
        level2: 125,
        level3: 140,
        benchmark: 110,
        baseline: 140,
        source: '发改产业〔2023〕723号 · 捣固焦炉标杆/基准',
        lowerBetter: true,
      },
      {
        key: '烧结',
        name: '烧结',
        unit: 'kgce/t',
        level1: 45,
        level2: 50,
        level3: 55,
        benchmark: 45,
        baseline: 55,
        source: 'GB 21256-2025 1/2/3级（演示沿用既有限额梯度）',
        lowerBetter: true,
      },
      {
        key: '球团',
        name: '球团',
        unit: 'kgce/t',
        level1: 15,
        level2: 24,
        level3: 36,
        benchmark: 15,
        baseline: 36,
        source: 'GB 21256-2025 1/2/3级（演示沿用既有限额梯度）',
        lowerBetter: true,
      },
      {
        key: '高炉炼铁',
        name: '高炉',
        unit: 'kgce/t',
        level1: 361,
        level2: 370,
        level3: 435,
        benchmark: 361,
        baseline: 435,
        source: '发改产业〔2023〕723号标杆/基准；GB 21256 梯度',
        lowerBetter: true,
      },
      {
        key: '转炉炼钢',
        name: '转炉',
        unit: 'kgce/t',
        level1: -30,
        level2: -25,
        level3: -10,
        benchmark: -30,
        baseline: -10,
        source: '发改产业〔2023〕723号 · 回收型工序',
        lowerBetter: true,
        negativeProcess: true,
      },
    ],
  },

  /** 主要生产设施与产能（核查报告） */
  facilitiesProfile: {
    count: 16,
    items: [
      { name: '捣固焦炉', spec: '2×65孔×6.25m', capacityWanT: 120, process: '焦化' },
      { name: '带式烧结机', spec: '360㎡ + 200㎡', capacityWanT: 580, process: '烧结' },
      { name: '链篦机-回转窑球团', spec: '1条', capacityWanT: 120, process: '球团' },
      { name: '高炉', spec: '2×1350m³', capacityWanT: 260, process: '高炉炼铁' },
      { name: '转炉', spec: '2×120t', capacityWanT: 280, process: '转炉炼钢' },
      { name: '精炼/连铸', spec: '配套 2×120t 转炉', capacityWanT: 280, process: '连铸' },
      { name: '轧钢生产线', spec: '高线/棒材 4条', capacityWanT: 270, process: '轧钢' },
    ],
    notes: [
      '2020年12月建成焦化、球团产线，2021年起全年生产；由外购焦炭转为洗精煤自产焦炭',
      '2020–2023年无关闭设施、无停产',
      '无电炉炼钢工序',
    ],
  },

  /** 上传材料学习后的增量修订（演示） */
  learningNotes: [],
  uploads: [],

  periods: {
    '2020': {
      year: '2020',
      source: 'verify-report',
      steelOutput: 308.56,
      steelOutputUnit: '万吨',
      crudeSteelOutput: 311.71,
      co2Emission: 606.26,
      co2Unit: '万吨',
      co2Intensity: 1.9449,
      intensityUnit: 'tCO₂/t',
      energyTotal: 155,
      energyTotalUnit: '万吨标煤',
      energyPerTon: 497,
      energyUnit: 'kgce/t',
      industryEnergyAvg: 557,
      carbonQuota: 600,
      quotaSurplus: -6,
      carbonPriceAvg: 42.5,
      carbonPriceUnit: '元/t',
      carbonCost: 25.8,
      pollutants: { so2: 520, nox: 2100, pm: 2600, unit: '吨/年' },
      greenPowerRatio: 8.5,
      reductionAchieved: 0,
      revenue: 117.01,
      revenueUnit: '亿元',
      facilities: 12,
      scaleRank: 98,
      employees: 4800,
      scrapPerTonSteel: 0.2939,
      scrapConsumption: 91.83,
      scrapUnit: '万吨',
      emissionBreakdown: {
        fossilFuel: 518.43,
        process: 63.53,
        netPower: 29.1,
        embeddedCarbon: 4.8,
        unit: '万吨CO₂',
      },
      processEmissions: {
        焦化: null,
        烧结: 53.39,
        球团: null,
        炼铁: 156.68,
        转炉: -42.33,
        连铸: null,
        轧钢: 85.26,
        石灰: 51.57,
        total: 304.58,
        unit: '万吨CO₂',
      },
      processBench: [
        { name: '烧结', intensity: 0.171, energy: 55, rank: 72, emission: 53.39 },
        { name: '高炉炼铁', intensity: 0.503, energy: 400, rank: 88, emission: 156.68 },
        { name: '转炉炼钢', intensity: -0.136, energy: 20, rank: 45, emission: -42.33 },
        { name: '轧钢', intensity: 0.274, energy: 55, rank: 70, emission: 85.26 },
        { name: '石灰', intensity: 0.165, energy: 40, rank: 80, emission: 51.57 },
      ],
    },
    '2021': {
      year: '2021',
      source: 'verify-report',
      steelOutput: 421.75,
      steelOutputUnit: '万吨',
      crudeSteelOutput: 421.05,
      co2Emission: 771.85,
      co2Unit: '万吨',
      co2Intensity: 1.8332,
      intensityUnit: 'tCO₂/t',
      energyTotal: 190,
      energyTotalUnit: '万吨标煤',
      energyPerTon: 451,
      energyUnit: 'kgce/t',
      industryEnergyAvg: 555,
      carbonQuota: 760,
      quotaSurplus: -12,
      carbonPriceAvg: 48.2,
      carbonPriceUnit: '元/t',
      carbonCost: 37.2,
      pollutants: { so2: 498, nox: 2020, pm: 2480, unit: '吨/年' },
      greenPowerRatio: 10.2,
      reductionAchieved: 12.6,
      revenue: 182.62,
      revenueUnit: '亿元',
      facilities: 16,
      scaleRank: 90,
      employees: 5000,
      scrapPerTonSteel: 0.3417,
      scrapConsumption: 143.89,
      scrapUnit: '万吨',
      emissionBreakdown: {
        fossilFuel: 699.66,
        process: 71.34,
        netPower: 29.19,
        embeddedCarbon: 28.34,
        unit: '万吨CO₂',
      },
      processEmissions: {
        焦化: 69.16,
        烧结: 83.1,
        球团: 8.47,
        炼铁: 210.3,
        转炉: -68.2,
        连铸: 24.7,
        轧钢: 96.89,
        石灰: 73.2,
        total: 497.64,
        unit: '万吨CO₂',
      },
      processBench: [
        { name: '焦化', intensity: 0.164, energy: 120, rank: 55, emission: 69.16 },
        { name: '烧结', intensity: 0.197, energy: 52, rank: 62, emission: 83.1 },
        { name: '球团', intensity: 0.02, energy: 28, rank: 70, emission: 8.47 },
        { name: '高炉炼铁', intensity: 0.499, energy: 390, rank: 75, emission: 210.3 },
        { name: '转炉炼钢', intensity: -0.162, energy: 18, rank: 40, emission: -68.2 },
        { name: '轧钢', intensity: 0.23, energy: 52, rank: 65, emission: 96.89 },
      ],
      notes: [
        '2021年焦化、球团产线全年正常生产',
        '吨粗钢废钢比由 0.2939 升至 0.3417（+16.3%），带动强度下降 5.74%',
      ],
    },
    '2022': {
      year: '2022',
      source: 'verify-report',
      steelOutput: 407.7,
      steelOutputUnit: '万吨',
      crudeSteelOutput: 415.51,
      co2Emission: 747.01,
      co2Unit: '万吨',
      co2Intensity: 1.7978,
      intensityUnit: 'tCO₂/t',
      energyTotal: 202,
      energyTotalUnit: '万吨标煤',
      energyPerTon: 486,
      energyUnit: 'kgce/t',
      industryEnergyAvg: 554,
      carbonQuota: 735,
      quotaSurplus: -12,
      carbonPriceAvg: 58.0,
      carbonPriceUnit: '元/t',
      carbonCost: 43.3,
      pollutants: { so2: 470, nox: 1920, pm: 2360, unit: '吨/年' },
      greenPowerRatio: 12.8,
      reductionAchieved: 18.4,
      revenue: 161.42,
      revenueUnit: '亿元',
      facilities: 16,
      scaleRank: 88,
      employees: 5050,
      scrapPerTonSteel: 0.2556,
      scrapConsumption: 106.21,
      scrapUnit: '万吨',
      emissionBreakdown: {
        fossilFuel: 701.97,
        process: 61.57,
        netPower: 12.54,
        embeddedCarbon: 29.07,
        unit: '万吨CO₂',
      },
      processEmissions: {
        焦化: 59.21,
        烧结: 88.82,
        球团: 9.57,
        炼铁: 227.14,
        转炉: -68.94,
        连铸: 28.65,
        轧钢: 93.35,
        石灰: 64.82,
        total: 502.62,
        unit: '万吨CO₂',
      },
      processBench: [
        { name: '焦化', intensity: 0.143, energy: 116, rank: 48, emission: 59.21 },
        { name: '烧结', intensity: 0.214, energy: 50, rank: 58, emission: 88.82 },
        { name: '球团', intensity: 0.023, energy: 27, rank: 68, emission: 9.57 },
        { name: '高炉炼铁', intensity: 0.547, energy: 385, rank: 70, emission: 227.14 },
        { name: '转炉炼钢', intensity: -0.166, energy: 17, rank: 38, emission: -68.94 },
        { name: '轧钢', intensity: 0.225, energy: 50, rank: 60, emission: 93.35 },
      ],
      notes: [
        '投资约2600万研发高炉精料工艺；投资约272万开展低碳烧结技术研发',
        '强度较2021年再降1.93%',
      ],
    },
    '2023': {
      year: '2023',
      source: 'verify-report',
      steelOutput: 434.23,
      steelOutputUnit: '万吨',
      crudeSteelOutput: 435.2,
      co2Emission: 782.61,
      co2Unit: '万吨',
      co2Intensity: 1.7983,
      intensityUnit: 'tCO₂/t',
      energyTotal: 209,
      energyTotalUnit: '万吨标煤',
      energyPerTon: 480,
      energyUnit: 'kgce/t',
      industryEnergyAvg: 552,
      carbonQuota: 770,
      quotaSurplus: -13,
      carbonPriceAvg: 68.5,
      carbonPriceUnit: '元/t',
      carbonCost: 53.6,
      pollutants: { so2: 455, nox: 1850, pm: 2280, unit: '吨/年' },
      greenPowerRatio: 15.2,
      reductionAchieved: 22.1,
      revenue: 165.66,
      revenueUnit: '亿元',
      facilities: 16,
      scaleRank: 86,
      employees: 5100,
      scrapPerTonSteel: 0.2718,
      scrapConsumption: 118.28,
      scrapUnit: '万吨',
      emissionBreakdown: {
        fossilFuel: 744.03,
        process: 69.22,
        netPower: -0.95,
        embeddedCarbon: 29.68,
        unit: '万吨CO₂',
      },
      processEmissions: {
        焦化: 17.88,
        烧结: 104.83,
        球团: 13.47,
        炼铁: 251.17,
        转炉: -46.27,
        连铸: 16.86,
        轧钢: 92.12,
        石灰: 54.67,
        total: 504.72,
        unit: '万吨CO₂',
      },
      processBench: [
        { name: '焦化', intensity: 0.041, energy: 112, rank: 42, emission: 17.88 },
        { name: '烧结', intensity: 0.241, energy: 48, rank: 55, emission: 104.83 },
        { name: '球团', intensity: 0.031, energy: 26, rank: 66, emission: 13.47 },
        { name: '高炉炼铁', intensity: 0.577, energy: 380, rank: 68, emission: 251.17 },
        { name: '转炉炼钢', intensity: -0.106, energy: 16, rank: 36, emission: -46.27 },
        { name: '轧钢', intensity: 0.212, energy: 48, rank: 58, emission: 92.12 },
      ],
      notes: [
        '2023年净购入电力排放为负（外送/抵扣口径）',
        '粗钢强度约1.80 tCO₂/t，与2022年基本持平（+0.03%）',
      ],
    },
    '2024': {
      year: '2024',
      source: 'demo-extrapolate',
      steelOutput: 438,
      steelOutputUnit: '万吨',
      crudeSteelOutput: 439,
      co2Emission: 778,
      co2Unit: '万吨',
      co2Intensity: 1.772,
      intensityUnit: 'tCO₂/t',
      energyTotal: 208,
      energyTotalUnit: '万吨标煤',
      energyPerTon: 474,
      energyUnit: 'kgce/t',
      industryEnergyAvg: 550,
      carbonQuota: 765,
      quotaSurplus: -13,
      carbonPriceAvg: 78.0,
      carbonPriceUnit: '元/t',
      carbonCost: 60.7,
      pollutants: { so2: 442, nox: 1800, pm: 2200, unit: '吨/年' },
      greenPowerRatio: 17.5,
      reductionAchieved: 26.0,
      revenue: 172,
      revenueUnit: '亿元',
      facilities: 16,
      scaleRank: 84,
      employees: 5120,
      processBench: [
        { name: '焦化', intensity: 0.04, energy: 110, rank: 40, emission: 17.5 },
        { name: '烧结', intensity: 0.235, energy: 47, rank: 52, emission: 103 },
        { name: '球团', intensity: 0.03, energy: 25, rank: 64, emission: 13.2 },
        { name: '高炉炼铁', intensity: 0.565, energy: 375, rank: 64, emission: 248 },
        { name: '转炉炼钢', intensity: -0.1, energy: 16, rank: 35, emission: -44 },
        { name: '轧钢', intensity: 0.208, energy: 47, rank: 55, emission: 91 },
      ],
    },
    '2025': {
      year: '2025',
      source: 'demo-extrapolate',
      steelOutput: 442,
      steelOutputUnit: '万吨',
      crudeSteelOutput: 443,
      co2Emission: 772,
      co2Unit: '万吨',
      co2Intensity: 1.743,
      intensityUnit: 'tCO₂/t',
      energyTotal: 207,
      energyTotalUnit: '万吨标煤',
      energyPerTon: 467,
      energyUnit: 'kgce/t',
      industryEnergyAvg: 548,
      carbonQuota: 760,
      quotaSurplus: -12,
      carbonPriceAvg: 74.63,
      carbonPriceUnit: '元/t',
      carbonCost: 57.6,
      pollutants: { so2: 430, nox: 1740, pm: 2120, unit: '吨/年' },
      greenPowerRatio: 19.6,
      reductionAchieved: 30.5,
      revenue: 178,
      revenueUnit: '亿元',
      facilities: 16,
      scaleRank: 82,
      employees: 5150,
      processBench: [
        { name: '焦化', intensity: 0.039, energy: 108, rank: 38, emission: 17.2 },
        { name: '烧结', intensity: 0.228, energy: 46, rank: 48, emission: 101 },
        { name: '球团', intensity: 0.029, energy: 25, rank: 62, emission: 12.8 },
        { name: '高炉炼铁', intensity: 0.552, energy: 370, rank: 60, emission: 244 },
        { name: '转炉炼钢', intensity: -0.098, energy: 15, rank: 34, emission: -43 },
        { name: '轧钢', intensity: 0.204, energy: 46, rank: 52, emission: 90 },
      ],
    },
    '2026': {
      year: '2026',
      source: 'demo-extrapolate',
      steelOutput: 445,
      steelOutputUnit: '万吨',
      crudeSteelOutput: 446,
      co2Emission: 768,
      co2Unit: '万吨',
      co2Intensity: 1.722,
      intensityUnit: 'tCO₂/t',
      energyTotal: 206,
      energyTotalUnit: '万吨标煤',
      energyPerTon: 462,
      energyUnit: 'kgce/t',
      industryEnergyAvg: 545,
      carbonQuota: 755,
      quotaSurplus: -13,
      carbonPriceAvg: 82.5,
      carbonPriceUnit: '元/t',
      carbonCost: 63.4,
      pollutants: { so2: 418, nox: 1680, pm: 2050, unit: '吨/年' },
      greenPowerRatio: 22.4,
      reductionAchieved: 34.8,
      revenue: 182,
      revenueUnit: '亿元',
      facilities: 16,
      scaleRank: 80,
      employees: 5180,
      processBench: [
        { name: '焦化', intensity: 0.038, energy: 106, rank: 35, emission: 16.9 },
        { name: '烧结', intensity: 0.222, energy: 45, rank: 45, emission: 99 },
        { name: '球团', intensity: 0.028, energy: 24, rank: 60, emission: 12.5 },
        { name: '高炉炼铁', intensity: 0.54, energy: 365, rank: 56, emission: 241 },
        { name: '转炉炼钢', intensity: -0.095, energy: 15, rank: 32, emission: -42 },
        { name: '轧钢', intensity: 0.2, energy: 45, rank: 50, emission: 89 },
      ],
    },
    '2026-06': {
      year: '2026',
      month: '06',
      source: 'demo-extrapolate',
      steelOutput: 37.1,
      steelOutputUnit: '万吨',
      crudeSteelOutput: 37.2,
      co2Emission: 64.0,
      co2Unit: '万吨',
      co2Intensity: 1.722,
      intensityUnit: 'tCO₂/t',
      energyPerTon: 461,
      energyUnit: 'kgce/t',
      industryEnergyAvg: 545,
      carbonQuota: 63.0,
      quotaSurplus: -1.0,
      carbonPriceAvg: 83.1,
      carbonPriceUnit: '元/t',
      carbonCost: 5.3,
      pollutants: { so2: 35, nox: 140, pm: 171, unit: '吨' },
      greenPowerRatio: 23.0,
      reductionAchieved: 2.9,
      revenue: 15.2,
      revenueUnit: '亿元',
      facilities: 16,
      scaleRank: 80,
      employees: 5180,
      processBench: [
        { name: '焦化', intensity: 0.038, energy: 105, rank: 34, emission: 1.4 },
        { name: '烧结', intensity: 0.221, energy: 45, rank: 44, emission: 8.2 },
        { name: '球团', intensity: 0.028, energy: 24, rank: 59, emission: 1.0 },
        { name: '高炉炼铁', intensity: 0.538, energy: 364, rank: 55, emission: 20.0 },
        { name: '转炉炼钢', intensity: -0.094, energy: 15, rank: 31, emission: -3.5 },
        { name: '轧钢', intensity: 0.199, energy: 45, rank: 49, emission: 7.4 },
      ],
    },
  },

  getPeriod: function (key) {
    var k = String(key || '2026');
    if (this.periods[k]) return this.periods[k];
    var year = k.slice(0, 4);
    if (this.periods[year]) return this.periods[year];
    return this.periods['2026'];
  },

  getBenchmarkProfiles: function (key) {
    var self = this.getPeriod(key);
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
        name: '行业均值（全国长流程钢铁）',
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
      advanced: {
        steelOutput: output,
        co2Intensity: bestInt,
        energyPerTon: bench.bestEnergy,
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
      return '已提取核查终值：粗钢产量、企业层级排放、碳排放强度、工序排放与综合能耗（演示解析）';
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
          '结合环评批复边界，建议将转炉二次除尘与烧结脱硫脱硝联锁纳入工序对标短板清单，并同步更新排污许可台账口径。',
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
          '已对齐 2020–2023 核查终值（粗钢强度约 1.80 tCO₂/t、综合能耗约 480 kgce/t），后续对标以核查口径为准，并突出炼铁工序排放贡献与废钢提比对强度改善的作用。',
        sectionNote:
          '已根据上传《温室气体排放核查报告》写入产量、排放、强度、工序排放与设施产能等历史底数。',
        fieldHints: [
          { hint: '企业层级碳排放强度', value: 1.7983 },
          { hint: '综合能耗强度', value: 480 },
        ],
      };
    }
    if (category === 'energy') {
      return {
        title: '节能减碳措施吸收',
        intensityAdj: -0.02,
        advice:
          '已吸收节能减碳分析报告中的高炉喷煤优化与余热回收建议，将焦化、烧结工序能效对标目标上调一档，并写入降碳行动优先级。',
        sectionNote:
          '已根据上传《节能减碳分析报告》更新能耗对标与减排潜力拆分权重，强化高炉—烧结联动技改路径。',
        fieldHints: [{ hint: '综合能耗强度', value: 465 }],
      };
    }
    return {
      title: '材料学习校正',
      intensityAdj: -0.005,
      advice: '已将上传材料中的关键披露纳入报告修订意见。',
      sectionNote: '已根据上传材料对报告部分结论进行演示性校正。',
      fieldHints: [],
    };
  },

  /**
   * 解析上传文件文本（演示：优先抽取文中数值；无有效文本则回退类别模板）
   * @returns {{ summary, delta, changelog: string[], fieldPatches: [{hint,value}], extractedTextPreview }}
   */
  parseUploadContent: function (fileName, category, extractedText) {
    var text = String(extractedText || '');
    var delta = this.mockLearningDelta(fileName, category);
    var changelog = [];
    var fieldPatches = (delta.fieldHints || []).slice();

    function take(re, hint, digits) {
      var m = text.match(re);
      if (!m) return;
      var v = parseFloat(String(m[1]).replace(/,/g, ''));
      if (isNaN(v)) return;
      if (digits != null) {
        var p = Math.pow(10, digits);
        v = Math.round(v * p) / p;
      }
      fieldPatches = fieldPatches.filter(function (f) {
        return f.hint !== hint;
      });
      fieldPatches.push({ hint: hint, value: v });
      changelog.push('从《' + fileName + '》识别「' + hint + '」= ' + v);
    }

    if (text.length > 20) {
      take(
        /(?:综合)?能耗(?:强度)?[^0-9]{0,12}(-?[0-9]+(?:\.[0-9]+)?)\s*kgce/i,
        '综合能耗强度',
        1
      );
      take(
        /(?:碳)?排放强度[^0-9]{0,12}(-?[0-9]+(?:\.[0-9]+)?)\s*t?\s*CO/i,
        '企业层级碳排放强度',
        4
      );
      take(/粗钢(?:产量)?[^0-9]{0,12}(-?[0-9]+(?:\.[0-9]+)?)\s*万?\s*吨/, '粗钢产量', 2);
      take(/废钢比[^0-9]{0,8}(-?[0-9]+(?:\.[0-9]+)?)/, '废钢比', 4);
      take(
        /烧结[^。；\n]{0,20}炼铁[^。；\n]{0,20}(-?[0-9]+(?:\.[0-9]+)?)/,
        '烧结工序+炼铁工序企业数据',
        3
      );
    }

    if (!changelog.length) {
      (delta.fieldHints || []).forEach(function (f) {
        changelog.push(
          '依据《' + fileName + '》类别模板，拟将「' + f.hint + '」优化为 ' + f.value
        );
      });
      changelog.push('依据《' + fileName + '》：' + (delta.sectionNote || delta.advice || ''));
    } else {
      changelog.push('依据《' + fileName + '》文本解析完成，已映射到报告可修正指标');
    }

    var summary =
      (text.length > 40
        ? '已解析文件文本约 ' + text.length + ' 字，并提取关键指标'
        : this.mockParseSummary(fileName, category)) +
      (changelog.length ? '；拟优化 ' + changelog.length + ' 项' : '');

    return {
      summary: summary,
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

  /**
   * 将上传材料的 fieldPatches 应用到报告修正引擎
   * @returns {{ changes: string[], changelog: string[] }}
   */
  applyUploadOptimizations: function (uploadItem, periodHint) {
    var self = this;
    var changes = [];
    var changelog = (uploadItem && uploadItem.changelog ? uploadItem.changelog.slice() : []) || [];
    var patches = (uploadItem && uploadItem.fieldPatches) || [];
    if (!patches.length) {
      return { changes: changelog.slice(), changelog: changelog };
    }
    if (typeof window !== 'undefined' && window.ReportRevisionEngine) {
      patches.forEach(function (p) {
        var synthetic = String(p.hint || '') + '是' + p.value;
        var r = window.ReportRevisionEngine.applyChatText(
          self,
          synthetic,
          null,
          self.getPeriod(periodHint),
          { silent: true }
        );
        if (r && r.changes) changes = changes.concat(r.changes);
      });
    }
    return { changes: changes, changelog: changelog.concat(changes) };
  },

  /**
   * 报告生成后的对话补充修正：委托通用自我修正引擎 + 章节显隐
   */
  applyChatRevision: function (text, periodHint) {
    var hint = String(periodHint || new Date().getFullYear());
    var yearMatch = String(text || '').match(/(20\d{2})\s*年?/);
    var period = yearMatch ? yearMatch[1] : hint;
    var profile = this.getPeriod(period);
    var modelHint = {
      provinceName: /河北/.test(String(this.region || '') + String(this.legalEntity || ''))
        ? '河北'
        : '湖北',
      enterpriseIntensity: profile.co2Intensity,
      quotaCombined: {
        name: '烧结工序+炼铁工序',
        intensity: profile.quotaCombinedIntensity != null ? profile.quotaCombinedIntensity : 1.658,
        rank: 86,
        provinceAvg: 1.812,
        industryAvg: 1.745,
        industryAdvanced: 1.52,
      },
      processRanks: [
        { name: '焦化工序' },
        { name: '球团工序' },
        { name: '烧结工序' },
        { name: '高炉炼铁' },
        { name: '转炉炼钢' },
        { name: '辅助生产工序' },
      ],
    };

    var changes = [];
    var sectionChanges = [];
    if (typeof window !== 'undefined' && window.ReportSectionRegistry) {
      var intents = window.ReportSectionRegistry.parseSectionIntents(text);
      sectionChanges = window.ReportSectionRegistry.applyVisibility(this, intents);
      changes = changes.concat(sectionChanges);
    }

    var metricResult = { changes: [], matches: [], note: '' };
    if (typeof window !== 'undefined' && window.ReportRevisionEngine) {
      metricResult = window.ReportRevisionEngine.applyChatText(
        this,
        text,
        modelHint,
        profile,
        { silent: true }
      );
      if (metricResult && metricResult.changes) {
        var metricChanges = metricResult.changes.filter(function (c) {
          if (sectionChanges.length && /已记录补充说明|待核对定位/.test(c)) return false;
          return true;
        });
        changes = changes.concat(metricChanges);
      }
    }

    if (!changes.length) {
      changes.push('已记录补充说明，并据此修订报告相关表述');
    }

    var note = '根据对话自我修正：' + changes.join('；') + '。';
    if (!this.learningNotes) this.learningNotes = [];
    this.learningNotes.push({
      file: '对话补充',
      title: '对话自我修正',
      note: note,
      advice: '已按用户指出的正确数据 / 章节要求完成报告自我修正。',
      intensityAdj: 0,
      source: 'chat',
      changelog: changes.slice(),
    });

    return {
      period: String(period).slice(0, 4),
      changes: changes,
      note: note,
      matches: (metricResult && metricResult.matches) || [],
      sectionChanges: sectionChanges,
    };
  },

  totalIntensityAdj: function () {
    return (this.learningNotes || []).reduce(function (sum, n) {
      return sum + (n.intensityAdj || 0);
    }, 0);
  },

  buildLearningSummary: function () {
    if (!this.learningNotes.length) return '';
    return this.learningNotes
      .map(function (n, i) {
        return i + 1 + '.【' + n.title + '】' + n.note;
      })
      .join('\n');
  },
};
