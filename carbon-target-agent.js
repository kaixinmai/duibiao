/**
 * 碳目标智能体 — 思考过程 + 逐步查数展示 + 分析报告
 */
(function () {
  'use strict';

  var CAPABILITIES = {
    formulate: { label: '碳目标制定', showFilters: true },
    track: { label: '碳目标跟踪', showFilters: false },
    simulate: { label: '碳目标情景模拟', showFilters: false },
  };

  var CAPABILITY_PROMPTS = {
    formulate: '请帮我制定 2025 年 6 月集团碳目标，重点关注碳排放总量与碳排放强度。',
    track: '请跟踪集团 2025 年碳目标完成率，并分析未达标板块的原因。',
    simulate: '请模拟在基准情景与强化减排情景下，集团 2030 年碳达峰路径差异。',
  };

  var MOCK = {
    groupTargets: [
      { year: '2022', target: '较2020降8%', actual: '降6.2%', status: '预警' },
      { year: '2023', target: '较2020降12%', actual: '降10.8%', status: '预警' },
      { year: '2024', target: '较2020降16%', actual: '降15.1%', status: '正常' },
      { year: '2025', target: '较2020降20%', actual: '进行中', status: '制定中' },
    ],
    subTargets: [
      { name: '楚天电力', target: '强度≤0.42', actual: '0.41', status: '达标' },
      { name: '楚天钢铁', target: '总量≤128万吨', actual: '131万吨', status: '未达标' },
      { name: '楚天化工', target: '强度≤0.68', actual: '0.65', status: '达标' },
      { name: '楚天物流', target: '绿电≥35%', actual: '38%', status: '达标' },
    ],
    groupEmissions: [
      { year: '2022', total: '65.8', intensity: '0.46' },
      { year: '2023', total: '63.1', intensity: '0.43' },
      { year: '2024', total: '61.5', intensity: '0.41' },
    ],
    subEmissions: [
      { name: '楚天电力', v2023: '28.4', v2024: '27.1' },
      { name: '楚天钢铁', v2023: '18.6', v2024: '19.2' },
      { name: '楚天化工', v2023: '9.8', v2024: '9.2' },
    ],
    greenPower: [
      { name: '集团', y2023: '32%', y2024: '36%' },
      { name: '楚天电力', y2023: '28%', y2024: '34%' },
      { name: '楚天钢铁', y2023: '18%', y2024: '22%' },
    ],
    reductions: [
      { name: '集团', y2023: '1.82万吨', y2024: '2.15万吨' },
      { name: '楚天电力', y2023: '0.72万吨', y2024: '0.85万吨' },
      { name: '楚天钢铁', y2023: '0.45万吨', y2024: '0.52万吨' },
    ],
  };

  var INDICATOR_TARGETS = {
    '碳排放总量': { target: '59.8', unit: '万吨', change: '较2024降2.8%', monthlyBase: 4.98 },
    '碳排放强度': { target: '0.39', unit: 'tCO₂e/万元', change: '较2024降4.9%', monthlyBase: null },
    '减排完成率': { target: '92', unit: '%', change: '较2024提升7个百分点', monthlyBase: null },
    '绿电消纳率': { target: '40', unit: '%', change: '较2024提升4个百分点', monthlyBase: null },
    '配额盈缺': { target: '+0.5', unit: '万吨', change: '由缺口转为盈余', monthlyBase: null },
  };

  var state = {
    cap: 'formulate',
    year: '2025',
    month: '06',
    indicators: ['碳排放总量', '碳排放强度'],
    loading: false,
    inputMode: '直接回答',
  };

  var HISTORY_KEY = 'carbonTargetAgentHistory';
  var ACTIVE_KEY = 'carbonTargetAgentActiveId';
  var LEGACY_KEY = 'carbonTargetAgentSession';

  var activeSessionId = null;
  var sendBtn, welcome, messagesEl, scrollEl, greetingEl, inputEl, modeBtn, modeDropdown, modeLabel, voiceBtn, voiceStatusEl;
  var historyListEl, newChatBtn, historyToggle, historyBackdrop;
  var voiceRecorder = null;
  var voiceTimer = null;
  var voiceSeconds = 0;

  function init() {
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
      setCapability('formulate');
    }
    renderHistoryList();
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
    return '<div class="cta-msg__avatar cta-msg__avatar--assistant" aria-hidden="true" title="双碳智能体">' +
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
    var cap = CAPABILITIES[st.cap] || CAPABILITIES.formulate;
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

    if (session.welcomeHidden) {
      ensureChatVisible();
    } else {
      if (welcome) welcome.classList.remove('hidden');
      messagesEl.classList.add('hidden');
    }

    syncSendBtn();
    ensureMessageAvatars();
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
    state.cap = 'formulate';
    state.year = '2025';
    state.month = '06';
    state.indicators = ['碳排放总量', '碳排放强度'];
    state.loading = false;
    if (inputEl) inputEl.value = CAPABILITY_PROMPTS.formulate;
    setCapability('formulate', { preserveInput: true });
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
      var capLabel = (s.state && CAPABILITIES[s.state.cap]) ? CAPABILITIES[s.state.cap].label : '会话';
      var isActive = s.id === activeSessionId;
      return '<li class="cta-history__item' + (isActive ? ' is-active' : '') + '">' +
        '<button type="button" class="cta-history__btn" data-id="' + escAttr(s.id) + '">' +
          '<span class="cta-history__title">' + esc(s.title || '新会话') + '</span>' +
          '<span class="cta-history__meta">' +
            '<span class="cta-history__cap">' + esc(capLabel) + '</span>' +
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

  function getQuerySteps() {
    var y = state.year || '2025';
    var m = state.month ? parseInt(state.month, 10) : 6;
    var ind = (state.indicators && state.indicators.length) ? state.indicators.join('、') : '碳排放总量、碳排放强度';
    return [
      {
        id: 'parse',
        text: '解析需求：' + CAPABILITIES.formulate.label + ' · ' + y + '年' + m + '月 · ' + ind,
        preview: null,
      },
      {
        id: 'target-group',
        text: '查询集团历史碳目标（carbon_target_group）',
        preview: buildMiniTable(['年度', '目标', '实际', '状态'], MOCK.groupTargets.map(function (r) {
          return [r.year, r.target, r.actual, r.status];
        })),
      },
      {
        id: 'target-subs',
        text: '查询下属企业历史碳目标（carbon_target_subsidiary）',
        preview: buildMiniTable(['企业', '目标', '实际', '状态'], MOCK.subTargets.map(function (r) {
          return [r.name, r.target, r.actual, r.status];
        })),
      },
      {
        id: 'emission-group',
        text: '查询集团历年碳排放（carbon_emission_group）',
        preview: buildMiniTable(['年度', '总量(万吨)', '强度'], MOCK.groupEmissions.map(function (r) {
          return [r.year, r.total, r.intensity];
        })),
      },
      {
        id: 'emission-subs',
        text: '查询下属企业历年碳排放（carbon_emission_subsidiary）',
        preview: buildMiniTable(['企业', '2023', '2024(万吨)'], MOCK.subEmissions.map(function (r) {
          return [r.name, r.v2023, r.v2024];
        })),
      },
      {
        id: 'green',
        text: '查询集团及企业绿电消纳（green_power_consumption）',
        preview: buildMiniTable(['主体', '2023', '2024'], MOCK.greenPower.map(function (r) {
          return [r.name, r.y2023, r.y2024];
        })),
      },
      {
        id: 'reduction',
        text: '查询集团及企业减排数据（carbon_reduction_record）',
        preview: buildMiniTable(['主体', '2023', '2024'], MOCK.reductions.map(function (r) {
          return [r.name, r.y2023, r.y2024];
        })),
      },
    ];
  }

  function getAnalysisSteps() {
    var y = state.year || '2025';
    var m = state.month ? parseInt(state.month, 10) : 6;
    var ind = (state.indicators && state.indicators.length) ? state.indicators.join('、') : '碳排放总量、碳排放强度';
    return [
      { id: 'sum', text: '汇总集团及下属企业历史排放与目标完成情况' },
      { id: 'compare', text: '交叉比对排放强度、绿电消纳率与减排贡献数据' },
      { id: 'gap', text: '识别未达标企业与关键指标差距（楚天钢铁等）' },
      { id: 'calc', text: '结合选定指标（' + ind + '）测算 ' + y + ' 年 ' + m + ' 月目标值' },
      { id: 'split', text: '分解月度目标并校验较基期降幅可行性' },
      { id: 'advice', text: '生成碳目标制定建议与结果输出' },
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
    if (!options || !options.preserveInput) {
      if (inputEl && CAPABILITY_PROMPTS[capId]) inputEl.value = CAPABILITY_PROMPTS[capId];
    }
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
    scrollToBottom();
    saveSession();
  }

  function createProcessBlock(config) {
    ensureChatVisible();
    var wrap = document.createElement('div');
    wrap.className = 'cta-msg is-assistant cta-msg--full';
    wrap.innerHTML =
      assistantAvatarHtml() +
      '<div class="cta-msg__bubble cta-msg__bubble--wide">' +
        '<div class="cta-thinking' + (config.modifier ? ' ' + config.modifier : '') + '">' +
          '<div class="cta-thinking__head">' +
            '<span class="cta-thinking__spinner"></span>' +
            '<span class="cta-thinking__title">' + esc(config.title) + '</span>' +
            '<span class="cta-thinking__elapsed"></span>' +
          '</div>' +
          '<p class="cta-thinking__hint">' + esc(config.hint) + '</p>' +
          '<ul class="cta-thinking__steps"></ul>' +
        '</div>' +
      '</div>';
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
    var wrap = createProcessBlock({
      modifier: 'cta-thinking--query',
      title: '正在查询历史资料…',
      doneTitle: '历史资料查询完成',
      hint: '正在连接集团碳账本数据服务，逐步查询多源数据',
      runningStatus: '查询中…',
      doneStatus: '✓ 已返回',
      doneStatusWithPreview: '✓ 已返回 4 条',
    });
    return runProcessSteps(wrap, getQuerySteps(), {
      runningStatus: '查询中…',
      doneStatus: '✓ 已返回',
      doneStatusWithPreview: '✓ 已返回 4 条',
      doneTitle: '历史资料查询完成',
      defaultDelay: 500,
    });
  }

  function runAnalysisPhase() {
    var wrap = createProcessBlock({
      modifier: 'cta-thinking--analysis',
      title: '智能体思考中…',
      doneTitle: '思考完成',
      hint: '基于已查询的历史资料，进行交叉比对与目标测算推理',
      runningStatus: '分析中…',
      doneStatus: '✓ 已完成',
    });
    return runProcessSteps(wrap, getAnalysisSteps(), {
      runningStatus: '分析中…',
      doneStatus: '✓ 已完成',
      doneTitle: '思考完成',
      defaultDelay: 750,
      startDelay: 400,
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
    var indicators = state.indicators.length ? state.indicators.slice() : ['碳排放总量', '碳排放强度'];
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
      capLabel: (CAPABILITIES[state.cap] || CAPABILITIES.formulate).label,
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
          '<div class="cta-report__title">🎯 ' + esc(y) + ' 年 ' + m + ' 月 · 指标目标结果</div>' +
          '<p class="cta-report__intro">已根据所选指标完成目标测算，结果如下：</p>' +
          buildTargetResultTable() +
          '<div class="cta-report__section cta-report__section--report">' +
            '<h3>📄 碳目标报告</h3>' +
            '<p class="cta-report__intro">专业报告含编制依据、基准年分析、差距分析、行业对标、目标分解、减排措施、MRV 方案、风险分析及 7 类图表，支持在线查看。</p>' +
          '</div>' +
          '<div class="cta-report__actions">' +
            '<button type="button" class="cta-report-btn cta-report-btn--primary" data-action="preview">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' +
              '查看报告' +
            '</button>' +
          '</div>' +
          '<p class="cta-report__footer">点击「查看报告」在线查看完整图表与分析。</p>' +
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

    appendUserMessage(text);
    if (inputEl) inputEl.value = '';

    state.loading = true;
    syncSendBtn();

    if (state.cap !== 'formulate') {
      setTimeout(function () {
        ensureChatVisible();
        var wrap = document.createElement('div');
        wrap.className = 'cta-msg is-assistant';
        wrap.innerHTML =
          assistantAvatarHtml() +
          '<div class="cta-msg__bubble">' + esc('已收到您的请求，完整能力开发中。') + '</div>';
        messagesEl.appendChild(wrap);
        state.loading = false;
        syncSendBtn();
        scrollToBottom();
        saveSession();
      }, 600);
      return;
    }

    runQueryPhase().then(function () {
      return runAnalysisPhase();
    }).then(function () {
      appendConclusionMessage();
      state.loading = false;
      syncSendBtn();
    });
  }

  function bindEvents() {
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

    if (messagesEl) {
      messagesEl.addEventListener('click', function (e) {
        var reportBtn = e.target.closest('.cta-report-btn');
        if (reportBtn && window.CarbonTargetReport) {
          e.preventDefault();
          var ctx = buildReportContext();
          if (!ctx) return;
          var action = reportBtn.getAttribute('data-action');
          if (action === 'preview') window.CarbonTargetReport.openPreview(ctx);
          saveSession();
          return;
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
