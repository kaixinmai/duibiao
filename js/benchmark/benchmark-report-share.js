/**
 * 佳华分析报告 - 分享/导出悬浮工具栏（嵌入下载 HTML）
 */
var BenchmarkReportShare = {
  buildStyles: function () {
    return '.report-shell{display:flex;justify-content:center;align-items:flex-start;gap:18px;' +
        'padding:20px 16px 48px;margin:0 auto;max-width:calc(960px + 176px)}' +
      '.share-float-bar.no-print{position:sticky;top:20px;flex:0 0 158px;align-self:flex-start;' +
        'display:flex;flex-direction:column;gap:6px;padding:12px 14px;' +
        'background:linear-gradient(180deg,#ffffff 0%,#fafffe 100%);' +
        'border:1px solid rgba(200,230,201,.85);border-radius:12px;' +
        'box-shadow:' +
          '0 1px 2px rgba(12,35,64,.05),' +
          '0 4px 10px rgba(12,35,64,.07),' +
          '0 12px 28px rgba(12,35,64,.11),' +
          '0 24px 48px rgba(11,110,58,.08),' +
          'inset 0 1px 0 rgba(255,255,255,.95);' +
        'transition:box-shadow .28s ease,transform .28s ease;z-index:100}' +
      '.share-float-bar.no-print:hover{' +
        'transform:translateY(-2px);' +
        'box-shadow:' +
          '0 2px 4px rgba(12,35,64,.06),' +
          '0 8px 18px rgba(12,35,64,.1),' +
          '0 18px 40px rgba(12,35,64,.14),' +
          '0 32px 64px rgba(11,110,58,.1),' +
          'inset 0 1px 0 rgba(255,255,255,1)}' +
      '@media (max-width:1140px){.report-shell{flex-direction:column;align-items:center;max-width:960px}' +
        '.share-float-bar.no-print{position:fixed;top:16px;right:16px;flex:none}}' +
      '.share-float-bar__label{margin:0 0 4px;padding:0 2px;font-size:11px;font-weight:600;color:#0c2340;letter-spacing:.04em}' +
      '.share-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:8px;font-size:12px;' +
        'font-family:inherit;cursor:pointer;border:1px solid #e0e6ed;background:#fff;color:#333;' +
        'transition:all .2s ease;white-space:nowrap;width:100%;box-sizing:border-box;' +
        'box-shadow:0 1px 2px rgba(12,35,64,.04)}' +
      '.share-btn:hover{border-color:#0b6e3a;color:#0b6e3a;background:#f6fffb;' +
        'box-shadow:0 2px 8px rgba(11,110,58,.12);transform:translateY(-1px)}' +
      '.share-btn--primary{background:linear-gradient(180deg,#0d7a3f 0%,#0b6e3a 100%);border-color:#0a6434;color:#fff;' +
        'box-shadow:0 2px 6px rgba(11,110,58,.28),inset 0 1px 0 rgba(255,255,255,.15)}' +
      '.share-btn--primary:hover{background:linear-gradient(180deg,#0b6e3a 0%,#095c31 100%);' +
        'border-color:#095c31;color:#fff;box-shadow:0 4px 12px rgba(11,110,58,.35)}' +
      '.share-btn:disabled{opacity:.55;cursor:not-allowed}' +
      '.share-btn__icon{font-size:14px;line-height:1;flex-shrink:0}' +
      '.share-toast.no-print{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:10001;' +
        'max-width:min(90vw,480px);padding:10px 18px;border-radius:8px;font-size:12px;line-height:1.5;' +
        'background:rgba(12,35,64,.88);color:#fff;box-shadow:0 4px 20px rgba(0,0,0,.2);' +
        'opacity:0;pointer-events:none;transition:opacity .25s ease;text-align:center}' +
      '.share-toast.is-visible{opacity:1}' +
      '.share-toast.is-error{background:rgba(207,19,34,.92)}' +
      '.share-toast.is-success{background:rgba(11,110,58,.92)}' +
      '.share-modal{position:fixed;inset:0;z-index:10002;display:flex;align-items:center;justify-content:center;padding:24px}' +
      '.share-modal[hidden]{display:none!important}' +
      '.share-modal__backdrop{position:absolute;inset:0;background:rgba(0,0,0,.52)}' +
      '.share-modal__panel{position:relative;width:min(920px,100%);max-height:90vh;background:#fff;border-radius:12px;' +
        'box-shadow:0 20px 60px rgba(0,0,0,.25);display:flex;flex-direction:column;overflow:hidden}' +
      '.share-modal__head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #e6eaf0}' +
      '.share-modal__head h3{margin:0;font-size:16px;color:#0c2340}' +
      '.share-modal__close{width:32px;height:32px;border:none;background:#f4f6f9;border-radius:6px;font-size:20px;line-height:1;cursor:pointer;color:#5a6472}' +
      '.share-modal__close:hover{background:#e8f5e9;color:#0b6e3a}' +
      '.share-modal__body{flex:1;overflow:auto;padding:16px 20px;background:#f4f6f9;text-align:center}' +
      '.share-modal__body img{max-width:100%;height:auto;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,.12)}' +
      '.share-modal__foot{display:flex;justify-content:flex-end;gap:10px;padding:14px 20px;border-top:1px solid #e6eaf0}' +
      '.share-capture-clone{background:#fff;width:960px}' +
      '@media print{' +
        'body{background:#fff!important}' +
        '.report-shell{display:block!important;padding:0!important;max-width:100%!important}' +
        '.share-float-bar,.share-toast,.share-modal,.no-print{display:none!important;visibility:hidden!important}' +
        '.page{box-shadow:none!important;max-width:100%!important;margin:0!important}' +
        '.header,.grade-badge,.kpi,.ai-box,.chart-block img,.exec-box,.potential-summary{' +
          '-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}' +
        '.section{page-break-inside:avoid}' +
        '.section h2{page-break-after:avoid}' +
        '.chart-block{page-break-inside:avoid}' +
        '.footer{margin-top:24px}' +
        '@page{size:A4;margin:14mm 16mm}' +
      '}';
  },

  buildFloatBarHTML: function () {
    return '<div class="share-float-bar no-print" id="shareToolbar" role="toolbar" aria-label="报告分享与导出">' +
      '<p class="share-float-bar__label">分享 / 导出</p>' +
      '<button type="button" class="share-btn share-btn--primary" id="shareWechatBtn" title="生成微信/企微长图">' +
        '<span class="share-btn__icon">📱</span>微信长图</button>' +
      '<button type="button" class="share-btn" id="shareEmailBtn" title="邮件分享">' +
        '<span class="share-btn__icon">✉️</span>邮件分享</button>' +
      '<button type="button" class="share-btn" id="sharePdfBtn" title="导出 PDF">' +
        '<span class="share-btn__icon">📄</span>导出 PDF</button>' +
      '<button type="button" class="share-btn" id="sharePrintBtn" title="打印报告">' +
        '<span class="share-btn__icon">🖨️</span>打印</button>' +
    '</div>';
  },

  buildOverlaysHTML: function () {
    return '<p class="share-toast no-print" id="shareStatus" aria-live="polite"></p>' +
      '<div class="share-modal no-print" id="shareImageModal" hidden>' +
      '<div class="share-modal__backdrop" id="shareModalBackdrop"></div>' +
      '<div class="share-modal__panel" role="dialog" aria-labelledby="shareModalTitle">' +
        '<div class="share-modal__head">' +
          '<h3 id="shareModalTitle">微信 / 企微长图预览</h3>' +
          '<button type="button" class="share-modal__close" id="shareModalClose" aria-label="关闭">×</button>' +
        '</div>' +
        '<div class="share-modal__body"><img id="sharePreviewImg" alt="佳华分析报告长图预览"/></div>' +
        '<div class="share-modal__foot">' +
          '<button type="button" class="share-btn" id="shareModalCancel">关闭</button>' +
          '<button type="button" class="share-btn share-btn--primary" id="shareSaveImageBtn">保存到本地</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  },

  /** @deprecated 兼容旧调用 */
  buildToolbarHTML: function () {
    return this.buildFloatBarHTML() + this.buildOverlaysHTML();
  },

  buildScripts: function (meta) {
    var emailSubject = this._jsStr(meta.emailSubject || '【佳华分析报告】企业碳效对标诊断');
    var emailBody = this._jsStr(meta.emailBody || '');
    var pdfFileName = this._jsStr(meta.pdfFileName || '佳华分析报告.pdf');
    var imageFileName = this._jsStr(meta.imageFileName || '佳华分析报告长图.png');

    return '<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"><\/script>' +
      '<script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js"><\/script>' +
      '<script>(function(){' +
        'var META={emailSubject:' + emailSubject + ',emailBody:' + emailBody +
          ',pdfFileName:' + pdfFileName + ',imageFileName:' + imageFileName + '};' +
        'var statusEl=document.getElementById("shareStatus");' +
        'var modal=document.getElementById("shareImageModal");' +
        'var previewImg=document.getElementById("sharePreviewImg");' +
        'var toastTimer=null;' +
        'function setStatus(msg,type){if(!statusEl)return;if(toastTimer)clearTimeout(toastTimer);' +
          'if(!msg){statusEl.textContent="";statusEl.className="share-toast no-print";return;}' +
          'statusEl.textContent=msg;statusEl.className="share-toast no-print is-visible"+(type?" is-"+type:"");' +
          'toastTimer=setTimeout(function(){statusEl.classList.remove("is-visible");},type==="error"?5000:3500);}' +
        'function setBusy(btn,busy){if(!btn)return;btn.disabled=!!busy;' +
          'if(!btn.dataset.label)btn.dataset.label=btn.textContent;' +
          'btn.textContent=busy?"…":btn.dataset.label;}' +
        'function waitImages(root){var imgs=root.querySelectorAll("img");' +
          'return Promise.all(Array.prototype.map.call(imgs,function(img){' +
            'if(img.complete&&img.naturalWidth)return Promise.resolve();' +
            'return new Promise(function(res){img.onload=img.onerror=res;});' +
          '}));}' +
        'function raf2(){return new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r);});});}' +
        'function ensureLibs(){if(typeof html2canvas==="undefined")throw new Error("html2canvas 加载失败，请检查网络");' +
          'var J=window.jspdf&&window.jspdf.jsPDF?window.jspdf.jsPDF:(typeof jspdf!=="undefined"&&jspdf.jsPDF?jspdf.jsPDF:null);' +
          'if(!J)throw new Error("jsPDF 加载失败，请检查网络");return J;}' +
        'function captureNode(node,scale){return waitImages(node).then(raf2).then(function(){' +
          'return html2canvas(node,{scale:scale||2,useCORS:true,allowTaint:true,logging:false,backgroundColor:"#ffffff",' +
            'imageTimeout:15000,windowWidth:node.scrollWidth});});}' +
        'function hideNoPrint(root){root.querySelectorAll(".no-print").forEach(function(el){' +
          'el.dataset.shareHidden="1";el.style.display="none";});}' +
        'function restoreNoPrint(root){root.querySelectorAll("[data-share-hidden]").forEach(function(el){' +
          'el.style.display="";delete el.dataset.shareHidden;});}' +
        'function openModal(dataUrl){previewImg.src=dataUrl;modal.hidden=false;document.body.style.overflow="hidden";}' +
        'function closeModal(){modal.hidden=true;document.body.style.overflow="";}' +
        'function saveDataUrl(dataUrl,name){var a=document.createElement("a");a.href=dataUrl;a.download=name;' +
          'a.style.display="none";document.body.appendChild(a);a.click();document.body.removeChild(a);}' +
        'function dataUrlToPdf(canvas,JsPDF,fileName){var pdf=new JsPDF("p","mm","a4");' +
          'var pageW=pdf.internal.pageSize.getWidth();var pageH=pdf.internal.pageSize.getHeight();' +
          'var imgW=pageW;var imgH=canvas.height*imgW/canvas.width;var data=canvas.toDataURL("image/jpeg",0.92);' +
          'var left=imgH;var y=0;pdf.addImage(data,"JPEG",0,y,imgW,imgH);left-=pageH;' +
          'while(left>0){pdf.addPage();y=left-imgH;pdf.addImage(data,"JPEG",0,y,imgW,imgH);left-=pageH;}' +
          'pdf.save(fileName);}' +
        'function buildShareCaptureRoot(){var wrap=document.createElement("div");' +
          'wrap.className="share-capture-clone";' +
          'wrap.style.cssText="position:fixed;left:-10000px;top:0;width:960px;background:#fff;z-index:-1;overflow:hidden";' +
          '[".page > .header",".page > .meta-bar","#s1","#s2","#s3"].forEach(function(sel){' +
            'var el=document.querySelector(sel);if(!el)return;var clone=el.cloneNode(true);' +
            'clone.querySelectorAll(".no-print").forEach(function(n){n.remove();});' +
            'wrap.appendChild(clone);});' +
          'document.body.appendChild(wrap);return wrap;}' +
        'function bind(id,fn){var el=document.getElementById(id);if(el)el.addEventListener("click",fn);}' +
        'bind("shareWechatBtn",function(){var btn=this;var zone=buildShareCaptureRoot();' +
          'if(!zone.childNodes.length){zone.remove();setStatus("未找到截图内容","error");return;}' +
          'setBusy(btn,true);setStatus("正在生成长图…");' +
          'captureNode(zone,2).then(function(canvas){zone.remove();' +
            'openModal(canvas.toDataURL("image/png"));setStatus("长图已生成，可保存后转发","success");' +
          '}).catch(function(e){zone.remove();setStatus(e.message||"长图生成失败","error");' +
          '}).finally(function(){setBusy(btn,false);});});' +
        'bind("shareSaveImageBtn",function(){if(!previewImg.src)return;' +
          'saveDataUrl(previewImg.src,META.imageFileName);setStatus("长图已保存","success");});' +
        'bind("shareEmailBtn",function(){' +
          'window.location.href="mailto:?subject="+encodeURIComponent(META.emailSubject)+' +
            '"&body="+encodeURIComponent(META.emailBody);setStatus("已唤起邮件客户端","success");});' +
        'bind("sharePdfBtn",function(){var btn=this;var page=document.querySelector(".page");' +
          'if(!page){setStatus("未找到报告","error");return;}' +
          'setBusy(btn,true);setStatus("正在导出 PDF…");hideNoPrint(document.body);' +
          'captureNode(page,2).then(function(canvas){dataUrlToPdf(canvas,ensureLibs(),META.pdfFileName);' +
            'setStatus("PDF 已下载","success");' +
          '}).catch(function(e){setStatus(e.message||"PDF 失败","error");' +
          '}).finally(function(){restoreNoPrint(document.body);setBusy(btn,false);});});' +
        'bind("sharePrintBtn",function(){window.print();});' +
        '["shareModalClose","shareModalCancel","shareModalBackdrop"].forEach(function(id){bind(id,closeModal);});' +
      '})();<\/script>';
  },

  buildEmailBody: function (opts) {
    opts = opts || {};
    var lines = [
      '您好，',
      '',
      '附件/链接为《佳华分析报告》核心摘要，供内部审阅与决策参考：',
      '',
      '【综合评级】' + (opts.grade || '—') + ' 级（' + (opts.gradeLabel || '—') + '）',
      opts.rankLine || '',
      opts.summaryLine || '',
      '',
      '【核心结论】',
      opts.conclusion || '（详见完整 HTML 报告）',
      '',
      '【AI 诊断摘要】',
      opts.gradeSummary || '',
      '',
      '完整报告请打开下载的 HTML 文件查看，或通过数字碳表系统重新生成。',
      '',
      '—— 佳华科技 · 数字碳表 · 碳对标智能体'
    ];
    return lines.filter(function (l) { return l !== ''; }).join('\n');
  },

  buildCompareEmailBody: function (opts) {
    opts = opts || {};
    var execText = (opts.execLines || []).join('\n');
    var lines = [
      '您好，',
      '',
      '附件/链接为《企业间对标分析报告》核心摘要，供内部审阅与决策参考：',
      '',
      '【分析对象】本企业 vs 某对标企业（脱敏样本）',
      '【综合评级】' + (opts.grade || '—') + ' 级（' + (opts.gradeLabel || '—') + '）',
      opts.gapLine || '',
      '',
      '【核心摘要】',
      execText || '（详见完整 HTML 报告）',
      '',
      '完整报告请打开下载的 HTML 文件查看，或通过数字碳表系统重新生成。',
      '',
      '—— 佳华科技 · 数字碳表 · 碳对标智能体'
    ];
    return lines.filter(function (l) { return l !== ''; }).join('\n');
  },

  _jsStr: function (s) {
    return JSON.stringify(String(s || ''));
  }
};
