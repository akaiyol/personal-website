(() => {
  const page = document.querySelector('#about-view');
  const rail = page.querySelector('.memories');
  const photos = [...page.querySelectorAll('.memory')];
  const terms = [...page.querySelectorAll('.term')];
  let drag = null, ignoreClick = false, frame = 0, pointer = null;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  function select(photo) {
    const wasSelected = photo?.getAttribute('aria-pressed') === 'true';
    photos.forEach(item => item.setAttribute('aria-pressed', String(item === photo && !wasSelected)));
  }
  function pin(photo, left) {
    const width = rail.clientWidth;
    const max = width - photo.offsetWidth - 12;
    const preferred = clamp(left, 6, max);
    const others = photos.filter(item => item !== photo).map(item => item.offsetLeft);
    // Preserve an exposed strip for every card after repinning.
    const candidates = [preferred, 6, max, ...others.flatMap(x => [x - 40, x + 40])];
    const available = candidates.filter(x => x >= 6 && x <= max && others.every(y => Math.abs(x - y) >= 39));
    const position = available.sort((a, b) => Math.abs(a - preferred) - Math.abs(b - preferred))[0] ?? photo.offsetLeft;
    photo.style.setProperty('--slot', `${position / width * 100}%`);
  }
  photos.forEach(photo => {
    photo.addEventListener('click', () => {
      if (ignoreClick) { ignoreClick = false; return; }
      select(photo);
    });
    photo.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(photo); }
      if (event.key === 'Escape') { select(null); photo.blur(); }
      if (event.altKey && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        pin(photo, photo.offsetLeft + (event.key === 'ArrowLeft' ? -24 : 24));
      }
    });
    photo.addEventListener('pointerdown', event => {
      // Touch drags from the pin, leaving the photo body free for rail scrolling.
      const touchPin = event.pointerType === 'touch' && event.target.closest('.clip');
      if ((!touchPin && event.pointerType !== 'mouse') || event.button !== 0) return;
      drag = {photo, id: event.pointerId, x: event.clientX, y: event.clientY, left: photo.offsetLeft, dx: 0, active: false};
    });
    photo.addEventListener('pointermove', event => {
      if (!drag || drag.photo !== photo || event.pointerId !== drag.id) return;
      let dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (!drag.active && Math.hypot(dx, dy) < 6) return;
      if (!drag.active) {
        drag.active = true;
        photo.setPointerCapture(event.pointerId);
        photo.classList.add('dragging');
        select(null);
        clearTerms();
      }
      dx = clamp(dx, 6 - drag.left, rail.clientWidth - photo.offsetWidth - 12 - drag.left);
      dy = clamp(dy, -20, rail.clientHeight - photo.offsetTop - photo.offsetHeight - 12);
      drag.dx = dx;
      photo.style.setProperty('--drag-x', `${dx}px`);
      photo.style.setProperty('--drag-y', `${dy}px`);
    });
    const finishDrag = event => {
      if (!drag || drag.photo !== photo || event.pointerId !== drag.id) return;
      if (drag.active) {
        pin(photo, drag.left + drag.dx);
        photo.classList.remove('dragging');
        photo.style.removeProperty('--drag-x');
        photo.style.removeProperty('--drag-y');
        ignoreClick = event.type === 'pointerup';
        if (photo.hasPointerCapture(event.pointerId)) photo.releasePointerCapture(event.pointerId);
      }
      drag = null;
    };
    photo.addEventListener('pointerup', finishDrag);
    photo.addEventListener('pointercancel', finishDrag);
  });
  function clearTerms() { terms.forEach(term => term.classList.remove('emphasized')); }
  function highlightNearest() {
    frame = 0;
    if (!pointer || page.hidden || document.hidden || drag?.active) { clearTerms(); return; }
    let nearest = null, distance = 24;
    terms.forEach(term => {
      for (const rect of term.getClientRects()) {
        const dx = Math.max(rect.left - pointer.x, 0, pointer.x - rect.right);
        const dy = Math.max(rect.top - pointer.y, 0, pointer.y - rect.bottom);
        const d = Math.hypot(dx, dy);
        if (d <= distance) { nearest = term; distance = d; }
      }
    });
    terms.forEach(term => term.classList.toggle('emphasized', term === nearest));
  }
  page.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    pointer = {x: event.clientX, y: event.clientY};
    if (!frame) frame = requestAnimationFrame(highlightNearest);
  });
  page.addEventListener('pointerleave', () => { pointer = null; clearTerms(); });
  terms.forEach(term => {
    const toggle = () => {
      const pressed = term.getAttribute('aria-pressed') === 'true';
      terms.forEach(item => item.setAttribute('aria-pressed', String(item === term && !pressed)));
    };
    term.addEventListener('click', toggle);
    term.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); }
      if (event.key === 'Escape') { term.setAttribute('aria-pressed', 'false'); term.blur(); }
    });
  });
  document.addEventListener('pointerdown', event => {
    if (!event.target.closest('.term')) terms.forEach(term => term.setAttribute('aria-pressed', 'false'));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !page.hidden) select(null);
  });
  const pause = () => {
    document.body.classList.toggle('page-hidden', document.hidden);
    cancelAnimationFrame(frame); frame = 0; pointer = null; clearTerms();
    if (drag) {
      drag.photo.classList.remove('dragging');
      drag.photo.style.removeProperty('--drag-x');
      drag.photo.style.removeProperty('--drag-y');
      if (drag.photo.hasPointerCapture(drag.id)) drag.photo.releasePointerCapture(drag.id);
      drag = null; ignoreClick = false;
    }
  };
  window.addEventListener('site:route', () => { pause(); select(null); });
  window.addEventListener('scroll', () => { pointer = null; clearTerms(); }, {passive: true});
  document.addEventListener('visibilitychange', pause);
})();
