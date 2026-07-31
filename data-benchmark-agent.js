/**
 * 数据对标智能体 — 壳层 UI + 碳对标业务逻辑
 */
(function () {
  'use strict';

  var CAPABILITIES = {
    match: { label: '改造方案匹配', showFilters: true },
    calc: { label: '投资效益测算', showFilters: false },
    compare: { label: '方案比选分析', showFilters: false },
  };

  var WELCOME_SUGGESTIONS = [
    {
      text: '查询2026年6月河南钢铁集团钢铁行业全国排名',
      prompt: '查询2026年6月河南钢铁集团钢铁行业全国排名',
    },
    {
      text: '对比河南钢铁集团与标杆企业的碳排放差距',
      prompt: '对比河南钢铁集团与标杆企业的碳排放差距',
    },
    {
      text: '2026年6月钢铁企业碳配额履约与碳价影响分析',
      prompt: '2026年6月钢铁企业碳配额履约与碳价影响分析',
    },
  ];

  var sceneProfile = window.DemoSceneProfile || {};
  if (window.DemoSceneApply && typeof window.DemoSceneApply.apply === 'function') {
    window.DemoSceneApply.apply();
  }
  if (sceneProfile.welcomeSuggestions && sceneProfile.welcomeSuggestions.length) {
    WELCOME_SUGGESTIONS = sceneProfile.welcomeSuggestions;
  }

  function getSceneAgentName() {
    if (sceneProfile.agentName) return sceneProfile.agentName;
    if (typeof BenchmarkMatrix !== 'undefined' && BenchmarkMatrix.agentName) return BenchmarkMatrix.agentName;
    return '数据对标智能体';
  }

  var MOCK = {
    energyConsumption: [
      { year: '2022', electricity: '1.82', gas: '0.95', steam: '3.20', total: '5.97' },
      { year: '2023', electricity: '1.76', gas: '0.91', steam: '3.08', total: '5.75' },
      { year: '2024', electricity: '1.68', gas: '0.88', steam: '2.95', total: '5.51' },
    ],
    carbonEmissions: [
      { year: '2022', scope1: '12.5', scope2: '6.1', total: '18.6' },
      { year: '2023', scope1: '12.1', scope2: '5.8', total: '17.9' },
      { year: '2024', scope1: '11.8', scope2: '5.4', total: '17.2' },
    ],
    retrofitSchemes: [
      { name: '高炉煤气余热回收', type: '余热利用', invest: '1,200万元', saving: '3,200万kWh/年', reduction: '0.42万吨/年', payback: '4.2年', match: '高' },
      { name: '电机系统变频改造', type: '能效提升', invest: '680万元', saving: '1,850万kWh/年', reduction: '0.28万吨/年', payback: '3.1年', match: '高' },
      { name: '绿电长协采购', type: '能源替代', invest: '950万元/年', saving: '—', reduction: '0.35万吨/年', payback: '—', match: '中' },
      { name: '化工装置工艺优化', type: '工艺降碳', invest: '2,400万元', saving: '0.62万tce/年', reduction: '0.18万吨/年', payback: '6.8年', match: '中' },
    ],
    workshopEnergy: [
      { name: '高炉工序', electricity: '0.82', gas: '0.65', intensity: '0.38' },
      { name: '轧钢工序', electricity: '0.45', gas: '0.12', intensity: '0.29' },
      { name: '动力站房', electricity: '0.28', gas: '0.08', intensity: '—' },
      { name: '辅助系统', electricity: '0.13', gas: '0.03', intensity: '—' },
    ],
    existingMeasures: [
      { name: '余热回收一期', year: '2023', saving: '1,200万kWh', reduction: '0.15万吨', status: '已投运' },
      { name: 'LED照明改造', year: '2022', saving: '180万kWh', reduction: '0.02万吨', status: '已投运' },
      { name: '空压机群控', year: '2024', saving: '420万kWh', reduction: '0.05万吨', status: '调试中' },
    ],
    groupEmissions: [
      { year: '2022', total: '18.6', intensity: '0.46' },
      { year: '2023', total: '17.9', intensity: '0.43' },
      { year: '2024', total: '17.2', intensity: '0.41' },
    ],
    subEmissions: [
      { name: '高炉工序', v2023: '8.2', v2024: '7.8' },
      { name: '轧钢工序', v2023: '4.5', v2024: '4.2' },
      { name: '动力站房', v2023: '3.1', v2024: '3.0' },
      { name: '辅助系统', v2023: '2.1', v2024: '2.2' },
    ],
    subTargets: [
      { name: '高炉工序', target: '节能量≥2,800万kWh', actual: '匹配余热回收', status: '推荐' },
      { name: '轧钢工序', target: '节能量≥1,500万kWh', actual: '匹配电机改造', status: '推荐' },
      { name: '动力站房', target: '减碳≥0.12万吨', actual: '匹配绿电替代', status: '可选' },
      { name: '辅助系统', target: '回收期≤5年', actual: '匹配群控优化', status: '推荐' },
    ],
    groupTargets: [
      { year: '2022', target: '能耗5.97万tce', actual: '5.97万tce', status: '基线' },
      { year: '2023', target: '降3.7%', actual: '降3.7%', status: '正常' },
      { year: '2024', target: '降4.2%', actual: '降4.2%', status: '正常' },
      { year: '2025', target: '降12%', actual: '方案制定中', status: '进行中' },
    ],
    greenPower: [
      { name: '厂区合计', y2023: '18%', y2024: '22%' },
      { name: '高炉工序', y2023: '12%', y2024: '16%' },
      { name: '轧钢工序', y2023: '25%', y2024: '30%' },
    ],
    reductions: [
      { name: '厂区合计', y2023: '0.52万吨', y2024: '0.68万吨' },
      { name: '余热回收', y2023: '0.15万吨', y2024: '0.22万吨' },
      { name: '电机节能', y2023: '0.18万吨', y2024: '0.25万吨' },
    ],
  };

  var INDICATOR_TARGETS = {
    '项目总投资': { target: '1,880', unit: '万元', change: '较初步方案降8%', monthlyBase: null },
    '年节能量': { target: '5,050', unit: '万kWh', change: '较现状降12%', monthlyBase: 420.8 },
    '年减碳量': { target: '0.70', unit: '万吨', change: '较2024基线降4.1%', monthlyBase: 0.058 },
    '投资回收期': { target: '3.8', unit: '年', change: '较行业均值快0.6年', monthlyBase: null },
  };

  var state = {
    cap: 'match',
    year: '2025',
    month: '06',
    indicators: ['年节能量', '年减碳量'],
    loading: false,
    inputMode: '直接回答',
  };

  var HISTORY_KEY = sceneProfile.historyKey || 'dataBenchmarkAgentHistory';
  var ACTIVE_KEY = sceneProfile.activeKey || 'dataBenchmarkAgentActiveId';
  var LEGACY_KEY = sceneProfile.legacyKey || 'dataBenchmarkAgentSession';

  var activeSessionId = null;
  var sendBtn, welcome, messagesEl, scrollEl, greetingEl, inputEl, modeBtn, modeDropdown, modeLabel, voiceBtn, voiceStatusEl;
  var historyListEl, newChatBtn, historyToggle, historyBackdrop;
  var voiceRecorder = null;
  var voiceTimer = null;
  var voiceSeconds = 0;
  var lastConfidence = null;
  var lastQuerySteps = [];
  var lastAnalysisSteps = [];
  var lastUserText = '';

  function init() {
    if (window.DemoSceneApply && typeof window.DemoSceneApply.apply === 'function') {
      window.DemoSceneApply.apply();
    }
    sendBtn = document.getElementById('cta-send');
    welcome = document.getElementById('cta-welcome');
    messagesEl = document.getElementById('cta-messages');
    scrollEl = document.getElementById('cta-scroll');
    greetingEl = document.getElementById('cta-greeting');
    inputEl = document.getElementById('cta-input');
    modeBtn = document.getElementById('cta-mode-btn');
    modeDropdown = document.getElementById('cta-mode-dropdown');
    modeLabel = document.getElementById('cta-mode-label');
    voiceBtn = document.getElementById('cta-voice-btn');
    voiceStatusEl = document.getElementById('cta-voice-status');
    historyListEl = document.getElementById('cta-history-list');
    newChatBtn = document.getElementById('cta-new-chat');
    historyToggle = document.getElementById('cta-history-toggle');
    historyBackdrop = document.getElementById('cta-history-backdrop');

    if (!messagesEl || !sendBtn) return;

    if (window.BenchmarkCtaBridge) {
      BenchmarkCtaBridge.configure({
        messagesEl: messagesEl,
        scrollEl: scrollEl,
        esc: esc,
        assistantAvatarHtml: assistantAvatarHtml,
        userAvatarHtml: userAvatarHtml,
        saveSession: saveSession,
        ensureChatVisible: ensureChatVisible,
        getAgentName: function () { return getSceneAgentName(); },
        getLastConfidence: function () { return lastConfidence; },
      });
    }

    if (greetingEl) greetingEl.textContent = getGreeting();
    syncWelcomeAvatar();
    migrateLegacySession();
    bindEvents();

    var history = getHistory();
    var activeId = getActiveSessionId();
    if (activeId && history.some(function (s) { return s.id === activeId; })) {
      loadSession(activeId, false);
    } else if (history.length > 0) {
      loadSession(history[0].id, false);
    } else {
      activeSessionId = generateSessionId();
      setActiveSessionId(activeSessionId);
      resetChatUI();
    }
    renderHistoryList();
    renderQuickStartCards();
    renderWelcomeSuggestions();

    window.addEventListener('resize', function () {
      if (typeof BenchmarkChart !== 'undefined') BenchmarkChart.resizeAll();
    });
  }

  function renderQuickStartCards() {
    var grid = document.getElementById('cta-quick-start-grid');
    if (!grid || typeof BenchmarkMatrix === 'undefined') return;
    grid.innerHTML = BenchmarkMatrix.presetQuestions.map(function (q) {
      return '<button type="button" class="cta-quick-start__card" data-prompt="' + escAttr(q.text) + '">' +
        '<span class="cta-quick-start__emoji" aria-hidden="true">' + esc(q.icon) + '</span>' +
        '<span class="cta-quick-start__body">' +
          '<span class="cta-quick-start__title">' + esc(q.text) + '</span>' +
        '</span>' +
      '</button>';
    }).join('');
  }

  function renderWelcomeSuggestions() {
    var container = document.getElementById('cta-welcome-suggestions');
    if (!container) return;
    container.innerHTML = WELCOME_SUGGESTIONS.map(function (item, index) {
      return '<button type="button" class="cta-welcome__suggestion" data-suggestion-index="' + index + '">' +
        '<span class="cta-welcome__suggestion-text">' + esc(item.text) + '</span>' +
        '<svg class="cta-welcome__suggestion-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
      '</button>';
    }).join('');
  }

  function triggerQuickStart(prompt) {
    if (state.loading || !prompt) return;
    if (inputEl) inputEl.value = prompt;
    syncSendBtn();
    send();
  }

  function getSuggestionText(item) {
    if (!item) return '';
    return item.prompt || item.text || '';
  }

  function sendSuggestion(item) {
    if (!item || state.loading) return;
    var text = getSuggestionText(item);
    if (!text) return;
    if (inputEl) inputEl.value = text;
    syncSendBtn();
    send();
  }

  function sourceBadge(sourceId) {
    if (window.MockDataService && window.MockDataService.sourceBadgeHtml) {
      return window.MockDataService.sourceBadgeHtml(sourceId);
    }
    return '';
  }

  function statusIcon(status) {
    if (status === 'warn') return '⚠️';
    if (status === 'ok') return '✅';
    return '⏳';
  }

  function buildReasoningStepHtml(step) {
    return '<div class="cta-thinking__step-main">' +
      '<span class="cta-thinking__dot"></span>' +
      '<div class="cta-thinking__step-body">' +
        '<span class="cta-thinking__text">[步骤' + step.step + '] ' + esc(step.text) + '</span>' +
        '<span class="cta-thinking__source-row">' + sourceBadge(step.sourceId) + '</span>' +
      '</div>' +
      '<span class="cta-thinking__status"></span>' +
    '</div>' +
    '<div class="cta-thinking__preview-slot"></div>';
  }

  function renderSceneChips() {
    renderQuickStartCards();
  }

  function buildResultCardHtml(result, scenarioId) {
    var metricsHtml = result.metrics.map(function (m) {
      return '<div class="cta-retrofit-card__metric' + (m.highlight ? ' is-highlight' : '') + '">' +
        '<span class="cta-retrofit-card__metric-label">' + esc(m.label) + '</span>' +
        '<span class="cta-retrofit-card__metric-value">' + esc(m.value) +
          '<small>' + esc(m.unit) + '</small></span>' +
      '</div>';
    }).join('');

    var secondaryHtml = result.secondaryMetrics.map(function (item) {
      return '<span class="cta-retrofit-card__tag">' +
        '<span>' + esc(item.label) + '：</span>' +
        '<strong>' + esc(item.value) + '</strong></span>';
    }).join('');

    return '<div class="cta-retrofit-card">' +
      '<div class="cta-retrofit-card__head">' +
        '<div><h3 class="cta-retrofit-card__title">' + esc(result.title) + '</h3>' +
        '<p class="cta-retrofit-card__subtitle">' + esc(result.subtitle) + '</p></div>' +
        '<span class="cta-retrofit-card__badge">' + esc(result.industry) + '行业</span>' +
      '</div>' +
      '<p class="cta-retrofit-card__target">' + esc(result.targetObject) + '</p>' +
      '<div class="cta-retrofit-card__metrics">' + metricsHtml + '</div>' +
      '<div class="cta-retrofit-card__tags">' + secondaryHtml + '</div>' +
      '<div class="cta-retrofit-card__chart-wrap">' +
        '<p class="cta-retrofit-card__chart-title">未来 5 年现金流预测（万元）</p>' +
        '<div class="cta-retrofit-card__chart"></div>' +
      '</div>' +
      '<div class="cta-retrofit-card__advice">' +
        '<strong>行动建议</strong>' +
        '<p>' + esc(result.advice) + '</p>' +
      '</div>' +
      '<div class="cta-retrofit-card__actions">' +
        '<button type="button" class="cta-report-btn cta-report-btn--primary" data-action="preview-scenario" data-scenario-id="' + escAttr(scenarioId || '') + '">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' +
          '查看推荐方案' +
        '</button>' +
        '<button type="button" class="cta-report-btn" data-action="export-scenario" data-scenario-id="' + escAttr(scenarioId || '') + '">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
          '导出推荐方案' +
        '</button>' +
      '</div>' +
      '<p class="cta-retrofit-card__data-note">📌 基于数字佳华双碳知识库、双碳云图、MES、企业设备管理系统等六大专有数据库生成</p>' +
    '</div>';
  }

  function mountResultChart(container, cashFlow) {
    if (!container || !window.echarts || !cashFlow) return;
    var chart = window.echarts.init(container);
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['年度净现金流', '累计净现金流'], textStyle: { color: 'rgba(180,200,235,0.75)', fontSize: 11 } },
      grid: { left: 48, right: 16, top: 36, bottom: 28 },
      xAxis: {
        type: 'category',
        data: cashFlow.map(function (p) { return p.year; }),
        axisLine: { lineStyle: { color: 'rgba(148,180,230,0.2)' } },
        axisLabel: { color: 'rgba(180,200,235,0.65)', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: 'rgba(148,180,230,0.08)' } },
        axisLabel: { color: 'rgba(180,200,235,0.65)', fontSize: 11 },
      },
      series: [
        {
          name: '累计净现金流',
          type: 'line',
          smooth: true,
          data: cashFlow.map(function (p) { return p.cumulative; }),
          itemStyle: { color: '#34d399' },
          areaStyle: { color: 'rgba(52,211,153,0.15)' },
        },
        {
          name: '年度净现金流',
          type: 'bar',
          data: cashFlow.map(function (p) { return p.netCash; }),
          itemStyle: { color: '#60a5fa' },
        },
      ],
    });
    requestAnimationFrame(function () { chart.resize(); });
  }

  function runScenarioThinking(scenario) {
    var reasoningSteps = scenario.result.reasoningSteps || [];

    var wrap = createProcessBlock({
      modifier: 'cta-thinking--analysis',
      title: '多源数据融合分析中…',
      doneTitle: '分析完成',
      hint: '正在连接六大专有数据库，逐步完成推理与方案匹配',
      collapsible: true,
      runningStatus: '分析中…',
      doneStatus: '✓ 已完成',
    });

    var root = wrap.querySelector('.cta-thinking');
    var stepsEl = root.querySelector('.cta-thinking__steps');
    stepsEl.innerHTML = '';
    reasoningSteps.forEach(function (step) {
      var li = document.createElement('li');
      li.className = 'cta-thinking__step is-pending';
      li.innerHTML = buildReasoningStepHtml(step);
      stepsEl.appendChild(li);
    });

    var items = Array.prototype.slice.call(stepsEl.querySelectorAll('.cta-thinking__step')).map(function (el, i) {
      return { el: el, step: reasoningSteps[i] };
    });

    return new Promise(function (resolve) {
      var i = 0;
      var headTitle = root.querySelector('.cta-thinking__title');
      var spinner = root.querySelector('.cta-thinking__spinner');

      function finishStep(idx) {
        var item = items[idx];
        var statusEl = item.el.querySelector('.cta-thinking__status');
        var slot = item.el.querySelector('.cta-thinking__preview-slot');
        item.el.classList.remove('is-running');
        item.el.classList.add('is-done');
        statusEl.textContent = statusIcon(item.step.status) + ' ' + (item.step.status === 'warn' ? '已返回（有偏差）' : '已返回');
        if (slot && item.step.interim) {
          slot.innerHTML = '<div class="cta-step-preview cta-step-preview--interim">' + esc(item.step.interim) + '</div>';
          slot.classList.add('is-visible');
        }
        scrollToBottom();
      }

      function next() {
        if (i > 0) finishStep(i - 1);
        if (i >= items.length) {
          if (headTitle) headTitle.textContent = '分析完成';
          if (spinner) spinner.classList.add('is-done');
          saveSession();
          resolve();
          return;
        }
        var item = items[i];
        item.el.classList.remove('is-pending');
        item.el.classList.add('is-running');
        item.el.querySelector('.cta-thinking__status').textContent = '查询中…';
        scrollToBottom();
        i += 1;
        setTimeout(next, 850);
      }

      setTimeout(next, 350);
    });
  }

  function appendScenarioResult(scenario) {
    state.lastScenario = scenario;
    var confBadge = (window.ConfidenceCalculator && scenario.result.confidenceDetail)
      ? window.ConfidenceCalculator.badgeHtml(scenario.result.confidenceDetail)
      : '（置信度 <strong>' + (scenario.result.confidence || 98) + '%</strong>）';
    var wrap = document.createElement('div');
    wrap.className = 'cta-msg is-assistant cta-msg--full';
    wrap.innerHTML =
      assistantAvatarHtml() +
      '<div class="cta-msg__bubble cta-msg__bubble--wide">' +
        '<div class="cta-report__intro">' +
          '<p class="cta-report__intro-text">已完成「' + esc(scenario.chip.label) + '」场景分析，基于 <strong>6 大专有数据库</strong> 生成以下改造方案：</p>' +
          '<div class="cta-report__intro-meta">' + confBadge + '</div>' +
        '</div>' +
        buildResultCardHtml(scenario.result, scenario.id) +
      '</div>';
    messagesEl.appendChild(wrap);
    mountResultChart(wrap.querySelector('.cta-retrofit-card__chart'), scenario.result.cashFlow);
    scrollToBottom();
    saveSession();
  }

  function generateSessionId() {
    return 's_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  }

  function escAttr(s) {
    return esc(s).replace(/"/g, '&quot;');
  }

  function getUserAvatarLabel() {
    try {
      var raw = sessionStorage.getItem('carbonLedgerUser');
      if (raw) {
        var user = JSON.parse(raw);
        if (user.name) return String(user.name).charAt(0).toUpperCase();
      }
    } catch (e) { /* ignore */ }
    return '我';
  }

  function userAvatarHtml() {
    return '<div class="cta-msg__avatar cta-msg__avatar--user" aria-hidden="true" title="我">' +
      esc(getUserAvatarLabel()) + '</div>';
  }

  function getAgentIconSrc() {
    var iconApi = window.CarbonLedgerAgentIcon || {};
    if (iconApi.getUrl) return iconApi.getUrl();
    var preview = window.CarbonLedgerPreview || {};
    if (preview.agentIconUrl) return preview.agentIconUrl;
    var path = window.location.pathname || '';
    var dir = path.replace(/[^/]*$/, '');
    return dir + (preview.agentIconRel || 'assets/dual-carbon-agent-avatar.png?v=4');
  }

  function assistantAvatarHtml() {
    return '<div class="cta-msg__avatar cta-msg__avatar--assistant" aria-hidden="true" title="' + escAttr(getSceneAgentName()) + '">' +
      '<img class="cta-msg__avatar-img" src="' + escAttr(getAgentIconSrc()) + '" alt="" />' +
    '</div>';
  }

  function syncWelcomeAvatar() {
    var img = document.getElementById('cta-welcome-avatar');
    if (img) img.src = getAgentIconSrc();
  }

  function ensureMessageAvatars() {
    if (!messagesEl) return;
    messagesEl.querySelectorAll('.cta-msg').forEach(function (msg) {
      if (msg.classList.contains('is-user')) {
        if (!msg.querySelector('.cta-msg__avatar')) {
          msg.insertAdjacentHTML('beforeend', userAvatarHtml());
        }
        return;
      }
      if (!msg.classList.contains('is-assistant')) return;
      var av = msg.querySelector('.cta-msg__avatar--assistant');
      if (!av) {
        msg.insertAdjacentHTML('afterbegin', assistantAvatarHtml());
      } else if (!av.querySelector('.cta-msg__avatar-img')) {
        av.outerHTML = assistantAvatarHtml();
      } else {
        var icon = av.querySelector('.cta-msg__avatar-img');
        if (icon) icon.src = getAgentIconSrc();
      }
    });
  }

  function getHistory() {
    try {
      var raw = sessionStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function setHistory(list) {
    try {
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    } catch (e) { /* ignore */ }
  }

  function getActiveSessionId() {
    try {
      return sessionStorage.getItem(ACTIVE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setActiveSessionId(id) {
    try {
      sessionStorage.setItem(ACTIVE_KEY, id);
    } catch (e) { /* ignore */ }
  }

  function migrateLegacySession() {
    try {
      var raw = sessionStorage.getItem(LEGACY_KEY);
      if (!raw) return;
      var payload = JSON.parse(raw);
      sessionStorage.removeItem(LEGACY_KEY);
      if (!payload || !payload.messagesHtml) return;
      var id = generateSessionId();
      var st = payload.state || {};
      var history = getHistory();
      history.unshift({
        id: id,
        title: buildDefaultTitle(st),
        updatedAt: Date.now(),
        messagesHtml: payload.messagesHtml,
        welcomeHidden: payload.welcomeHidden,
        state: st,
      });
      setHistory(history);
      setActiveSessionId(id);
    } catch (e) { /* ignore */ }
  }

  function buildDefaultTitle(st) {
    var cap = CAPABILITIES[st.cap] || CAPABILITIES.match;
    var parts = [cap.label];
    if (cap.showFilters && st.year) {
      parts.push(st.year + '年');
      if (st.month) parts.push(parseInt(st.month, 10) + '月');
    }
    return parts.join(' · ');
  }

  function getSessionPayload() {
    return {
      messagesHtml: messagesEl.innerHTML,
      welcomeHidden: !!(welcome && welcome.classList.contains('hidden')),
      inputDraft: inputEl ? inputEl.value : '',
      benchmarkPayloads:
        typeof BenchmarkResultCard !== 'undefined' && BenchmarkResultCard.getAllPayloads
          ? BenchmarkResultCard.getAllPayloads()
          : {},
      state: {
        cap: state.cap,
        year: state.year,
        month: state.month,
        indicators: state.indicators.slice(),
      },
    };
  }

  function deriveSessionTitle() {
    var firstUser = messagesEl.querySelector('.cta-msg.is-user .cta-msg__bubble');
    if (firstUser) {
      var text = firstUser.textContent.trim();
      if (text) return text.length > 30 ? text.slice(0, 30) + '…' : text;
    }
    return buildDefaultTitle(state);
  }

  function persistCurrentSession() {
    if (!messagesEl || !activeSessionId) return;
    var hasMessages = messagesEl.children.length > 0;
    var history = getHistory();

    if (!hasMessages) {
      setHistory(history.filter(function (s) { return s.id !== activeSessionId; }));
      return;
    }

    var payload = getSessionPayload();
    var entry = {
      id: activeSessionId,
      title: deriveSessionTitle(),
      updatedAt: Date.now(),
      messagesHtml: payload.messagesHtml,
      welcomeHidden: payload.welcomeHidden,
      state: payload.state,
    };

    var idx = history.findIndex(function (s) { return s.id === activeSessionId; });
    if (idx >= 0) history[idx] = entry;
    else history.unshift(entry);

    history.sort(function (a, b) { return b.updatedAt - a.updatedAt; });
    setHistory(history);
  }

  function saveSession() {
    persistCurrentSession();
    renderHistoryList();
  }

  function applySessionData(session) {
    if (session.state) {
      state.cap = session.state.cap || state.cap;
      state.year = session.state.year || state.year;
      state.month = session.state.month || state.month;
      state.indicators = (session.state.indicators || state.indicators).slice();
    }

    setCapability(state.cap, { preserveInput: true });
    if (inputEl) inputEl.value = session.inputDraft || '';
    messagesEl.innerHTML = session.messagesHtml || '';

    if (typeof BenchmarkChart !== 'undefined') {
      try {
        BenchmarkChart.disposeAll();
      } catch (e) {
        /* ignore */
      }
    }
    if (typeof BenchmarkResultCard !== 'undefined') {
      if (session.benchmarkPayloads && BenchmarkResultCard.restorePayloads) {
        BenchmarkResultCard.restorePayloads(session.benchmarkPayloads);
      }
      if (BenchmarkResultCard.remountChartsInDocument) {
        requestAnimationFrame(function () {
          BenchmarkResultCard.remountChartsInDocument(messagesEl);
          setTimeout(function () {
            if (typeof BenchmarkChart !== 'undefined') BenchmarkChart.resizeAll();
          }, 320);
        });
      }
    }

    if (session.welcomeHidden) {
      ensureChatVisible();
    } else {
      if (welcome) welcome.classList.remove('hidden');
      messagesEl.classList.add('hidden');
    }

    syncSendBtn();
    ensureMessageAvatars();
    bindThinkingFoldToggle();
    requestAnimationFrame(function () { scrollToBottom(); });
  }

  function loadSession(id, saveCurrent) {
    if (state.loading) return;
    if (saveCurrent !== false && id !== activeSessionId) persistCurrentSession();

    var session = getHistory().find(function (s) { return s.id === id; });
    if (!session) return;

    activeSessionId = id;
    setActiveSessionId(id);
    applySessionData(session);
    renderHistoryList();
    closeHistoryPanel();
  }

  function resetChatUI() {
    messagesEl.innerHTML = '';
    if (welcome) welcome.classList.remove('hidden');
    messagesEl.classList.add('hidden');
    state.loading = false;
    if (inputEl) inputEl.value = '';
    if (typeof BenchmarkAgent !== 'undefined') BenchmarkAgent.resetSession();
    syncSendBtn();
  }

  function startNewSession() {
    if (state.loading) return;
    persistCurrentSession();
    activeSessionId = generateSessionId();
    setActiveSessionId(activeSessionId);
    resetChatUI();
    renderHistoryList();
    closeHistoryPanel();
  }

  function deleteSession(id, e) {
    e.preventDefault();
    e.stopPropagation();
    var history = getHistory().filter(function (s) { return s.id !== id; });
    setHistory(history);
    if (id === activeSessionId) {
      if (history.length > 0) {
        loadSession(history[0].id, false);
      } else {
        activeSessionId = generateSessionId();
        setActiveSessionId(activeSessionId);
        resetChatUI();
        renderHistoryList();
      }
    } else {
      renderHistoryList();
    }
  }

  function formatSessionTime(ts) {
    var d = new Date(ts);
    var now = new Date();
    var diff = now - d;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前';
    if (d.toDateString() === now.toDateString()) {
      var m = d.getMinutes();
      return d.getHours() + ':' + (m < 10 ? '0' : '') + m;
    }
    var yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return '昨天';
    return (d.getMonth() + 1) + '/' + d.getDate();
  }

  function renderHistoryList() {
    if (!historyListEl) return;
    var history = getHistory();
    if (!history.length) {
      historyListEl.innerHTML = '<li class="cta-history__empty">暂无历史会话<br/>点击上方「新建会话」开始</li>';
      return;
    }
    historyListEl.innerHTML = history.map(function (s) {
      var isActive = s.id === activeSessionId;
      return '<li class="cta-history__item' + (isActive ? ' is-active' : '') + '">' +
        '<button type="button" class="cta-history__btn" data-id="' + escAttr(s.id) + '">' +
          '<span class="cta-history__title">' + esc(s.title || '新会话') + '</span>' +
          '<span class="cta-history__meta">' +
            '<span>' + esc(formatSessionTime(s.updatedAt || Date.now())) + '</span>' +
          '</span>' +
        '</button>' +
        '<button type="button" class="cta-history__delete" data-id="' + escAttr(s.id) + '" title="删除会话" aria-label="删除会话">×</button>' +
      '</li>';
    }).join('');
  }

  function toggleHistoryPanel() {
    var panel = document.getElementById('cta-history');
    if (!panel) return;
    var open = panel.classList.toggle('is-open');
    if (historyBackdrop) historyBackdrop.classList.toggle('is-visible', open);
  }

  function closeHistoryPanel() {
    var panel = document.getElementById('cta-history');
    if (panel) panel.classList.remove('is-open');
    if (historyBackdrop) historyBackdrop.classList.remove('is-visible');
  }

  function getGreeting() {
    var h = new Date().getHours();
    if (h < 6) return '夜深了，';
    if (h < 12) return '早上好，';
    if (h < 14) return '中午好，';
    if (h < 18) return '下午好，';
    return '晚上好，';
  }

  function getBenchmarkQuerySteps() {
    var userText = typeof lastUserText !== 'undefined' ? lastUserText : '';
    var slots = typeof BenchmarkSlotFilling !== 'undefined' ? BenchmarkSlotFilling.getSlots() : {};
    if (typeof BenchmarkSlotFilling !== 'undefined' && userText) {
      BenchmarkSlotFilling.reset();
      BenchmarkSlotFilling.parseMessage(userText);
      slots = BenchmarkSlotFilling.getSlots();
    }

    var focus = typeof BenchmarkDataService !== 'undefined'
      ? BenchmarkDataService.detectQueryFocus(userText, slots)
      : 'comprehensive';
    var industry = slots.industry || '钢铁';
    var periodLabel = (function () {
      var tv = slots.timeValue;
      if (slots.timeDimension === 'monthly' && tv && String(tv).indexOf('-') >= 0) {
        var parts = String(tv).split('-');
        return parts[0] + '年' + parseInt(parts[1], 10) + '月';
      }
      if (tv && String(tv).indexOf('-') >= 0) {
        var p = String(tv).split('-');
        return p[0] + '年' + parseInt(p[1], 10) + '月';
      }
      return (tv || '2026') + '年';
    })();
    var focusLabel = {
      ranking: '排名查询',
      comparison: '多维对比',
      quota: '配额履约分析',
      pollutant: '排污对标',
      production: '生产经营分析',
      energy: '节能降耗对标',
      retrofit: '技改减排潜力',
      comprehensive: '综合研判'
    }[focus] || '综合研判';

    var profile = typeof BenchmarkDataService !== 'undefined'
      ? BenchmarkDataService.getEnterpriseProfile(slots)
      : null;
    var pool = typeof BenchmarkDataService !== 'undefined'
      ? BenchmarkDataService.INDUSTRY_POOL[industry]
      : null;
    var enterprisePreview = profile
      ? buildMiniTable(['指标', '数值'], [
          ['企业', '河南钢铁集团'],
          ['统计周期', periodLabel],
          ['分析焦点', focusLabel],
          ['钢材产量', profile.steelOutput + profile.steelOutputUnit],
          ['碳排放量', profile.co2Emission + profile.co2Unit],
          ['碳排放强度', profile.co2Intensity + ' ' + profile.intensityUnit],
          ['碳配额', profile.carbonQuota + '万吨'],
          ['碳价均价', profile.carbonPriceAvg + profile.carbonPriceUnit],
        ])
      : null;

    return [
      {
        id: 'parse',
        text: '理解问题焦点：「' + (userText || '综合对标').slice(0, 36) + '」→ ' + focusLabel,
        preview: null,
      },
      {
        id: 'knowledge',
        text: '检索安阳钢铁年报、生态环境部碳市场政策及中钢协能耗统计',
        preview: pool ? buildMiniTable(['指标', '数值'], [
          ['纳入碳市场钢企', pool.total + ' 家'],
          ['行业平均强度', pool.avgIntensity + ' tCO₂/t'],
          ['行业最优强度', pool.best + ' tCO₂/t'],
        ]) : null,
      },
      {
        id: 'cloud',
        text: '同步河南钢铁集团产量、碳排放、配额、排污数据',
        preview: buildMiniTable(['数据源', '状态'], [['安阳钢铁年报', '已接入'], ['全国碳市场', '已同步']]),
      },
      {
        id: 'device',
        text: focus === 'energy' || focus === 'retrofit'
          ? '调取高炉、转炉工序能效与煤气发电数据'
          : '调取排污在线监测与碳核查数据',
        preview: buildMiniTable(['工序', '关键指标', '状态'], [
          ['高炉-转炉', profile ? profile.energyPerTon + ' kgce/t' : '560 kgce/t', '已获取'],
          ['排污', profile ? 'SO₂ ' + profile.pollutants.so2 + 't' : '—', '已获取'],
        ]),
      },
      {
        id: 'enterprise',
        text: '加载河南钢铁集团' + periodLabel + '六维经营双碳数据',
        preview: enterprisePreview,
      },
      {
        id: 'industry',
        text: '生成与行业标杆/均值的多维差距对比',
        preview: buildMiniTable(['维度', '状态'], [
          ['产量', '已对比'], ['碳排放', '已对比'], ['强度', '已对比'],
          ['配额', '已对比'], ['排污', '已对比'], ['能耗', '已对比'],
        ]),
      },
    ];
  }

  function getBenchmarkAnalysisSteps(text, willResult) {
    var slots = typeof BenchmarkSlotFilling !== 'undefined' ? BenchmarkSlotFilling.getSlots() : {};
    var intent = typeof BenchmarkIntent !== 'undefined'
      ? BenchmarkIntent.recognize(text, slots)
      : {};
    var stepTexts = typeof BenchmarkIntent !== 'undefined'
      ? BenchmarkIntent.buildThinkingSteps(intent, willResult)
      : ['正在聚合对标分析维度…', '正在生成排名与诊断结论…'];
    return stepTexts.map(function (t, i) {
      return { id: 'analysis-' + i, text: t, preview: null };
    });
  }

  function getQuerySteps() {
    if (
      window.DemoSceneKernel &&
      typeof window.DemoSceneKernel.getQuerySteps === 'function'
    ) {
      var customSteps = window.DemoSceneKernel.getQuerySteps(lastUserText);
      if (customSteps && customSteps.length) return customSteps;
    }
    return getBenchmarkQuerySteps();
  }

  function getAnalysisSteps() {
    if (
      window.DemoSceneKernel &&
      typeof window.DemoSceneKernel.getAnalysisSteps === 'function'
    ) {
      var customAnalysis = window.DemoSceneKernel.getAnalysisSteps(lastUserText);
      if (customAnalysis && customAnalysis.length) return customAnalysis;
    }
    return lastAnalysisSteps.length ? lastAnalysisSteps : [
      { id: 'rank', text: '计算行业排名位次与百分位' },
      { id: 'gap', text: '多维度对比碳效指标并检索脱敏对标样本' },
      { id: 'advice', text: '生成对标排名与诊断结论' },
    ];
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function buildMiniTable(headers, rows) {
    var h = headers.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('');
    var b = rows.map(function (row) {
      return '<tr>' + row.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>';
    }).join('');
    return '<div class="cta-step-preview"><table class="cta-mini-table"><thead><tr>' + h + '</tr></thead><tbody>' + b + '</tbody></table></div>';
  }

  function ensureChatVisible() {
    if (welcome) welcome.classList.add('hidden');
    if (messagesEl) messagesEl.classList.remove('hidden');
  }

  function scrollToBottom() {
    requestAnimationFrame(function () {
      if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
    });
  }

  function getInputText() {
    return inputEl ? inputEl.value.trim() : '';
  }

  function syncSendBtn() {
    if (!sendBtn) return;
    if (state.loading) {
      sendBtn.disabled = true;
      sendBtn.classList.remove('agent-copilot-input__send--ready');
      sendBtn.classList.add('agent-copilot-input__send--disabled');
      return;
    }
    var ready = !!getInputText();
    sendBtn.disabled = !ready;
    sendBtn.classList.toggle('agent-copilot-input__send--ready', ready);
    sendBtn.classList.toggle('agent-copilot-input__send--disabled', !ready);
  }

  function setInputMode(mode) {
    state.inputMode = mode;
    if (modeLabel) modeLabel.textContent = mode;
    if (modeDropdown) {
      modeDropdown.querySelectorAll('.agent-copilot-input__dropdown-item').forEach(function (item) {
        item.classList.toggle('agent-copilot-input__dropdown-item--active', item.getAttribute('data-mode') === mode);
      });
    }
  }

  function closeModeDropdown() {
    if (modeDropdown) modeDropdown.classList.add('hidden');
  }

  function toggleModeDropdown() {
    if (!modeDropdown) return;
    modeDropdown.classList.toggle('hidden');
  }

  function formatVoiceTime(totalSeconds) {
    var m = Math.floor(totalSeconds / 60);
    var s = totalSeconds % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function renderVoiceListening() {
    if (!voiceStatusEl) return;
    voiceStatusEl.classList.remove('hidden');
    voiceStatusEl.innerHTML =
      '<div class="voice-recorder-status__listening">' +
        '<span class="voice-recorder-status__waves" aria-hidden="true"><span></span><span></span><span></span><span></span></span>' +
        '<span class="voice-recorder-status__text">正在聆听...</span>' +
        '<span class="voice-recorder-status__timer">' + formatVoiceTime(voiceSeconds) + '</span>' +
      '</div>';
  }

  function hideVoiceStatus() {
    if (voiceStatusEl) {
      voiceStatusEl.classList.add('hidden');
      voiceStatusEl.innerHTML = '';
    }
  }

  function stopVoiceRecording() {
    if (voiceTimer) {
      clearInterval(voiceTimer);
      voiceTimer = null;
    }
    voiceSeconds = 0;
    if (voiceRecorder && voiceRecorder.state !== 'inactive') {
      try { voiceRecorder.stop(); } catch (e) { /* ignore */ }
    }
    voiceRecorder = null;
    if (voiceBtn) voiceBtn.classList.remove('voice-recorder-btn--recording');
    hideVoiceStatus();
  }

  function startVoiceRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      voiceRecorder = new MediaRecorder(stream);
      voiceSeconds = 0;
      if (voiceBtn) voiceBtn.classList.add('voice-recorder-btn--recording');
      renderVoiceListening();
      voiceTimer = setInterval(function () {
        voiceSeconds += 1;
        renderVoiceListening();
      }, 1000);
      voiceRecorder.onstop = function () {
        stream.getTracks().forEach(function (track) { track.stop(); });
        hideVoiceStatus();
        if (voiceBtn) voiceBtn.classList.remove('voice-recorder-btn--recording');
      };
      voiceRecorder.start();
      setTimeout(function () {
        if (voiceRecorder && voiceRecorder.state === 'recording') stopVoiceRecording();
      }, 15000);
    }).catch(function () { /* ignore */ });
  }

  function toggleVoiceRecording() {
    if (voiceRecorder && voiceRecorder.state === 'recording') {
      stopVoiceRecording();
      return;
    }
    startVoiceRecording();
  }

  function setCapability(capId, options) {
    if (!CAPABILITIES[capId]) return;
    state.cap = capId;
    syncSendBtn();
  }

  function buildSendSummary() {
    var cap = CAPABILITIES[state.cap];
    var parts = ['【' + cap.label + '】'];
    if (cap.showFilters) {
      if (state.year) parts.push(state.year + '年');
      if (state.month) parts.push(parseInt(state.month, 10) + '月');
      if (state.indicators.length) parts.push('指标：' + state.indicators.join('、'));
    }
    return parts.join(' · ');
  }

  function appendUserMessage(text) {
    ensureChatVisible();
    var wrap = document.createElement('div');
    wrap.className = 'cta-msg is-user';
    wrap.innerHTML =
      '<div class="cta-msg__bubble">' + esc(text) + '</div>' +
      userAvatarHtml();
    messagesEl.appendChild(wrap);
    if (typeof BenchmarkAgent !== 'undefined') BenchmarkAgent.appendUserMsg(text);
    scrollToBottom();
    saveSession();
  }

  function peekWillShowResult(text) {
    return !!(text && String(text).trim());
  }

  function bindThinkingFoldToggle() {
    if (window.__ctaThinkingFoldBound) return;
    window.__ctaThinkingFoldBound = true;

    function toggleFromHead(head) {
      var root = head.closest('.cta-thinking');
      if (!root) return;
      var foldBtn = root.querySelector('.cta-thinking__fold');
      var collapsed = root.classList.toggle('is-collapsed');
      head.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      if (foldBtn) {
        foldBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        foldBtn.setAttribute('title', collapsed ? '展开' : '折叠');
        foldBtn.setAttribute('aria-label', collapsed ? '展开详情' : '折叠详情');
      }
    }

    document.addEventListener('click', function (e) {
      var head = e.target && e.target.closest && e.target.closest('.cta-thinking__head.is-foldable');
      if (!head) return;
      e.preventDefault();
      toggleFromHead(head);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var head = e.target && e.target.closest && e.target.closest('.cta-thinking__head.is-foldable');
      if (!head || e.target !== head) return;
      e.preventDefault();
      toggleFromHead(head);
    });
  }

  function createProcessBlock(config) {
    ensureChatVisible();
    var wrap = document.createElement('div');
    wrap.className = 'cta-msg is-assistant cta-msg--full';
    var foldHtml = config.collapsible
      ? '<button type="button" class="cta-thinking__fold" tabindex="-1" aria-hidden="true" title="折叠" aria-label="折叠详情">›</button>'
      : '';
    var headClass = 'cta-thinking__head' + (config.collapsible ? ' is-foldable' : '');
    wrap.innerHTML =
      assistantAvatarHtml() +
      '<div class="cta-msg__bubble cta-msg__bubble--wide">' +
        '<div class="cta-thinking' + (config.modifier ? ' ' + config.modifier : '') + '">' +
          '<div class="' + headClass + '"' +
            (config.collapsible
              ? ' role="button" tabindex="0" aria-expanded="true" title="点击展开或折叠"'
              : '') +
          '>' +
            '<span class="cta-thinking__spinner"></span>' +
            '<span class="cta-thinking__title">' + esc(config.title) + '</span>' +
            '<span class="cta-thinking__elapsed"></span>' +
            foldHtml +
          '</div>' +
          '<div class="cta-thinking__body">' +
            '<p class="cta-thinking__hint">' + esc(config.hint) + '</p>' +
            '<ul class="cta-thinking__steps"></ul>' +
          '</div>' +
        '</div>' +
      '</div>';
    if (config.collapsible) bindThinkingFoldToggle();
    messagesEl.appendChild(wrap);
    scrollToBottom();
    return wrap;
  }

  function runProcessSteps(processWrap, steps, config) {
    var root = processWrap.querySelector('.cta-thinking');
    var stepsEl = root.querySelector('.cta-thinking__steps');
    var headTitle = root.querySelector('.cta-thinking__title');
    var spinner = root.querySelector('.cta-thinking__spinner');
    var elapsedEl = root.querySelector('.cta-thinking__elapsed');
    var items = [];
    var startTime = Date.now();

    steps.forEach(function (step) {
      var li = document.createElement('li');
      li.className = 'cta-thinking__step is-pending';
      li.innerHTML =
        '<div class="cta-thinking__step-main">' +
          '<span class="cta-thinking__dot"></span>' +
          '<span class="cta-thinking__text">' + esc(step.text) + '</span>' +
          '<span class="cta-thinking__status"></span>' +
        '</div>' +
        '<div class="cta-thinking__preview-slot"></div>';
      stepsEl.appendChild(li);
      items.push({ el: li, step: step });
    });

    return new Promise(function (resolve) {
      var i = 0;

      function tickElapsed() {
        if (elapsedEl) {
          elapsedEl.textContent = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
        }
      }

      function finishStep(idx) {
        var item = items[idx];
        var statusEl = item.el.querySelector('.cta-thinking__status');
        var slot = item.el.querySelector('.cta-thinking__preview-slot');
        item.el.classList.remove('is-running');
        item.el.classList.add('is-done');
        if (item.step.preview) {
          statusEl.textContent = config.doneStatusWithPreview || '✓ 已返回 4 条';
          if (slot) {
            slot.innerHTML = item.step.preview;
            slot.classList.add('is-visible');
          }
        } else {
          statusEl.textContent = config.doneStatus || '✓ 已完成';
        }
        scrollToBottom();
      }

      function next() {
        tickElapsed();
        if (i > 0) finishStep(i - 1);
        if (i >= items.length) {
          if (headTitle) headTitle.textContent = config.doneTitle;
          if (spinner) spinner.classList.add('is-done');
          tickElapsed();
          if (config.collapseOnDone && root) {
            root.classList.add('is-collapsed');
            var foldBtn = root.querySelector('.cta-thinking__fold');
            var head = root.querySelector('.cta-thinking__head');
            if (head) head.setAttribute('aria-expanded', 'false');
            if (foldBtn) {
              foldBtn.setAttribute('aria-expanded', 'false');
              foldBtn.setAttribute('title', '展开');
              foldBtn.setAttribute('aria-label', '展开详情');
            }
          }
          saveSession();
          resolve();
          return;
        }
        var item = items[i];
        item.el.classList.remove('is-pending');
        item.el.classList.add('is-running');
        item.el.querySelector('.cta-thinking__status').textContent = config.runningStatus || '处理中…';
        scrollToBottom();
        i += 1;
        var delay = config.stepDelay;
        if (delay == null) {
          delay = item.step.preview ? 900 : (config.defaultDelay || 600);
        }
        setTimeout(next, delay);
      }

      setTimeout(next, config.startDelay || 300);
    });
  }

  function runQueryPhase() {
    lastQuerySteps = getQuerySteps();
    var phaseCfg =
      window.DemoSceneKernel &&
      typeof window.DemoSceneKernel.getQueryPhaseConfig === 'function'
        ? window.DemoSceneKernel.getQueryPhaseConfig(lastUserText) || {}
        : {};
    var kernelId = window.DemoSceneKernel && window.DemoSceneKernel.id;
    var kernelHint = '';
    if (kernelId === 'digital-carbon-jinshenglan' || (lastQuerySteps[0] && lastQuerySteps[0].id === 'kw-parse')) {
      kernelHint = 'jinshenglan';
    } else if (
      window.DemoSceneKernel &&
      typeof window.DemoSceneKernel.getQuerySteps === 'function' &&
      lastQuerySteps &&
      lastQuerySteps[0] &&
      lastQuerySteps[0].id === 'parse'
    ) {
      var parseText = String(lastQuerySteps[0].text || '');
      if (/冀东/.test(parseText)) {
        kernelHint = 'jidong';
      } else if (/金盛兰|数字碳表内核/.test(parseText)) {
        kernelHint = 'jinshenglan';
      } else if (/绿色低碳管理平台|输入工序|上传/.test(parseText)) {
        kernelHint = 'green';
      } else if (/内核/.test(parseText)) {
        kernelHint = 'generic';
      }
    }

    var defaultTitle =
      kernelHint === 'jidong'
        ? '正在汇聚冀东多源数据…'
        : kernelHint === 'jinshenglan'
          ? '信息分析及检索中…'
          : kernelHint === 'green'
            ? '正在汇聚绿色平台多源数据…'
            : kernelHint
              ? '正在按场景内核汇聚数据…'
              : '正在查询对标数据…';
    var defaultDoneTitle =
      kernelHint === 'jidong'
        ? '冀东多源数据汇聚完成'
        : kernelHint === 'jinshenglan'
          ? '信息分析及检索'
          : kernelHint === 'green'
            ? '绿色平台多源数据汇聚完成'
            : kernelHint
              ? '场景内核数据汇聚完成'
              : '对标数据查询完成';
    var defaultHint =
      kernelHint === 'jidong'
        ? '按内核拉取网站 / 百度 / 佳华双碳云图 / 本地库（仅冀东范围）'
        : kernelHint === 'jinshenglan'
          ? '客户自有（金盛兰业务系统）· 佳华双碳云图 · 互联网公开数据'
          : kernelHint === 'green'
            ? '按内核汇聚网站 / 百度 / 佳华双碳云图，并结合工序录入与上传材料（仅输入工序）'
            : kernelHint
              ? '按场景内核拉取多源数据并生成分析'
              : '正在连接佳华五大核心数据源，逐步检索行业样本与企业碳效数据';

    var wrap = createProcessBlock({
      modifier: phaseCfg.modifier || 'cta-thinking--query',
      title: phaseCfg.title || defaultTitle,
      doneTitle: phaseCfg.doneTitle || defaultDoneTitle,
      hint: phaseCfg.hint || defaultHint,
      collapsible: phaseCfg.collapsible != null ? !!phaseCfg.collapsible : true,
      runningStatus: '查询中…',
      doneStatus: '✓ 已返回',
      doneStatusWithPreview: '✓ 已返回',
    });
    return runProcessSteps(wrap, lastQuerySteps, {
      runningStatus: '查询中…',
      doneStatus: '✓ 已返回',
      doneStatusWithPreview: '✓ 已返回',
      doneTitle: phaseCfg.doneTitle || defaultDoneTitle,
      defaultDelay: phaseCfg.defaultDelay != null ? phaseCfg.defaultDelay : 500,
      stepDelay: phaseCfg.stepDelay,
      startDelay: phaseCfg.startDelay,
      collapseOnDone: !!phaseCfg.collapseOnDone,
    });
  }

  function runAnalysisPhase() {
    var analysisCfg =
      window.DemoSceneKernel &&
      typeof window.DemoSceneKernel.getAnalysisPhaseConfig === 'function'
        ? window.DemoSceneKernel.getAnalysisPhaseConfig(lastUserText) || {}
        : {};
    var wrap = createProcessBlock({
      modifier: analysisCfg.modifier || 'cta-thinking--analysis',
      title: analysisCfg.title || '智能体思考中…',
      doneTitle: analysisCfg.doneTitle || '思考完成',
      hint:
        analysisCfg.hint ||
        '基于已查询的行业样本与企业数据，进行排名计算与差距诊断',
      collapsible: analysisCfg.collapsible != null ? !!analysisCfg.collapsible : true,
      runningStatus: '分析中…',
      doneStatus: '✓ 已完成',
    });
    return runProcessSteps(wrap, getAnalysisSteps(), {
      runningStatus: '分析中…',
      doneStatus: '✓ 已完成',
      doneTitle: analysisCfg.doneTitle || '思考完成',
      defaultDelay: analysisCfg.defaultDelay != null ? analysisCfg.defaultDelay : 650,
      startDelay: analysisCfg.startDelay != null ? analysisCfg.startDelay : 400,
      collapseOnDone: !!analysisCfg.collapseOnDone,
    });
  }

  function getMonthlyTarget(def, month) {
    if (!def || def.monthlyBase == null) return '—';
    var m = parseInt(month, 10) || 6;
    var factor = 0.92 + (m % 4) * 0.02;
    return (def.monthlyBase * factor).toFixed(2) + ' ' + def.unit;
  }

  function getCarbonTargetEditUrl() {
    var preview = window.CarbonLedgerPreview || {};
    var base = preview.carbonTargetEditUrl || 'carbon-target-edit.html';
    var params = new URLSearchParams();
    params.set('year', state.year || '2025');
    params.set('month', state.month || '06');
    params.set('from', 'agent');
    if (state.indicators.length) params.set('indicators', state.indicators.join(','));
    return base + '?' + params.toString();
  }

  function buildTargetResultTable() {
    var y = state.year || '2025';
    var m = parseInt(state.month || '06', 10);
    var indicators = state.indicators.length ? state.indicators.slice() : ['年节能量', '年减碳量'];
    var headers = ['指标', '目标值', '单位', '较基期变化', m + '月分解目标'];
    var rows = indicators.map(function (name) {
      var def = INDICATOR_TARGETS[name] || { target: '—', unit: '—', change: '—', monthlyBase: null };
      return [name, def.target, def.unit, def.change, getMonthlyTarget(def, state.month)];
    });
    return buildMiniTable(headers, rows);
  }

  function buildReportContext() {
    if (!window.CarbonTargetReport) return null;
    return window.CarbonTargetReport.buildContext({
      year: state.year,
      month: state.month,
      indicators: state.indicators,
      capLabel: (CAPABILITIES[state.cap] || CAPABILITIES.match).label,
      mock: MOCK,
      indicatorTargets: INDICATOR_TARGETS,
    });
  }

  function appendConclusionMessage() {
    var y = state.year || '2025';
    var m = parseInt(state.month || '06', 10);
    var wrap = document.createElement('div');
    wrap.className = 'cta-msg is-assistant cta-msg--full';
    wrap.innerHTML =
      assistantAvatarHtml() +
      '<div class="cta-msg__bubble cta-msg__bubble--wide">' +
        '<div class="cta-report">' +
          '<div class="cta-report__title">🎯 ' + esc(y) + ' 年 ' + m + ' 月 · 改造方案测算结果</div>' +
          '<p class="cta-report__intro">已根据厂区能耗与碳排放数据完成方案匹配与投资测算，结果如下：</p>' +
          buildTargetResultTable() +
          '<div class="cta-report__section cta-report__section--report">' +
            '<h3>📄 节能降碳改造推荐方案</h3>' +
            '<p class="cta-report__intro">推荐方案含能耗基线分析、改造路径匹配、投资效益测算、减碳效益评估、方案比选、实施路径、风险分析及 7 类图表，支持在线查看。</p>' +
          '</div>' +
          '<div class="cta-report__actions">' +
            '<button type="button" class="cta-report-btn cta-report-btn--primary" data-action="preview">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' +
              '查看推荐方案' +
            '</button>' +
          '</div>' +
          '<p class="cta-report__footer">点击「查看推荐方案」在线查看完整图表与分析。</p>' +
        '</div>' +
      '</div>';
    messagesEl.appendChild(wrap);
    scrollToBottom();
    saveSession();
  }

  function send() {
    syncSendBtn();
    if (!sendBtn || sendBtn.disabled || state.loading) return;

    var text = getInputText();
    if (!text) return;

    if (typeof BenchmarkSlotFilling === 'undefined') {
      appendUserMessage(text);
      state.loading = false;
      syncSendBtn();
      return;
    }

    appendUserMessage(text);
    if (inputEl) inputEl.value = '';

    lastUserText = text;
    BenchmarkSlotFilling.reset();
    BenchmarkSlotFilling.parseMessage(text);
    if (
      window.DemoSceneKernel &&
      typeof window.DemoSceneKernel.beforeHandle === 'function'
    ) {
      window.DemoSceneKernel.beforeHandle(text);
    }

    state.loading = true;
    syncSendBtn();

    var willResult = peekWillShowResult(text);
    lastAnalysisSteps = getBenchmarkAnalysisSteps(text, willResult);

    runQueryPhase().then(function () {
      return runAnalysisPhase();
    }).then(function () {
      var result = BenchmarkSlotFilling.handleMessage(text);
      if (
        window.DemoSceneKernel &&
        typeof window.DemoSceneKernel.beforeHandle === 'function'
      ) {
        window.DemoSceneKernel.beforeHandle(text);
      }
      if (typeof BenchmarkAgent !== 'undefined') {
        BenchmarkAgent.updateSlotTags();
      }

      if (window.ConfidenceCalculator && window.ConfidenceCalculator.calculateForBenchmark) {
        lastConfidence = window.ConfidenceCalculator.calculateForBenchmark({
          querySteps: lastQuerySteps,
          analysisSteps: lastAnalysisSteps,
          result: result,
        });
      }

      if (typeof BenchmarkAgent !== 'undefined') {
        var deliverChat = true;
        if (
          window.DemoSceneKernel &&
          typeof window.DemoSceneKernel.shouldDeliverChatResult === 'function'
        ) {
          deliverChat = !!window.DemoSceneKernel.shouldDeliverChatResult(text, result);
        }
        if (deliverChat) {
          BenchmarkAgent.deliverResult(result);
        }
      }

      if (
        window.DemoSceneKernel &&
        typeof window.DemoSceneKernel.afterResult === 'function'
      ) {
        window.DemoSceneKernel.afterResult(text, result);
      }

      state.loading = false;
      syncSendBtn();
      saveSession();
    });
  }

  var CONFIDENCE_FLOAT_ID = 'cta-confidence-float';

  function closeConfidenceFloat() {
    var floatEl = document.getElementById(CONFIDENCE_FLOAT_ID);
    if (floatEl) floatEl.remove();
    document.querySelectorAll('.cta-confidence__help.is-open').forEach(function (el) {
      el.classList.remove('is-open');
      el.setAttribute('aria-expanded', 'false');
    });
  }

  function positionConfidenceFloat(floatEl, anchor) {
    var rect = anchor.getBoundingClientRect();
    var margin = 12;
    var gap = 8;
    floatEl.style.visibility = 'hidden';
    floatEl.style.display = 'block';
    var floatRect = floatEl.getBoundingClientRect();
    var top = rect.bottom + gap;
    var left = rect.right - floatRect.width;
    if (left < margin) left = margin;
    if (left + floatRect.width > window.innerWidth - margin) {
      left = window.innerWidth - floatRect.width - margin;
    }
    if (top + floatRect.height > window.innerHeight - margin) {
      top = rect.top - floatRect.height - gap;
    }
    if (top < margin) top = margin;
    floatEl.style.top = top + 'px';
    floatEl.style.left = left + 'px';
    floatEl.style.visibility = 'visible';
  }

  function openConfidenceFloat(help) {
    var popup = help.querySelector('.cta-confidence__popup');
    if (!popup) return;
    closeConfidenceFloat();
    var floatEl = document.createElement('div');
    floatEl.id = CONFIDENCE_FLOAT_ID;
    floatEl.className = 'cta-confidence-float';
    floatEl.innerHTML = popup.innerHTML;
    document.body.appendChild(floatEl);
    positionConfidenceFloat(floatEl, help);
    help.classList.add('is-open');
    help.setAttribute('aria-expanded', 'true');
  }

  function bindConfidenceHelp() {
    document.addEventListener('click', function (e) {
      var help = e.target.closest('.cta-confidence__help');
      if (help) {
        e.preventDefault();
        e.stopPropagation();
        if (help.classList.contains('is-open')) closeConfidenceFloat();
        else openConfidenceFloat(help);
        return;
      }
      if (!e.target.closest('#' + CONFIDENCE_FLOAT_ID)) closeConfidenceFloat();
    });

    window.addEventListener('resize', closeConfidenceFloat);
    window.addEventListener('scroll', closeConfidenceFloat, true);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeConfidenceFloat();
      var help = e.target.closest('.cta-confidence__help');
      if (help && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        if (help.classList.contains('is-open')) closeConfidenceFloat();
        else openConfidenceFloat(help);
      }
    });
  }

  function bindEvents() {
    bindConfidenceHelp();
    if (inputEl) {
      inputEl.addEventListener('input', syncSendBtn);
      inputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          send();
        }
      });
    }

    if (modeBtn) {
      modeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleModeDropdown();
      });
    }

    if (modeDropdown) {
      modeDropdown.addEventListener('click', function (e) {
        var item = e.target.closest('.agent-copilot-input__dropdown-item');
        if (!item) return;
        setInputMode(item.getAttribute('data-mode') || '直接回答');
        closeModeDropdown();
      });
    }

    document.addEventListener('click', function () {
      closeModeDropdown();
    });

    if (voiceBtn) {
      voiceBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleVoiceRecording();
      });
    }

    setInputMode(state.inputMode);

    if (sendBtn) sendBtn.addEventListener('click', send);

    var quickStartGrid = document.getElementById('cta-quick-start-grid');
    if (quickStartGrid) {
      quickStartGrid.addEventListener('click', function (e) {
        var btn = e.target.closest('.cta-quick-start__card');
        if (!btn || state.loading) return;
        triggerQuickStart(btn.getAttribute('data-prompt'));
      });
    }

    var welcomeSuggestions = document.getElementById('cta-welcome-suggestions');
    if (welcomeSuggestions) {
      welcomeSuggestions.addEventListener('click', function (e) {
        var btn = e.target.closest('.cta-welcome__suggestion');
        if (!btn || state.loading) return;
        var index = parseInt(btn.getAttribute('data-suggestion-index'), 10);
        if (isNaN(index) || !WELCOME_SUGGESTIONS[index]) return;
        sendSuggestion(WELCOME_SUGGESTIONS[index]);
      });
    }

    if (messagesEl) {
      messagesEl.addEventListener('click', function (e) {
        var previewBtn = e.target.closest('[data-action="preview-report"]');
        if (previewBtn && typeof BenchmarkAgent !== 'undefined') {
          BenchmarkAgent.handlePreviewReport(previewBtn);
          saveSession();
          return;
        }

        var downloadBtn = e.target.closest('[data-action="download-report"]');
        if (downloadBtn && typeof BenchmarkAgent !== 'undefined') {
          BenchmarkAgent.handleDownloadReport(downloadBtn);
          saveSession();
          return;
        }

        var compareBtn = e.target.closest('[data-action="generate-compare-report"]');
        if (compareBtn && typeof BenchmarkAgent !== 'undefined') {
          BenchmarkAgent.handleGenerateCompareReport(compareBtn);
          saveSession();
          return;
        }

        var historyBtn = e.target.closest('[data-action="view-history"]');
        if (historyBtn && typeof BenchmarkAgent !== 'undefined') {
          BenchmarkAgent.handleViewHistory();
          saveSession();
        }
      });
    }

    if (newChatBtn) newChatBtn.addEventListener('click', startNewSession);

    if (historyListEl) {
      historyListEl.addEventListener('click', function (e) {
        var del = e.target.closest('.cta-history__delete');
        if (del) {
          deleteSession(del.getAttribute('data-id'), e);
          return;
        }
        var btn = e.target.closest('.cta-history__btn');
        if (btn) loadSession(btn.getAttribute('data-id'));
      });
    }

    if (historyToggle) historyToggle.addEventListener('click', toggleHistoryPanel);
    if (historyBackdrop) historyBackdrop.addEventListener('click', closeHistoryPanel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
