/**
 * LoginModal - 登录弹窗
 * 布局参考传统登录页（用户名/密码/记住密码/忘记密码/登录按钮），配色保持智能体深色毛玻璃风格
 */
var AgentLoginModal = {
  mode: 'login',

  render: function () {
    return '<div class="agent-modal-mask" id="agentLoginModal" style="display:none" aria-hidden="true">' +
      '<div class="agent-modal" role="dialog" aria-labelledby="agentLoginTitle" aria-modal="true">' +
        '<button type="button" class="agent-modal-close" id="agentModalClose" aria-label="关闭">×</button>' +
        '<div class="agent-modal-header">' +
          '<h2 id="agentLoginTitle">欢迎登录</h2>' +
          '<p class="agent-modal-subtitle">请输入您的账号和密码</p>' +
        '</div>' +
        '<form class="agent-login-form" id="agentLoginForm" autocomplete="off">' +
          '<div class="agent-form-group">' +
            '<label for="agentUsername">用户名</label>' +
            '<input type="text" id="agentUsername" class="agent-field-input" placeholder="请输入用户名" value="admin" autocomplete="username" spellcheck="false">' +
          '</div>' +
          '<div class="agent-form-group agent-form-group--register" id="agentRegisterNameGroup" hidden>' +
            '<label for="agentRegisterName">姓名</label>' +
            '<input type="text" id="agentRegisterName" class="agent-field-input" placeholder="请输入姓名（选填）" autocomplete="name">' +
          '</div>' +
          '<div class="agent-form-group">' +
            '<label for="agentPassword">密码</label>' +
            '<input type="password" id="agentPassword" class="agent-field-input" placeholder="请输入密码" value="Sztb@Demo2026" autocomplete="current-password">' +
          '</div>' +
          '<div class="agent-form-group agent-form-group--register" id="agentConfirmPwdGroup" hidden>' +
            '<label for="agentConfirmPassword">确认密码</label>' +
            '<input type="password" id="agentConfirmPassword" class="agent-field-input" placeholder="请再次输入密码" autocomplete="new-password">' +
          '</div>' +
          '<div class="agent-form-options" id="agentLoginOptions">' +
            '<label class="agent-form-checkbox">' +
              '<input type="checkbox" id="agentRememberPwd" checked>' +
              '<span>记住密码</span>' +
            '</label>' +
            '<button type="button" class="agent-form-link" id="agentForgotPwd">忘记密码？</button>' +
          '</div>' +
          '<p class="agent-form-error" id="agentFormError" hidden></p>' +
          '<div class="agent-form-actions">' +
            '<button type="submit" class="agent-submit-btn" id="agentSubmitBtn">' +
              '<span class="agent-submit-text" id="agentSubmitText">登 录</span>' +
              '<span class="agent-submit-loading"><i class="agent-submit-spinner"></i><span id="agentSubmitLoadingText">登录中…</span></span>' +
            '</button>' +
            '<button type="button" class="agent-register-btn" id="agentRegisterBtn">注 册</button>' +
          '</div>' +
          '<p class="agent-form-switch" id="agentFormSwitch" hidden>' +
            '已有账号？<button type="button" class="agent-form-link" id="agentBackToLoginBtn">返回登录</button>' +
          '</p>' +
        '</form>' +
      '</div>' +
    '</div>';
  },

  resetSubmitState: function () {
    var submitBtn = document.getElementById('agentSubmitBtn');
    if (!submitBtn) return;
    submitBtn.disabled = false;
    submitBtn.classList.remove('is-loading');
  },

  setMode: function (mode) {
    this.mode = mode === 'register' ? 'register' : 'login';
    var isRegister = this.mode === 'register';
    var title = document.getElementById('agentLoginTitle');
    var subtitle = document.querySelector('#agentLoginModal .agent-modal-subtitle');
    var registerBtn = document.getElementById('agentRegisterBtn');
    var submitText = document.getElementById('agentSubmitText');
    var loadingText = document.getElementById('agentSubmitLoadingText');
    var loginOptions = document.getElementById('agentLoginOptions');
    var formSwitch = document.getElementById('agentFormSwitch');
    var nameGroup = document.getElementById('agentRegisterNameGroup');
    var confirmGroup = document.getElementById('agentConfirmPwdGroup');
    var username = document.getElementById('agentUsername');
    var password = document.getElementById('agentPassword');
    var confirmPwd = document.getElementById('agentConfirmPassword');
    var error = document.getElementById('agentFormError');

    if (title) title.textContent = isRegister ? '注册账号' : '欢迎登录';
    if (subtitle) subtitle.textContent = isRegister ? '创建您的企业账号' : '请输入您的账号和密码';
    if (registerBtn) registerBtn.hidden = isRegister;
    if (submitText) submitText.textContent = isRegister ? '注 册' : '登 录';
    if (loadingText) loadingText.textContent = isRegister ? '注册中…' : '登录中…';
    if (loginOptions) loginOptions.hidden = isRegister;
    if (formSwitch) formSwitch.hidden = !isRegister;
    if (nameGroup) nameGroup.hidden = !isRegister;
    if (confirmGroup) confirmGroup.hidden = !isRegister;
    if (error) { error.hidden = true; error.textContent = ''; error.style.color = ''; }

    if (isRegister) {
      if (username) username.value = '';
      if (password) password.value = '';
      if (confirmPwd) confirmPwd.value = '';
    }
  },

  open: function (options) {
    options = options || {};
    this._onSuccess = typeof options.onSuccess === 'function' ? options.onSuccess : null;
    this.setMode(options.mode || 'login');

    var modal = document.getElementById('agentLoginModal');
    var error = document.getElementById('agentFormError');
    if (!modal) return;
    if (error) { error.hidden = true; error.textContent = ''; }
    this.resetSubmitState();
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var username = document.getElementById('agentUsername');
    if (username) username.focus();
  },

  close: function () {
    var modal = document.getElementById('agentLoginModal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    if (!document.getElementById('benchmarkAuthPrompt') ||
        document.getElementById('benchmarkAuthPrompt').style.display === 'none') {
      document.body.style.overflow = '';
    }
    this.resetSubmitState();
    this._onSuccess = null;
    this.setMode('login');
  },

  init: function () {
    var self = this;
    var modal = document.getElementById('agentLoginModal');
    var closeBtn = document.getElementById('agentModalClose');
    var form = document.getElementById('agentLoginForm');
    var forgotBtn = document.getElementById('agentForgotPwd');
    var registerBtn = document.getElementById('agentRegisterBtn');
    var backLoginBtn = document.getElementById('agentBackToLoginBtn');

    if (closeBtn) closeBtn.addEventListener('click', function () { self.close(); });
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) self.close();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal && modal.style.display !== 'none') self.close();
    });
    if (forgotBtn) {
      forgotBtn.addEventListener('click', function () {
        alert('请联系系统管理员重置密码。');
      });
    }
    if (registerBtn) {
      registerBtn.addEventListener('click', function () {
        self.setMode('register');
      });
    }
    if (backLoginBtn) {
      backLoginBtn.addEventListener('click', function () {
        self.setMode('login');
      });
    }
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (self.mode === 'register') self.handleRegister();
        else self.handleLogin();
      });
    }
  },

  handleRegister: function () {
    var username = document.getElementById('agentUsername');
    var password = document.getElementById('agentPassword');
    var confirmPwd = document.getElementById('agentConfirmPassword');
    var name = document.getElementById('agentRegisterName');
    var error = document.getElementById('agentFormError');
    var submitBtn = document.getElementById('agentSubmitBtn');
    if (!username || !password || !confirmPwd || !submitBtn) return;

    var result = Auth.register(
      username.value.trim(),
      password.value,
      confirmPwd.value,
      { name: name ? name.value : '' }
    );

    if (!result.ok) {
      if (error) { error.textContent = result.msg; error.hidden = false; error.style.color = ''; }
      return;
    }

    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');

    var savedUser = username.value.trim();
    var self = this;
    setTimeout(function () {
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
      self.setMode('login');
      username.value = savedUser;
      password.value = '';
      confirmPwd.value = '';
      if (error) {
        error.textContent = result.msg || '注册成功，请登录';
        error.hidden = false;
        error.style.color = '#6ee7a0';
      }
    }, 500);
  },

  handleLogin: function () {
    var username = document.getElementById('agentUsername');
    var password = document.getElementById('agentPassword');
    var error = document.getElementById('agentFormError');
    var submitBtn = document.getElementById('agentSubmitBtn');
    if (!username || !password || !submitBtn) return;

    var user = username.value.trim();
    var pwd = password.value;
    if (!user || !pwd) {
      if (error) { error.textContent = '请输入账号和密码'; error.hidden = false; error.style.color = ''; }
      return;
    }

    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');

    var self = this;
    setTimeout(function () {
      if (Auth.login(user, pwd)) {
        var callback = self._onSuccess;
        self.close();
        if (typeof AgentHomeLayout !== 'undefined') {
          AgentHomeLayout.updateAuthState();
        }
        if (callback) callback();
        return;
      }
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
      if (error) { error.textContent = '用户名或密码错误'; error.hidden = false; error.style.color = ''; }
    }, 600);
  }
};
