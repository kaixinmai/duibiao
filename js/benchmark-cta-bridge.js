/**
 * 数据对标智能体 — CTA 壳层与碳对标业务桥接
 */
(function () {
  'use strict';

  var ctx = {
    messagesEl: null,
    scrollEl: null,
    esc: function (s) { return String(s || ''); },
    assistantAvatarHtml: function () { return ''; },
    userAvatarHtml: function () { return ''; },
    saveSession: function () {},
    ensureChatVisible: function () {},
    getAgentName: function () { return '数据对标智能体'; },
    getLastConfidence: function () { return null; },
  };

  function escapeHTML(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatMarkdown(text) {
    var raw = String(text || '');
    var blocks = raw.split(/\n{2,}/);
    var htmlParts = blocks.map(function (block) {
      var lines = block.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
      var isSep = function (line) { return /^[\|\s:\-]+$/.test(line); };
      var looksLikeTable = lines.length >= 2 &&
        lines[0].indexOf('|') >= 0 &&
        isSep(lines[1]);

      if (looksLikeTable) {
        var dataLines = lines.filter(function (line) { return !isSep(line); });
        if (dataLines.length >= 2) {
          var parseCells = function (line) {
            return line.replace(/^\|/, '').replace(/\|$/, '').split('|').map(function (c) {
              return c.trim();
            });
          };
          var head = parseCells(dataLines[0]);
          var body = dataLines.slice(1);
          var thead = '<thead><tr>' + head.map(function (h) {
            return '<th>' + escapeHTML(h).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') + '</th>';
          }).join('') + '</tr></thead>';
          var tbody = '<tbody>' + body.map(function (row) {
            return '<tr>' + parseCells(row).map(function (cell) {
              return '<td>' + escapeHTML(cell).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') + '</td>';
            }).join('') + '</tr>';
          }).join('') + '</tbody>';
          return '<div class="benchmark-md-table-wrap"><table class="benchmark-md-table">' + thead + tbody + '</table></div>';
        }
      }

      return escapeHTML(block)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
    });
    return htmlParts.join('<br><br>');
  }

  function scrollToBottom() {
    if (ctx.scrollEl) ctx.scrollEl.scrollTop = ctx.scrollEl.scrollHeight;
    requestAnimationFrame(function () {
      if (ctx.scrollEl) ctx.scrollEl.scrollTop = ctx.scrollEl.scrollHeight;
    });
  }

  function confidenceBadgeHtml() {
    var confidence = ctx.getLastConfidence && ctx.getLastConfidence();
    if (confidence && window.ConfidenceCalculator && window.ConfidenceCalculator.badgeHtml) {
      return window.ConfidenceCalculator.badgeHtml(confidence);
    }
    return '';
  }

  window.BenchmarkCtaBridge = {
    configure: function (options) {
      Object.assign(ctx, options || {});
    },
  };

  window.BenchmarkAgent = {
    phase: 'chat',
    messageId: 0,
    messages: [],

    scrollToBottom: scrollToBottom,

    updateSlotTags: function () {
      var container = document.getElementById('benchmarkSlotTags');
      if (!container || typeof BenchmarkSlotFilling === 'undefined') return;
      var s = BenchmarkSlotFilling.getSlots();
      var tags = [];
      if (s.functionType) tags.push(BenchmarkMatrix.getLabel('functionTypes', s.functionType));
      if (s.timeDimension) tags.push(BenchmarkMatrix.getLabel('timeDimensions', s.timeDimension));
      if (s.timeValue) tags.push(s.timeValue);
      if (s.industry) tags.push(s.industry);
      if (s.spaceDimension) tags.push(s.spaceDimension === 'national' ? '全国' : (s.region || '区域'));
      if (s.objectDimension) tags.push(BenchmarkMatrix.getLabel('objectDimensions', s.objectDimension));

      container.innerHTML = tags.length
        ? tags.map(function (t) { return '<span class="benchmark-slot-tag">' + escapeHTML(t) + '</span>'; }).join('')
        : '<span class="benchmark-slot-tag benchmark-slot-tag--empty">参数收集中…</span>';
      container.hidden = false;
    },

    updateSaveStatus: function () {
      var el = document.getElementById('benchmarkSaveStatus');
      if (!el) return;
      el.hidden = false;
      el.className = 'benchmark-save-status benchmark-save-status--saved';
      el.textContent = '分析进度已自动保存';
    },

    refreshReportActions: function () {},

    appendUserMsg: function (text) {
      this.messages.push({ role: 'user', content: text });
    },

    appendAssistantMsg: function (text, withChart, chartType, chartData, options) {
      options = options || {};
      ctx.ensureChatVisible();
      this.messageId += 1;
      var chartId = 'benchmarkChart_' + this.messageId;
      var agentName = ctx.getAgentName();
      var confHtml = withChart && options.fullResult ? confidenceBadgeHtml() : '';

      var wrap = document.createElement('div');
      wrap.className = 'cta-msg is-assistant cta-msg--full';
      wrap.innerHTML =
        ctx.assistantAvatarHtml() +
        '<div class="cta-msg__bubble cta-msg__bubble--wide">' +
          '<div class="benchmark-msg__meta benchmark-msg__meta--agent">' + escapeHTML(agentName) + '</div>' +
          (confHtml ? '<div class="benchmark-result-card__confidence">' + confHtml + '</div>' : '') +
          '<div class="benchmark-msg__bubble">' + formatMarkdown(text) + '</div>' +
        '</div>';

      ctx.messagesEl.appendChild(wrap);
      this.messages.push({ role: 'assistant', content: text });

      var bubbleHost = wrap.querySelector('.cta-msg__bubble');
      if (withChart && options.fullResult && typeof BenchmarkResultCard !== 'undefined' && bubbleHost) {
        BenchmarkResultCard.appendTo(bubbleHost, options.fullResult, chartId);
      } else if (withChart && chartData && typeof BenchmarkChart !== 'undefined' && bubbleHost) {
        var chartWrap = document.createElement('div');
        chartWrap.className = 'benchmark-chart-wrap';
        chartWrap.innerHTML = '<div class="benchmark-chart" id="' + chartId + '"></div>';
        bubbleHost.appendChild(chartWrap);
        if (typeof BenchmarkResultCard !== 'undefined') {
          bubbleHost.insertAdjacentHTML('beforeend', BenchmarkResultCard.renderActions(chartId));
          BenchmarkResultCard.storePayload(chartId, {
            result: { text: text, chartData: chartData, chartType: chartType },
            summary: options.summary || '',
          });
          BenchmarkResultCard.mountChart(chartId, { chartType: chartType, chartData: chartData });
        }
      }

      scrollToBottom();
      ctx.saveSession();
      this.updateSaveStatus();
    },

    deliverResult: function (result) {
      /* 彻底禁用追问：即便收到 ask 类型也强制直接出分析结果 */
      if (result && result.type === 'ask') {
        var q = (typeof BenchmarkSlotFilling !== 'undefined' && BenchmarkSlotFilling.slots.userQuestion) || '';
        if (typeof BenchmarkDataService !== 'undefined' && typeof BenchmarkSlotFilling !== 'undefined') {
          BenchmarkSlotFilling.reset();
          BenchmarkSlotFilling.parseMessage(q);
          var resolved = BenchmarkSlotFilling.resolveEnterpriseIntensity() || { source: 'demo' };
          result = BenchmarkDataService.buildResultByFocus(
            BenchmarkSlotFilling.getSlots(),
            resolved.source,
            q
          );
        }
      }

      if (!result || result.type === 'ask') {
        return;
      }

      this.appendAssistantMsg(result.text, true, result.chartType, result.chartData, {
        summary: typeof BenchmarkSlotFilling !== 'undefined' ? BenchmarkSlotFilling.buildSummary() : '',
        fullResult: result,
      });

      if (typeof BenchmarkSessionStore !== 'undefined') {
        BenchmarkSessionStore.saveCurrent(this.messages, result.slots, result);
      }
      this.updateSaveStatus();
    },

    handlePreviewReport: function (btn) {
      var chartId = btn.getAttribute('data-chart-id');
      var payload = typeof BenchmarkResultCard !== 'undefined'
        ? BenchmarkResultCard.getPayload(chartId)
        : null;

      if (payload && typeof BenchmarkReport !== 'undefined') {
        return BenchmarkReport.openPreviewInNewTab(payload, chartId);
      }

      var summary = typeof BenchmarkSlotFilling !== 'undefined'
        ? BenchmarkSlotFilling.buildSummary()
        : '';
      if (typeof BenchmarkReport !== 'undefined') {
        return BenchmarkReport.openPreviewInNewTab({
          result: { text: '碳对标分析摘要：' + summary, recommendations: [], tableRows: [] },
          summary: summary,
          generatedAt: new Date().toISOString(),
        }, chartId || '');
      }
      return false;
    },

    handleDownloadReport: function (btn) {
      var chartId = btn.getAttribute('data-chart-id');
      var payload = typeof BenchmarkResultCard !== 'undefined'
        ? BenchmarkResultCard.getPayload(chartId)
        : null;

      if (payload && typeof BenchmarkReport !== 'undefined') {
        return BenchmarkReport.generateHTMLReport(payload, chartId);
      }

      var summary = typeof BenchmarkSlotFilling !== 'undefined'
        ? BenchmarkSlotFilling.buildSummary()
        : '';
      if (typeof BenchmarkReport !== 'undefined') {
        return BenchmarkReport.generateHTMLReport({
          result: { text: '碳对标分析摘要：' + summary, recommendations: [], tableRows: [] },
          summary: summary,
          generatedAt: new Date().toISOString(),
        }, chartId || '');
      }
      return false;
    },

    handleGenerateCompareReport: function (btn) {
      var self = this;
      var chartId = btn.getAttribute('data-chart-id');
      var rowIndex = parseInt(btn.getAttribute('data-row-index'), 10);
      var payload = typeof BenchmarkResultCard !== 'undefined'
        ? BenchmarkResultCard.getPayload(chartId)
        : null;
      var targetRow = typeof BenchmarkResultCard !== 'undefined'
        ? BenchmarkResultCard.getCompareTargetRow(chartId, rowIndex)
        : null;

      if (!payload || !targetRow) {
        this.appendAssistantMsg('未能获取对标目标数据，请重新完成一次对标分析后再试。', false);
        return;
      }

      if (typeof BenchmarkReport !== 'undefined') {
        self.appendAssistantMsg('正在生成 **企业间对标分析报告**，请稍候…', false);
        BenchmarkReport.generateComparisonReport(payload, targetRow, function (ok) {
          if (ok) {
            self.appendAssistantMsg('已为您生成并下载 **企业间对标分析报告**（对标样本：某对标企业）。', false);
          } else {
            self.appendAssistantMsg('报告已下载，但部分图表渲染异常，请刷新页面后重试。', false);
          }
        });
      }
    },

    handleViewHistory: function () {
      var list = BenchmarkSessionStore.getAll();
      var text = list.length
        ? '您共有 **' + list.length + '** 条已保存的对标记录。最近一条：' + list[0].summary + '（' + new Date(list[0].createdAt).toLocaleString('zh-CN') + '）'
        : '暂无已保存的对标记录，完成一次分析后将自动保存。';
      this.appendAssistantMsg(text, false);
    },

    resetSession: function () {
      this.messageId = 0;
      this.messages = [];
      if (typeof BenchmarkSlotFilling !== 'undefined') BenchmarkSlotFilling.reset();
      if (typeof BenchmarkAuthState !== 'undefined') BenchmarkAuthState.reset();
      if (typeof BenchmarkChart !== 'undefined') {
        try { BenchmarkChart.disposeAll(); } catch (e) { /* ignore */ }
      }
      var tags = document.getElementById('benchmarkSlotTags');
      if (tags) {
        tags.innerHTML = '';
        tags.hidden = true;
      }
      var status = document.getElementById('benchmarkSaveStatus');
      if (status) status.hidden = true;
    },
  };
})();
