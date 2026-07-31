/**
 * 报告章节注册表：自然语言删除/保留章节
 */
(function (global) {
  'use strict';

  var SECTIONS = [
    { id: 's1', title: '报告定位与核心思路', aliases: ['报告定位', '核心思路', '01', '第一章'] },
    { id: 's2', title: '和重点工序对标', aliases: ['重点工序对标', '烧结炼铁', '烧结+炼铁', '02'] },
    { id: 's3', title: '企业碳排放强度数据对标', aliases: ['企业碳排放强度', '企业层级', '企业强度对标', '03'] },
    { id: 's4', title: '工序碳排放强度数据对标', aliases: ['工序碳排放强度', '工序层级', '工序强度对标', '04'] },
    { id: 's-energy', title: '能耗对标', aliases: ['能耗对标', '综合能耗', '能耗章节'] },
    { id: 's-output', title: '产量对标', aliases: ['产量对标', '产量章节'] },
    { id: 's-scale', title: '规模对标', aliases: ['规模对标', '规模章节'] },
    { id: 's-facility', title: '生产设施对标', aliases: ['生产设施对标', '设施对标', '设施章节'] },
    { id: 's-process-extra', title: '工序对标明细', aliases: ['工序对标明细', '工序明细'] },
    { id: 's-history', title: '历史核查轨迹', aliases: ['历史核查', '核查轨迹', '历史轨迹'] },
    { id: 's5', title: '优势与短板', aliases: ['优势与短板', '优劣势', 'SWOT', '05'] },
    { id: 's6', title: '降碳行动建议', aliases: ['降碳行动建议', '行动建议', '建议章节', '06'] },
    { id: 's7', title: '企业减排潜力深度分析', aliases: ['减排潜力', '潜力分析', '深度分析', '07'] },
    { id: 's-source', title: '数据来源', aliases: ['数据来源', '来源章节'] },
  ];

  function norm(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[（）()【】\[\]：:，,。．.、]/g, '');
  }

  function listSections() {
    return SECTIONS.slice();
  }

  function findSection(hint) {
    var h = norm(hint);
    if (!h) return null;
    var best = null;
    var bestScore = 0;
    SECTIONS.forEach(function (sec) {
      var aliases = [sec.title].concat(sec.aliases || []);
      aliases.forEach(function (a) {
        var an = norm(a);
        if (!an) return;
        var score = 0;
        if (h.indexOf(an) >= 0 || an.indexOf(h) >= 0) score = 20 + an.length;
        else if (h.length >= 2 && an.indexOf(h.slice(0, 2)) >= 0) score = 6;
        if (score > bestScore) {
          bestScore = score;
          best = sec;
        }
      });
    });
    return bestScore >= 8 ? best : null;
  }

  /**
   * 解析「去掉/删除/不要某章节」或「保留某章节」
   * @returns {{ hide: string[], show: string[], labels: string[] }}
   */
  function parseSectionIntents(text) {
    var raw = String(text || '');
    var hide = [];
    var show = [];
    var labels = [];

    function collect(re, bucket) {
      var m;
      re.lastIndex = 0;
      while ((m = re.exec(raw))) {
        var hint = (m[1] || '').trim();
        var sec = findSection(hint);
        if (sec && bucket.indexOf(sec.id) < 0) {
          bucket.push(sec.id);
          labels.push(sec.title);
        }
      }
    }

    collect(
      /(?:去掉|删除|移除|不要|隐藏|取消)\s*(?:报告中的)?\s*([^，。；;\n]{2,24}?)\s*(?:章节|一章|部分|模块|内容)?/g,
      hide
    );
    collect(
      /([^，。；;\n]{2,24}?)\s*(?:章节|一章|部分|模块)\s*(?:去掉|删除|移除|不要|隐藏)/g,
      hide
    );
    collect(
      /(?:保留|只要|仅保留|恢复)\s*(?:报告中的)?\s*([^，。；;\n]{2,24}?)\s*(?:章节|一章|部分|模块|内容)?/g,
      show
    );

    // 「不要降碳行动建议和减排潜力」并列
    var multi = raw.match(/(?:去掉|删除|不要)([^。；\n]{4,60})/);
    if (multi) {
      String(multi[1])
        .split(/[、，,和及与\/]/)
        .forEach(function (part) {
          var sec = findSection(part);
          if (sec && hide.indexOf(sec.id) < 0) {
            hide.push(sec.id);
            labels.push(sec.title);
          }
        });
    }

    return { hide: hide, show: show, labels: labels };
  }

  /** 从 HTML 中移除指定 section 块 */
  function stripSectionsFromHTML(html, hiddenIds) {
    if (!html || !hiddenIds || !hiddenIds.length) return html;
    hiddenIds.forEach(function (id) {
      var safe = String(id).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      try {
        var re = new RegExp(
          '<div class="section" id="' + safe + '"[\\s\\S]*?(?=<div class="section"|<div class="footer"|$)',
          'i'
        );
        html = html.replace(re, '');
      } catch (e) {}
    });
    return html;
  }

  function applyVisibility(pack, intents) {
    if (!pack) return [];
    if (!Array.isArray(pack.hiddenSections)) pack.hiddenSections = [];
    var changes = [];
    (intents.hide || []).forEach(function (id) {
      if (pack.hiddenSections.indexOf(id) < 0) {
        pack.hiddenSections.push(id);
        var sec = SECTIONS.filter(function (s) {
          return s.id === id;
        })[0];
        changes.push('已隐藏章节「' + (sec ? sec.title : id) + '」');
      }
    });
    (intents.show || []).forEach(function (id) {
      var before = pack.hiddenSections.length;
      pack.hiddenSections = pack.hiddenSections.filter(function (x) {
        return x !== id;
      });
      if (pack.hiddenSections.length < before) {
        var sec2 = SECTIONS.filter(function (s) {
          return s.id === id;
        })[0];
        changes.push('已恢复章节「' + (sec2 ? sec2.title : id) + '」');
      }
    });
    return changes;
  }

  global.ReportSectionRegistry = {
    listSections: listSections,
    findSection: findSection,
    parseSectionIntents: parseSectionIntents,
    stripSectionsFromHTML: stripSectionsFromHTML,
    applyVisibility: applyVisibility,
  };
})(window);
