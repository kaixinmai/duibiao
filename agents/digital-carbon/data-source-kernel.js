/**
 * 数字碳表 · 金盛兰对标内核
 * 三类数据：客户自有 / 佳华自有（绿字+机器人推演） / 互联网公开
 * 自然语言年度对标 → 思考过程 → 智能报告；支持上传材料学习修订
 * 报告已生成后的追加对话 → 补充修正（跳过重复检索）
 */
(function (global) {
  'use strict';

  /** @type {{ chartId: string, period: string, timeDimension: string }|null} */
  var lastReportMeta = null;
  /** 最近一次对话修正摘要，供思考步骤展示 */
  var lastRevisionSummary = null;
  var REPORT_META_KEY = 'jsl-duibiao-report-meta';

  function data() {
    return global.JinshenglanData;
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
    if (/对标分析|综合对标|进行.*对标|给我.*对标|今年.*对标|年度对标|智能对标/.test(t)) return true;
    if (/对标/.test(t) && (/分析|报告|今年|年度|全面|工序|能耗|产量|规模|设施/.test(t))) return true;
    return false;
  }

  function detectUploadLearnIntent(text) {
    return /上传|学习|更新报告|修订报告|调整报告|重新生成/.test(String(text || ''));
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
      /章|节|部分|模块|建议|对标|潜力|来源|能耗|产量|设施|历史/.test(t)
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
   * green: 绿色低碳管理平台 / 佳华自有 → 报告中绿色字体
   * robot: 污碳模型推演 → 机器人图标
   * category: customer | jiahua | internet | upload
   */
  function gatherSources(period) {
    var pack = data();
    var profile = pack.getPeriod(period);
    var src = pack.sources;

    var list = [
      {
        id: 'bizSystem',
        name: src.bizSystem,
        status: '已返回',
        detail: '已关联金盛兰业务系统生产、能耗、排放台账',
        category: 'customer',
      },
      {
        id: 'localDb',
        name: src.localDb,
        status: '已返回',
        detail: '本地库已对齐「金盛兰钢铁」' + period + ' 周期对标底数',
        category: 'customer',
      },
      {
        id: 'verifyReport',
        name: src.verifyReport || '温室气体排放核查报告终值（2020–2023）',
        status: '已返回',
        detail:
          '已写入粗钢/钢材产量、企业层级排放与强度、综合能耗、工序排放、废钢比及设施产能（中春环保核查终值）',
        category: 'customer',
      },
      {
        id: 'web',
        name: src.web,
        status: '已返回',
        detail: '已汇总企业公开披露与行业资讯摘要',
        category: 'internet',
      },
      {
        id: 'baidu',
        name: src.baidu,
        status: '已返回',
        detail: '检索关键词「金盛兰钢铁 碳排放 对标」',
        category: 'internet',
      },
      {
        id: 'cloudFacility',
        name: src.cloudFacility,
        status: '已返回',
        detail: '生产设施 ' + (profile.facilities || '—') + ' 处',
        category: 'jiahua',
        green: true,
        platform: '绿色低碳管理平台',
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
        platform: '绿色低碳管理平台',
      },
      {
        id: 'cloudProduction',
        name: src.cloudProduction,
        status: '已返回',
        detail: '产量 ' + profile.steelOutput + profile.steelOutputUnit + '（污碳模型推演）',
        category: 'jiahua',
        green: true,
        robot: true,
        platform: '绿色低碳管理平台',
      },
      {
        id: 'cloudEmission',
        name: src.cloudEmission,
        status: '已返回',
        detail: '碳排放 ' + profile.co2Emission + profile.co2Unit + '（污碳模型推演）',
        category: 'jiahua',
        green: true,
        robot: true,
        platform: '绿色低碳管理平台',
      },
      {
        id: 'cloudIntensity',
        name: src.cloudIntensity,
        status: '已返回',
        detail: '强度 ' + profile.co2Intensity + ' ' + profile.intensityUnit + '（污碳模型推演）',
        category: 'jiahua',
        green: true,
        robot: true,
        platform: '绿色低碳管理平台',
      },
    ];

    if (pack.uploads && pack.uploads.length) {
      list.push({
        id: 'uploads',
        name: src.uploads,
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

    // 报告能耗对标章节引用的标准 / 政策，写入数据来源便于溯源
    var framework = pack.energyStdFramework;
    if (framework && framework.standards && framework.standards.length) {
      framework.standards.forEach(function (std, idx) {
        list.push({
          id: 'std-' + (std.code || idx),
          name: std.code + '《' + std.title + '》',
          status: '已引用',
          detail:
            (std.role || '') +
            (std.usedIn ? '；本报告用于：' + std.usedIn : ''),
          category: 'standard',
          usedIn: std.usedIn || '能耗对标',
          standard: true,
        });
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
    var list = ['金盛兰钢铁', period + '年'];

    if (/对标/.test(t) || /分析报告|情况|综合/.test(t)) list.push('对标分析');
    else list.push('智能对标');

    if (/能耗|能源/.test(t)) list.push('能耗对标');
    else if (/产量|产能/.test(t)) list.push('产量规模');
    else if (/工序|设施/.test(t)) list.push('工序设施');
    else list.push('碳排放');

    if (/强度|碳效|绩效/.test(t)) list.push('碳绩效');
    else if (/绿色工厂|智能工厂/.test(t)) list.push('绿色工厂');
    else list.push('碳强度');

    var seen = {};
    return list.filter(function (k) {
      if (seen[k]) return false;
      seen[k] = true;
      return true;
    }).slice(0, 5);
  }

  /** 互联网公开资料（演示，默认折叠） */
  function getInternetMaterials() {
    return [
      'CMMM、SIRI与AMMM智能制造成熟度指数对比分析 - 中国钢铁工业协会',
      '钢铁行业绿色低碳发展路径与标杆实践综述 - 经济日报',
      'T/CISA 293-2022《钢铁企业重点工序能效标杆对标指南》要点解读 - 中国钢铁工业协会',
      'T/CISA 416-2024《钢铁企业重点工序能效标杆评估规范》正式发布 - 冶金工业规划研究院',
      'GB/T 28924-2023《钢铁企业能效指数计算导则》解读',
      'GB 21256-2025《粗钢生产主要工序单位产品能源消耗限额》1/2/3级体系解读',
      '发改产业〔2023〕723号《工业重点领域能效标杆水平和基准水平（2023年版）》',
      '钢铁企业能效对标指南（DB32/T 3139-2016） - 地方标准公开文本',
      '长流程钢铁企业碳排放核算与强度对标方法说明 - 行业技术导则',
      'Steel Performance Measurement: Strategies for Comparing Against Industry Benchmarks',
      '“十四五”钢铁高质量发展中的对标分析框架 - 规划解读',
      '2024企业社会责任报告：绿色制造与低碳转型专章',
      '喜报！湖北金盛兰冶金科技有限公司获评国家级绿色工厂 - 企业官网',
      '湖北金盛兰入选2025年钢铁行业规范条件企业名单 - 工信部公开信息',
      '湖北金盛兰产能规模与产品结构公开披露摘要（约480万吨钢） - 企业查',
      '湖北金盛兰获评2026年度湖北省先进级智能工厂 - 湖北金盛兰官网',
      '金盛兰数字化转型示范企业认定相关报道 - 腾讯新闻',
      '湖北金盛兰亮相2025中国钢铁物流大会 - 行业资讯',
      '区域钢铁企业绿色工厂创建实践案例汇编 - 行业协会',
      '低碳冶金趋势：氢冶金与电炉短流程进展跟踪 - 行业观察',
      '重点钢铁企业能效“领跑者”对标指标体系解读',
      '金盛兰智慧工厂建设与碳排放精细化管理实践 - 地方媒体',
      '迁安/湖北金盛兰相关环保与节能技改公开信息摘要',
      '钢铁行业“数字大脑”建设路径与标杆案例 - CSDN/行业专栏',
      '首钢数字化转型实践对行业对标的启示 - 集团新闻',
      '宝钢基于AI的智能制造与碳效优化案例 - 行业报道',
      '高炉炼铁炉温监测、预警、调控智能体设计与应用 - CSDN博客',
      '非凡“十四五” | “灯塔”引航 智启新程 - 中信泰富特钢',
      '以“智变”走出钢铁行业高质量发展新路径 - 江苏经济报',
      '喜报!湖北金盛兰冶金科技有限公司获评2026年度湖北省先进级智能工厂',
      '湖北金盛兰冶金科技有限公司亮相2025中国钢铁物流',
      '湖北金盛兰获评2023年度市级智能化制造数字化转型示范企业 - 腾讯新闻',
    ];
  }

  /** 平台侧资料：客户自有 + 佳华双碳云图 */
  function getPlatformMaterials() {
    return [
      {
        group: 'customer',
        label: '金盛兰碳排放管理平台-碳排放数据',
        green: false,
        robot: false,
      },
      {
        group: 'customer',
        label: '金盛兰碳排放管理平台-系统管理数据',
        green: false,
        robot: false,
      },
      {
        group: 'customer',
        label: '金盛兰碳排放管理平台-能耗系统数据',
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
    var uid = 'jsl-kw-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

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
      '<div class="jsl-kw-section-title">客户自有 · 金盛兰碳排放管理平台</div>' +
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
    if (global.__jslKwToggleBound) return;
    global.__jslKwToggleBound = true;
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
    if (!detectYearlyBenchmarkIntent(userText) && !detectUploadLearnIntent(userText)) {
      return null;
    }
    return [
      { id: 'a1', text: '聚合工序 / 能耗 / 产量 / 规模 / 设施维度' },
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

    BenchmarkDataService.DISPLAY.SELF = pack.enterpriseName;
    BenchmarkDataService.DISPLAY.INDUSTRY_AVG = '行业均值（全国长流程钢铁）';
    BenchmarkDataService.DISPLAY.BENCHMARK = '行业标杆（前5%）';
    BenchmarkDataService.DISPLAY.COMPARE_TARGET = '区域内标杆企业';
    BenchmarkDataService.DISPLAY.PEER_MASK = '某钢铁企业';
    BenchmarkDataService.INDUSTRY_POOL['钢铁'] = Object.assign(
      { unit: 'tCO₂/t' },
      pack.industryBenchmark
    );

    if (typeof BenchmarkSlotFilling !== 'undefined') {
      var slots = BenchmarkSlotFilling.slots;
      slots.industry = '钢铁';
      slots.objectDimension = 'enterprise';
      if (detectYearlyBenchmarkIntent(text) || /今年|本年|年度/.test(text) || shouldSkipRetrieval(text)) {
        slots.timeDimension =
          (lastReportMeta && lastReportMeta.timeDimension) || slots.timeDimension || 'yearly';
        slots.timeValue =
          (lastReportMeta && lastReportMeta.period) ||
          resolveYearPeriod(text) ||
          slots.timeValue;
        slots.functionType = 'comparison';
        slots.queryFocus = 'comprehensive';
      }
    }

    // 预解析修正文案，供思考步骤展示（真正写入在 afterResult 里幂等处理）
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
        (lastReportMeta && lastReportMeta.period) ||
        String(new Date().getFullYear());
      var profile = pack && pack.getPeriod ? pack.getPeriod(period) : {};
      var list = global.ReportRevisionEngine.previewChanges(text, null, profile, pack);
      return list.length ? list : ['写入对话补充说明'];
    }
    return ['写入对话补充说明'];
  }

  function shouldDeliverChatResult(text) {
    if (shouldSkipRetrieval(text)) return false;
    if (detectYearlyBenchmarkIntent(text)) return false;
    if (detectUploadLearnIntent(text) && data() && data().uploads.length) return false;
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
      escHtml(pack.enterpriseName) +
      ' · ' +
      escHtml(periodShow) +
      '（' +
      escHtml(grain) +
      '）· ' +
      (extra
        ? escHtml(extra) + ' · '
        : '') +
      '工序 / 能耗 / 产量 / 规模 / 设施对标，请通过报告查看完整分析</p>' +
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
    var forceReport = detectUploadLearnIntent(text) && data() && data().uploads.length;
    var revision = detectReportRevisionIntent(text);
    if (!yearly && !forceReport && !revision) return;
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
      (yearly || revision ? 'yearly' : '');

    var revisionResult = null;
    if (revision && pack.applyChatRevision) {
      revisionResult = pack.applyChatRevision(text, period);
      if (revisionResult && revisionResult.period) period = revisionResult.period;
      lastRevisionSummary = revisionResult;
    }

    var profile = pack.getPeriod(period);
    // 把对话修正同步进 result.rankingMeta，避免报告仍读首次查询缓存
    var resultForReport = result ? Object.assign({}, result) : {};
    var rankingMeta = Object.assign({}, (result && result.rankingMeta) || {});
    if (profile && profile.co2Intensity != null) {
      rankingMeta.intensity = profile.co2Intensity;
    }
    resultForReport.rankingMeta = rankingMeta;
    resultForReport.slots = slots;

    var chartId = 'jsl-report-' + Date.now();
    var payload = {
      result: resultForReport,
      period: period,
      userText: text,
      timeDimension: timeDimension,
      enterpriseName: pack.enterpriseName,
      kernel: 'digital-carbon-jinshenglan',
      sources: gatherSources(period),
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
      (lastReportMeta && lastReportMeta.period) ||
      String(new Date().getFullYear());
    var timeDimension =
      (lastReportMeta && lastReportMeta.timeDimension) || 'yearly';
    var profile = pack.getPeriod(period);
    var resultForReport = opts.result ? Object.assign({}, opts.result) : {};
    var rankingMeta = Object.assign({}, resultForReport.rankingMeta || {});
    if (profile && profile.co2Intensity != null) {
      rankingMeta.intensity = profile.co2Intensity;
    }
    resultForReport.rankingMeta = rankingMeta;

    var chartId = 'jsl-report-' + Date.now();
    var changelog = opts.changelog || [];
    var payload = {
      result: resultForReport,
      period: period,
      userText: opts.userText || '根据上传材料优化报告',
      timeDimension: timeDimension,
      enterpriseName: pack.enterpriseName,
      kernel: 'digital-carbon-jinshenglan',
      sources: gatherSources(period),
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
      extraDesc: changelog.length ? changelog[0] : '已按材料完成优化',
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
    if (pack) pack.hiddenSections = [];
  }

  global.DemoSceneKernel = {
    id: 'digital-carbon-jinshenglan',
    resolveYearPeriod: resolveYearPeriod,
    detectYearlyBenchmarkIntent: detectYearlyBenchmarkIntent,
    detectReportRevisionIntent: detectReportRevisionIntent,
    shouldSkipRetrieval: shouldSkipRetrieval,
    hasActiveReport: hasActiveReport,
    gatherSources: gatherSources,
    extractKeywords: extractKeywords,
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
