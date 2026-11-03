/**
 * VenuePoint Universal Lead Capture & Installer Booking Engine
 * Handles all form submissions across product, solution, industry, and blog pages.
 * Displays explicit installer confirmation: "Please check your messages — an installer will be in touch shortly."
 */

(function() {
  'use strict';

  function initLeadForms() {
    var forms = document.querySelectorAll('.vp-lead-form, [data-vp-form]');

    forms.forEach(function(form) {
      if (form.getAttribute('data-vp-initialized')) return;
      form.setAttribute('data-vp-initialized', 'true');

      form.addEventListener('submit', function(e) {
        e.preventDefault();

        var submitBtn = form.querySelector('button[type="submit"]');
        var originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Request Installer Booking';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:0.5rem;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="vp-spin"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg> Processing Booking...</span>';
        }

        var formData = new FormData(form);
        var data = {};
        formData.forEach(function(val, key) {
          if (data[key]) {
            if (!Array.isArray(data[key])) data[key] = [data[key]];
            data[key].push(val);
          } else {
            data[key] = val;
          }
        });

        data._submittedAt = new Date().toISOString();
        data._pageUrl = window.location.href;
        data._pageTitle = document.title;

        var endpoint = (window.VENUEPOINT_CONFIG && window.VENUEPOINT_CONFIG.formEndpoint) || '';
        var isLive = endpoint && endpoint.indexOf('YOUR_FORM_ID') === -1;

        var sendPromise = isLive ? fetch(endpoint, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
        }) : Promise.resolve({ ok: true });

        sendPromise.then(function() {
          try {
            var quotes = JSON.parse(localStorage.getItem('venuepoint_quotes') || '[]');
            quotes.push(data);
            localStorage.setItem('venuepoint_quotes', JSON.stringify(quotes));
          } catch (err) {}

          var name = data.name || data.full_name || 'Valued Client';
          var phone = data.phone || data.mobile || 'your provided mobile number';
          var venue = data.venue_name || data.company || '';

          var confirmationHtml = 
            '<div class="vp-confirmation-card" style="text-align: center; padding: 2.75rem 1.5rem; background: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; box-shadow: 0 10px 25px rgba(0,0,0,0.06);">' +
              '<div style="width: 68px; height: 68px; border-radius: 50%; background: #D1FAE5; color: #059669; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;">' +
                '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
              '</div>' +
              '<h3 style="font-size: 1.625rem; font-weight: 800; color: #0F172A; margin-bottom: 0.75rem;">Installation Request Confirmed!</h3>' +
              '<div style="background: #FEF3C7; color: #92400E; border: 1px solid #FCD34D; font-weight: 700; font-size: 1.0625rem; padding: 0.75rem 1.25rem; border-radius: 8px; margin: 0 auto 1.5rem; max-width: 520px; line-height: 1.4;">' +
                'Please check your messages &mdash; an installer will be in touch shortly.' +
              '</div>' +
              '<p style="color: #475569; font-size: 1rem; max-width: 540px; margin: 0 auto 1.5rem; line-height: 1.55;">' +
                'Thank you, <strong>' + name + '</strong>' + (venue ? ' (' + venue + ')' : '') + '. We have assigned your request to our local installation specialist. We do not dispatch loose products by post &mdash; our specialist will bring the hardware directly to your venue and handle configuration on site.' +
              '</p>' +
              '<div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 1.25rem 1.5rem; max-width: 480px; margin: 0 auto 1.75rem; text-align: left; font-size: 0.875rem;">' +
                '<h5 style="margin-bottom: 0.6rem; color: #0F172A; font-weight: 700;">What Happens Next:</h5>' +
                '<ul style="margin: 0; padding-left: 1.25rem; color: #475569; display: flex; flex-direction: column; gap: 0.45rem;">' +
                  '<li><strong>SMS / WhatsApp Contact:</strong> Your installer will text <strong>' + phone + '</strong> within 2 business hours.</li>' +
                  '<li><strong>In-Person Fit:</strong> Pre-programmed NFC units brought to site and securely mounted to tables, counters, or host stands.</li>' +
                  '<li><strong>Live Tap Handover:</strong> 100% verified tap-testing across Apple iOS and Android before we sign off.</li>' +
                '</ul>' +
              '</div>' +
              '<button type="button" onclick="window.location.reload()" class="btn btn-secondary btn-sm">Submit Another Request</button>' +
            '</div>';

          form.innerHTML = confirmationHtml;
          form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }).catch(function(err) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
          }
          alert('Submission error. Please call our technical team directly on 020 8092 6100');
        });
      });
    });
  }

  function initMobileStickyBar() {
    if (document.querySelector('.vp-mobile-sticky-bar')) return;

    var bar = document.createElement('div');
    bar.className = 'vp-mobile-sticky-bar';
    bar.innerHTML = 
      '<div class="vp-mobile-sticky-inner">' +
        '<a href="tel:02080926100" class="vp-sticky-btn vp-sticky-call">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>' +
          '<span>Call Us</span>' +
        '</a>' +
        '<a href="#lead-capture" class="vp-sticky-btn vp-sticky-book">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>' +
          '<span>Book Installer</span>' +
        '</a>' +
      '</div>';
    document.body.appendChild(bar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initLeadForms();
      initMobileStickyBar();
    });
  } else {
    initLeadForms();
    initMobileStickyBar();
  }
})();
