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
    '#nonchalant',
    'cloudy-day',
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
  const rowHeight = 48;
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
      p.textContent = text;
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
    if (event.key !== 'Enter' || event.repeat || event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || page.hidden) return;
    // Preserve Enter for terminal navigation, links, and photo controls.
    if (event.target.closest('input, textarea, select, button, a, [role="button"], [role="checkbox"], [contenteditable="true"]')) return;
    event.preventDefault();
    roll();
  });
  addEventListener('site:route', route);
  document.addEventListener('visibilitychange', route);
  reduced.addEventListener('change', () => { if (reduced.matches) finish(); });
  route();
})();
