/**
 * 集团碳账本智能体内核（冀东）
 * - 企业检索（如「北水」）
 * - 多源模拟拉取
 * - 对标分析意图 → 仅输出冀东企业报告
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
    return global.JidongGroupData;
  }

  function resolveYearPeriod(text) {
    var t = String(text || '');
    var yearMatch = t.match(/(20\d{2})/);
    if (yearMatch) return yearMatch[1];
    if (/今年|本年|本年度|全年/.test(t)) {
      return String(new Date().getFullYear());
    }
    return String(new Date().getFullYear());
  }

  function detectYearlyBenchmarkIntent(text) {
    var t = String(text || '');
    if (/对标分析|综合对标|进行.*对标|给我.*对标|今年.*对标|年度对标/.test(t)) return true;
    if (/对标/.test(t) && (/分析|报告|今年|年度|全面/.test(t))) return true;
    return false;
  }

  function detectEnterpriseFromText(text) {
    var pack = data();
    if (!pack) return null;
    var t = String(text || '');
    var hits = pack.searchEnterprises(t);
    if (/北水/.test(t)) {
      var beishui = pack.searchEnterprises('北水');
      if (beishui.length === 1) return beishui[0];
      if (beishui.length > 1) {
        for (var i = 0; i < beishui.length; i++) {
          if (t.indexOf(beishui[i].name) >= 0) return beishui[i];
        }
        return beishui[0];
      }
    }
    for (var j = 0; j < pack.enterprises.length; j++) {
      if (t.indexOf(pack.enterprises[j].name) >= 0) return pack.enterprises[j];
    }
    if (hits.length === 1) return hits[0];
    return pack.getEnterpriseMeta();
  }

  function gatherSources(period, enterpriseId) {
    var pack = data();
    var meta = pack.getEnterpriseMeta(enterpriseId);
    var profile = pack.getPeriod(period, meta.id);
    var src = pack.sources;

    return [
      {
        id: 'xxxSite',
        name: src.xxxSite,
        status: '已返回',
        detail: meta.name + ' 公开披露摘要已汇总',
      },
      {
        id: 'baidu',
        name: src.baidu,
        status: '已返回',
        detail: '检索关键词「' + meta.name + ' 碳排放 对标」',
      },
      {
        id: 'cloudFacility',
        name: src.cloudFacility,
        status: '已返回',
        detail: '生产设施 ' + (profile.facilities || '—') + ' 处',
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
        detail: '产量 ' + profile.steelOutput + profile.steelOutputUnit + '（污碳模型推演）',
        green: true,
      },
      {
        id: 'cloudEmission',
        name: src.cloudEmission,
        status: '已返回',
        detail: '碳排放 ' + profile.co2Emission + profile.co2Unit + '（污碳模型推演）',
        green: true,
      },
      {
        id: 'cloudIntensity',
        name: src.cloudIntensity,
        status: '已返回',
        detail: '强度 ' + profile.co2Intensity + ' ' + profile.intensityUnit + '（污碳模型推演）',
        green: true,
      },
      {
        id: 'localDb',
        name: src.localDb,
        status: '已返回',
        detail: '冀东集团本地库已对齐「' + meta.name + '」' + period + ' 周期',
      },
    ];
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

    var ent = detectEnterpriseFromText(userText) || pack.getEnterpriseMeta();
    pack.setActiveEnterprise(ent.id);
    var period = resolveYearPeriod(userText);
    var sources = gatherSources(period, ent.id);
    var profile = pack.getPeriod(period, ent.id);
    var yearly = detectYearlyBenchmarkIntent(userText);

    var sourceRows = sources.map(function (s) {
      return [s.green ? '云图' : '外部/本地', s.name.replace(/^（绿色）\s*/, ''), s.status];
    });

    return [
      {
        id: 'parse',
        text:
          '识别集团碳账本内核意图' +
          (yearly ? '：年度对标分析' : '') +
          ' → 企业「' +
          ent.name +
          '」',
        preview: buildMiniTable(
          ['项', '值'],
          [
            ['集团范围', '仅冀东'],
            ['选定企业', ent.name],
            ['统计周期', period + '年'],
            ['能力模块', yearly ? '对标智能体' : '智能问答'],
          ]
        ),
      },
      {
        id: 'search',
        text: /北水/.test(String(userText || ''))
          ? '按「北水」检索冀东下属企业并锁定分析对象'
          : '校验企业是否属于冀东集团范围',
        preview: buildMiniTable(
          ['企业', '区域'],
          pack.searchEnterprises(/北水/.test(String(userText || '')) ? '北水' : '').map(function (e) {
            return [e.name, e.region];
          })
        ),
      },
      {
        id: 'sources',
        text: '汇聚多源数据（网站 / 百度 / 佳华双碳云图 / 本地库）',
        preview: buildMiniTable(['类型', '数据源', '状态'], sourceRows),
      },
      {
        id: 'cloud',
        text: '拉取佳华双碳云图设施、排污、产量、排放与强度',
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
        id: 'local',
        text: '对齐本地数据库 · 冀东集团碳排放数据',
        preview: buildMiniTable(
          ['指标', '数值'],
          [
            ['企业', ent.name],
            ['产量', profile.steelOutput + profile.steelOutputUnit],
            ['碳排放', profile.co2Emission + profile.co2Unit],
            ['强度', profile.co2Intensity + ' ' + profile.intensityUnit],
            ['配额缺口', profile.quotaSurplus + ' 万吨'],
          ]
        ),
      },
      {
        id: 'report',
        text: '生成所选企业分析报告（仅冀东范围）',
        preview: buildMiniTable(
          ['输出', '说明'],
          [
            ['报告主体', ent.name],
            ['范围约束', pack.scopeNote],
            ['对标行业', '水泥'],
          ]
        ),
      },
    ];
  }

  function beforeHandle(text) {
    var pack = data();
    if (!pack || typeof BenchmarkDataService === 'undefined') return;

    var ent = detectEnterpriseFromText(text);
    if (ent) pack.setActiveEnterprise(ent.id);

    BenchmarkDataService.DISPLAY.SELF = pack.enterpriseName;
    BenchmarkDataService.DISPLAY.INDUSTRY_AVG = '行业均值（全国水泥）';
    BenchmarkDataService.DISPLAY.BENCHMARK = '行业标杆（前5%）';
    BenchmarkDataService.DISPLAY.COMPARE_TARGET = '区域内标杆企业';
    BenchmarkDataService.DISPLAY.PEER_MASK = '某水泥企业';
    BenchmarkDataService.INDUSTRY_POOL['水泥'] = Object.assign(
      { unit: 'tCO₂/t' },
      pack.industryBenchmark
    );

    if (typeof BenchmarkSlotFilling !== 'undefined') {
      var slots = BenchmarkSlotFilling.slots;
      slots.industry = '水泥';
      slots.objectDimension = 'enterprise';
      if (detectYearlyBenchmarkIntent(text) || /今年|本年|年度/.test(text)) {
        slots.timeDimension = 'yearly';
        slots.timeValue = resolveYearPeriod(text);
        slots.functionType = 'comparison';
      }
      if (/北水|冀东/.test(text)) {
        slots.objectDimension = 'enterprise';
      }
    }
  }

  function afterResult(text, result) {
    if (!detectYearlyBenchmarkIntent(text)) return;
    if (typeof BenchmarkReport === 'undefined' || !BenchmarkReport.openPreviewInNewTab) return;
    var pack = data();
    var payload = {
      result: result,
      period: resolveYearPeriod(text),
      enterpriseName: pack && pack.enterpriseName,
      kernel: 'group-ledger-jidong',
      sources: gatherSources(resolveYearPeriod(text), pack && pack.activeEnterpriseId),
    };
    setTimeout(function () {
      try {
        BenchmarkReport.openPreviewInNewTab(payload);
      } catch (e) {
        /* ignore popup blockers */
      }
    }, 600);
  }

  global.DemoSceneKernel = {
    id: 'group-ledger-jidong',
    capabilities: CAPABILITIES,
    resolveYearPeriod: resolveYearPeriod,
    detectYearlyBenchmarkIntent: detectYearlyBenchmarkIntent,
    detectEnterpriseFromText: detectEnterpriseFromText,
    gatherSources: gatherSources,
    searchEnterprises: function (kw) {
      return data() ? data().searchEnterprises(kw) : [];
    },
    getQuerySteps: getQuerySteps,
    beforeHandle: beforeHandle,
    afterResult: afterResult,
  };
})(window);
