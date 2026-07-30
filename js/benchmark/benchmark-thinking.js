/**
 * 碳对标智能体 - 动态 AI 思考过程
 * 意图识别 → 动态步骤 → 打字机逐字 → 随机间隔 → 折叠 → 回调
 */
var BenchmarkThinking = {
  MIN_DURATION: 900,
  STEP_DELAY_MIN: 160,
  STEP_DELAY_MAX: 320,
  TYPE_CHAR_MS: 6,
  TYPE_CHUNK: 3,

  randomDelay: function () {
    return this.STEP_DELAY_MIN + Math.floor(Math.random() * (this.STEP_DELAY_MAX - this.STEP_DELAY_MIN));
  },

  /**
   * @param {Object} agent
   * @param {string} userText - 用户原始输入
   * @param {boolean} willShowResult
   * @param {Function} onDone
   */
  start: function (agent, userText, willShowResult, onDone) {
    var self = this;
    var slots = typeof BenchmarkSlotFilling !== 'undefined'
      ? BenchmarkSlotFilling.getSlots()
      : {};
    var intent = typeof BenchmarkIntent !== 'undefined'
      ? BenchmarkIntent.recognize(userText, slots)
      : {};
    var steps = typeof BenchmarkIntent !== 'undefined'
      ? BenchmarkIntent.buildThinkingSteps(intent, willShowResult)
      : ['正在理解您的对标需求…', '正在分析数据…', '正在组织回复…'];

    agent._clearThinkingTimers();
    agent._genId = (agent._genId || 0) + 1;
    var genId = agent._genId;
    var startedAt = Date.now();

    var panelRoot = agent.createThinkingMessage(steps);
    if (!panelRoot) {
      if (typeof onDone === 'function') onDone(null, genId);
      return genId;
    }

    var titleEl = panelRoot.querySelector('.benchmark-think-panel__title');
    var stepEls = panelRoot.querySelectorAll('.benchmark-think-step');
    var stepIndex = 0;

    function renderStepState(idx) {
      stepEls.forEach(function (li, i) {
        li.classList.toggle('is-active', i === idx);
        li.classList.toggle('is-done', i < idx);
      });
    }

    function typewriteStep(li, text, done) {
      var textEl = li.querySelector('.benchmark-think-step__text');
      if (!textEl) { done(); return; }
      var idx = 0;
      var chunk = self.TYPE_CHUNK;
      textEl.textContent = '';
      function tick() {
        if (genId !== agent._genId) return;
        idx = Math.min(text.length, idx + chunk);
        textEl.textContent = text.slice(0, idx);
        if (idx < text.length) {
          agent._thinkingTimer = setTimeout(tick, self.TYPE_CHAR_MS + Math.floor(Math.random() * 6));
        } else {
          done();
        }
      }
      tick();
    }

    function finish() {
      var elapsed = Date.now() - startedAt;
      var remain = Math.max(0, self.MIN_DURATION - elapsed);
      agent._thinkingTimer = setTimeout(function () {
        if (genId !== agent._genId || agent.phase !== 'chat') {
          agent._isProcessing = false;
          return;
        }
        if (!panelRoot.parentNode) {
          var container = document.getElementById('benchmarkMessages');
          if (container) container.appendChild(panelRoot);
        }
        agent.collapseThinkingPanel(panelRoot, steps.length);
        if (typeof onDone === 'function') onDone(panelRoot, genId);
      }, remain);
    }

    function runStep(i) {
      if (genId !== agent._genId || agent.phase !== 'chat') {
        agent._isProcessing = false;
        return;
      }
      if (i >= steps.length) {
        finish();
        return;
      }

      renderStepState(i);
      if (titleEl) titleEl.textContent = steps[i];

      typewriteStep(stepEls[i], steps[i], function () {
        stepEls[i].classList.add('is-done');
        stepEls[i].classList.remove('is-active');
        agent._thinkingTimer = setTimeout(function () {
          runStep(i + 1);
        }, self.randomDelay());
      });
    }

    runStep(0);
    return genId;
  }
};
