/**
 * 绿色低碳管理平台内核桥接：企业/工序录入、材料上传、能力模块、报告挂接
 */
(function (global) {
  'use strict';

  function patchDataService() {
    var pack = global.GreenPlatformData;
    var ds = global.BenchmarkDataService;
    if (!pack || !ds) return;

    ds.DISPLAY.SELF = pack.enterpriseName;
    ds.DISPLAY.INDUSTRY_AVG = '行业均值';
    ds.DISPLAY.BENCHMARK = '行业标杆（前5%）';
    ds.DISPLAY.COMPARE_TARGET = '同类标杆企业';
    ds.DISPLAY.PEER_MASK = '某制造企业';

    ds.getEnterpriseProfile = function (slots) {
      var key =
        typeof ds.getPeriodKey === 'function'
          ? ds.getPeriodKey(slots || {})
          : (slots && slots.timeValue) || String(new Date().getFullYear());
      return pack.getPeriod(key);
    };

    if (!ds._gpPatchedDemo) {
      ds._gpPatchedDemo = true;
      var origDemo = ds.getDemoIntensity;
      ds.getDemoIntensity = function (industry, slots) {
        var profile = pack.getPeriod(
          slots && typeof ds.getPeriodKey === 'function'
            ? ds.getPeriodKey(slots)
            : String(new Date().getFullYear())
        );
        if (profile && profile.co2Intensity != null) return profile.co2Intensity;
        return origDemo.call(ds, industry || pack.industry, slots);
      };
    }

    if (!ds._gpPatchedBuild && typeof ds.buildResultByFocus === 'function') {
      ds._gpPatchedBuild = true;
      var origBuild = ds.buildResultByFocus;
      ds.buildResultByFocus = function (slots, source, text) {
        slots.industry = pack.industry || '钢铁';
        slots.objectDimension = 'process';
        return origBuild.call(ds, slots, source, text);
      };
    }

    if (global.BenchmarkSlotFilling && !global.BenchmarkSlotFilling._gpPatched) {
      global.BenchmarkSlotFilling._gpPatched = true;
      var origApply = global.BenchmarkSlotFilling.applyDefaults;
      global.BenchmarkSlotFilling.applyDefaults = function (text) {
        origApply.call(this, text);
        this.slots.industry = pack.industry || '钢铁';
        this.slots.objectDimension = 'process';
        if (
          global.DemoSceneKernel &&
          global.DemoSceneKernel.detectYearlyBenchmarkIntent &&
          global.DemoSceneKernel.detectYearlyBenchmarkIntent(text)
        ) {
          this.slots.timeDimension = 'yearly';
          this.slots.timeValue = global.DemoSceneKernel.resolveYearPeriod(text);
          this.slots.functionType = 'comparison';
          this.slots.queryFocus = 'comprehensive';
        }
        return this.getSlots();
      };
    }

    if (global.BenchmarkReport && !global.BenchmarkReport._gpPatchedName) {
      global.BenchmarkReport._gpPatchedName = true;
      global.BenchmarkReport._resolveEnterpriseName = function () {
        return pack.enterpriseName || '绿色低碳企业';
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

  function readProcessesFromUi() {
    var rows = document.querySelectorAll('#gp-process-body tr');
    var list = [];
    rows.forEach(function (tr, i) {
      var name = tr.querySelector('[data-f="name"]');
      var intensity = tr.querySelector('[data-f="intensity"]');
      var output = tr.querySelector('[data-f="output"]');
      if (!name) return;
      list.push({
        id: 'p' + (i + 1),
        name: name.value.trim() || '工序' + (i + 1),
        intensity: parseFloat(intensity && intensity.value) || 0,
        output: parseFloat(output && output.value) || 0,
        unit: 'tCO₂/t',
      });
    });
    return list;
  }

  function syncFromUi() {
    var pack = global.GreenPlatformData;
    if (!pack) return;
    var nameInput = document.getElementById('gp-enterprise-name');
    if (nameInput) pack.setEnterpriseName(nameInput.value);
    pack.setProcesses(readProcessesFromUi());
    patchDataService();
  }

  function renderProcessRows() {
    var pack = global.GreenPlatformData;
    var body = document.getElementById('gp-process-body');
    if (!pack || !body) return;
    body.innerHTML = pack.processes
      .map(function (p) {
        return (
          '<tr>' +
          '<td><input data-f="name" type="text" value="' +
          p.name.replace(/"/g, '&quot;') +
          '" /></td>' +
          '<td><input data-f="intensity" type="number" step="0.01" min="0" value="' +
          p.intensity +
          '" /></td>' +
          '<td><input data-f="output" type="number" step="0.1" min="0" value="' +
          (p.output || 0) +
          '" /></td>' +
          '<td><button type="button" class="gp-kernel-btn gp-remove-row">删除</button></td>' +
          '</tr>'
        );
      })
      .join('');
    body.querySelectorAll('.gp-remove-row').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tr = btn.closest('tr');
        if (tr && body.querySelectorAll('tr').length > 1) tr.remove();
        syncFromUi();
      });
    });
    body.querySelectorAll('input').forEach(function (input) {
      input.addEventListener('change', syncFromUi);
    });
  }

  function renderUploads() {
    var pack = global.GreenPlatformData;
    var list = document.getElementById('gp-upload-list');
    if (!pack || !list) return;
    if (!pack.uploads.length) {
      list.innerHTML = '<li style="border:0;color:#98a2b3">尚未上传材料</li>';
      return;
    }
    list.innerHTML = pack.uploads
      .map(function (u) {
        var cat =
          u.category === 'annual' ? '年报' : u.category === 'strategy' ? '五年行动方案' : '其他材料';
        return (
          '<li data-id="' +
          u.id +
          '"><div><strong>' +
          u.name +
          '</strong><span>' +
          cat +
          ' · ' +
          u.summary +
          '</span></div>' +
          '<button type="button" data-remove="' +
          u.id +
          '">移除</button></li>'
        );
      })
      .join('');
    list.querySelectorAll('[data-remove]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        pack.removeUpload(btn.getAttribute('data-remove'));
        renderUploads();
      });
    });
  }

  function setActiveCapability(id) {
    var kernel = global.DemoSceneKernel;
    if (!kernel) return;
    kernel.capabilities.forEach(function (c) {
      c.active = c.id === id;
    });
    document.querySelectorAll('.gp-kernel-cap').forEach(function (btn) {
      var on = btn.getAttribute('data-cap') === id;
      btn.classList.toggle('is-active', on);
      btn.classList.toggle('is-warn', on && btn.getAttribute('data-accent') === 'warn');
    });
  }

  function handleFiles(fileList, category) {
    var pack = global.GreenPlatformData;
    if (!pack || !fileList) return;
    Array.prototype.forEach.call(fileList, function (file) {
      var cat = category || pack.classifyUpload(file.name);
      pack.addUpload({
        name: file.name,
        size: file.size,
        type: file.type,
        category: cat,
        summary: pack.mockParseSummary(file.name, cat),
      });
    });
    renderUploads();
  }

  function mountUi() {
    var welcome = document.querySelector('.cta-welcome');
    if (!welcome || document.getElementById('gp-kernel-panel')) return;
    var pack = global.GreenPlatformData;
    var kernel = global.DemoSceneKernel;
    if (!pack || !kernel) return;

    var panel = document.createElement('section');
    panel.id = 'gp-kernel-panel';
    panel.className = 'gp-kernel-panel';
    panel.innerHTML =
      '<div class="gp-kernel-panel__head">' +
      '<span class="gp-kernel-panel__tag">绿色低碳管理平台内核</span>' +
      '<span class="gp-kernel-panel__scope">报告范围：仅输入的企业与工序</span>' +
      '</div>' +
      '<label class="gp-kernel-field">' +
      '<span class="gp-kernel-field__label">1. 企业名称</span>' +
      '<input id="gp-enterprise-name" type="text" value="' +
      pack.enterpriseName.replace(/"/g, '&quot;') +
      '" placeholder="请输入要分析的企业名称" />' +
      '</label>' +
      '<div class="gp-kernel-field">' +
      '<span class="gp-kernel-field__label">2. 工序碳排放数值（强度 tCO₂/t · 产量 万吨）</span>' +
      '<table class="gp-kernel-process-table"><thead><tr><th>工序名称</th><th>强度</th><th>产量</th><th></th></tr></thead>' +
      '<tbody id="gp-process-body"></tbody></table>' +
      '<div class="gp-kernel-actions">' +
      '<button type="button" class="gp-kernel-btn" id="gp-add-process">+ 添加工序</button>' +
      '<button type="button" class="gp-kernel-btn gp-kernel-btn--primary" id="gp-sync-process">保存工序数据</button>' +
      '</div></div>' +
      '<div class="gp-kernel-upload">' +
      '<span class="gp-kernel-field__label">3. 上传材料（Excel / Word / PDF）</span>' +
      '<div class="gp-kernel-upload__row">' +
      '<label class="gp-kernel-btn">年报<input id="gp-file-annual" type="file" accept=".xlsx,.xls,.doc,.docx,.pdf" hidden multiple /></label>' +
      '<label class="gp-kernel-btn">五年行动方案<input id="gp-file-strategy" type="file" accept=".xlsx,.xls,.doc,.docx,.pdf" hidden multiple /></label>' +
      '<label class="gp-kernel-btn">其他材料<input id="gp-file-misc" type="file" accept=".xlsx,.xls,.doc,.docx,.pdf,.txt" hidden multiple /></label>' +
      '</div>' +
      '<p class="gp-kernel-upload__hint">演示环境对文件做结构识别与摘要生成，不上传到外部服务器。</p>' +
      '<ul class="gp-kernel-files" id="gp-upload-list"></ul>' +
      '</div>' +
      '<div class="gp-kernel-caps" id="gp-kernel-caps"></div>';

    var desc = welcome.querySelector('.cta-welcome__desc');
    if (desc && desc.parentNode) desc.parentNode.insertBefore(panel, desc.nextSibling);
    else welcome.appendChild(panel);

    renderProcessRows();
    renderUploads();

    document.getElementById('gp-enterprise-name').addEventListener('change', syncFromUi);
    document.getElementById('gp-add-process').addEventListener('click', function () {
      syncFromUi();
      pack.processes.push({
        id: 'p' + (pack.processes.length + 1),
        name: '新增工序',
        intensity: 0.5,
        output: 10,
        unit: 'tCO₂/t',
      });
      renderProcessRows();
      syncFromUi();
    });
    document.getElementById('gp-sync-process').addEventListener('click', function () {
      syncFromUi();
      var btn = document.getElementById('gp-sync-process');
      btn.textContent = '已保存';
      setTimeout(function () {
        btn.textContent = '保存工序数据';
      }, 1200);
    });
    document.getElementById('gp-file-annual').addEventListener('change', function (ev) {
      handleFiles(ev.target.files, 'annual');
      ev.target.value = '';
    });
    document.getElementById('gp-file-strategy').addEventListener('change', function (ev) {
      handleFiles(ev.target.files, 'strategy');
      ev.target.value = '';
    });
    document.getElementById('gp-file-misc').addEventListener('change', function (ev) {
      handleFiles(ev.target.files, 'misc');
      ev.target.value = '';
    });

    var caps = document.getElementById('gp-kernel-caps');
    kernel.capabilities.forEach(function (cap) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gp-kernel-cap' + (cap.active ? ' is-active' : '');
      if (cap.accent) btn.setAttribute('data-accent', cap.accent);
      if (cap.active && cap.accent === 'warn') btn.classList.add('is-warn');
      btn.setAttribute('data-cap', cap.id);
      btn.textContent = cap.label;
      btn.addEventListener('click', function () {
        setActiveCapability(cap.id);
        syncFromUi();
        var input = document.getElementById('cta-input');
        if (cap.id === 'benchmark' && input && !input.value.trim()) {
          input.value = '基于已录入工序，给我进行一下今年的对标分析';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      caps.appendChild(btn);
    });
  }

  function boot() {
    if (!global.DemoSceneProfile || global.DemoSceneProfile.id !== 'green-platform') return;
    patchDataService();
    if (global.document.readyState === 'loading') {
      global.document.addEventListener('DOMContentLoaded', function () {
        patchDataService();
        mountUi();
      });
    } else {
      mountUi();
    }
    setTimeout(function () {
      patchDataService();
      mountUi();
    }, 0);
  }

  boot();
})(window);
