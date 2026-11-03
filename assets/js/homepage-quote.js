/**
 * VenuePoint Homepage Interactive Quote & Order Engine
 * Includes on-site installation by specialist and direct message confirmation.
 */

document.addEventListener('DOMContentLoaded', function() {
  var quoteSection = document.getElementById('homepage-quote');
  if (!quoteSection) return;

  var tabBtns = quoteSection.querySelectorAll('.hp-tab-btn');
  var tabPanels = quoteSection.querySelectorAll('.hp-tab-panel');

  function switchTab(targetTabId) {
    tabBtns.forEach(function(btn) {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === targetTabId);
    });
    tabPanels.forEach(function(panel) {
      panel.classList.toggle('active', panel.id === targetTabId);
    });
  }

  tabBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var target = btn.getAttribute('data-tab');
      switchTab(target);
    });
  });

  var steppers = [
    { id: 'qty-standing-card', price: 30, input: document.getElementById('qty-standing-card') },
    { id: 'qty-blue-card', price: 30, input: document.getElementById('qty-blue-card') },
    { id: 'qty-keyring', price: 20, input: document.getElementById('qty-keyring') },
    { id: 'qty-insta-stand', price: 30, input: document.getElementById('qty-insta-stand') },
    { id: 'qty-tiktok-stand', price: 30, input: document.getElementById('qty-tiktok-stand') }
  ];

  var totalDisplay = document.getElementById('hp-total-display');
  var itemsCountDisplay = document.getElementById('hp-items-count');

  function updateProductTotals() {
    var subtotal = 0;
    var totalItems = 0;
    steppers.forEach(function(item) {
      if (item.input) {
        var val = parseInt(item.input.value, 10) || 0;
        subtotal += val * item.price;
        totalItems += val;
      }
    });
    if (totalDisplay) {
      totalDisplay.textContent = '£' + subtotal.toFixed(2);
    }
    if (itemsCountDisplay) {
      itemsCountDisplay.textContent = totalItems + (totalItems === 1 ? ' item selected' : ' items selected');
    }
  }

  quoteSection.querySelectorAll('.btn-stepper').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var targetId = btn.getAttribute('data-target');
      var action = btn.getAttribute('data-action');
      var input = document.getElementById(targetId);
      if (!input) return;
      var currentVal = parseInt(input.value, 10) || 0;
      if (action === 'plus') {
        currentVal += 1;
      } else if (action === 'minus') {
        currentVal = Math.max(0, currentVal - 1);
      }
      input.value = currentVal;
      updateProductTotals();
    });
  });

  steppers.forEach(function(item) {
    if (item.input) {
      item.input.addEventListener('change', function() {
        var val = parseInt(item.input.value, 10);
        if (isNaN(val) || val < 0) { item.input.value = 0; }
        updateProductTotals();
      });
    }
  });

  document.querySelectorAll('.js-order-trigger').forEach(function(trigger) {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      var product = trigger.getAttribute('data-product');
      var tab = trigger.getAttribute('data-tab') || 'hp-tab-products';
      switchTab(tab);
      if (product === 'standing-card') {
        var input = document.getElementById('qty-standing-card');
        if (input && (parseInt(input.value, 10) || 0) === 0) input.value = 1;
      } else if (product === 'blue-card') {
        var input = document.getElementById('qty-blue-card');
        if (input && (parseInt(input.value, 10) || 0) === 0) input.value = 1;
      } else if (product === 'keyring') {
        var input = document.getElementById('qty-keyring');
        if (input && (parseInt(input.value, 10) || 0) === 0) input.value = 1;
      } else if (product === 'insta-stand') {
        var input = document.getElementById('qty-insta-stand');
        if (input && (parseInt(input.value, 10) || 0) === 0) input.value = 1;
      } else if (product === 'tiktok-stand') {
        var input = document.getElementById('qty-tiktok-stand');
        if (input && (parseInt(input.value, 10) || 0) === 0) input.value = 1;
      }
      updateProductTotals();
      quoteSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  var tableSlider = document.getElementById('hp-table-slider');
  var tableCountDisplay = document.getElementById('hp-table-display');
  if (tableSlider && tableCountDisplay) {
    tableSlider.addEventListener('input', function() {
      var count = parseInt(tableSlider.value, 10);
      tableCountDisplay.textContent = count + (count >= 100 ? '+ tables' : ' tables');
    });
  }

  ['hp-form-products', 'hp-form-hospitality', 'hp-form-events'].forEach(function(formId) {
    var form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var submitBtn = form.querySelector('button[type="submit"]');
      var origText = submitBtn ? submitBtn.innerHTML : 'Submit';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Processing Booking...';
      }
      var formData = new FormData(form);
      var data = {};
      formData.forEach(function(val, key) { data[key] = val; });
      data._timestamp = new Date().toISOString();
      data._formSource = formId;
      var endpoint = (window.VENUEPOINT_CONFIG && window.VENUEPOINT_CONFIG.formEndpoint) || 'https://formspree.io/f/YOUR_FORM_ID';
      var isLive = endpoint.indexOf('YOUR_FORM_ID') === -1;
      var dispatchPromise = isLive ? fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      }) : Promise.resolve({ ok: true });
      dispatchPromise.then(function() {
        try {
          var list = JSON.parse(localStorage.getItem('venuepoint_quotes') || '[]');
          list.push(data);
          localStorage.setItem('venuepoint_quotes', JSON.stringify(list));
        } catch(ex) {}
        var name = data.name || 'Valued Customer';
        var email = data.email || 'Not provided';
        var phone = data.phone || 'Not provided';
        form.innerHTML = '<div style="text-align:center; padding: 2.75rem 1rem;">' +
          '<div style="width:68px;height:68px;border-radius:50%;background:#D1FAE5;color:#059669;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;font-size:32px;">&#10003;</div>' +
          '<h3 style="font-size:1.625rem;font-weight:800;color:#0F172A;margin-bottom:0.75rem;">Installation Request Confirmed!</h3>' +
          '<div style="background:#FEF3C7;color:#92400E;border:1px solid #FCD34D;font-weight:700;font-size:1.0625rem;padding:0.75rem 1.25rem;border-radius:8px;margin:0 auto 1.5rem;max-width:500px;line-height:1.4;">' +
          'Please check your messages &mdash; an installer will be in touch shortly.' +
          '</div>' +
          '<p style="color:var(--color-text-body);max-width:540px;margin:0 auto 1.5rem;line-height:1.6;">Thank you, <strong>' + name + '</strong>. We have assigned your request to our local installation specialist. We do not dispatch loose items by post &mdash; our specialist will bring the hardware directly to your venue and fit it on site.</p>' +
          '<div style="background:#F8FAFC;border:1px solid var(--color-border);border-radius:var(--radius-sm);padding:1.25rem 1.5rem;max-width:480px;margin:0 auto 1.5rem;text-align:left;font-size:0.875rem;">' +
          '<div style="margin-bottom:0.4rem;"><strong>Contact:</strong> ' + name + ' (' + email + ') &mdash; ' + phone + '</div>' +
          '<div style="margin-bottom:0.4rem;"><strong>Status:</strong> Assigned to Specialist Installer</div>' +
          '<div style="color:var(--color-text-muted);font-size:0.8125rem;">Next: You will receive an SMS or WhatsApp to confirm your location and timetable.</div>' +
          '</div>' +
          '<button type="button" onclick="window.location.reload()" class="btn btn-outline" style="margin-top:0.5rem;">Submit Another Request</button>' +
          '</div>';
      }).catch(function(err) {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = origText; }
        alert('Network error. Please call our team directly on 020 8092 6100');
      });
    });
  });

  updateProductTotals();
});
