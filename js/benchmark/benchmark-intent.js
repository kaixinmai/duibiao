/**
 * 碳对标智能体 - 意图识别 & 动态思考步骤生成
 */
var BenchmarkIntent = {
  recognize: function (text, slots) {
    slots = slots || {};
    var t = String(text || '').trim();
    var intent = {
      functionType: slots.functionType || null,
      timeDimension: slots.timeDimension || null,
      timeValue: slots.timeValue || null,
      industry: slots.industry || '钢铁',
      spaceDimension: slots.spaceDimension || 'national',
      region: slots.region || null,
      objectDimension: slots.objectDimension || 'enterprise',
      queryFocus: slots.queryFocus || null,
      process: null,
      raw: t
    };

    if (typeof BenchmarkDataService !== 'undefined') {
      intent.queryFocus = BenchmarkDataService.detectQueryFocus(t, slots);
    }

    if (/排名|排行|名次/.test(t)) intent.functionType = 'ranking';
    if (/对比|比较|差距|标杆|差异/.test(t)) intent.functionType = 'comparison';
    if (/对标/.test(t) && !intent.functionType) intent.functionType = 'comparison';

    var monthMatch = t.match(/(20\d{2})\s*年\s*(\d{1,2})\s*月/);
    var yearMatch = t.match(/(20\d{2})/);
    if (monthMatch) {
      intent.timeValue = monthMatch[1] + '-' + String(monthMatch[2]).padStart(2, '0');
      intent.timeDimension = 'monthly';
    } else if (yearMatch) {
      intent.timeValue = yearMatch[1];
    }
    if (/月度|按月|本月|当月/.test(t)) intent.timeDimension = 'monthly';
    if (/年度|全年|按年/.test(t) && !monthMatch) intent.timeDimension = 'yearly';

    if (/全国|国内/.test(t)) intent.spaceDimension = 'national';
    if (/区域|地区|华中|河南/.test(t)) {
      intent.spaceDimension = 'regional';
      intent.region = '华中';
    }

    if (/高炉/.test(t)) intent.process = '高炉工序';
    if (/转炉/.test(t)) intent.process = '转炉工序';
    if (/工序|产线/.test(t)) intent.objectDimension = 'process';

    return intent;
  },

  _periodLabel: function (intent) {
    var tv = intent && intent.timeValue;
    if ((intent && intent.timeDimension === 'monthly') && tv && tv.indexOf('-') >= 0) {
      var parts = tv.split('-');
      return parts[0] + '年' + parseInt(parts[1], 10) + '月';
    }
    if (tv && tv.indexOf('-') >= 0) {
      var p = tv.split('-');
      return p[0] + '年' + parseInt(p[1], 10) + '月';
    }
    return (tv || '2026') + '年';
  },

  buildThinkingSteps: function (intent, willShowResult) {
    var focus = intent.queryFocus || 'comprehensive';
    var period = this._periodLabel(intent);
    var steps = ['正在理解您的问题：「' + (intent.raw || '').slice(0, 40) + (intent.raw && intent.raw.length > 40 ? '…' : '') + '」'];

    steps.push('正在检索安阳钢铁年报、生态环境部碳市场政策及中钢协能耗统计数据…');
    steps.push('正在同步河南钢铁集团产量、碳排放、配额与排污数据…');

    if (focus === 'ranking') {
      steps.push('正在计算' + period + '河南钢铁集团碳强度在全国232家钢企中的排名位次…');
    } else if (focus === 'quota') {
      steps.push('正在核算' + period + '碳配额盈缺与碳价（CEA）履约成本…');
    } else if (focus === 'pollutant') {
      steps.push('正在对标SO₂、NOx、颗粒物排放与行业标杆差距…');
    } else if (focus === 'production') {
      steps.push('正在分析' + period + '钢材产量、营收与碳排放关联…');
    } else if (focus === 'energy') {
      steps.push('正在对标吨钢综合能耗与行业均值、标杆水平…');
    } else if (focus === 'retrofit') {
      steps.push('正在评估高炉煤气发电、余热回收等技改减排潜力…');
    } else {
      steps.push('正在从产量、碳排放、强度、配额、排污、能耗六维生成对标分析…');
    }

    if (willShowResult) {
      steps.push('正在生成差异化研判结论与多维对比图表…');
    }

    return steps.slice(0, 7);
  }
};
