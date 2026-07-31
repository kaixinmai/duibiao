/**
 * 数字碳表 · 金盛兰内核桥接
 * 挂接数据包、报告多维对标、数据来源绿字/机器人、聊天栏上传学习
 */
(function (global) {
  'use strict';

  var ROBOT_SVG =
    '<svg class="ds-robot" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" title="污碳模型推演">' +
    '<rect x="6" y="8" width="12" height="10" rx="2" fill="currentColor" opacity="0.9"/>' +
    '<circle cx="9.5" cy="12.5" r="1.2" fill="#fff"/>' +
    '<circle cx="14.5" cy="12.5" r="1.2" fill="#fff"/>' +
    '<path d="M12 4v3M9 5h6" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
    '<path d="M8 18v2M16 18v2" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
    '</svg>';

  function pack() {
    return global.JinshenglanData;
  }

  function patchDataService() {
    var data = pack();
    var ds = global.BenchmarkDataService;
    if (!data || !ds) return;

    ds.DISPLAY.SELF = data.enterpriseName;
    ds.DISPLAY.INDUSTRY_AVG = '行业均值（全国长流程钢铁）';
    ds.DISPLAY.BENCHMARK = '行业标杆（前5%）';
    ds.INDUSTRY_POOL['钢铁'] = Object.assign({ unit: 'tCO₂/t' }, data.industryBenchmark);

    ds.getEnterpriseProfile = function (slots) {
      var key =
        typeof ds.getPeriodKey === 'function'
          ? ds.getPeriodKey(slots || {})
          : (slots && slots.timeValue) || '2026';
      var profile = data.getPeriod(key);
      var adj = data.totalIntensityAdj();
      if (!adj) return profile;
      var cloned = Object.assign({}, profile);
      cloned.co2Intensity = Math.round((profile.co2Intensity + adj) * 1000) / 1000;
      return cloned;
    };

    if (!ds._jslPatchedDemo) {
      ds._jslPatchedDemo = true;
      var origDemo = ds.getDemoIntensity;
      ds.getDemoIntensity = function (industry, slots) {
        var profile = ds.getEnterpriseProfile(slots || {});
        if (profile && profile.co2Intensity != null) return profile.co2Intensity;
        return origDemo.call(ds, industry || '钢铁', slots);
      };
    }

    var origBuild = ds.buildResultByFocus;
    if (typeof origBuild === 'function' && !ds._jslPatchedBuild) {
      ds._jslPatchedBuild = true;
      ds.buildResultByFocus = function (slots, source, text) {
        slots.industry = '钢铁';
        return origBuild.call(ds, slots, source, text);
      };
    }

    if (global.BenchmarkSlotFilling && !global.BenchmarkSlotFilling._jslPatched) {
      global.BenchmarkSlotFilling._jslPatched = true;
      var origApply = global.BenchmarkSlotFilling.applyDefaults;
      global.BenchmarkSlotFilling.applyDefaults = function (text) {
        origApply.call(this, text);
        this.slots.industry = '钢铁';
        if (
          global.DemoSceneKernel &&
          global.DemoSceneKernel.detectYearlyBenchmarkIntent &&
          global.DemoSceneKernel.detectYearlyBenchmarkIntent(text)
        ) {
          this.slots.timeDimension = 'yearly';
          this.slots.timeValue = global.DemoSceneKernel.resolveYearPeriod(text);
          this.slots.functionType = 'comparison';
          this.slots.queryFocus = 'comprehensive';
        } else if (/今年|本年|年度|全年/.test(String(text || ''))) {
          this.slots.timeDimension = 'yearly';
          this.slots.timeValue = global.DemoSceneKernel
            ? global.DemoSceneKernel.resolveYearPeriod(text)
            : String(new Date().getFullYear());
        }
        this.slots.objectDimension = 'enterprise';
        return this.getSlots();
      };
    }

    if (typeof HenanSteelData !== 'undefined') {
      HenanSteelData.enterpriseName = data.enterpriseName;
      HenanSteelData.getPeriod = function (key) {
        return data.getPeriod(key);
      };
      HenanSteelData.getBenchmarkProfiles = function (key) {
        return data.getBenchmarkProfiles(key);
      };
      HenanSteelData.industryBenchmark = data.industryBenchmark;
      HenanSteelData.sources = data.sources;
    }

    if (global.BenchmarkIntent && !global.BenchmarkIntent._jslPatched) {
      global.BenchmarkIntent._jslPatched = true;
      var origThink = global.BenchmarkIntent.buildThinkingSteps;
      global.BenchmarkIntent.buildThinkingSteps = function (intent, willShowResult) {
        var steps = origThink.call(this, intent, willShowResult);
        return (steps || []).map(function (s) {
          return String(s).replace(/河南钢铁集团/g, data.enterpriseName);
        });
      };
    }

    if (!ds._jslPatchedAnswer) {
      ds._jslPatchedAnswer = true;
      var origAnswer = ds.buildAnswerText;
      ds.buildAnswerText = function (focus, userText, slots, ranking, dataSource) {
        var text = origAnswer.call(this, focus, userText, slots, ranking, dataSource);
        return String(text || '')
          .replace(/河南钢铁集团/g, data.enterpriseName)
          .replace(/安阳钢铁/g, data.enterpriseName)
          .replace(/河南钢铁集团生产系统/g, '金盛兰业务系统')
          .replace(/（河南钢铁集团生产系统数据）/g, '（金盛兰业务系统 / 本地库数据）')
          .replace(/生产系统数据/g, '业务系统与本地库数据');
      };
    }
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function num(v, digits) {
    if (v == null || v === '' || isNaN(Number(v))) return '—';
    var n = Number(v);
    if (digits == null) return String(n);
    return (Math.round(n * Math.pow(10, digits)) / Math.pow(10, digits)).toFixed(digits);
  }

  function historyYears() {
    return ['2020', '2021', '2022', '2023'].filter(function (y) {
      return pack() && pack().periods && pack().periods[y];
    });
  }

  function gapTone(selfVal, refVal, lowerBetter) {
    if (selfVal == null || refVal == null || isNaN(Number(selfVal)) || isNaN(Number(refVal))) {
      return { text: '—', cls: '' };
    }
    var diff = Number(selfVal) - Number(refVal);
    var better = lowerBetter ? diff < 0 : diff > 0;
    var abs = Math.abs(diff);
    var pct = refVal ? Math.abs((diff / Number(refVal)) * 100) : 0;
    return {
      text:
        (diff > 0 ? '+' : '') +
        num(diff, 2) +
        '（' +
        (better ? '优于' : '落后') +
        '基准 ' +
        num(pct, 1) +
        '%）',
      cls: better ? 'is-good' : 'is-warn',
    };
  }

  function energyLevelStatus(actual, item) {
    if (actual == null || isNaN(Number(actual)) || !item) {
      return { label: '—', cls: '', grade: '—' };
    }
    var v = Number(actual);
    var l1 = Number(item.level1 != null ? item.level1 : item.benchmark);
    var l2 = Number(
      item.level2 != null
        ? item.level2
        : item.access != null
          ? item.access
          : (l1 + Number(item.baseline != null ? item.baseline : item.level3 || l1)) / 2
    );
    var l3 = Number(item.level3 != null ? item.level3 : item.baseline != null ? item.baseline : item.limit);
    if (v <= l1) return { label: '1级·达/优于标杆', cls: 'is-good', grade: '1级' };
    if (!isNaN(l2) && v <= l2) return { label: '2级·达准入未达标杆', cls: 'is-mid', grade: '2级' };
    if (!isNaN(l3) && v <= l3) return { label: '3级·仅达限定/基准', cls: 'is-warn', grade: '3级' };
    return { label: '劣于3级限定/基准', cls: 'is-warn', grade: '未达标' };
  }

  function calcEei(actual, item) {
    if (actual == null || isNaN(Number(actual)) || !item) return '—';
    var ex = Number(actual);
    var e0 = Number(item.benchmark != null ? item.benchmark : item.level1);
    if (!e0) return '—';
    if (item.negativeProcess || (ex < 0 && e0 < 0)) {
      if (ex === 0) return '—';
      return num(e0 / ex, 3);
    }
    return num(ex / e0, 3);
  }

  function findProcessEnergy(profile, key) {
    var list = profile.processBench || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].name === key) return list[i].energy;
    }
    return null;
  }

  function buildCisa293EnergyTable(profile) {
    var data = pack();
    var guide = data.energyStdFramework || data.cisa293EnergyBench;
    if (!guide || !guide.processes) return '';

    var stdRows = (guide.standards || [])
      .map(function (s) {
        return (
          '<tr><td style="text-align:left;font-weight:600">' +
          esc(s.code) +
          '</td><td style="text-align:left">' +
          esc(s.title) +
          '</td><td style="text-align:left">' +
          esc(s.role) +
          '</td></tr>'
        );
      })
      .join('');

    var rows = guide.processes
      .map(function (item) {
        var actual = findProcessEnergy(profile, item.key);
        var st = energyLevelStatus(actual, item);
        var eei = calcEei(actual, item);
        var ref = Number(item.benchmark != null ? item.benchmark : item.level1);
        var gapBench =
          actual == null || isNaN(Number(actual)) ? '—' : num(Number(actual) - ref, 1);
        return (
          '<tr><td>' +
          esc(item.name) +
          '</td><td>' +
          (actual == null ? '—' : esc(actual)) +
          '</td><td>' +
          esc(item.level1 != null ? item.level1 : item.benchmark) +
          '</td><td>' +
          esc(item.level2 != null ? item.level2 : '—') +
          '</td><td>' +
          esc(item.level3 != null ? item.level3 : item.baseline || '—') +
          '</td><td>' +
          esc(eei) +
          '</td><td>' +
          esc(gapBench) +
          '</td><td class="jsl-gap ' +
          st.cls +
          '">' +
          esc(st.label) +
          '</td></tr>'
        );
      })
      .join('');

    var conv =
      guide.conversionHints && guide.conversionHints.length
        ? '<p class="jsl-note">折标系数提示（T/CISA 416-2024）：' +
          guide.conversionHints
            .map(function (c) {
              return esc(c.name) + ' ' + esc(c.factor) + ' ' + esc(c.unit);
            })
            .join('；') +
          '。</p>'
        : '';

    return (
      '<h3>重点工序能效标杆对标与限额等级</h3>' +
      '<p class="section-sub">方法：T/CISA 293/416 · 指数：GB/T 28924-2023 · 限额：GB 21256-2025 · 政策取值：发改产业〔2023〕723号</p>' +
      (stdRows
        ? '<table class="data-table"><thead><tr><th>标准/文件</th><th>名称</th><th>在本报告中的作用</th></tr></thead><tbody>' +
          stdRows +
          '</tbody></table>'
        : '') +
      '<table class="data-table"><thead><tr>' +
      '<th>工序</th><th>本企业<br><span class="th-sub">kgce/t</span></th>' +
      '<th>1级标杆</th><th>2级准入</th><th>3级限定/基准</th>' +
      '<th>能效指数<br><span class="th-sub">EEI</span></th><th>较1级差距</th><th>对标结论</th>' +
      '</tr></thead><tbody>' +
      rows +
      '</tbody></table>' +
      '<p class="jsl-note"><strong>读数说明：</strong>EEI 按 GB/T 28924-2023，正值工序 EEI=报告期能耗/1级标杆能耗，' +
      '<strong>EEI≤1</strong> 表示达到或优于1级标杆；转炉等负值工序按回收型口径（EEI=标杆/报告期）。' +
      '1/2/3 级对应 GB 21256-2025 限额等级；高炉/转炉/炼焦政策标杆与基准对齐发改产业〔2023〕723号。' +
      esc(guide.note || '') +
      ' 上述标准与政策文件已在报告末「数据来源 · 能效标准与政策依据」中逐条标识。</p>' +
      conv
    );
  }

  function buildExtraSectionsHTML(model, profile, period) {
    var data = pack();
    var bench = data.industryBenchmark || {};
    var fac = data.facilitiesProfile || {};
    var years = historyYears();
    var energyGap = gapTone(profile.energyPerTon, bench.avgEnergy || profile.industryEnergyAvg, true);
    var intensityGap = gapTone(profile.co2Intensity, bench.avgIntensity, true);
    var bestEnergyGap = gapTone(profile.energyPerTon, bench.bestEnergy, true);

    var learnBlock = '';
    if (model.learningSummary) {
      learnBlock =
        '<div class="jsl-learn-banner"><strong>对话补充 / 上传材料修订</strong><p>' +
        String(model.learningSummary).replace(/\n/g, '<br>') +
        '</p></div>';
    }

    var verifyBadge =
      profile.source === 'verify-report'
        ? '<span class="jsl-badge">核查报告终值</span>'
        : profile.source === 'demo-extrapolate'
          ? '<span class="jsl-badge jsl-badge--demo">基于核查底数外推</span>'
          : '';

    var style =
      '<style>' +
      '.jsl-kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:0 0 18px}' +
      '.jsl-kpi{background:#f8fafc;border:1px solid #e6eaf0;border-radius:10px;padding:14px 12px;text-align:center}' +
      '.jsl-kpi__label{font-size:13px;color:#5a6472;margin-bottom:6px}' +
      '.jsl-kpi__value{font-size:20px;font-weight:700;color:#0b6e3a;line-height:1.3}' +
      '.jsl-kpi__unit{font-size:12px;color:#667085;font-weight:500}' +
      '.jsl-badge{display:inline-block;margin-left:8px;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:600;background:#ecfdf5;color:#0b6e3a;border:1px solid #86efac;vertical-align:middle}' +
      '.jsl-badge--demo{background:#eff6ff;color:#1d4ed8;border-color:#bfdbfe}' +
      '.jsl-note{margin:0 0 12px;font-size:14px;color:#374151;line-height:1.85;text-align:justify}' +
      '.jsl-note ul{margin:8px 0 0;padding-left:1.2em}' +
      '.jsl-gap.is-good{color:#0b6e3a;font-weight:600}' +
      '.jsl-gap.is-mid{color:#1d4ed8;font-weight:600}' +
      '.jsl-gap.is-warn{color:#b45309;font-weight:600}' +
      '#s-energy .data-table,#s-output .data-table,#s-facility .data-table,#s-process-extra .data-table,#s-history .data-table,#s-scale .data-table{font-size:14px}' +
      '#s-energy .data-table th,#s-output .data-table th,#s-facility .data-table th,#s-process-extra .data-table th,#s-history .data-table th,#s-scale .data-table th{font-size:14px;padding:12px 10px}' +
      '#s-energy .data-table td,#s-output .data-table td,#s-facility .data-table td,#s-process-extra .data-table td,#s-history .data-table td,#s-scale .data-table td{font-size:14px;padding:11px 10px;line-height:1.55}' +
      '@media(max-width:720px){.jsl-kpi-grid{grid-template-columns:1fr 1fr}}' +
      '</style>';

    var kpi =
      '<div class="jsl-kpi-grid">' +
      '<div class="jsl-kpi"><div class="jsl-kpi__label">碳排放强度</div><div class="jsl-kpi__value">' +
      esc(num(profile.co2Intensity, 4)) +
      '<span class="jsl-kpi__unit"> tCO₂/t</span></div></div>' +
      '<div class="jsl-kpi"><div class="jsl-kpi__label">综合能耗强度</div><div class="jsl-kpi__value">' +
      esc(profile.energyPerTon) +
      '<span class="jsl-kpi__unit"> kgce/t</span></div></div>' +
      '<div class="jsl-kpi"><div class="jsl-kpi__label">粗钢产量</div><div class="jsl-kpi__value">' +
      esc(profile.crudeSteelOutput) +
      '<span class="jsl-kpi__unit"> 万吨</span></div></div>' +
      '<div class="jsl-kpi"><div class="jsl-kpi__label">主要生产设施</div><div class="jsl-kpi__value">' +
      esc(fac.count || profile.facilities || '—') +
      '<span class="jsl-kpi__unit"> 处</span></div></div>' +
      '</div>';

    /* —— 能耗对标 —— */
    var energyHistRows = years
      .map(function (y) {
        var p = data.periods[y];
        return (
          '<tr' +
          (y === String(profile.year) ? ' class="highlight"' : '') +
          '><td>' +
          y +
          '年</td><td>' +
          esc(p.energyTotal != null ? p.energyTotal : '—') +
          '</td><td>' +
          esc(p.energyPerTon) +
          '</td><td>' +
          esc(p.industryEnergyAvg || bench.avgEnergy) +
          '</td><td>' +
          esc(num(Number(p.energyPerTon) - Number(p.industryEnergyAvg || bench.avgEnergy), 1)) +
          '</td></tr>'
        );
      })
      .join('');

    var processEnergyRows = (profile.processBench || [])
      .map(function (p) {
        return (
          '<tr><td>' +
          esc(p.name) +
          '</td><td>' +
          esc(p.energy) +
          '</td><td>' +
          esc(p.intensity) +
          '</td><td>' +
          (p.emission != null ? esc(p.emission) : '—') +
          '</td><td>约第 ' +
          esc(p.rank) +
          ' 位</td></tr>'
        );
      })
      .join('');

    var energySection =
      '<div class="section" id="s-energy"><h2>能耗对标（' +
      esc(period) +
      '）' +
      verifyBadge +
      '</h2>' +
      '<p class="section-sub">综合能耗总量 / 强度与行业基准对比（口径：吨钢综合能耗）</p>' +
      '<table class="data-table"><thead><tr><th>指标</th><th>本企业</th><th>行业均值</th><th>行业先进</th><th>较均值差距</th></tr></thead><tbody>' +
      '<tr class="highlight"><td>综合能耗强度（kgce/t）</td><td>' +
      esc(profile.energyPerTon) +
      '</td><td>' +
      esc(profile.industryEnergyAvg || bench.avgEnergy) +
      '</td><td>' +
      esc(bench.bestEnergy || 510) +
      '</td><td class="jsl-gap ' +
      energyGap.cls +
      '">' +
      esc(energyGap.text) +
      '</td></tr>' +
      (profile.energyTotal != null
        ? '<tr><td>综合能耗总量（万吨标煤）</td><td colspan="4" style="text-align:left">' +
          esc(profile.energyTotal) +
          ' 万吨标煤（核查材料《能源购进、消费与库存》）</td></tr>'
        : '') +
      '</tbody></table>' +
      (energyHistRows
        ? '<h3>近四年综合能耗强度轨迹</h3><table class="data-table"><thead><tr><th>年度</th><th>综合能耗总量<br><span class="th-sub">万吨标煤</span></th><th>强度<br><span class="th-sub">kgce/t</span></th><th>行业均值</th><th>较均值</th></tr></thead><tbody>' +
          energyHistRows +
          '</tbody></table>'
        : '') +
      (processEnergyRows
        ? '<h3>工序能耗与碳效联动</h3><table class="data-table"><thead><tr><th>工序</th><th>能耗 kgce/t</th><th>碳强度 tCO₂/t</th><th>工序排放<br><span class="th-sub">万吨CO₂</span></th><th>行业大致位次</th></tr></thead><tbody>' +
          processEnergyRows +
          '</tbody></table>'
        : '') +
      buildCisa293EnergyTable(profile) +
      '<p class="jsl-note">本周期综合能耗强度 <strong>' +
      esc(profile.energyPerTon) +
      ' kgce/t</strong>，较行业均值 <span class="jsl-gap ' +
      energyGap.cls +
      '">' +
      esc(energyGap.text) +
      '</span>；距行业先进（' +
      esc(bench.bestEnergy || 510) +
      ' kgce/t）仍有 <span class="jsl-gap ' +
      bestEnergyGap.cls +
      '">' +
      esc(bestEnergyGap.text) +
      '</span>。工序能效结论以 <strong>T/CISA 293/416、GB 21256-2025、发改产业〔2023〕723号</strong> 综合判定为准，EEI 按 GB/T 28924-2023；高炉燃料比、烧结固体燃料与轧钢煤气消耗为主要挖潜方向。</p></div>';

    /* —— 产量对标 —— */
    var outputHistRows = years
      .map(function (y) {
        var p = data.periods[y];
        return (
          '<tr' +
          (y === String(profile.year) ? ' class="highlight"' : '') +
          '><td>' +
          y +
          '年</td><td>' +
          esc(p.crudeSteelOutput) +
          '</td><td>' +
          esc(p.steelOutput) +
          '</td><td>' +
          esc(p.co2Emission) +
          '</td><td>' +
          esc(num(p.co2Intensity, 4)) +
          '</td><td>' +
          esc(p.revenue) +
          '</td></tr>'
        );
      })
      .join('');

    var scrapRow =
      profile.scrapPerTonSteel != null
        ? '<tr><td>吨粗钢废钢比</td><td>' +
          esc(num(profile.scrapPerTonSteel, 4)) +
          ' t/t</td><td>废钢消耗 ' +
          esc(profile.scrapConsumption != null ? profile.scrapConsumption : '—') +
          ' ' +
          esc(profile.scrapUnit || '万吨') +
          '；废钢提比是强度改善的关键杠杆</td></tr>'
        : '';

    var emissionBreakRows = '';
    if (profile.emissionBreakdown) {
      var eb = profile.emissionBreakdown;
      emissionBreakRows =
        '<h3>企业层级排放结构</h3><table class="data-table"><thead><tr><th>构成</th><th>排放量（万吨CO₂）</th><th>说明</th></tr></thead><tbody>' +
        '<tr><td>化石燃料燃烧</td><td>' +
        esc(eb.fossilFuel) +
        '</td><td>主导项</td></tr>' +
        '<tr><td>工业过程</td><td>' +
        esc(eb.process) +
        '</td><td>工序过程排放</td></tr>' +
        '<tr><td>净购入电力</td><td>' +
        esc(eb.netPower) +
        '</td><td>' +
        (Number(eb.netPower) < 0 ? '外送/抵扣口径（负值）' : '外购电力间接排放') +
        '</td></tr>' +
        '<tr><td>固碳产品隐含</td><td>' +
        esc(eb.embeddedCarbon) +
        '</td><td>固碳产品扣减相关</td></tr>' +
        '<tr class="highlight"><td>企业层级合计</td><td>' +
        esc(profile.co2Emission) +
        '</td><td>核查终值</td></tr></tbody></table>';
    }

    var outputSection =
      '<div class="section" id="s-output"><h2>产量对标（' +
      esc(period) +
      '）' +
      verifyBadge +
      '</h2>' +
      '<p class="section-sub">粗钢 / 钢材产量、营收与排放强度联动</p>' +
      '<table class="data-table"><thead><tr><th>指标</th><th>数值</th><th>对标解读</th></tr></thead><tbody>' +
      '<tr class="highlight"><td>粗钢产量</td><td>' +
      esc(profile.crudeSteelOutput) +
      ' 万吨</td><td>强度分母；产能利用率与工序负荷的核心锚点</td></tr>' +
      '<tr><td>钢材产量</td><td>' +
      esc(profile.steelOutput) +
      ' ' +
      esc(profile.steelOutputUnit || '万吨') +
      '</td><td>轧材产出；与粗钢差反映成材率与库存调剂</td></tr>' +
      '<tr><td>企业层级排放</td><td>' +
      esc(profile.co2Emission) +
      ' ' +
      esc(profile.co2Unit || '万吨') +
      '</td><td>较行业均值强度差距：<span class="jsl-gap ' +
      intensityGap.cls +
      '">' +
      esc(intensityGap.text) +
      '</span></td></tr>' +
      '<tr><td>碳排放强度</td><td>' +
      esc(num(profile.co2Intensity, 4)) +
      ' ' +
      esc(profile.intensityUnit || 'tCO₂/t') +
      '</td><td>行业均值 ' +
      esc(bench.avgIntensity) +
      ' · 标杆 ' +
      esc(bench.best) +
      '</td></tr>' +
      '<tr><td>营收规模</td><td>' +
      esc(profile.revenue) +
      ' ' +
      esc(profile.revenueUnit || '亿元') +
      '</td><td>规模对标与碳成本压力测算输入</td></tr>' +
      scrapRow +
      '</tbody></table>' +
      (outputHistRows
        ? '<h3>近四年产量—排放—强度轨迹</h3><table class="data-table"><thead><tr><th>年度</th><th>粗钢<br><span class="th-sub">万吨</span></th><th>钢材<br><span class="th-sub">万吨</span></th><th>排放<br><span class="th-sub">万吨CO₂</span></th><th>强度<br><span class="th-sub">tCO₂/t</span></th><th>产值<br><span class="th-sub">亿元</span></th></tr></thead><tbody>' +
          outputHistRows +
          '</tbody></table>'
        : '') +
      emissionBreakRows +
      '<p class="jsl-note">核查材料显示：2021 年粗钢产量较 2020 年提升约 35%，排放上升约 27%，强度下降约 5.7%——产量扩张快于排放增长，废钢提比贡献显著；2022–2023 年强度稳定在约 <strong>1.80 tCO₂/t</strong>。产量波动将直接改变强度分母与配额盈缺判断，建议与工序负荷、废钢配比一并纳入滚动对标。</p></div>';

    /* —— 规模对标 —— */
    var scaleSection =
      '<div class="section" id="s-scale"><h2>规模对标（' +
      esc(period) +
      '）</h2>' +
      '<table class="data-table"><thead><tr><th>指标</th><th>数值</th><th>说明</th></tr></thead><tbody>' +
      '<tr class="highlight"><td>行业规模大致位次</td><td>约第 ' +
      esc(profile.scaleRank || '—') +
      ' / ' +
      esc(bench.total || 232) +
      ' 位</td><td>长流程钢铁样本池相对位次（演示）</td></tr>' +
      '<tr><td>从业人员</td><td>约 ' +
      esc(profile.employees || '—') +
      ' 人</td><td>劳动生产率与人均碳排辅助观察</td></tr>' +
      '<tr><td>区域 / 法人</td><td>' +
      esc(data.region || '—') +
      ' · ' +
      esc(data.legalEntity || data.enterpriseName) +
      '</td><td>' +
      esc(data.address || '') +
      '</td></tr>' +
      '<tr><td>信用代码</td><td colspan="2" style="text-align:left">' +
      esc(data.creditCode || '—') +
      '</td></tr></tbody></table></div>';

    /* —— 设施对标 —— */
    var facRows = (fac.items || [])
      .map(function (item) {
        return (
          '<tr><td>' +
          esc(item.process) +
          '</td><td>' +
          esc(item.name) +
          '</td><td style="text-align:left">' +
          esc(item.spec) +
          '</td><td>' +
          esc(item.capacityWanT != null ? item.capacityWanT : '—') +
          '</td></tr>'
        );
      })
      .join('');

    var facNotes = (fac.notes || [])
      .map(function (n) {
        return '<li>' + esc(n) + '</li>';
      })
      .join('');

    var facilitySection =
      '<div class="section" id="s-facility"><h2>生产设施对标（' +
      esc(period) +
      '）' +
      verifyBadge +
      '</h2>' +
      '<p class="section-sub">装备规格与工序产能（来源：核查报告 · 生产设施清单；云图侧可复核）</p>' +
      '<table class="data-table"><thead><tr><th>汇总项</th><th>数值</th></tr></thead><tbody>' +
      '<tr class="highlight"><td>主要生产设施数量</td><td>' +
      esc(fac.count || profile.facilities || '—') +
      ' 处</td></tr>' +
      '<tr><td>绿电占比</td><td>' +
      esc(profile.greenPowerRatio) +
      '%</td></tr>' +
      '<tr><td>工艺路线</td><td>长流程：焦化—烧结/球团—高炉—转炉—连铸—轧钢（无电炉）</td></tr></tbody></table>' +
      (facRows
        ? '<h3>工序—设施—产能明细</h3><table class="data-table"><thead><tr><th>工序</th><th>设施</th><th>规格</th><th>产能<br><span class="th-sub">万t/a</span></th></tr></thead><tbody>' +
          facRows +
          '</tbody></table>'
        : '') +
      (facNotes
        ? '<p class="jsl-note"><strong>设施边界与变化：</strong><ul>' + facNotes + '</ul></p>'
        : '') +
      '<p class="jsl-note">设施对标重点：2×1350m³ 高炉与 2×120t 转炉构成铁钢匹配主轴；360㎡+200㎡ 烧结与链篦机—回转窑球团决定炉料结构；轧线 4 条（高线/棒材，约 270 万 t/a）决定成材端负荷。2020 年末焦化/球团投运后，外购焦炭转为自产，能源品种结构切换需在能耗对标中单独跟踪。</p></div>';

    /* —— 工序排放明细 —— */
    var processDetailRows = (profile.processBench || [])
      .map(function (p) {
        return (
          '<tr><td>' +
          esc(p.name) +
          '</td><td>' +
          esc(p.intensity) +
          '</td><td>' +
          esc(p.energy) +
          '</td><td>' +
          (p.emission != null ? esc(p.emission) : '—') +
          '</td><td>约第 ' +
          esc(p.rank) +
          ' 位</td></tr>'
        );
      })
      .join('');

    var pe = profile.processEmissions || {};
    var processSumRow =
      pe.total != null
        ? '<tr class="highlight"><td>工序合计</td><td colspan="2">—</td><td>' +
          esc(pe.total) +
          '</td><td>—</td></tr>'
        : '';

    var processSection =
      '<div class="section" id="s-process-extra"><h2>工序对标明细（' +
      esc(period) +
      '）</h2>' +
      '<p class="section-sub">工序碳强度 / 能耗 / 排放量（转炉负值反映固碳/回收口径）</p>' +
      '<table class="data-table"><thead><tr><th>工序</th><th>碳强度 tCO₂/t</th><th>能耗 kgce/t</th><th>排放量<br><span class="th-sub">万吨CO₂</span></th><th>行业大致位次</th></tr></thead><tbody>' +
      processDetailRows +
      processSumRow +
      '</tbody></table>' +
      '<p class="jsl-note">炼铁工序排放贡献最大，是工序对标与降碳行动的第一优先级；转炉工序排放为负属核算口径特征，解读时勿与“负能耗”混淆。焦化排放 2023 年显著低于 2021/2022，需结合负荷与外销煤气一并复核。</p></div>';

    /* —— 历史强度轨迹 —— */
    var histIntensityRows = years
      .map(function (y) {
        var p = data.periods[y];
        return (
          '<tr' +
          (y === String(profile.year) ? ' class="highlight"' : '') +
          '><td>' +
          y +
          '年</td><td>' +
          esc(p.crudeSteelOutput) +
          '</td><td>' +
          esc(p.co2Emission) +
          '</td><td>' +
          esc(num(p.co2Intensity, 4)) +
          '</td><td>' +
          esc(p.energyPerTon) +
          '</td><td>' +
          esc(p.scrapPerTonSteel != null ? num(p.scrapPerTonSteel, 4) : '—') +
          '</td></tr>'
        );
      })
      .join('');

    var historySection = histIntensityRows
      ? '<div class="section" id="s-history"><h2>历史核查轨迹（2020–2023）</h2>' +
        '<p class="section-sub">温室气体排放核查报告终值 · 产量 / 排放 / 强度 / 能耗 / 废钢比</p>' +
        '<table class="data-table"><thead><tr><th>年度</th><th>粗钢<br><span class="th-sub">万吨</span></th><th>排放<br><span class="th-sub">万吨CO₂</span></th><th>强度<br><span class="th-sub">tCO₂/t</span></th><th>能耗<br><span class="th-sub">kgce/t</span></th><th>废钢比<br><span class="th-sub">t/t</span></th></tr></thead><tbody>' +
        histIntensityRows +
        '</tbody></table>' +
        '<p class="jsl-note">数据来源：' +
        esc((data.verifyReport && data.verifyReport.title) || '温室气体排放核查报告') +
        '（' +
        esc((data.verifyReport && data.verifyReport.org) || '') +
        '，签发 ' +
        esc((data.verifyReport && data.verifyReport.issuedAt) || '') +
        '）。建议将核查终值作为客户自有底数黄金口径，与业务系统台账交叉核对后再发布对外对标结论。</p></div>'
      : '';

    return (
      style +
      learnBlock +
      kpi +
      energySection +
      outputSection +
      scaleSection +
      facilitySection +
      processSection +
      historySection
    );
  }

  function buildRichDataSourceHTML(model) {
    var sources = model.dataSources || [];
    if (!sources.length) return null;
    var data = pack();

    // 若 payload 未带标准来源，但报告已用能效框架，则补齐标识
    var hasStandard = sources.some(function (s) {
      return s.category === 'standard';
    });
    if (!hasStandard && data.energyStdFramework && data.energyStdFramework.standards) {
      sources = sources.concat(
        data.energyStdFramework.standards.map(function (std, idx) {
          return {
            id: 'std-' + (std.code || idx),
            name: std.code + '《' + std.title + '》',
            status: '已引用',
            detail:
              (std.role || '') +
              (std.usedIn ? '；本报告用于：' + std.usedIn : ''),
            category: 'standard',
            usedIn: std.usedIn || '能耗对标',
            standard: true,
          };
        })
      );
    }

    var groups = [
      { key: 'customer', title: '一、客户自有数据（当前企业 · 金盛兰本地库 / 业务系统 / 核查终值）' },
      { key: 'jiahua', title: '二、佳华自有数据（绿色低碳管理平台 · 佳华双碳云图）' },
      { key: 'internet', title: '三、互联网公开数据' },
      { key: 'upload', title: '四、用户上传材料学习' },
      {
        key: 'standard',
        title: '五、能效标准与政策依据（本报告引用）',
      },
    ];

    var html =
      '<div class="section" id="s-source"><h2>数据来源</h2>' +
      '<p class="source-p">本报告对标对象仅为当前企业<strong>' +
      esc(data.enterpriseName || '金盛兰钢铁') +
      '</strong>（' +
      esc(data.legalEntity || '') +
      '）；2020–2023 产量、排放、强度、能耗与设施产能优先采用温室气体排放核查报告终值，并综合佳华双碳云图与互联网公开信息。' +
      '凡引用能效指南、限额标准或政策标杆/基准取值，均在下列「能效标准与政策依据」中单独标识。</p>' +
      '<style>' +
      '.ds-group{margin:14px 0 18px}' +
      '.ds-group h3{margin:0 0 10px;font-size:15px;color:#0c2340}' +
      '.ds-item{display:flex;align-items:flex-start;gap:8px;margin:0 0 10px;font-size:14px;line-height:1.75}' +
      '.ds-item--green,.ds-item--green .ds-name,.ds-item--green .ds-detail{color:#0b6e3a!important}' +
      '.ds-item--std .ds-name{color:#1e3a5f}' +
      '.ds-name{font-weight:700}' +
      '.ds-detail{color:#4b5563}' +
      '.ds-robot{flex-shrink:0;margin-top:2px;color:#0b6e3a}' +
      '.ds-tag{display:inline-block;margin-left:6px;padding:1px 6px;border-radius:999px;font-size:12px;background:#e8f7ef;color:#0b6e3a;font-weight:600}' +
      '.ds-tag--robot{background:#ecfdf5;border:1px solid #86efac}' +
      '.ds-tag--std{background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe}' +
      '.ds-tag--used{background:#f8fafc;color:#475467;border:1px solid #e4e7ec;font-weight:500}' +
      '</style>';

    if (data.verifyReport) {
      html +=
        '<p class="source-p"><strong>核查材料：</strong>' +
        esc(data.verifyReport.title) +
        ' · ' +
        esc(data.verifyReport.org) +
        ' · 签发 ' +
        esc(data.verifyReport.issuedAt) +
        ' · 文号 ' +
        esc(data.verifyReport.docNo) +
        ' · 依据 ' +
        esc(data.verifyReport.basis) +
        '</p>';
    }

    groups.forEach(function (g) {
      var items = sources.filter(function (s) {
        return s.category === g.key;
      });
      if (!items.length) return;
      html += '<div class="ds-group"><h3>' + g.title + '</h3>';
      items.forEach(function (s) {
        var cls = s.green ? ' ds-item--green' : '';
        if (s.category === 'standard' || s.standard) cls += ' ds-item--std';
        html += '<div class="ds-item' + cls + '">';
        if (s.robot) html += ROBOT_SVG;
        html +=
          '<div><span class="ds-name">' +
          esc(s.name) +
          '</span>';
        if (s.green) {
          html += '<span class="ds-tag">绿色低碳管理平台</span>';
        }
        if (s.robot) {
          html += '<span class="ds-tag ds-tag--robot">模型推演</span>';
        }
        if (s.category === 'standard' || s.standard) {
          html += '<span class="ds-tag ds-tag--std">标准/政策依据</span>';
          if (s.usedIn) {
            html +=
              '<span class="ds-tag ds-tag--used">用于：' + esc(s.usedIn) + '</span>';
          }
        }
        html += '<div class="ds-detail">' + esc(s.detail || '') + '</div></div></div>';
      });
      html += '</div>';
    });

    html += '</div>';
    return html;
  }

  /**
   * 根据用户输入 / 槽位 / 周期键，动态生成报告封面「统计周期」文案
   * 例：2026年（年度）、2026年6月（月度）
   */
  function resolveJslPeriodDisplay(payload, period, profile) {
    var text = String((payload && payload.userText) || '');
    var slots =
      (payload && payload.result && payload.result.slots) ||
      (global.BenchmarkSlotFilling && global.BenchmarkSlotFilling.getSlots
        ? global.BenchmarkSlotFilling.getSlots()
        : {}) ||
      {};
    var dim = String(
      (payload && payload.timeDimension) || slots.timeDimension || ''
    ).toLowerCase();
    var timeValue = String(slots.timeValue || period || '');
    var key = String(period || timeValue || '');
    var yearMatch = key.match(/(\d{4})/) || timeValue.match(/(\d{4})/) || text.match(/(20\d{2})/);
    var year = yearMatch ? yearMatch[1] : String(new Date().getFullYear());
    var monthNum = null;

    if (profile && profile.month) {
      monthNum = parseInt(profile.month, 10);
    } else {
      var mMatch = key.match(/^\d{4}-(\d{2})$/) || timeValue.match(/^\d{4}-(\d{2})/);
      if (mMatch) monthNum = parseInt(mMatch[1], 10);
    }

    // 显式维度优先：用户槽位 / afterResult 传入的 timeDimension
    if (dim === 'yearly' || dim === 'year') {
      return {
        periodLabel: year + '年',
        periodGrain: '年度',
        periodDisplay: year + '年（年度）',
      };
    }
    if (dim === 'quarterly' || dim === 'quarter' || /本季|上季|季度/.test(text)) {
      var qMatch = text.match(/第?([一二三四1-4])季度/) || timeValue.match(/[Qq]([1-4])/);
      var qMap = { 一: '1', 二: '2', 三: '3', 四: '4' };
      var q = qMatch ? qMap[qMatch[1]] || qMatch[1] : '';
      var qLabel = q ? year + '年第' + q + '季度' : year + '年';
      return {
        periodLabel: qLabel,
        periodGrain: '季度',
        periodDisplay: qLabel + '（季度）',
      };
    }
    if (
      dim === 'monthly' ||
      dim === 'month' ||
      monthNum != null ||
      /本月|上月|月度|单月/.test(text)
    ) {
      var mLabel = monthNum != null ? year + '年' + monthNum + '月' : year + '年';
      return {
        periodLabel: mLabel,
        periodGrain: '月度',
        periodDisplay: mLabel + '（月度）',
      };
    }
    if (/今年|本年|年度|全年|年对标/.test(text) || /^\d{4}$/.test(key)) {
      return {
        periodLabel: year + '年',
        periodGrain: '年度',
        periodDisplay: year + '年（年度）',
      };
    }

    return {
      periodLabel: year + '年',
      periodGrain: '年度',
      periodDisplay: year + '年（年度）',
    };
  }

  function patchReport() {
    if (!global.BenchmarkReport || global.BenchmarkReport._jslPatched) return;
    global.BenchmarkReport._jslPatched = true;

    global.BenchmarkReport._resolveEnterpriseName = function () {
      return (pack() && pack().enterpriseName) || '金盛兰钢铁';
    };

    var origModel = global.BenchmarkReport.buildSteelReportModel;
    global.BenchmarkReport.buildSteelReportModel = function (payload) {
      var model = origModel.call(this, payload);
      var data = pack();
      var period = (payload && payload.period) || '2026';
      var profile = data.getPeriod(period);
      var adj = data.totalIntensityAdj();
      var display = resolveJslPeriodDisplay(payload, period, profile);

      model.enterpriseName = data.enterpriseName;
      model.provinceName = /河北/.test(String(data.region || '') + String(data.legalEntity || ''))
        ? '河北'
        : '湖北';
      model.periodLabel = display.periodLabel;
      model.periodGrain = display.periodGrain;
      model.periodDisplay = display.periodDisplay;
      model.outputWanTon = profile.month
        ? profile.steelOutput
        : Math.round((profile.steelOutput / 12) * 10) / 10;

      if (adj) {
        model.enterpriseIntensity =
          Math.round((Number(model.enterpriseIntensity) + adj) * 1000) / 1000;
      }

      model.positioning =
        '本报告为湖北金盛兰冶金科技有限公司（金盛兰钢铁）专属智能对标分析专项报告，在碳排放强度与工序对标之外，系统展开能耗对标、产量对标、规模对标与生产设施对标；' +
        '能耗对标综合采用 T/CISA 293-2022、T/CISA 416-2024、GB/T 28924-2023、GB 21256-2025 与发改产业〔2023〕723号；' +
        '2020–2023 底数优先采用温室气体排放核查报告终值，并综合客户业务系统、佳华双碳云图与互联网公开数据出具结论。';

      if (payload && payload.sources) {
        model.dataSources = payload.sources;
      } else if (global.DemoSceneKernel && global.DemoSceneKernel.gatherSources) {
        model.dataSources = global.DemoSceneKernel.gatherSources(period);
      }

      model.learningSummary = data.buildLearningSummary();
      model.extraSectionsHTML = buildExtraSectionsHTML(model, profile, model.periodLabel);

      if (data.learningNotes && data.learningNotes.length) {
        var extraAdvice = data.learningNotes
          .map(function (n) {
            return n.advice;
          })
          .filter(Boolean);
        model.actionSuggestions = (model.actionSuggestions || []).concat(extraAdvice);
        model.enterpriseAdvice =
          (model.enterpriseAdvice || '') +
          '（已根据上传材料完成演示性修订：强度校正 ' +
          adj +
          ' tCO₂/t。）';
      }

      model.dataSourceText =
        '本报告数据来源分三类：①客户自有（金盛兰业务系统 / 本地库）；②佳华自有（绿色低碳管理平台 · 佳华双碳云图，含模型推演项）；③互联网公开数据。';

      return model;
    };

    var origSource = global.BenchmarkReport.buildDataSourceHTML;
    global.BenchmarkReport.buildDataSourceHTML = function (model) {
      var rich = buildRichDataSourceHTML(model);
      if (rich) return rich;
      return origSource.call(this, model);
    };

    var origCompose = global.BenchmarkReport._composeReportHTML;
    global.BenchmarkReport._composeReportHTML = function (payload, chartId) {
      var html = origCompose.call(this, payload, chartId);
      if (!html || !payload || payload.kernel !== 'digital-carbon-jinshenglan') return html;
      var model = this.buildSteelReportModel(payload);
      if (!model.extraSectionsHTML) return html;

      // 插入扩展章节到「05 · 优势与短板」之前（目录已从报告模板移除）
      html = html.replace(
        '<div class="section" id="s5"><h2>05 · 优势与短板</h2>',
        model.extraSectionsHTML + '<div class="section" id="s5"><h2>05 · 优势与短板</h2>'
      );

      return html;
    };
  }

  function toast(msg) {
    if (global.DualCarbonHub && global.DualCarbonHub.showToast) {
      global.DualCarbonHub.showToast(msg);
      return;
    }
    alert(msg);
  }

  function appendAssistantNote(html) {
    var messages = document.getElementById('cta-messages');
    var welcome = document.getElementById('cta-welcome');
    if (!messages) return;
    if (welcome) welcome.classList.add('hidden');
    messages.classList.remove('hidden');
    var div = document.createElement('div');
    div.className = 'cta-msg cta-msg--assistant';
    div.innerHTML =
      '<div class="cta-msg__bubble"><div class="cta-msg__content">' + html + '</div></div>';
    messages.appendChild(div);
    var scroll = document.getElementById('cta-scroll');
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
  }

  function handleFiles(fileList) {
    var data = pack();
    if (!data || !fileList || !fileList.length) return;
    var names = [];
    Array.prototype.forEach.call(fileList, function (file) {
      var item = data.addUpload({
        name: file.name,
        size: file.size,
        type: file.type,
        category: data.classifyUpload(file.name),
      });
      names.push(item.name);
    });
    renderUploadChips();
    toast('已学习 ' + names.length + ' 份材料，可继续对话更新报告');
    appendAssistantNote(
      '<p>已完成材料学习：</p><ul>' +
        names
          .map(function (n) {
            return '<li>' + n + '</li>';
          })
          .join('') +
        '</ul><p>我将根据节能减碳分析报告、环评报告等材料，在后续对标报告中修订工序 / 能耗 / 设施等相关结论。' +
        '您可以继续输入「给我进行一下今年的对标分析」或「根据上传材料更新报告」生成修订版报告。</p>'
    );
  }

  function renderUploadChips() {
    var bar = document.getElementById('jsl-upload-chips');
    var data = pack();
    if (!bar || !data) return;
    if (!data.uploads.length) {
      bar.hidden = true;
      bar.innerHTML = '';
      return;
    }
    bar.hidden = false;
    bar.innerHTML = data.uploads
      .map(function (u) {
        return (
          '<span class="jsl-chip" title="' +
          u.summary +
          '">📎 ' +
          u.name +
          '<button type="button" data-rm="' +
          u.id +
          '" aria-label="移除">×</button></span>'
        );
      })
      .join('');
    bar.querySelectorAll('button[data-rm]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        data.removeUpload(btn.getAttribute('data-rm'));
        renderUploadChips();
      });
    });
  }

  function wireUpload() {
    if (document.getElementById('jsl-file-input')) return;

    var inputBar = document.querySelector('.cta-input-bar .agent-copilot-input');
    if (!inputBar) return;

    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'jsl-file-input';
    fileInput.multiple = true;
    fileInput.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg';
    fileInput.hidden = true;
    document.body.appendChild(fileInput);

    var chips = document.createElement('div');
    chips.id = 'jsl-upload-chips';
    chips.className = 'jsl-upload-chips';
    chips.hidden = true;
    inputBar.parentNode.insertBefore(chips, inputBar);

    var attachBtn = inputBar.querySelector('.agent-copilot-input__icon-btn[title="上传附件"]');
    if (attachBtn) {
      attachBtn.removeAttribute('tabindex');
      attachBtn.addEventListener('click', function (e) {
        e.preventDefault();
        fileInput.click();
      });
    }

    fileInput.addEventListener('change', function () {
      handleFiles(fileInput.files);
      fileInput.value = '';
    });
  }

  function boot() {
    if (!pack()) return;
    patchDataService();
    patchReport();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', wireUpload);
    } else {
      wireUpload();
    }
  }

  boot();
})(window);
