/**
 * 碳对标智能体 - ECharts 图表渲染
 */
var BenchmarkChart = {
  _instances: {},
  DEFAULT_HEIGHT: 300,

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
      height: this.DEFAULT_HEIGHT
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

    var highlightIndex = typeof data.highlightIndex === 'number' ? data.highlightIndex : -1;
    var avg = data.values.reduce(function (a, b) { return a + b; }, 0) / data.values.length;

    return {
      backgroundColor: 'transparent',
      grid: { left: 80, right: 36, top: 28, bottom: 28, containLabel: false },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(12,28,58,0.92)',
        borderColor: 'rgba(56,120,220,0.3)',
        textStyle: { color: '#e8f0ff', fontSize: 12 }
      },
      xAxis: {
        type: 'value',
        name: data.unit || 'tCO₂/t',
        nameTextStyle: { color: 'rgba(148,180,230,0.6)', fontSize: 11 },
        axisLabel: { color: 'rgba(200,220,255,0.6)', fontSize: 11 },
        splitLine: { lineStyle: { color: 'rgba(56,120,220,0.12)' } }
      },
      yAxis: {
        type: 'category',
        data: data.categories,
        axisLabel: {
          color: 'rgba(200,220,255,0.75)',
          fontSize: 11
        },
        axisLine: { lineStyle: { color: 'rgba(56,120,220,0.25)' } }
      },
      series: [{
        type: 'bar',
        data: data.values.map(function (v, i) {
          var isSelf = i === highlightIndex;
          return {
            value: v,
            itemStyle: {
              color: isSelf
                ? '#38b4ff'
                : v <= avg ? '#6ee7a0' : '#7dd3fc',
              borderRadius: [0, 4, 4, 0]
            },
            label: isSelf ? {
              show: true,
              position: 'right',
              color: '#6ee7a0',
              fontSize: 11,
              formatter: '本企业'
            } : { show: false }
          };
        }),
        barMaxWidth: 22,
        animationDuration: 900
      }]
    };
  },

  barOption: function (data) {
    if (!data || !data.values || !data.categories) return {};
    var avg = data.values.reduce(function (a, b) { return a + b; }, 0) / data.values.length;
    return {
      backgroundColor: 'transparent',
      grid: { left: 48, right: 24, top: 36, bottom: 64 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: data.categories,
        axisLabel: { color: 'rgba(200,220,255,0.7)', fontSize: 11, rotate: 28 }
      },
      yAxis: {
        type: 'value',
        name: data.unit,
        axisLabel: { color: 'rgba(200,220,255,0.6)', fontSize: 11 }
      },
      series: [{
        type: 'bar',
        data: data.values.map(function (v) {
          return { value: v, itemStyle: { color: v <= avg ? '#6ee7a0' : '#7dd3fc' } };
        }),
        barMaxWidth: 36
      }]
    };
  },

  groupBarOption: function (data) {
    if (!data || !data.categories || !data.series) return {};
    return {
      backgroundColor: 'transparent',
      grid: { left: 48, right: 24, top: 40, bottom: 64 },
      tooltip: { trigger: 'axis' },
      legend: {
        top: 0,
        textStyle: { color: 'rgba(200,220,255,0.75)', fontSize: 11 }
      },
      xAxis: {
        type: 'category',
        data: data.categories,
        axisLabel: { color: 'rgba(200,220,255,0.7)', fontSize: 11, rotate: 20 }
      },
      yAxis: {
        type: 'value',
        name: data.unit || '',
        max: 120,
        axisLabel: { color: 'rgba(200,220,255,0.6)', fontSize: 11 }
      },
      series: data.series.map(function (s, idx) {
        return {
          name: s.name,
          type: 'bar',
          data: s.values,
          barMaxWidth: 28,
          itemStyle: { color: idx === 0 ? '#38b4ff' : '#6ee7a0' }
        };
      })
    };
  },

  radarOption: function (data) {
    if (!data || !data.indicators || !data.series) return {};

    return {
      backgroundColor: 'transparent',
      legend: {
        bottom: 0,
        textStyle: { color: 'rgba(200,220,255,0.75)', fontSize: 12 },
        data: data.series.map(function (s) { return s.name; })
      },
      radar: {
        indicator: data.indicators,
        center: ['50%', '46%'],
        radius: '58%',
        axisName: { color: 'rgba(200,220,255,0.7)', fontSize: 11 },
        splitLine: { lineStyle: { color: 'rgba(56,120,220,0.15)' } },
        splitArea: { areaStyle: { color: ['rgba(56,120,220,0.04)', 'rgba(56,120,220,0.08)'] } },
        axisLine: { lineStyle: { color: 'rgba(56,120,220,0.2)' } }
      },
      series: [{
        type: 'radar',
        animationDuration: 900,
        data: data.series.map(function (s, idx) {
          return {
            name: s.name,
            value: s.values,
            areaStyle: { opacity: idx === 0 ? 0.3 : 0.15 },
            lineStyle: { width: 2 },
            itemStyle: { color: idx === 0 ? '#38b4ff' : '#6ee7a0' }
          };
        })
      }]
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
        backgroundColor: '#0a1628'
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
  }
};
