/**
 * 集团碳账本 · 水泥报告多维扩展章节
 * 对齐数字碳表 extras（能耗/产量/规模/设施/生产线明细/历史），并补充污染物、配额成本。
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

  function gapTone(selfVal, refVal, lowerBetter) {
    if (selfVal == null || refVal == null || isNaN(Number(selfVal)) || isNaN(Number(refVal))) {
      return { text: '—', cls: '' };
    }
    var diff = Number(selfVal) - Number(refVal);
    var better = lowerBetter ? diff < 0 : diff > 0;
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

  function isGrinding(name) {
    return /粉磨/.test(String(name || ''));
  }

  function historyYears(pack) {
    var eid = pack && pack.activeEnterpriseId;
    var periods = (pack && pack.enterprisePeriods && pack.enterprisePeriods[eid]) || {};
    return ['2024', '2025', '2026'].filter(function (y) {
      return !!periods[y];
    });
  }

  function resolveFacilities(pack, grinding) {
    if (grinding && pack.facilitiesProfileMill) return pack.facilitiesProfileMill;
    return pack.facilitiesProfile || {};
  }

  function buildExtraSectionsHTML(model, profile, period, pack) {
    profile = profile || {};
    pack = pack || {};
    var bench = pack.industryBenchmark || {};
    var grinding = isGrinding(model.enterpriseName || pack.enterpriseName);
    var fac = resolveFacilities(pack, grinding);
    var years = historyYears(pack);
    var energyGap = gapTone(profile.energyPerTon, bench.avgEnergy || profile.industryEnergyAvg, true);
    var intensityGap = gapTone(profile.co2Intensity, bench.avgIntensity, true);
    var bestEnergyGap = gapTone(profile.energyPerTon, bench.bestEnergy, true);
    var productLabel = grinding ? '水泥产量' : '熟料产量';
    var productVal = grinding
      ? profile.steelOutput
      : profile.crudeSteelOutput != null
        ? profile.crudeSteelOutput
        : profile.steelOutput;
    var cementVal = profile.steelOutput;
    var energyUnitHint = grinding ? '吨水泥综合能耗' : '吨熟料综合能耗';
    var intensityUnit = grinding ? 'tCO₂/t 水泥' : 'tCO₂/t 熟料·水泥折算';

    var style =
      '<style>' +
      '.jsl-kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:0 0 18px}' +
      '.jsl-kpi{background:#f8fafc;border:1px solid #e6eaf0;border-radius:10px;padding:14px 12px;text-align:center}' +
      '.jsl-kpi__label{font-size:13px;color:#5a6472;margin-bottom:6px}' +
      '.jsl-kpi__value{font-size:20px;font-weight:700;color:#0b6e3a;line-height:1.3}' +
      '.jsl-kpi__unit{font-size:12px;color:#667085;font-weight:500}' +
      '.jsl-note{margin:0 0 12px;font-size:14px;color:#374151;line-height:1.85;text-align:justify}' +
      '.jsl-gap.is-good{color:#0b6e3a;font-weight:600}' +
      '.jsl-gap.is-warn{color:#b45309;font-weight:600}' +
      '#s-energy .data-table,#s-output .data-table,#s-facility .data-table,#s-process-extra .data-table,#s-history .data-table,#s-scale .data-table,#s-pollutant .data-table,#s-quota-cost .data-table{font-size:14px}' +
      '#s-energy .data-table th,#s-output .data-table th,#s-facility .data-table th,#s-process-extra .data-table th,#s-history .data-table th,#s-scale .data-table th,#s-pollutant .data-table th,#s-quota-cost .data-table th{font-size:14px;padding:12px 10px}' +
      '#s-energy .data-table td,#s-output .data-table td,#s-facility .data-table td,#s-process-extra .data-table td,#s-history .data-table td,#s-scale .data-table td,#s-pollutant .data-table td,#s-quota-cost .data-table td{font-size:14px;padding:11px 10px;line-height:1.55}' +
      '@media(max-width:720px){.jsl-kpi-grid{grid-template-columns:1fr 1fr}}' +
      '</style>';

    var kpi =
      '<div class="jsl-kpi-grid">' +
      '<div class="jsl-kpi"><div class="jsl-kpi__label">碳排放强度</div><div class="jsl-kpi__value">' +
      esc(num(profile.co2Intensity, 3)) +
      '<span class="jsl-kpi__unit"> tCO₂/t</span></div></div>' +
      '<div class="jsl-kpi"><div class="jsl-kpi__label">综合能耗强度</div><div class="jsl-kpi__value">' +
      esc(profile.energyPerTon) +
      '<span class="jsl-kpi__unit"> kgce/t</span></div></div>' +
      '<div class="jsl-kpi"><div class="jsl-kpi__label">' +
      esc(productLabel) +
      '</div><div class="jsl-kpi__value">' +
      esc(productVal) +
      '<span class="jsl-kpi__unit"> 万吨</span></div></div>' +
      '<div class="jsl-kpi"><div class="jsl-kpi__label">主要生产设施</div><div class="jsl-kpi__value">' +
      esc(fac.count || profile.facilities || '—') +
      '<span class="jsl-kpi__unit"> 处</span></div></div>' +
      '</div>';

    var energyHistRows = years
      .map(function (y) {
        var p = pack.enterprisePeriods[pack.activeEnterpriseId][y];
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
      '）</h2>' +
      '<p class="section-sub">综合能耗总量 / 强度与行业基准对比（口径：' +
      esc(energyUnitHint) +
      '）</p>' +
      '<table class="data-table"><thead><tr><th>指标</th><th>本企业</th><th>行业均值</th><th>行业先进</th><th>较均值差距</th></tr></thead><tbody>' +
      '<tr class="highlight"><td>综合能耗强度（kgce/t）</td><td>' +
      esc(profile.energyPerTon) +
      '</td><td>' +
      esc(profile.industryEnergyAvg || bench.avgEnergy) +
      '</td><td>' +
      esc(bench.bestEnergy || (grinding ? 32 : 92)) +
      '</td><td class="jsl-gap ' +
      energyGap.cls +
      '">' +
      esc(energyGap.text) +
      '</td></tr>' +
      (profile.energyTotal != null
        ? '<tr><td>综合能耗总量（万吨标煤）</td><td colspan="4" style="text-align:left">' +
          esc(profile.energyTotal) +
          ' 万吨标煤</td></tr>'
        : '') +
      '</tbody></table>' +
      (energyHistRows
        ? '<h3>近年综合能耗强度轨迹</h3><table class="data-table"><thead><tr><th>年度</th><th>综合能耗总量<br><span class="th-sub">万吨标煤</span></th><th>强度<br><span class="th-sub">kgce/t</span></th><th>行业均值</th><th>较均值</th></tr></thead><tbody>' +
          energyHistRows +
          '</tbody></table>'
        : '') +
      (processEnergyRows
        ? '<h3>生产线能耗与碳效联动</h3><table class="data-table"><thead><tr><th>生产线</th><th>能耗 kgce/t</th><th>碳强度 tCO₂/t</th><th>排放<br><span class="th-sub">万吨CO₂</span></th><th>行业大致位次</th></tr></thead><tbody>' +
          processEnergyRows +
          '</tbody></table>'
        : '') +
      '<p class="jsl-note">本周期综合能耗强度 <strong>' +
      esc(profile.energyPerTon) +
      ' kgce/t</strong>，较行业均值 <span class="jsl-gap ' +
      energyGap.cls +
      '">' +
      esc(energyGap.text) +
      '</span>；距行业先进（' +
      esc(bench.bestEnergy || (grinding ? 32 : 92)) +
      ' kgce/t）仍有 <span class="jsl-gap ' +
      bestEnergyGap.cls +
      '">' +
      esc(bestEnergyGap.text) +
      '</span>。' +
      (grinding
        ? '粉磨站以磨机电耗、烘干热源与公辅系统为主要挖潜方向。'
        : '熟料线以窑系统/分解炉热耗、余热发电与粉磨电耗为主要挖潜方向。') +
      '</p></div>';

    var outputHistRows = years
      .map(function (y) {
        var p = pack.enterprisePeriods[pack.activeEnterpriseId][y];
        return (
          '<tr' +
          (y === String(profile.year) ? ' class="highlight"' : '') +
          '><td>' +
          y +
          '年</td><td>' +
          esc(grinding ? '—' : p.crudeSteelOutput) +
          '</td><td>' +
          esc(p.steelOutput) +
          '</td><td>' +
          esc(p.co2Emission) +
          '</td><td>' +
          esc(num(p.co2Intensity, 3)) +
          '</td><td>' +
          esc(p.revenue != null ? p.revenue : '—') +
          '</td></tr>'
        );
      })
      .join('');

    var emissionBreakRows = '';
    if (profile.emissionBreakdown) {
      var eb = profile.emissionBreakdown;
      emissionBreakRows =
        '<h3>企业层级排放结构</h3><table class="data-table"><thead><tr><th>构成</th><th>排放量（万吨CO₂）</th><th>说明</th></tr></thead><tbody>' +
        '<tr><td>化石燃料燃烧</td><td>' +
        esc(eb.fossilFuel) +
        '</td><td>' +
        (grinding ? '烘干热源等' : '烧成燃料主导项') +
        '</td></tr>' +
        '<tr><td>工业过程</td><td>' +
        esc(eb.process) +
        '</td><td>' +
        (grinding ? '过程排放占比通常较低' : '碳酸盐分解过程排放') +
        '</td></tr>' +
        '<tr><td>净购入电力</td><td>' +
        esc(eb.netPower) +
        '</td><td>' +
        (grinding ? '粉磨站主要间接排放来源' : '外购电力间接排放') +
        '</td></tr>' +
        '<tr><td>其他/扣减相关</td><td>' +
        esc(eb.embeddedCarbon) +
        '</td><td>固碳产品或边界调剂相关</td></tr>' +
        '<tr class="highlight"><td>企业层级合计</td><td>' +
        esc(profile.co2Emission) +
        '</td><td>演示底数</td></tr></tbody></table>';
    }

    var outputSection =
      '<div class="section" id="s-output"><h2>产量对标（' +
      esc(period) +
      '）</h2>' +
      '<p class="section-sub">' +
      (grinding ? '水泥产量、营收与排放强度联动' : '熟料 / 水泥产量、营收与排放强度联动') +
      '</p>' +
      '<table class="data-table"><thead><tr><th>指标</th><th>数值</th><th>对标解读</th></tr></thead><tbody>' +
      (grinding
        ? ''
        : '<tr class="highlight"><td>熟料产量</td><td>' +
          esc(productVal) +
          ' 万吨</td><td>配额与强度分母；窑系统负荷核心锚点</td></tr>') +
      '<tr' +
      (grinding ? ' class="highlight"' : '') +
      '><td>水泥产量</td><td>' +
      esc(cementVal) +
      ' ' +
      esc(profile.steelOutputUnit || '万吨') +
      '</td><td>' +
      (grinding ? '粉磨站强度分母与电耗对标锚点' : '粉磨产出；与熟料差反映混合材掺入与库存调剂') +
      '</td></tr>' +
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
      esc(num(profile.co2Intensity, 3)) +
      ' ' +
      esc(intensityUnit) +
      '</td><td>行业均值 ' +
      esc(bench.avgIntensity) +
      ' · 标杆 ' +
      esc(bench.best) +
      '</td></tr>' +
      '<tr><td>营收规模</td><td>' +
      esc(profile.revenue != null ? profile.revenue : '—') +
      ' ' +
      esc(profile.revenueUnit || '亿元') +
      '</td><td>规模对标与碳成本压力测算输入</td></tr>' +
      '</tbody></table>' +
      (outputHistRows
        ? '<h3>近年产量—排放—强度轨迹</h3><table class="data-table"><thead><tr><th>年度</th><th>熟料<br><span class="th-sub">万吨</span></th><th>水泥<br><span class="th-sub">万吨</span></th><th>排放<br><span class="th-sub">万吨CO₂</span></th><th>强度<br><span class="th-sub">tCO₂/t</span></th><th>产值<br><span class="th-sub">亿元</span></th></tr></thead><tbody>' +
          outputHistRows +
          '</tbody></table>'
        : '') +
      emissionBreakRows +
      '<p class="jsl-note">产量波动将直接改变强度分母与配额盈缺判断，建议与窑/磨负荷、混合材掺入比、绿电占比一并纳入滚动对标。</p></div>';

    var scaleSection =
      '<div class="section" id="s-scale"><h2>规模对标（' +
      esc(period) +
      '）</h2>' +
      '<table class="data-table"><thead><tr><th>指标</th><th>数值</th><th>说明</th></tr></thead><tbody>' +
      '<tr class="highlight"><td>行业规模大致位次</td><td>约第 ' +
      esc(profile.scaleRank || '—') +
      ' / ' +
      esc(bench.total || 310) +
      ' 位</td><td>全国水泥重点排放单位样本池相对位次（演示）</td></tr>' +
      '<tr><td>从业人员</td><td>约 ' +
      esc(profile.employees || '—') +
      ' 人</td><td>劳动生产率与人均碳排辅助观察</td></tr>' +
      '<tr><td>区域 / 法人</td><td>' +
      esc((pack.getEnterpriseMeta && pack.getEnterpriseMeta().region) || pack.region || '—') +
      ' · ' +
      esc(pack.legalEntity || pack.enterpriseName) +
      '</td><td>' +
      esc(pack.address || '') +
      '</td></tr>' +
      '<tr><td>信用代码</td><td colspan="2" style="text-align:left">' +
      esc(pack.creditCode || '—') +
      '</td></tr></tbody></table></div>';

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
      '）</h2>' +
      '<p class="section-sub">装备规格与生产线产能（来源：生产设施清单 / 佳华双碳云图可复核）</p>' +
      '<table class="data-table"><thead><tr><th>汇总项</th><th>数值</th></tr></thead><tbody>' +
      '<tr class="highlight"><td>主要生产设施数量</td><td>' +
      esc(fac.count || profile.facilities || '—') +
      ' 处</td></tr>' +
      '<tr><td>绿电占比</td><td>' +
      esc(profile.greenPowerRatio != null ? profile.greenPowerRatio : '—') +
      '%</td></tr>' +
      '<tr><td>工艺路线</td><td>' +
      (grinding
        ? '粉磨站：外购熟料—烘干—粉磨—包装发运（无窑系统）'
        : '新型干法：矿山—生料制备—窑系统/分解炉烧成—余热发电—水泥粉磨') +
      '</td></tr></tbody></table>' +
      (facRows
        ? '<h3>生产线—设施—产能明细</h3><table class="data-table"><thead><tr><th>生产线</th><th>设施</th><th>规格</th><th>产能</th></tr></thead><tbody>' +
          facRows +
          '</tbody></table>'
        : '') +
      (facNotes ? '<p class="jsl-note"><strong>设施边界与说明：</strong><ul>' + facNotes + '</ul></p>' : '') +
      '</div>';

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
        ? '<tr class="highlight"><td>生产线合计</td><td colspan="2">—</td><td>' +
          esc(pe.total) +
          '</td><td>—</td></tr>'
        : '';

    var processSection = processDetailRows
      ? '<div class="section" id="s-process-extra"><h2>生产线对标明细（' +
        esc(period) +
        '）</h2>' +
        '<p class="section-sub">生产线碳强度 / 能耗 / 排放量</p>' +
        '<table class="data-table"><thead><tr><th>生产线</th><th>碳强度 tCO₂/t</th><th>能耗 kgce/t</th><th>排放量<br><span class="th-sub">万吨CO₂</span></th><th>行业大致位次</th></tr></thead><tbody>' +
        processDetailRows +
        processSumRow +
        '</tbody></table>' +
        '<p class="jsl-note">' +
        (grinding
          ? '水泥粉磨主线为站内主导排放与电耗环节；烘干与公辅为辅助挖潜点。'
          : '熟料烧成贡献最大，是配额敏感与降碳行动的第一优先级；粉磨线电耗挖潜可作为辅助抓手。') +
        '</p></div>'
      : '';

    var pol = profile.pollutants || {};
    var pollutantSection =
      pol.so2 != null || pol.nox != null || pol.pm != null
        ? '<div class="section" id="s-pollutant"><h2>污染物对标（' +
          esc(period) +
          '）</h2>' +
          '<p class="section-sub">主要大气污染物排放量（来源：佳华双碳云图 · 污染物排放信息）</p>' +
          '<table class="data-table"><thead><tr><th>污染物</th><th>本企业</th><th>单位</th><th>管理提示</th></tr></thead><tbody>' +
          '<tr class="highlight"><td>SO₂</td><td>' +
          esc(pol.so2) +
          '</td><td>' +
          esc(pol.unit || '吨') +
          '</td><td>与脱硫设施运行率、燃料硫分联动</td></tr>' +
          '<tr><td>NOx</td><td>' +
          esc(pol.nox) +
          '</td><td>' +
          esc(pol.unit || '吨') +
          '</td><td>' +
          (grinding ? '烘干热源与燃烧工况相关' : '分解炉/窑尾脱硝与热工制度相关') +
          '</td></tr>' +
          '<tr><td>颗粒物</td><td>' +
          esc(pol.pm) +
          '</td><td>' +
          esc(pol.unit || '吨') +
          '</td><td>收尘器运行与无组织管控</td></tr>' +
          '</tbody></table>' +
          '<p class="jsl-note">污染物指标与碳排、能耗协同观察，超低排放改造与节能降碳项目宜统筹申报、同步评估。</p></div>'
        : '';

    var quotaSurplus = profile.quotaSurplus;
    var quotaCostSection =
      profile.carbonQuota != null
        ? '<div class="section" id="s-quota-cost"><h2>配额与碳成本（' +
          esc(period) +
          '）</h2>' +
          '<p class="section-sub">对齐全国碳市场水泥熟料生产线配额口径；粉磨站侧重电耗强度与集团配额协同</p>' +
          '<table class="data-table"><thead><tr><th>指标</th><th>数值</th><th>说明</th></tr></thead><tbody>' +
          '<tr class="highlight"><td>碳配额</td><td>' +
          esc(profile.carbonQuota) +
          ' 万吨</td><td>' +
          (grinding
            ? '粉磨站无独立熟料线核定单元时，作集团配额协同观察'
            : '熟料生产线核定/应清缴相关演示值') +
          '</td></tr>' +
          '<tr><td>配额盈缺</td><td class="jsl-gap ' +
          (quotaSurplus != null && Number(quotaSurplus) >= 0 ? 'is-good' : 'is-warn') +
          '">' +
          esc(quotaSurplus) +
          ' 万吨</td><td>' +
          (quotaSurplus != null && Number(quotaSurplus) >= 0 ? '富余' : '缺口') +
          '</td></tr>' +
          '<tr><td>碳价均值</td><td>' +
          esc(profile.carbonPriceAvg) +
          ' ' +
          esc(profile.carbonPriceUnit || '元/t') +
          '</td><td>履约与交易窗口参考</td></tr>' +
          '<tr><td>碳成本（演示）</td><td>' +
          esc(profile.carbonCost != null ? profile.carbonCost : '—') +
          ' 亿元</td><td>按缺口×碳价等口径估算</td></tr>' +
          '<tr><td>绿电占比</td><td>' +
          esc(profile.greenPowerRatio != null ? profile.greenPowerRatio : '—') +
          '%</td><td>间接排放与强度改善杠杆</td></tr>' +
          '</tbody></table>' +
          '<p class="jsl-note">建议按月滚动测算强度偏离度与配额盈缺，将富余额度/缺口与烧成节能、替代燃料、绿电采购联动决策。</p></div>'
        : '';

    var histIntensityRows = years
      .map(function (y) {
        var p = pack.enterprisePeriods[pack.activeEnterpriseId][y];
        return (
          '<tr' +
          (y === String(profile.year) ? ' class="highlight"' : '') +
          '><td>' +
          y +
          '年</td><td>' +
          esc(grinding ? p.steelOutput : p.crudeSteelOutput) +
          '</td><td>' +
          esc(p.co2Emission) +
          '</td><td>' +
          esc(num(p.co2Intensity, 3)) +
          '</td><td>' +
          esc(p.energyPerTon) +
          '</td><td>' +
          esc(p.greenPowerRatio != null ? p.greenPowerRatio + '%' : '—') +
          '</td></tr>'
        );
      })
      .join('');

    var historySection = histIntensityRows
      ? '<div class="section" id="s-history"><h2>历史对标轨迹（2024–2026）</h2>' +
        '<p class="section-sub">产量 / 排放 / 强度 / 能耗 / 绿电占比</p>' +
        '<table class="data-table"><thead><tr><th>年度</th><th>' +
        (grinding ? '水泥' : '熟料') +
        '<br><span class="th-sub">万吨</span></th><th>排放<br><span class="th-sub">万吨CO₂</span></th><th>强度<br><span class="th-sub">tCO₂/t</span></th><th>能耗<br><span class="th-sub">kgce/t</span></th><th>绿电占比</th></tr></thead><tbody>' +
        histIntensityRows +
        '</tbody></table>' +
        '<p class="jsl-note">建议将业务台账与核查终值交叉核对后再发布对外对标结论；历史轨迹用于观察强度—产量—能耗联动趋势。</p></div>'
      : '';

    return (
      style +
      kpi +
      energySection +
      outputSection +
      scaleSection +
      facilitySection +
      processSection +
      pollutantSection +
      quotaCostSection +
      historySection
    );
  }

  function buildRichDataSourceHTML(model, pack) {
    var sources = model.dataSources || [];
    if (!sources.length) return null;
    pack = pack || {};

    var groups = [
      { key: 'customer', title: '一、客户自有数据（金隅/冀东本地库 · 业务系统）' },
      { key: 'jiahua', title: '二、佳华自有数据（绿色低碳管理平台 · 佳华双碳云图）' },
      { key: 'internet', title: '三、互联网公开数据' },
      { key: 'upload', title: '四、用户上传材料学习' },
    ];

    var html =
      '<div class="section" id="s-source"><h2>数据来源</h2>' +
      '<p class="source-p">本报告对标对象为<strong>' +
      esc(model.enterpriseName || pack.enterpriseName || '冀东水泥') +
      '</strong>；产量、排放、强度、能耗与设施产能综合客户业务系统、佳华双碳云图与互联网公开信息。配额口径对齐全国碳市场水泥熟料生产线规则。</p>' +
      '<style>' +
      '.ds-group{margin:14px 0 18px}' +
      '.ds-group h3{margin:0 0 10px;font-size:15px;color:#0c2340}' +
      '.ds-item{display:flex;align-items:flex-start;gap:8px;margin:0 0 10px;font-size:14px;line-height:1.75}' +
      '.ds-item--green,.ds-item--green .ds-name,.ds-item--green .ds-detail{color:#0b6e3a!important}' +
      '.ds-name{font-weight:700}' +
      '.ds-detail{color:#4b5563}' +
      '.ds-robot{flex-shrink:0;margin-top:2px;color:#0b6e3a}' +
      '.ds-tag{display:inline-block;margin-left:6px;padding:1px 6px;border-radius:999px;font-size:12px;background:#e8f7ef;color:#0b6e3a;font-weight:600}' +
      '.ds-tag--robot{background:#ecfdf5;border:1px solid #86efac}' +
      '</style>';

    groups.forEach(function (g) {
      var items = sources.filter(function (s) {
        return s.category === g.key;
      });
      if (!items.length) return;
      html += '<div class="ds-group"><h3>' + g.title + '</h3>';
      items.forEach(function (s) {
        var cls = s.green ? ' ds-item--green' : '';
        html += '<div class="ds-item' + cls + '">';
        if (s.robot) html += ROBOT_SVG;
        html += '<div><span class="ds-name">' + esc(s.name) + '</span>';
        if (s.green) html += '<span class="ds-tag">绿色低碳管理平台</span>';
        if (s.robot) html += '<span class="ds-tag ds-tag--robot">模型推演</span>';
        html += '<div class="ds-detail">' + esc(s.detail || '') + '</div></div></div>';
      });
      html += '</div>';
    });

    html += '</div>';
    return html;
  }

  global.CementReportExtras = {
    buildExtraSectionsHTML: buildExtraSectionsHTML,
    buildRichDataSourceHTML: buildRichDataSourceHTML,
  };
})(window);
