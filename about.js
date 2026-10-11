(() => {
  const page = document.querySelector('#about-view');
  const poemWord = page.querySelector('.poem-word');
  let poemWordTimer;
  function hidePoemWord() {
    clearTimeout(poemWordTimer);
    poemWord.classList.remove('is-reading');
  }
  function showPoemWord() {
    clearTimeout(poemWordTimer);
    poemWord.classList.add('is-reading');
    poemWordTimer = setTimeout(hidePoemWord, 1000);
  }
  ['pointerenter', 'focus', 'click'].forEach(type => poemWord.addEventListener(type, showPoemWord));
  ['pointerleave', 'blur'].forEach(type => poemWord.addEventListener(type, hidePoemWord));
  poemWord.addEventListener('keydown', event => { if (event.key === 'Escape') hidePoemWord(); });
  const copyEmail = page.querySelector('[data-copy-email]');
  const emailStatus = page.querySelector('#email-copy-status');
  let emailStatusTimer;
  copyEmail.addEventListener('click', async () => {
    clearTimeout(emailStatusTimer);
    const email = copyEmail.dataset.copyEmail;
    try {
      try {
        await navigator.clipboard.writeText(email);
      } catch {
        const field = document.createElement('textarea');
        field.value = email;
        field.setAttribute('readonly', '');
        field.style.cssText = 'position:fixed;left:-9999px;top:0';
        document.body.append(field);
        field.select();
        let copied;
        try { copied = document.execCommand('copy'); }
        finally { field.remove(); copyEmail.focus({preventScroll: true}); }
        if (!copied) throw new Error('Copy unavailable');
      }
      emailStatus.textContent = 'Copied';
      emailStatusTimer = setTimeout(() => { emailStatus.textContent = ''; }, 900);
    } catch {
      emailStatus.textContent = 'Select the email to copy it.';
    }
  });

  const rail = page.querySelector('.memories');
  const photos = [...page.querySelectorAll('.memory')];
  const terms = [...page.querySelectorAll('.term')];
  const zoom = document.createElement('dialog');
  zoom.className = 'about-page photo-zoom';
  zoom.setAttribute('aria-label', 'Enlarged photo');
  zoom.innerHTML = '<button type="button" class="photo-zoom-close" aria-label="Close enlarged photo">[ close × ]</button><div class="photo-zoom-content"></div>';
  document.body.append(zoom);
  const zoomContent = zoom.querySelector('.photo-zoom-content');
  zoom.querySelector('button').addEventListener('click', () => zoom.close());
  zoom.addEventListener('click', event => { if (event.target === zoom) zoom.close(); });
  zoom.addEventListener('close', () => {
    photos.forEach(photo => photo.setAttribute('aria-pressed', 'false'));
    zoomContent.replaceChildren();
  });
  let drag = null, ignoreClick = false, frame = 0, pointer = null;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  function select(photo) {
    const wasSelected = photo?.getAttribute('aria-pressed') === 'true';
    photos.forEach(item => item.setAttribute('aria-pressed', String(item === photo && !wasSelected)));
    if (!photo || wasSelected) { if (zoom.open) zoom.close(); return; }
    const image = photo.querySelector('.image img');
    const enlarged = photo.cloneNode(true);
    enlarged.removeAttribute('id');
    enlarged.removeAttribute('role');
    enlarged.removeAttribute('tabindex');
    enlarged.removeAttribute('aria-pressed');
    enlarged.removeAttribute('aria-describedby');
    enlarged.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    const ratio = Number(image.getAttribute('width')) / Number(image.getAttribute('height'));
    const hasDetails = photo.dataset.songUrl || photo.dataset.photoTag;
    const zoomWidth = `min(${ratio > 1 ? 546 : 390}px, calc((100dvh - ${hasDetails ? 280 : 200}px) * ${ratio}))`;
    enlarged.style.setProperty('--zoom-width', zoomWidth);
    zoomContent.style.setProperty('--zoom-width', zoomWidth);
    zoomContent.replaceChildren(enlarged);
    if (photo.dataset.songUrl) {
      const song = document.createElement('a');
      song.className = 'photo-song';
      song.href = photo.dataset.songUrl;
      song.target = '_blank';
      song.rel = 'noopener noreferrer';
      song.setAttribute('aria-label', 'Listen to Who Knows by Daniel Caesar on YouTube (opens in a new tab)');
      song.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14"/><path d="M13 10L23 16L13 22Z"/></svg><span><strong>Who Knows</strong><span>Daniel Caesar</span></span><small>YouTube ↗</small>';
      zoomContent.append(song);
    }
    if (photo.dataset.photoTag) {
      const caption = enlarged.querySelector(':scope > .paper > figcaption');
      const tag = caption.querySelector('.photo-caption');
      tag.classList.add('photo-zoom-tag');
      tag.textContent = photo.dataset.photoTag;
      // Match the decorative layer's height without drawing a second copy of the text.
      const inkCaption = enlarged.querySelector('.frame-drawing figcaption');
      inkCaption.replaceChildren(...[...caption.childNodes].map(node => node.cloneNode(true)));
    }
    if (!zoom.open) zoom.showModal();
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
    const image = photo.querySelector('.image img');
    const width = Number(image.getAttribute('width'));
    const height = Number(image.getAttribute('height'));
    photo.style.setProperty('--photo-ratio', `${width} / ${height}`);
    photo.classList.toggle('landscape', width > height);
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

  // Distort only a decorative copy of the ink, never the photo or its text.
  const filters = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  filters.setAttribute('width', '0');
  filters.setAttribute('height', '0');
  filters.setAttribute('aria-hidden', 'true');
  filters.style.position = 'absolute';
  filters.innerHTML = `<defs>${[2, 7, 12].map((seed, index) => `
    <filter id="frame-trace-${index + 1}" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".035 .065" numOctaves="2" seed="${seed}" result="grain"/>
      <feDisplacementMap in="SourceGraphic" in2="grain" scale="2.2" xChannelSelector="R" yChannelSelector="G"/>
    </filter>`).join('')}</defs>`;
  document.body.append(filters);
  page.querySelectorAll('.portrait, .memory > .paper').forEach(frame => {
    const drawing = frame.cloneNode(true);
    drawing.classList.add('frame-drawing');
    drawing.setAttribute('aria-hidden', 'true');
    drawing.inert = true;
    drawing.removeAttribute('aria-label');
    drawing.querySelectorAll('img, pre').forEach(content => content.remove());
    drawing.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    frame.classList.add('has-line-boil');
    frame.append(drawing);
  });
})();


(() => {
  const portrait = document.querySelector('#about-view .portrait');
  const image = portrait.querySelector('.image');
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'portrait-wink-trigger';
  trigger.setAttribute('aria-label', 'Play a wink on Yolanda’s photo');
  trigger.innerHTML = `<span class="portrait-wink-art" aria-hidden="true"><span class="portrait-eyes"><span>⢰⣿⡆</span><span class="portrait-eye-open">⢰⣿⡆</span><span class="portrait-eye-wink">⠤⠤⠤</span></span><span class="portrait-smile">⠈⠳⣤⣀⣀⣤⠞⠁</span></span><span class="portrait-spark spark-one" aria-hidden="true">⠐⣦⠂<br>⠒⣿⠒<br>⠠⠟⠄</span><span class="portrait-spark spark-two" aria-hidden="true">⠐⣦⠂<br>⠒⣿⠒<br>⠠⠟⠄</span><span class="portrait-spark spark-three" aria-hidden="true">⠐⣦⠂<br>⠒⣿⠒<br>⠠⠟⠄</span>`;
  image.append(trigger);
  let timer;
  const stop = () => {
    clearTimeout(timer);
    portrait.classList.remove('is-winking');
  };
  trigger.addEventListener('click', () => {
    if (portrait.classList.contains('is-winking')) return;
    portrait.classList.add('is-winking');
    timer = setTimeout(stop, 1900);
  });
  trigger.addEventListener('keydown', event => { if (event.key === 'Escape') stop(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('hashchange', stop);
})();
