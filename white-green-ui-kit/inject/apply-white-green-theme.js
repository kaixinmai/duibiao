/**
 * 白绿 UI Kit · 一键注入
 * 合作方只需在问答详情页 HTML 的 </head> 前加入：
 *   <script src="./white-green-ui-kit/inject/apply-white-green-theme.js"></script>
 * 或按 README 手动挂三个 CSS link（推荐手动，便于控制顺序）。
 *
 * 本脚本会相对自身路径加载 ../css 下三套样式，插到 document.head 末尾，
 * 从而覆盖原 dist 内深蓝科技风 CSS（不改业务 JS / 布局结构）。
 */
(function () {
  if (window.__GC_WHITE_GREEN_APPLIED__) return;
  window.__GC_WHITE_GREEN_APPLIED__ = true;

  var current = document.currentScript;
  var base = "./white-green-ui-kit/css/";
  if (current && current.src) {
    try {
      var u = new URL(current.src, window.location.href);
      base = u.href.replace(/\/inject\/[^/]+$/, "/css/");
    } catch (e) {}
  }

  var sheets = [
    "theme-green.css",
    "theme-green-overrides.css",
    "cta-shell-green.css",
  ];

  sheets.forEach(function (name) {
    var id = "gc-wg-" + name.replace(/\.css$/, "");
    if (document.getElementById(id)) return;
    var link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = base + name;
    document.head.appendChild(link);
  });
})();
