/**
 * 碳对标智能体 - 品牌视觉、数据源与报告参考资料配置
 * 头像路径上线时可替换为 CDN 地址：BenchmarkBrand.agentAvatarSrc = 'https://cdn.example.com/agent.png'
 */
var BenchmarkBrand = {
  /** 智能体头像（项目内相对路径，便于静态部署） */
  agentAvatarSrc: 'assets/dual-carbon-agent-avatar.png',
  /** 头像加载失败时的首字母兜底 */
  agentAvatarFallback: '数',
  agentDisplayName: '数据对标智能体',

  /** 佳华科技五大核心数据源 */
  dataSources: {
    knowledgeBase: '数字佳华双碳知识库',
    cloudMap: '双碳云图数据',
    carbonPlatform: '碳平台生产系统数据',
    deviceMgmt: '设备管理系统数据',
    tianyancha: '天眼查数据'
  },

  reportBrandName: '钢铁企业智能对标分析报告',

  /** 渲染 AI 消息头像 HTML（含 onerror 降级） */
  renderAgentAvatarHTML: function () {
    var src = this.agentAvatarSrc;
    var fallback = this.escapeHTML(this.agentAvatarFallback);
    var name = this.escapeHTML(this.agentDisplayName);
    return '<div class="benchmark-msg__avatar benchmark-msg__avatar--agent" title="' + name + '">' +
      '<img src="' + src + '" alt="' + name + '" ' +
        'onerror="BenchmarkBrand.handleAvatarError(this)">' +
      '<span class="benchmark-agent-avatar-fallback" aria-hidden="true">' + fallback + '</span>' +
    '</div>';
  },

  /** 头像加载失败：隐藏图片，展示首字母占位 */
  handleAvatarError: function (imgEl) {
    if (!imgEl || !imgEl.parentNode) return;
    imgEl.onerror = null;
    imgEl.style.display = 'none';
    imgEl.parentNode.classList.add('is-fallback');
  },

  /** 报告内「参考资料」章节 HTML */
  buildReferencesHTML: function () {
    var ds = this.dataSources;
    var dataItems = [
      '【' + ds.knowledgeBase + '】佳华科技自研双碳领域知识图谱、政策法规与行业案例库',
      '【' + ds.cloudMap + '】全国及区域碳排放、能源结构与产业分布可视化数据',
      '【' + ds.carbonPlatform + '】企业生产工序、产量与碳排放核算实时数据',
      '【' + ds.deviceMgmt + '】重点用能设备运行参数、能效监测与运维记录',
      '【' + ds.tianyancha + '】企业工商信息、行业分类与公开披露的经营数据'
    ];
    var policyItems = [
      '《企业温室气体排放核算方法与报告指南》',
      '《工业企业温室气体排放核算和报告通则》（GB/T 32150）',
      '《碳排放权交易管理办法（试行）》',
      '《佳华科技双碳白皮书》',
      '《佳华科技数字碳表产品技术白皮书》',
      '《重点行业企业温室气体排放核算方法与报告指南（试行）》'
    ];

    var dataLis = dataItems.map(function (item) {
      return '<li>' + BenchmarkBrand.escapeHTML(item) + '</li>';
    }).join('');
    var policyLis = policyItems.map(function (item) {
      return '<li>' + BenchmarkBrand.escapeHTML(item) + '</li>';
    }).join('');

    return '<div class="section ref-section" id="s-ref">' +
      '<h2>参考资料 · References</h2>' +
      '<p class="ref-intro">本报告融合佳华科技核心数据源与权威标准编制，分析结论可追溯、可核验。</p>' +
      '<h3 class="ref-subtitle">数据来源</h3>' +
      '<ul class="ref-list">' + dataLis + '</ul>' +
      '<h3 class="ref-subtitle">政策法规与行业标准</h3>' +
      '<ul class="ref-list">' + policyLis + '</ul>' +
    '</div>';
  },

  /** 报告 CSS 中参考资料区块样式片段 */
  referencesReportStyles: function () {
    return '.ref-section{margin-top:8px}' +
      '.ref-intro{font-size:13px;color:var(--gray);margin:0 0 16px;line-height:1.75}' +
      '.ref-subtitle{font-size:14px;color:var(--navy);margin:18px 0 10px;font-weight:600}' +
      '.ref-list{margin:0 0 8px;padding-left:22px;font-size:13px;color:#374151;line-height:1.85}' +
      '.ref-list li{margin:6px 0}';
  },

  escapeHTML: function (str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
};
