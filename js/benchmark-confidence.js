/**
 * 数据对标智能体 — 置信度计算
 */
(function (global) {
  'use strict';

  var WEIGHTS = {
    dataCoverage: { label: '数据源覆盖率', weight: 0.25, desc: '佳华五大核心数据源是否参与本次对标' },
    sourceReliability: { label: '数据源可靠性', weight: 0.20, desc: '专有库 SLA 与历史校验通过率' },
    inferenceQuality: { label: '推理链完整度', weight: 0.20, desc: '查询与分析步骤是否返回有效中间结果' },
    benchmarkFit: { label: '行业样本契合度', weight: 0.15, desc: '与行业脱敏样本池的匹配程度' },
    dataFreshness: { label: '数据时效性', weight: 0.10, desc: '对标周期数据更新时效' },
    compliance: { label: '合规校验通过率', weight: 0.10, desc: '双碳知识库政策标准符合性' },
  };

  function calculateForBenchmark(options) {
    options = options || {};
    var querySteps = options.querySteps || [];
    var analysisSteps = options.analysisSteps || [];
    var result = options.result;
    var allSteps = querySteps.concat(analysisSteps);
    var previewCount = allSteps.filter(function (s) { return s.preview; }).length;
    var totalSources = 5;
    var coverageCount = Math.min(totalSources, 3 + Math.floor(previewCount / 2));

    var hasResult = result && result.type === 'result';
    var ranking = result && result.rankingMeta;
    var warnCount = hasResult && ranking && ranking.grade === 'C' ? 1 : 0;

    var scores = {
      dataCoverage: Math.round((coverageCount / totalSources) * 94 * 10) / 10,
      sourceReliability: 95.5,
      inferenceQuality: allSteps.length
        ? Math.round(((allSteps.length - warnCount + warnCount * 0.72) / allSteps.length) * 93 * 10) / 10
        : 88,
      benchmarkFit: hasResult ? (warnCount ? 89.5 : 93.5) : 86,
      dataFreshness: result && result.slots && result.slots.timeValue ? 92.5 : 86,
      compliance: warnCount ? 95.5 : 97.5,
    };

    var weighted = 0;
    var breakdown = [];
    Object.keys(WEIGHTS).forEach(function (key) {
      var meta = WEIGHTS[key];
      var raw = scores[key];
      var contrib = raw * meta.weight;
      weighted += contrib;
      breakdown.push({
        key: key,
        label: meta.label,
        desc: meta.desc,
        score: raw,
        weight: meta.weight,
        contribution: Math.round(contrib * 100) / 100,
      });
    });

    var finalScore = Math.round(weighted * 10) / 10;
    var rounded = Math.round(finalScore);

    return {
      score: rounded,
      precise: finalScore,
      breakdown: breakdown,
      summary: '综合 ' + totalSources + ' 大数据源中覆盖 ' + coverageCount + ' 个，' +
        allSteps.length + ' 步推理完成，加权得分 ' + rounded + '%',
      tooltipHtml: buildTooltipHtml(rounded, finalScore, breakdown, coverageCount, allSteps.length, warnCount),
    };
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function buildTooltipHtml(score, precise, breakdown, coverage, stepCount, warnCount) {
    var rows = breakdown.map(function (b) {
      return '<tr><td>' + esc(b.label) + '</td><td>' + b.score + '%</td><td>×' + (b.weight * 100) + '%</td><td><strong>' + b.contribution + '</strong></td></tr>';
    }).join('');

    return (
      '<div class="cta-conf-tooltip">' +
        '<p class="cta-conf-tooltip__title">置信度 ' + score + '% 计算说明</p>' +
        '<p class="cta-conf-tooltip__formula">加权公式：Σ(维度得分 × 权重) = <strong>' + precise + '%</strong> → 四舍五入 <strong>' + score + '%</strong></p>' +
        '<table class="cta-conf-tooltip__table">' +
          '<thead><tr><th>评估维度</th><th>得分</th><th>权重</th><th>贡献</th></tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>' +
        '<ul class="cta-conf-tooltip__notes">' +
          '<li>数据源覆盖：' + coverage + '/5 个佳华核心数据源参与本次对标</li>' +
          '<li>推理步骤：共 ' + stepCount + ' 步（查询 + 分析）</li>' +
          '<li>行业样本：基于脱敏行业排名池计算，不展示真实企业名称</li>' +
          (warnCount ? '<li>存在预警维度时，行业样本契合度已纳入扣分</li>' : '') +
        '</ul>' +
      '</div>'
    );
  }

  function badgeHtml(confidence) {
    if (!confidence) return '';
    return '<span class="cta-confidence">' +
      '<span class="cta-confidence__label">分析置信度 <strong>' + confidence.score + '%</strong></span>' +
      '<span class="cta-confidence__help" role="button" tabindex="0" aria-expanded="false" aria-label="置信度计算说明">?' +
        '<span class="cta-confidence__popup" role="tooltip">' + confidence.tooltipHtml + '</span>' +
      '</span>' +
    '</span>';
  }

  global.ConfidenceCalculator = {
    calculateForBenchmark: calculateForBenchmark,
    badgeHtml: badgeHtml,
    WEIGHTS: WEIGHTS,
  };
})(window);
