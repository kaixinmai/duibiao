/**
 * 碳对标智能体 - ECharts 图表渲染（白绿主题高对比）
 */
var BenchmarkChart = {
  _instances: {},
  DEFAULT_HEIGHT: 300,

  COLORS: {
    axis: '#344054',
    axisMuted: '#667085',
    split: '#e4efe9',
    self: '#2e90fa',
    peer: '#12b76a',
    tooltipBg: '#ffffff',
    tooltipBorder: '#d8ece2',
    tooltipText: '#101828',
    radarSplit: '#d0d5dd',
    radarAreaA: 'rgba(46, 144, 250, 0.08)',
    radarAreaB: 'rgba(18, 183, 106, 0.06)',
  },

  render: function (containerId, chartType, data) {
    if (typeof echarts === 'undefined') {
      console.warn('[BenchmarkChart] ECharts 未加载，请检查网络或 CDN');
      return null;
    }

    var el = document.getElementById(containerId);
    if (!el) {
      console.warn('[BenchmarkChart] 容器不存在:', containerId);
      return null;
    }

    if (this._instances[containerId]) {
      this._instances[containerId].dispose();
      delete this._instances[containerId];
    }

    el.style.width = '100%';
    el.style.height = this.DEFAULT_HEIGHT + 'px';
    el.style.minHeight = this.DEFAULT_HEIGHT + 'px';
    el.style.display = 'block';

    var parent = el.parentElement;
    var width = el.offsetWidth || (parent && parent.offsetWidth) || 640;
    width = Math.max(width, 360);

    var chart = echarts.init(el, null, {
      renderer: 'canvas',
      width: width,
      height: this.DEFAULT_HEIGHT,
    });
    this._instances[containerId] = chart;

    var option;
    if (chartType === 'rankBar') {
      option = this.rankBarOption(data);
    } else if (chartType === 'groupBar') {
      option = this.groupBarOption(data);
    } else if (chartType === 'bar') {
      option = this.barOption(data);
    } else if (chartType === 'radar') {
      option = this.radarOption(data);
    } else {
      option = this.radarOption(data);
    }

    chart.setOption(option, true);

    var self = this;
    setTimeout(function () {
      if (self._instances[containerId]) {
        self._instances[containerId].resize();
      }
    }, 80);

    return chart;
  },

  rankBarOption: function (data) {
    if (!data || !data.values || !data.categories) return {};
    var C = this.COLORS;
    var highlightIndex = typeof data.highlightIndex === 'number' ? data.highlightIndex : -1;
    var avg = data.values.reduce(function (a, b) { return a + b; }, 0) / data.values.length;

    return {
      backgroundColor: 'transparent',
      grid: { left: 88, right: 40, top: 28, bottom: 28, containLabel: false },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: C.tooltipBg,
        borderColor: C.tooltipBorder,
        textStyle: { color: C.tooltipText, fontSize: 14 },
      },
      xAxis: {
        type: 'value',
        name: data.unit || 'tCO₂/t',
        nameTextStyle: { color: C.axisMuted, fontSize: 13 },
        axisLabel: { color: C.axis, fontSize: 13 },
        splitLine: { lineStyle: { color: C.split } },
      },
      yAxis: {
        type: 'category',
        data: data.categories,
        axisLabel: { color: C.axis, fontSize: 13 },
        axisLine: { lineStyle: { color: C.split } },
      },
      series: [{
        type: 'bar',
        data: data.values.map(function (v, i) {
          var isSelf = i === highlightIndex;
          return {
            value: v,
            itemStyle: {
              color: isSelf ? C.self : v <= avg ? C.peer : '#53b1fd',
              borderRadius: [0, 4, 4, 0],
            },
            label: isSelf
              ? {
                  show: true,
                  position: 'right',
                  color: C.peer,
                  fontSize: 13,
                  fontWeight: 700,
                  formatter: '本企业',
                }
              : { show: false },
          };
        }),
        barMaxWidth: 22,
        animationDuration: 900,
      }],
    };
  },

  barOption: function (data) {
    if (!data || !data.values || !data.categories) return {};
    var C = this.COLORS;
    var avg = data.values.reduce(function (a, b) { return a + b; }, 0) / data.values.length;
    return {
      backgroundColor: 'transparent',
      grid: { left: 52, right: 24, top: 36, bottom: 64 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: C.tooltipBg,
        borderColor: C.tooltipBorder,
        textStyle: { color: C.tooltipText, fontSize: 14 },
      },
      xAxis: {
        type: 'category',
        data: data.categories,
        axisLabel: { color: C.axis, fontSize: 13, rotate: 28 },
      },
      yAxis: {
        type: 'value',
        name: data.unit,
        nameTextStyle: { color: C.axisMuted, fontSize: 13 },
        axisLabel: { color: C.axis, fontSize: 13 },
        splitLine: { lineStyle: { color: C.split } },
      },
      series: [{
        type: 'bar',
        data: data.values.map(function (v) {
          return { value: v, itemStyle: { color: v <= avg ? C.peer : '#53b1fd' } };
        }),
        barMaxWidth: 36,
      }],
    };
  },

  groupBarOption: function (data) {
    if (!data || !data.categories || !data.series) return {};
    var C = this.COLORS;
    return {
      backgroundColor: 'transparent',
      grid: { left: 52, right: 24, top: 44, bottom: 64 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: C.tooltipBg,
        borderColor: C.tooltipBorder,
        textStyle: { color: C.tooltipText, fontSize: 14 },
      },
      legend: {
        top: 0,
        textStyle: { color: C.axis, fontSize: 14 },
      },
      xAxis: {
        type: 'category',
        data: data.categories,
        axisLabel: { color: C.axis, fontSize: 13, rotate: 20 },
      },
      yAxis: {
        type: 'value',
        name: data.unit || '',
        max: 120,
        nameTextStyle: { color: C.axisMuted, fontSize: 13 },
        axisLabel: { color: C.axis, fontSize: 13 },
        splitLine: { lineStyle: { color: C.split } },
      },
      series: data.series.map(function (s, idx) {
        return {
          name: s.name,
          type: 'bar',
          data: s.values,
          barMaxWidth: 28,
          itemStyle: { color: idx === 0 ? C.self : C.peer },
        };
      }),
    };
  },

  radarOption: function (data) {
    if (!data || !data.indicators || !data.series) return {};
    var C = this.COLORS;

    return {
      backgroundColor: 'transparent',
      legend: {
        bottom: 0,
        textStyle: { color: C.axis, fontSize: 14 },
        data: data.series.map(function (s) { return s.name; }),
      },
      radar: {
        indicator: data.indicators,
        center: ['50%', '46%'],
        radius: '58%',
        axisName: { color: C.axis, fontSize: 13 },
        splitLine: { lineStyle: { color: C.radarSplit } },
        splitArea: { areaStyle: { color: [C.radarAreaA, C.radarAreaB] } },
        axisLine: { lineStyle: { color: C.radarSplit } },
      },
      series: [{
        type: 'radar',
        animationDuration: 900,
        data: data.series.map(function (s, idx) {
          return {
            name: s.name,
            value: s.values,
            areaStyle: { opacity: idx === 0 ? 0.28 : 0.16 },
            lineStyle: { width: 2 },
            itemStyle: { color: idx === 0 ? C.self : C.peer },
          };
        }),
      }],
    };
  },

  resize: function (containerId) {
    if (this._instances[containerId]) {
      this._instances[containerId].resize();
    }
  },

  resizeAll: function () {
    Object.keys(this._instances).forEach(function (id) {
      if (this._instances[id]) this._instances[id].resize();
    }.bind(this));
  },

  getDataURL: function (containerId) {
    if (!this._instances[containerId]) return '';
    try {
      return this._instances[containerId].getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
    } catch (e) {
      return '';
    }
  },

  disposeAll: function () {
    Object.keys(this._instances).forEach(function (id) {
      if (this._instances[id]) this._instances[id].dispose();
    });
    this._instances = {};
  },
};
