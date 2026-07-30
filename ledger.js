(function () {
  var regions = [
    { name: "山东", pct: 86, val: "2,180 万t" },
    { name: "新疆", pct: 62, val: "1,420 万t" },
    { name: "山西", pct: 48, val: "980 万t" },
    { name: "广西", pct: 34, val: "640 万t" },
  ];
  var regionEl = document.getElementById("ld-regions");
  if (regionEl) {
    regionEl.innerHTML = regions
      .map(function (r) {
        return (
          '<div class="ld-region__row">' +
          '<span class="ld-region__name">' +
          r.name +
          "</span>" +
          '<div class="ld-region__bar"><div class="ld-region__fill" style="width:' +
          r.pct +
          '%"></div></div>' +
          '<span class="ld-region__val">' +
          r.val +
          "</span></div>"
        );
      })
      .join("");
  }

  var industries = [
    { name: "电力", val: "5,920", sub: "企业 8 家" },
    { name: "化工", val: "210", sub: "企业 4 家" },
    { name: "有色", val: "86", sub: "企业 3 家" },
    { name: "建材", val: "54", sub: "企业 2 家" },
    { name: "钢铁", val: "42", sub: "企业 2 家" },
    { name: "其他", val: "33", sub: "企业 1 家" },
  ];
  var indEl = document.getElementById("ld-industries");
  if (indEl) {
    indEl.innerHTML = industries
      .map(function (i) {
        return (
          '<article class="ld-ind"><p class="ld-ind__name">' +
          i.name +
          '</p><p class="ld-ind__val">' +
          i.val +
          ' <small style="font-size:14px;font-weight:600;color:#8fb0d4">万t</small></p><p class="ld-ind__sub">' +
          i.sub +
          "</p></article>"
        );
      })
      .join("");
  }
})();
