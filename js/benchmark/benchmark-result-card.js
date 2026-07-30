/**
 * 碳对标智能体 - 结果卡片
 */
var BenchmarkResultCard = {
  _payloads: {},

  storePayload: function (chartId, payload) {
    this._payloads[chartId] = payload;
  },

  getPayload: function (chartId) {
    return this._payloads[chartId] || null;
  },

  getChartSpecs: function (result, baseChartId) {
    if (result.charts && result.charts.length) {
      return result.charts.map(function (c, i) {
        return {
          id: baseChartId + (i === 0 ? '' : '_' + i),
          type: c.type,
          data: c.data,
          title: c.title || ''
        };
      });
    }
    return [{
      id: baseChartId,
      type: result.chartType || 'rankBar',
      data: result.chartData,
      title: result.chartType === 'radar' ? '多维度差距雷达图' : '碳强度行业排名'
    }];
  },

  renderChartsHTML: function (specs) {
    return specs.map(function (spec) {
      return '<div class="benchmark-result-card__chart-block">' +
        (spec.title ? '<div class="benchmark-result-card__chart-title">' + BenchmarkResultCard.escape(spec.title) + '</div>' : '') +
        '<div class="benchmark-result-card__chart">' +
          '<div class="benchmark-chart" id="' + spec.id + '"></div>' +
        '</div>' +
      '</div>';
    }).join('');
  },

  renderRankingList: function (list, ranking) {
    if (!list || !list.length) return '';

    var items = list.map(function (item) {
      var cls = item.isSelf ? ' benchmark-rank-item--self' : '';
      var divider = item.isDivider ? ' benchmark-rank-item--divider' : '';
      return '<li class="benchmark-rank-item' + cls + divider + '">' +
        '<span class="benchmark-rank-item__no">' + item.rank + '</span>' +
        '<span class="benchmark-rank-item__name">' + BenchmarkResultCard.escape(item.name) + '</span>' +
        '<span class="benchmark-rank-item__val">' + item.intensity + ' ' + (item.unit || 'tCO₂/t') + '</span>' +
      '</li>';
    }).join('');

    var head = ranking
      ? '<div class="benchmark-rank-list__head">' + (typeof BenchmarkDataService !== 'undefined' ? BenchmarkDataService.DISPLAY.SELF : '河南钢铁集团') + ' 排名 <strong>第 ' + ranking.rank + ' / ' + ranking.total + ' 名</strong> · 超越 <strong>' + ranking.percentile + '%</strong> 同行</div>'
      : '';

    return '<div class="benchmark-rank-list">' +
      '<div class="benchmark-rank-list__title">全国碳市场钢铁企业碳强度排名（232家）</div>' +
      head +
      '<ul class="benchmark-rank-list__items">' + items + '</ul>' +
    '</div>';
  },

  renderDashboard: function (dashboard) {
    if (!dashboard || !dashboard.cards || !dashboard.cards.length) return '';
    var cards = dashboard.cards.map(function (c) {
      var trend = c.trend ? '<span class="benchmark-dash-card__trend">' + BenchmarkResultCard.escape(c.trend) + '</span>' : '';
      var sub = c.sub ? '<div class="benchmark-dash-card__sub">' + BenchmarkResultCard.escape(c.sub) + '</div>' : '';
      var bench = c.benchmark ? '<div class="benchmark-dash-card__sub">' + BenchmarkResultCard.escape(c.benchmark) + '</div>' : '';
      return '<div class="benchmark-dash-card">' +
        '<div class="benchmark-dash-card__label">' + BenchmarkResultCard.escape(c.label) + trend + '</div>' +
        '<div class="benchmark-dash-card__value">' + BenchmarkResultCard.escape(String(c.value)) +
          (c.unit ? '<span class="benchmark-dash-card__unit">' + BenchmarkResultCard.escape(c.unit) + '</span>' : '') +
        '</div>' + sub + bench +
        (c.source ? '<div class="benchmark-dash-card__source">来源：' + BenchmarkResultCard.escape(c.source) + '</div>' : '') +
      '</div>';
    }).join('');

    return '<div class="benchmark-dashboard">' +
      '<div class="benchmark-dashboard__head">' +
        '<span class="benchmark-dashboard__title">' + BenchmarkResultCard.escape(dashboard.enterprise) + ' · ' + BenchmarkResultCard.escape(dashboard.period) + ' 核心指标</span>' +
        '<span class="benchmark-dashboard__hint">产量 · 碳排放 · 强度 · 配额 · 排污 · 碳价</span>' +
      '</div>' +
      '<div class="benchmark-dashboard__grid">' + cards + '</div>' +
    '</div>';
  },

  renderMultiDimTable: function (multiDim) {
    if (!multiDim || !multiDim.rows || !multiDim.rows.length) return '';
    var trs = multiDim.rows.map(function (r) {
      return '<tr>' +
        '<td>' + BenchmarkResultCard.escape(r.metric) + '</td>' +
        '<td class="is-self"><strong>' + r.self + '</strong> ' + BenchmarkResultCard.escape(r.unit) + '</td>' +
        '<td>' + r.benchmark + ' ' + BenchmarkResultCard.escape(r.unit) + '</td>' +
        '<td>' + r.avg + ' ' + BenchmarkResultCard.escape(r.unit) + '</td>' +
        '<td>' + BenchmarkResultCard.escape(r.gap) + '</td>' +
      '</tr>';
    }).join('');

    return '<div class="benchmark-multidim">' +
      '<div class="benchmark-multidim__title">' + BenchmarkResultCard.escape(multiDim.period) + ' 多维指标对标表</div>' +
      '<div class="benchmark-result-card__table-wrap">' +
        '<table class="benchmark-result-card__table benchmark-multidim__table">' +
          '<thead><tr>' +
            '<th>指标</th>' +
            '<th>' + BenchmarkResultCard.escape(multiDim.selfName) + '</th>' +
            '<th>' + BenchmarkResultCard.escape(multiDim.benchmarkName) + '</th>' +
            '<th>' + BenchmarkResultCard.escape(multiDim.avgName) + '</th>' +
            '<th>研判</th>' +
          '</tr></thead>' +
          '<tbody>' + trs + '</tbody>' +
        '</table>' +
      '</div>' +
    '</div>';
  },

  renderRecommendations: function (tips) {
    if (!tips || !tips.length) return '';
    var items = tips.map(function (t, i) {
      return '<li><span class="benchmark-result-card__tip-index">' + (i + 1) + '</span>' + BenchmarkResultCard.escape(t) + '</li>';
    }).join('');
    return '<div class="benchmark-result-card__tips">' +
      '<div class="benchmark-result-card__tips-title">降碳建议</div>' +
      '<ul class="benchmark-result-card__tips-list">' + items + '</ul>' +
    '</div>';
  },

  renderTable: function (tableRows, unit, chartId) {
    if (!tableRows || !tableRows.length) return '';
    var summary = tableRows[0] && tableRows[0].isSummary ? tableRows[0] : null;
    var dataRows = summary ? tableRows.slice(1) : tableRows;

    var summaryHTML = summary
      ? '<div class="benchmark-result-card__summary">' +
          '<span>排名 <strong>第 ' + summary.rank + ' / ' + summary.total + ' 名</strong></span>' +
          '<span>评级 <strong>' + (summary.grade || 'B+') + ' 级</strong></span>' +
          '<span>行业前 <strong>' + (summary.topPercent || Math.round(summary.rank / summary.total * 100)) + '%</strong></span>' +
          '<span>强度 <strong>' + summary.intensity + ' ' + (summary.unit || unit) + '</strong></span>' +
        '</div>'
      : '';

    var trs = dataRows.map(function (row, idx) {
      var noteCell;
      if (row.isSelf) {
        noteCell = '河南钢铁集团';
      } else if (row.isBenchmark) {
        noteCell = '<span class="benchmark-table-ref">' +
          '<span class="benchmark-table-ref__label">对标参考</span>' +
          '<button type="button" class="benchmark-compare-btn" data-action="generate-compare-report" ' +
            'data-chart-id="' + BenchmarkResultCard.escape(chartId || '') + '" ' +
            'data-row-index="' + idx + '" ' +
            'title="生成企业间对标分析报告" aria-label="生成企业间对标分析报告">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 16V9"/><path d="M12 20V5"/><path d="M17 14v-3"/></svg>' +
          '</button></span>';
      } else {
        noteCell = '行业参考';
      }
      return '<tr' + (row.isSelf ? ' class="is-self"' : '') + '>' +
        '<td>' + BenchmarkResultCard.escape(row.name) + '</td>' +
        '<td>' + row.intensity + ' ' + (row.unit || unit) + '</td>' +
        '<td>' + noteCell + '</td>' +
      '</tr>';
    }).join('');

    return summaryHTML +
      '<div class="benchmark-result-card__table-wrap">' +
        '<table class="benchmark-result-card__table">' +
          '<thead><tr><th>对标对象</th><th>碳排放强度</th><th>说明</th></tr></thead>' +
          '<tbody>' + trs + '</tbody>' +
        '</table>' +
      '</div>';
  },

  renderActions: function (chartId) {
    return '<div class="benchmark-msg__actions" data-chart-id="' + chartId + '">' +
      '<button type="button" class="benchmark-action-btn benchmark-action-btn--primary" data-action="preview-report" data-chart-id="' + chartId + '" title="在新标签页查看智能对标分析报告">查看对标分析报告</button>' +
      '<button type="button" class="benchmark-action-btn" data-action="download-report" data-chart-id="' + chartId + '" title="导出智能对标分析报告（HTML）">导出对标分析报告</button>' +
      '<button type="button" class="benchmark-action-btn benchmark-action-btn--ghost" data-action="view-history" title="查看已保存的对标记录">历史记录</button>' +
    '</div>';
  },

  appendTo: function (body, result, chartId) {
    var specs = this.getChartSpecs(result, chartId);
    var multiDimHTML = result.multiDimCompare ? this.renderMultiDimTable(result.multiDimCompare) : '';
    var dashboardHTML = result.dashboardMetrics ? this.renderDashboard(result.dashboardMetrics) : '';
    var tipsHTML = result.recommendations ? this.renderRecommendations(result.recommendations) : '';
    var rankListHTML = result.rankingList
      ? this.renderRankingList(result.rankingList, result.rankingMeta)
      : (result.rankingMeta ? this.renderRankingList(
          BenchmarkDataService.buildRankingList(result.rankingMeta),
          result.rankingMeta
        ) : '');
    var tableHTML = result.tableRows ? this.renderTable(result.tableRows, result.chartData && result.chartData.unit, chartId) : '';

    var card = document.createElement('div');
    card.className = 'benchmark-result-card';
    card.setAttribute('data-chart-id', chartId);
    card.innerHTML = dashboardHTML + multiDimHTML + tipsHTML + rankListHTML + this.renderChartsHTML(specs) + tableHTML;

    body.appendChild(card);
    body.insertAdjacentHTML('beforeend', this.renderActions(chartId));

    this.storePayload(chartId, {
      result: result,
      chartSpecs: specs,
      summary: typeof BenchmarkSlotFilling !== 'undefined' ? BenchmarkSlotFilling.buildSummary() : '',
      generatedAt: new Date().toISOString()
    });

    this.mountCharts(specs);
  },

  mountCharts: function (specs) {
    if (typeof BenchmarkChart === 'undefined' || !specs || !specs.length) return;

    specs.forEach(function (spec, index) {
      setTimeout(function () {
        BenchmarkChart.render(spec.id, spec.type, spec.data);
        setTimeout(function () {
          BenchmarkChart.resize(spec.id);
        }, 100);
      }, 150 + index * 200);
    });
  },

  mountChart: function (chartId, result) {
    this.mountCharts(this.getChartSpecs(result, chartId));
  },

  getCompareTargetRow: function (chartId, rowIndex) {
    var payload = this.getPayload(chartId);
    if (!payload || !payload.result || !payload.result.tableRows) return null;
    var rows = payload.result.tableRows.filter(function (r) { return !r.isSummary; });
    return rows[rowIndex] || null;
  },

  escape: function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
};
