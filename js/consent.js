(function () {
  var KEY = 'lynch_cookie_consent_v1';
  var POLICY_VERSION = 1;
  var MAX_AGE_MS = 1000 * 60 * 60 * 24 * 183; // ~6 months
  var wrap, card;

  // Ensure Google Consent Mode v2 default is set as early as possible.
  // Idempotent: if an inline <head> snippet already set defaults, this is a no-op
  // (the consent state machine in gtag.js keeps the strictest setting until update).
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function isFresh(c) {
    if (!c || typeof c !== 'object') return false;
    if ((c.policyVersion || 0) < POLICY_VERSION) return false;
    if (!c.ts || (Date.now() - c.ts) > MAX_AGE_MS) return false;
    return true;
  }

  function save(consent) {
    var prev = load() || { necessary: true, analytics: false, marketing: false };
    consent.ts = Date.now();
    consent.policyVersion = POLICY_VERSION;
    try { localStorage.setItem(KEY, JSON.stringify(consent)); } catch (e) {}
    if (prev.analytics && !consent.analytics) clearCookies(ANALYTICS_COOKIES);
    if (prev.marketing && !consent.marketing) clearCookies(MARKETING_COOKIES);
    applyConsent(consent);
  }

  function applyConsent(c) {
    window.__consent = c;
    gtag('consent', 'update', {
      ad_storage: c.marketing ? 'granted' : 'denied',
      ad_user_data: c.marketing ? 'granted' : 'denied',
      ad_personalization: c.marketing ? 'granted' : 'denied',
      analytics_storage: c.analytics ? 'granted' : 'denied'
    });
    syncMixpanel(c);
    document.dispatchEvent(new CustomEvent('cookie-consent', { detail: c }));
  }

  // Placeholder — replace with real Mixpanel init when token is provisioned.
  function syncMixpanel(c) {
    // if (c.analytics && window.mixpanel) { mixpanel.opt_in_tracking(); }
    // else if (window.mixpanel)            { mixpanel.opt_out_tracking(); }
  }

  // Cookies set by GA4 / Mixpanel — cleared when analytics consent is withdrawn.
  var ANALYTICS_COOKIES = [/^_ga$/, /^_ga_/, /^_gid$/, /^_gat/, /^mp_/];
  // Cookies set by Google Ads / GTM marketing tags — cleared on marketing withdrawal.
  var MARKETING_COOKIES = [/^_gcl_/, /^IDE$/, /^test_cookie$/];

  function clearCookies(patterns) {
    var host = location.hostname;
    var domains = ['', host];
    var parts = host.split('.');
    if (parts.length > 1) domains.push('.' + parts.slice(-2).join('.'));
    domains.push('.' + host);

    document.cookie.split(';').forEach(function (raw) {
      var name = raw.split('=')[0].trim();
      if (!name) return;
      var match = patterns.some(function (p) { return p.test(name); });
      if (!match) return;
      domains.forEach(function (d) {
        var base = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        document.cookie = d ? base + '; domain=' + d : base;
      });
    });
  }

  function show() { if (wrap) wrap.classList.remove('hidden'); }
  function hide() { if (wrap) wrap.classList.add('hidden'); }

  function readToggles() {
    var o = { necessary: true };
    card.querySelectorAll('.ck-toggle[data-cat]').forEach(function (t) {
      o[t.getAttribute('data-cat')] = t.getAttribute('aria-checked') === 'true';
    });
    return o;
  }
  function setToggles(c) {
    card.querySelectorAll('.ck-toggle[data-cat]').forEach(function (t) {
      var cat = t.getAttribute('data-cat');
      t.setAttribute('aria-checked', String(!!(c && c[cat])));
    });
  }

  function init() {
    wrap = document.getElementById('cookieWrap');
    card = document.getElementById('cookieCard');
    if (!wrap || !card) return;

    card.querySelectorAll('.ck-toggle[data-cat]').forEach(function (t) {
      t.addEventListener('click', function () {
        var on = t.getAttribute('aria-checked') === 'true';
        t.setAttribute('aria-checked', String(!on));
      });
    });

    document.getElementById('ckAccept').addEventListener('click', function () {
      save({ necessary: true, analytics: true, marketing: true }); hide();
    });
    document.getElementById('ckReject').addEventListener('click', function () {
      save({ necessary: true, analytics: false, marketing: false }); hide();
    });
    document.getElementById('ckCustomize').addEventListener('click', function () {
      card.classList.toggle('show-prefs');
    });
    document.getElementById('ckSave').addEventListener('click', function () {
      save(readToggles()); hide();
    });

    document.querySelectorAll('[data-cookie-settings]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var c = load();
        if (c) setToggles(c);
        card.classList.add('show-prefs');
        show();
      });
    });

    var existing = load();
    if (isFresh(existing)) {
      applyConsent(existing);
    } else {
      if (existing) setToggles(existing);
      setTimeout(show, 700);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
