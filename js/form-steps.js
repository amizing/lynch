(function () {
  const MIN_NAME = 4;
  const MIN_WHY = 100;

  document.querySelectorAll('form[data-multi-step]').forEach(setupForm);

  function setupForm(form) {
    const steps = form.querySelectorAll('.form-step');
    const name = form.querySelector('input[name="name"]');
    const why = form.querySelector('textarea[name="why"]');
    const nameError = form.querySelector('[data-error="name"]');
    const whyError = form.querySelector('[data-error="why"]');
    const nextBtn = form.querySelector('[data-next]');
    const prevBtn = form.querySelector('[data-prev]');

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
      }
    });

    function setStep(n) {
      form.setAttribute('data-step', String(n));
      steps.forEach((s) => {
        s.hidden = Number(s.dataset.step) !== n;
      });
    }
  }
})();
