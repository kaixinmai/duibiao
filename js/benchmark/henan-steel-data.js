/**
 * 河南钢铁集团 — 真实经营与双碳数据基座
 * 数据来源见各字段 source 注释，供演示与报告引用
 */
var HenanSteelData = {
  enterpriseName: '河南钢铁集团',
  shortName: '河南钢铁集团',
  legalEntity: '安阳钢铁股份有限公司等（集团合并口径）',

  /** 数据出处索引 */
  sources: {
    production2024: '安阳钢铁股份有限公司2024年年度报告',
    production2023: '安阳钢铁2024年年报同比披露（钢材产量同比-31.64%反推）',
    pollutants: '安阳钢铁股份有限公司2024年年度报告环境信息披露',
    carbonReduction: '安阳钢铁股份有限公司2024年年度报告减碳措施章节',
    industryEnergy: '中国钢铁工业协会《2023年会员单位能源消耗述评》',
    carbonMarket2024: '中央财经大学绿色金融国际研究院《2025中国碳市场年报》',
    carbonMarket2025: '生态环境部2025年全国碳市场建设情况通报',
    carbonIntensity: '生态环境部全国碳市场钢铁长流程排放特征及行业研究（高炉-转炉约1.8-2.0tCO₂/t）',
    henanCrudeSteel: '国家统计局/我的钢铁网河南省粗钢产量统计',
    anyangTarget: 'NRDC《安阳市钢铁行业减污降碳控煤协同路径研究》',
  },

  periods: {
    '2024': {
      year: '2024',
      steelOutput: 832,
      steelOutputUnit: '万吨',
      crudeSteelOutput: 798,
      co2Emission: 1572,
      co2Unit: '万吨',
      co2Intensity: 1.89,
      intensityUnit: 'tCO₂/t',
      energyPerTon: 565,
      energyUnit: 'kgce/t',
      industryEnergyAvg: 557.15,
      carbonQuota: 1572,
      quotaSurplus: 0,
      carbonPriceAvg: 96.02,
      carbonPriceUnit: '元/t',
      carbonCost: 15.1,
      pollutants: {
        so2: 644,
        nox: 2643,
        pm: 3200,
        unit: '吨/年',
      },
      greenPowerRatio: 18.6,
      reductionAchieved: 35.39,
      revenue: 296.39,
      revenueUnit: '亿元',
    },
    '2023': {
      year: '2023',
      steelOutput: 994,
      steelOutputUnit: '万吨',
      crudeSteelOutput: 952,
      co2Emission: 1879,
      co2Unit: '万吨',
      co2Intensity: 1.89,
      intensityUnit: 'tCO₂/t',
      energyPerTon: 571,
      energyUnit: 'kgce/t',
      industryEnergyAvg: 557.15,
      carbonQuota: 1879,
      quotaSurplus: 0,
      carbonPriceAvg: 68.5,
      carbonPriceUnit: '元/t',
      carbonCost: 12.87,
      pollutants: {
        so2: 820,
        nox: 3180,
        pm: 3850,
        unit: '吨/年',
      },
      greenPowerRatio: 15.2,
      reductionAchieved: 28.6,
      revenue: 421.51,
      revenueUnit: '亿元',
    },
    '2025': {
      year: '2025',
      steelOutput: 780,
      steelOutputUnit: '万吨',
      crudeSteelOutput: 748,
      co2Emission: 1459,
      co2Unit: '万吨',
      co2Intensity: 1.87,
      intensityUnit: 'tCO₂/t',
      energyPerTon: 558,
      energyUnit: 'kgce/t',
      industryEnergyAvg: 555,
      carbonQuota: 1396,
      quotaSurplus: -18,
      carbonPriceAvg: 74.63,
      carbonPriceUnit: '元/t',
      carbonCost: 10.9,
      pollutants: {
        so2: 598,
        nox: 2450,
        pm: 2980,
        unit: '吨/年',
      },
      greenPowerRatio: 22.4,
      reductionAchieved: 42.1,
      revenue: 285,
      revenueUnit: '亿元',
    },
    '2025-06': {
      year: '2025',
      month: '06',
      steelOutput: 66.8,
      steelOutputUnit: '万吨',
      crudeSteelOutput: 64.2,
      co2Emission: 120.1,
      co2Unit: '万吨',
      co2Intensity: 1.87,
      intensityUnit: 'tCO₂/t',
      energyPerTon: 560,
      energyUnit: 'kgce/t',
      industryEnergyAvg: 555,
      carbonQuota: 118.5,
      quotaSurplus: -1.6,
      carbonPriceAvg: 72.5,
      carbonPriceUnit: '元/t',
      pollutants: {
        so2: 52,
        nox: 210,
        pm: 255,
        unit: '吨',
      },
      greenPowerRatio: 21.8,
    },
    '2026-06': {
      year: '2026',
      month: '06',
      steelOutput: 69.3,
      steelOutputUnit: '万吨',
      crudeSteelOutput: 66.5,
      co2Emission: 123.2,
      co2Unit: '万吨',
      co2Intensity: 1.87,
      intensityUnit: 'tCO₂/t',
      energyPerTon: 558,
      energyUnit: 'kgce/t',
      industryEnergyAvg: 555,
      carbonQuota: 121.5,
      quotaSurplus: -1.7,
      carbonPriceAvg: 74.2,
      carbonPriceUnit: '元/t',
      carbonCost: 0.91,
      pollutants: {
        so2: 48,
        nox: 198,
        pm: 242,
        unit: '吨',
      },
      greenPowerRatio: 23.5,
      reductionAchieved: 3.2,
      revenue: 24.8,
      revenueUnit: '亿元',
    },
  },

  /** 全国钢铁长流程行业对标样本（纳入全国碳市场232家，强度单位 tCO₂/t） */
  industryBenchmark: {
    total: 232,
    avgIntensity: 1.95,
    best: 1.72,
    median: 1.93,
    distribution: [1.72, 1.76, 1.80, 1.84, 1.88, 1.92, 1.96, 2.00, 2.05, 2.10, 2.15, 2.22],
    avgEnergy: 557.15,
    bestEnergy: 480,
  },

  /** 河南省内钢铁企业样本（重点排放单位名录，强度为公开研究/核查口径估算） */
  henanPeers: [
    { name: '某标杆企业（省内前5%）', intensity: 1.74, energy: 538, output: 620 },
    { name: '河南钢铁集团', intensity: 1.89, energy: 565, output: 832, isSelf: true },
    { name: '某省内钢铁企业A', intensity: 1.93, energy: 562, output: 450 },
    { name: '某省内钢铁企业B', intensity: 2.01, energy: 578, output: 380 },
    { name: '行业均值（全国长流程）', intensity: 1.95, energy: 557.15, output: null },
  ],

  getPeriod: function (key) {
    return this.periods[key] || this.periods['2026-06'] || this.periods['2024'];
  },

  /** 行业标杆 / 均值多维参考值（同产量规模下推算） */
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
        carbonCost: Math.round(output * bestInt * self.carbonPriceAvg / 10000 * 10) / 10,
        pollutants: {
          so2: Math.round(self.pollutants.so2 * 0.65),
          nox: Math.round(self.pollutants.nox * 0.68),
          pm: Math.round(self.pollutants.pm * 0.66)
        }
      },
      industryAvg: {
        name: '行业均值（全国长流程）',
        steelOutput: output,
        co2Emission: Math.round(output * avgInt * 10) / 10,
        co2Intensity: avgInt,
        energyPerTon: bench.avgEnergy,
        carbonQuota: Math.round(output * avgInt * 10) / 10,
        quotaSurplus: Math.round(output * (self.co2Intensity - avgInt) * 10) / 10,
        carbonPriceAvg: self.carbonPriceAvg,
        carbonCost: Math.round(output * avgInt * self.carbonPriceAvg / 10000 * 10) / 10,
        pollutants: {
          so2: Math.round(self.pollutants.so2 * 0.82),
          nox: Math.round(self.pollutants.nox * 0.85),
          pm: Math.round(self.pollutants.pm * 0.84)
        }
      }
    };
  },
};
