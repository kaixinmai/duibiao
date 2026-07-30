/**
 * 数字碳表 - 认证模块（原型模拟）
 */
var Auth = {
  STORAGE_KEY: 'sztb_logged_in',
  USER_KEY: 'sztb_user',
  PWD_KEY: 'sztb_demo_pwd',
  AGENT_ENTRY_URL: 'agent-entry.html',
  TRADITIONAL_LOGIN_URL: 'login.html',
  DEMO_USERNAME: 'admin',
  DEMO_PASSWORD: 'Sztb@Demo2026',
  REGISTRY_KEY: 'sztb_registered_users',

  defaultUser: function () {
    return {
      name: '系统管理员',
      username: 'admin',
      phone: '13800138000',
      email: 'admin@demo.com',
      dept: '碳管理部',
      role: '系统管理员'
    };
  },

  getStoredPassword: function () {
    return sessionStorage.getItem(this.PWD_KEY) || this.DEMO_PASSWORD;
  },

  getRegistry: function () {
    try {
      return JSON.parse(localStorage.getItem(this.REGISTRY_KEY) || '{}');
    } catch (e) {
      return {};
    }
  },

  saveRegistry: function (data) {
    localStorage.setItem(this.REGISTRY_KEY, JSON.stringify(data));
  },

  register: function (username, password, confirmPwd, profile) {
    username = (username || '').trim();
    if (arguments.length === 2) {
      confirmPwd = password;
      profile = {};
    } else {
      profile = profile || {};
    }
    if (!username) return { ok: false, msg: '请输入用户名' };
    if (username.length < 3 || username.length > 20) {
      return { ok: false, msg: '用户名长度需为 3–20 位' };
    }
    if (username === this.DEMO_USERNAME) {
      return { ok: false, msg: '该用户名已被占用' };
    }
    if (!password) return { ok: false, msg: '请输入密码' };
    if (password.length < 8 || password.length > 20) {
      return { ok: false, msg: '密码长度需为 8–20 位' };
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return { ok: false, msg: '密码需同时包含字母和数字' };
    }
    if (confirmPwd != null && confirmPwd !== '' && password !== confirmPwd) {
      return { ok: false, msg: '两次输入的密码不一致' };
    }

    var registry = this.getRegistry();
    if (registry[username]) {
      return { ok: false, msg: '用户名已存在，请直接登录' };
    }

    registry[username] = {
      password: password,
      name: (profile.name || '').trim() || username,
      role: '企业用户',
      dept: (profile.dept || '').trim() || '碳管理部',
      registeredAt: new Date().toISOString()
    };
    this.saveRegistry(registry);
    return { ok: true, msg: '注册成功，请登录' };
  },

  loginWithUser: function (username, userData) {
    sessionStorage.setItem(this.STORAGE_KEY, 'true');
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(Object.assign({
      name: userData.name || username,
      username: username,
      phone: '',
      email: '',
      dept: userData.dept || '碳管理部',
      role: userData.role || '企业用户'
    }, userData)));
    return true;
  },

  login: function (username, password) {
    if (!username || !password) return false;
    username = username.trim();

    if (username === this.DEMO_USERNAME && password === this.getStoredPassword()) {
      return this.loginWithUser(username, this.defaultUser());
    }

    var registry = this.getRegistry();
    var reg = registry[username];
    if (reg && reg.password === password) {
      return this.loginWithUser(username, reg);
    }

    return false;
  },

  logout: function () {
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    window.location.href = this.AGENT_ENTRY_URL;
  },

  isLoggedIn: function () {
    return sessionStorage.getItem(this.STORAGE_KEY) === 'true';
  },

  getUser: function () {
    try {
      var raw = sessionStorage.getItem(this.USER_KEY);
      if (!raw) return this.defaultUser();
      return Object.assign(this.defaultUser(), JSON.parse(raw));
    } catch (e) {
      return this.defaultUser();
    }
  },

  saveUser: function (user) {
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  updateProfile: function (data) {
    var user = this.getUser();
    var name = (data.name || '').trim();
    if (!name) return { ok: false, msg: '姓名不能为空' };
    if (data.phone && !/^1\d{10}$/.test(data.phone)) {
      return { ok: false, msg: '请输入正确的手机号' };
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return { ok: false, msg: '请输入正确的邮箱地址' };
    }
    user.name = name;
    user.phone = (data.phone || '').trim();
    user.email = (data.email || '').trim();
    user.dept = (data.dept || '').trim() || user.dept;
    this.saveUser(user);
    return { ok: true };
  },

  changePassword: function (oldPwd, newPwd, confirmPwd) {
    if (!oldPwd) return { ok: false, msg: '请输入原密码' };
    if (oldPwd !== this.getStoredPassword()) return { ok: false, msg: '原密码不正确' };
    if (!newPwd) return { ok: false, msg: '请输入新密码' };
    if (newPwd.length < 8 || newPwd.length > 20) {
      return { ok: false, msg: '新密码长度需为 8–20 位' };
    }
    if (!/[A-Za-z]/.test(newPwd) || !/\d/.test(newPwd)) {
      return { ok: false, msg: '新密码需同时包含字母和数字' };
    }
    if (newPwd !== confirmPwd) return { ok: false, msg: '两次输入的新密码不一致' };
    if (newPwd === oldPwd) return { ok: false, msg: '新密码不能与原密码相同' };
    sessionStorage.setItem(this.PWD_KEY, newPwd);
    return { ok: true };
  },

  requireAuth: function () {
    if (!this.isLoggedIn()) {
      window.location.href = this.AGENT_ENTRY_URL;
      return false;
    }
    return true;
  }
};
