(() => {
  document.querySelectorAll('[data-snoopy-avatar]').forEach(async avatar => {
    if (avatar.dataset.avatarSrc) {
      try {
        const response = await fetch(avatar.dataset.avatarSrc);
        if (!response.ok) throw new Error('Avatar could not load');
        avatar.innerHTML = await response.text();
      } catch { return; }
    }
    const motion = avatar.querySelector('.snoopy-motion');
    let resetTimer;
    let lastGreeting = -Infinity;
    const reset = () => {
      clearTimeout(resetTimer);
      avatar.classList.remove('is-reacting');
    };
    const greet = () => {
      // A pointer entry and its subsequent click count as one greeting.
      if (avatar.classList.contains('is-inspecting') || avatar.classList.contains('is-reacting') || performance.now() - lastGreeting < 350) return;
      lastGreeting = performance.now();
      avatar.classList.add('is-reacting');
      resetTimer = setTimeout(reset, matchMedia('(prefers-reduced-motion: reduce)').matches ? 650 : 1550);
    };
    avatar.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch') greet();
    });
    avatar.addEventListener('focus', greet);
    avatar.addEventListener('click', greet);
    motion.addEventListener('animationend', event => {
      if (event.target === motion && event.animationName === 'avatar-reaction') reset();
    });
  });
})();
