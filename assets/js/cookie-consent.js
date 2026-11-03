document.addEventListener('DOMContentLoaded', () => {
  const banner = document.getElementById('cookieBanner');
  const acceptBtn = document.getElementById('cookieAccept');
  
  if (banner && acceptBtn) {
    const hasConsent = localStorage.getItem('venuepoint_cookie_consent');
    if (!hasConsent) {
      banner.classList.add('visible');
    }

    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('venuepoint_cookie_consent', 'accepted');
      banner.classList.remove('visible');
    });
  }
});