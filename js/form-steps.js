(function () {
  const MIN_NAME = 4;
  const MIN_WHY = 100;
  const COOKIE = 'lynch_submitted';
  const PHOTOS = [
    'images/dog-photos/lynch-hero.jpg',
    'images/dog-photos/lynch-balcony.jpg',
    'images/dog-photos/lynch-cafe.jpg',
    'images/dog-photos/lynch-towel.jpg',
    'images/dog-photos/lynch-zen.jpg',
    'images/dog-photos/lynch-bench.jpg',
    'images/dog-photos/lynch-bricks.jpg',
    'images/dog-photos/lynch-doge.jpg',
    'images/dog-photos/lynch-patron.jpg',
  ];

  function hasSubmitted() {
    return document.cookie
      .split(';')
      .some((c) => c.trim().startsWith(COOKIE + '='));
  }
  function markSubmitted() {
    document.cookie =
      COOKIE + '=1; max-age=' + 60 * 60 * 24 * 365 + '; path=/; SameSite=Lax';
  }

  function openPhotoModal() {
    const modal = document.getElementById('photoModal');
    const img = document.getElementById('photoModalImg');
    const canvas = document.getElementById('confettiCanvas');
    if (!modal || !img) return;
    img.src = PHOTOS[Math.floor(Math.random() * PHOTOS.length)];
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    if (canvas && typeof window.launchConfetti === 'function') {
      requestAnimationFrame(() => window.launchConfetti(canvas));
    }
  }
  function requestClosePhotoModal() {
    const modal = document.getElementById('photoModal');
    if (!modal || modal.hidden) return;
    const confirmEl = modal.querySelector('[data-photo-confirm]');
    if (confirmEl) confirmEl.hidden = false;
  }
  function dismissCloseConfirm() {
    const modal = document.getElementById('photoModal');
    if (!modal) return;
    const confirmEl = modal.querySelector('[data-photo-confirm]');
    if (confirmEl) confirmEl.hidden = true;
  }
  function closePhotoModal() {
    const modal = document.getElementById('photoModal');
    if (!modal) return;
    const confirmEl = modal.querySelector('[data-photo-confirm]');
    if (confirmEl) confirmEl.hidden = true;
    modal.hidden = true;
    document.body.style.overflow = '';
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-confirm-yes]')) { closePhotoModal(); return; }
    if (e.target.closest('[data-confirm-no]')) { dismissCloseConfirm(); return; }
    if (e.target.closest('[data-photo-close]')) { requestClosePhotoModal(); return; }
    const modal = document.getElementById('photoModal');
    if (modal && !modal.hidden && e.target === modal) requestClosePhotoModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const modal = document.getElementById('photoModal');
    if (!modal || modal.hidden) return;
    const confirmEl = modal.querySelector('[data-photo-confirm]');
    if (confirmEl && !confirmEl.hidden) dismissCloseConfirm();
    else requestClosePhotoModal();
  });

  document.querySelectorAll('form[data-multi-step]').forEach(setupForm);

  function setupForm(form) {
    const steps = form.querySelectorAll('.form-step');
    const fail = form.querySelector('[data-form-fail]');
    const name = form.querySelector('input[name="name"]');
    const why = form.querySelector('textarea[name="why"]');
    const nameError = form.querySelector('[data-error="name"]');
    const whyError = form.querySelector('[data-error="why"]');
    const nextBtn = form.querySelector('[data-next]');
    const prevBtn = form.querySelector('[data-prev]');

    if (hasSubmitted()) {
      showFail();
      return;
    }

    setStep(1);

    if (name && nameError) {
      name.addEventListener('input', () => {
        if (name.value.trim().length >= MIN_NAME) nameError.hidden = true;
      });
    }
    if (why && whyError) {
      why.addEventListener('input', () => {
        if (why.value.trim().length >= MIN_WHY) whyError.hidden = true;
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        let bad = null;
        if (name && name.value.trim().length < MIN_NAME) {
          if (nameError) nameError.hidden = false;
          bad = bad || name;
        }
        if (why && why.value.trim().length < MIN_WHY) {
          if (whyError) whyError.hidden = false;
          bad = bad || why;
        }
        if (bad) {
          bad.focus();
          return;
        }
        setStep(2);
      });
    }

    if (prevBtn) prevBtn.addEventListener('click', () => setStep(1));

    form.addEventListener('submit', (e) => {
      const missingRadio = ['scamorza', 'first_time'].find(
        (n) => !form.querySelector(`input[name="${n}"]:checked`)
      );
      const thoughts = form.querySelector('input[name="lynch_thoughts"]');
      if (missingRadio || (thoughts && !thoughts.value.trim())) {
        e.preventDefault();
        if (missingRadio) {
          form.querySelector(`input[name="${missingRadio}"]`).focus();
        } else {
          thoughts.focus();
        }
        return;
      }

      e.preventDefault();
      const firstTime = form.querySelector(
        'input[name="first_time"]:checked'
      ).value;
      markSubmitted();
      showFail();
      if (firstTime === 'yes') openPhotoModal();
    });

    function setStep(n) {
      form.setAttribute('data-step', String(n));
      steps.forEach((s) => {
        s.hidden = Number(s.dataset.step) !== n;
      });
    }

    function showFail() {
      steps.forEach((s) => (s.hidden = true));
      if (fail) fail.hidden = false;
    }
  }
})();
