(function () {
  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tickClock() {
    var el = document.getElementById("ck-clock");
    if (!el) return;
    var d = new Date();
    el.textContent =
      pad(d.getHours()) +
      ":" +
      pad(d.getMinutes()) +
      ":" +
      pad(d.getSeconds()) +
      "  " +
      d.getFullYear() +
      "." +
      pad(d.getMonth() + 1) +
      "." +
      pad(d.getDate());
  }

  tickClock();
  setInterval(tickClock, 1000);

  var months = [
    ["1月", "done", "已完成"],
    ["2月", "done", "已完成"],
    ["3月", "done", "已完成"],
    ["4月", "done", "已完成"],
    ["5月", "done", "已完成"],
    ["6月", "done", "已完成"],
    ["7月", "ready", "已生成"],
    ["8月", "wait", "未生成"],
    ["9月", "wait", "未生成"],
    ["10月", "wait", "未生成"],
    ["11月", "wait", "未生成"],
    ["12月", "wait", "未生成"],
  ];
  var monthWrap = document.getElementById("ck-months");
  if (monthWrap) {
    monthWrap.innerHTML = months
      .map(function (m) {
        return (
          '<div class="ck-month is-' +
          m[1] +
          '"><span class="ck-month__name">' +
          m[0] +
          '</span><span class="ck-month__status">' +
          m[2] +
          "</span></div>"
        );
      })
      .join("");
  }

  if (typeof echarts === "undefined") return;

  var monthsLabel = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  var textStyle = { fontSize: 14, color: "#475467" };
  var axisLabel = { fontSize: 14, color: "#667085" };

  function init(id, option) {
    var el = document.getElementById(id);
    if (!el) return null;
    var chart = echarts.init(el);
    chart.setOption(option);
    window.addEventListener("resize", function () {
      chart.resize();
    });
    return chart;
  }

  init("chart-emit", {
    grid: { left: 48, right: 16, top: 28, bottom: 32 },
    tooltip: { trigger: "axis", textStyle: { fontSize: 15 } },
    xAxis: { type: "category", data: monthsLabel, axisLabel: axisLabel },
    yAxis: { type: "value", name: "万t", nameTextStyle: textStyle, axisLabel: axisLabel, splitLine: { lineStyle: { color: "#e8f0ec" } } },
    series: [
      {
        type: "bar",
        data: [4.2, 4.5, 4.8, 4.6, 5.1, 5.0, 4.9, 4.7, 4.4, 4.3, 4.1, 4.0],
        itemStyle: { color: "#00b86b", borderRadius: [4, 4, 0, 0] },
        barWidth: "45%",
      },
    ],
  });

  init("chart-intensity", {
    grid: { left: 48, right: 16, top: 28, bottom: 32 },
    tooltip: { trigger: "axis", textStyle: { fontSize: 15 } },
    legend: { data: ["实际", "目标"], textStyle: textStyle, top: 0 },
    xAxis: { type: "category", data: monthsLabel, axisLabel: axisLabel },
    yAxis: { type: "value", min: 1.5, max: 2.0, axisLabel: axisLabel, splitLine: { lineStyle: { color: "#e8f0ec" } } },
    series: [
      {
        name: "实际",
        type: "line",
        smooth: true,
        data: [1.82, 1.79, 1.77, 1.75, 1.74, 1.73, 1.72, 1.71, 1.71, 1.7, 1.7, 1.69],
        itemStyle: { color: "#00b86b" },
        lineStyle: { width: 3 },
      },
      {
        name: "目标",
        type: "line",
        smooth: true,
        data: [1.8, 1.8, 1.78, 1.78, 1.76, 1.76, 1.74, 1.74, 1.72, 1.72, 1.7, 1.7],
        itemStyle: { color: "#f79009" },
        lineStyle: { type: "dashed", width: 2 },
      },
    ],
  });

  init("chart-indicator", {
    grid: { left: 48, right: 16, top: 20, bottom: 32 },
    tooltip: { trigger: "axis", textStyle: { fontSize: 15 } },
    xAxis: {
      type: "category",
      data: ["焦炭", "煤粉", "天然气", "柴油", "其他"],
      axisLabel: axisLabel,
    },
    yAxis: { type: "value", axisLabel: axisLabel, splitLine: { lineStyle: { color: "#e8f0ec" } } },
    series: [
      {
        type: "bar",
        data: [28, 22, 14, 9, 6],
        itemStyle: { color: "#22c7a3", borderRadius: [4, 4, 0, 0] },
        barWidth: "40%",
      },
    ],
  });

  init("chart-project", {
    tooltip: { trigger: "item", textStyle: { fontSize: 15 } },
    legend: { bottom: 0, textStyle: textStyle },
    series: [
      {
        type: "pie",
        radius: ["42%", "68%"],
        center: ["50%", "46%"],
        label: { fontSize: 14, color: "#344054" },
        data: [
          { value: 2, name: "筹备中", itemStyle: { color: "#2e90fa" } },
          { value: 1, name: "建设中", itemStyle: { color: "#f79009" } },
          { value: 1, name: "已完工", itemStyle: { color: "#00b86b" } },
          { value: 1, name: "已终止", itemStyle: { color: "#98a2b3" } },
        ],
      },
    ],
    graphic: {
      type: "text",
      left: "center",
      top: "42%",
      style: { text: "5", fill: "#101828", fontSize: 28, fontWeight: 700, textAlign: "center" },
    },
  });

  init("chart-trade", {
    grid: { left: 48, right: 40, top: 36, bottom: 32 },
    tooltip: { trigger: "axis", textStyle: { fontSize: 15 } },
    legend: { data: ["成交量", "均价"], textStyle: textStyle, top: 0 },
    xAxis: { type: "category", data: ["1月", "2月", "3月", "4月", "5月", "6月", "7月"], axisLabel: axisLabel },
    yAxis: [
      { type: "value", name: "吨", nameTextStyle: textStyle, axisLabel: axisLabel, splitLine: { lineStyle: { color: "#e8f0ec" } } },
      { type: "value", name: "元", nameTextStyle: textStyle, axisLabel: axisLabel, splitLine: { show: false } },
    ],
    series: [
      {
        name: "成交量",
        type: "bar",
        data: [1200, 980, 1500, 1320, 1600, 1480, 1700],
        itemStyle: { color: "rgba(0,184,107,0.35)" },
      },
      {
        name: "均价",
        type: "line",
        yAxisIndex: 1,
        data: [72, 74, 71, 76, 78, 75, 79],
        itemStyle: { color: "#00b86b" },
        lineStyle: { width: 3 },
      },
    ],
  });
})();
