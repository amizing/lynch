(function () {
  var COOKIE_NAME = 'cdc_consent';
  var ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

  function readConsent() {
    var match = document.cookie.match(/(?:^|;\s*)cdc_consent=([^;]+)/);
    return match ? match[1] : null;
  }

  function setConsent(value) {
    var attrs = '; max-age=' + ONE_YEAR_SECONDS + '; path=/; SameSite=Lax';
    if (location.protocol === 'https:') attrs += '; Secure';
    document.cookie = COOKIE_NAME + '=' + value + attrs;
  }

  function buildBanner() {
    var banner = document.createElement('div');
    banner.className = 'consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<div class="consent-banner__inner">' +
        '<p class="consent-banner__text">' +
          'We use cookies to improve your experience. See our ' +
          '<a href="/privacy.html">privacy policy</a> for details.' +
        '</p>' +
        '<div class="consent-banner__actions">' +
          '<button type="button" class="btn btn-secondary" data-consent="declined">Decline</button>' +
          '<button type="button" class="btn btn-primary" data-consent="accepted">Accept</button>' +
        '</div>' +
      '</div>';

    banner.addEventListener('click', function (e) {
      var target = e.target;
      if (target && target.dataset && target.dataset.consent) {
        setConsent(target.dataset.consent);
        banner.remove();
      }
    });

    return banner;
  }

  function init() {
    if (readConsent()) return;
    document.body.appendChild(buildBanner());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
