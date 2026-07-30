/**
 * 用户头像 - 统一 SVG 人物头像
 */
var UserAvatar = {
  svgMarkup: function (className) {
    className = className || 'user-avatar-svg';
    return '<svg class="' + className + '" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<defs>' +
        '<linearGradient id="ua-bg" x1="6" y1="4" x2="30" y2="32" gradientUnits="userSpaceOnUse">' +
          '<stop stop-color="#7BC89C"/>' +
          '<stop offset="1" stop-color="#00b42a"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<circle cx="18" cy="18" r="18" fill="url(#ua-bg)"/>' +
      '<circle cx="18" cy="14" r="6.2" fill="#fff" fill-opacity="0.95"/>' +
      '<path d="M8 30.5c1.8-5.2 6.2-8 10-8s8.2 2.8 10 8" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none"/>' +
    '</svg>';
  },

  apply: function (el) {
    if (!el) return;
    el.innerHTML = this.svgMarkup('user-avatar-svg');
    el.classList.add('has-svg');
  }
};
