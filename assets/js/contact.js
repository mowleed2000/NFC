document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('venuepointMultiStepForm');
  if (!form) return;

  let currentStep = 1;
  const totalSteps = 4;
  
  const stepPanels = form.querySelectorAll('.form-step-panel');
  const progressSteps = document.querySelectorAll('.step-progress-item');
  const progressBarFill = document.querySelector('.step-progress-bar-fill');
  const prevBtn = document.getElementById('formPrevBtn');
  const nextBtn = document.getElementById('formNextBtn');
  const submitBtn = document.getElementById('formSubmitBtn');

  // Customer type listener for conditional fields
  const customerTypeInputs = form.querySelectorAll('input[name="customer_type"]');
  const venueOnlyFields = document.querySelectorAll('.field-venue-only');

  function updateConditionalFields() {
    const selectedType = form.querySelector('input[name="customer_type"]:checked');
    const isHospitality = selectedType && selectedType.value === 'hospitality';
    venueOnlyFields.forEach(el => {
      el.style.display = isHospitality ? 'block' : 'none';
    });
  }

  customerTypeInputs.forEach(input => {
    input.addEventListener('change', updateConditionalFields);
  });

  // Quantity presets
  const qtyPills = document.querySelectorAll('.qty-preset-pill');
  const qtyInput = document.getElementById('customQuantityInput');
  qtyPills.forEach(pill => {
    pill.addEventListener('click', () => {
      qtyPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const val = pill.getAttribute('data-value');
      if (qtyInput) qtyInput.value = val;
    });
  });

  function showStep(stepIndex) {
    stepPanels.forEach(panel => {
      panel.classList.toggle('active', parseInt(panel.getAttribute('data-step')) === stepIndex);
    });

    progressSteps.forEach((p, idx) => {
      if (idx + 1 < stepIndex) {
        p.classList.add('completed');
        p.classList.remove('active');
      } else if (idx + 1 === stepIndex) {
        p.classList.add('active');
        p.classList.remove('completed');
      } else {
        p.classList.remove('active', 'completed');
      }
    });

    if (progressBarFill) {
      progressBarFill.style.width = ${((stepIndex - 1) / (totalSteps - 1)) * 100}%;
    }

    if (prevBtn) prevBtn.style.display = stepIndex === 1 ? 'none' : 'inline-flex';
    if (nextBtn) nextBtn.style.display = stepIndex === totalSteps ? 'none' : 'inline-flex';
    if (submitBtn) submitBtn.style.display = stepIndex === totalSteps ? 'inline-flex' : 'none';
  }

  function validateCurrentStep() {
    const activePanel = form.querySelector(.form-step-panel[data-step=""]);
    if (!activePanel) return true;

    let valid = true;

    if (currentStep === 1) {
      const checked = form.querySelector('input[name="customer_type"]:checked');
      const errorMsg = activePanel.querySelector('.step-error-message');
      if (!checked) {
        valid = false;
        if (errorMsg) errorMsg.classList.add('visible');
      } else {
        if (errorMsg) errorMsg.classList.remove('visible');
      }
    } else if (currentStep === 2) {
      const checked = form.querySelectorAll('input[name="product_interest"]:checked');
      const errorMsg = activePanel.querySelector('.step-error-message');
      if (checked.length === 0) {
        valid = false;
        if (errorMsg) errorMsg.classList.add('visible');
      } else {
        if (errorMsg) errorMsg.classList.remove('visible');
      }
    } else if (currentStep === 4) {
      const requiredInputs = activePanel.querySelectorAll('[required]');
      requiredInputs.forEach(input => {
        const errorEl = input.parentElement.querySelector('.form-error');
        if (!input.value.trim() || (input.type === 'email' && !input.value.includes('@'))) {
          valid = false;
          input.classList.add('error');
          if (errorEl) errorEl.classList.add('visible');
        } else {
          input.classList.remove('error');
          if (errorEl) errorEl.classList.remove('visible');
        }
      });
    }

    return valid;
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
          currentStep++;
          showStep(currentStep);
          window.scrollTo({ top: form.offsetTop - 100, behavior: 'smooth' });
        }
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        window.scrollTo({ top: form.offsetTop - 100, behavior: 'smooth' });
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.product_interests = formData.getAll('product_interest');
    data.submittedAt = new Date().toISOString();

    const endpoint = (window.VENUEPOINT_CONFIG && window.VENUEPOINT_CONFIG.formEndpoint) || '';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Transmitting Quote Request...';
    }

    let success = false;

    if (endpoint && !endpoint.includes('YOUR_FORM_ID')) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        });
        if (res.ok) success = true;
      } catch (err) {
        console.warn('Endpoint error, falling back to local simulation:', err);
      }
    }

    const existing = JSON.parse(localStorage.getItem('venuepoint_quotes') || '[]');
    existing.push(data);
    localStorage.setItem('venuepoint_quotes', JSON.stringify(existing));
    success = true;

    setTimeout(() => {
      form.style.display = 'none';
      const successBlock = document.getElementById('formSuccessBlock');
      if (successBlock) successBlock.style.display = 'block';

      const toast = document.getElementById('toastNotice');
      if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 6000);
      }
    }, 600);
  });

  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get('type');
  const productParam = urlParams.get('product');

  if (typeParam) {
    const radio = form.querySelector(input[name="customer_type"][value=""]);
    if (radio) {
      radio.checked = true;
      updateConditionalFields();
    }
  }

  if (productParam) {
    const checkbox = form.querySelector(input[name="product_interest"][value=""]);
    if (checkbox) checkbox.checked = true;
  }

  showStep(1);
});