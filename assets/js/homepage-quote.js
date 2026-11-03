/**
 * VenuePoint Homepage Interactive Quote & Order Engine
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
    { id: 'qty-keyring', price: 20, input: document.getElementById('qty-keyring') }
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
        submitBtn.innerHTML = 'Processing...';
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
        form.innerHTML = '<div style="text-align:center; padding: 2.5rem 1rem;">' +
          '<div style="width:64px;height:64px;border-radius:50%;background:#D1FAE5;color:#059669;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;font-size:28px;">&#10003;</div>' +
          '<h3 style="margin-bottom:0.75rem;">Quote Request Confirmed!</h3>' +
          '<p style="color:var(--color-text-body);max-width:500px;margin:0 auto 1.5rem;line-height:1.5;">Thank you, <strong>' + name + '</strong>. We have received your requirements and will be in touch within 2 working hours with formal confirmation and delivery details.</p>' +
          '<div style="background:#F8FAFC;border:1px solid var(--color-border);border-radius:var(--radius-sm);padding:1.25rem;max-width:440px;margin:0 auto 1.5rem;text-align:left;font-size:0.875rem;">' +
          '<div style="margin-bottom:0.35rem;"><strong>Contact:</strong> ' + name + ' (' + email + ') — ' + phone + '</div>' +
          '<div><strong>Status:</strong> Dispatched to VenuePoint Technical Team</div>' +
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
