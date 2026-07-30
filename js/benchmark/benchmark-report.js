/**
 * 碳对标 HTML 报告生成（麦肯锡风格 · ECharts Base64 内嵌）
 */
var BenchmarkReport = {
  formatDate: function (d) {
    var dt = d ? new Date(d) : new Date();
    return dt.getFullYear() + '-' +
      String(dt.getMonth() + 1).padStart(2, '0') + '-' +
      String(dt.getDate()).padStart(2, '0');
  },

  escape: function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  computeGrade: function (ranking) {
    var gradeMap = {
      A: {
        grade: 'A',
        label: '领先',
        summary: '企业碳效指标位居行业前列，低碳竞争优势明显，建议持续巩固并输出最佳实践。'
      },
      'B+': {
        grade: 'B+',
        label: '良好偏上',
        summary: '企业碳强度表现良好，已具备扎实的低碳管理基础，但距行业标杆仍有可挖掘的减排潜力，建议聚焦能源结构与工序优化。'
      },
      B: {
        grade: 'B',
        label: '良好',
        summary: '企业碳效整体处于行业中上水平，部分维度接近标杆，仍有结构性优化空间。'
      },
      C: {
        grade: 'C',
        label: '待提升',
        summary: '企业碳效与行业标杆存在明显差距，建议优先聚焦高排放环节实施技改与能源结构优化。'
      }
    };

    if (ranking && ranking.grade && gradeMap[ranking.grade]) {
      return gradeMap[ranking.grade];
    }

    if (!ranking || !ranking.rank) {
      return gradeMap['B+'];
    }
    var percentile = ranking.percentile || Math.round((1 - ranking.rank / ranking.total) * 100);
    if (typeof BenchmarkDataService !== 'undefined') {
      var g = BenchmarkDataService.gradeFromPercentile(percentile);
      return gradeMap[g] || gradeMap.B;
    }
    if (percentile >= 95) return gradeMap.A;
    if (percentile >= 80) return gradeMap['B+'];
    if (percentile >= 50) return gradeMap.B;
    return gradeMap.C;
  },

  buildHealthRadarData: function (result) {
    var ranking = result.rankingMeta || {};
    if (typeof BenchmarkDataService !== 'undefined') {
      return BenchmarkDataService.buildRadarData(ranking);
    }
    var score = ranking.percentile || 80;
    return {
      indicators: [
        { name: '碳排放强度', max: 100 },
        { name: '绿电占比', max: 100 },
        { name: '能源利用效率', max: 100 },
        { name: '减排潜力', max: 100 },
        { name: '碳资产管理', max: 100 }
      ],
      series: [
        {
          name: '本企业',
          values: [
            Math.min(100, score),
            Math.min(100, Math.round(score * 0.88)),
            Math.min(100, Math.round(score * 0.82)),
            Math.min(100, Math.round(100 - score * 0.6)),
            Math.min(100, Math.round(score * 0.75))
          ]
        },
        { name: '行业标杆（脱敏）', values: [92, 88, 90, 85, 90] }
      ]
    };
  },

  /** 隐藏容器渲染雷达图并导出 Base64（白底咨询报告风格） */
  renderRadarBase64: function (result) {
    if (typeof echarts === 'undefined') return '';

    var host = this._createChartHost(720, 420);
    var radarData = this.buildHealthRadarData(result);
    var chart = echarts.init(host.inner, null, { renderer: 'canvas', width: 720, height: 420 });
    chart.setOption({
      backgroundColor: '#ffffff',
      color: ['#0b6e3a', '#123d6b'],
      animation: false,
      legend: { bottom: 8, data: radarData.series.map(function (s) { return s.name; }) },
      radar: {
        indicator: radarData.indicators,
        center: ['50%', '48%'],
        radius: '62%',
        axisName: { color: '#5a6472', fontSize: 12 },
        splitLine: { lineStyle: { color: '#e6eaf0' } },
        splitArea: { areaStyle: { color: ['#ffffff', '#f4f6f9'] } },
        axisLine: { lineStyle: { color: '#d1d9e6' } }
      },
      series: [{
        type: 'radar',
        animation: false,
        data: radarData.series.map(function (s, idx) {
          return {
            name: s.name,
            value: s.values,
            areaStyle: { opacity: idx === 0 ? 0.28 : 0.15 },
            lineStyle: { width: 2 }
          };
        })
      }]
    }, { notMerge: true, lazyUpdate: false });

    this._flushChart(chart);
    var img = this._exportChartImage(chart);
    chart.dispose();
    this._removeChartHost(host);
    return img;
  },

  getChartImage: function (chartId) {
    if (typeof BenchmarkChart !== 'undefined' && chartId) {
      var img = BenchmarkChart.getDataURL(chartId);
      if (img) return img;
    }
    return '';
  },

  /** 报告统计周期（月度颗粒度，满足随时查看排名） */
  _resolveReportPeriodLabel: function (payload, result) {
    result = result || (payload && payload.result) || {};
    var slots = result.slots || (payload && payload.slots) || {};
    var period = (payload && payload.period) || result.period || slots.timeValue || '';
    var y;
    var m;
    if (/^\d{4}-\d{2}$/.test(period)) {
      y = period.slice(0, 4);
      m = parseInt(period.slice(5, 7), 10);
    } else if (/^\d{4}$/.test(period)) {
      y = period;
      m = 12;
    } else {
      /* 默认演示口径：2026年6月 */
      y = '2026';
      m = 6;
    }
    var lastDay = new Date(parseInt(y, 10), m, 0).getDate();
    return y + '.' + m + '.1-' + m + '.' + lastDay;
  },

  _resolvePeriodKey: function (payload, result) {
    result = result || (payload && payload.result) || {};
    var slots = result.slots || (payload && payload.slots) || {};
    return (payload && payload.period) || result.period || slots.timeValue || '2026-06';
  },

  _resolveEnterpriseName: function () {
    if (typeof HenanSteelData !== 'undefined' && HenanSteelData.enterpriseName) {
      return HenanSteelData.enterpriseName;
    }
    return '河南钢铁集团';
  },

  /**
   * 构建钢铁企业智能对标报告数据模型（表格数值 + 分析/建议正文）
   * 花括号内为文档需求描述，此处按钢铁企业情况撰写可直接落稿的正文。
   */
  buildSteelReportModel: function (payload) {
    var result = (payload && payload.result) || {};
    var ranking = result.rankingMeta || {};
    var enterpriseName = this._resolveEnterpriseName();
    var periodLabel = this._resolveReportPeriodLabel(payload, result);
    var periodKey = this._resolvePeriodKey(payload, result);
    // 03 · 企业层级碳排放强度基准（tCO₂/t钢材）
    var provinceAvg = 1.977;
    var industryAvg = (ranking.avgIntensity != null) ? ranking.avgIntensity : 1.950;
    var industryAdvanced = 1.901;
    var enterpriseIntensity = (ranking.intensity != null) ? ranking.intensity : 1.923;
    var enterpriseRank = ranking.rank || 123;
    var totalEnterprises = ranking.total || 232;
    var outputWanTon = 69.3;
    if (typeof HenanSteelData !== 'undefined') {
      var profile = HenanSteelData.getPeriod(periodKey);
      if (profile && profile.steelOutput) {
        outputWanTon = profile.month
          ? profile.steelOutput
          : Math.round(profile.steelOutput / 12 * 10) / 10;
      }
    }

    // 02 · 重点工序对标（烧结+炼铁合并口径，基准与企业层级口径不同）
    var quotaCombined = {
      name: '烧结工序+炼铁工序',
      intensity: 1.658,
      rank: 86,
      provinceAvg: 1.812,
      industryAvg: 1.745,
      industryAdvanced: 1.520
    };
    var quotaMetricLabel =
      '钢铁企业重点工序（炼铁、烧结工序）排放总量与炼铁工序产品产量的比值（tCO₂e/t炼铁工序产品产量）';
    var quotaCalcNote =
      '（钢铁企业炼铁工序碳排放量+钢铁企业烧结工序碳排放量）/钢铁企业炼铁工序产品产量，均取核查后数据';

    // 04 · 工序层级全面排名（各工序强度与省/行业基准按工序特征分别设定）
    var processRanks = [
      { name: '焦化工序', intensity: 0.186, rank: 11, tier: 'advantage', provinceAvg: 0.228, industryAvg: 0.215, industryAdvanced: 0.152 },
      { name: '球团工序', intensity: 0.142, rank: 124, tier: 'weak', provinceAvg: 0.118, industryAvg: 0.105, industryAdvanced: 0.078 },
      { name: '烧结工序', intensity: 0.268, rank: 22, tier: 'mid', provinceAvg: 0.295, industryAvg: 0.282, industryAdvanced: 0.215 },
      { name: '高炉炼铁', intensity: 1.486, rank: 32, tier: 'mid', provinceAvg: 1.562, industryAvg: 1.528, industryAdvanced: 1.385 },
      { name: '转炉炼钢', intensity: 0.098, rank: 105, tier: 'weak', provinceAvg: 0.072, industryAvg: 0.065, industryAdvanced: 0.028 },
      { name: '辅助生产工序', intensity: 0.156, rank: 147, tier: 'weak', provinceAvg: 0.128, industryAvg: 0.115, industryAdvanced: 0.082 }
    ];

    var gapToAdvanced = Math.round((enterpriseIntensity - industryAdvanced) * 1000) / 1000;
    var betterThanProvince = Math.round((provinceAvg - enterpriseIntensity) * 1000) / 1000;
    var betterThanIndustry = Math.round((industryAvg - enterpriseIntensity) * 1000) / 1000;
    var quotaGapProvince = Math.round((quotaCombined.provinceAvg - quotaCombined.intensity) * 1000) / 1000;
    var quotaGapIndustry = Math.round((quotaCombined.industryAvg - quotaCombined.intensity) * 1000) / 1000;
    var quotaGapAdvanced = Math.round((quotaCombined.industryAdvanced - quotaCombined.intensity) * 1000) / 1000;
    var coke = processRanks[0];
    var pellet = processRanks[1];
    var sinter = processRanks[2];
    var blast = processRanks[3];
    var converter = processRanks[4];
    var auxiliary = processRanks[5];

    var positioning =
      '本报告为' + enterpriseName + '专属智能对标分析专项报告，聚焦企业经营与双碳管控核心指标开展量化研判，' +
      '覆盖重点工序对标、企业层级和工序层级的碳排放强度排名，为企业经营决策、履约管理、技改规划提供数据支撑。';

    var quotaAnalysis =
      '横向对标显示，本统计周期「' + quotaCombined.name + '」合并口径碳排放强度为 ' + quotaCombined.intensity +
      ' tCO₂e/t炼铁工序产品，低于河南省均值（' + quotaCombined.provinceAvg + '，低 ' + quotaGapProvince +
      '）、行业均值（' + quotaCombined.industryAvg + '，低 ' + quotaGapIndustry +
      '），但距行业先进值（' + quotaCombined.industryAdvanced + '）仍高出约 ' +
      Math.abs(quotaGapAdvanced) +
      '，行业排名第 ' + quotaCombined.rank +
      ' 位，整体处于全国长流程钢企中游偏上、碳效优于省内与行业基准、仍可对标先进挖潜的区间。' +
      '结合烧结与高炉炼铁分项表现：烧结侧固体燃料替代、厚料层操作与环冷余热回收成效可见，高炉系统（燃料比、喷煤/富氧、热风炉及煤气利用）仍是合并口径强度与配额占用的主导贡献环节。' +
      '差异解读需客观提示原料结构（矿石品位、烧结矿配比）、能源结构（喷煤/富氧）、统计口径与工序边界（外购烧结矿/球团、热风炉纳入范围）及核查/快报时点差异等风险点，避免将排名波动直接等同于工艺优劣。';

    var quotaAdvice =
      '针对当前重点工序（烧结+炼铁）碳强度优于省内与行业均值、但仍落后于先进值的现状，建议将碳配额由“被动履约”转向“经营资产”管理：' +
      '一是按月滚动测算配额盈缺，排产与核查排放联动，把握富余配额处置与变现窗口；' +
      '二是巩固烧结工序燃料结构优化与余热回收成效的同时，对高炉炼铁建立配额占用台账，优先将富余额度对冲缺口或反哺高炉节能技改；' +
      '三是履约期前评估 CEA 与 CCER 组合，避免集中购碳抬升成本；' +
      '四是将烧结—炼铁合并口径强度与分项工序波动纳入经营例会，形成“强度—产量—配额”一体化决策。';

    var enterpriseAnalysis = gapToAdvanced > 0
      ? ('企业层级碳排放强度为 ' + enterpriseIntensity + ' tCO₂/t，优于河南省均值（' + provinceAvg +
        ' tCO₂/t，低 ' + betterThanProvince + '）与全国行业均值（' + industryAvg +
        ' tCO₂/t，低 ' + betterThanIndustry + '），在纳入全国碳市场的约 ' + totalEnterprises +
        ' 家长流程钢铁企业中排名第 ' + enterpriseRank + ' 位，整体处于行业中上区间。' +
        '相较行业先进值 ' + industryAdvanced + ' tCO₂/t，仍高出约 ' + gapToAdvanced +
        ' tCO₂/t，追赶空间虽不大，但对应的吨钢碳成本与配额占用差已具备经营敏感度。' +
        '同时须提示：生产负荷、铁钢比、废钢比及核查口径调整，会对企业级强度与排名形成短期扰动，月度对标应结合工况说明一并解读。')
      : ('企业层级碳排放强度为 ' + enterpriseIntensity + ' tCO₂/t，已优于河南省均值（' + provinceAvg +
        '）、全国行业均值（' + industryAvg + '）及行业先进值（' + industryAdvanced +
        '），在约 ' + totalEnterprises + ' 家长流程钢铁企业中排名第 ' + enterpriseRank +
        ' 位，碳效处行业领先区间。仍须提示：生产工况与核查口径变化可能扰动指标，领先优势需通过工序月度跟踪巩固。');

    var enterpriseAdvice =
      '围绕追赶行业先进值目标，建议：强化高炉、烧结等主工序能耗与燃料结构日管控；规范碳数据在工序边界、排放因子与产量口径上的一致性；' +
      '建立配额动态监测与预警，按月复盘强度—配额联动；中长期按“余能回收—绿电替代—氢基/富氢冶金试点”梯次推进低碳技改，避免一次性大额投资集中暴露。';

    var processAnalysisItems = [
      '焦化工序：强度 ' + coke.intensity + ' tCO₂/t、行业排名第 ' + coke.rank + '，为明显优势工序，干熄焦与煤气回收体系运行成效突出，宜维持并输出最佳实践。',
      '烧结工序：强度 ' + sinter.intensity + ' tCO₂/t、排名第 ' + sinter.rank + '，属中游偏前核心工序，燃料结构与环冷余热仍有对标先进挖潜空间。',
      '高炉炼铁：强度 ' + blast.intensity + ' tCO₂/t、排名第 ' + blast.rank + '，处中游区间，是企业级强度与配额占用的关键贡献环节，热工参数与喷煤/富氧协同仍是改善重点。',
      '球团工序：强度 ' + pellet.intensity + ' tCO₂/t、排名第 ' + pellet.rank + '，相对靠后，需关注外购半成品碳足迹与工序能耗管控。',
      '转炉炼钢：强度 ' + converter.intensity + ' tCO₂/t、排名第 ' + converter.rank + '，位次偏弱，废钢比与转炉煤气回收率是主要抓手。',
      '辅助生产工序：强度 ' + auxiliary.intensity + ' tCO₂/t、排名第 ' + auxiliary.rank + '，构成薄弱环节，公辅动力与蒸汽系统能效应专项提升。'
    ];
    var processAnalysis =
      processAnalysisItems.join('') +
      '综合看，焦化、烧结、高炉等主工序在可比口径下优于河南省均值与行业均值，但球团、转炉及辅助工序强度高于对应基准、距离行业先进仍有差距；炉况、检修与核算边界差异会影响指标与排名，宜作管理导向而非唯一考核依据。';

    var processAdvice =
      '管理上建议分档施策：对焦化工序维持现有低碳优势并固化 SOP；重点推进烧结、高炉炼铁两大核心工序对标行业先进实施节能降碳；' +
      '针对球团、转炉、辅助工序制定专项提升方案；规范各工序碳数据采集核算，建立工序碳强度月度跟踪机制，同步结合工序特征规划低碳改造。';

    var advantages = [
      '企业层面：综合碳排放强度优于河南省均值与全国行业均值，重点工序合并口径（烧结+炼铁）亦优于省内与行业均值，具备碳配额经营与低碳竞争力基础。',
      '工序层面：焦化工序行业排名第 ' + coke.rank + '，构成显著优势工序；烧结、高炉炼铁分列第 ' + sinter.rank + '、第 ' + blast.rank + '，主流程碳效整体可控，为后续对标先进提供抓手。'
    ];
    var weaknesses = gapToAdvanced > 0
      ? [
          '企业层面：距行业先进值仍保留约 ' + gapToAdvanced + ' tCO₂/t 差距，对应履约成本与碳资产管理仍有优化空间；生产工况与核算口径扰动会影响排名稳定性。',
          '工序层面：球团、转炉炼钢及辅助生产工序行业位次靠后（第 ' + pellet.rank + '/' + converter.rank + '/' + auxiliary.rank + '），制约企业级强度进一步下探；高炉系统作为配额敏感环节，对标先进仍有挖潜压力。'
        ]
      : [
          '企业层面：虽已贴近或优于行业先进值，领先优势仍受工况与口径扰动影响，需防范排名回落与富余配额管理粗放带来的机会损失。',
          '工序层面：球团、转炉炼钢及辅助生产工序行业位次靠后，仍制约结构优化；高炉系统作为配额敏感环节，对标头部先进仍有挖潜压力。'
        ];

    var actionSuggestions = [
      '对标行业先进烧结与高炉热工参数，推进环冷余热回收、高炉煤气高效发电（CCPP/TRT）与喷煤/富氧协同优化，优先申报国家及河南省节能降碳、超低排放协同技改资金。',
      '巩固焦化干熄焦与煤气回收优势，同步补齐球团能耗管控、转炉煤气回收及辅助公辅系统能效短板，形成“优势固化+薄弱专项整治”双轮路径。',
      '建立工序碳强度月度看板与配额盈缺联动模型，将降碳项目减排量纳入碳资产台账，争取绿色信贷、专项债及超低排放改造类财政支持。',
      '中长期布局废钢提升、绿电采购与富氢冶炼示范，对接产业链低碳产品认证，提升碳市场价格波动下的经营韧性。'
    ];

    // 潜力测算：正向差距；若已优于先进值，按向头部再降 0.05 tCO₂/t 测算巩固型潜力
    var potentialIntensityGap = gapToAdvanced > 0 ? gapToAdvanced : 0.05;
    var outputTon = outputWanTon * 10000;
    var totalPotentialTon = Math.round(outputTon * potentialIntensityGap);
    var processPotential = [
      {
        name: '高炉炼铁',
        share: 0.42,
        logic: '按企业级强度追赶先进值的差距中，高炉系统通常贡献最大份额；以差距×产量×贡献系数测算。'
      },
      {
        name: '烧结工序',
        share: 0.22,
        logic: '烧结燃料结构与热工效率改善可同步降碳、降本，按经验贡献约两成企业级潜力。'
      },
      {
        name: '转炉炼钢及废钢结构',
        share: 0.18,
        logic: '提高废钢比与煤气回收率，可降低转炉工序强度并拉动企业级指标。'
      },
      {
        name: '球团、焦化巩固及辅助系统',
        share: 0.18,
        logic: '优势工序维持 + 薄弱工序专项整治，贡献剩余可挖潜空间。'
      }
    ].map(function (item) {
      return {
        name: item.name,
        share: item.share,
        ton: Math.round(totalPotentialTon * item.share),
        logic: item.logic
      };
    });

    var potentialNarrative =
      '测算逻辑：以企业层级碳排放强度较行业先进值的差距（' + potentialIntensityGap +
      ' tCO₂/t）为挖潜空间，结合本周期钢材产量约 ' + outputWanTon +
      ' 万吨，估算月度理论减排潜力约 ' + totalPotentialTon.toLocaleString() +
      ' tCO₂（计算公式：减排潜力≈强度差距×产量）。再按长流程钢企经验将潜力拆分至主要工序——' +
      processPotential.map(function (p) {
        return p.name + '约 ' + Math.round(p.share * 100) + '%（约 ' + p.ton.toLocaleString() + ' tCO₂）';
      }).join('；') +
      '。上述潜力为理论上限，实际落地受技改投资节奏、炉况稳定性、绿电供给及政策资金到位情况影响；建议与国家节能降碳、超低排放改造类奖补资金申报节奏对齐，分年度兑现。';

    var dataSourceText =
      '本报告所有对标数据分为企业内部、外部基准两大来源：\n' +
      '1. 企业内部原始数据：取自企业智能碳管理系统、生产 DCS 系统、能源计量台账、排污监测平台，涵盖产品产量、能源消耗、碳排放量、碳排放强度、污染物实时排放、碳配额台账等全流程一手实测数据；\n' +
      '2. 外部对标基准数据：河南省行业统计年报、全国钢铁行业能效与碳排放基准、行业标杆企业公示指标，以及国家与地方环保、碳排管控标准文件；基准均采用当期官方有效数值，保障横纵向对标可比。';

    return {
      enterpriseName: enterpriseName,
      periodLabel: periodLabel,
      provinceName: '河南',
      provinceAvg: provinceAvg,
      industryAvg: industryAvg,
      industryAdvanced: industryAdvanced,
      enterpriseIntensity: enterpriseIntensity,
      enterpriseRank: enterpriseRank,
      totalEnterprises: totalEnterprises,
      quotaCombined: quotaCombined,
      quotaMetricLabel: quotaMetricLabel,
      quotaCalcNote: quotaCalcNote,
      processRanks: processRanks,
      positioning: positioning,
      quotaAnalysis: quotaAnalysis,
      quotaAdvice: quotaAdvice,
      enterpriseAnalysis: enterpriseAnalysis,
      enterpriseAdvice: enterpriseAdvice,
      processAnalysis: processAnalysis,
      processAnalysisItems: processAnalysisItems,
      processAdvice: processAdvice,
      advantages: advantages,
      weaknesses: weaknesses,
      actionSuggestions: actionSuggestions,
      potentialNarrative: potentialNarrative,
      processPotential: processPotential,
      totalPotentialTon: totalPotentialTon,
      potentialIntensityGap: potentialIntensityGap,
      outputWanTon: outputWanTon,
      dataSourceText: dataSourceText
    };
  },

  /** 重点工序对标表（含计算维度说明 + 合并口径一行；基准取合并口径专属值） */
  _buildQuotaBenchmarkTableHTML: function (model) {
    var row = model.quotaCombined || {};
    return '<table class="data-table data-table--quota">' +
      '<tbody>' +
        '<tr class="calc-dim-row">' +
          '<th class="calc-dim-label">计算维度</th>' +
          '<td class="calc-dim-body" colspan="5">' +
            '<div class="calc-dim-metric"><strong>数据指标：</strong>' + BenchmarkReport.escape(model.quotaMetricLabel || '') + '</div>' +
            '<div class="calc-dim-note"><strong>计算说明：</strong>' + BenchmarkReport.escape(model.quotaCalcNote || '') + '</div>' +
          '</td>' +
        '</tr>' +
        '<tr>' +
          '<th></th>' +
          '<th>企业数据</th>' +
          '<th>行业排名</th>' +
          '<th>' + BenchmarkReport.escape(model.provinceName) + '省平均值</th>' +
          '<th>行业平均值</th>' +
          '<th>行业先进值</th>' +
        '</tr>' +
        '<tr class="highlight">' +
          '<td>' + BenchmarkReport.escape(row.name || '') + '</td>' +
          '<td>' + (row.intensity != null ? row.intensity : '—') + '</td>' +
          '<td>' + (row.rank != null ? row.rank : '—') + '</td>' +
          '<td>' + (row.provinceAvg != null ? row.provinceAvg : model.provinceAvg) + '</td>' +
          '<td>' + (row.industryAvg != null ? row.industryAvg : model.industryAvg) + '</td>' +
          '<td>' + (row.industryAdvanced != null ? row.industryAdvanced : model.industryAdvanced) + '</td>' +
        '</tr>' +
      '</tbody></table>';
  },

  _buildProcessRankTableHTML: function (rows, provinceName, provinceAvg, industryAvg, industryAdvanced) {
    var trs = rows.map(function (row) {
      return '<tr>' +
        '<td>' + BenchmarkReport.escape(row.name) + '</td>' +
        '<td>' + row.intensity + '</td>' +
        '<td>' + row.rank + '</td>' +
        '<td>' + (row.provinceAvg != null ? row.provinceAvg : provinceAvg) + '</td>' +
        '<td>' + (row.industryAvg != null ? row.industryAvg : industryAvg) + '</td>' +
        '<td>' + (row.industryAdvanced != null ? row.industryAdvanced : industryAdvanced) + '</td>' +
        '</tr>';
    }).join('');
    return '<table class="data-table">' +
      '<thead>' +
        '<tr class="metric-row"><th>工序层级</th><th colspan="5" class="metric-cell">数据指标：碳排放强度（tCO₂/t）</th></tr>' +
        '<tr>' +
          '<th></th>' +
          '<th>企业数据</th>' +
          '<th>行业排名</th>' +
          '<th>' + BenchmarkReport.escape(provinceName) + '省平均值</th>' +
          '<th>行业平均值</th>' +
          '<th>行业先进值</th>' +
        '</tr>' +
      '</thead><tbody>' + trs + '</tbody></table>';
  },

  _buildEnterpriseRankTableHTML: function (model) {
    return '<table class="data-table">' +
      '<thead>' +
        '<tr class="metric-row"><th>企业层级</th><th colspan="5" class="metric-cell">数据指标：碳排放强度（tCO₂/t）</th></tr>' +
        '<tr>' +
          '<th></th>' +
          '<th>企业数据</th>' +
          '<th>行业排名</th>' +
          '<th>' + BenchmarkReport.escape(model.provinceName) + '省平均值</th>' +
          '<th>行业平均值</th>' +
          '<th>行业先进值</th>' +
        '</tr>' +
      '</thead><tbody><tr class="highlight">' +
        '<td>企业层级</td>' +
        '<td>' + model.enterpriseIntensity + '</td>' +
        '<td>' + model.enterpriseRank + '</td>' +
        '<td>' + model.provinceAvg + '</td>' +
        '<td>' + model.industryAvg + '</td>' +
        '<td>' + model.industryAdvanced + '</td>' +
      '</tr></tbody></table>';
  },

  _buildAnalysisBlockHTML: function (analysisText, adviceText) {
    return '<div class="insight-grid">' +
      '<div class="insight-card">' +
        '<div class="insight-card__label">数据分析</div>' +
        '<p>' + BenchmarkReport.escape(analysisText) + '</p>' +
      '</div>' +
      '<div class="insight-card insight-card--advice">' +
        '<div class="insight-card__label">建议方案</div>' +
        '<p>' + BenchmarkReport.escape(adviceText) + '</p>' +
      '</div>' +
    '</div>';
  },

  /** 工序对标：数据分析按工序类型分别罗列 */
  _buildProcessAnalysisBlockHTML: function (model) {
    var items = (model && model.processAnalysisItems) || [];
    var listHtml = items.length
      ? '<ul class="process-insight-list">' + items.map(function (t) {
          return '<li>' + BenchmarkReport.escape(t) + '</li>';
        }).join('') + '</ul>' +
        '<p class="process-insight-summary">' + BenchmarkReport.escape(
          '综合看，焦化、烧结、高炉等主工序在可比口径下优于河南省均值与行业均值，但球团、转炉及辅助工序强度高于对应基准、距离行业先进仍有差距；炉况、检修与核算边界差异会影响指标与排名，宜作管理导向而非唯一考核依据。'
        ) + '</p>'
      : '<p>' + BenchmarkReport.escape((model && model.processAnalysis) || '') + '</p>';

    return '<div class="insight-grid">' +
      '<div class="insight-card">' +
        '<div class="insight-card__label">数据分析</div>' +
        listHtml +
      '</div>' +
      '<div class="insight-card insight-card--advice">' +
        '<div class="insight-card__label">建议方案</div>' +
        '<p>' + BenchmarkReport.escape((model && model.processAdvice) || '') + '</p>' +
      '</div>' +
    '</div>';
  },

  buildSwotHTML: function (model) {
    var pros = (model && model.advantages) || [];
    var cons = (model && model.weaknesses) || [];
    return '<div class="swot">' +
      '<div class="swot-col"><h4>优势</h4><ul>' +
        pros.map(function (p) { return '<li>' + BenchmarkReport.escape(p) + '</li>'; }).join('') +
      '</ul></div>' +
      '<div class="swot-col"><h4>短板</h4><ul>' +
        cons.map(function (c) { return '<li>' + BenchmarkReport.escape(c) + '</li>'; }).join('') +
      '</ul></div></div>';
  },

  buildTipsHTML: function (tips) {
    if (!tips || !tips.length) return '<p class="muted">暂无专项建议</p>';
    return '<ol class="action-list">' + tips.map(function (t, i) {
      return '<li><span class="action-no">' + (i + 1) + '</span>' + BenchmarkReport.escape(t) + '</li>';
    }).join('') + '</ol>';
  },

  buildReductionPotentialHTML: function (model) {
    if (!model) return '<p class="muted">暂无减排潜力分析数据</p>';
    var cards = (model.processPotential || []).map(function (item, i) {
      return '<div class="potential-card">' +
        '<div class="potential-card__head">' +
          '<span class="potential-no">' + (i + 1) + '</span>' +
          '<strong>' + BenchmarkReport.escape(item.name) + '</strong>' +
          '<span class="potential-share">贡献约 ' + Math.round(item.share * 100) + '%</span>' +
        '</div>' +
        '<p class="potential-detail">' + BenchmarkReport.escape(item.logic) + '</p>' +
        '<div class="potential-benefit">' +
          '测算减排潜力约 <strong>' + (item.ton || 0).toLocaleString() + ' tCO₂</strong>/月' +
        '</div></div>';
    }).join('');

    return '<div class="potential-summary">' + BenchmarkReport.escape(model.potentialNarrative) + '</div>' +
      '<div class="potential-grid">' + cards + '</div>' +
      '<p class="potential-footnote">* 测算公式：月度理论减排潜力 ≈（企业强度 − 行业先进值）× 本周期产量；工序拆分系按长流程钢企经验系数估算，实施效果以项目后评估为准。</p>';
  },

  buildDataSourceHTML: function (model) {
    var lines = (model.dataSourceText || '').split('\n').filter(Boolean);
    return '<div class="section" id="s-source"><h2>数据来源</h2>' +
      lines.map(function (line) {
        return '<p class="source-p">' + BenchmarkReport.escape(line) + '</p>';
      }).join('') +
      '</div>';
  },

  /**
   * 在新标签页打开报告预览
   */
  openPreviewInNewTab: function (payload, chartId) {
    var html = this._composeReportHTML(payload, chartId);
    if (!html) return false;
    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(function () { URL.revokeObjectURL(url); }, 120000);
    return true;
  },

  /**
   * 生成 HTML 报告并下载
   */
  generateHTMLReport: function (payload, chartId) {
    var html = this._composeReportHTML(payload, chartId);
    if (!html) return false;
    var dateStr = this.formatDate();
    var model = this.buildSteelReportModel(payload);
    var fileName = model.enterpriseName + '智能对标分析报告_' + dateStr + '.html';
    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  },

  _composeReportHTML: function (payload, chartId) {
    if (!payload || !payload.result) return '';

    var result = payload.result;
    var ranking = result.rankingMeta || {};
    var gradeInfo = this.computeGrade(ranking);
    var model = this.buildSteelReportModel(payload);
    var now = new Date();
    var dateStr = this.formatDate(now);
    var summary = payload.summary || (model.enterpriseName + '经营与双碳智能对标分析');

    var html = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + BenchmarkReport.escape(model.enterpriseName) + '智能对标分析报告 · ' + dateStr + '</title>' +
      '<style>' +
        ':root{--navy:#0c2340;--green:#0b6e3a;--gray:#5a6472;--line:#e6eaf0;--bg:#f4f6f9}' +
        '*{box-sizing:border-box}' +
        'body{margin:0;font-family:"PingFang SC","Helvetica Neue","Microsoft YaHei",Arial,sans-serif;background:var(--bg);color:#1f2937;line-height:1.7}' +
        '.page{max-width:960px;flex:0 1 960px;width:100%;background:#fff;box-shadow:0 8px 40px rgba(12,35,64,.08)}' +
        '.header{background:linear-gradient(135deg,#0c2340 0%,#123d6b 55%,#0b6e3a 100%);color:#fff;padding:40px 48px 32px}' +
        '.brand{font-size:12px;letter-spacing:.12em;opacity:.75;text-transform:uppercase}' +
        '.header h1{margin:12px 0 8px;font-size:26px;font-weight:600;line-height:1.35}' +
        '.header .sub{font-size:14px;opacity:.88}' +
        '.meta-bar{display:flex;flex-wrap:wrap;gap:20px;padding:14px 48px;background:#f8fafc;border-bottom:1px solid var(--line);font-size:12px;color:var(--gray)}' +
        '.content{padding:32px 48px 48px}' +
        '.toc{background:#f8fafc;border:1px solid var(--line);border-radius:10px;padding:18px 22px;margin-bottom:28px}' +
        '.toc h3{margin:0 0 10px;font-size:13px;color:var(--navy)}' +
        '.toc ol{margin:0;padding-left:18px;font-size:13px;color:var(--gray)}' +
        '.toc li{margin:4px 0}' +
        '.section{margin-bottom:28px;page-break-inside:avoid}' +
        '.section h2{margin:0 0 14px;font-size:18px;color:var(--navy);padding-bottom:8px;border-bottom:2px solid var(--green)}' +
        '.section h3{margin:18px 0 12px;font-size:15px;color:var(--navy)}' +
        '.lead{font-size:14px;color:#374151;margin:0 0 16px;line-height:1.85}' +
        '.data-table{width:100%;border-collapse:collapse;font-size:12.5px;margin:12px 0 16px}' +
        '.data-table th,.data-table td{border:1px solid var(--line);padding:10px 10px;text-align:center;vertical-align:middle}' +
        '.data-table th{background:#eef5f0;color:var(--navy);font-weight:600}' +
        '.data-table td:first-child,.data-table th:first-child{text-align:left}' +
        '.data-table tr.highlight{background:#f0faf3;font-weight:600}' +
        '.data-table .metric-row th{background:#f4f7fb;text-align:left;font-weight:600}' +
        '.data-table .metric-cell{text-align:left;font-weight:500;color:#374151}' +
        '.data-table--quota .calc-dim-label{background:#eef5f0;width:88px;vertical-align:top}' +
        '.data-table--quota .calc-dim-body{text-align:left;background:#f8fafc;padding:12px 14px}' +
        '.calc-dim-metric,.calc-dim-note{font-size:12.5px;color:#374151;line-height:1.7;font-weight:400}' +
        '.calc-dim-note{margin-top:6px;color:#5a6472}' +
        '.th-sub{display:block;font-weight:400;font-size:11px;color:var(--gray);margin-top:2px}' +
        '.section-sub{margin:0 0 12px;font-size:14px;font-weight:600;color:var(--navy);text-align:center}' +
        '.insight-grid{display:grid;grid-template-columns:1fr;gap:12px;margin-bottom:8px}' +
        '.insight-card{background:#fafbfc;border:1px solid var(--line);border-radius:10px;padding:14px 16px}' +
        '.insight-card--advice{background:linear-gradient(180deg,#f6fffb,#fff);border-color:#c8e6c9}' +
        '.insight-card__label{font-size:12px;font-weight:600;color:var(--navy);margin-bottom:8px;letter-spacing:.04em}' +
        '.insight-card p{margin:0;font-size:13px;color:#374151;line-height:1.8;text-align:justify}' +
        '.process-insight-list{margin:0 0 10px;padding-left:18px;font-size:13px;color:#374151;line-height:1.75}' +
        '.process-insight-list li{margin:0 0 8px;text-align:justify}' +
        '.process-insight-summary{margin:0;font-size:13px;color:#374151;line-height:1.8;text-align:justify}' +
        '.swot{display:grid;grid-template-columns:1fr 1fr;gap:16px}' +
        '.swot-col{background:#fafbfc;border:1px solid var(--line);border-radius:10px;padding:16px 18px}' +
        '.swot-col h4{margin:0 0 10px;font-size:13px;color:var(--navy)}' +
        '.swot-col ul{margin:0;padding-left:18px;font-size:13px;color:#374151;line-height:1.75}' +
        '.action-list{margin:0;padding:0;list-style:none}' +
        '.action-list li{display:flex;gap:10px;margin-bottom:12px;font-size:13.5px;line-height:1.75;color:#374151}' +
        '.action-no{flex-shrink:0;width:22px;height:22px;border-radius:50%;background:var(--green);color:#fff;font-size:12px;display:inline-flex;align-items:center;justify-content:center;margin-top:2px}' +
        '.potential-summary{background:linear-gradient(180deg,#fffbeb,#fff);border:1px solid #fde68a;border-radius:12px;padding:18px 20px;font-size:13.5px;color:#374151;margin-bottom:18px;line-height:1.85;text-align:justify}' +
        '.potential-grid{display:grid;grid-template-columns:1fr;gap:14px}' +
        '.potential-card{background:#fafbfc;border:1px solid var(--line);border-radius:10px;padding:16px 18px}' +
        '.potential-card__head{display:flex;align-items:center;gap:10px;margin-bottom:8px;color:var(--navy);font-size:15px;flex-wrap:wrap}' +
        '.potential-no{width:24px;height:24px;border-radius:50%;background:var(--green);color:#fff;font-size:12px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}' +
        '.potential-share{margin-left:auto;font-size:12px;color:var(--gray);font-weight:400}' +
        '.potential-detail{margin:0 0 10px;font-size:13px;color:#4b5563;line-height:1.65}' +
        '.potential-benefit{font-size:13px;color:var(--navy);background:#eef5f0;border-radius:8px;padding:10px 12px}' +
        '.potential-benefit strong{color:var(--green)}' +
        '.potential-footnote{margin-top:14px;font-size:11px;color:#9ca3af}' +
        '.source-p{font-size:13px;color:#374151;line-height:1.85;margin:0 0 12px;text-align:justify}' +
        (typeof BenchmarkBrand !== 'undefined' ? BenchmarkBrand.referencesReportStyles() : '') +
        BenchmarkReportShare.buildStyles() +
        '.footer{margin-top:36px;padding-top:18px;border-top:1px solid var(--line);font-size:11px;color:#9ca3af;text-align:center;line-height:1.8}' +
        '.muted{color:#9ca3af;font-size:13px}' +
        '@media(max-width:720px){.swot{grid-template-columns:1fr}.header,.meta-bar,.content{padding-left:20px;padding-right:20px}.potential-share{margin-left:0}}' +
      '</style></head><body>' +
      '<div class="report-shell">' +
      '<div class="page">' +
        '<div class="header">' +
          '<div class="brand">Steel Intelligent Benchmark Report</div>' +
          '<h1>' + BenchmarkReport.escape(model.enterpriseName) + '智能对标分析报告</h1>' +
          '<div class="sub">' + BenchmarkReport.escape(summary) + '<br>统计周期：' + BenchmarkReport.escape(model.periodLabel) + '（月度）</div>' +
        '</div>' +
        '<div class="meta-bar">' +
          '<span>报告编号：CB-' + Date.now().toString(36).toUpperCase() + '</span>' +
          '<span>生成时间：' + now.toLocaleString('zh-CN') + '</span>' +
          '<span>出品：佳华智联 · 数据对标智能体</span>' +
        '</div>' +
        '<div class="content">' +
          '<div class="toc"><h3>目录</h3><ol>' +
            '<li>报告定位与核心思路</li>' +
            '<li>和重点工序对标（' + BenchmarkReport.escape(model.periodLabel) + '）</li>' +
            '<li>企业碳排放强度数据对标（' + BenchmarkReport.escape(model.periodLabel) + '）</li>' +
            '<li>工序碳排放强度数据对标（' + BenchmarkReport.escape(model.periodLabel) + '）</li>' +
            '<li>优势与短板</li>' +
            '<li>降碳行动建议</li>' +
            '<li>企业减排潜力深度分析</li>' +
            '<li>数据来源</li>' +
          '</ol></div>' +

          '<div class="section" id="s1"><h2>01 · 报告定位与核心思路</h2>' +
            '<p class="lead">' + BenchmarkReport.escape(model.positioning) + '</p></div>' +

          '<div class="section" id="s2"><h2>02 · 和重点工序对标（' + BenchmarkReport.escape(model.periodLabel) + '）</h2>' +
            this._buildQuotaBenchmarkTableHTML(model) +
            this._buildAnalysisBlockHTML(model.quotaAnalysis, model.quotaAdvice) +
          '</div>' +

          '<div class="section" id="s3"><h2>03 · 企业碳排放强度数据对标（' + BenchmarkReport.escape(model.periodLabel) + '）</h2>' +
            '<p class="section-sub">企业层级碳排放强度排名</p>' +
            this._buildEnterpriseRankTableHTML(model) +
            this._buildAnalysisBlockHTML(model.enterpriseAnalysis, model.enterpriseAdvice) +
          '</div>' +

          '<div class="section" id="s4"><h2>04 · 工序碳排放强度数据对标（' + BenchmarkReport.escape(model.periodLabel) + '）</h2>' +
            '<p class="section-sub">工序层级碳排放强度排名</p>' +
            this._buildProcessRankTableHTML(model.processRanks, model.provinceName, model.provinceAvg, model.industryAvg, model.industryAdvanced) +
            this._buildProcessAnalysisBlockHTML(model) +
          '</div>' +

          '<div class="section" id="s5"><h2>05 · 优势与短板</h2>' +
            this.buildSwotHTML(model) + '</div>' +

          '<div class="section" id="s6"><h2>06 · 降碳行动建议</h2>' +
            this.buildTipsHTML(model.actionSuggestions) + '</div>' +

          '<div class="section" id="s7"><h2>07 · 企业减排潜力深度分析</h2>' +
            this.buildReductionPotentialHTML(model) + '</div>' +

          this.buildDataSourceHTML(model) +

          '<div class="footer">' +
            '免责声明：本报告由佳华科技数字碳表 AI 基于系统接入及业务平台数据自动生成，仅供内部决策参考，不构成任何法律或审计意见。<br>' +
            '行业排名与外部基准来源于官方统计及行业公示口径，工序边界差异可能导致指标扰动。<br>' +
            '© ' + now.getFullYear() + ' 数字碳表 Digital Carbon Platform · Confidential' +
          '</div>' +
        '</div></div>' +
      BenchmarkReportShare.buildFloatBarHTML() +
      '</div>' +
      BenchmarkReportShare.buildOverlaysHTML() +
      BenchmarkReportShare.buildScripts({
        emailSubject: '【' + model.enterpriseName + '智能对标分析报告】企业碳效对标诊断',
        emailBody: BenchmarkReportShare.buildEmailBody({
          grade: gradeInfo.grade,
          gradeLabel: gradeInfo.label,
          rankLine: '【企业层级行业排名】第 ' + model.enterpriseRank + ' / ' + model.totalEnterprises + ' 名',
          summaryLine: '【较行业先进值差距】' + model.potentialIntensityGap + ' tCO₂/t · 月度理论减排潜力约 ' + model.totalPotentialTon.toLocaleString() + ' tCO₂',
          conclusion: model.enterpriseAnalysis,
          gradeSummary: model.positioning
        }),
        pdfFileName: model.enterpriseName + '智能对标分析报告_' + dateStr + '.pdf',
        imageFileName: model.enterpriseName + '智能对标分析报告长图_' + dateStr + '.png'
      }) +
      '</body></html>';

    return html;
  },

  /** 离屏渲染容器（保持在视口内但不可见，避免浏览器跳过 Canvas 绘制） */
  _createChartHost: function (w, h) {
    var wrap = document.createElement('div');
    wrap.setAttribute('data-benchmark-export', '1');
    wrap.style.cssText = [
      'position:fixed',
      'left:0',
      'top:0',
      'width:' + w + 'px',
      'height:' + h + 'px',
      'opacity:0.01',
      'pointer-events:none',
      'z-index:-1',
      'overflow:hidden'
    ].join(';');

    var inner = document.createElement('div');
    inner.style.width = w + 'px';
    inner.style.height = h + 'px';
    wrap.appendChild(inner);
    document.body.appendChild(wrap);
    return { wrap: wrap, inner: inner };
  },

  _removeChartHost: function (host) {
    if (host && host.wrap && host.wrap.parentNode) {
      host.wrap.parentNode.removeChild(host.wrap);
    }
  },

  /** 强制 ECharts 完成一帧绘制后再导出 */
  _flushChart: function (chart) {
    if (!chart) return;
    try {
      chart.resize();
      var zr = chart.getZr && chart.getZr();
      if (zr) {
        if (typeof zr.refreshImmediately === 'function') zr.refreshImmediately();
        else if (typeof zr.flush === 'function') zr.flush();
        if (zr.painter && typeof zr.painter.refresh === 'function') zr.painter.refresh();
      }
    } catch (e) { /* ignore */ }
  },

  _exportChartImage: function (chart) {
    if (!chart) return '';
    try {
      var url = chart.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      if (!url || url.length < 200) return '';
      return url;
    } catch (e) {
      return '';
    }
  },

  /**
   * 异步离屏渲染 ECharts 并导出 Base64（解决同步导出空白问题）
   */
  _renderSnapshotAsync: function (width, height, buildOption) {
    var self = this;
    return new Promise(function (resolve) {
      if (typeof echarts === 'undefined') {
        resolve('');
        return;
      }

      var host = self._createChartHost(width, height);
      var chart = null;

      try {
        chart = echarts.init(host.inner, null, {
          renderer: 'canvas',
          width: width,
          height: height
        });
        var option = buildOption();
        chart.setOption(option, { notMerge: true, lazyUpdate: false });
        self._flushChart(chart);
      } catch (e) {
        if (chart) chart.dispose();
        self._removeChartHost(host);
        resolve('');
        return;
      }

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          self._flushChart(chart);
          var img = self._exportChartImage(chart);
          chart.dispose();
          self._removeChartHost(host);
          resolve(img);
        });
      });
    });
  },

  _buildCompareCoreMetricsOption: function (detail) {
    var cats = ['碳排放强度', '综合能耗', '绿电占比'];
    var selfVals = [detail.selfIntensity, detail.selfComEnergy, detail.selfGreenPct];
    var targetVals = [detail.targetIntensity, detail.targetComEnergy, detail.targetGreenPct];
    var units = [detail.unit, detail.comEnergyUnit, '%'];
    var indexTarget = [100, 100, 100];
    var indexSelf = cats.map(function (_, i) {
      var t = targetVals[i] || 1;
      return Math.round((selfVals[i] / t) * 1000) / 10;
    });

    return {
      backgroundColor: '#ffffff',
      color: ['#0b6e3a', '#123d6b'],
      animation: false,
      title: {
        text: '核心指标对比（对标指数 · 标杆=100）',
        left: 'center',
        top: 8,
        textStyle: { fontSize: 14, color: '#0c2340', fontWeight: 600 }
      },
      legend: { top: 36, data: [detail.selfName, detail.targetName], textStyle: { color: '#5a6472' } },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: function (params) {
          if (!params || !params.length) return '';
          var idx = params[0].dataIndex;
          return cats[idx] + '<br/>' +
            detail.selfName + '：' + selfVals[idx] + ' ' + units[idx] + '<br/>' +
            detail.targetName + '：' + targetVals[idx] + ' ' + units[idx];
        }
      },
      grid: { left: 56, right: 28, top: 72, bottom: 48 },
      xAxis: {
        type: 'category',
        data: cats,
        axisLabel: { color: '#5a6472', fontSize: 12 }
      },
      yAxis: {
        type: 'value',
        name: '对标指数',
        max: Math.max(120, Math.ceil(Math.max.apply(null, indexSelf.concat(indexTarget)) * 1.15)),
        axisLabel: { color: '#5a6472' },
        splitLine: { lineStyle: { color: '#e6eaf0' } }
      },
      series: [
        {
          name: detail.selfName,
          type: 'bar',
          barWidth: 32,
          data: indexSelf.map(function (v, i) {
            return {
              value: v,
              label: {
                show: true,
                position: 'top',
                fontSize: 10,
                formatter: selfVals[i] + ' ' + units[i]
              }
            };
          })
        },
        {
          name: detail.targetName,
          type: 'bar',
          barWidth: 32,
          data: indexTarget.map(function (v, i) {
            return {
              value: v,
              label: {
                show: true,
                position: 'top',
                fontSize: 10,
                formatter: targetVals[i] + ' ' + units[i]
              }
            };
          })
        }
      ]
    };
  },

  _buildCompareHealthRadarOption: function (detail) {
    return {
      backgroundColor: '#ffffff',
      color: ['#0b6e3a', '#123d6b'],
      animation: false,
      title: {
        text: '碳效健康度多维对比',
        left: 'center',
        top: 8,
        textStyle: { fontSize: 14, color: '#0c2340', fontWeight: 600 }
      },
      legend: { bottom: 8, data: [detail.selfName, detail.targetName] },
      radar: {
        indicator: detail.healthIndicators,
        center: ['50%', '52%'],
        radius: '58%',
        axisName: { color: '#5a6472', fontSize: 12 },
        splitLine: { lineStyle: { color: '#e6eaf0' } },
        splitArea: { areaStyle: { color: ['#ffffff', '#f4f6f9'] } },
        axisLine: { lineStyle: { color: '#d1d9e6' } }
      },
      series: [{
        type: 'radar',
        animation: false,
        data: [
          { name: detail.selfName, value: detail.selfHealth, areaStyle: { opacity: 0.28 }, lineStyle: { width: 2 } },
          { name: detail.targetName, value: detail.targetHealth, areaStyle: { opacity: 0.18 }, lineStyle: { width: 2 } }
        ]
      }]
    };
  },

  _buildCompareWaterfallOption: function (detail) {
    var steps = detail.waterfallSteps || [];
    var labels = steps.map(function (s) { return s.name; });

    if (detail.isSelfBetter) {
      return {
        backgroundColor: '#ffffff',
        color: ['#123d6b', '#0b6e3a', '#6ee7a0'],
        animation: false,
        title: { text: '碳强度领先路径示意', left: 'center', top: 8, textStyle: { fontSize: 14, color: '#0c2340' } },
        tooltip: { trigger: 'axis' },
        grid: { left: 56, right: 24, top: 48, bottom: 56 },
        xAxis: { type: 'category', data: labels, axisLabel: { color: '#5a6472', rotate: 15, fontSize: 11 } },
        yAxis: { type: 'value', name: detail.unit, axisLabel: { color: '#5a6472' }, splitLine: { lineStyle: { color: '#e6eaf0' } } },
        series: [{
          type: 'bar',
          barWidth: 48,
          data: steps.map(function (s) { return s.value; }),
          label: { show: true, position: 'top', formatter: '{c}' }
        }]
      };
    }

    var assist = [];
    var barValues = [];
    var barColors = [];
    var cumulative = steps[0].value;
    assist.push(0);
    barValues.push(cumulative);
    barColors.push('#123d6b');

    for (var i = 1; i < steps.length - 1; i++) {
      assist.push(cumulative);
      barValues.push(steps[i].value);
      barColors.push('#f59e0b');
      cumulative += steps[i].value;
    }
    assist.push(0);
    barValues.push(steps[steps.length - 1].value);
    barColors.push('#0b6e3a');

    return {
      backgroundColor: '#ffffff',
      animation: false,
      title: { text: '碳强度差距分解（标杆 → 本企业）', left: 'center', top: 8, textStyle: { fontSize: 14, color: '#0c2340' } },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          var p = params[1] || params[0];
          var idx = p.dataIndex;
          var step = steps[idx];
          if (!step) return '';
          if (idx === 0 || idx === steps.length - 1) return step.name + '：' + step.value + ' ' + detail.unit;
          return step.name + '：+' + step.value + ' ' + detail.unit;
        }
      },
      grid: { left: 56, right: 24, top: 48, bottom: 72 },
      xAxis: { type: 'category', data: labels, axisLabel: { color: '#5a6472', rotate: 18, fontSize: 10 } },
      yAxis: { type: 'value', name: detail.unit, axisLabel: { color: '#5a6472' }, splitLine: { lineStyle: { color: '#e6eaf0' } } },
      series: [
        {
          name: '辅助',
          type: 'bar',
          stack: 'wf',
          silent: true,
          itemStyle: { color: 'rgba(0,0,0,0)', borderColor: 'rgba(0,0,0,0)' },
          emphasis: { disabled: true },
          data: assist
        },
        {
          name: '碳强度',
          type: 'bar',
          stack: 'wf',
          barWidth: 44,
          data: barValues.map(function (v, i) {
            return {
              value: v,
              itemStyle: { color: barColors[i] },
              label: {
                show: true,
                position: i === 0 || i === barValues.length - 1 ? 'top' : 'inside',
                fontSize: 10,
                color: i === 0 || i === barValues.length - 1 ? '#333' : '#fff',
                formatter: i === 0 || i === barValues.length - 1
                  ? String(v)
                  : ('+' + steps[i].value)
              }
            };
          })
        }
      ]
    };
  },

  /** 批量异步渲染对比报告图表 */
  _renderAllCompareChartsAsync: function (detail) {
    var self = this;
    var d = detail;
    return Promise.all([
      self._renderSnapshotAsync(760, 420, function () { return self._buildCompareCoreMetricsOption(d); }),
      self._renderSnapshotAsync(720, 440, function () { return self._buildCompareHealthRadarOption(d); }),
      self._renderSnapshotAsync(760, 400, function () { return self._buildCompareWaterfallOption(d); })
    ]).then(function (imgs) {
      return { core: imgs[0], radar: imgs[1], waterfall: imgs[2] };
    });
  },

  /** 核心指标对比柱状图 Base64（同步兼容，优先异步） */
  renderCompareCoreMetricsBase64: function (detail) {
    /* 同步路径保留给旧调用；对比报告请走 generateComparisonReport 异步流程 */
    if (typeof echarts === 'undefined' || !detail) return '';
    var host = this._createChartHost(760, 420);
    var chart = echarts.init(host.inner, null, { renderer: 'canvas', width: 760, height: 420 });
    chart.setOption(this._buildCompareCoreMetricsOption(detail), { notMerge: true, lazyUpdate: false });
    this._flushChart(chart);
    var img = this._exportChartImage(chart);
    chart.dispose();
    this._removeChartHost(host);
    return img;
  },

  renderCompareHealthRadarBase64: function (detail) {
    if (typeof echarts === 'undefined' || !detail) return '';
    var host = this._createChartHost(720, 440);
    var chart = echarts.init(host.inner, null, { renderer: 'canvas', width: 720, height: 440 });
    chart.setOption(this._buildCompareHealthRadarOption(detail), { notMerge: true, lazyUpdate: false });
    this._flushChart(chart);
    var img = this._exportChartImage(chart);
    chart.dispose();
    this._removeChartHost(host);
    return img;
  },

  renderCompareWaterfallBase64: function (detail) {
    if (typeof echarts === 'undefined' || !detail || !detail.waterfallSteps) return '';
    var host = this._createChartHost(760, 400);
    var chart = echarts.init(host.inner, null, { renderer: 'canvas', width: 760, height: 400 });
    chart.setOption(this._buildCompareWaterfallOption(detail), { notMerge: true, lazyUpdate: false });
    this._flushChart(chart);
    var img = this._exportChartImage(chart);
    chart.dispose();
    this._removeChartHost(host);
    return img;
  },

  buildCompareActionsHTML: function (actions) {
    if (!actions || !actions.length) return '<p class="muted">暂无行动建议</p>';
    return actions.map(function (a, i) {
      return '<div class="ai-action-card">' +
        '<div class="ai-action-card__head"><span class="action-no">' + (i + 1) + '</span><strong>' +
          BenchmarkReport.escape(a.title) + '</strong></div>' +
        '<p>' + BenchmarkReport.escape(a.body) + '</p></div>';
    }).join('');
  },

  buildCompareExecSummaryHTML: function (lines) {
    return lines.map(function (line) {
      return '<p class="exec-line">' + BenchmarkReport.escape(line) + '</p>';
    }).join('');
  },

  /** @deprecated 保留兼容，内部转调新图表 */
  renderCompareBarBase64: function (metrics) {
    var detail = metrics.healthIndicators ? metrics : metrics;
    if (!detail.selfComEnergy && typeof BenchmarkDataService !== 'undefined') {
      return this.renderCompareCoreMetricsBase64(metrics);
    }
    return this.renderCompareCoreMetricsBase64(detail);
  },

  /** @deprecated 保留兼容 */
  renderCompareRadarBase64: function (selfRanking, targetRow) {
    if (typeof BenchmarkDataService === 'undefined') return '';
    var detail = BenchmarkDataService.buildCompareDetailMetrics(selfRanking, targetRow);
    return this.renderCompareHealthRadarBase64(detail);
  },

  /**
   * 组装对比报告 HTML 字符串
   */
  _buildComparisonReportHTML: function (opts) {
    var detail = opts.detail;
    var execLines = opts.execLines;
    var aiActions = opts.aiActions;
    var gradeInfo = opts.gradeInfo;
    var summary = opts.summary;
    var now = opts.now;
    var dateStr = opts.dateStr;
    var images = opts.images;

    var coreBarImg = images.core;
    var radarImg = images.radar;
    var waterfallImg = images.waterfall;

    return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>企业间对标分析报告 · ' + dateStr + '</title>' +
      '<style>' +
        ':root{--navy:#0c2340;--green:#0b6e3a;--gray:#5a6472;--line:#e6eaf0;--bg:#f4f6f9}' +
        '*{box-sizing:border-box}' +
        'body{margin:0;font-family:"PingFang SC","Helvetica Neue","Microsoft YaHei",Arial,sans-serif;background:var(--bg);color:#1f2937;line-height:1.7}' +
        '.page{max-width:960px;flex:0 1 960px;width:100%;background:#fff;box-shadow:0 8px 40px rgba(12,35,64,.08)}' +
        '.header{background:linear-gradient(135deg,#0c2340 0%,#123d6b 55%,#0b6e3a 100%);color:#fff;padding:40px 48px 32px}' +
        '.header-top{display:flex;justify-content:space-between;align-items:flex-start;gap:24px}' +
        '.brand{font-size:12px;letter-spacing:.12em;opacity:.75;text-transform:uppercase}' +
        '.header h1{margin:12px 0 8px;font-size:26px;font-weight:600;line-height:1.35}' +
        '.header .sub{font-size:14px;opacity:.9;line-height:1.6}' +
        '.vs-badge{min-width:120px;text-align:center;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:12px;padding:14px 16px;font-size:12px;line-height:1.6}' +
        '.vs-badge strong{display:block;font-size:15px;margin-top:4px}' +
        '.meta-bar{display:flex;flex-wrap:wrap;gap:20px;padding:14px 48px;background:#f8fafc;border-bottom:1px solid var(--line);font-size:12px;color:var(--gray)}' +
        '.content{padding:32px 48px 48px}' +
        '.toc{background:#f8fafc;border:1px solid var(--line);border-radius:10px;padding:18px 22px;margin-bottom:28px}' +
        '.toc h3{margin:0 0 10px;font-size:13px;color:var(--navy)}' +
        '.toc ol{margin:0;padding-left:18px;font-size:13px;color:var(--gray)}' +
        '.toc li{margin:4px 0}' +
        '.section{margin-bottom:32px;page-break-inside:avoid}' +
        '.section h2{margin:0 0 14px;font-size:18px;color:var(--navy);padding-bottom:8px;border-bottom:2px solid var(--green)}' +
        '.exec-box{background:linear-gradient(180deg,#f6fffb,#fff);border:1px solid #c8e6c9;border-radius:12px;padding:20px 22px}' +
        '.exec-line{margin:0 0 12px;font-size:14px;color:#374151;line-height:1.75}' +
        '.exec-line:last-child{margin-bottom:0}' +
        '.kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:18px 0}' +
        '.kpi{background:#f8fafc;border:1px solid var(--line);border-radius:10px;padding:14px;text-align:center}' +
        '.kpi .label{font-size:11px;color:var(--gray)}' +
        '.kpi .value{margin-top:6px;font-size:16px;font-weight:700;color:var(--green)}' +
        '.chart-block{margin:20px 0;text-align:center}' +
        '.chart-block img{max-width:100%;border-radius:8px;border:1px solid var(--line)}' +
        '.chart-fallback{background:#f8fafc;border:1px dashed #d1d9e6;border-radius:8px;padding:32px;color:#9ca3af;font-size:13px}' +
        '.chart-caption{font-size:12px;color:var(--gray);margin-top:8px;line-height:1.5}' +
        '.ai-action-card{background:#fafbfc;border:1px solid var(--line);border-left:4px solid var(--green);border-radius:0 10px 10px 0;padding:16px 18px;margin-bottom:14px}' +
        '.ai-action-card__head{display:flex;align-items:center;gap:10px;margin-bottom:8px;color:var(--navy);font-size:15px}' +
        '.ai-action-card p{margin:0;font-size:13px;color:#4b5563;line-height:1.65}' +
        '.action-no{flex-shrink:0;width:24px;height:24px;border-radius:50%;background:var(--green);color:#fff;font-size:12px;display:inline-flex;align-items:center;justify-content:center}' +
        (typeof BenchmarkBrand !== 'undefined' ? BenchmarkBrand.referencesReportStyles() : '') +
        BenchmarkReportShare.buildStyles() +
        '.footer{margin-top:36px;padding-top:18px;border-top:1px solid var(--line);font-size:11px;color:#9ca3af;text-align:center;line-height:1.85}' +
        '.muted{color:#9ca3af;font-size:13px}' +
      '</style></head><body>' +
      '<div class="report-shell">' +
      '<div class="page">' +
        '<div class="header"><div class="header-top">' +
          '<div><div class="brand">Enterprise Inter-firm Benchmark Report</div>' +
          '<h1>企业间对标分析报告</h1>' +
          '<div class="sub">分析对象：<strong>本企业</strong> vs <strong>某对标企业</strong>（脱敏样本，不展示真实企业名称）<br>' +
            BenchmarkReport.escape(summary) + '</div></div>' +
          '<div class="vs-badge">生成日期<div><strong>' + dateStr + '</strong></div>' +
            '本企业 ' + gradeInfo.grade + ' 级</div>' +
        '</div></div>' +
        '<div class="meta-bar">' +
          '<span>报告编号：EB-' + Date.now().toString(36).toUpperCase() + '</span>' +
          '<span>生成时间：' + now.toLocaleString('zh-CN') + '</span>' +
          '<span>出品：佳华智联 · 数据对标智能体</span>' +
          '<span>数据来源：佳华智联五大核心数据源（脱敏演示）</span>' +
        '</div>' +
        '<div class="content">' +
          '<div class="toc"><h3>目录 Contents</h3><ol>' +
            '<li>核心摘要 Executive Summary</li>' +
            '<li>数据洞察 Data Insights</li>' +
            '<li>AI 深度研读与行动建议 AI Recommendations</li>' +
            '<li>参考资料 References</li>' +
          '</ol></div>' +

          '<div class="section" id="s1"><h2>01 · 核心摘要 Executive Summary</h2>' +
            '<div class="exec-box">' + this.buildCompareExecSummaryHTML(execLines) + '</div>' +
            '<div class="kpi-grid">' +
              '<div class="kpi"><div class="label">碳排放强度差距</div><div class="value">' + BenchmarkReport.escape(detail.intensityGapLabel) + '</div></div>' +
              '<div class="kpi"><div class="label">综合能耗对比</div><div class="value">' + detail.selfComEnergy + ' vs ' + detail.targetComEnergy + ' ' + detail.comEnergyUnit + '</div></div>' +
              '<div class="kpi"><div class="label">绿电占比对比</div><div class="value">' + detail.selfGreenPct + '% vs ' + detail.targetGreenPct + '%</div></div>' +
            '</div></div>' +

          '<div class="section" id="s2"><h2>02 · 数据洞察 Data Insights</h2>' +
            '<div class="chart-block">' +
              (coreBarImg
                ? '<img src="' + coreBarImg + '" alt="核心指标对比"/>'
                : '<div class="chart-fallback">核心指标对比图生成失败，请确认 ECharts 已加载后重试</div>') +
              '<div class="chart-caption">图1：本企业与某对标企业在碳排放强度、综合能耗及绿电占比上的对比（柱顶标注为绝对数值，纵轴为对标指数；不含真实企业名称）</div>' +
            '</div>' +
            '<div class="chart-block">' +
              (radarImg
                ? '<img src="' + radarImg + '" alt="碳效健康度雷达图"/>'
                : '<div class="chart-fallback">雷达图生成失败，请确认 ECharts 已加载后重试</div>') +
              '<div class="chart-caption">图2：碳效健康度五维雷达对比——能源结构、工艺能效、减排潜力、数据质量、余能利用</div>' +
            '</div>' +
            '<div class="chart-block">' +
              (waterfallImg
                ? '<img src="' + waterfallImg + '" alt="差距瀑布图"/>'
                : '<div class="chart-fallback">瀑布图生成失败，请确认 ECharts 已加载后重试</div>') +
              '<div class="chart-caption">图3：从标杆强度到本企业强度的差距分解，揭示炼铁/炼钢工序及能源结构的贡献占比</div>' +
            '</div></div>' +

          '<div class="section" id="s3"><h2>03 · AI 深度研读与行动建议</h2>' +
            '<p style="font-size:14px;color:#4b5563;margin:0 0 16px">基于上述图表数据，AI 为您提炼以下 <strong>3 条</strong>可落地的追赶策略：</p>' +
            this.buildCompareActionsHTML(aiActions) +
          '</div>' +

          (typeof BenchmarkBrand !== 'undefined' ? BenchmarkBrand.buildReferencesHTML() : '') +

          '<div class="footer">' +
            '免责声明：本报告由 AI 基于系统内公开/脱敏数据自动生成，仅供内部参考，不构成外部审计依据或投资建议。<br>' +
            '报告不含任何第三方企业的真实名称，对标样本均以「某企业」「*****企业」等脱敏形式呈现。<br>' +
            '报告中的图表、指标及建议均为演示环境 Mock 数据推导结果，不代表任何真实企业的生产或排放数据。<br>' +
            '© ' + now.getFullYear() + ' 数字碳表 Digital Carbon Platform · Confidential' +
          '</div>' +
        '</div></div>' +
      BenchmarkReportShare.buildFloatBarHTML() +
      '</div>' +
      BenchmarkReportShare.buildOverlaysHTML() +
      BenchmarkReportShare.buildScripts({
        emailSubject: '【企业间对标分析报告】本企业与标杆碳效对比',
        emailBody: BenchmarkReportShare.buildCompareEmailBody({
          grade: gradeInfo.grade,
          gradeLabel: gradeInfo.label,
          gapLine: '【碳排放强度差距】' + detail.intensityGapLabel,
          execLines: execLines
        }),
        pdfFileName: '企业间对标分析报告_' + dateStr + '.pdf',
        imageFileName: '企业间对标分析报告长图_' + dateStr + '.png'
      }) +
      '</body></html>';
  },

  _downloadHtmlBlob: function (html, fileName) {
    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * 生成企业与目标标杆的企业间对标分析报告并下载
   * @param {Function} [onComplete] 完成回调 (success: boolean)
   */
  generateComparisonReport: function (payload, targetRow, onComplete) {
    if (!payload || !payload.result || !targetRow) {
      if (onComplete) onComplete(false);
      return false;
    }
    if (typeof BenchmarkDataService === 'undefined') {
      if (onComplete) onComplete(false);
      return false;
    }

    var self = this;
    var result = payload.result;
    var ranking = result.rankingMeta || {};
    var detail = BenchmarkDataService.buildCompareDetailMetrics(ranking, targetRow);
    var execLines = BenchmarkDataService.buildCompareExecutiveSummary(detail, ranking.industry);
    var aiActions = BenchmarkDataService.buildCompareAIActions(detail);
    var now = new Date();
    var dateStr = this.formatDate(now);
    var fileName = '企业间对标分析报告_' + dateStr + '.html';
    var summary = payload.summary || '';
    var gradeInfo = this.computeGrade(ranking);

    if (typeof echarts === 'undefined') {
      console.warn('[BenchmarkReport] ECharts 未加载，对比报告图表将为空');
    }

    this._renderAllCompareChartsAsync(detail).then(function (images) {
      var html = self._buildComparisonReportHTML({
        detail: detail,
        execLines: execLines,
        aiActions: aiActions,
        gradeInfo: gradeInfo,
        summary: summary,
        now: now,
        dateStr: dateStr,
        images: images || { core: '', radar: '', waterfall: '' }
      });
      self._downloadHtmlBlob(html, fileName);
      if (onComplete) onComplete(true);
    }).catch(function (err) {
      console.error('[BenchmarkReport] 对比报告图表渲染失败', err);
      var html = self._buildComparisonReportHTML({
        detail: detail,
        execLines: execLines,
        aiActions: aiActions,
        gradeInfo: gradeInfo,
        summary: summary,
        now: now,
        dateStr: dateStr,
        images: { core: '', radar: '', waterfall: '' }
      });
      self._downloadHtmlBlob(html, fileName);
      if (onComplete) onComplete(false);
    });

    return true;
  }
};
