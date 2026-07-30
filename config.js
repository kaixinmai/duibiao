/**
 * 碳目标智能体组件包 — 轻量运行时配置（替代 local-preview.js）
 * 可按项目需要修改头像路径等配置。
 */
(function (global) {
  var ICON_VERSION = "4";
  var ICON_REL = "assets/dual-carbon-agent-avatar.png?v=" + ICON_VERSION;

  function pageBaseDir() {
    var pathname = global.location.pathname || "";
    return pathname.replace(/[^/]*$/, "");
  }

  function resolveIconUrl() {
    if (global.location.protocol === "file:") {
      return ICON_REL;
    }
    return global.location.origin + pageBaseDir() + ICON_REL;
  }

  global.CarbonLedgerPreview = {
    agentIconVersion: ICON_VERSION,
    agentIconRel: ICON_REL,
    agentIconUrl: resolveIconUrl(),
  };
})(window);
