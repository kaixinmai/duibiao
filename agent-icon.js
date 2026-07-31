/**
 * 双碳智能体头像 — 全局统一配置与 DOM 补丁
 */
(function (global) {
  'use strict';

  var ICON_VERSION = '4';
  var ICON_REL = 'assets/dual-carbon-agent-avatar.png?v=' + ICON_VERSION;
  var LEGACY_PATTERN = /yitai-logo|chutian-logo|chutian_logo|carbon-agent-icon|carbon-agent-avatar|dual-carbon-agent-avatar/;

  function getPreview() {
    return global.CarbonLedgerPreview || {};
  }

  function pageBaseDir() {
    var path = global.location.pathname || '';
    return path.replace(/[^/]*$/, '');
  }

  function resolveRelativeIconUrl() {
    return pageBaseDir() + ICON_REL;
  }

  function resolveIconUrl() {
    var preview = getPreview();
    var candidate = preview.agentIconUrl || preview.agentIconRel || ICON_REL;

    if (/^https?:\/\//i.test(candidate)) {
      try {
        var pageOrigin = global.location.origin;
        var iconOrigin = new URL(candidate, pageOrigin).origin;
        if (iconOrigin === pageOrigin) return candidate;
      } catch (e) { /* fall through */ }
      return resolveRelativeIconUrl();
    }

    if (candidate.indexOf('assets/') === 0) {
      return pageBaseDir() + candidate;
    }

    return candidate;
  }

  function shouldPatchImg(img) {
    var src = img.getAttribute('src') || '';
    return LEGACY_PATTERN.test(src);
  }

  function patchRoot(root) {
    var scope = root || global.document;
    if (!scope || !scope.querySelectorAll) return;
    var url = resolveIconUrl();
    scope.querySelectorAll('img').forEach(function (img) {
      if (shouldPatchImg(img)) img.src = url;
    });
  }

  global.CarbonLedgerAgentIcon = {
    version: ICON_VERSION,
    rel: ICON_REL,
    getUrl: resolveIconUrl,
    patchAll: patchRoot,
    watch: function (root) {
      if (!root || !global.MutationObserver) return null;
      var observer = new global.MutationObserver(function () {
        patchRoot(root);
      });
      observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
      return observer;
    },
  };

  function boot() {
    patchRoot(global.document);
    var root = global.document.getElementById('root');
    if (root) global.CarbonLedgerAgentIcon.watch(root);
  }

  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
