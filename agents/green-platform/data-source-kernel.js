/**
 * 绿色低碳管理平台智能体内核
 * - 企业名 + 工序数值录入
 * - 年报 / 五年方案 / 其他材料上传（演示解析）
 * - 多源汇聚 → 仅针对输入工序生成分析报告
 */
(function (global) {
  'use strict';

  var CAPABILITIES = [
    { id: 'qa', label: '智能问答', active: true },
    { id: 'askData', label: '智能问数', active: false },
    { id: 'benchmark', label: '对标智能体', active: false, accent: 'warn' },
    { id: 'trade', label: '交易智能体', active: false },
    { id: 'extra', label: 'XX智能体', active: false },
  ];

  function data() {
    return global.GreenPlatformData;
  }

  function resolveYearPeriod(text) {
    var t = String(text || '');
    var yearMatch = t.match(/(20\d{2})/);
    if (yearMatch) return yearMatch[1];
    if (/今年|本年|本年度|全年/.test(t)) return String(new Date().getFullYear());
    return String(new Date().getFullYear());
  }

  function detectYearlyBenchmarkIntent(text) {
    var t = String(text || '');
    if (/对标分析|综合对标|进行.*对标|给我.*对标|今年.*对标|年度对标|工序对标/.test(t)) return true;
    if (/对标/.test(t) && (/分析|报告|今年|年度|全面|工序/.test(t))) return true;
    return false;
  }

  function gatherSources(period) {
    var pack = data();
    var profile = pack.getPeriod(period);
    var src = pack.sources;
    var procNames = (pack.processes || [])
      .map(function (p) {
        return p.name;
      })
      .join('、');

    var list = [
      {
        id: 'xxxSite',
        name: src.xxxSite,
        status: '已返回',
        detail: pack.enterpriseName + ' 公开信息摘要已汇总',
      },
      {
        id: 'baidu',
        name: src.baidu,
        status: '已返回',
        detail: '检索「' + pack.enterpriseName + ' 绿色低碳 工序排放」',
      },
      {
        id: 'cloudFacility',
        name: src.cloudFacility,
        status: '已返回',
        detail: '关联工序设施 ' + (profile.facilities || 0) + ' 处：' + procNames,
        green: true,
      },
      {
        id: 'cloudPollutant',
        name: src.cloudPollutant,
        status: '已返回',
        detail:
          'SO₂ ' +
          profile.pollutants.so2 +
          profile.pollutants.unit +
          ' / NOx ' +
          profile.pollutants.nox +
          profile.pollutants.unit,
        green: true,
      },
      {
        id: 'cloudProduction',
        name: src.cloudProduction,
        status: '已返回',
        detail: '工序合计产量 ' + profile.steelOutput + profile.steelOutputUnit + '（污碳模型推演）',
        green: true,
      },
      {
        id: 'cloudEmission',
        name: src.cloudEmission,
        status: '已返回',
        detail: '工序合计排放 ' + profile.co2Emission + profile.co2Unit + '（污碳模型推演）',
        green: true,
      },
      {
        id: 'cloudIntensity',
        name: src.cloudIntensity,
        status: '已返回',
        detail: '综合强度 ' + profile.co2Intensity + ' ' + profile.intensityUnit + '（污碳模型推演）',
        green: true,
      },
    ];

    if (pack.uploads && pack.uploads.length) {
      list.push({
        id: 'uploads',
        name: src.uploads,
        status: '已返回',
        detail: '已解析材料 ' + pack.uploads.length + ' 份',
      });
    }

    return list;
  }

  function buildMiniTable(headers, rows) {
    var html = '<table class="cta-think-table"><thead><tr>';
    headers.forEach(function (h) {
      html += '<th>' + h + '</th>';
    });
    html += '</tr></thead><tbody>';
    rows.forEach(function (row) {
      html += '<tr>';
      row.forEach(function (cell) {
        html += '<td>' + cell + '</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }

  function getQuerySteps(userText) {
    var pack = data();
    if (!pack) return null;

    var period = resolveYearPeriod(userText);
    var sources = gatherSources(period);
    var profile = pack.getPeriod(period);
    var yearly = detectYearlyBenchmarkIntent(userText);
    var procRows = (pack.processes || []).map(function (p) {
      return [p.name, p.intensity + ' ' + p.unit, (p.output || 0) + ' 万吨'];
    });
    var uploadRows = (pack.uploads || []).map(function (u) {
      return [u.name, u.category === 'annual' ? '年报' : u.category === 'strategy' ? '五年方案' : '其他', u.summary];
    });

    return [
      {
        id: 'parse',
        text:
          '识别绿色低碳管理平台内核意图' +
          (yearly ? '：对标分析' : '') +
          ' →「' +
          pack.enterpriseName +
          '」',
        preview: buildMiniTable(
          ['项', '值'],
          [
            ['企业', pack.enterpriseName],
            ['分析范围', '仅输入工序'],
            ['工序数', String((pack.processes || []).length)],
            ['上传材料', String((pack.uploads || []).length) + ' 份'],
            ['统计周期', period + '年'],
          ]
        ),
      },
      {
        id: 'process',
        text: '读取用户录入的企业名与工序碳排放数值',
        preview: buildMiniTable(['工序', '强度', '产量'], procRows),
      },
      {
        id: 'upload',
        text:
          pack.uploads && pack.uploads.length
            ? '解析上传的年报 / 五年行动方案 / 其他材料'
            : '未检测到上传材料，仅基于工序录入值继续分析',
        preview:
          uploadRows.length > 0
            ? buildMiniTable(['文件', '类型', '解析摘要'], uploadRows)
            : buildMiniTable(['提示', '说明'], [['上传', '可补充 Excel / Word / PDF 以增强依据']]),
      },
      {
        id: 'sources',
        text: '汇聚多源数据（网站 / 百度 / 佳华双碳云图）',
        preview: buildMiniTable(
          ['类型', '数据源', '状态'],
          sources.map(function (s) {
            return [s.green ? '云图' : '外部/材料', s.name, s.status];
          })
        ),
      },
      {
        id: 'cloud',
        text: '拉取佳华双碳云图设施、排污、产量、排放与强度（限定输入工序）',
        preview: buildMiniTable(
          ['云图模块', '结果'],
          sources
            .filter(function (s) {
              return s.green;
            })
            .map(function (s) {
              return [s.name.replace(/^佳华双碳云图\s*[·\-—]\s*/, ''), s.detail];
            })
        ),
      },
      {
        id: 'report',
        text: '生成所选企业分析报告（仅输入工序）',
        preview: buildMiniTable(
          ['输出', '说明'],
          [
            ['报告主体', pack.enterpriseName],
            ['综合强度', profile.co2Intensity + ' ' + profile.intensityUnit],
            ['范围约束', pack.scopeNote],
          ]
        ),
      },
    ];
  }

  function beforeHandle(text) {
    var pack = data();
    if (!pack || typeof BenchmarkDataService === 'undefined') return;

    /* 从问句中尝试提取企业名：分析XX公司 / XX企业对标 */
    var m = String(text || '').match(/(?:分析|对标|查询)?\s*([\u4e00-\u9fa5A-Za-z0-9（）()]{2,20}?(?:公司|企业|集团|厂))/);
    if (m && m[1]) pack.setEnterpriseName(m[1]);

    BenchmarkDataService.DISPLAY.SELF = pack.enterpriseName;
    BenchmarkDataService.DISPLAY.INDUSTRY_AVG = '行业均值';
    BenchmarkDataService.DISPLAY.BENCHMARK = '行业标杆（前5%）';
    BenchmarkDataService.DISPLAY.COMPARE_TARGET = '同类标杆企业';
    BenchmarkDataService.DISPLAY.PEER_MASK = '某制造企业';

    if (typeof BenchmarkSlotFilling !== 'undefined') {
      var slots = BenchmarkSlotFilling.slots;
      slots.industry = pack.industry || '钢铁';
      slots.objectDimension = 'process';
      if (detectYearlyBenchmarkIntent(text) || /今年|本年|年度|工序/.test(text)) {
        slots.timeDimension = 'yearly';
        slots.timeValue = resolveYearPeriod(text);
        slots.functionType = 'comparison';
      }
    }
  }

  function afterResult(text, result) {
    if (!detectYearlyBenchmarkIntent(text)) return;
    if (typeof BenchmarkReport === 'undefined' || !BenchmarkReport.openPreviewInNewTab) return;
    var pack = data();
    var period = resolveYearPeriod(text);
    var payload = {
      result: result,
      period: period,
      enterpriseName: pack && pack.enterpriseName,
      kernel: 'green-platform',
      sources: gatherSources(period),
      processes: pack && pack.processes,
    };
    setTimeout(function () {
      try {
        BenchmarkReport.openPreviewInNewTab(payload);
      } catch (e) {
        /* ignore */
      }
    }, 600);
  }

  global.DemoSceneKernel = {
    id: 'green-platform',
    capabilities: CAPABILITIES,
    resolveYearPeriod: resolveYearPeriod,
    detectYearlyBenchmarkIntent: detectYearlyBenchmarkIntent,
    gatherSources: gatherSources,
    getQuerySteps: getQuerySteps,
    beforeHandle: beforeHandle,
    afterResult: afterResult,
  };
})(window);
