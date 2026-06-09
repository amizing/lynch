(function () {
  const MIN_WHY = 100;

  document.querySelectorAll('form[data-multi-step]').forEach(setupForm);

  function setupForm(form) {
    const steps = form.querySelectorAll('.form-step');
    const why = form.querySelector('textarea[name="why"]');
    const counter = form.querySelector('[data-counter="why"]');
    const whyError = form.querySelector('[data-error="why"]');
    const nextBtn = form.querySelector('[data-next]');
    const prevBtn = form.querySelector('[data-prev]');

    setStep(1);

    if (why && counter) {
      const updateCounter = () => {
        const len = why.value.trim().length;
        counter.textContent = String(len);
        counter.classList.toggle('ok', len >= MIN_WHY);
        if (len >= MIN_WHY && whyError) whyError.hidden = true;
      };
      why.addEventListener('input', updateCounter);
      updateCounter();
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const name = form.querySelector('input[name="name"]');
        if (name && !name.value.trim()) {
          name.reportValidity();
          return;
        }
        if (why && why.value.trim().length < MIN_WHY) {
          if (whyError) whyError.hidden = false;
          why.focus();
          return;
        }
        setStep(2);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => setStep(1));
    }

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
      }
    });

    function setStep(n) {
      form.setAttribute('data-step', String(n));
      steps.forEach((s) => {
        s.hidden = Number(s.dataset.step) !== n;
      });
      const current = form.querySelector('[data-current]');
      if (current) current.textContent = String(n);
    }
  }
})();
