/**
 * 碳对标智能体 - 意图识别与槽位填充状态机
 */
var BenchmarkSlotFilling = {
  slots: {
    functionType: null,
    timeDimension: null,
    timeValue: null,
    spaceDimension: null,
    region: null,
    objectDimension: null,
    industry: null,
    enterpriseIntensity: null,
    dataSource: null,
    awaitingEnterpriseData: false
  },

  reset: function () {
    this.slots = {
      functionType: null,
      timeDimension: null,
      timeValue: null,
      spaceDimension: null,
      region: null,
      objectDimension: null,
      industry: null,
      enterpriseIntensity: null,
      dataSource: null,
      awaitingEnterpriseData: false
    };
  },

  getSlots: function () {
    return Object.assign({}, this.slots);
  },

  parseMessage: function (text) {
    var t = text.trim();
    var slots = this.slots;
    var isCorrection = /改成|改为|切换|换成|看看|还是|只要/.test(t);

    if (/排名|排行|名次/.test(t)) slots.functionType = 'ranking';
    if (/对比|比较|差距|标杆|差异/.test(t)) slots.functionType = 'comparison';
    if (/对标/.test(t) && !slots.functionType) slots.functionType = 'comparison';
    if (/配额|履约|碳价|排污|产量|能耗/.test(t)) {
      if (!slots.functionType) slots.functionType = 'comparison';
      if (!slots.industry) slots.industry = '钢铁';
    }

    if (/月度|按月|每月|本月|当月/.test(t)) slots.timeDimension = 'monthly';
    if (/年度|按年|全年|每年/.test(t)) slots.timeDimension = 'yearly';
    if (isCorrection && /月度|月/.test(t)) slots.timeDimension = 'monthly';
    if (isCorrection && /年度|年/.test(t) && !/月/.test(t)) slots.timeDimension = 'yearly';

    var yearMatch = t.match(/20\d{2}\s*年/);
    if (yearMatch) {
      slots.timeValue = yearMatch[0].replace(/\s*年/, '');
      if (!slots.timeDimension) slots.timeDimension = 'yearly';
    }
    var monthMatch = t.match(/(20\d{2})\s*年\s*(\d{1,2})\s*月/);
    if (monthMatch) {
      slots.timeValue = monthMatch[1] + '-' + String(monthMatch[2]).padStart(2, '0');
      slots.timeDimension = 'monthly';
    }

    if (/全国|国内|全行业/.test(t)) {
      slots.spaceDimension = 'national';
      slots.region = null;
    }

    BenchmarkMatrix.industries.forEach(function (ind) {
      if (t.indexOf(ind) >= 0) slots.industry = ind;
    });

    if (/工序|产线|车间|高炉|转炉/.test(t)) slots.objectDimension = 'process';
    if (/河南钢铁|安钢|安阳钢铁/.test(t)) {
      slots.objectDimension = 'enterprise';
      if (!slots.industry) slots.industry = '钢铁';
    }
    if (/企业|公司|集团/.test(t) && !slots.objectDimension) slots.objectDimension = 'enterprise';
    if (/企业级|工序级/.test(t)) {
      slots.objectDimension = /工序/.test(t) ? 'process' : 'enterprise';
    }

    if (/怎么做|怎么开始|如何开始/.test(t) && !/排名|对比|对标|配额|排污|产量|能耗|减排|技改/.test(t)) {
      slots.functionType = 'comparison';
    }

    /* 手动填写碳强度 */
    if (slots.awaitingEnterpriseData || slots.functionType === 'ranking') {
      var manual = typeof BenchmarkDataService !== 'undefined'
        ? BenchmarkDataService.parseManualIntensity(t)
        : null;
      if (manual && manual > 0 && manual < 100) {
        slots.enterpriseIntensity = manual;
        slots.dataSource = 'manual';
        slots.awaitingEnterpriseData = false;
      }
    }

    this.applyDefaults(t);
    return this.getSlots();
  },

  /** 自动补全缺失槽位，不再向用户追问 */
  applyDefaults: function (text) {
    var s = this.slots;
    var t = String(text || '');

    if (!s.functionType) {
      if (/排名|排行|名次/.test(t)) s.functionType = 'ranking';
      else s.functionType = 'comparison';
    }

    var yearMatch = t.match(/(20\d{2})/);
    var monthMatch = t.match(/(20\d{2})\s*年\s*(\d{1,2})\s*月/);

    if (monthMatch) {
      s.timeDimension = 'monthly';
      s.timeValue = monthMatch[1] + '-' + String(monthMatch[2]).padStart(2, '0');
    } else {
      if (!s.timeValue) s.timeValue = yearMatch ? yearMatch[1] : '2026-06';
      if (!s.timeDimension && String(s.timeValue).indexOf('-') >= 0) s.timeDimension = 'monthly';
      if (!s.timeDimension) s.timeDimension = 'yearly';
    }

    /* 仅当问题中明确出现大区名称时才用区域，否则一律全国 */
    var regionName = null;
    BenchmarkMatrix.regions.forEach(function (r) {
      if (t.indexOf(r) >= 0) regionName = r;
    });
    if (regionName) {
      s.spaceDimension = 'regional';
      s.region = regionName;
    } else {
      s.spaceDimension = 'national';
      s.region = null;
    }

    if (!s.industry) s.industry = '钢铁';
    if (!s.objectDimension) {
      s.objectDimension = /工序|高炉|转炉|产线|车间/.test(t) ? 'process' : 'enterprise';
    }

    if (typeof BenchmarkDataService !== 'undefined') {
      s.queryFocus = BenchmarkDataService.detectQueryFocus(t, s);
    }
    s.userQuestion = t;
    s.awaitingEnterpriseData = false;

    return this.getSlots();
  },

  getMissingSlots: function () {
    return [];
  },

  isComplete: function () {
    return true;
  },

  getFollowUp: function () {
    return null;
  },

  getEnterpriseDataAskText: function () {
    var s = this.slots;
    var period = s.timeDimension === 'monthly'
      ? s.timeValue.replace('-', '年') + '月'
      : (s.timeValue || '当前周期') + '年';
    return '未查询到 **河南钢铁集团** **' + period + '** 的碳排放强度数据。请手动输入以便参与对标排名，例如：**1.89 tCO₂/t**（钢铁长流程）';
  },

  buildSummary: function () {
    var s = this.slots;
    var parts = [];
    if (s.functionType) parts.push(BenchmarkMatrix.getLabel('functionTypes', s.functionType));
    if (s.timeValue) {
      parts.push(s.timeDimension === 'monthly'
        ? (function () {
            var p = String(s.timeValue).split('-');
            return p.length === 2 ? (p[0] + '年' + parseInt(p[1], 10) + '月') : (s.timeValue.replace('-', '年') + '月');
          })()
        : s.timeValue + '年');
    } else if (s.timeDimension) {
      parts.push(BenchmarkMatrix.getLabel('timeDimensions', s.timeDimension));
    }
    if (s.industry) parts.push(s.industry + '行业');
    if (s.spaceDimension === 'national') parts.push('全国');
    if (s.spaceDimension === 'regional') parts.push(s.region || '区域');
    if (s.objectDimension) parts.push(BenchmarkMatrix.getLabel('objectDimensions', s.objectDimension));
    return parts.join(' · ');
  },

  resolveEnterpriseIntensity: function () {
    var s = this.slots;
    if (s.enterpriseIntensity) return { intensity: s.enterpriseIntensity, source: s.dataSource || 'manual' };

    if (typeof BenchmarkDataService !== 'undefined') {
      var auto = BenchmarkDataService.fetchFromSystem(s);
      if (auto) {
        s.enterpriseIntensity = auto.intensity;
        s.dataSource = 'auto';
        return { intensity: auto.intensity, source: 'auto' };
      }
      /* 演示模式：使用河南钢铁集团公开数据 */
      var demoIntensity = BenchmarkDataService.getDemoIntensity(s.industry || '钢铁', s);
      s.enterpriseIntensity = demoIntensity;
      s.dataSource = 'demo';
      return { intensity: demoIntensity, source: 'demo' };
    }
    return null;
  },

  buildRankingResult: function (dataSource) {
    var s = this.slots;
    var ranking = BenchmarkDataService.computeRanking(s.enterpriseIntensity, s.industry);
    var chartData = BenchmarkDataService.buildRankingChartData(ranking);
    var recommendations = BenchmarkDataService.buildRecommendations(ranking);
    var text = BenchmarkDataService.buildRankingCopy(ranking, s, dataSource);
    var dashboard = BenchmarkDataService.buildDashboardMetrics(s);

    return {
      type: 'result',
      text: text,
      chartType: 'rankBar',
      chartData: chartData,
      charts: [
        { type: 'rankBar', data: chartData, title: '碳强度行业排名对标' },
        { type: 'radar', data: BenchmarkDataService.buildRadarData(ranking, s), title: '经营·双碳五维雷达图' }
      ],
      rankingMeta: ranking,
      rankingList: BenchmarkDataService.buildRankingList(ranking),
      recommendations: recommendations,
      reductionPotential: BenchmarkDataService.buildReductionPotentialAnalysis(ranking, null, s),
      tableRows: BenchmarkDataService.buildRankingTable(ranking, chartData),
      dashboardMetrics: dashboard,
      dataSource: dataSource,
      slots: this.getSlots()
    };
  },

  buildComparisonResult: function (dataSource) {
    var s = this.slots;
    var ranking = BenchmarkDataService.computeRanking(s.enterpriseIntensity, s.industry);
    var rankChartData = BenchmarkDataService.buildRankingChartData(ranking);
    var radarData = BenchmarkDataService.buildRadarData(ranking, s);
    var recommendations = BenchmarkDataService.buildRecommendations(ranking);
    var text = BenchmarkDataService.buildComparisonCopy(ranking, s);
    var dashboard = BenchmarkDataService.buildDashboardMetrics(s);

    return {
      type: 'result',
      text: text,
      chartType: 'rankBar',
      chartData: rankChartData,
      charts: [
        { type: 'rankBar', data: rankChartData, title: '碳强度行业排名对标' },
        { type: 'radar', data: radarData, title: '经营·双碳五维雷达图' }
      ],
      rankingMeta: ranking,
      rankingList: BenchmarkDataService.buildRankingList(ranking),
      recommendations: recommendations,
      reductionPotential: BenchmarkDataService.buildReductionPotentialAnalysis(ranking, null, s),
      tableRows: BenchmarkDataService.buildRankingTable(ranking, rankChartData),
      dashboardMetrics: dashboard,
      dataSource: dataSource,
      slots: this.getSlots()
    };
  },

  handleMessage: function (text) {
    this.reset();
    this.parseMessage(text);

    var resolved = this.resolveEnterpriseIntensity();
    if (!resolved) {
      this.slots.enterpriseIntensity = 1.89;
      this.slots.dataSource = 'demo';
      resolved = { intensity: 1.89, source: 'demo' };
    }

    return BenchmarkDataService.buildResultByFocus(this.getSlots(), resolved.source, text);
  },

  buildResultText: function () {
    var summary = this.buildSummary();
    return '已完成 **' + summary + '** 对标分析。';
  },

  buildChartData: function () {
    if (this.slots.enterpriseIntensity && this.slots.industry) {
      var ranking = BenchmarkDataService.computeRanking(this.slots.enterpriseIntensity, this.slots.industry);
      return BenchmarkDataService.buildRadarData(ranking);
    }
    return BenchmarkDataService.buildRadarData({ percentile: 80 });
  }
};
