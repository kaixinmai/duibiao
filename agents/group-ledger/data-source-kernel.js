/**
 * 集团碳账本 · 冀东对标内核
 * 三类数据：客户自有（金隅/冀东） / 佳华自有（绿字+机器人推演） / 互联网公开
 * 自然语言年度对标 → 思考过程 → 智能报告；支持上传材料学习修订
 * 报告已生成后的追加对话 → 补充修正（跳过重复检索）
 * 交互与思考 UI 对齐数字碳表；品牌与水泥域内容保留金隅/冀东口径
 */
(function (global) {
  'use strict';

  /** @type {{ chartId: string, period: string, timeDimension: string }|null} */
  var lastReportMeta = null;
  /** 最近一次对话修正摘要，供思考步骤展示 */
  var lastRevisionSummary = null;
  var REPORT_META_KEY = 'gl-jidong-duibiao-report-meta';

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

  function persistReportMeta(meta) {
    lastReportMeta = meta || null;
    try {
      if (meta) sessionStorage.setItem(REPORT_META_KEY, JSON.stringify(meta));
      else sessionStorage.removeItem(REPORT_META_KEY);
    } catch (e) {}
  }

  function loadReportMeta() {
    if (lastReportMeta && lastReportMeta.chartId) return lastReportMeta;
    try {
      var raw = sessionStorage.getItem(REPORT_META_KEY);
      if (raw) lastReportMeta = JSON.parse(raw);
    } catch (e) {}
    return lastReportMeta;
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
    if (/对标分析|综合对标|进行.*对标|给我.*对标|今年.*对标|年度对标|智能对标/.test(t)) {
      return true;
    }
    if (/对标/.test(t) && (/分析|报告|今年|年度|全面|生产线|能耗|产量|规模|设施/.test(t))) {
      return true;
    }
    // 企业已选后的年度综合分析口吻（欢迎语 / 对标入口常见问法）
    if (
      /(今年|本年|本年度|全年|年度)/.test(t) &&
      /(对标|分析报告|综合分析|多维.*分析|差距|排名)/.test(t)
    ) {
      return true;
    }
    return false;
  }

  function detectGroupAggregateIntent(text) {
    var t = String(text || '');
    return /集团.*全部|全部.*企业|多企业|汇总|聚合|整体对标/.test(t) && /碳|对标|报告/.test(t);
  }

  function detectUploadLearnIntent(text) {
    return /上传|学习|更新报告|修订报告|调整报告|重新生成/.test(String(text || ''));
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

  function hasActiveReport() {
    var meta = loadReportMeta();
    if (meta && meta.chartId) return true;
    try {
      if (document.querySelector('.jsl-report-ready')) return true;
      if (document.querySelector('[data-action="preview-report"]')) return true;
      var titles = document.querySelectorAll('.jsl-report-ready__title');
      for (var i = 0; i < titles.length; i++) {
        if (/报告已生成|报告已更新/.test(titles[i].textContent || '')) return true;
      }
    } catch (e) {}
    return false;
  }

  /** 报告已生成后的追加对话：视为对报告的补充修正，不再重复检索 */
  function isRevisionLanguage(text) {
    var t = String(text || '');
    if (!t.trim()) return false;
    if (
      /去掉|删除|移除|不要|隐藏|保留|恢复/.test(t) &&
      /章|节|部分|模块|建议|对标|潜力|来源|能耗|产量|设施|历史|生产线/.test(t)
    ) {
      return true;
    }
    if (/修正|修改|调整|改成|改为|更新为|应该是|正确|优化报告|更新报告/.test(t)) return true;
    if (/(?:是|为|等于|=)\s*-?[0-9]/.test(t)) return true;
    if (
      global.ReportRevisionEngine &&
      global.ReportRevisionEngine.isContextualFollowUp &&
      global.ReportRevisionEngine.isContextualFollowUp(t)
    ) {
      return true;
    }
    return false;
  }

  function shouldSkipRetrieval(text) {
    if (!hasActiveReport()) return false;
    return isRevisionLanguage(text) || detectUploadLearnIntent(text);
  }

  function detectReportRevisionIntent(text) {
    return hasActiveReport() && isRevisionLanguage(text);
  }

  /**
   * 数据源清单
   * green: 佳华双碳云图 → 报告中绿色字体
   * robot: 污碳模型推演 → 机器人图标
   * category: customer | jiahua | internet | upload
   */
  function gatherSources(period, enterpriseId) {
    var pack = data();
    var meta = pack.getEnterpriseMeta(enterpriseId);
    var profile = pack.getPeriod(period, meta.id);
    var src = pack.sources;
    var entLabel = meta.name || pack.enterpriseName || '冀东水泥';

    var list = [
      {
        id: 'localDb',
        name: src.localDb,
        status: '已返回',
        detail: '金隅/冀东本地库已对齐「' + entLabel + '」' + period + ' 周期对标底数',
        category: 'customer',
      },
      {
        id: 'bizSystem',
        name: '金隅冀东碳排放管理平台（业务台账）',
        status: '已返回',
        detail: '已关联「' + entLabel + '」生产、能耗、排放台账',
        category: 'customer',
      },
      {
        id: 'xxxSite',
        name: src.xxxSite,
        status: '已返回',
        detail: entLabel + ' 公开披露摘要已汇总',
        category: 'internet',
      },
      {
        id: 'baidu',
        name: src.baidu,
        status: '已返回',
        detail: '检索关键词「' + entLabel + ' 碳排放 对标」',
        category: 'internet',
      },
      {
        id: 'cloudFacility',
        name: src.cloudFacility,
        status: '已返回',
        detail: '生产设施 ' + (profile.facilities || '—') + ' 处',
        category: 'jiahua',
        green: true,
        platform: '佳华双碳云图',
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
        category: 'jiahua',
        green: true,
        platform: '佳华双碳云图',
      },
      {
        id: 'cloudProduction',
        name: src.cloudProduction,
        status: '已返回',
        detail: '产量 ' + profile.steelOutput + profile.steelOutputUnit + '（污碳模型推演）',
        category: 'jiahua',
        green: true,
        robot: true,
        platform: '佳华双碳云图',
      },
      {
        id: 'cloudEmission',
        name: src.cloudEmission,
        status: '已返回',
        detail: '碳排放 ' + profile.co2Emission + profile.co2Unit + '（污碳模型推演）',
        category: 'jiahua',
        green: true,
        robot: true,
        platform: '佳华双碳云图',
      },
      {
        id: 'cloudIntensity',
        name: src.cloudIntensity,
        status: '已返回',
        detail: '强度 ' + profile.co2Intensity + ' ' + profile.intensityUnit + '（污碳模型推演）',
        category: 'jiahua',
        green: true,
        robot: true,
        platform: '佳华双碳云图',
      },
    ];

    if (pack.uploads && pack.uploads.length) {
      list.push({
        id: 'uploads',
        name: src.uploads || '用户上传材料（节能减碳 / 环评 / 核查报告等）',
        status: '已返回',
        detail:
          '已学习材料 ' +
          pack.uploads.length +
          ' 份：' +
          pack.uploads
            .map(function (u) {
              return u.name;
            })
            .join('、'),
        category: 'upload',
      });
    }

    return list;
  }

  var ROBOT_SVG =
    '<svg class="jsl-kw-robot" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" title="污碳模型推演">' +
    '<rect x="6" y="8" width="12" height="10" rx="2" fill="currentColor" opacity="0.9"/>' +
    '<circle cx="9.5" cy="12.5" r="1.2" fill="#fff"/>' +
    '<circle cx="14.5" cy="12.5" r="1.2" fill="#fff"/>' +
    '<path d="M12 4v3M9 5h6" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
    '<path d="M8 18v2M16 18v2" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
    '</svg>';

  function escHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** 将用户问题拆成检索关键词（演示固定 5 个左右） */
  function extractKeywords(userText) {
    var t = String(userText || '');
    var period = resolveYearPeriod(t);
    var pack = data();
    var ent = detectEnterpriseFromText(t);
    var entLabel =
      (ent && ent.shortName) ||
      (ent && ent.name) ||
      (pack && pack.shortName) ||
      '冀东水泥';
    if (entLabel.length > 8) entLabel = '冀东水泥';

    var list = [entLabel, period + '年'];

    if (detectGroupAggregateIntent(t)) list.push('集团汇总');
    else if (/对标/.test(t) || /分析报告|情况|综合/.test(t)) list.push('对标分析');
    else list.push('智能对标');

    if (/能耗|能源/.test(t)) list.push('能耗对标');
    else if (/产量|产能/.test(t)) list.push('产量规模');
    else if (/生产线|设施|熟料|粉磨/.test(t)) list.push('生产线设施');
    else list.push('碳排放');

    if (/强度|碳效|绩效|配额/.test(t)) list.push('碳绩效');
    else if (/北水/.test(t)) list.push('北水企业');
    else list.push('碳强度');

    var seen = {};
    return list
      .filter(function (k) {
        if (seen[k]) return false;
        seen[k] = true;
        return true;
      })
      .slice(0, 5);
  }

  /** 互联网公开资料（演示，默认折叠）— 水泥 / 金隅冀东口径 */
  function getInternetMaterials() {
    return [
      '全国碳市场水泥行业配额分配方案解读：熟料生产线 / 吨熟料强度 / 行业平衡值',
      '水泥行业绿色低碳发展路径与标杆实践综述 - 中国水泥协会',
      'GB 16780《水泥单位产品能源消耗限额》要点解读',
      '发改产业〔2023〕723号《工业重点领域能效标杆水平和基准水平（2023年版）》— 水泥条款',
      '水泥熟料生产线碳排放核算与强度对标方法说明 - 行业技术导则',
      '金隅集团社会责任报告：绿色制造与低碳转型专章（公开摘要）',
      '冀东水泥超低排放改造与余热发电实践案例汇编 - 行业协会',
      '河北水泥重点排放单位履约与配额管理公开信息摘要',
      '水泥粉磨站电耗对标与绿电采购实践 - 行业观察',
      '替代燃料与原料替代（含电石渣）对熟料线强度影响跟踪',
      '区域水泥企业绿色工厂创建实践案例汇编',
      '全国碳市场水泥履约窗口与 CEA 调剂策略要点',
      '冀东水泥唐山基地节能降碳技改公开信息摘要',
      '金隅冀东数字化碳管理与生产线强度月度看板实践',
      '水泥行业能效“领跑者”对标指标体系解读',
      '预热器与篦冷机余热回收对吨熟料强度改善测算方法',
      '水泥企业碳配额经营：富余配额处置与履约成本联动',
      '粉磨线高效磨机改造与变频优化降碳路径 - 技术导则',
      '河北/山西/内蒙古水泥企业强度对标样本池说明（演示）',
      '低碳水泥产品认证与供应链碳足迹披露进展跟踪',
    ];
  }

  /** 平台侧资料：客户自有（金隅/冀东） + 佳华双碳云图 */
  function getPlatformMaterials() {
    return [
      {
        group: 'customer',
        label: '金隅冀东碳排放管理平台-碳排放数据',
        green: false,
        robot: false,
      },
      {
        group: 'customer',
        label: '金隅冀东碳排放管理平台-系统管理数据',
        green: false,
        robot: false,
      },
      {
        group: 'customer',
        label: '金隅冀东碳排放管理平台-能耗系统数据',
        green: false,
        robot: false,
      },
      {
        group: 'jiahua',
        label: '佳华双碳云图--生产设施信息',
        green: true,
        robot: false,
      },
      {
        group: 'jiahua',
        label: '佳华双碳云图--污染物排放信息',
        green: true,
        robot: false,
      },
      {
        group: 'jiahua',
        label: '佳华双碳云图--产量信息（污碳模型推演-机器人）',
        green: true,
        robot: true,
      },
      {
        group: 'jiahua',
        label: '佳华双碳云图--碳排放信息（污碳模型推演-机器人）',
        green: true,
        robot: true,
      },
      {
        group: 'jiahua',
        label: '佳华双碳云图--碳排放强度信息（污碳模型推演-机器人）',
        green: true,
        robot: true,
      },
    ];
  }

  function buildKeywordChipsHtml(keywords) {
    return (
      '<div class="jsl-kw-chips">' +
      keywords
        .map(function (k) {
          return '<span class="jsl-kw-chip">' + escHtml(k) + '</span>';
        })
        .join('') +
      '</div>'
    );
  }

  function buildKeywordSearchPanelHtml(keywords) {
    var internet = getInternetMaterials();
    var platform = getPlatformMaterials();
    var customerCount = 0;
    var jiahuaCount = 0;
    platform.forEach(function (item) {
      if (item.group === 'jiahua') jiahuaCount += 1;
      else customerCount += 1;
    });
    var uid = 'gl-kw-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    var internetHtml = internet
      .map(function (title, i) {
        return (
          '<li class="jsl-kw-link-item">' +
          '<span class="jsl-kw-idx">' +
          (i + 1) +
          '.</span> ' +
          '<a class="jsl-kw-link" href="javascript:void(0)">' +
          escHtml(title) +
          '</a></li>'
        );
      })
      .join('');

    var customerHtml = '';
    var jiahuaHtml = '';
    platform.forEach(function (item) {
      var row =
        '<li class="jsl-kw-plat-item' +
        (item.green ? ' is-green' : '') +
        '">' +
        (item.robot ? ROBOT_SVG : '') +
        '<span>' +
        escHtml(item.label) +
        '</span></li>';
      if (item.group === 'jiahua') jiahuaHtml += row;
      else customerHtml += row;
    });

    return (
      '<div class="jsl-kw-search" id="' +
      uid +
      '">' +
      '<button type="button" class="jsl-kw-toggle" aria-expanded="false" aria-controls="' +
      uid +
      '-body">' +
      '<span class="jsl-kw-toggle-text">搜索' +
      keywords.length +
      '个关键词，3类数据，互联网数据' +
      internet.length +
      '，平台数据' +
      customerCount +
      '，佳华数据' +
      jiahuaCount +
      '</span>' +
      '<span class="jsl-kw-chevron" aria-hidden="true">›</span>' +
      '</button>' +
      '<div class="jsl-kw-body" id="' +
      uid +
      '-body">' +
      '<div class="jsl-kw-section">' +
      '<div class="jsl-kw-section-title">检索关键词</div>' +
      buildKeywordChipsHtml(keywords) +
      '</div>' +
      '<div class="jsl-kw-section">' +
      '<div class="jsl-kw-section-title">互联网公开数据（' +
      internet.length +
      '）</div>' +
      '<ol class="jsl-kw-link-list">' +
      internetHtml +
      '</ol>' +
      '</div>' +
      '<div class="jsl-kw-section">' +
      '<div class="jsl-kw-section-title">客户自有 · 金隅冀东碳排放管理平台</div>' +
      '<ul class="jsl-kw-plat-list">' +
      customerHtml +
      '</ul>' +
      '</div>' +
      '<div class="jsl-kw-section">' +
      '<div class="jsl-kw-section-title jsl-kw-section-title--green">佳华自有 · 佳华双碳云图</div>' +
      '<ul class="jsl-kw-plat-list">' +
      jiahuaHtml +
      '</ul>' +
      '</div>' +
      '</div>' +
      '</div>'
    );
  }

  function bindKeywordSearchToggle() {
    if (global.__glKwToggleBound) return;
    global.__glKwToggleBound = true;
    document.addEventListener('click', function (e) {
      var toggle = e.target && e.target.closest && e.target.closest('.jsl-kw-toggle');
      if (!toggle) return;
      var root = toggle.closest('.jsl-kw-search');
      if (!root) return;
      e.preventDefault();
      e.stopPropagation();
      var open = !root.classList.contains('is-open');
      root.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function getQueryPhaseConfig(userText) {
    if (shouldSkipRetrieval(userText)) {
      return {
        modifier: 'cta-thinking--query cta-thinking--revise',
        title: '报告修订中…',
        doneTitle: '报告内容修订',
        hint: '沿用已生成报告底数 · 按对话补充修正，不再重复检索',
        collapsible: true,
        collapseOnDone: false,
        defaultDelay: 280,
        stepDelay: 360,
        skip: true,
      };
    }
    var keywords = extractKeywords(userText);
    return {
      modifier: 'cta-thinking--query cta-thinking--kw-compact',
      title: '信息分析及检索中…',
      doneTitle: '信息分析及检索',
      hint: '已拆分 ' + keywords.length + ' 个关键词 · 客户自有 / 佳华双碳云图 / 互联网公开',
      collapsible: true,
      collapseOnDone: false,
      defaultDelay: 420,
      stepDelay: 700,
    };
  }

  function getAnalysisPhaseConfig(userText) {
    if (shouldSkipRetrieval(userText)) {
      return {
        modifier: 'cta-thinking--analysis cta-thinking--revise',
        title: '应用补充修正中…',
        doneTitle: '修正已应用',
        hint: '将对话中的指标与说明写入报告，并生成修订版',
        collapsible: true,
        collapseOnDone: false,
        defaultDelay: 420,
        startDelay: 200,
      };
    }
    return null;
  }

  function getAnalysisSteps(userText) {
    var pack = data();
    if (!pack) return null;
    if (shouldSkipRetrieval(userText)) {
      var tip =
        (lastRevisionSummary && lastRevisionSummary.changes
          ? lastRevisionSummary.changes.join('；')
          : '') || '按对话补充修订报告结论';
      return [
        { id: 'r1', text: '识别对话中的补充 / 修正项' },
        { id: 'r2', text: tip.length > 48 ? tip.slice(0, 48) + '…' : tip },
        { id: 'r3', text: '更新智能对标分析报告（跳过重复检索）' },
      ];
    }
    if (
      !detectYearlyBenchmarkIntent(userText) &&
      !detectUploadLearnIntent(userText) &&
      !detectGroupAggregateIntent(userText)
    ) {
      return null;
    }
    return [
      { id: 'a1', text: '聚合生产线 / 能耗 / 产量 / 规模 / 设施维度' },
      { id: 'a2', text: '对照行业均值与标杆，生成差距诊断' },
      { id: 'a3', text: '整理智能对标分析报告要点' },
    ];
  }

  function getQuerySteps(userText) {
    var pack = data();
    if (!pack) return null;

    if (shouldSkipRetrieval(userText)) {
      return [];
    }

    var aggregate = detectGroupAggregateIntent(userText);
    var ent = detectEnterpriseFromText(userText) || pack.getEnterpriseMeta();
    if (!aggregate) pack.setActiveEnterprise(ent.id);

    bindKeywordSearchToggle();

    var keywords = extractKeywords(userText);
    var learning = pack.uploads && pack.uploads.length > 0;
    var steps = [
      {
        id: 'kw-parse',
        text: '拆分用户问题为检索关键词',
        preview: buildKeywordChipsHtml(keywords),
      },
      {
        id: 'kw-search',
        text: '按关键词检索多源资料',
        preview: buildKeywordSearchPanelHtml(keywords),
      },
    ];

    if (learning) {
      steps.push({
        id: 'learn',
        text: '学习上传材料并修订报告结论',
        preview:
          '<div class="jsl-kw-learn">' +
          pack.uploads
            .map(function (u) {
              return '<div>· ' + escHtml(u.name) + ' — ' + escHtml(u.summary || '') + '</div>';
            })
            .join('') +
          '</div>',
      });
    }

    return steps;
  }

  function beforeHandle(text) {
    var pack = data();
    if (!pack || typeof BenchmarkDataService === 'undefined') return;

    var ent = detectEnterpriseFromText(text);
    if (ent && !detectGroupAggregateIntent(text)) pack.setActiveEnterprise(ent.id);

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
      if (
        detectYearlyBenchmarkIntent(text) ||
        /今年|本年|年度|全年/.test(text) ||
        shouldSkipRetrieval(text) ||
        detectGroupAggregateIntent(text)
      ) {
        var forceYearly =
          detectYearlyBenchmarkIntent(text) ||
          /今年|本年|年度|全年/.test(String(text || '')) ||
          detectGroupAggregateIntent(text);
        // 年度对标必须覆盖 applyDefaults 的「2026-06 → monthly」默认，否则报告周期错乱
        if (forceYearly) {
          slots.timeDimension =
            (shouldSkipRetrieval(text) && lastReportMeta && lastReportMeta.timeDimension) ||
            'yearly';
          slots.timeValue =
            (shouldSkipRetrieval(text) && lastReportMeta && lastReportMeta.period) ||
            resolveYearPeriod(text);
        } else {
          slots.timeDimension =
            (lastReportMeta && lastReportMeta.timeDimension) ||
            slots.timeDimension ||
            'yearly';
          slots.timeValue =
            (lastReportMeta && lastReportMeta.period) ||
            resolveYearPeriod(text) ||
            slots.timeValue;
        }
        slots.functionType = 'comparison';
        slots.queryFocus = 'comprehensive';
      }
      if (/北水|冀东|水泥/.test(text)) {
        slots.objectDimension = 'enterprise';
      }
      if (detectGroupAggregateIntent(text)) {
        slots.objectDimension = 'group';
        slots.functionType = 'comparison';
        slots.queryFocus = 'comprehensive';
      }
    }

    if (shouldSkipRetrieval(text) && pack.applyChatRevision) {
      lastRevisionSummary = {
        preview: true,
        changes: previewRevisionChanges(text),
      };
    }
  }

  function previewRevisionChanges(text) {
    if (global.ReportRevisionEngine && global.ReportRevisionEngine.previewChanges) {
      var pack = data();
      var period =
        (lastReportMeta && lastReportMeta.period) || String(new Date().getFullYear());
      var profile = pack && pack.getPeriod ? pack.getPeriod(period) : {};
      var list = global.ReportRevisionEngine.previewChanges(text, null, profile, pack);
      return list.length ? list : ['写入对话补充说明'];
    }
    var t = String(text || '');
    var changes = [];
    var mInt = t.match(/(?:强度|碳排放强度)[^0-9]{0,12}(-?[0-9]+(?:\.[0-9]+)?)/);
    if (mInt) changes.push('拟将企业层级碳排放强度更新为 ' + mInt[1]);
    var mEn = t.match(/(?:能耗|综合能耗)[^0-9]{0,12}(-?[0-9]+(?:\.[0-9]+)?)/);
    if (mEn) changes.push('拟将综合能耗强度更新为 ' + mEn[1]);
    if (!changes.length) changes.push('写入对话补充说明');
    return changes;
  }

  function shouldDeliverChatResult(text, result) {
    if (shouldSkipRetrieval(text)) return false;
    if (detectYearlyBenchmarkIntent(text)) return false;
    if (detectGroupAggregateIntent(text)) return false;
    if (detectUploadLearnIntent(text) && data() && data().uploads && data().uploads.length) {
      return false;
    }
    // beforeHandle 已把槽位打成「年度综合对标」时，一律只出报告卡，禁止长文气泡
    var slots =
      (result && result.slots) ||
      (typeof BenchmarkSlotFilling !== 'undefined' && BenchmarkSlotFilling.getSlots
        ? BenchmarkSlotFilling.getSlots()
        : null);
    if (
      slots &&
      slots.functionType === 'comparison' &&
      (slots.timeDimension === 'yearly' || /^\d{4}$/.test(String(slots.timeValue || ''))) &&
      (slots.queryFocus === 'comprehensive' || !slots.queryFocus) &&
      /对标|分析|报告|排名|差距|对比/.test(String(text || ''))
    ) {
      return false;
    }
    return true;
  }

  function appendReportReadyCard(chartId, period, grainLabel, opts) {
    var messages = document.getElementById('cta-messages');
    var welcome = document.getElementById('cta-welcome');
    if (!messages) return;
    if (welcome) welcome.classList.add('hidden');
    messages.classList.remove('hidden');

    var pack = data();
    var grain = grainLabel || '年度';
    var periodShow = String(period || '');
    if (/^\d{4}$/.test(periodShow)) periodShow = periodShow + '年';
    else if (/^\d{4}-\d{2}$/.test(periodShow)) {
      var parts = periodShow.split('-');
      periodShow = parts[0] + '年' + parseInt(parts[1], 10) + '月';
    }
    var updated = opts && opts.updated;
    var extra = (opts && opts.extraDesc) || '';
    var entName =
      (opts && opts.enterpriseName) ||
      (pack && pack.enterpriseName) ||
      '冀东水泥集团';
    var wrap = document.createElement('div');
    wrap.className = 'cta-msg is-assistant cta-msg--full';
    wrap.innerHTML =
      '<div class="cta-msg__bubble cta-msg__bubble--wide">' +
      '<div class="jsl-report-ready">' +
      '<div class="jsl-report-ready__main">' +
      '<p class="jsl-report-ready__title">' +
      (updated ? '智能对标分析报告已更新' : '智能对标分析报告已生成') +
      '</p>' +
      '<p class="jsl-report-ready__desc">' +
      escHtml(entName) +
      ' · ' +
      escHtml(periodShow) +
      '（' +
      escHtml(grain) +
      '）· ' +
      (extra ? escHtml(extra) + ' · ' : '') +
      '生产线 / 能耗 / 产量 / 规模 / 设施对标，请通过报告查看完整分析</p>' +
      '</div>' +
      '<button type="button" class="jsl-report-ready__btn" data-action="preview-report" data-chart-id="' +
      escHtml(chartId) +
      '" title="在新标签页查看智能对标分析报告">查看对标分析报告</button>' +
      '</div></div>';
    messages.appendChild(wrap);
    var scroll = document.getElementById('cta-scroll') || document.getElementById('cta-main-scroll');
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
  }

  function afterResult(text, result) {
    var yearly = detectYearlyBenchmarkIntent(text);
    var aggregate = detectGroupAggregateIntent(text);
    var forceReport = detectUploadLearnIntent(text) && data() && data().uploads && data().uploads.length;
    var revision = detectReportRevisionIntent(text);
    var slotsEarly =
      (result && result.slots) ||
      (typeof BenchmarkSlotFilling !== 'undefined' && BenchmarkSlotFilling.getSlots
        ? BenchmarkSlotFilling.getSlots()
        : {}) ||
      {};
    var slotYearlyReport =
      slotsEarly.functionType === 'comparison' &&
      (slotsEarly.timeDimension === 'yearly' || /^\d{4}$/.test(String(slotsEarly.timeValue || ''))) &&
      (slotsEarly.queryFocus === 'comprehensive' || !slotsEarly.queryFocus) &&
      /对标|分析|报告|排名|差距|对比/.test(String(text || ''));
    if (!yearly && !aggregate && !forceReport && !revision && !slotYearlyReport) return;
    if (typeof BenchmarkReport === 'undefined' || !BenchmarkReport.openPreviewInNewTab) return;

    var pack = data();
    var slots =
      (result && result.slots) ||
      (typeof BenchmarkSlotFilling !== 'undefined' ? BenchmarkSlotFilling.getSlots() : {}) ||
      {};
    var period =
      (revision && lastReportMeta && lastReportMeta.period) ||
      slots.timeValue ||
      resolveYearPeriod(text) ||
      String(new Date().getFullYear());
    var timeDimension =
      slots.timeDimension ||
      (lastReportMeta && lastReportMeta.timeDimension) ||
      (yearly || revision || aggregate || slotYearlyReport ? 'yearly' : '');

    var revisionResult = null;
    if (revision && pack.applyChatRevision) {
      revisionResult = pack.applyChatRevision(text, period);
      if (revisionResult && revisionResult.period) period = revisionResult.period;
      lastRevisionSummary = revisionResult;
    }

    var profile = pack.getPeriod(period);
    var resultForReport = result ? Object.assign({}, result) : {};
    var rankingMeta = Object.assign({}, (result && result.rankingMeta) || {});
    if (profile && profile.co2Intensity != null) {
      rankingMeta.intensity = profile.co2Intensity;
    }
    resultForReport.rankingMeta = rankingMeta;
    resultForReport.slots = slots;

    var enterpriseName = aggregate
      ? pack.groupName + '（集团汇总）'
      : pack.enterpriseName;

    var chartId = 'gl-report-' + Date.now();
    var payload = {
      result: resultForReport,
      period: period,
      userText: text,
      timeDimension: timeDimension,
      enterpriseName: enterpriseName,
      kernel: 'group-ledger-jidong',
      aggregate: !!aggregate,
      sources: gatherSources(period, pack.activeEnterpriseId),
      learningNotes: (pack.learningNotes || []).slice(),
      uploads: (pack.uploads || []).slice(),
      hiddenSections: (pack.hiddenSections || []).slice(),
      summary:
        typeof BenchmarkSlotFilling !== 'undefined'
          ? BenchmarkSlotFilling.buildSummary()
          : '',
      generatedAt: new Date().toISOString(),
      revision: !!revision,
    };

    if (
      typeof global.BenchmarkResultCard !== 'undefined' &&
      global.BenchmarkResultCard.storePayload
    ) {
      global.BenchmarkResultCard.storePayload(chartId, payload);
    }

    lastReportMeta = {
      chartId: chartId,
      period: String(period),
      timeDimension: timeDimension || 'yearly',
    };
    persistReportMeta(lastReportMeta);

    var grainLabel =
      timeDimension === 'monthly' || /^\d{4}-\d{2}$/.test(String(period))
        ? '月度'
        : timeDimension === 'quarterly'
          ? '季度'
          : '年度';
    appendReportReadyCard(chartId, period, grainLabel, {
      updated: !!revision,
      enterpriseName: enterpriseName,
      extraDesc:
        revisionResult && revisionResult.changes && revisionResult.changes.length
          ? revisionResult.changes[0]
          : '',
    });
  }

  /**
   * 上传材料或对话修正后，重新生成优化版报告
   * @param {{ userText?: string, changelog?: string[], updated?: boolean, result?: object }} opts
   */
  function regenerateOptimizedReport(opts) {
    opts = opts || {};
    var pack = data();
    if (!pack) return null;
    var period =
      (lastReportMeta && lastReportMeta.period) || String(new Date().getFullYear());
    var timeDimension =
      (lastReportMeta && lastReportMeta.timeDimension) || 'yearly';
    var profile = pack.getPeriod(period);
    var resultForReport = opts.result ? Object.assign({}, opts.result) : {};
    var rankingMeta = Object.assign({}, resultForReport.rankingMeta || {});
    if (profile && profile.co2Intensity != null) {
      rankingMeta.intensity = profile.co2Intensity;
    }
    resultForReport.rankingMeta = rankingMeta;

    var chartId = 'gl-report-' + Date.now();
    var changelog = opts.changelog || [];
    var payload = {
      result: resultForReport,
      period: period,
      userText: opts.userText || '根据上传材料优化报告',
      timeDimension: timeDimension,
      enterpriseName: pack.enterpriseName,
      kernel: 'group-ledger-jidong',
      sources: gatherSources(period, pack.activeEnterpriseId),
      learningNotes: (pack.learningNotes || []).slice(),
      uploads: (pack.uploads || []).slice(),
      hiddenSections: (pack.hiddenSections || []).slice(),
      changelog: changelog.slice(),
      summary:
        typeof BenchmarkSlotFilling !== 'undefined'
          ? BenchmarkSlotFilling.buildSummary()
          : '',
      generatedAt: new Date().toISOString(),
      revision: true,
    };

    if (
      typeof global.BenchmarkResultCard !== 'undefined' &&
      global.BenchmarkResultCard.storePayload
    ) {
      global.BenchmarkResultCard.storePayload(chartId, payload);
    }

    lastReportMeta = {
      chartId: chartId,
      period: String(period),
      timeDimension: timeDimension,
    };
    persistReportMeta(lastReportMeta);

    appendReportReadyCard(chartId, period, timeDimension === 'monthly' ? '月度' : '年度', {
      updated: opts.updated !== false,
      extraDesc: changelog.length
        ? '已按材料修订 ' + changelog.length + ' 项'
        : '已按材料完成优化',
    });
    return { chartId: chartId, payload: payload, changelog: changelog };
  }

  function onSessionReset() {
    lastReportMeta = null;
    lastRevisionSummary = null;
    persistReportMeta(null);
    var pack = data();
    if (pack && global.ReportRevisionEngine && global.ReportRevisionEngine.clear) {
      global.ReportRevisionEngine.clear(pack);
    }
    if (pack) {
      pack.hiddenSections = [];
      if (Array.isArray(pack.uploads)) pack.uploads = [];
      if (Array.isArray(pack.learningNotes)) pack.learningNotes = [];
    }
  }

  global.DemoSceneKernel = {
    id: 'group-ledger-jidong',
    capabilities: CAPABILITIES,
    resolveYearPeriod: resolveYearPeriod,
    detectYearlyBenchmarkIntent: detectYearlyBenchmarkIntent,
    detectGroupAggregateIntent: detectGroupAggregateIntent,
    detectEnterpriseFromText: detectEnterpriseFromText,
    detectReportRevisionIntent: detectReportRevisionIntent,
    shouldSkipRetrieval: shouldSkipRetrieval,
    hasActiveReport: hasActiveReport,
    gatherSources: gatherSources,
    extractKeywords: extractKeywords,
    searchEnterprises: function (kw) {
      return data() ? data().searchEnterprises(kw) : [];
    },
    getQuerySteps: getQuerySteps,
    getQueryPhaseConfig: getQueryPhaseConfig,
    getAnalysisSteps: getAnalysisSteps,
    getAnalysisPhaseConfig: getAnalysisPhaseConfig,
    shouldDeliverChatResult: shouldDeliverChatResult,
    beforeHandle: beforeHandle,
    afterResult: afterResult,
    regenerateOptimizedReport: regenerateOptimizedReport,
    onSessionReset: onSessionReset,
  };
})(window);
