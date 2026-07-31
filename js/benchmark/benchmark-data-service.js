/**
 * 碳对标智能体 - 企业数据服务
 * 演示主体：河南钢铁集团（安阳钢铁等合并口径）
 * 数据基于公开年报、生态环境部碳市场文件及行业统计
 */
var BenchmarkDataService = {
  /** 对外展示标签 */
  DISPLAY: {
    SELF: '河南钢铁集团',
    INDUSTRY_AVG: '行业均值（全国长流程）',
    BENCHMARK: '行业标杆（前5%）',
    COMPARE_TARGET: '省内标杆企业',
    PEER_MASK: '某钢铁企业'
  },

  /**
   * 获取脱敏后的对标对象展示名
   * @param {number} [index] 序号 0-based
   * @param {string} [role] benchmark | peer | rank | compare | neighbor
   */
  getPeerDisplayName: function (index, role) {
    var D = this.DISPLAY;
    if (role === 'compare') return D.COMPARE_TARGET;
    if (role === 'benchmark' || index === 0) return D.BENCHMARK;
    if (role === 'rank') {
      return '某企业（第 ' + (index + 1) + ' 位）';
    }
    if (role === 'neighbor') {
      return D.PEER_MASK + '（邻近位次）';
    }
    var letter = String.fromCharCode(65 + (index || 0));
    return D.PEER_MASK + ' ' + letter;
  },

  /** 将可能的历史真实名称统一转为脱敏名 */
  sanitizeDisplayName: function (name, index, role) {
    if (!name || name === this.DISPLAY.SELF) return this.DISPLAY.SELF;
    if (name === this.DISPLAY.INDUSTRY_AVG) return this.DISPLAY.INDUSTRY_AVG;
    if (/^某企业|^某标杆|^某对标|^\*\*\*\*\*企业/.test(name)) return name;
    return this.getPeerDisplayName(index, role || 'peer');
  },

  /** 对比报告 / 摘要中使用的统一对标称谓 */
  getCompareTargetLabel: function () {
    return this.DISPLAY.COMPARE_TARGET;
  },

  /** @deprecated 内部仅保留行业样本数量 */
  PEER_SLOT_COUNT: 5,

  /** 行业排名样本池（钢铁采用全国碳市场232家长流程企业统计口径） */
  INDUSTRY_POOL: {
    '钢铁': (typeof HenanSteelData !== 'undefined')
      ? Object.assign({ unit: 'tCO₂/t' }, HenanSteelData.industryBenchmark)
      : { total: 232, avgIntensity: 1.95, best: 1.72, distribution: [1.72, 1.76, 1.80, 1.84, 1.88, 1.92, 1.96, 2.00, 2.05, 2.10] },
    '电力': { total: 420, avgIntensity: 0.62, best: 0.48, distribution: [0.48, 0.51, 0.54, 0.57, 0.60, 0.63, 0.66, 0.69, 0.72, 0.76] },
    '化工': { total: 390, avgIntensity: 1.88, best: 1.55, distribution: [1.55, 1.60, 1.65, 1.70, 1.76, 1.82, 1.88, 1.94, 2.00, 2.08] },
    '水泥': { total: 310, avgIntensity: 0.82, best: 0.65, distribution: [0.65, 0.68, 0.71, 0.74, 0.77, 0.80, 0.83, 0.86, 0.89, 0.93] },
    '有色': { total: 260, avgIntensity: 1.45, best: 1.20, distribution: [1.20, 1.25, 1.30, 1.35, 1.40, 1.46, 1.52, 1.58, 1.64, 1.70] },
    '建材': { total: 280, avgIntensity: 1.12, best: 0.95, distribution: [0.95, 0.98, 1.02, 1.05, 1.08, 1.12, 1.16, 1.20, 1.24, 1.28] },
    '造纸': { total: 190, avgIntensity: 1.05, best: 0.88, distribution: [0.88, 0.91, 0.94, 0.97, 1.00, 1.04, 1.08, 1.12, 1.16, 1.20] }
  },

  /** 行业样本槽位数（脱敏，不含真实企业名称） */
  _peerSlotCount: function (industry) {
    var pool = this.INDUSTRY_POOL[industry] || this.INDUSTRY_POOL['钢铁'];
    return Math.min(this.PEER_SLOT_COUNT, pool.distribution.length);
  },

  getPeriodKey: function (slots) {
    if (slots.timeDimension === 'monthly' && slots.timeValue) return slots.timeValue;
    if (slots.timeValue) return slots.timeValue;
    return '2024';
  },

  /** 获取河南钢铁集团指定周期经营与双碳画像 */
  getEnterpriseProfile: function (slots) {
    if (typeof HenanSteelData === 'undefined') return null;
    var key = this.getPeriodKey(slots || {});
    return HenanSteelData.getPeriod(key);
  },

  /** 从企业数据平台拉取河南钢铁集团数据（演示免登录） */
  fetchFromSystem: function (slots) {
    return this.fetchEnterpriseData(slots);
  },

  fetchEnterpriseData: function (slots) {
    var profile = this.getEnterpriseProfile(slots);
    if (!profile) return null;
    var key = this.getPeriodKey(slots);
    var energyGap = profile.energyPerTon - profile.industryEnergyAvg;
    return {
      source: 'auto',
      intensity: profile.co2Intensity,
      total: profile.co2Emission,
      unit: profile.intensityUnit,
      energyPerTon: profile.energyPerTon,
      energyEfficiency: Math.max(68, Math.min(92, Math.round(88 - energyGap * 0.35))),
      period: key,
      profile: profile
    };
  },

  parseManualIntensity: function (text) {
    var t = String(text).trim();
    var m = t.match(/([\d.]+)\s*(?:tCO|tco|吨标煤|t\/|吨)/i) || t.match(/(?:强度|数值|为|是)\s*([\d.]+)/) || t.match(/^([\d.]+)$/);
    return m ? parseFloat(m[1]) : null;
  },

  /** 无系统数据时回退：钢铁使用河南钢铁集团真实强度，其他行业用行业分位估算 */
  getDemoIntensity: function (industry, slots) {
    if (industry === '钢铁' && typeof HenanSteelData !== 'undefined') {
      var key = slots ? this.getPeriodKey(slots) : '2024';
      return HenanSteelData.getPeriod(key).co2Intensity;
    }
    var pool = this.INDUSTRY_POOL[industry] || this.INDUSTRY_POOL['钢铁'];
    if (industry === '水泥') return 0.717;
    return Math.round((pool.best + (pool.avgIntensity - pool.best) * 0.39) * 1000) / 1000;
  },

  /** 根据排名百分位映射碳效评级 */
  gradeFromPercentile: function (percentile) {
    if (percentile >= 95) return 'A';
    if (percentile >= 80) return 'B+';
    if (percentile >= 50) return 'B';
    return 'C';
  },

  computeRanking: function (intensity, industry) {
    var pool = this.INDUSTRY_POOL[industry] || this.INDUSTRY_POOL['钢铁'];
    var total = pool.total;
    var best = pool.best;
    var avg = pool.avgIntensity;
    var worst = pool.distribution[pool.distribution.length - 1] * 1.06;
    var rank;

    if (intensity <= best) {
      rank = 1;
    } else if (intensity <= avg) {
      var ratioLow = (intensity - best) / (avg - best + 0.001);
      rank = Math.round(1 + ratioLow * (total * 0.5 - 1));
    } else {
      var ratioHigh = (intensity - avg) / (worst - avg + 0.001);
      rank = Math.round(total * 0.5 + ratioHigh * (total * 0.5));
    }
    rank = Math.max(1, Math.min(total, rank));

    var percentile = Math.min(99, Math.max(1, Math.round((1 - rank / total) * 100)));
    var grade = this.gradeFromPercentile(percentile);
    var topPercent = Math.max(1, Math.round((rank / total) * 100));

    return {
      rank: rank,
      total: total,
      percentile: percentile,
      topPercent: topPercent,
      intensity: intensity,
      industry: industry,
      avgIntensity: avg,
      benchmarkIntensity: best,
      unit: 'tCO₂/t',
      grade: grade,
      energyEfficiency: Math.min(92, Math.round(72 + percentile * 0.12))
    };
  },

  /** 与行业标杆（前 5%）的减排潜力 */
  calcReductionPotentialPct: function (ranking) {
    var pool = this.INDUSTRY_POOL[ranking.industry] || this.INDUSTRY_POOL['钢铁'];
    var benchmark = pool.best;
    if (ranking.intensity <= benchmark) return 0;
    return Math.round((ranking.intensity - benchmark) / ranking.intensity * 1000) / 10;
  },

  /** 行业工序/技改话术（演示文案） */
  _industryProcessContext: function (industry) {
    if (industry === '水泥') {
      return {
        processFocus: '熟料烧成、窑系统与水泥粉磨生产线',
        reductionItems: [
          {
            direction: '提升替代燃料与绿电占比',
            detail: '当前替代燃料掺加比例与绿电占比低于行业标杆约 10–12 个百分点，可通过 RDF/SRF 协同处置与分布式光伏逐步优化窑系统能源结构。',
            benefitScale: [0.32, 3.0, 0.30]
          },
          {
            direction: '优化窑系统热工参数',
            detail: '聚焦熟料烧成带与预分解炉热效率，对标标杆企业的燃料单耗与游离钙控制水平，开展窑系统能效诊断。',
            benefitScale: [0.38, 3.5, 0.36]
          },
          {
            direction: '深化余热发电与余压利用',
            detail: '提升窑头、窑尾余热锅炉回收效率，扩大低温余热用于烘干与发电，减少外购电力依赖。',
            benefitScale: [0.30, 2.8, 0.34]
          }
        ],
        waterfall: ['熟料烧成差距', '窑系统能效差距', '替代燃料/能源结构', '其他环节'],
        compareActions: [
          '将当前优于对标样本的窑系统低碳运行参数写入 SOP，建立班组级熟料强度与燃料单耗联动 KPI。',
          '参照行业标杆替代燃料与绿电水平，制定 3 年 RDF 掺加与绿电采购路线图，优先覆盖窑系统与粉磨生产线。',
          '推进窑尾余热发电扩容与低碱度熟料配方优化，预计可再挖掘约 ' // will be filled
        ]
      };
    }
    return {
      processFocus: '炼铁/炼钢等核心工序',
      reductionItems: [
        {
          direction: '提升绿电使用比例',
          detail: '当前绿电占比低于行业标杆约 12–15 个百分点，可通过中长期购电协议与自建分布式光伏逐步替代网电。',
          benefitScale: [0.35, 3.2, 0.32]
        },
        {
          direction: '优化高耗能工序',
          detail: '聚焦炼铁/炼钢等核心工序，对标标杆企业的原料结构与工艺参数，开展能效对标与短流程改造可行性研究。',
          benefitScale: [0.40, 3.8, 0.38]
        },
        {
          direction: '深化余热回收利用',
          detail: '提升烧结、转炉等环节余热回收率，将余能用于发电或预热，减少化石能源外购依赖。',
          benefitScale: [0.25, 2.5, 0.30]
        }
      ],
      waterfall: ['炼铁工序差距', '炼钢工序差距', '电力/能源结构', '其他环节'],
      compareActions: null
    };
  },

  buildReductionPotentialAnalysis: function (ranking, annualOutput, slots) {
    var pool = this.INDUSTRY_POOL[ranking.industry] || this.INDUSTRY_POOL['钢铁'];
    var benchmark = pool.best;
    var reductionPct = this.calcReductionPotentialPct(ranking);
    var profile = this.getEnterpriseProfile(slots || {});
    var output = annualOutput || (profile ? profile.steelOutput * 10000 : 8320000);
    var totalSaving = Math.round(output * (ranking.intensity - benchmark));
    var ctx = this._industryProcessContext(ranking.industry);

    var items = ctx.reductionItems.map(function (tpl) {
      return {
        direction: tpl.direction,
        detail: tpl.detail,
        benefitPct: Math.min(reductionPct * tpl.benefitScale[0], tpl.benefitScale[1]),
        benefitTon: Math.round(totalSaving * tpl.benefitScale[2])
      };
    });

    return {
      benchmarkIntensity: benchmark,
      benchmarkLabel: '行业标杆（前 5%）',
      reductionPct: reductionPct,
      topPercent: ranking.topPercent || Math.round(ranking.rank / ranking.total * 100),
      totalSavingTon: totalSaving,
      annualOutput: output,
      unit: ranking.unit || 'tCO₂/t',
      summary: '本企业当前碳强度 ' + ranking.intensity + ' ' + (ranking.unit || 'tCO₂/t') +
        '，距行业标杆 ' + benchmark + ' ' + (ranking.unit || 'tCO₂/t') +
        ' 仍有约 **' + reductionPct + '%** 强度下降空间。若三项技改方向协同推进，' +
        '预估可实现 **' + Math.round((items[0].benefitPct + items[1].benefitPct + items[2].benefitPct) * 10) / 10 +
        '%** 的综合减排收益，年减排潜力约 **' + totalSaving.toLocaleString() + ' tCO₂**。',
      items: items
    };
  },

  buildRecommendations: function (ranking) {
    var reductionPct = this.calcReductionPotentialPct(ranking);
    if (ranking.industry === '钢铁') {
      return [
        '推进高炉煤气发电（CCPP）与烧结环冷余热回收，参照安钢2024年已实现35.39万吨CO₂当量减排经验，扩大余能利用覆盖面。',
        '吨钢综合能耗（565 kgce/t）仍高于钢协会员均值（557.15 kgce/t），建议开展高炉、转炉工序能效对标诊断，锁定约 ' + reductionPct + '% 强度优化空间。',
        '2024年全国碳市场CEA均价96.02元/吨，建议建立配额盈缺预警机制，结合产量波动动态评估履约成本（约15.1亿元量级）。',
        '严格落实SO₂（644t）、NOx（2643t）、颗粒物（3200t）年度排放控制，同步推进超低排放改造与清洁运输比例提升。',
        '扩大绿电中长期采购与分布式光伏（安钢梅园庄、冷轧等基地已有实践），目标3年内绿电占比提升至30%以上。'
      ];
    }
    if (ranking.grade === 'A' || ranking.percentile >= 95) {
      return [
        '巩固当前行业领先的碳强度优势，将最佳实践固化为企业标准作业程序（SOP）。',
        '探索绿电替代与余热深度回收，向全球标杆水平看齐，扩大领先优势。',
        '输出低碳管理经验至供应链上下游，打造绿色品牌与 ESG 竞争力。'
      ];
    }
    if (ranking.grade === 'B+' || ranking.percentile >= 80) {
      var processHint = ranking.industry === '水泥'
        ? '开展窑系统与熟料烧成碳排放强度专项诊断'
        : '开展高炉/转炉等关键工序碳排放强度专项诊断';
      return [
        '对标排名前 5% 标杆企业的能源结构，制定绿电占比提升路线图（建议 3 年内提高 10–15 个百分点）。',
        processHint + '，锁定约 ' + reductionPct + '% 的剩余优化空间。',
        ranking.industry === '水泥'
          ? '优先推进窑尾余热发电与替代燃料（RDF）掺加项目，预计可贡献 15–20% 的工序减排收益。'
          : '优先推进余热深度回收与余能发电项目，预计可贡献 15–20% 的工序减排收益。',
        '建立月度碳强度跟踪机制，设置向行业前 10% 进发的阶段性降碳 KPI。'
      ];
    }
    if (ranking.rank <= ranking.total * 0.5) {
      return [
        '对标排名前 20% 企业的能源结构，逐步提高绿电与清洁能源占比。',
        '开展关键工序碳排放强度专项诊断，锁定剩余优化空间。',
        '建立月度碳强度跟踪机制，设置阶段性降碳目标并纳入 KPI 考核。'
      ];
    }
    return [
      '优先排查生产系统中能耗最高的 3 个环节，制定针对性技改计划。',
      '参考排名靠前企业的余热回收与工艺优化方案，缩短与行业平均水平的差距。',
      '建议引入碳排放强度预警阈值，超过行业均值时自动触发整改流程。'
    ];
  },

  buildRankingCopy: function (ranking, slots, dataSource) {
    var periodLabel = this._periodLabel(slots);
    var scope = slots.spaceDimension === 'national' ? '全国' : (slots.region || '区域');
    var sourceNote = dataSource === 'auto'
      ? '（数据已从河南钢铁集团生产系统同步）'
      : (dataSource === 'demo' ? '（演示数据 · 河南钢铁集团公开年报口径）' : '（数据由您手动填写）');
    var gradeLabel = ranking.grade === 'B+' ? '**B+ 级（良好偏上）**' : ('**' + ranking.grade + ' 级**');
    var reductionPct = this.calcReductionPotentialPct(ranking);
    var topPct = ranking.topPercent || Math.round(ranking.rank / ranking.total * 100);
    var profile = this.getEnterpriseProfile(slots);
    var dimBlock = '';

    if (profile && slots.industry === '钢铁') {
      dimBlock = '\n\n**核心指标量化研判（' + this.DISPLAY.SELF + ' · ' + periodLabel + '）**\n\n' +
        '| 维度 | 本企业 | 行业参考 |\n' +
        '|------|--------|----------|\n' +
        '| 钢材产量 | **' + profile.steelOutput + profile.steelOutputUnit + '** | 河南省粗钢约2,762万吨（2024） |\n' +
        '| 碳排放量 | **' + profile.co2Emission + profile.co2Unit + '** | 长流程均值约1.95 tCO₂/t |\n' +
        '| 碳排放强度 | **' + profile.co2Intensity + ' ' + profile.intensityUnit + '** | 行业均值 **' + ranking.avgIntensity + ' ' + profile.intensityUnit + '** |\n' +
        '| 吨钢综合能耗 | **' + profile.energyPerTon + ' ' + profile.energyUnit + '** | 钢协会员均值 **' + profile.industryEnergyAvg + ' ' + profile.energyUnit + '** |\n' +
        '| 碳配额 | **' + profile.carbonQuota + '万吨**（' + (profile.quotaSurplus >= 0 ? '盈余' + profile.quotaSurplus : '缺口' + Math.abs(profile.quotaSurplus)) + '万吨） | 2024等量发放 |\n' +
        '| 碳价（均价） | **' + profile.carbonPriceAvg + profile.carbonPriceUnit + '** | 全国碳市场CEA |\n' +
        '| 污染物排放 | SO₂ **' + profile.pollutants.so2 + 't** · NOx **' + profile.pollutants.nox + 't** · 颗粒物 **' + profile.pollutants.pm + 't** | 安钢年报披露口径 |\n';
    }

    return '**' + this.DISPLAY.SELF + '** 在 **' + periodLabel + ' ' + ranking.industry + '行业' + scope +
      '** 的综合对标分析已完成' + sourceNote + '。\n\n' +
      '综合评级：' + gradeLabel + '。碳排放强度位列 **行业前 ' + topPct + '%**' +
      '（第 ' + ranking.rank + ' / ' + ranking.total + ' 名），优于全国长流程均值 **' + ranking.avgIntensity + ' tCO₂/t** 约 **' +
      Math.round((ranking.avgIntensity - ranking.intensity) / ranking.avgIntensity * 1000) / 10 + '%**。' +
      '距行业标杆（前 5%，' + ranking.benchmarkIntensity + ' tCO₂/t）仍有约 **' + reductionPct + '%** 减排潜力。' +
      dimBlock +
      '\n\n建议重点关注 **高炉煤气发电**、**余热回收（TRT）** 与 **绿电采购** 等技改方向，同步做好碳配额履约与排污总量控制。下方图表供进一步研判。';
  },

  buildRankingChartData: function (ranking) {
    var pool = this.INDUSTRY_POOL[ranking.industry] || this.INDUSTRY_POOL['钢铁'];
    var names = [
      this.getPeerDisplayName(0, 'benchmark'),
      this.getPeerDisplayName(1, 'peer'),
      this.DISPLAY.SELF,
      this.getPeerDisplayName(2, 'peer'),
      this.DISPLAY.INDUSTRY_AVG
    ];
    var values = [
      pool.best,
      pool.distribution[1],
      ranking.intensity,
      pool.distribution[2],
      pool.avgIntensity
    ];
    return {
      categories: names,
      values: values.map(function (v) { return Math.round(v * 100) / 100; }),
      unit: ranking.unit || 'tCO₂/t',
      highlightIndex: 2,
      ranking: ranking
    };
  },

  buildRankingTable: function (ranking, chartData) {
    var rows = chartData.categories.map(function (name, i) {
      var isSelf = name === BenchmarkDataService.DISPLAY.SELF;
      var isAvg = name === BenchmarkDataService.DISPLAY.INDUSTRY_AVG;
      return {
        name: name,
        intensity: chartData.values[i],
        unit: chartData.unit,
        isSelf: isSelf,
        isBenchmark: !isSelf && !isAvg,
        peerIndex: i,
        energyEfficiency: isSelf
          ? ranking.energyEfficiency
          : Math.round(85 + i * 2.5)
      };
    });

    rows.unshift({
      rank: ranking.rank,
      total: ranking.total,
      percentile: ranking.percentile,
      topPercent: ranking.topPercent,
      intensity: ranking.intensity,
      unit: ranking.unit,
      grade: ranking.grade,
      industry: ranking.industry,
      isSummary: true
    });
    return rows;
  },

  buildRankingList: function (ranking) {
    var pool = this.INDUSTRY_POOL[ranking.industry] || this.INDUSTRY_POOL['钢铁'];
    var slotCount = this._peerSlotCount(ranking.industry);
    var list = [];
    var i;
    for (i = 0; i < slotCount; i++) {
      list.push({
        rank: i + 1,
        name: this.getPeerDisplayName(i, i === 0 ? 'benchmark' : 'rank'),
        intensity: Math.round(pool.distribution[i] * 100) / 100,
        unit: ranking.unit,
        isSelf: false
      });
    }

    list.push({
      rank: ranking.rank,
      name: this.DISPLAY.SELF,
      intensity: ranking.intensity,
      unit: ranking.unit,
      isSelf: true,
      isDivider: true
    });

    list.push({
      rank: ranking.rank + 1,
      name: this.getPeerDisplayName(0, 'neighbor'),
      intensity: Math.round((ranking.intensity + 0.04) * 100) / 100,
      unit: ranking.unit,
      isSelf: false
    });

    return list;
  },

  buildComparisonCopy: function (ranking, slots) {
    var summary = typeof BenchmarkSlotFilling !== 'undefined'
      ? BenchmarkSlotFilling.buildSummary()
      : ranking.industry + '行业';
    var reductionPct = this.calcReductionPotentialPct(ranking);
    var topPct = ranking.topPercent || Math.round(ranking.rank / ranking.total * 100);
    var gradeLabel = ranking.grade === 'B+' ? 'B+ 级（良好偏上）' : (ranking.grade + ' 级');
    var profile = this.getEnterpriseProfile(slots);
    var extra = '';

    if (profile) {
      extra = '\n\n**经营与双碳综合对标摘要**\n' +
        '- 钢材产量 **' + profile.steelOutput + profile.steelOutputUnit + '**，营业收入 **' + (profile.revenue || '—') + (profile.revenueUnit || '') + '**\n' +
        '- 碳排放 **' + profile.co2Emission + profile.co2Unit + '**，强度 **' + profile.co2Intensity + ' ' + profile.intensityUnit + '**\n' +
        '- 碳配额 **' + profile.carbonQuota + '万吨**，' + (profile.quotaSurplus >= 0 ? '盈余' : '缺口') + ' **' + Math.abs(profile.quotaSurplus) + '万吨**；碳价均价 **' + profile.carbonPriceAvg + profile.carbonPriceUnit + '**\n' +
        '- 2024年减碳措施实现 **' + (profile.reductionAchieved || 35.39) + '万吨** CO₂当量减排（光伏、煤气发电等）\n';
    }

    return '已完成 **' + summary + '** 对标分析。\n\n' +
      '综合评级：**' + gradeLabel + '**。**' + this.DISPLAY.SELF + '** 碳强度位列 **行业前 ' + topPct + '%**' +
      '（第 ' + ranking.rank + ' / ' + ranking.total + ' 名）。' +
      '距 **行业标杆（前 5%）** 仍有约 **' + reductionPct + '%** 减排潜力，' +
      '绿电占比、余能回收与配额管理存在优化空间。' + extra +
      '\n下方图表展示排名位置及与标杆企业的多维度对比。';
  },

  buildRadarData: function (ranking, slots) {
    var profile = this.getEnterpriseProfile(slots || {});
    var pool = this.INDUSTRY_POOL[ranking.industry] || this.INDUSTRY_POOL['钢铁'];
    var score = ranking.percentile || 65;
    var intensityScore = Math.min(100, Math.round(100 - (ranking.intensity - pool.best) / (pool.avgIntensity - pool.best + 0.01) * 35));
    var energyScore = profile
      ? Math.min(100, Math.round(100 - (profile.energyPerTon - pool.avgEnergy) * 0.25))
      : Math.min(100, Math.round(score * 0.82));
    var greenScore = profile ? Math.min(100, Math.round(profile.greenPowerRatio * 3.2)) : Math.min(100, Math.round(score * 0.72));
    var quotaScore = profile
      ? Math.min(100, Math.round(85 + (profile.quotaSurplus >= 0 ? profile.quotaSurplus * 2 : profile.quotaSurplus * 3)))
      : 78;
    var pollutantScore = profile ? 72 : Math.min(100, Math.round(score * 0.78));

    return {
      indicators: [
        { name: '碳排放强度', max: 100 },
        { name: '吨钢能耗', max: 100 },
        { name: '绿电占比', max: 100 },
        { name: '配额履约', max: 100 },
        { name: '污染物排放', max: 100 }
      ],
      series: [
        {
          name: this.DISPLAY.SELF,
          values: [intensityScore, energyScore, greenScore, quotaScore, pollutantScore]
        },
        {
          name: '行业标杆（前5%）',
          values: [96, 92, 88, 95, 90]
        }
      ]
    };
  },

  /** 五维核心指标看板数据 */
  buildDashboardMetrics: function (slots) {
    var profile = this.getEnterpriseProfile(slots);
    if (!profile) return null;
    return {
      enterprise: this.DISPLAY.SELF,
      period: profile.year + (profile.month ? '年' + parseInt(profile.month, 10) + '月' : '年'),
      cards: [
        { key: 'output', label: '钢材产量', value: profile.steelOutput, unit: profile.steelOutputUnit, trend: profile.year === '2024' ? '同比-31.6%' : null, source: '安阳钢铁年报' },
        { key: 'co2', label: '碳排放量', value: profile.co2Emission, unit: profile.co2Unit, sub: '核查/估算口径', source: '产量×长流程强度系数' },
        { key: 'intensity', label: '碳排放强度', value: profile.co2Intensity, unit: profile.intensityUnit, benchmark: '行业均值 ' + (this.INDUSTRY_POOL['钢铁'].avgIntensity) + ' tCO₂/t', source: '生态环境部行业研究' },
        { key: 'quota', label: '碳配额', value: profile.carbonQuota, unit: '万吨', sub: profile.quotaSurplus >= 0 ? '盈余 ' + profile.quotaSurplus + '万吨' : '缺口 ' + Math.abs(profile.quotaSurplus) + '万吨', source: '2024等量发放方案' },
        { key: 'price', label: '碳价均价', value: profile.carbonPriceAvg, unit: profile.carbonPriceUnit, sub: '履约成本约 ' + profile.carbonCost + ' 亿元', source: '中财绿金院碳市场年报' },
        { key: 'pollutant', label: '污染物排放', value: 'SO₂' + profile.pollutants.so2 + 't', unit: '', sub: 'NOx ' + profile.pollutants.nox + 't · PM ' + profile.pollutants.pm + 't', source: '安钢环境信息披露' }
      ],
      sources: typeof HenanSteelData !== 'undefined' ? HenanSteelData.sources : {}
    };
  },

  /** 从用户问题识别分析焦点 */
  detectQueryFocus: function (text, slots) {
    var t = String(text || '');
    if (/配额|履约|碳价|碳市场/.test(t)) return 'quota';
    if (/排污|污染物|SO2|SO₂|NOx|NOₓ|颗粒物|超低排放/.test(t)) return 'pollutant';
    if (/产量|生产|营收|经营|效益/.test(t)) return 'production';
    if (/能耗|节能|综合能耗|kgce|能效/.test(t)) return 'energy';
    if (/技改|改造|减排|降碳|潜力/.test(t)) return 'retrofit';
    if (/排名|排行|名次|第几|位次/.test(t)) return 'ranking';
    if (/对比|比较|差距|标杆|差异|对标/.test(t)) return 'comparison';
    if (slots && slots.functionType === 'ranking') return 'ranking';
    if (slots && slots.functionType === 'comparison') return 'comparison';
    return 'comprehensive';
  },

  /** 六维指标对比：产量、碳排放、强度、配额、排污、能耗 */
  buildMultiDimCompare: function (slots) {
    var profile = this.getEnterpriseProfile(slots);
    if (!profile) return null;
    var key = this.getPeriodKey(slots);
    var refs = typeof HenanSteelData !== 'undefined'
      ? HenanSteelData.getBenchmarkProfiles(key)
      : null;
    if (!refs) return null;

    var selfName = this.DISPLAY.SELF;
    var bench = refs.benchmark;
    var avg = refs.industryAvg;

    function gapLabel(selfVal, benchVal, lowerBetter, unit) {
      var diff = Math.round((selfVal - benchVal) * 100) / 100;
      if (Math.abs(diff) < 0.01) return '与标杆持平';
      if (lowerBetter) {
        return diff > 0
          ? '高于标杆 ' + diff + unit + '（待改进）'
          : '低于标杆 ' + Math.abs(diff) + unit + '（更优）';
      }
      return diff > 0
        ? '高于标杆 ' + diff + unit + '（更优）'
        : '低于标杆 ' + Math.abs(diff) + unit;
    }

    var rows = [
      {
        metric: '钢材产量', unit: '万吨',
        self: profile.steelOutput, benchmark: bench.steelOutput, avg: avg.steelOutput,
        lowerIsBetter: false,
        gap: gapLabel(profile.steelOutput, bench.steelOutput, false, '万吨')
      },
      {
        metric: '碳排放量', unit: '万吨',
        self: profile.co2Emission, benchmark: bench.co2Emission, avg: avg.co2Emission,
        lowerIsBetter: true,
        gap: gapLabel(profile.co2Emission, bench.co2Emission, true, '万吨')
      },
      {
        metric: '碳排放强度', unit: 'tCO₂/t',
        self: profile.co2Intensity, benchmark: bench.co2Intensity, avg: avg.co2Intensity,
        lowerIsBetter: true,
        gap: gapLabel(profile.co2Intensity, bench.co2Intensity, true, ' tCO₂/t')
      },
      {
        metric: '碳配额', unit: '万吨',
        self: profile.carbonQuota, benchmark: bench.carbonQuota, avg: avg.carbonQuota,
        lowerIsBetter: true,
        gap: (profile.quotaSurplus >= 0 ? '盈余' : '缺口') + ' ' + Math.abs(profile.quotaSurplus) + '万吨'
      },
      {
        metric: '履约成本', unit: '亿元',
        self: profile.carbonCost, benchmark: bench.carbonCost, avg: avg.carbonCost,
        lowerIsBetter: true,
        gap: '碳价 ' + profile.carbonPriceAvg + '元/t'
      },
      {
        metric: 'SO₂排放', unit: '吨',
        self: profile.pollutants.so2, benchmark: bench.pollutants.so2, avg: avg.pollutants.so2,
        lowerIsBetter: true,
        gap: gapLabel(profile.pollutants.so2, bench.pollutants.so2, true, 't')
      },
      {
        metric: 'NOx排放', unit: '吨',
        self: profile.pollutants.nox, benchmark: bench.pollutants.nox, avg: avg.pollutants.nox,
        lowerIsBetter: true,
        gap: gapLabel(profile.pollutants.nox, bench.pollutants.nox, true, 't')
      },
      {
        metric: '颗粒物排放', unit: '吨',
        self: profile.pollutants.pm, benchmark: bench.pollutants.pm, avg: avg.pollutants.pm,
        lowerIsBetter: true,
        gap: gapLabel(profile.pollutants.pm, bench.pollutants.pm, true, 't')
      },
      {
        metric: '吨钢综合能耗', unit: 'kgce/t',
        self: profile.energyPerTon, benchmark: bench.energyPerTon, avg: avg.energyPerTon,
        lowerIsBetter: true,
        gap: gapLabel(profile.energyPerTon, bench.energyPerTon, true, ' kgce/t')
      }
    ];

    return {
      period: profile.year + (profile.month ? '年' + parseInt(profile.month, 10) + '月' : '年'),
      selfName: selfName,
      benchmarkName: bench.name,
      avgName: avg.name,
      rows: rows
    };
  },

  buildMultiDimChartData: function (multiDim) {
    if (!multiDim || !multiDim.rows) return null;
    var focusRows = multiDim.rows.filter(function (r) {
      return ['碳排放量', '碳排放强度', 'SO₂排放', 'NOx排放', '吨钢综合能耗'].indexOf(r.metric) >= 0;
    });
    return {
      categories: focusRows.map(function (r) { return r.metric; }),
      unit: '对标指数（标杆=100）',
      series: [
        {
          name: multiDim.selfName,
          values: focusRows.map(function (r) {
            if (!r.lowerIsBetter) return Math.min(120, Math.round(r.self / r.benchmark * 100));
            return Math.min(120, Math.round(r.benchmark / r.self * 100));
          })
        },
        {
          name: multiDim.benchmarkName,
          values: focusRows.map(function () { return 100; })
        }
      ]
    };
  },

  _periodLabel: function (slots) {
    if (!slots) return '2026年6月';
    if (slots.timeDimension === 'monthly' && slots.timeValue) {
      var parts = String(slots.timeValue).split('-');
      if (parts.length === 2) return parts[0] + '年' + parseInt(parts[1], 10) + '月';
      return slots.timeValue.replace('-', '年') + '月';
    }
    if (slots.timeValue && String(slots.timeValue).indexOf('-') >= 0) {
      var p = String(slots.timeValue).split('-');
      return p[0] + '年' + parseInt(p[1], 10) + '月';
    }
    return (slots.timeValue || '2026') + '年';
  },

  /** 按问题焦点生成差异化回答文案 */
  buildAnswerText: function (focus, userText, slots, ranking, dataSource) {
    var profile = this.getEnterpriseProfile(slots);
    var multiDim = this.buildMultiDimCompare(slots);
    var period = this._periodLabel(slots);
    var sourceNote = dataSource === 'auto'
      ? '（河南钢铁集团生产系统数据）'
      : '（公开年报及行业统计数据）';
    var tableBlock = '';

    if (multiDim) {
      tableBlock = '\n\n| 指标 | ' + multiDim.selfName + ' | ' + multiDim.benchmarkName + ' | ' + multiDim.avgName + ' | 研判 |\n' +
        '|------|--------|----------|----------|------|\n' +
        multiDim.rows.map(function (r) {
          return '| ' + r.metric + ' | **' + r.self + r.unit + '** | ' + r.benchmark + r.unit + ' | ' + r.avg + r.unit + ' | ' + r.gap + ' |';
        }).join('\n');
    }

    if (focus === 'ranking') {
      var topPct = ranking.topPercent || Math.round(ranking.rank / ranking.total * 100);
      var monthlyNote = slots.timeDimension === 'monthly'
        ? '本月钢材产量 **' + profile.steelOutput + '万吨**，碳排放 **' + profile.co2Emission + '万吨**，可作为经营排产与履约监测的月度快照。'
        : period + '钢材产量 **' + profile.steelOutput + '万吨**（同比大幅下滑），碳排放 **' + profile.co2Emission + '万吨**。产量下滑是排名维持相对靠前但履约压力变化的关键背景。';
      return '根据您的问题「' + userText + '」，已完成 **' + period + '** 河南钢铁集团钢铁行业全国对标' + sourceNote + '。\n\n' +
        '**排名结论**：碳排放强度 **' + ranking.intensity + ' tCO₂/t**，在全国碳市场 **232家** 钢铁企业中排名 **第 ' + ranking.rank + ' / ' + ranking.total + ' 名**（前 ' + topPct + '%），' +
        '优于行业均值 **' + ranking.avgIntensity + ' tCO₂/t**。\n\n' +
        '**经营参考**：' + monthlyNote +
        tableBlock;
    }

    if (focus === 'quota') {
      var gapText = profile.quotaSurplus >= 0
        ? '当前配额 **盈余 ' + profile.quotaSurplus + '万吨**（排放量未超配）'
        : '当前配额 **缺口 ' + Math.abs(profile.quotaSurplus) + '万吨**，需通过市场购入或核减产量';
      var gapCost = Math.round(Math.abs(profile.quotaSurplus) * profile.carbonPriceAvg / 10000 * 100) / 100;
      return '根据您的问题「' + userText + '」，以下为 **' + period + '** 河南钢铁集团碳配额履约与碳价影响分析' + sourceNote + '。\n\n' +
        '**履约研判**\n' +
        '- 核查排放量：**' + profile.co2Emission + '万吨**\n' +
        '- 发放配额：**' + profile.carbonQuota + '万吨**（2024等量发放）\n' +
        '- ' + gapText + '\n' +
        '- 全国碳市场CEA均价：**' + profile.carbonPriceAvg + '元/t**\n' +
        '- 预估履约成本：**' + profile.carbonCost + '亿元**\n' +
        (profile.quotaSurplus < 0 ? '- 缺口购入成本约：**' + gapCost + '亿元**（按均价测算）\n' : '') +
        '\n**经营决策建议**：建议建立「产量—排放—配额」联动模型，在排产计划阶段预评估履约成本；关注碳价波动（2024年均价96元/t，2025年回落至约75元/t），适时通过CCER或节能技改降低履约支出。' +
        tableBlock;
    }

    if (focus === 'pollutant') {
      return '根据您的问题「' + userText + '」，以下为 **' + period + '** 河南钢铁集团污染物排放对标分析' + sourceNote + '。\n\n' +
        '**排污现状**（安钢年报披露口径）\n' +
        '- SO₂：**' + profile.pollutants.so2 + '吨/年**\n' +
        '- NOx：**' + profile.pollutants.nox + '吨/年**\n' +
        '- 颗粒物：**' + profile.pollutants.pm + '吨/年**\n\n' +
        '**对标研判**：三类污染物均高于行业标杆水平（标杆约为本企业的65%–68%），主要与高炉—转炉长流程产能占比及产量规模相关。' +
        '安钢已推进超低排放改造，2024年减碳措施同步实现 **' + (profile.reductionAchieved || 35.39) + '万吨** CO₂当量减排。\n\n' +
        '**环保管控建议**：优先锁定烧结、炼铁工序的SO₂和颗粒物排放；对标标杆企业超低排放路径，将排污总量控制纳入与产量联动的 KPI。' +
        tableBlock;
    }

    if (focus === 'production') {
      return '根据您的问题「' + userText + '」，以下为 **' + period + '** 河南钢铁集团生产经营对标分析' + sourceNote + '。\n\n' +
        '**经营现状**\n' +
        '- 钢材产量：**' + profile.steelOutput + '万吨**' + (profile.year === '2024' ? '（同比-31.64%，安钢年报）' : '') + '\n' +
        '- 营业收入：**' + (profile.revenue || '—') + (profile.revenueUnit || '亿元') + '**\n' +
        '- 粗钢产量：**' + profile.crudeSteelOutput + '万吨**\n\n' +
        '**双碳关联**：产量每下降10%，碳排放总量同比约减少10%（强度基本稳定），但吨钢固定成本与能耗分摊上升，需关注 **规模效应** 与 **强度指标** 的平衡。' +
        '河南省2024年粗钢产量约2,762万吨，河南钢铁集团约占全省30%左右。\n\n' +
        '**经营决策建议**：在产量调整期同步优化产能结构，向高附加值品种钢倾斜；以强度指标不恶化为底线安排检修与限产。' +
        tableBlock;
    }

    if (focus === 'energy') {
      return '根据您的问题「' + userText + '」，以下为 **' + period + '** 河南钢铁集团节能降耗对标分析' + sourceNote + '。\n\n' +
        '**能耗现状**\n' +
        '- 吨钢综合能耗：**' + profile.energyPerTon + ' kgce/t**\n' +
        '- 钢协会员均值：**' + profile.industryEnergyAvg + ' kgce/t**\n' +
        '- 行业标杆：**' + (this.INDUSTRY_POOL['钢铁'].bestEnergy || 480) + ' kgce/t**\n\n' +
        '**研判**：河南钢铁集团吨钢能耗 **高于** 行业均值约 **' + Math.round((profile.energyPerTon - profile.industryEnergyAvg) * 10) / 10 + ' kgce/t**，与NRDC研究指出的「安阳钢铁能效并不领先」一致。' +
        '主要差距在高炉工序热工效率、煤气回收率及余能发电覆盖度。\n\n' +
        '**技改规划建议**：优先实施高炉煤气发电（CCPP）、烧结环冷余热回收；参照安钢2024年已实现的35.39万吨减碳成效扩大推广。' +
        tableBlock;
    }

    if (focus === 'retrofit') {
      var reduction = this.buildReductionPotentialAnalysis(ranking, null, slots);
      return '根据您的问题「' + userText + '」，以下为 **' + period + '** 河南钢铁集团技改减排潜力分析' + sourceNote + '。\n\n' +
        reduction.summary + '\n\n' +
        '**分项技改方向**\n' +
        reduction.items.map(function (it, i) {
          return (i + 1) + '. **' + it.direction + '**：' + it.detail + '（预估减排 **' + it.benefitTon.toLocaleString() + ' tCO₂/年**）';
        }).join('\n') +
        tableBlock;
    }

    if (focus === 'comparison') {
      return '根据您的问题「' + userText + '」，已完成 **' + period + '** 河南钢铁集团多维度对标分析' + sourceNote + '。\n\n' +
        '**综合研判**：从产量、碳排放、排放强度、碳配额、污染物排放、吨钢能耗六个维度与行业标杆及均值对比，河南钢铁集团碳强度表现优于全国均值，' +
        '但能耗与污染物排放仍高于标杆水平，履约成本随产量波动敏感。\n\n' +
        '**三类管理参考**\n' +
        '- **经营决策**：产量下滑期关注规模效应与单位成本，以强度不恶化作为排产底线\n' +
        '- **履约管理**：配额' + (profile.quotaSurplus >= 0 ? '基本平衡' : '存在缺口') + '，需动态跟踪碳价（' + profile.carbonPriceAvg + '元/t）\n' +
        '- **技改规划**：优先高炉煤气发电、余热回收，目标缩小与标杆约 **' + this.calcReductionPotentialPct(ranking) + '%** 的强度差距' +
        tableBlock;
    }

    /* comprehensive 默认 */
    return '根据您的问题「' + userText + '」，以下为 **' + period + '** 河南钢铁集团生产经营与双碳管控综合研判' + sourceNote + '。\n\n' +
      '**核心结论**：' + period + '钢材产量 **' + profile.steelOutput + '万吨**，碳排放 **' + profile.co2Emission + '万吨**，强度 **' + profile.co2Intensity + ' tCO₂/t**（全国排名第 **' + ranking.rank + '/' + ranking.total + '**）。' +
      '碳配额 **' + profile.carbonQuota + '万吨**，' + (profile.quotaSurplus >= 0 ? '盈余' : '缺口') + ' **' + Math.abs(profile.quotaSurplus) + '万吨**；履约成本约 **' + profile.carbonCost + '亿元**。\n\n' +
      '污染物排放：SO₂ **' + profile.pollutants.so2 + 't**、NOx **' + profile.pollutants.nox + 't**、颗粒物 **' + profile.pollutants.pm + 't**。' +
      '下方多维对比表和图表供经营决策、履约管理与技改规划参考。' +
      tableBlock;
  },

  buildRecommendationsByFocus: function (focus, ranking, slots) {
    var profile = this.getEnterpriseProfile(slots);
    if (focus === 'ranking') {
      return [
        '保持当前优于行业均值的碳强度优势，将高炉煤气发电等减排措施固化为标准操作规程。',
        '产量下滑期重点关注吨钢固定成本与能耗分摊，防止强度指标因规模缩减而反弹。',
        '对标排名前20%企业，设定三年内碳强度排名进入全国前' + Math.max(15, Math.round((ranking.rank / ranking.total) * 100) - 10) + '%的阶段性目标。'
      ];
    }
    if (focus === 'quota') {
      return [
        '建立月度配额盈缺预测模型，将排产计划与碳排放核查量联动，提前' + (profile.quotaSurplus < 0 ? '3个月锁定缺口购入策略' : '储备盈余配额资产') + '。',
        '跟踪全国碳市场CEA价格走势（2024均价96元/t），在价格低位窗口期完成缺口履约购入。',
        '推进CCER开发与节能技改，将煤气发电、光伏等项目减排量纳入履约抵扣储备。'
      ];
    }
    if (focus === 'pollutant') {
      return [
        '聚焦烧结、炼铁工序SO₂和颗粒物排放，对标超低排放改造路线图，设定年度削减目标。',
        '强化清洁运输比例考核，减少厂内短倒和厂外物流环节无组织排放。',
        '将排污总量控制指标与产量计划挂钩，避免产量回升时污染物超标风险。'
      ];
    }
    if (focus === 'production') {
      return [
        '优化产能结构，向高附加值品种钢和高效产线倾斜，提升产量下滑期的吨钢效益。',
        '建立「产量—碳排放—成本」三维看板，为经营层提供排产决策量化依据。',
        '关注河南省钢铁产业政策与产能置换节奏，提前布局周口基地等增量产能的碳排放预算。'
      ];
    }
    if (focus === 'energy') {
      return [
        '开展高炉、转炉工序能效对标诊断，锁定吨钢能耗高于均值的关键环节。',
        '扩大高炉煤气发电（CCPP）和TRT余压发电覆盖范围，参照2024年35.39万吨减碳成效。',
        '设定吨钢综合能耗三年下降路线图，目标从' + profile.energyPerTon + ' kgce/t向行业均值' + profile.industryEnergyAvg + ' kgce/t靠拢。'
      ];
    }
    if (focus === 'retrofit') {
      var reduction = this.buildReductionPotentialAnalysis(ranking, null, slots);
      return reduction.items.map(function (it) {
        return it.direction + '：' + it.detail;
      }).concat(['建立技改项目碳减排量核算台账，纳入年度KPI与碳配额预算。']);
    }
    if (focus === 'comparison') {
      return [
        '从六维指标看，优先攻关吨钢能耗和污染物排放两项与标杆差距最大的环节。',
        '建立经营决策、履约管理、技改规划三类指标的月度联动看板，实现数据驱动管理。',
        '将2024年煤气发电、光伏等35.39万吨减碳成效作为技改基准，设定年度复制推广目标。'
      ];
    }
    return this.buildRecommendations(ranking);
  },

  buildChartsByFocus: function (focus, ranking, slots, rankChartData, radarData) {
    var multiDim = this.buildMultiDimCompare(slots);
    var multiChart = multiDim ? this.buildMultiDimChartData(multiDim) : null;
    var charts = [];

    if (focus === 'ranking') {
      charts.push({ type: 'rankBar', data: rankChartData, title: '碳强度全国排名对标' });
    } else if (focus === 'comparison' || focus === 'comprehensive') {
      charts.push({ type: 'groupBar', data: multiChart, title: '关键指标对标指数（标杆=100）' });
      charts.push({ type: 'radar', data: radarData, title: '经营·双碳五维雷达图' });
    } else if (focus === 'quota' || focus === 'production') {
      charts.push({ type: 'bar', data: {
        categories: ['碳排放量', '碳配额', '履约成本'],
        values: [
          this.getEnterpriseProfile(slots).co2Emission,
          this.getEnterpriseProfile(slots).carbonQuota,
          this.getEnterpriseProfile(slots).carbonCost
        ],
        unit: '万吨/亿元'
      }, title: '配额履约关键指标' });
    } else if (focus === 'pollutant') {
      var p = this.getEnterpriseProfile(slots).pollutants;
      charts.push({ type: 'bar', data: {
        categories: ['SO₂', 'NOx', '颗粒物'],
        values: [p.so2, p.nox, p.pm],
        unit: '吨/年'
      }, title: '污染物排放对标' });
    } else if (focus === 'energy' || focus === 'retrofit') {
      charts.push({ type: 'rankBar', data: rankChartData, title: '碳强度行业位置' });
      charts.push({ type: 'radar', data: radarData, title: '节能降碳多维诊断' });
    } else {
      charts.push({ type: 'groupBar', data: multiChart, title: '关键指标对标指数' });
    }

    return charts.filter(function (c) { return c.data; });
  },

  /** 统一结果构建：按用户问题直接输出 */
  buildResultByFocus: function (slots, dataSource, userText) {
    var focus = slots.queryFocus || this.detectQueryFocus(userText, slots);
    var ranking = this.computeRanking(slots.enterpriseIntensity, slots.industry || '钢铁');
    var rankChartData = this.buildRankingChartData(ranking);
    var radarData = this.buildRadarData(ranking, slots);
    var multiDim = this.buildMultiDimCompare(slots);
    var charts = this.buildChartsByFocus(focus, ranking, slots, rankChartData, radarData);

    return {
      type: 'result',
      text: this.buildAnswerText(focus, userText, slots, ranking, dataSource),
      chartType: charts[0] ? charts[0].type : 'rankBar',
      chartData: charts[0] ? charts[0].data : rankChartData,
      charts: charts,
      rankingMeta: ranking,
      rankingList: focus === 'ranking' ? this.buildRankingList(ranking) : null,
      recommendations: this.buildRecommendationsByFocus(focus, ranking, slots),
      reductionPotential: this.buildReductionPotentialAnalysis(ranking, null, slots),
      tableRows: this.buildRankingTable(ranking, rankChartData),
      dashboardMetrics: this.buildDashboardMetrics(slots),
      multiDimCompare: multiDim,
      queryFocus: focus,
      userQuestion: userText,
      dataSource: dataSource,
      slots: slots
    };
  },

  buildCompareMetrics: function (selfRanking, targetRow) {
    var selfE = selfRanking.energyEfficiency || 83;
    var targetE = targetRow.energyEfficiency;
    if (!targetE) {
      var bench = selfRanking.benchmarkIntensity || targetRow.intensity;
      targetE = Math.min(95, Math.round(88 + (bench - targetRow.intensity) * 25));
    }
    var intensityGap = Math.round((selfRanking.intensity - targetRow.intensity) * 100) / 100;
    var energyGap = Math.round((selfE - targetE) * 10) / 10;
    var compareLabel = this.getCompareTargetLabel();
    return {
      selfName: this.DISPLAY.SELF,
      targetName: compareLabel,
      selfIntensity: selfRanking.intensity,
      targetIntensity: targetRow.intensity,
      unit: selfRanking.unit || 'tCO₂/t',
      intensityGap: intensityGap,
      intensityGapLabel: intensityGap <= 0
        ? '低于目标 ' + Math.abs(intensityGap) + ' ' + (selfRanking.unit || 'tCO₂/t') + '（表现更优）'
        : '高于目标 ' + intensityGap + ' ' + (selfRanking.unit || 'tCO₂/t'),
      selfEnergy: selfE,
      targetEnergy: targetE,
      energyGap: energyGap,
      energyGapLabel: energyGap >= 0
        ? '能源效率领先 ' + energyGap + ' 个百分点'
        : '能源效率落后 ' + Math.abs(energyGap) + ' 个百分点',
      isSelfBetter: intensityGap <= 0
    };
  },

  /**
   * 对比报告专用 Mock 多维指标（基于系统内脱敏演示数据推导，不含外部真实数据）
   */
  buildCompareDetailMetrics: function (selfRanking, targetRow) {
    var base = this.buildCompareMetrics(selfRanking, targetRow);
    var gap = Math.max(0, base.selfIntensity - base.targetIntensity);
    var selfScore = selfRanking.percentile || 80;

    var selfGreen = Math.round(32 + selfScore * 0.12);
    var targetGreen = Math.min(78, Math.round(48 + (base.targetEnergy || 88) * 0.32));
    var selfComEnergy = Math.round(base.selfIntensity * 1.42 * 100) / 100;
    var targetComEnergy = Math.round(base.targetIntensity * 1.35 * 100) / 100;

    var healthIndicators = [
      { name: '能源结构', max: 100 },
      { name: '工艺能效', max: 100 },
      { name: '减排潜力', max: 100 },
      { name: '数据质量', max: 100 },
      { name: '余能利用', max: 100 }
    ];
    var selfHealth = [
      Math.min(100, Math.round(selfScore * 0.88)),
      Math.min(100, Math.round((base.selfEnergy || 83) * 0.92)),
      Math.min(100, Math.round(100 - gap * 120)),
      Math.min(100, Math.round(72 + selfScore * 0.08)),
      Math.min(100, Math.round(selfScore * 0.78))
    ];
    var targetHealth = [
      Math.min(100, targetGreen + 8),
      Math.min(100, Math.round((base.targetEnergy || 90) * 0.98)),
      Math.min(100, Math.round(88 + gap * 40)),
      Math.min(100, Math.round(85 + targetGreen * 0.12)),
      Math.min(100, Math.round(90 + targetGreen * 0.08))
    ];

    var waterfallLabels = this._industryProcessContext(selfRanking.industry).waterfall;
    var waterfallSteps = gap > 0 ? [
      { name: '标杆基准强度', value: base.targetIntensity, type: 'base' },
      { name: waterfallLabels[0], value: Math.round(gap * 0.38 * 1000) / 1000 },
      { name: waterfallLabels[1], value: Math.round(gap * 0.28 * 1000) / 1000 },
      { name: waterfallLabels[2], value: Math.round(gap * 0.22 * 1000) / 1000 },
      { name: waterfallLabels[3], value: Math.round(gap * 0.12 * 1000) / 1000 },
      { name: '本企业强度', value: base.selfIntensity, type: 'total' }
    ] : [
      { name: '本企业强度', value: base.selfIntensity, type: 'base' },
      { name: '领先幅度', value: Math.abs(base.intensityGap), type: 'gain' },
      { name: '标杆强度', value: base.targetIntensity, type: 'total' }
    ];

    return Object.assign(base, {
      selfComEnergy: selfComEnergy,
      targetComEnergy: targetComEnergy,
      comEnergyUnit: 'tce/t',
      selfGreenPct: selfGreen,
      targetGreenPct: targetGreen,
      greenGap: selfGreen - targetGreen,
      healthIndicators: healthIndicators,
      selfHealth: selfHealth,
      targetHealth: targetHealth,
      waterfallSteps: waterfallSteps,
      intensityGapPct: base.selfIntensity > 0
        ? Math.round(Math.abs(base.intensityGap) / base.selfIntensity * 1000) / 10
        : 0
    });
  },

  buildCompareExecutiveSummary: function (detail, industry) {
    var peer = this.getCompareTargetLabel();
    var wfLabels = this._industryProcessContext(industry || '钢铁').waterfall;
    if (detail.isSelfBetter) {
      return [
        '本企业在单位产品碳排放强度上已优于对标样本「' + peer + '」，具备一定低碳竞争优势。',
        '综合能耗与绿电使用占比仍与行业标杆存在结构性差距，能源结构优化是进一步巩固领先的关键。',
        '建议将领先工序经验标准化，并在绿电采购与余能回收领域持续投入，扩大相对优势。',
        '本报告基于系统内脱敏数据生成，不涉及任何第三方企业名称，结论仅供内部战略研讨参考。'
      ];
    }
    return [
      '本企业单位产品碳排放强度为 ' + detail.selfIntensity + ' ' + detail.unit +
        '，高于对标样本「' + peer + '」（' + detail.targetIntensity + ' ' + detail.unit +
        '），绝对差距 ' + Math.abs(detail.intensityGap) + ' ' + detail.unit + '（约 ' + detail.intensityGapPct + '%）。',
      '综合能耗（' + detail.selfComEnergy + ' ' + detail.comEnergyUnit + '）与绿电占比（' +
        detail.selfGreenPct + '%）均落后于标杆水平，能源结构与工艺能效是主要短板。',
      '差距瀑布分析显示，' + wfLabels[0] + '、' + wfLabels[1] + '及' + wfLabels[2] +
        '合计贡献了约 ' +
        Math.round((detail.waterfallSteps[1].value + detail.waterfallSteps[2].value + detail.waterfallSteps[3].value) * 1000) / 1000 +
        ' ' + detail.unit + ' 的强度落差，是优先技改方向。',
      '通过针对性设备升级与排产优化，预计可在 12–18 个月内缩小与标杆约 60% 的碳强度差距。'
    ];
  },

  buildCompareAIActions: function (detail) {
    var peer = this.getCompareTargetLabel();
    if (detail.isSelfBetter) {
      return [
        {
          title: '固化领先工序工艺参数',
          body: '将当前优于对标样本的炼钢/轧钢工序低碳工艺参数写入 SOP，建立班组级碳强度 KPI 看板，防止经验流失。'
        },
        {
          title: '扩大绿电中长期采购协议',
          body: '参照行业标杆绿电占比 ' + detail.targetGreenPct + '% 水平，制定 3 年绿电替代路线图，优先覆盖高炉鼓风与电炉等高耗电工序。'
        },
        {
          title: '推广内部最佳实践',
          body: '组织跨产线对标学习，将本企业领先实践复制至其他基地，形成可量化的集团级减排收益。'
        }
      ];
    }
    return [
      {
        title: '引入高效余热回收与 TRT 发电设备',
        body: '针对炼铁工序约 ' + (detail.waterfallSteps[1] ? detail.waterfallSteps[1].value : 0) + ' ' + detail.unit +
          ' 的强度差距，建议在高炉出口增设高效余热锅炉，预计可降低综合能耗 ' +
          Math.round((detail.selfComEnergy - detail.targetComEnergy) * 0.4 * 100) / 100 + ' ' + detail.comEnergyUnit + '。'
      },
      {
        title: '调整炼钢工序排产与废钢比',
        body: '对标「' + peer + '」所代表的短流程工艺水平，适度提高废钢入炉比例并优化转炉吹炼周期，目标 6 个月内工序碳效提升 8–12%。'
      },
      {
        title: '签订绿电直连与分布式光伏协议',
        body: '当前绿电占比 ' + detail.selfGreenPct + '% 低于标杆 ' + detail.targetGreenPct +
          '%，建议通过绿电直连协议与厂房屋顶光伏，3 年内将绿电占比提升至 50% 以上。'
      }
    ];
  },

  buildCompareRecommendations: function (metrics) {
    var peer = this.getCompareTargetLabel();
    var detail = metrics.healthIndicators ? metrics : null;
    if (detail) {
      return this.buildCompareAIActions(detail).map(function (a) { return a.title + '：' + a.body; });
    }
    if (metrics.isSelfBetter) {
      return [
        '当前碳强度已优于对标样本，建议总结并固化领先工序的低碳工艺参数。',
        '在绿电占比与余能回收维度继续加大投入，扩大相对优势。',
        '可将本企业实践作为内部标杆，向其他产线复制推广。'
      ];
    }
    return [
      '对标「' + peer + '」所代表的能源结构与原料配比，识别可快速落地的减排措施。',
      '优先在碳强度差距最大的工序开展技改，设定 6–12 个月追赶目标。',
      '引入行业标杆最佳实践案例，纳入年度降碳专项计划。'
    ];
  }
};
