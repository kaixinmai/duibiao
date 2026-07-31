/**
 * 通用报告自我修正引擎
 * 用户用自然语言指出「哪个数据应该是多少」→ 模糊匹配报告指标 → 写入 overrides → 重建报告
 * 不再为每个字段单独打补丁。
 */
(function (global) {
  'use strict';

  function norm(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[（）()【】\[\]：:，,。．.、＋+]/g, '')
      .replace(/tco2e?\/t|kgce\/t|万吨|亿元|位/gi, '');
  }

  function roundVal(v, digits) {
    var d = digits != null ? digits : 4;
    var p = Math.pow(10, d);
    return Math.round(Number(v) * p) / p;
  }

  /** 从报告模型 + 周期底数动态生成可修正指标目录 */
  function buildCatalog(model, profile) {
    model = model || {};
    profile = profile || {};
    var province = model.provinceName || '湖北';
    var list = [];

    function add(item) {
      if (!item || !item.id) return;
      item.aliases = (item.aliases || []).concat([item.label, item.id]).filter(Boolean);
      list.push(item);
    }

    add({
      id: 'enterprise.intensity',
      label: '企业层级碳排放强度',
      aliases: [
        '企业层级',
        '企业级碳排放强度',
        '企业碳排放强度',
        '企业强度',
        '碳排放强度',
        '碳强度',
      ],
      column: '企业数据',
      digits: 4,
      get: function (m) {
        return m.enterpriseIntensity;
      },
      set: function (m, v) {
        m.enterpriseIntensity = v;
      },
      setProfile: function (p, v) {
        p.co2Intensity = v;
        if (p.crudeSteelOutput) {
          p.co2Emission = roundVal(v * p.crudeSteelOutput, 2);
        }
      },
    });

    add({
      id: 'enterprise.rank',
      label: '企业层级行业排名',
      aliases: ['企业层级排名', '企业排名', '行业排名'],
      column: '行业排名',
      digits: 0,
      contextNeed: ['企业层级', '企业级'],
      contextAvoid: ['烧结', '炼铁', '工序'],
      get: function (m) {
        return m.enterpriseRank;
      },
      set: function (m, v) {
        m.enterpriseRank = Math.round(v);
      },
    });

    add({
      id: 'enterprise.provinceAvg',
      label: province + '省平均值（企业层级）',
      aliases: [province + '省平均值', '省平均值', '省均值'],
      column: province + '省平均值',
      digits: 3,
      contextNeed: ['企业层级', '企业级', '企业'],
      get: function (m) {
        return m.provinceAvg;
      },
      set: function (m, v) {
        m.provinceAvg = v;
      },
    });

    add({
      id: 'enterprise.industryAvg',
      label: '行业平均值（企业层级）',
      aliases: ['行业平均值', '行业均值'],
      column: '行业平均值',
      digits: 3,
      contextNeed: ['企业层级', '企业级', '企业'],
      contextAvoid: ['烧结', '炼铁', '工序'],
      get: function (m) {
        return m.industryAvg;
      },
      set: function (m, v) {
        m.industryAvg = v;
      },
    });

    add({
      id: 'enterprise.industryAdvanced',
      label: '行业先进值（企业层级）',
      aliases: ['行业先进值', '先进值'],
      column: '行业先进值',
      digits: 3,
      contextNeed: ['企业层级', '企业级', '企业'],
      get: function (m) {
        return m.industryAdvanced;
      },
      set: function (m, v) {
        m.industryAdvanced = v;
      },
    });

    add({
      id: 'quota.combined.intensity',
      label: '烧结工序+炼铁工序企业数据',
      aliases: [
        '烧结工序+炼铁工序',
        '烧结+炼铁',
        '烧结炼铁',
        '重点工序',
        '重点工序对标',
        '合并口径',
      ],
      column: '企业数据',
      digits: 3,
      get: function (m) {
        return m.quotaCombined && m.quotaCombined.intensity;
      },
      set: function (m, v) {
        m.quotaCombined = Object.assign({}, m.quotaCombined || {}, { intensity: v });
      },
      setProfile: function (p, v) {
        p.quotaCombinedIntensity = v;
      },
    });

    add({
      id: 'quota.combined.rank',
      label: '烧结+炼铁行业排名',
      aliases: ['烧结工序+炼铁工序', '烧结+炼铁', '重点工序'],
      column: '行业排名',
      digits: 0,
      get: function (m) {
        return m.quotaCombined && m.quotaCombined.rank;
      },
      set: function (m, v) {
        m.quotaCombined = Object.assign({}, m.quotaCombined || {}, { rank: Math.round(v) });
      },
    });

    add({
      id: 'quota.combined.provinceAvg',
      label: '烧结+炼铁省平均值',
      aliases: ['烧结工序+炼铁工序', '烧结+炼铁', '重点工序'],
      column: province + '省平均值',
      digits: 3,
      get: function (m) {
        return m.quotaCombined && m.quotaCombined.provinceAvg;
      },
      set: function (m, v) {
        m.quotaCombined = Object.assign({}, m.quotaCombined || {}, { provinceAvg: v });
      },
    });

    add({
      id: 'quota.combined.industryAvg',
      label: '烧结+炼铁行业平均值',
      aliases: ['烧结工序+炼铁工序', '烧结+炼铁', '重点工序'],
      column: '行业平均值',
      digits: 3,
      get: function (m) {
        return m.quotaCombined && m.quotaCombined.industryAvg;
      },
      set: function (m, v) {
        m.quotaCombined = Object.assign({}, m.quotaCombined || {}, { industryAvg: v });
      },
    });

    add({
      id: 'quota.combined.industryAdvanced',
      label: '烧结+炼铁行业先进值',
      aliases: ['烧结工序+炼铁工序', '烧结+炼铁', '重点工序'],
      column: '行业先进值',
      digits: 3,
      get: function (m) {
        return m.quotaCombined && m.quotaCombined.industryAdvanced;
      },
      set: function (m, v) {
        m.quotaCombined = Object.assign({}, m.quotaCombined || {}, { industryAdvanced: v });
      },
    });

    var processRows = model.processRanks && model.processRanks.length
      ? model.processRanks
      : [
          { name: '焦化工序' },
          { name: '球团工序' },
          { name: '烧结工序' },
          { name: '高炉炼铁' },
          { name: '转炉炼钢' },
          { name: '辅助生产工序' },
        ];
    processRows.forEach(function (row, idx) {
      var name = row.name || '工序' + idx;
      var shortName = name.replace(/工序/g, '');
      add({
        id: 'process.' + idx + '.intensity',
        label: name + '企业数据',
        aliases: [name, shortName, name + '强度', shortName + '强度'],
        column: '企业数据',
        digits: 3,
        get: function (m) {
          return m.processRanks && m.processRanks[idx] && m.processRanks[idx].intensity;
        },
        set: function (m, v) {
          if (!m.processRanks || !m.processRanks[idx]) return;
          m.processRanks[idx] = Object.assign({}, m.processRanks[idx], { intensity: v });
        },
      });
      add({
        id: 'process.' + idx + '.rank',
        label: name + '行业排名',
        aliases: [name, shortName],
        column: '行业排名',
        digits: 0,
        get: function (m) {
          return m.processRanks && m.processRanks[idx] && m.processRanks[idx].rank;
        },
        set: function (m, v) {
          if (!m.processRanks || !m.processRanks[idx]) return;
          m.processRanks[idx] = Object.assign({}, m.processRanks[idx], {
            rank: Math.round(v),
          });
        },
      });
    });

    add({
      id: 'energy.perTon',
      label: '综合能耗强度',
      aliases: ['综合能耗强度', '能耗强度', '吨钢综合能耗', '综合能耗', '能耗'],
      column: '企业数据',
      digits: 1,
      get: function () {
        return profile.energyPerTon;
      },
      set: function () {},
      setProfile: function (p, v) {
        p.energyPerTon = v;
        if (p.crudeSteelOutput) {
          p.energyTotal = roundVal((v * p.crudeSteelOutput) / 1000, 2);
        }
      },
    });

    add({
      id: 'energy.total',
      label: '综合能耗总量',
      aliases: ['综合能耗总量', '能耗总量'],
      digits: 2,
      get: function () {
        return profile.energyTotal;
      },
      set: function () {},
      setProfile: function (p, v) {
        p.energyTotal = v;
      },
    });

    add({
      id: 'output.crudeSteel',
      label: '粗钢产量',
      aliases: ['粗钢产量', '粗钢'],
      digits: 2,
      get: function () {
        return profile.crudeSteelOutput;
      },
      set: function () {},
      setProfile: function (p, v) {
        if (!p.month) p.crudeSteelOutput = v;
      },
    });

    add({
      id: 'output.steel',
      label: '钢材产量',
      aliases: ['钢材产量', '成材产量', '钢材'],
      digits: 2,
      get: function (m) {
        return m.outputWanTon != null ? m.outputWanTon : profile.steelOutput;
      },
      set: function (m, v) {
        m.outputWanTon = v;
      },
      setProfile: function (p, v) {
        if (!p.month) p.steelOutput = v;
      },
    });

    add({
      id: 'scrap.ratio',
      label: '废钢比',
      aliases: ['废钢比', '废钢'],
      digits: 4,
      get: function () {
        return profile.scrapPerTonSteel;
      },
      set: function () {},
      setProfile: function (p, v) {
        p.scrapPerTonSteel = v;
      },
    });

    return list;
  }

  /**
   * 解析用户修正话术 → [{ hint, value, columnHint }]
   * 支持：A是1.2 / A为1.2 / A改成1.2 / A企业数据是1.2 / 把A调整为1.2
   */
  function parseUtterances(text) {
    var raw = String(text || '').replace(/,/g, '').trim();
    if (!raw) return [];
    var out = [];
    var columnHints = [
      '企业数据',
      '行业排名',
      '省平均值',
      '省均值',
      '行业平均值',
      '行业均值',
      '行业先进值',
      '先进值',
    ];

    function push(hint, value, col) {
      if (value == null || isNaN(value)) return;
      out.push({
        hint: String(hint || '').trim(),
        value: value,
        columnHint: col || '',
      });
    }

    var patterns = [
      /(?:把|将)?([^，。；;\n]{2,40}?)(?:的)?(企业数据|行业排名|省平均值|省均值|行业平均值|行业均值|行业先进值|先进值)?\s*(?:是|为|改成|改为|调整为|更新为|修正为|更正为|应该是|应为|正确(?:值|数据)?(?:是|为)?|等于|=|:|：)\s*(-?[0-9]+(?:\.[0-9]+)?)/g,
      /([^，。；;\n]{2,40}?)(?:正确值|数值|数据)\s*(?:是|为|:|：)?\s*(-?[0-9]+(?:\.[0-9]+)?)/g,
    ];

    patterns.forEach(function (re) {
      var m;
      re.lastIndex = 0;
      while ((m = re.exec(raw))) {
        if (m.length >= 4 && m[2] != null && columnHints.indexOf(m[2]) >= 0) {
          push(m[1] + m[2], parseFloat(m[3]), m[2]);
        } else if (m.length >= 3) {
          var hint = m[1];
          var val = parseFloat(m[m.length - 1]);
          var col = '';
          columnHints.forEach(function (c) {
            if (hint.indexOf(c) >= 0) col = c;
          });
          // 已被「企业数据是x」完整命中时，跳过弱匹配「…数据是x」
          if (!col && /数据$/.test(String(hint).trim()) && out.some(function (o) {
            return o.value === val && o.columnHint;
          })) {
            continue;
          }
          push(hint, val, col);
        }
      }
    });

    // 兜底：整句只有一个数，且含修正语气
    if (!out.length && /是|为|改成|改为|调整|修正|更正|应该/.test(raw)) {
      var one = raw.match(/(-?[0-9]+(?:\.[0-9]+)?)/);
      if (one) {
        push(raw.replace(one[0], '').replace(/是|为|改成|改为|调整为|更新为|应该是|应为/g, ''), parseFloat(one[1]), '');
      }
    }

    // 去重：同一 hint+value 只保留一条；优先保留带列名的；弱 hint 被强 hint 覆盖则丢弃
    var seen = {};
    var sorted = out.sort(function (a, b) {
      return (b.columnHint ? 1 : 0) - (a.columnHint ? 1 : 0) || b.hint.length - a.hint.length;
    });
    return sorted.filter(function (u, idx) {
      var dominated = sorted.some(function (o, j) {
        if (j >= idx) return false;
        if (o.value !== u.value) return false;
        var on = norm(o.hint);
        var un = norm(u.hint);
        if (o.columnHint && !u.columnHint && on.indexOf(un.slice(0, Math.min(6, un.length))) >= 0) return true;
        if (on.length > un.length && on.indexOf(un) >= 0) return true;
        return false;
      });
      if (dominated) return false;
      var k = norm(u.hint) + '|' + u.value + '|' + norm(u.columnHint || '');
      if (seen[k]) return false;
      seen[k] = true;
      return u.hint.length >= 1;
    });
  }

  function scoreField(field, utterance) {
    var hintN = norm(utterance.hint);
    var colN = norm(utterance.columnHint || '');
    var rawHint = String(utterance.hint || '') + String(utterance.columnHint || '');
    if (!hintN && !colN) return 0;

    // 排名列必须出现「排名/位次」，避免把 1.657 误圆成排名 2
    if (field.column === '行业排名' && !/排名|位次/.test(rawHint)) return 0;
    if (field.digits === 0) {
      var v = Number(utterance.value);
      if (Math.abs(v - Math.round(v)) > 0.001) return 0;
    }
    if (field.column && /省平均|行业平均|先进值/.test(field.column)) {
      var colKey = field.column.replace(/湖北省|河南省|河北省/, '省');
      if (!colN && rawHint.indexOf(colKey.replace('省平均值', '平均')) < 0 && rawHint.indexOf('先进') < 0) {
        // 未提列名时，不允许误改基准列
        if (!/平均|先进|均值/.test(rawHint)) return 0;
      }
    }

    var score = 0;
    var aliases = field.aliases || [];
    for (var i = 0; i < aliases.length; i++) {
      var a = norm(aliases[i]);
      if (!a) continue;
      if (hintN.indexOf(a) >= 0 || a.indexOf(hintN) >= 0) {
        score += 10 + Math.min(a.length, 12);
      } else {
        // 部分字重叠
        var hit = 0;
        for (var j = 0; j < a.length; j++) {
          if (hintN.indexOf(a.charAt(j)) >= 0) hit += 1;
        }
        if (a.length >= 2 && hit / a.length >= 0.7) score += 4;
      }
    }

    if (field.column) {
      var fc = norm(field.column);
      if (colN && (colN.indexOf(fc) >= 0 || fc.indexOf(colN) >= 0)) score += 18;
      else if (hintN.indexOf(fc) >= 0) score += 8;
      else if (colN && field.column.indexOf('企业数据') >= 0 && /企业数据|强度|数据/.test(utterance.hint + utterance.columnHint))
        score += 6;
    }

    if (field.contextNeed && field.contextNeed.length) {
      var ok = field.contextNeed.some(function (c) {
        return hintN.indexOf(norm(c)) >= 0;
      });
      if (ok) score += 6;
      else if (/enterprise\.|企业/.test(field.id) && /烧结|炼铁|工序/.test(hintN)) score -= 12;
    }
    if (field.contextAvoid && field.contextAvoid.length) {
      field.contextAvoid.forEach(function (c) {
        if (hintN.indexOf(norm(c)) >= 0) score -= 10;
      });
    }

    // 烧结+炼铁应优先命中 quota，而不是企业层级或单工序
    if (field.id.indexOf('quota.combined') === 0 && /烧结/.test(hintN) && /炼铁/.test(hintN)) {
      score += 20;
    }
    if (field.id === 'enterprise.intensity' && /烧结/.test(hintN) && /炼铁/.test(hintN)) {
      score -= 20;
    }
    if (field.id.indexOf('process.') === 0 && /烧结/.test(hintN) && /炼铁/.test(hintN)) {
      score -= 25;
    }
    if (field.id === 'enterprise.intensity' && /企业层级|企业级|碳排放强度/.test(hintN) && !/烧结|炼铁/.test(hintN)) {
      score += 12;
    }

    // 默认列：未指明列时，强度类字段偏向「企业数据」
    if (!colN && field.column === '企业数据' && /强度|能耗|产量|企业数据|数据/.test(hintN + utterance.hint)) {
      score += 3;
    }
    if (!colN && field.column === '行业排名' && /排名/.test(hintN)) score += 10;

    return score;
  }

  function matchUtterances(catalog, utterances) {
    var matches = [];
    var usedFields = {};
    utterances.forEach(function (u) {
      var best = null;
      var bestScore = 0;
      catalog.forEach(function (f) {
        if (usedFields[f.id]) return;
        var s = scoreField(f, u);
        if (s > bestScore) {
          bestScore = s;
          best = f;
        }
      });
      if (best && bestScore >= 8) {
        usedFields[best.id] = true;
        matches.push({
          fieldId: best.id,
          label: best.label,
          value: roundVal(u.value, best.digits != null ? best.digits : 4),
          score: bestScore,
          hint: u.hint,
          columnHint: u.columnHint,
        });
      } else if (!best || bestScore < 8) {
        // 同一数值被多条话术重复解析时跳过空 hint
        if (!u.hint || norm(u.hint).length < 1) return;
        matches.push({
          fieldId: null,
          label: u.hint || '未识别指标',
          value: u.value,
          score: bestScore,
          hint: u.hint,
          unmatched: true,
        });
      }
    });
    return matches;
  }

  function ensureOverrides(pack) {
    if (!pack.reportOverrides || typeof pack.reportOverrides !== 'object') {
      pack.reportOverrides = {};
    }
    if (!Array.isArray(pack.reportOverrideLog)) pack.reportOverrideLog = [];
    return pack.reportOverrides;
  }

  /**
   * 应用对话修正到数据包
   * @returns {{ changes: string[], matches: array, note: string }}
   */
  function applyChatText(pack, text, modelHint, profileHint) {
    if (!pack) return { changes: [], matches: [], note: '' };
    var profile = profileHint || (pack.getPeriod && pack.getPeriod()) || {};
    var model = modelHint || {};
    var catalog = buildCatalog(model, profile);
    var utterances = parseUtterances(text);
    var matches = matchUtterances(catalog, utterances);
    var overrides = ensureOverrides(pack);
    var changes = [];

    matches.forEach(function (m) {
      if (m.unmatched || !m.fieldId) {
        changes.push('已记录补充「' + (m.hint || m.label) + ' → ' + m.value + '」（待核对定位）');
        pack.reportOverrideLog.push({
          at: new Date().toISOString(),
          text: text,
          unmatched: true,
          hint: m.hint,
          value: m.value,
        });
        return;
      }
      overrides[m.fieldId] = {
        value: m.value,
        label: m.label,
        hint: m.hint,
        at: new Date().toISOString(),
      };
      var field = catalog.filter(function (f) {
        return f.id === m.fieldId;
      })[0];
      if (field && field.setProfile) {
        // 同年份各周期键一并写入，避免月度/年度报告读到旧值
        var year = String((profile && profile.year) || new Date().getFullYear()).slice(0, 4);
        Object.keys(pack.periods || {}).forEach(function (k) {
          if (k === year || k.indexOf(year + '-') === 0) {
            pack.periods[k].source = 'chat-revision';
            field.setProfile(pack.periods[k], m.value);
          }
        });
        if (profile && typeof field.setProfile === 'function') {
          field.setProfile(profile, m.value);
        }
      }
      changes.push(m.label + ' → ' + m.value);
      pack.reportOverrideLog.push({
        at: new Date().toISOString(),
        fieldId: m.fieldId,
        label: m.label,
        value: m.value,
        hint: m.hint,
      });
    });

    if (!changes.length) {
      changes.push('已记录补充说明，并据此修订报告相关表述');
    }

    var note =
      '根据对话自我修正：' + changes.join('；') + '。已写入报告覆盖层，重新打开报告即可看到更新。';
    if (!pack.learningNotes) pack.learningNotes = [];
    pack.learningNotes.push({
      file: '对话补充',
      title: '对话自我修正',
      note: note,
      advice: '已按用户指出的正确数据完成报告自我修正，请以最新报告为准。',
      intensityAdj: 0,
      source: 'chat',
    });

    return { changes: changes, matches: matches, note: note };
  }

  function refreshNarratives(model) {
    if (!model) return;
    if (model.enterpriseIntensity != null) {
      var liveIntensity = model.enterpriseIntensity;
      var provinceAvg = Number(model.provinceAvg) || 1.977;
      var industryAvg = Number(model.industryAvg) || 1.95;
      var industryAdvanced = Number(model.industryAdvanced) || 1.901;
      var gapToAdvanced = roundVal(liveIntensity - industryAdvanced, 3);
      var betterThanProvince = roundVal(provinceAvg - liveIntensity, 3);
      var betterThanIndustry = roundVal(industryAvg - liveIntensity, 3);
      var rank = model.enterpriseRank || 1;
      var total = model.totalEnterprises || 232;
      model.enterpriseAnalysis =
        '企业层级碳排放强度为 ' +
        liveIntensity +
        ' tCO₂/t，优于' +
        (model.provinceName || '') +
        '省均值（' +
        provinceAvg +
        '，低 ' +
        betterThanProvince +
        '）与全国行业均值（' +
        industryAvg +
        '，低 ' +
        betterThanIndustry +
        '），排名第 ' +
        rank +
        '/' +
        total +
        '。相较行业先进值 ' +
        industryAdvanced +
        '，差值约 ' +
        gapToAdvanced +
        '。本版含对话自我修正。';
    }
    if (model.quotaCombined && model.quotaCombined.intensity != null) {
      var qc = model.quotaCombined;
      var qGapProvince = roundVal(qc.provinceAvg - qc.intensity, 3);
      var qGapIndustry = roundVal(qc.industryAvg - qc.intensity, 3);
      var qGapAdvanced = roundVal(qc.industryAdvanced - qc.intensity, 3);
      model.quotaAnalysis =
        '横向对标显示，本统计周期「' +
        (qc.name || '烧结工序+炼铁工序') +
        '」合并口径碳排放强度为 ' +
        qc.intensity +
        ' tCO₂e/t炼铁工序产品，低于' +
        (model.provinceName || '') +
        '省均值（' +
        qc.provinceAvg +
        '，低 ' +
        qGapProvince +
        '）、行业均值（' +
        qc.industryAvg +
        '，低 ' +
        qGapIndustry +
        '），与行业先进值相差约 ' +
        Math.abs(qGapAdvanced) +
        '，行业排名第 ' +
        qc.rank +
        ' 位。本版含对话自我修正。';
    }
  }

  /** 将 overrides 应用到报告模型（生成报告时调用） */
  function applyToModel(model, pack, profile) {
    if (!model || !pack) return model;
    profile = profile || (pack.getPeriod && pack.getPeriod()) || {};
    var catalog = buildCatalog(model, profile);
    var overrides = pack.reportOverrides || {};

    // 先从 profile 同步基础字段（含对话已写入的绝对值）
    if (profile.co2Intensity != null) {
      model.enterpriseIntensity = roundVal(profile.co2Intensity, 4);
    }
    if (profile.quotaCombinedIntensity != null && model.quotaCombined) {
      model.quotaCombined = Object.assign({}, model.quotaCombined, {
        intensity: roundVal(profile.quotaCombinedIntensity, 3),
      });
    }

    Object.keys(overrides).forEach(function (id) {
      var ov = overrides[id];
      if (!ov || ov.value == null) return;
      var field = catalog.filter(function (f) {
        return f.id === id;
      })[0];
      if (!field) return;
      if (field.set) field.set(model, ov.value);
      if (field.setProfile) field.setProfile(profile, ov.value);
    });

    refreshNarratives(model);
    return model;
  }

  /**
   * HTML 兜底：按行标签替换同表行内数值（覆盖扩展章节等未建模字段）
   */
  function patchReportHTML(html, pack) {
    if (!html || !pack) return html;
    var log = pack.reportOverrideLog || [];
    var recent = log.slice(-8);
    recent.forEach(function (item) {
      if (!item || item.value == null) return;
      var label = String(item.label || item.hint || '').trim();
      if (label.length < 2) return;
      var safeLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 40);
      if (safeLabel.length < 2) return;
      try {
        var re = new RegExp(
          '(<tr[^>]*>[\\s\\S]{0,400}?' +
            safeLabel +
            '[\\s\\S]{0,400}?<td[^>]*>\\s*)(-?\\d+(?:\\.\\d+)?)(\\s*</td>)',
          'i'
        );
        if (re.test(html)) {
          html = html.replace(re, '$1' + item.value + '$3');
        }
      } catch (e) {}
    });
    return html;
  }

  function previewChanges(text, model, profile) {
    var catalog = buildCatalog(model || {}, profile || {});
    var matches = matchUtterances(catalog, parseUtterances(text));
    return matches.map(function (m) {
      if (m.unmatched) return '待定位：' + (m.hint || '') + ' → ' + m.value;
      return (m.label || m.fieldId) + ' → ' + m.value;
    });
  }

  function clear(pack) {
    if (!pack) return;
    pack.reportOverrides = {};
    pack.reportOverrideLog = [];
  }

  global.ReportRevisionEngine = {
    buildCatalog: buildCatalog,
    parseUtterances: parseUtterances,
    matchUtterances: matchUtterances,
    applyChatText: applyChatText,
    applyToModel: applyToModel,
    patchReportHTML: patchReportHTML,
    previewChanges: previewChanges,
    refreshNarratives: refreshNarratives,
    clear: clear,
  };
})(window);
