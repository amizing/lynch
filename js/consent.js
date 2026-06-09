(function () {
  var KEY = 'lynch_cookie_consent_v1';
  var wrap, card;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function save(consent) {
    consent.ts = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(consent)); } catch (e) {}
    applyConsent(consent);
  }
  function applyConsent(c) {
    window.__consent = c;
    document.dispatchEvent(new CustomEvent('cookie-consent', { detail: c }));
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
    if (existing) { applyConsent(existing); }
    else { setTimeout(show, 700); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
