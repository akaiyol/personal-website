(() => {
  const page = document.querySelector('#about-view');
  const machine = page.querySelector('.fact-machine');
  const tracks = [...machine.querySelectorAll('.fact-track')];
  const button = machine.querySelector('.fact-roll');
  const results = machine.querySelector('.fact-results');
  // Replace these strings with personal facts when ready.
  const facts = [
    '#aura-farmer',
    '#pianist',
    '#purple',
    '#heytea-guava-green-grape',
    '#tft',
    '#gamer',
    '#nonchalant',
    '#larp',
    '#cloudy-day',
    '#joji',
    '#BASS',
    '#fuzhounese',
    '#chinese-canadian',
    '#tangyuan',
    '#ENTP',
    '#capture-every-moment',
    '#nerd',
    '#fashion',
    "#gundam"
  ];
  const jackpotFact = 'labubu';
  const symbols = ['⠿⠿','⣀⣿','⣿⣀','⣾⡇','⡇⣷','⢸⣇','⣹⢾','⡯⣽','⣶⣶','⢿⡿','⣤⠛','⠛⣤','⣧⣴','⣰⣆','⢾⡷'];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function randomInt(limit) {
    const ceiling = Math.floor(4294967296 / limit) * limit;
    let value;
    do { value = crypto.getRandomValues(new Uint32Array(1))[0]; } while (value >= ceiling);
    return value % limit;
  }
  function outcome() {
    const jackpot = randomInt(100) < 1;
    const pool = [...facts.keys()];
    const values = [];
    for (let i = 0; i < 4; i++) values.push(pool.splice(randomInt(pool.length), 1)[0]);
    return {jackpot, values: jackpot ? Array(4).fill(values[0]) : values};
  }
  let played = false, animation = null, pending = null;
  function symbolRow(index, jackpot = false) {
    const row = document.createElement('span');
    row.textContent = jackpot ? '⠀⠀⢰⡆⠀⠀\n⠈⢻⣿⣿⡟⠁\n⠀⠘⠉⠉⠃⠀' : symbols[index % symbols.length];
    if (jackpot) row.className = 'braille-star';
    return row;
  }
  function finish() {
    if (!pending) return;
    if (animation !== null) cancelAnimationFrame(animation);
    animation = null;
    const result = pending;
    pending = null;
    tracks.forEach((track, i) => {
      track.replaceChildren(symbolRow(result.values[i], result.jackpot));
      track.style.transform = '';
    });
    const texts = result.jackpot ? [jackpotFact] : result.values.map(i => facts[i]);
    results.replaceChildren(...texts.map(text => {
      const p = document.createElement('p');
      if (['#gundam', '#cloudy-day', '#bass'].includes(text.toLowerCase())) {
        const photoTag = document.createElement('button');
        photoTag.type = 'button';
        photoTag.className = 'fact-photo-tag';
        photoTag.textContent = text;
        photoTag.setAttribute('aria-label', `Open photo for ${text}`);
        photoTag.addEventListener('click', () => dispatchEvent(new CustomEvent('site:fact-photo', {detail: text.toLowerCase()})));
        p.append(photoTag);
      } else if (text === '#gamer') {
        const link = document.createElement('a');
        link.className = 'fact-photo-tag';
        link.textContent = text;
        link.href = 'https://steamcommunity.com/profiles/76561198983188801/';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.addEventListener('click', () => link.blur());
        link.setAttribute('aria-label', 'View my Steam profile (opens in a new tab)');
        p.append(link);
      } else p.textContent = text;
      if (result.jackpot) p.className = 'jackpot';
      return p;
    }));
    machine.classList.toggle('is-jackpot', result.jackpot);
    results.setAttribute('aria-busy', 'false');
    button.disabled = false;
  }
  function roll() {
    if (pending || page.hidden || document.hidden) return;
    played = true;
    pending = outcome();
    results.setAttribute('aria-busy', 'true');
    results.replaceChildren();
    machine.classList.remove('is-jackpot');
    button.disabled = true;
    if (reduced.matches) { finish(); return; }
    const stops = [1100, 1350, 1600, 1850];
    const steps = [20, 24, 28, 32];
    tracks.forEach((track, reel) => {
      track.replaceChildren(...Array.from({length: steps[reel] + 1}, (_, step) => symbolRow(step === steps[reel] ? pending.values[reel] : (step + reel * 4) % symbols.length, step === steps[reel] && pending.jackpot)));
    });
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const rowHeight = tracks[0].firstElementChild.getBoundingClientRect().height;
      tracks.forEach((track, i) => {
        const progress = Math.min(1, elapsed / stops[i]);
        // Decelerate each physical strip into its selected symbol.
        const eased = 1 - Math.pow(1 - progress, 3);
        track.style.transform = `translateY(${-steps[i] * rowHeight * eased}px)`;
      });
      if (elapsed >= stops[3]) finish();
      else animation = requestAnimationFrame(tick);
    }
    animation = requestAnimationFrame(tick);
  }
  function route() {
    if (page.hidden || document.hidden) finish();
    else if (!played) roll();
  }
  button.addEventListener('click', roll);
  document.addEventListener('keydown', event => {
    if (event.key !== '1' || event.repeat || event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || page.hidden) return;
    const dialog = document.querySelector('dialog[open]');
    if (dialog) {
      if (!dialog.matches('.photo-zoom') || !dialog.querySelector('.photo-zoom-tag')) return;
      event.preventDefault();
      dialog.close();
      button.focus({preventScroll: true});
      roll();
      return;
    }
    // Preserve typing and the native behavior of other interactive controls.
    if (event.target.closest('input, textarea, select, button, a, [role="button"], [role="checkbox"], [contenteditable="true"]')) return;
    event.preventDefault();
    roll();
  });
  addEventListener('site:route', route);
  document.addEventListener('visibilitychange', route);
  reduced.addEventListener('change', () => { if (reduced.matches) finish(); });
  route();
})();
