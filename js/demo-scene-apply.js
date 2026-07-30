// Demo scene profile applier.
// Reads window.DemoSceneProfile written by each agents scene-profile.js
// and patches shared shell branding + storage keys.
(function (global) {
  'use strict';

  function applyProfile() {
    var profile = global.DemoSceneProfile;
    if (!profile || !profile.id) return false;

    if (global.BenchmarkMatrix) {
      global.BenchmarkMatrix.agentId = profile.id;
      global.BenchmarkMatrix.agentName = profile.agentName || global.BenchmarkMatrix.agentName;
      if (profile.presetQuestions && profile.presetQuestions.length) {
        global.BenchmarkMatrix.presetQuestions = profile.presetQuestions;
      }
    }

    if (global.BenchmarkBrand) {
      global.BenchmarkBrand.agentDisplayName = profile.agentName || global.BenchmarkBrand.agentDisplayName;
      if (profile.avatarSrc) global.BenchmarkBrand.agentAvatarSrc = profile.avatarSrc;
      if (profile.avatarFallback) global.BenchmarkBrand.agentAvatarFallback = profile.avatarFallback;
      if (profile.reportBrandName) global.BenchmarkBrand.reportBrandName = profile.reportBrandName;
    }

    if (global.BenchmarkSessionStore && profile.sessionStoreKey) {
      global.BenchmarkSessionStore.STORAGE_KEY = profile.sessionStoreKey;
    }

    if (profile.avatarSrc) {
      global.CarbonLedgerPreview = global.CarbonLedgerPreview || {};
      global.CarbonLedgerPreview.agentIconRel = profile.avatarSrc;
      global.CarbonLedgerPreview.agentIconUrl = profile.avatarSrc;
    }

    if (!global.document || !global.document.querySelector) return true;

    var title = profile.agentName || '';
    if (title) global.document.title = title;

    var brandTitle = global.document.querySelector('.cta-history__brand-title');
    if (brandTitle && title) brandTitle.textContent = title;

    var brandDesc = global.document.querySelector('.cta-history__brand-desc');
    if (brandDesc && profile.agentDesc) brandDesc.textContent = profile.agentDesc;

    var accent = global.document.querySelector('.cta-welcome__accent');
    if (accent && title) accent.textContent = title;

    var desc = global.document.querySelector('.cta-welcome__desc');
    if (desc && profile.agentDesc) desc.textContent = profile.agentDesc;

    var welcomeAvatar = global.document.getElementById('cta-welcome-avatar');
    if (welcomeAvatar && profile.avatarSrc) {
      welcomeAvatar.src = profile.avatarSrc;
      welcomeAvatar.alt = title || 'agent';
    }

    var input = global.document.getElementById('cta-input');
    if (input && profile.placeholder) input.setAttribute('placeholder', profile.placeholder);

    var hint = global.document.querySelector('.cta-welcome__section-hint');
    if (hint && profile.welcomeHint) hint.textContent = profile.welcomeHint;

    var qsHint = global.document.querySelector('.cta-quick-start__hint');
    if (qsHint && profile.quickStartHint) qsHint.textContent = profile.quickStartHint;

    var back = global.document.getElementById('demo-scene-back');
    if (back) {
      if (profile.backHref) back.setAttribute('href', profile.backHref);
      if (profile.backLabel) back.textContent = profile.backLabel;
      back.hidden = false;
    }

    return true;
  }

  global.DemoSceneApply = { apply: applyProfile };
  applyProfile();

  if (global.document && global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', applyProfile);
  } else if (global.document) {
    applyProfile();
  }
})(window);
