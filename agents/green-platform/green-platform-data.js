/**
 * 绿色低碳管理平台 · 演示数据包
 * 报告仅基于用户录入的企业名 + 工序数值，以及上传材料的模拟解析结果。
 */
var GreenPlatformData = {
  enterpriseName: '示例绿色制造企业',
  shortName: '绿色制造企业',
  industry: '钢铁',
  scopeNote: '本内核仅针对输入的企业与工序生成分析报告',

  sources: {
    xxxSite: '行业公开信息网站（演示）',
    baidu: '百度公开检索摘要（演示）',
    cloudFacility: '佳华双碳云图 · 生产设施信息',
    cloudPollutant: '佳华双碳云图 · 污染物排放信息',
    cloudProduction: '佳华双碳云图 · 产量信息（污碳模型推演-机器人）',
    cloudEmission: '佳华双碳云图 · 碳排放信息（污碳模型推演-机器人）',
    cloudIntensity: '佳华双碳云图 · 碳排放强度信息（污碳模型推演-机器人）',
    uploads: '用户上传材料（年报 / 五年行动方案 / 其他）',
  },

  /** 默认待分析工序（可被 UI 覆盖） */
  processes: [
    { id: 'p1', name: '烧结工序', intensity: 0.28, unit: 'tCO₂/t', output: 120 },
    { id: 'p2', name: '高炉工序', intensity: 1.12, unit: 'tCO₂/t', output: 95 },
    { id: 'p3', name: '转炉工序', intensity: 0.18, unit: 'tCO₂/t', output: 90 },
  ],

  uploads: [],

  industryBenchmark: {
    total: 232,
    avgIntensity: 1.95,
    best: 1.72,
    median: 1.93,
    distribution: [1.72, 1.76, 1.80, 1.84, 1.88, 1.92, 1.96, 2.00, 2.05, 2.10, 2.15, 2.22],
    avgEnergy: 557,
    bestEnergy: 480,
  },

  setEnterpriseName: function (name) {
    var n = String(name || '').trim();
    if (n) {
      this.enterpriseName = n;
      this.shortName = n;
    }
    return this.enterpriseName;
  },

  setProcesses: function (list) {
    if (Array.isArray(list) && list.length) {
      this.processes = list.map(function (p, i) {
        return {
          id: p.id || 'p' + (i + 1),
          name: String(p.name || '工序' + (i + 1)).trim(),
          intensity: Number(p.intensity) || 0,
          unit: p.unit || 'tCO₂/t',
          output: Number(p.output) || 0,
        };
      });
    }
    return this.processes;
  },

  addUpload: function (fileMeta) {
    this.uploads.push({
      id: 'u' + Date.now() + Math.floor(Math.random() * 1000),
      name: fileMeta.name,
      type: fileMeta.type || 'other',
      size: fileMeta.size || 0,
      category: fileMeta.category || 'misc',
      parsedAt: new Date().toISOString(),
      summary: fileMeta.summary || '已完成结构解析（演示）',
    });
    return this.uploads;
  },

  removeUpload: function (id) {
    this.uploads = this.uploads.filter(function (u) {
      return u.id !== id;
    });
  },

  /** 由工序加权得到企业综合强度画像，字段对齐报告链路 */
  buildProfile: function (periodKey) {
    var procs = this.processes || [];
    var totalOut = 0;
    var totalCo2 = 0;
    procs.forEach(function (p) {
      var out = Number(p.output) || 0;
      var inten = Number(p.intensity) || 0;
      totalOut += out;
      totalCo2 += out * inten;
    });
    var intensity =
      totalOut > 0 ? Math.round((totalCo2 / totalOut) * 1000) / 1000 : procs[0] ? procs[0].intensity : 1.85;
    var year = String(periodKey || new Date().getFullYear()).slice(0, 4);
    var so2 = Math.round(totalOut * 0.7);
    var nox = Math.round(totalOut * 3.2);
    var pm = Math.round(totalOut * 2.4);

    return {
      year: year,
      steelOutput: Math.round(totalOut * 10) / 10,
      steelOutputUnit: '万吨',
      crudeSteelOutput: Math.round(totalOut * 0.96 * 10) / 10,
      co2Emission: Math.round(totalCo2 * 10) / 10,
      co2Unit: '万吨',
      co2Intensity: intensity,
      intensityUnit: 'tCO₂/t',
      energyPerTon: Math.round(480 + intensity * 40),
      energyUnit: 'kgce/t',
      industryEnergyAvg: this.industryBenchmark.avgEnergy,
      carbonQuota: Math.round(totalCo2 * 0.96 * 10) / 10,
      quotaSurplus: Math.round((totalCo2 * 0.96 - totalCo2) * 10) / 10,
      carbonPriceAvg: 82.5,
      carbonPriceUnit: '元/t',
      carbonCost: Math.round((totalCo2 * 82.5) / 10000 * 10) / 10,
      pollutants: { so2: so2, nox: nox, pm: pm, unit: '吨/年' },
      greenPowerRatio: 18.5,
      reductionAchieved: 12.6,
      revenue: Math.round(totalOut * 0.35 * 10) / 10,
      revenueUnit: '亿元',
      facilities: procs.length,
      processCount: procs.length,
      processes: procs.slice(),
      uploads: this.uploads.slice(),
    };
  },

  getPeriod: function (key) {
    return this.buildProfile(key);
  },

  getBenchmarkProfiles: function (periodKey) {
    var self = this.getPeriod(periodKey);
    var bench = this.industryBenchmark;
    var output = self.steelOutput || 1;
    return {
      benchmark: {
        name: '行业标杆（前5%）',
        steelOutput: output,
        co2Emission: Math.round(output * bench.best * 10) / 10,
        co2Intensity: bench.best,
        energyPerTon: bench.bestEnergy,
        carbonQuota: Math.round(output * bench.best * 10) / 10,
        quotaSurplus: Math.round(output * (self.co2Intensity - bench.best) * 10) / 10,
        carbonPriceAvg: self.carbonPriceAvg,
        carbonCost: Math.round((output * bench.best * self.carbonPriceAvg) / 10000 * 10) / 10,
        pollutants: {
          so2: Math.round(self.pollutants.so2 * 0.65),
          nox: Math.round(self.pollutants.nox * 0.68),
          pm: Math.round(self.pollutants.pm * 0.66),
        },
      },
      industryAvg: {
        name: '行业均值',
        steelOutput: output,
        co2Emission: Math.round(output * bench.avgIntensity * 10) / 10,
        co2Intensity: bench.avgIntensity,
        energyPerTon: bench.avgEnergy,
        carbonQuota: Math.round(output * bench.avgIntensity * 10) / 10,
        quotaSurplus: Math.round(output * (self.co2Intensity - bench.avgIntensity) * 10) / 10,
        carbonPriceAvg: self.carbonPriceAvg,
        carbonCost: Math.round((output * bench.avgIntensity * self.carbonPriceAvg) / 10000 * 10) / 10,
        pollutants: {
          so2: Math.round(self.pollutants.so2 * 0.82),
          nox: Math.round(self.pollutants.nox * 0.85),
          pm: Math.round(self.pollutants.pm * 0.84),
        },
      },
    };
  },

  classifyUpload: function (fileName) {
    var n = String(fileName || '').toLowerCase();
    if (/年报|annual|财务报表|报告/.test(n)) return 'annual';
    if (/五年|行动方案|战略|规划|plan/.test(n)) return 'strategy';
    return 'misc';
  },

  mockParseSummary: function (fileName, category) {
    if (category === 'annual') {
      return '已从年报提取产量、能耗与排放披露段落（演示解析）';
    }
    if (category === 'strategy') {
      return '已从五年行动方案提取阶段目标与重点改造清单（演示解析）';
    }
    return '已收录非结构化材料并建立检索片段（演示解析）';
  },
};
