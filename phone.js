// Direct navigation and compact content are limited to the phone composition.
(() => {
  const phone = matchMedia('(max-width:700px), (pointer:coarse) and (max-height:500px)');
  const menu = document.querySelector('#phone-menu');
  const toggle = document.querySelector('.phone-menu-toggle');
  const close = () => { menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); };
  toggle.addEventListener('click', () => { const open = menu.hidden; menu.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); });
  document.addEventListener('pointerdown', e => { if (!e.target.closest('.phone-menu, .phone-menu-toggle')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { close(); toggle.focus(); } });
  menu.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  const greeting = document.querySelector('#about-view .greeting');
  const study = document.createElement('p');
  study.className = 'phone-study'; study.textContent = 'EE ’27 @ uwaterloo'; greeting.after(study);
  const email = document.querySelector('#about-view .copy-email');
  const emailHome = document.createComment('Desktop email position'); email.before(emailHome);
  function sync() {
    close();
    document.querySelectorAll('.home-actions .cta').forEach(b => {
      if (!b.dataset.desktopLabel) b.dataset.desktopLabel = b.innerHTML;
      b.innerHTML = phone.matches ? (b.dataset.command === 'about' ? '[ about me ]' : '[ work-experience ]') : b.dataset.desktopLabel;
    });
    if (phone.matches) document.querySelector('#about-view .background').after(email);
    else emailHome.after(email);
    document.querySelectorAll('#work-view .entry button[data-work-type]').forEach(b => {
      b.disabled = phone.matches;
      if (phone.matches) b.removeAttribute('aria-pressed');
      else if (!b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', 'false');
    });
    updateRoute();
  }
  function updateRoute() {
    const route = location.hash.slice(1).split('/')[0] || 'home';
    document.querySelectorAll('[data-phone-route]').forEach(a => {
      if (a.dataset.phoneRoute === route) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    close();
  }
  document.querySelectorAll('[data-phone-route]').forEach(a => a.addEventListener('click', () => {
    if (a.hash === location.hash) { window.scrollTo({top:0,behavior:'instant'}); close(); }
  }));
  phone.addEventListener('change', sync);
  addEventListener('site:route', updateRoute);
  sync();
})();
