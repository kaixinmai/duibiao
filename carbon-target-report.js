/**
 * 碳目标报告 — 预览 / 下载（含历史摘要、图表、大模型结论）
 */
(function (global) {
  'use strict';

    function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function parseNum(v) {
    var n = parseFloat(String(v).replace(/[^\d.-]/g, ''));
    return isNaN(n) ? 0 : n;
  }

  function avg(arr) {
    if (!arr.length) return 0;
    return arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
  }

  function loadEcharts() {
    if (global.echarts) return Promise.resolve(global.echarts);
    return Promise.reject(new Error('ECharts not loaded — include vendor/echarts.min.js before carbon-target-report.js'));
  }

  function getMonthlyTarget(def, month) {
    if (!def || def.monthlyBase == null) return '—';
    var m = parseInt(month, 10) || 6;
    var factor = 0.92 + (m % 4) * 0.02;
    return (def.monthlyBase * factor).toFixed(2) + ' ' + def.unit;
  }

  function buildContext(opts) {
    var mock = opts.mock || {};
    var indicatorTargets = opts.indicatorTargets || {};
    var year = opts.year || '2025';
    var month = opts.month || '06';
    var monthNum = parseInt(month, 10) || 6;
    var indicators = (opts.indicators && opts.indicators.length)
      ? opts.indicators.slice()
      : ['碳排放总量', '碳排放强度'];
    var capLabel = opts.capLabel || '碳目标制定';

    var emissions = mock.groupEmissions || [];
    var totals = emissions.map(function (r) { return parseNum(r.total); });
    var intensities = emissions.map(function (r) { return parseNum(r.intensity); });
    var subEmissions = mock.subEmissions || [];
    var subTargets = mock.subTargets || [];
    var greenPower = mock.greenPower || [];
    var groupGreen = greenPower.find(function (g) { return g.name === '集团'; }) || greenPower[0];

    var compliantCount = subTargets.filter(function (s) { return s.status === '达标'; }).length;
    var reportNo = 'CT-' + year + month + '-' + String(Date.now()).slice(-6);

    var targetRows = indicators.map(function (name) {
      var def = indicatorTargets[name] || { target: '—', unit: '—', change: '—', monthlyBase: null };
      return {
        name: name,
        target: def.target,
        unit: def.unit,
        change: def.change,
        monthly: getMonthlyTarget(def, month),
      };
    });

    var targetYearTotal = parseNum(targetRows[0] && targetRows[0].name === '碳排放总量' ? targetRows[0].target : '59.8');
    var baseline2020 = 68.2;
    var latestTotal = totals[totals.length - 1] || 61.5;
    var gapTotal = Math.max(0, latestTotal - targetYearTotal);

    var professional = {
      baselineYear: 2020,
      baselineEmission: baseline2020,
      baselineToLatestDrop: (((baseline2020 - latestTotal) / baseline2020) * 100).toFixed(1),
      cagrDrop: '2.5',
      orgBoundary: '独立法人边界',
      accountingScope: '直接排放 + 过程排放',
      standards: ['GB/T 32150-2015', 'ISO 14064-1:2018', 'GHG Protocol Corporate Standard'],
      meeAccountingGuides: [
        '《企业温室气体排放核算方法与报告指南 通则（试行）》（生态环境部）',
        '《企业温室气体排放核算与报告指南 发电设施》（环办气候函〔2022〕485号）',
        '《企业温室气体排放核算与报告指南 钢铁生产》',
        '《企业温室气体排放核算与报告指南 水泥生产》',
        '《企业温室气体排放核算与报告指南 化工生产》',
        '《企业温室气体排放报告核查指南（试行）》（环办气候函〔2021〕130号）',
      ],
      carbonMarketGuides: [
        '《碳排放权交易管理办法（试行）》（生态环境部令第19号）',
        '全国碳排放权交易市场行业覆盖范围与核算边界',
      ],
      dataQuality: 'B 级（不确定性 ±5%）',
      peakYear: 2028,
      neutralYear: 2060,
      policyFit: '基本符合',
      sbtAlignment: '1.5°C 温控路径（初步契合）',
      gapTotal: gapTotal.toFixed(1),
      scopeStructure: [
        { name: '范围一（直接排放）', value: 52 },
        { name: '范围二（购入电力）', value: 38 },
        { name: '范围三（价值链）', value: 10 },
      ],
      pathway: {
        years: ['2020', '2022', '2024', '2025', '2028', '2030', '2060'],
        values: [68.2, 65.8, 61.5, targetYearTotal, 58.0, 54.5, 15.0],
      },
      benchmarks: [
        { dim: '碳排放强度', self: '0.41', industry: '0.48', leader: '0.36', verdict: '优于行业平均' },
        { dim: '绿电消纳率', self: groupGreen ? groupGreen.y2024 : '36%', industry: '28%', leader: '45%', verdict: '高于行业平均' },
        { dim: '单位产值减排率', self: '4.9%', industry: '3.2%', leader: '6.1%', verdict: '接近标杆' },
        { dim: '目标完成率', self: (compliantCount / Math.max(subTargets.length, 1) * 100).toFixed(0) + '%', industry: '72%', leader: '95%', verdict: compliantCount >= 3 ? '整体良好' : '需加强' },
      ],
      decomposition: subTargets.map(function (s, i) {
        var share = [38, 32, 18, 12][i] || 25;
        return {
          entity: s.name,
          target: s.target,
          share: share + '%',
          owner: ['碳管理部', '生产运营部', '能源管理部', '物流管理部'][i] || '各业务部门',
          deadline: year + '-12-31',
        };
      }),
      measures: [
        { type: '能源替代', name: '高炉煤气余热回收改造', reduction: '0.42万吨/年', invest: '1,200万元', period: '2025Q3—2026Q2' },
        { type: '能效提升', name: '主要产线电机系统节能改造', reduction: '0.28万吨/年', invest: '680万元', period: '2025Q2—2025Q4' },
        { type: '绿电绿证', name: '年度绿电长协采购扩容', reduction: '0.35万吨/年', invest: '950万元/年', period: '2025 持续' },
        { type: '工艺优化', name: '化工装置低碳工艺升级', reduction: '0.18万吨/年', invest: '2,400万元', period: '2025Q4—2027Q1' },
        { type: '碳汇/CCER', name: '林业碳汇项目开发', reduction: '0.10万吨/年', invest: '350万元', period: '2026 起' },
      ],
      mrv: [
        { item: '数据采集', freq: '月度', source: 'EMS/ERP 能源管理系统', dept: '碳管理办公室' },
        { item: '排放核算', freq: '季度', source: 'carbon_emission_group 数据库', dept: '碳管理办公室' },
        { item: '目标跟踪', freq: '月度', source: 'carbon_target 模块', dept: '各业务部门' },
        { item: '内部审核', freq: '半年度', source: '内审部门', dept: '审计监察部' },
        { item: '第三方核查', freq: '年度', source: '具备资质的核查机构', dept: '碳管理办公室' },
      ],
      risks: [
        { risk: '产量波动导致强度目标偏离', level: '中', impact: '月度分解目标完不成', action: '建立产量—排放联动修正机制' },
        { risk: '绿电供应及价格不确定性', level: '中', impact: '范围二排放反弹', action: '签订长协、建设分布式光伏' },
        { risk: '下属企业执行不到位', level: '高', impact: '集团总量超标', action: '未达标企业专项督导与考核挂钩' },
        { risk: '碳市场配额收紧', level: '低', impact: '履约成本上升', action: '提前布局 CCER 与配额储备' },
      ],
    };

    var executiveSummary = buildExecutiveSummary({
      year: year, monthNum: monthNum, indicators: indicators,
      latestTotal: latestTotal, targetYearTotal: targetYearTotal,
      gapTotal: gapTotal, greenRate: groupGreen ? groupGreen.y2024 : '36%',
      compliantCount: compliantCount, subTotal: subTargets.length,
      baselineDrop: professional.baselineToLatestDrop,
    });

    var aiConclusion = buildAiConclusion({
      year: year,
      monthNum: monthNum,
      indicators: indicators,
      avgTotal: avg(totals),
      avgIntensity: avg(intensities),
      latestTotal: totals[totals.length - 1],
      latestIntensity: intensities[intensities.length - 1],
      greenRate: groupGreen ? groupGreen.y2024 : '36%',
      compliantCount: compliantCount,
      subTotal: subTargets.length,
      targetRows: targetRows,
      professional: professional,
    });

    return {
      reportNo: reportNo,
      generatedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      year: year,
      month: month,
      monthNum: monthNum,
      capLabel: capLabel,
      indicators: indicators,
      executiveSummary: executiveSummary,
      professional: professional,
      summary: {
        avgEmissionTotal: avg(totals).toFixed(1),
        avgIntensity: avg(intensities).toFixed(3),
        latestEmissionTotal: totals[totals.length - 1],
        latestIntensity: intensities[intensities.length - 1],
        yoyDropRate: totals.length >= 2
          ? (((totals[totals.length - 2] - totals[totals.length - 1]) / totals[totals.length - 2]) * 100).toFixed(1)
          : '—',
        greenRate2024: groupGreen ? groupGreen.y2024 : '—',
        subCompliance: compliantCount + '/' + subTargets.length,
        queryRecords: 28,
      },
      charts: {
        trendYears: emissions.map(function (r) { return r.year; }),
        trendTotals: totals,
        trendIntensity: intensities,
        subNames: subEmissions.map(function (r) { return r.name; }),
        sub2023: subEmissions.map(function (r) { return parseNum(r.v2023); }),
        sub2024: subEmissions.map(function (r) { return parseNum(r.v2024); }),
        radar: subTargets.map(function (s) {
          return {
            name: s.name,
            value: [
              s.status === '达标' ? 92 : 68,
              s.name === '楚天钢铁' ? 72 : 88,
              s.name === '楚天物流' ? 90 : 78,
              s.name === '楚天电力' ? 85 : 80,
              s.status === '达标' ? 88 : 70,
            ],
          };
        }),
        scopeStructure: professional.scopeStructure,
        pathway: professional.pathway,
        gapCompare: {
          labels: targetRows.slice(0, 2).map(function (r) { return r.name; }),
          current: [latestTotal, parseNum(String(intensities[intensities.length - 1]))],
          target: targetRows.slice(0, 2).map(function (r) { return parseNum(r.target); }),
        },
      },
      targetRows: targetRows,
      aiConclusion: aiConclusion,
      tables: {
        groupTargets: mock.groupTargets || [],
        subTargets: subTargets,
      },
    };
  }

  function buildExecutiveSummary(p) {
    return '本报告针对 **' + p.year + ' 年 ' + p.monthNum + ' 月** 碳目标制定任务，依据 GB/T 32150、ISO 14064 及生态环境部发布的核算指南完成历史排放回溯、基准年比对、差距分析与目标分解。' +
      '集团 2024 年排放总量 **' + p.latestTotal + ' 万吨**，较基准年（2020）累计下降 **' + p.baselineDrop + '%**；' +
      '建议 **' + p.year + ' 年** 总量目标 **' + p.targetYearTotal + ' 万吨**，较现状需再降 **' + p.gapTotal.toFixed(1) + ' 万吨**。' +
      '绿电消纳率 **' + p.greenRate + '**，下属企业达标 **' + p.compliantCount + '/' + p.subTotal + '** 家。' +
      '综合评估：目标具备可达性，需重点管控高排放板块并强化 MRV 闭环。';
  }

  function buildAiConclusion(p) {
    var indText = p.indicators.join('、');
    var pro = p.professional || {};
    return [
      '【总体判断】',
      '本报告遵循 **' + (pro.standards ? pro.standards.join('、') : '国标/ISO') + '** 及 **生态环境部发布的核算指南** 编制，组织边界采用 **' + (pro.orgBoundary || '独立法人边界') + '**，核算范围 **' + (pro.accountingScope || '直接排放 + 过程排放') + '**。' +
      '基于 ' + p.year + ' 年 ' + p.monthNum + ' 月碳目标制定需求，对 2020 基准年至 2024 年历史排放进行回溯分析。' +
      '近三年排放总量均值 **' + p.avgTotal.toFixed(1) + ' 万吨**，碳强度均值 **' + p.avgIntensity.toFixed(3) + ' tCO₂e/万元**，年均复合降幅约 **' + (pro.cagrDrop || '2.5') + '%**，整体符合 **' + (pro.sbtAlignment || '1.5°C 路径') + '** 要求。',
      '',
      '【基准年与政策符合性】',
      '基准年（' + (pro.baselineYear || 2020) + '）排放 **' + (pro.baselineEmission || 68.2) + ' 万吨**，至 2024 年累计下降 **' + (pro.baselineToLatestDrop || '—') + '%**。' +
      '对照《2030 年前碳达峰行动方案》及集团「十四五」双碳规划，**' + p.year + ' 年目标设定** 与达峰路径（预计 **' + (pro.peakYear || 2028) + ' 年达峰**、**' + (pro.neutralYear || 2060) + ' 年碳中和**）**' + (pro.policyFit || '基本符合') + '**。',
      '',
      '【历史趋势与差距分析】',
      '2024 年集团碳排放 **' + p.latestTotal + ' 万吨**，碳强度 **' + p.latestIntensity + '**；绿电消纳 **' + p.greenRate + '**（范围二减排关键杠杆）。' +
      '下属企业达标 **' + p.compliantCount + '/' + p.subTotal + '**，楚天钢铁总量超标构成主要缺口。' +
      '距 ' + p.year + ' 年总量目标尚需减排 **' + (pro.gapTotal || '—') + ' 万吨**，可通过能效改造、绿电替代、工艺优化等措施覆盖。',
      '',
      '【' + p.year + ' 年 ' + p.monthNum + ' 月目标建议】',
      '选定指标（' + indText + '）建议值：',
    ].concat(p.targetRows.map(function (r) {
      return '- **' + r.name + '**：**' + r.target + ' ' + r.unit + '**（' + r.change + '），' + p.monthNum + ' 月分解 **' + r.monthly + '**';
    })).concat([
      '',
      '【减排路径与保障措施】',
      '1. **结构减排**：范围一重点推进钢铁高炉工序能效提升；范围二扩大绿电长协与分布式光伏；',
      '2. **管理减排**：建立产量—排放联动修正机制，未达标企业纳入 KPI 考核；',
      '3. **市场机制**：统筹 CEA 配额与 CCER 储备，降低履约成本；',
      '4. **MRV 体系**：月度采集、季度核算、年度第三方核查，数据质量维持 **' + (pro.dataQuality || 'B 级') + '**。',
      '',
      '【结论与建议】',
      '建议批准本报告目标方案，并在后台「碳目标制定」模块完成正式发布；同步启动减排项目库与监测台账，**每季度** 复盘目标完成率。',
      '',
      '*本结论由数据对标智能体基于历史数据、行业对标及大模型推理生成，正式决策前建议组织专家评审。*',
    ]).join('\n');
  }

  function buildTableRows(rows, cols, mapper) {
    return rows.map(function (row) {
      return '<tr>' + cols.map(function (col) {
        return '<td>' + esc(mapper(row, col)) + '</td>';
      }).join('') + '</tr>';
    }).join('');
  }

  function formatAiHtml(text) {
    return esc(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  }

  function buildReportBodyHtml(ctx, chartPrefix) {
    chartPrefix = chartPrefix || 'cta-rpt-';
    var kpi = ctx.summary;
    var pro = ctx.professional || {};
    var sec = 0;
    function h2(title) { sec += 1; return '<h2>' + ['一','二','三','四','五','六','七','八','九','十','十一','十二','十三','十四','十五'][sec - 1] + '、' + title + '</h2>'; }

    return (
      '<div class="cta-rpt-doc">' +
        '<header class="cta-rpt-doc__head">' +
          '<div class="cta-rpt-doc__brand">' +
            '<span class="cta-rpt-doc__logo">🌿</span>' +
            '<div><h1>集团碳目标制定专业报告</h1><p class="cta-rpt-doc__sub">Carbon Target Formulation Professional Report</p></div>' +
          '</div>' +
          '<div class="cta-rpt-doc__meta">' +
            '<div><label>报告编号</label><span>' + esc(ctx.reportNo) + '</span></div>' +
            '<div><label>生成时间</label><span>' + esc(ctx.generatedAt) + '</span></div>' +
            '<div><label>密级</label><span>内部资料</span></div>' +
          '</div>' +
        '</header>' +

        '<section class="cta-rpt-doc__section cta-rpt-doc__abstract">' +
          '<h2>报告摘要</h2>' +
          '<div class="cta-rpt-doc__abstract-body">' + formatAiHtml(ctx.executiveSummary || '') + '</div>' +
        '</section>' +

        '<section class="cta-rpt-doc__section">' +
          h2('编制依据与方法论') +
          '<p class="cta-rpt-doc__lead">本报告编制遵循国际通行温室气体核算框架，确保目标设定的可追溯性与可验证性。</p>' +
          '<div class="cta-rpt-doc__info-grid">' +
            '<div class="cta-rpt-doc__info-item cta-rpt-doc__info-item--wide"><label>参考标准</label><span>' + esc((pro.standards || []).join('；')) + '</span></div>' +
            '<div class="cta-rpt-doc__info-item cta-rpt-doc__info-item--wide"><label>生态环境部发布的核算指南</label><span>' + esc((pro.meeAccountingGuides || pro.carbonMarketGuides || []).join('；')) + '</span></div>' +
            '<div class="cta-rpt-doc__info-item cta-rpt-doc__info-item--wide"><label>全国碳市场配套文件</label><span>' + esc((pro.carbonMarketGuides || []).join('；')) + '</span></div>' +
            '<div class="cta-rpt-doc__info-item"><label>组织边界</label><span>' + esc(pro.orgBoundary) + '</span></div>' +
            '<div class="cta-rpt-doc__info-item"><label>核算范围</label><span>' + esc(pro.accountingScope) + '</span></div>' +
            '<div class="cta-rpt-doc__info-item"><label>基准年</label><span>' + pro.baselineYear + ' 年（' + pro.baselineEmission + ' 万吨）</span></div>' +
            '<div class="cta-rpt-doc__info-item"><label>数据质量等级</label><span>' + esc(pro.dataQuality) + '</span></div>' +
            '<div class="cta-rpt-doc__info-item"><label>科学碳目标（SBT）</label><span>' + esc(pro.sbtAlignment) + '</span></div>' +
            '<div class="cta-rpt-doc__info-item"><label>达峰/中和路径</label><span>' + pro.peakYear + ' 年达峰 · ' + pro.neutralYear + ' 年碳中和</span></div>' +
          '</div>' +
        '</section>' +

        '<section class="cta-rpt-doc__section">' +
          h2('任务与指标范围') +
          '<div class="cta-rpt-doc__info-grid">' +
            '<div class="cta-rpt-doc__info-item"><label>能力类型</label><span>' + esc(ctx.capLabel) + '</span></div>' +
            '<div class="cta-rpt-doc__info-item"><label>目标周期</label><span>' + esc(ctx.year) + ' 年 ' + ctx.monthNum + ' 月</span></div>' +
            '<div class="cta-rpt-doc__info-item cta-rpt-doc__info-item--wide"><label>核心指标</label><span>' + esc(ctx.indicators.join('、')) + '</span></div>' +
            '<div class="cta-rpt-doc__info-item cta-rpt-doc__info-item--wide"><label>政策符合性</label><span class="cta-rpt-doc__tag cta-rpt-doc__tag--ok">' + esc(pro.policyFit) + '国家双碳政策及集团规划要求</span></div>' +
          '</div>' +
        '</section>' +

        '<section class="cta-rpt-doc__section">' +
          h2('基准年与历史数据摘要') +
          '<p class="cta-rpt-doc__lead">汇总 carbon_target_group、carbon_emission_group 等 ' + kpi.queryRecords + ' 条记录；基准年（2020）至 2024 年累计降幅 <strong>' + pro.baselineToLatestDrop + '%</strong>，年均复合降幅约 <strong>' + pro.cagrDrop + '%</strong>。</p>' +
          '<div class="cta-rpt-doc__kpi-row">' +
            '<div class="cta-rpt-doc__kpi"><span class="cta-rpt-doc__kpi-val">' + pro.baselineEmission + '</span><span class="cta-rpt-doc__kpi-unit">万吨</span><span class="cta-rpt-doc__kpi-label">' + pro.baselineYear + ' 基准年排放</span></div>' +
            '<div class="cta-rpt-doc__kpi"><span class="cta-rpt-doc__kpi-val">' + esc(kpi.avgEmissionTotal) + '</span><span class="cta-rpt-doc__kpi-unit">万吨</span><span class="cta-rpt-doc__kpi-label">近三年总量均值</span></div>' +
            '<div class="cta-rpt-doc__kpi"><span class="cta-rpt-doc__kpi-val">' + esc(kpi.avgIntensity) + '</span><span class="cta-rpt-doc__kpi-unit"></span><span class="cta-rpt-doc__kpi-label">三年碳强度均值</span></div>' +
            '<div class="cta-rpt-doc__kpi"><span class="cta-rpt-doc__kpi-val">' + esc(kpi.yoyDropRate) + '</span><span class="cta-rpt-doc__kpi-unit">%</span><span class="cta-rpt-doc__kpi-label">近期同比降幅</span></div>' +
            '<div class="cta-rpt-doc__kpi"><span class="cta-rpt-doc__kpi-val">' + esc(kpi.greenRate2024) + '</span><span class="cta-rpt-doc__kpi-unit"></span><span class="cta-rpt-doc__kpi-label">2024 绿电消纳率</span></div>' +
            '<div class="cta-rpt-doc__kpi"><span class="cta-rpt-doc__kpi-val">' + esc(kpi.subCompliance) + '</span><span class="cta-rpt-doc__kpi-unit">家</span><span class="cta-rpt-doc__kpi-label">下属企业达标</span></div>' +
          '</div>' +
        '</section>' +

        '<section class="cta-rpt-doc__section">' +
          h2('历史数据可视化分析') +
          '<div class="cta-rpt-doc__charts">' +
            '<div class="cta-rpt-doc__chart-box"><h3>集团碳排放趋势（折线图）</h3><div class="cta-rpt-chart" id="' + chartPrefix + 'trend"></div></div>' +
            '<div class="cta-rpt-doc__chart-box"><h3>达峰中和路径预测（折线图）</h3><div class="cta-rpt-chart" id="' + chartPrefix + 'pathway"></div></div>' +
            '<div class="cta-rpt-doc__chart-box"><h3>下属企业排放对比（柱状图）</h3><div class="cta-rpt-chart" id="' + chartPrefix + 'bar"></div></div>' +
            '<div class="cta-rpt-doc__chart-box"><h3>2024 排放结构占比（饼图）</h3><div class="cta-rpt-chart" id="' + chartPrefix + 'pie"></div></div>' +
            '<div class="cta-rpt-doc__chart-box"><h3>范围一/二/三结构（饼图）</h3><div class="cta-rpt-chart" id="' + chartPrefix + 'scope"></div></div>' +
            '<div class="cta-rpt-doc__chart-box"><h3>现状与目标差距（柱状图）</h3><div class="cta-rpt-chart" id="' + chartPrefix + 'gap"></div></div>' +
            '<div class="cta-rpt-doc__chart-box cta-rpt-doc__chart-box--wide"><h3>企业综合表现（雷达图）</h3><div class="cta-rpt-chart cta-rpt-chart--tall" id="' + chartPrefix + 'radar"></div></div>' +
          '</div>' +
        '</section>' +

        '<section class="cta-rpt-doc__section">' +
          h2('差距分析与目标可达性') +
          '<p class="cta-rpt-doc__lead">对比现状与 ' + ctx.year + ' 年目标，评估减排缺口及完成难度（基于历史趋势线性外推）。</p>' +
          '<div class="cta-rpt-doc__table-wrap"><table class="cta-rpt-doc__table">' +
            '<thead><tr><th>指标</th><th>2024 现状</th><th>' + ctx.year + ' 目标</th><th>减排缺口</th><th>完成难度</th><th>主要措施</th></tr></thead>' +
            '<tbody>' +
              '<tr><td>碳排放总量</td><td>' + kpi.latestEmissionTotal + ' 万吨</td><td>' + esc(ctx.targetRows[0] ? ctx.targetRows[0].target : '—') + ' 万吨</td><td>' + pro.gapTotal + ' 万吨</td><td><span class="cta-rpt-doc__tag">中</span></td><td>能效+绿电+工艺优化</td></tr>' +
              '<tr><td>碳排放强度</td><td>' + kpi.latestIntensity + '</td><td>' + esc(ctx.targetRows[1] ? ctx.targetRows[1].target : '—') + '</td><td>—</td><td><span class="cta-rpt-doc__tag cta-rpt-doc__tag--ok">低</span></td><td>产值增长与排放脱钩</td></tr>' +
              '<tr><td>绿电消纳率</td><td>' + esc(kpi.greenRate2024) + '</td><td>≥40%</td><td>—</td><td><span class="cta-rpt-doc__tag">中</span></td><td>长协绿电+自建光伏</td></tr>' +
            '</tbody>' +
          '</table></div>' +
        '</section>' +

        '<section class="cta-rpt-doc__section">' +
          h2('行业对标分析') +
          '<p class="cta-rpt-doc__lead">选取同行业央企及区域标杆进行横向对标，识别优势指标与改进空间。</p>' +
          '<div class="cta-rpt-doc__table-wrap"><table class="cta-rpt-doc__table">' +
            '<thead><tr><th>对标维度</th><th>本集团</th><th>行业平均</th><th>标杆企业</th><th>评价</th></tr></thead>' +
            '<tbody>' + buildTableRows(pro.benchmarks || [], ['dim','self','industry','leader','verdict'], function (r, c) { return r[c]; }) + '</tbody>' +
          '</table></div>' +
        '</section>' +

        '<section class="cta-rpt-doc__section">' +
          h2('指标目标结果') +
          '<div class="cta-rpt-doc__table-wrap"><table class="cta-rpt-doc__table">' +
            '<thead><tr><th>指标</th><th>目标值</th><th>单位</th><th>较基期变化</th><th>' + ctx.monthNum + '月分解目标</th></tr></thead>' +
            '<tbody>' + ctx.targetRows.map(function (r) {
              return '<tr><td>' + esc(r.name) + '</td><td>' + esc(r.target) + '</td><td>' + esc(r.unit) + '</td><td>' + esc(r.change) + '</td><td>' + esc(r.monthly) + '</td></tr>';
            }).join('') + '</tbody>' +
          '</table></div>' +
        '</section>' +

        '<section class="cta-rpt-doc__section">' +
          h2('目标分解与责任矩阵') +
          '<p class="cta-rpt-doc__lead">按「集团—区域—企业」三级分解原则，明确责任主体与完成时限。</p>' +
          '<div class="cta-rpt-doc__table-wrap"><table class="cta-rpt-doc__table">' +
            '<thead><tr><th>责任主体</th><th>分解目标</th><th>占比</th><th>责任部门</th><th>完成时限</th></tr></thead>' +
            '<tbody>' + buildTableRows(pro.decomposition || [], ['entity','target','share','owner','deadline'], function (r, c) { return r[c]; }) + '</tbody>' +
          '</table></div>' +
        '</section>' +

        '<section class="cta-rpt-doc__section">' +
          h2('减排措施与项目清单') +
          '<p class="cta-rpt-doc__lead">基于差距分析，梳理可落地减排项目；合计预期年减排约 <strong>1.33 万吨</strong>，可覆盖总量缺口。</p>' +
          '<div class="cta-rpt-doc__table-wrap"><table class="cta-rpt-doc__table">' +
            '<thead><tr><th>类型</th><th>项目名称</th><th>预期减排</th><th>投资估算</th><th>实施周期</th></tr></thead>' +
            '<tbody>' + buildTableRows(pro.measures || [], ['type','name','reduction','invest','period'], function (r, c) { return r[c]; }) + '</tbody>' +
          '</table></div>' +
        '</section>' +

        '<section class="cta-rpt-doc__section">' +
          h2('监测、报告与核查（MRV）方案') +
          '<p class="cta-rpt-doc__lead">建立数据质量管理与第三方核查机制，保障目标执行可测量、可报告、可核查。</p>' +
          '<div class="cta-rpt-doc__table-wrap"><table class="cta-rpt-doc__table">' +
            '<thead><tr><th>环节</th><th>频次</th><th>数据来源</th><th>责任部门</th></tr></thead>' +
            '<tbody>' + buildTableRows(pro.mrv || [], ['item','freq','source','dept'], function (r, c) { return r[c]; }) + '</tbody>' +
          '</table></div>' +
        '</section>' +

        '<section class="cta-rpt-doc__section">' +
          h2('风险识别与敏感性分析') +
          '<div class="cta-rpt-doc__table-wrap"><table class="cta-rpt-doc__table">' +
            '<thead><tr><th>风险因素</th><th>等级</th><th>潜在影响</th><th>应对措施</th></tr></thead>' +
            '<tbody>' + (pro.risks || []).map(function (r) {
              var cls = r.level === '高' ? 'cta-rpt-doc__tag cta-rpt-doc__tag--warn' : (r.level === '中' ? 'cta-rpt-doc__tag' : 'cta-rpt-doc__tag cta-rpt-doc__tag--ok');
              return '<tr><td>' + esc(r.risk) + '</td><td><span class="' + cls + '">' + esc(r.level) + '</span></td><td>' + esc(r.impact) + '</td><td>' + esc(r.action) + '</td></tr>';
            }).join('') + '</tbody>' +
          '</table></div>' +
        '</section>' +

        '<section class="cta-rpt-doc__section">' +
          h2('智能体综合分析结论') +
          '<div class="cta-rpt-doc__ai">' + formatAiHtml(ctx.aiConclusion) + '</div>' +
        '</section>' +

        '<footer class="cta-rpt-doc__foot">' +
          '本报告由集团碳账本 · 数据对标智能体自动生成 · 依据 GB/T 32150 / ISO 14064 框架 · AI 内容提交决策前请组织专家评审' +
        '</footer>' +
      '</div>'
    );
  }

  function chartTheme() {
    return {
      textStyle: { color: '#5a6a7a', fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif' },
      grid: { left: 48, right: 24, top: 36, bottom: 32 },
    };
  }

  function mountCharts(container, ctx, prefix) {
    prefix = prefix || 'cta-rpt-';
    if (!global.echarts) return [];
    var charts = [];
    var c = ctx.charts;
    var targetYear = ctx.year || '2025';

    var trendEl = container.querySelector('#' + prefix + 'trend');
    if (trendEl) {
      var ch1 = global.echarts.init(trendEl);
      ch1.setOption(Object.assign({
        tooltip: { trigger: 'axis' },
        legend: { data: ['排放总量', '碳强度'], top: 0 },
        xAxis: { type: 'category', data: c.trendYears, axisLine: { lineStyle: { color: '#ccc' } } },
        yAxis: [
          { type: 'value', name: '万吨', splitLine: { lineStyle: { color: '#eef2f6' } } },
          { type: 'value', name: '强度', splitLine: { show: false } },
        ],
        series: [
          { name: '排放总量', type: 'line', smooth: true, data: c.trendTotals, itemStyle: { color: '#32b36c' }, areaStyle: { color: 'rgba(50,179,108,0.12)' } },
          { name: '碳强度', type: 'line', smooth: true, yAxisIndex: 1, data: c.trendIntensity, itemStyle: { color: '#389bff' } },
        ],
      }, chartTheme()));
      charts.push(ch1);
    }

    var barEl = container.querySelector('#' + prefix + 'bar');
    if (barEl) {
      var ch2 = global.echarts.init(barEl);
      ch2.setOption(Object.assign({
        tooltip: { trigger: 'axis' },
        legend: { data: ['2023', '2024'], top: 0 },
        xAxis: { type: 'category', data: c.subNames, axisLabel: { rotate: 15, fontSize: 11 } },
        yAxis: { type: 'value', name: '万吨' },
        series: [
          { name: '2023', type: 'bar', data: c.sub2023, itemStyle: { color: '#93c5fd' } },
          { name: '2024', type: 'bar', data: c.sub2024, itemStyle: { color: '#32b36c' } },
        ],
      }, chartTheme()));
      charts.push(ch2);
    }

    var pieEl = container.querySelector('#' + prefix + 'pie');
    if (pieEl) {
      var ch3 = global.echarts.init(pieEl);
      ch3.setOption({
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', right: 8, top: 'center', textStyle: { fontSize: 11 } },
        series: [{
          type: 'pie',
          radius: ['38%', '62%'],
          center: ['40%', '50%'],
          data: c.subNames.map(function (name, i) {
            return { name: name, value: c.sub2024[i] };
          }),
          itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
          label: { formatter: '{b}\n{d}%' },
        }],
        color: ['#32b36c', '#389bff', '#f59e0b', '#8b5cf6'],
      });
      charts.push(ch3);
    }

    var radarEl = container.querySelector('#' + prefix + 'radar');
    if (radarEl) {
      var ch4 = global.echarts.init(radarEl);
      ch4.setOption({
        tooltip: {},
        legend: { data: c.radar.map(function (r) { return r.name; }), bottom: 0, textStyle: { fontSize: 10 } },
        radar: {
          indicator: [
            { name: '目标完成', max: 100 },
            { name: '排放控制', max: 100 },
            { name: '绿电消纳', max: 100 },
            { name: '减排贡献', max: 100 },
            { name: '综合评分', max: 100 },
          ],
          radius: '58%',
        },
        series: [{ type: 'radar', data: c.radar }],
        color: ['#32b36c', '#389bff', '#f59e0b', '#8b5cf6'],
      });
      charts.push(ch4);
    }

    var pathEl = container.querySelector('#' + prefix + 'pathway');
    if (pathEl && c.pathway) {
      var ch5 = global.echarts.init(pathEl);
      ch5.setOption(Object.assign({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: c.pathway.years },
        yAxis: { type: 'value', name: '万吨' },
        series: [{
          name: '排放路径',
          type: 'line',
          smooth: true,
          data: c.pathway.values,
          itemStyle: { color: '#0d7a4a' },
          markLine: {
            silent: true,
            data: [{ xAxis: '2028', label: { formatter: '达峰' } }, { xAxis: '2060', label: { formatter: '中和' } }],
            lineStyle: { type: 'dashed', color: '#f59e0b' },
          },
        }],
      }, chartTheme()));
      charts.push(ch5);
    }

    var scopeEl = container.querySelector('#' + prefix + 'scope');
    if (scopeEl && c.scopeStructure) {
      var ch6 = global.echarts.init(scopeEl);
      ch6.setOption({
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie',
          radius: ['36%', '62%'],
          data: c.scopeStructure,
          label: { formatter: '{b}\n{d}%' },
        }],
        color: ['#32b36c', '#389bff', '#94a3b8'],
      });
      charts.push(ch6);
    }

    var gapEl = container.querySelector('#' + prefix + 'gap');
    if (gapEl && c.gapCompare) {
      var ch7 = global.echarts.init(gapEl);
      ch7.setOption(Object.assign({
        tooltip: { trigger: 'axis' },
        legend: { data: ['2024现状', targetYear + '目标'], top: 0 },
        xAxis: { type: 'category', data: c.gapCompare.labels },
        yAxis: { type: 'value' },
        series: [
          { name: '2024现状', type: 'bar', data: c.gapCompare.current, itemStyle: { color: '#93c5fd' } },
          { name: targetYear + '目标', type: 'bar', data: c.gapCompare.target, itemStyle: { color: '#32b36c' } },
        ],
      }, chartTheme()));
      charts.push(ch7);
    }

    return charts;
  }

  var modalCharts = [];
  var previewContext = null;

  function closePreview() {
    var modal = document.getElementById('cta-report-modal');
    if (modal) modal.classList.add('hidden');
    modalCharts.forEach(function (ch) { try { ch.dispose(); } catch (e) { /* ignore */ } });
    modalCharts = [];
    previewContext = null;
    document.body.style.overflow = '';
  }

  function openPreview(ctx) {
    var modal = document.getElementById('cta-report-modal');
    var body = document.getElementById('cta-report-modal-body');
    if (!modal || !body) return;

    closePreview();
    previewContext = ctx;
    body.innerHTML = buildReportBodyHtml(ctx, 'cta-rpt-modal-');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    loadEcharts().then(function () {
      modalCharts = mountCharts(body, ctx, 'cta-rpt-modal-');
      requestAnimationFrame(function () {
        modalCharts.forEach(function (ch) { ch.resize(); });
      });
    }).catch(function () {
      body.insertAdjacentHTML('beforeend', '<p class="cta-rpt-doc__err">图表库加载失败，请检查网络后重试。</p>');
    });
  }

  function buildDownloadHtml(ctx) {
    var body = buildReportBodyHtml(ctx, 'dl-');
    var chartData = JSON.stringify(ctx.charts);
    var targetYear = ctx.year || '2025';
    return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"/>' +
      '<meta name="viewport" content="width=device-width,initial-scale=1"/>' +
      '<title>碳目标制定专业报告-' + esc(ctx.year) + '年' + ctx.monthNum + '月</title>' +
      '<script src="' + ECHARTS_CDN + '"><\/script>' +
      '<style>' + getReportDocCss(true) + '</style></head><body>' +
      body +
      '<script>document.addEventListener("DOMContentLoaded",function(){' +
      'var c=' + chartData + ',y="' + targetYear + '";' +
      'function init(){if(!window.echarts)return;' +
      'var all=[];' +
      'function mk(id,opt){var el=document.getElementById(id);if(!el)return;var ch=echarts.init(el);ch.setOption(opt);all.push(ch);}' +
      'mk("dl-trend",{tooltip:{trigger:"axis"},legend:{data:["排放总量","碳强度"]},xAxis:{type:"category",data:c.trendYears},yAxis:[{type:"value",name:"万吨"},{type:"value",name:"强度"}],series:[{name:"排放总量",type:"line",smooth:true,data:c.trendTotals,itemStyle:{color:"#32b36c"},areaStyle:{color:"rgba(50,179,108,0.12)"}},{name:"碳强度",type:"line",smooth:true,yAxisIndex:1,data:c.trendIntensity,itemStyle:{color:"#389bff"}}]});' +
      'mk("dl-pathway",{tooltip:{trigger:"axis"},xAxis:{type:"category",data:c.pathway.years},yAxis:{type:"value",name:"万吨"},series:[{type:"line",smooth:true,data:c.pathway.values,itemStyle:{color:"#0d7a4a"}}]});' +
      'mk("dl-bar",{tooltip:{trigger:"axis"},legend:{data:["2023","2024"]},xAxis:{type:"category",data:c.subNames},yAxis:{type:"value",name:"万吨"},series:[{name:"2023",type:"bar",data:c.sub2023,itemStyle:{color:"#93c5fd"}},{name:"2024",type:"bar",data:c.sub2024,itemStyle:{color:"#32b36c"}}]});' +
      'mk("dl-pie",{tooltip:{trigger:"item"},series:[{type:"pie",radius:["38%","62%"],data:c.subNames.map(function(n,i){return{name:n,value:c.sub2024[i]}}),label:{formatter:"{b}\\n{d}%"}}],color:["#32b36c","#389bff","#f59e0b","#8b5cf6"]});' +
      'mk("dl-scope",{tooltip:{trigger:"item"},series:[{type:"pie",radius:["36%","62%"],data:c.scopeStructure,label:{formatter:"{b}\\n{d}%"}}],color:["#32b36c","#389bff","#94a3b8"]});' +
      'mk("dl-gap",{tooltip:{trigger:"axis"},legend:{data:["2024现状",y+"目标"]},xAxis:{type:"category",data:c.gapCompare.labels},yAxis:{type:"value"},series:[{name:"2024现状",type:"bar",data:c.gapCompare.current,itemStyle:{color:"#93c5fd"}},{name:y+"目标",type:"bar",data:c.gapCompare.target,itemStyle:{color:"#32b36c"}}]});' +
      'mk("dl-radar",{legend:{data:c.radar.map(function(x){return x.name}),bottom:0},radar:{indicator:[{name:"目标完成",max:100},{name:"排放控制",max:100},{name:"绿电消纳",max:100},{name:"减排贡献",max:100},{name:"综合评分",max:100}],radius:"58%"},series:[{type:"radar",data:c.radar}],color:["#32b36c","#389bff","#f59e0b","#8b5cf6"]});' +
      'window.addEventListener("resize",function(){all.forEach(function(ch){ch.resize();});});}' +
      'init();});<\/script>' +
      '</body></html>';
  }

  function download(ctx) {
    var html = buildDownloadHtml(ctx);
    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '碳目标制定专业报告_' + ctx.year + '年' + ctx.monthNum + '月_' + ctx.reportNo + '.html';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 200);
  }

  function getReportDocCss(forPrint) {
    return (
      (forPrint ? 'body{margin:0;padding:24px;background:#f5f7fa;font-family:PingFang SC,Microsoft YaHei,sans-serif;color:#333}' : '') +
      '.cta-rpt-doc{max-width:920px;margin:0 auto}' +
      '.cta-rpt-doc__head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding-bottom:20px;border-bottom:2px solid #32b36c;margin-bottom:24px}' +
      '.cta-rpt-doc__brand{display:flex;gap:12px;align-items:center}' +
      '.cta-rpt-doc__logo{font-size:32px}' +
      '.cta-rpt-doc__head h1{margin:0;font-size:22px;color:#0d7a4a}' +
      '.cta-rpt-doc__sub{margin:4px 0 0;font-size:12px;color:#888}' +
      '.cta-rpt-doc__meta{text-align:right;font-size:12px;color:#666}' +
      '.cta-rpt-doc__meta label{display:block;color:#999;margin-bottom:2px}' +
      '.cta-rpt-doc__section{margin-bottom:28px}' +
      '.cta-rpt-doc__section h2{margin:0 0 12px;font-size:15px;color:#0d7a4a;border-left:3px solid #32b36c;padding-left:10px}' +
      '.cta-rpt-doc__lead{margin:0 0 12px;font-size:13px;color:#666;line-height:1.6}' +
      '.cta-rpt-doc__info-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}' +
      '.cta-rpt-doc__info-item{background:#fff;border:1px solid #e8ebf0;border-radius:8px;padding:10px 12px}' +
      '.cta-rpt-doc__info-item--wide{grid-column:1/-1}' +
      '.cta-rpt-doc__info-item label{display:block;font-size:11px;color:#999;margin-bottom:4px}' +
      '.cta-rpt-doc__info-item span{font-size:14px;font-weight:500;color:#1a1a1a}' +
      '.cta-rpt-doc__kpi-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px}' +
      '.cta-rpt-doc__kpi{background:#fff;border:1px solid #e8ebf0;border-radius:10px;padding:14px 10px;text-align:center}' +
      '.cta-rpt-doc__kpi-val{font-size:22px;font-weight:700;color:#0d7a4a}' +
      '.cta-rpt-doc__kpi-unit{font-size:12px;color:#32b36c;margin-left:2px}' +
      '.cta-rpt-doc__kpi-label{display:block;margin-top:6px;font-size:11px;color:#888}' +
      '.cta-rpt-doc__abstract{background:linear-gradient(135deg,#f0faf4,#fff);border:1px solid #c6e9d4;border-radius:10px;padding:16px 18px;margin-bottom:24px}' +
      '.cta-rpt-doc__abstract h2{margin:0 0 10px;font-size:15px;color:#0d7a4a;border-left:3px solid #32b36c;padding-left:10px}' +
      '.cta-rpt-doc__abstract-body{font-size:13px;line-height:1.85;color:#444}' +
      '.cta-rpt-doc__tag{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500;background:#fef3c7;color:#92400e}' +
      '.cta-rpt-doc__tag--ok{background:#dcfce7;color:#166534}' +
      '.cta-rpt-doc__tag--warn{background:#fee2e2;color:#991b1b}' +
      '.cta-rpt-doc__charts{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}' +
      '.cta-rpt-doc__chart-box{background:#fff;border:1px solid #e8ebf0;border-radius:10px;padding:12px}' +
      '.cta-rpt-doc__chart-box h3{margin:0 0 8px;font-size:12px;font-weight:600;color:#555}' +
      '.cta-rpt-chart{height:240px;width:100%}' +
      '.cta-rpt-doc__table-wrap{overflow-x:auto;background:#fff;border:1px solid #e8ebf0;border-radius:8px}' +
      '.cta-rpt-doc__table{width:100%;border-collapse:collapse;font-size:13px;color:#1a1a1a}' +
      '.cta-rpt-doc__table th,.cta-rpt-doc__table td{padding:10px 12px;border-bottom:1px solid #eef2f6;text-align:left}' +
      '.cta-rpt-doc__table th{background:#f0faf4;color:#0a5c32;font-weight:600}' +
      '.cta-rpt-doc__table td{color:#1a1a1a;font-weight:500}' +
      '.cta-rpt-doc__ai{background:#fff;border:1px solid #e8ebf0;border-radius:10px;padding:16px 18px;font-size:13px;line-height:1.85;color:#444}' +
      '.cta-rpt-doc__ai strong{color:#0d7a4a}' +
      '.cta-rpt-doc__foot{margin-top:32px;padding-top:16px;border-top:1px solid #e8ebf0;font-size:11px;color:#999;text-align:center}' +
      '.cta-rpt-doc__err{color:#e11d48;font-size:13px}' +
      '@media(max-width:720px){.cta-rpt-doc__charts{grid-template-columns:1fr}.cta-rpt-doc__head{flex-direction:column}}'
    );
  }

  function bindModal() {
    var modal = document.getElementById('cta-report-modal');
    if (!modal || modal.dataset.bound) return;
    modal.dataset.bound = '1';
    modal.querySelector('.cta-report-modal__backdrop').addEventListener('click', closePreview);
    modal.querySelector('.cta-report-modal__close').addEventListener('click', closePreview);
    var downloadBtn = document.getElementById('cta-report-modal-download');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', function () {
        if (previewContext) download(previewContext);
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePreview();
    });
  }

  global.CarbonTargetReport = {
    buildContext: buildContext,
    openPreview: openPreview,
    download: download,
    closePreview: closePreview,
    bindModal: bindModal,
    getReportDocCss: getReportDocCss,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindModal);
  } else {
    bindModal();
  }
})(window);
