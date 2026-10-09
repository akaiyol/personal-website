(() => {
  const canvas = document.querySelector('.scroll-caterpillar');
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = null;
  function draw() {
    frame = null;
    if (document.hidden) return;
    const {width: canvasWidth, height: canvasHeight} = canvas.getBoundingClientRect();
    const width = canvasHeight, height = canvasWidth;
    const scale = Math.min(devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(canvasWidth * scale) || canvas.height !== Math.round(canvasHeight * scale)) {
      canvas.width = Math.round(canvasWidth * scale);
      canvas.height = Math.round(canvasHeight * scale);
    }
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.translate(canvasWidth, 0);
    ctx.rotate(Math.PI / 2);
    const phase = reduced.matches ? 0 : scrollY / 110 * Math.PI * 2;
    const arch = (1 - Math.cos(phase)) / 2;
    const compact = innerWidth <= 700;
    const lift = (compact ? 9 : 13) * arch;
    const fullLength = Math.min(compact ? 64 : 78, width * .18);
    const length = fullLength - (compact ? 7 : 9) * arch;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const progress = maxScroll ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
    const inset = 6 + progress * Math.max(0, width - fullLength - 12) + (fullLength - length) / 2;
    const baseline = compact ? 10 : 12;
    const y = t => baseline + lift * Math.sin(Math.PI * t) ** 2;
    const body = () => {
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const t = i / 120;
        if (i === 0) ctx.moveTo(inset, y(t));
        else ctx.lineTo(inset + t * length, y(t));
      }
    };
    // Rounded nubs underneath the body; no eyes, face, or antennae.
    ctx.strokeStyle = '#C5B5EC';
    ctx.lineWidth = compact ? 3 : 4;
    ctx.lineCap = 'round';
    ctx.setLineDash([]);
    const feet = Math.max(4, Math.floor(length / 12));
    for (let i = 1; i < feet; i++) {
      const t = i / feet;
      const x = inset + t * length;
      const step = reduced.matches ? 0 : Math.sin(phase + i * Math.PI) * 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y(t) - (compact ? 5 : 6));
      ctx.lineTo(x + step, y(t) - (compact ? 8 : 10));
      ctx.stroke();
    }
    body();
    ctx.lineWidth = compact ? 14 : 18;
    ctx.stroke();
    body();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = compact ? 9 : 12;
    ctx.lineCap = 'butt';
    ctx.setLineDash([3, 7]);
    ctx.lineDashOffset = reduced.matches ? 0 : -scrollY * .18;
    ctx.stroke();
    ctx.setLineDash([]);
  }
  function schedule() {
    if (!document.hidden && frame === null) frame = requestAnimationFrame(draw);
  }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  addEventListener('site:route', schedule);
  reduced.addEventListener('change', schedule);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = null; }
    else schedule();
  });
  schedule();
})();
