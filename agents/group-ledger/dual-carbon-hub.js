/**
 * 集团碳账本 · 双碳智能体枢纽
 * 左侧历史 / 右侧登录用户 / 中间大对话框 / 下方能力入口
 * 智能问答、对标智能体可用；其余开发中
 */
(function (global) {
  'use strict';

  var CAPS = [
    { id: 'qa', label: '智能问答', hint: '业务问题即问即答', badge: '可用', ready: true, tone: 'qa' },
    { id: 'askData', label: '智能问数', hint: '指标数据查询', badge: '开发中', ready: false },
    { id: 'benchmark', label: '对标智能体', hint: '强度对标与报告', badge: '可用', ready: true, tone: 'bench' },
    { id: 'trade', label: '交易智能体', hint: '碳交易辅助决策', badge: '开发中', ready: false },
    { id: 'portrait', label: '企业画像智能体', hint: '企业碳画像洞察', badge: '开发中', ready: false },
  ];

  var currentView = 'hub';
  var toastTimer = null;

  function profile() {
    return global.DemoSceneProfile || {};
  }

  function hubName() {
    return profile().agentName || '双碳智能体';
  }

  function loginName() {
    var p = profile();
    try {
      var saved = localStorage.getItem('demo_group_ledger_login_user');
      if (saved) return saved;
    } catch (e) {}
    return p.loginUserName || '李工';
  }

  function showToast(msg) {
    var el = document.getElementById('dc-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'dc-toast';
      el.className = 'dc-toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove('is-show');
    }, 2200);
  }

  function syncSidebarBack(view) {
    var back = document.getElementById('demo-scene-back');
    if (!back) return;
    var p = profile();
    if (view === 'benchmark') {
      back.textContent = '← 返回双碳智能体';
      back.setAttribute('href', '#');
      back.setAttribute('data-dc-back', 'hub');
      back.setAttribute('title', '返回双碳智能体');
    } else {
      back.textContent = p.backLabel || '← 返回大屏';
      back.setAttribute('href', p.backHref || '../../ledger.html');
      back.removeAttribute('data-dc-back');
      back.setAttribute('title', p.backLabel || '返回大屏');
    }
  }

  function bindSidebarBack() {
    var back = document.getElementById('demo-scene-back');
    if (!back || back._dcBackBound) return;
    back._dcBackBound = true;
    back.addEventListener('click', function (e) {
      if (back.getAttribute('data-dc-back') !== 'hub') return;
      e.preventDefault();
      setView('hub');
      var hubInput = document.getElementById('dc-hub-input');
      if (hubInput) hubInput.focus();
    });
  }

  function setView(view) {
    currentView = view;
    document.body.classList.remove('dc-view-hub', 'dc-view-benchmark', 'dc-view-qa');
    document.body.classList.add('dc-view-' + view);
    syncSidebarBack(view);

    var accent = document.querySelector('.cta-welcome__accent');
    var desc = document.querySelector('.cta-welcome__desc');
    var brandTitle = document.querySelector('.cta-history__brand-title');
    var p = profile();

    if (view === 'benchmark') {
      if (accent) accent.textContent = '对标智能体';
      if (desc) desc.textContent = '围绕冀东下属企业碳排放强度、生产线对标与标杆差距，生成可落地的对标分析结论。';
      if (brandTitle) brandTitle.textContent = '对标智能体';
      document.title = '对标智能体';
    } else {
      var name = hubName();
      if (accent) accent.textContent = name;
      if (desc && p.agentDesc) desc.textContent = p.agentDesc;
      if (brandTitle) brandTitle.textContent = name;
      document.title = name;
    }

    document.querySelectorAll('.dc-hub-cap').forEach(function (btn) {
      var id = btn.getAttribute('data-cap');
      var on =
        (view === 'qa' && id === 'qa') ||
        (view === 'benchmark' && id === 'benchmark') ||
        (view === 'hub' && false);
      btn.classList.toggle('is-active', on);
    });
  }

  function pushHubToChat(andSend) {
    var hub = document.getElementById('dc-hub-input');
    var input = document.getElementById('cta-input');
    var sendBtn = document.getElementById('cta-send');
    if (!hub) return;
    var q = hub.value.trim();
    if (!q) {
      if (input) input.focus();
      return;
    }
    if (input) {
      input.value = q;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (andSend && sendBtn && !sendBtn.disabled) {
      sendBtn.click();
      hub.value = '';
    } else if (input) {
      input.focus();
    }
  }

  function mountUserBar() {
    var main = document.querySelector('.cta-main');
    if (!main) return;

    var orphan = document.querySelector('#cta-scroll > .dc-user-bar');
    if (orphan) orphan.parentNode.removeChild(orphan);

    if (document.getElementById('dc-user-bar')) return;

    var name = loginName();
    var initial = name.slice(0, 1);
    var bar = document.createElement('div');
    bar.id = 'dc-user-bar';
    bar.className = 'dc-user-bar';
    bar.innerHTML =
      '<div class="dc-user-bar__chip" title="当前登录用户">' +
      '<span class="dc-user-bar__avatar" aria-hidden="true">' +
      initial +
      '</span>' +
      '<span class="dc-user-bar__meta">' +
      '<span class="dc-user-bar__label">当前登录</span>' +
      '<span class="dc-user-bar__name" id="dc-login-user">' +
      name +
      '</span>' +
      '</span>' +
      '</div>';

    main.insertBefore(bar, main.firstChild);
  }

  function mountHub() {
    var welcome = document.querySelector('.cta-welcome');
    if (!welcome || document.getElementById('dc-hub-panel')) return;

    var panel = document.createElement('section');
    panel.id = 'dc-hub-panel';
    panel.className = 'dc-hub-panel';
    panel.setAttribute('aria-label', '双碳智能体能力入口');
    panel.innerHTML =
      '<div class="dc-hub-dialog">' +
      '<label class="dc-hub-dialog__label" for="dc-hub-input">对话</label>' +
      '<div class="dc-hub-dialog__box">' +
      '<textarea id="dc-hub-input" rows="2" placeholder="请输入集团碳账本相关问题，或先选择下方智能体入口…"></textarea>' +
      '<button type="button" class="dc-hub-dialog__go" id="dc-hub-go">发送</button>' +
      '</div>' +
      '</div>' +
      '<div class="dc-hub-caps" id="dc-hub-caps" role="list"></div>';

    var askSection = welcome.querySelector('.cta-welcome__section--ask');
    var desc = welcome.querySelector('.cta-welcome__desc');
    if (desc && askSection) {
      welcome.insertBefore(panel, askSection);
    } else if (desc) {
      desc.parentNode.insertBefore(panel, desc.nextSibling);
    } else {
      welcome.appendChild(panel);
    }

    var capsEl = document.getElementById('dc-hub-caps');
    CAPS.forEach(function (cap) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dc-hub-cap';
      btn.setAttribute('role', 'listitem');
      btn.setAttribute('data-cap', cap.id);
      if (cap.tone === 'qa') btn.classList.add('dc-hub-cap--qa');
      if (cap.tone === 'bench') btn.classList.add('dc-hub-cap--bench');
      if (!cap.ready) {
        btn.classList.add('is-dev');
        btn.setAttribute('aria-disabled', 'true');
        btn.title = '功能开发中';
      }
      btn.innerHTML =
        '<span class="dc-hub-cap__title">' +
        cap.label +
        '</span>' +
        '<span class="dc-hub-cap__hint">' +
        cap.hint +
        '</span>' +
        '<span class="dc-hub-cap__badge">' +
        cap.badge +
        '</span>';
      btn.addEventListener('click', function () {
        if (!cap.ready) {
          showToast(cap.label + '开发中，敬请期待');
          return;
        }
        if (cap.id === 'benchmark') {
          setView('benchmark');
          var input = document.getElementById('cta-input');
          if (input) {
            input.value = '给我进行一下今年的对标分析';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.focus();
            input.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          var search = document.getElementById('gl-kernel-search');
          if (search) search.focus();
          return;
        }
        if (cap.id === 'qa') {
          setView('qa');
          var hubInput = document.getElementById('dc-hub-input');
          if (hubInput) hubInput.focus();
        }
      });
      capsEl.appendChild(btn);
    });

    var hubInput = document.getElementById('dc-hub-input');
    var goBtn = document.getElementById('dc-hub-go');
    if (goBtn) {
      goBtn.addEventListener('click', function () {
        if (currentView === 'hub') setView('qa');
        pushHubToChat(true);
      });
    }
    if (hubInput) {
      hubInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (currentView === 'hub') setView('qa');
          pushHubToChat(true);
        }
      });
    }
  }

  function boot() {
    if (!profile().id || profile().id !== 'group-ledger') return;
    bindSidebarBack();
    mountUserBar();
    mountHub();
    setView('hub');
  }

  global.DualCarbonHub = {
    setView: setView,
    showToast: showToast,
    caps: CAPS,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
