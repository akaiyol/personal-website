(() => {
  const view = document.querySelector('#work-view');
  const sections = [...view.querySelectorAll('.timeline section')];
  const links = [...view.querySelectorAll('.years a')];
  let pending = null;
  let selectedJump = null;
  function select(year) {
    links.forEach(link => {
      if (link.hash === '#work/' + year) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function update() {
    pending = null;
    if (view.hidden || document.hidden) return;
    if (selectedJump) { select(selectedJump); return; }
    const current = sections.filter(section => section.getBoundingClientRect().top <= 100).at(-1) || sections[0];
    select(current.id.replace('work-year-', ''));
  }
  function route() {
    if (pending !== null) cancelAnimationFrame(pending);
    pending = null;
    if (view.hidden) return;
    const year = location.hash.split('/')[1];
    const target = sections.find(section => section.id === 'work-year-' + year);
    if (target) {
      target.scrollIntoView({behavior: 'instant', block: 'start'});
      target.querySelector('h2').focus({preventScroll: true});
      selectedJump = year;
      select(year);
    } else {
      window.scrollTo({top: 0, behavior: 'instant'});
      selectedJump = null;
      select('2026');
    }
  }
  links.forEach(link => link.addEventListener('click', () => {
    if (link.hash === location.hash) route();
  }));
  addEventListener('scroll', () => {
    if (!view.hidden && !document.hidden && pending === null) pending = requestAnimationFrame(update);
  }, {passive: true});
  addEventListener('wheel', () => { selectedJump = null; }, {passive: true});
  addEventListener('touchmove', () => { selectedJump = null; }, {passive: true});
  addEventListener('keydown', event => {
    if (['PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End', ' '].includes(event.key) && !event.target.closest('input')) selectedJump = null;
  });
  addEventListener('site:route', route);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && pending !== null) { cancelAnimationFrame(pending); pending = null; }
    else update();
  });
  route();
})();
