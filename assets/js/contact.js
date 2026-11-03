document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('venueEnquiryForm');
  const venuesSlider = document.getElementById('venuesCount');
  const venuesOutput = document.getElementById('venuesDisplay');

  if (venuesSlider && venuesOutput) {
    venuesSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      venuesOutput.textContent = val >= 20 ? '20+ venues' : ${val} ;
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;
      const requiredInputs = form.querySelectorAll('[required]');

      requiredInputs.forEach(input => {
        const errorEl = input.parentElement.querySelector('.form-error');
        if (!input.value.trim()) {
          isValid = false;
          input.classList.add('error');
          if (errorEl) errorEl.classList.add('visible');
        } else {
          input.classList.remove('error');
          if (errorEl) errorEl.classList.remove('visible');
        }
      });

      if (!isValid) return;

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      const solutions = formData.getAll('solutions');
      data.solutions = solutions;

      const existing = JSON.parse(localStorage.getItem('venue_enquiries') || '[]');
      existing.push({ ...data, submittedAt: new Date().toISOString() });
      localStorage.setItem('venue_enquiries', JSON.stringify(existing));

      const toast = document.getElementById('toastNotice');
      if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 6000);
      }

      const successBlock = document.getElementById('formSuccessBlock');
      if (successBlock) {
        form.style.display = 'none';
        successBlock.style.display = 'block';
      } else {
        form.reset();
      }
    });
  }
});