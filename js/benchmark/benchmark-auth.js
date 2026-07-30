/**
 * 数据对标智能体 - 认证已禁用（无需登录）
 */
var BenchmarkAuthState = {
  guestMode: false,
  pendingResult: null,
  loginPromptVisible: false,

  reset: function () {
    this.pendingResult = null;
    this.loginPromptVisible = false;
  },

  isLoggedIn: function () {
    return true;
  },

  canSave: function () {
    return true;
  },

  isGuest: function () {
    return false;
  },
};

var BenchmarkLoginPrompt = {
  render: function () { return ''; },
  init: function () {},
  open: function () {},
  close: function () {},
};

var BenchmarkAuthGuard = {
  shouldInterrupt: function () {
    return false;
  },

  interrupt: function () {},

  onLoginSuccess: function () {},

  resumePending: function () {},

  requireSaveAuth: function () {
    return true;
  },

  canSave: function () {
    return true;
  },
};

var BenchmarkSessionStore = {
  STORAGE_KEY: 'data_benchmark_sessions',

  getStorageKey: function () {
    var scene = window.DemoSceneProfile || {};
    return scene.sessionStoreKey || this.STORAGE_KEY;
  },

  getUserKey: function () {
    return 'default';
  },

  getAll: function () {
    try {
      var all = JSON.parse(localStorage.getItem(this.getStorageKey()) || '{}');
      return all[this.getUserKey()] || [];
    } catch (e) {
      return [];
    }
  },

  saveCurrent: function (messages, slots, result) {
    if (!result || result.type !== 'result') return false;
    var key = this.getUserKey();
    var summary = typeof BenchmarkSlotFilling !== 'undefined'
      ? BenchmarkSlotFilling.buildSummary()
      : '对标分析';
    var entry = {
      id: 'b_' + Date.now(),
      summary: summary,
      slots: slots,
      createdAt: Date.now(),
      messageCount: (messages || []).length,
    };
    try {
      var all = JSON.parse(localStorage.getItem(this.getStorageKey()) || '{}');
      var list = all[key] || [];
      list.unshift(entry);
      if (list.length > 20) list = list.slice(0, 20);
      all[key] = list;
      localStorage.setItem(this.getStorageKey(), JSON.stringify(all));
      return true;
    } catch (e) {
      return false;
    }
  },
};
