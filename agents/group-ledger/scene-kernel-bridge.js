/**
 * 集团碳账本内核桥接：挂接冀东数据包、企业检索 UI、能力模块、报告企业名
 */
(function (global) {
  'use strict';

  function patchDataService() {
    var pack = global.JidongGroupData;
    var ds = global.BenchmarkDataService;
    if (!pack || !ds) return;

    pack.setActiveEnterprise(pack.activeEnterpriseId || 'jd-group');
    ds.DISPLAY.SELF = pack.enterpriseName;
    ds.DISPLAY.INDUSTRY_AVG = '行业均值（全国水泥）';
    ds.DISPLAY.BENCHMARK = '行业标杆（前5%）';
    ds.DISPLAY.COMPARE_TARGET = '区域内标杆企业';
    ds.DISPLAY.PEER_MASK = '某水泥企业';
    ds.INDUSTRY_POOL['水泥'] = Object.assign({ unit: 'tCO₂/t' }, pack.industryBenchmark);

    ds.getEnterpriseProfile = function (slots) {
      var key =
        typeof ds.getPeriodKey === 'function'
          ? ds.getPeriodKey(slots || {})
          : (slots && slots.timeValue) || '2026';
      return pack.getPeriod(key);
    };

    if (!ds._jidongPatchedDemo) {
      ds._jidongPatchedDemo = true;
      var origDemo = ds.getDemoIntensity;
      ds.getDemoIntensity = function (industry, slots) {
        var profile = pack.getPeriod(
          slots && typeof ds.getPeriodKey === 'function' ? ds.getPeriodKey(slots) : '2026'
        );
        if (profile && profile.co2Intensity != null) return profile.co2Intensity;
        return origDemo.call(ds, industry || '水泥', slots);
      };
    }

    var origBuildResult = ds.buildResultByFocus;
    if (typeof origBuildResult === 'function' && !ds._jidongPatchedBuild) {
      ds._jidongPatchedBuild = true;
      ds.buildResultByFocus = function (slots, source, text) {
        slots.industry = '水泥';
        return origBuildResult.call(ds, slots, source, text);
      };
    }

    if (global.BenchmarkSlotFilling && !global.BenchmarkSlotFilling._jidongPatched) {
      global.BenchmarkSlotFilling._jidongPatched = true;
      var origApply = global.BenchmarkSlotFilling.applyDefaults;
      global.BenchmarkSlotFilling.applyDefaults = function (text) {
        origApply.call(this, text);
        this.slots.industry = '水泥';
        if (
          global.DemoSceneKernel &&
          global.DemoSceneKernel.detectYearlyBenchmarkIntent &&
          global.DemoSceneKernel.detectYearlyBenchmarkIntent(text)
        ) {
          this.slots.timeDimension = 'yearly';
          this.slots.timeValue = global.DemoSceneKernel.resolveYearPeriod(text);
          this.slots.functionType = 'comparison';
          this.slots.queryFocus = 'comprehensive';
        } else if (/今年|本年|年度|全年/.test(String(text || ''))) {
          this.slots.timeDimension = 'yearly';
          this.slots.timeValue = global.DemoSceneKernel
            ? global.DemoSceneKernel.resolveYearPeriod(text)
            : String(new Date().getFullYear());
        }
        this.slots.objectDimension = 'enterprise';
        return this.getSlots();
      };
    }

    if (global.BenchmarkReport && !global.BenchmarkReport._jidongPatchedName) {
      global.BenchmarkReport._jidongPatchedName = true;
      global.BenchmarkReport._resolveEnterpriseName = function () {
        return pack.enterpriseName || '冀东水泥集团';
      };
      var origModel = global.BenchmarkReport.buildSteelReportModel;
      if (typeof origModel === 'function') {
        global.BenchmarkReport.buildSteelReportModel = function (payload) {
          var model = origModel.call(this, payload);
          var key = this._resolvePeriodKey(payload, (payload && payload.result) || {});
          var profile = pack.getPeriod(key);
          if (profile && profile.steelOutput) {
            model.outputWanTon = profile.month
              ? profile.steelOutput
              : Math.round((profile.steelOutput / 12) * 10) / 10;
          }
          model.enterpriseName = pack.enterpriseName;
          return model;
        };
      }
    }

    if (typeof HenanSteelData !== 'undefined') {
      HenanSteelData.enterpriseName = pack.enterpriseName;
      HenanSteelData.getPeriod = function (key) {
        return pack.getPeriod(key);
      };
      HenanSteelData.getBenchmarkProfiles = function (key) {
        return pack.getBenchmarkProfiles(key);
      };
      HenanSteelData.industryBenchmark = pack.industryBenchmark;
      HenanSteelData.sources = pack.sources;
    }
  }

  function setActiveCapability(id) {
    var kernel = global.DemoSceneKernel;
    if (!kernel) return;
    kernel.capabilities.forEach(function (c) {
      c.active = c.id === id;
    });
    document.querySelectorAll('.gl-kernel-cap').forEach(function (btn) {
      var on = btn.getAttribute('data-cap') === id;
      btn.classList.toggle('is-active', on);
    });
  }

  function selectEnterprise(id) {
    var pack = global.JidongGroupData;
    if (!pack) return;
    var meta = pack.setActiveEnterprise(id);
    patchDataService();
    var label = document.getElementById('gl-kernel-enterprise');
    if (label) label.textContent = meta.name;
    var input = document.getElementById('gl-kernel-search');
    if (input) input.value = meta.name;
    hideSuggest();
  }

  function hideSuggest() {
    var box = document.getElementById('gl-kernel-suggest');
    if (box) {
      box.hidden = true;
      box.innerHTML = '';
    }
  }

  function renderSuggest(list) {
    var box = document.getElementById('gl-kernel-suggest');
    if (!box) return;
    if (!list.length) {
      box.hidden = false;
      box.innerHTML = '<div class="gl-kernel-suggest__empty">未找到冀东范围内企业，请换「北水」「冀东」等关键词</div>';
      return;
    }
    box.hidden = false;
    box.innerHTML = list
      .map(function (ent) {
        return (
          '<button type="button" class="gl-kernel-suggest__item" data-ent="' +
          ent.id +
          '">' +
          '<strong>' +
          ent.name +
          '</strong><span>' +
          ent.region +
          '</span></button>'
        );
      })
      .join('');
    box.querySelectorAll('[data-ent]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectEnterprise(btn.getAttribute('data-ent'));
      });
    });
  }

  function mountUi() {
    var welcome = document.querySelector('.cta-welcome');
    if (!welcome || document.getElementById('gl-kernel-panel')) return;

    var pack = global.JidongGroupData;
    var kernel = global.DemoSceneKernel;
    if (!pack || !kernel) return;

    var panel = document.createElement('section');
    panel.id = 'gl-kernel-panel';
    panel.className = 'gl-kernel-panel';
    panel.setAttribute('aria-label', '集团碳账本能力入口');
    panel.innerHTML =
      '<div class="gl-kernel-dialog">' +
      '<label class="gl-kernel-dialog__label" for="gl-kernel-search">搜索 / 对话</label>' +
      '<div class="gl-kernel-dialog__box">' +
      '<input id="gl-kernel-search" type="search" autocomplete="off" ' +
      'placeholder="输入企业关键词（如北水）或对标问题，例如：给我进行一下今年的对标分析" />' +
      '<button type="button" class="gl-kernel-dialog__go" id="gl-kernel-go" title="发送到对话框">发送</button>' +
      '<div id="gl-kernel-suggest" class="gl-kernel-suggest" hidden></div>' +
      '</div>' +
      '<p class="gl-kernel-current">当前分析企业：<strong id="gl-kernel-enterprise">' +
      pack.enterpriseName +
      '</strong><span class="gl-kernel-current__scope"> · 仅冀东范围</span></p>' +
      '</div>' +
      '<div class="gl-kernel-caps" id="gl-kernel-caps" role="list"></div>';

    var desc = welcome.querySelector('.cta-welcome__desc');
    var askSection = welcome.querySelector('.cta-welcome__section--ask');
    if (desc && askSection) {
      welcome.insertBefore(panel, askSection);
    } else if (desc && desc.parentNode) {
      desc.parentNode.insertBefore(panel, desc.nextSibling);
    } else {
      welcome.appendChild(panel);
    }

    var caps = document.getElementById('gl-kernel-caps');
    kernel.capabilities.forEach(function (cap) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gl-kernel-cap';
      btn.setAttribute('role', 'listitem');
      btn.setAttribute('data-cap', cap.id);
      if (cap.accent) btn.setAttribute('data-accent', cap.accent);
      if (cap.id === 'qa') btn.classList.add('gl-kernel-cap--qa');
      if (cap.id === 'benchmark' || cap.accent === 'warn') btn.classList.add('gl-kernel-cap--bench');
      if (cap.active) btn.classList.add('is-active');
      btn.innerHTML =
        '<span class="gl-kernel-cap__title">' +
        cap.label +
        '</span>' +
        '<span class="gl-kernel-cap__hint">' +
        (cap.id === 'qa'
          ? '通用问答'
          : cap.id === 'askData'
            ? '指标问数'
            : cap.id === 'benchmark'
              ? '对标分析'
              : cap.id === 'trade'
                ? '碳交易助手'
                : '扩展能力') +
        '</span>';
      btn.addEventListener('click', function () {
        setActiveCapability(cap.id);
        var input = document.getElementById('cta-input');
        var search = document.getElementById('gl-kernel-search');
        if (cap.id === 'benchmark') {
          var prompt = '给我进行一下今年的对标分析';
          if (search) search.value = prompt;
          if (input) {
            input.value = prompt;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.focus();
          }
        } else if (input && search && search.value.trim()) {
          input.value = search.value.trim();
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.focus();
        }
      });
      caps.appendChild(btn);
    });

    var search = document.getElementById('gl-kernel-search');
    var goBtn = document.getElementById('gl-kernel-go');

    function pushSearchToChat() {
      var q = search.value.trim();
      if (!q) return;
      var input = document.getElementById('cta-input');
      var sendBtn = document.getElementById('cta-send');
      if (input) {
        input.value = q;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (sendBtn && !sendBtn.disabled) sendBtn.click();
    }

    search.addEventListener('input', function () {
      var q = search.value.trim();
      if (!q || /对标|分析|查询|对比/.test(q)) {
        hideSuggest();
        return;
      }
      renderSuggest(pack.searchEnterprises(q));
    });
    search.addEventListener('focus', function () {
      var q = search.value.trim();
      if (q && !/对标|分析|查询|对比/.test(q)) {
        renderSuggest(pack.searchEnterprises(q || '北水'));
      }
    });
    search.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        hideSuggest();
        pushSearchToChat();
      }
    });
    goBtn.addEventListener('click', function () {
      hideSuggest();
      pushSearchToChat();
    });
    document.addEventListener('click', function (ev) {
      if (!panel.contains(ev.target)) hideSuggest();
    });
  }

  function boot() {
    if (!global.DemoSceneProfile || global.DemoSceneProfile.id !== 'group-ledger') return;
    patchDataService();
    if (global.document.readyState === 'loading') {
      global.document.addEventListener('DOMContentLoaded', function () {
        patchDataService();
        mountUi();
      });
    } else {
      mountUi();
    }
    // 脚本在 agent 之后加载时再补一次
    setTimeout(function () {
      patchDataService();
      mountUi();
    }, 0);
  }

  boot();
})(window);
