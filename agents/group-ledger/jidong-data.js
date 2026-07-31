/**
 * 集团碳账本 · 冀东集团演示数据包
 * 仅服务 group-ledger 场景；字段形状对齐 HenanSteelData，便于复用报告/图表链路。
 * steelOutput 在此口径下表示水泥（熟料折算）产量。
 */
var JidongGroupData = {
  groupName: '冀东集团',
  scopeNote: '本内核仅输出冀东集团下属企业分析报告',
  industry: '水泥',
  enterpriseName: '冀东水泥集团',
  shortName: '冀东水泥',

  sources: {
    xxxSite: '行业公开信息网站（演示）',
    baidu: '百度公开检索摘要（演示）',
    cloudFacility: '佳华双碳云图 · 生产设施信息',
    cloudPollutant: '佳华双碳云图 · 污染物排放信息',
    cloudProduction: '佳华双碳云图 · 产量信息（污碳模型推演-机器人）',
    cloudEmission: '佳华双碳云图 · 碳排放信息（污碳模型推演-机器人）',
    cloudIntensity: '佳华双碳云图 · 碳排放强度信息（污碳模型推演-机器人）',
    localDb: '本地数据库 · 冀东集团碳排放数据',
  },

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
        steelOutput: 2860,
        steelOutputUnit: '万吨',
        crudeSteelOutput: 2680,
        co2Emission: 2288,
        co2Unit: '万吨',
        co2Intensity: 0.80,
        intensityUnit: 'tCO₂/t',
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
      },
      '2025': {
        year: '2025',
        steelOutput: 2740,
        steelOutputUnit: '万吨',
        crudeSteelOutput: 2560,
        co2Emission: 2140,
        co2Unit: '万吨',
        co2Intensity: 0.78,
        intensityUnit: 'tCO₂/t',
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
      },
      '2026': {
        year: '2026',
        steelOutput: 2680,
        steelOutputUnit: '万吨',
        crudeSteelOutput: 2500,
        co2Emission: 2064,
        co2Unit: '万吨',
        co2Intensity: 0.77,
        intensityUnit: 'tCO₂/t',
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
      },
      '2026-06': {
        year: '2026',
        month: '06',
        steelOutput: 228,
        steelOutputUnit: '万吨',
        crudeSteelOutput: 212,
        co2Emission: 174,
        co2Unit: '万吨',
        co2Intensity: 0.76,
        intensityUnit: 'tCO₂/t',
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
      },
    },
    'jd-beishui-plant': {
      '2026': {
        year: '2026',
        steelOutput: 420,
        steelOutputUnit: '万吨',
        crudeSteelOutput: 398,
        co2Emission: 336,
        co2Unit: '万吨',
        co2Intensity: 0.80,
        intensityUnit: 'tCO₂/t',
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
      },
      '2026-06': {
        year: '2026',
        month: '06',
        steelOutput: 36.5,
        steelOutputUnit: '万吨',
        crudeSteelOutput: 34.2,
        co2Emission: 29.1,
        co2Unit: '万吨',
        co2Intensity: 0.80,
        intensityUnit: 'tCO₂/t',
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
      },
    },
    'jd-beishui-material': {
      '2026': {
        year: '2026',
        steelOutput: 186,
        steelOutputUnit: '万吨',
        crudeSteelOutput: 170,
        co2Emission: 156,
        co2Unit: '万吨',
        co2Intensity: 0.84,
        intensityUnit: 'tCO₂/t',
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
      },
      '2026-06': {
        year: '2026',
        month: '06',
        steelOutput: 15.8,
        steelOutputUnit: '万吨',
        crudeSteelOutput: 14.5,
        co2Emission: 13.3,
        co2Unit: '万吨',
        co2Intensity: 0.84,
        intensityUnit: 'tCO₂/t',
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
      },
    },
    'jd-beishui-mill': {
      '2026': {
        year: '2026',
        steelOutput: 96,
        steelOutputUnit: '万吨',
        crudeSteelOutput: 0,
        co2Emission: 42,
        co2Unit: '万吨',
        co2Intensity: 0.44,
        intensityUnit: 'tCO₂/t',
        energyPerTon: 38,
        energyUnit: 'kgce/t',
        industryEnergyAvg: 106,
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
      },
      '2026-06': {
        year: '2026',
        month: '06',
        steelOutput: 8.2,
        steelOutputUnit: '万吨',
        crudeSteelOutput: 0,
        co2Emission: 3.5,
        co2Unit: '万吨',
        co2Intensity: 0.43,
        intensityUnit: 'tCO₂/t',
        energyPerTon: 37,
        energyUnit: 'kgce/t',
        industryEnergyAvg: 106,
        carbonQuota: 3.3,
        quotaSurplus: -0.2,
        carbonPriceAvg: 83.1,
        carbonPriceUnit: '元/t',
        carbonCost: 0.03,
        pollutants: { so2: 1.5, nox: 8, pm: 10, unit: '吨' },
        greenPowerRatio: 26.5,
        facilities: 1,
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

  searchEnterprises: function (keyword) {
    var q = String(keyword || '').trim();
    if (!q) return this.enterprises.slice();
    return this.enterprises.filter(function (ent) {
      if (ent.name.indexOf(q) >= 0) return true;
      return (ent.keywords || []).some(function (k) {
        return k.indexOf(q) >= 0 || q.indexOf(k) >= 0;
      });
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
    var pack = this.enterprisePeriods[eid] || this.enterprisePeriods['jd-group'];
    if (pack[key]) return pack[key];
    if (key && pack[String(key).slice(0, 4)]) return pack[String(key).slice(0, 4)];
    return pack['2026'] || pack['2026-06'] || pack['2024'];
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
};
