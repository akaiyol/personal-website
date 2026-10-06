import { noise2D, clamp } from "./math.js";
import { WIDTH, HEIGHT, surface, sample } from "./simulation.js";
function line(ctx, points, width = 1, level = 255) {
  ctx.strokeStyle = `rgb(${level},${level},${level})`;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (const p of points.slice(1)) ctx.lineTo(p.x, p.y);
  ctx.stroke();
}
function patch(ctx, points, level = 255) {
  ctx.fillStyle = `rgb(${level},${level},${level})`;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (const p of points.slice(1)) ctx.lineTo(p.x, p.y);
  ctx.closePath();
  ctx.fill();
}
function tapered(ctx, points, width) {
  const left = [],
    right = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[Math.max(0, i - 1)],
      b = points[Math.min(points.length - 1, i + 1)];
    const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const r = width * (1 - i / (points.length - 1)) ** 0.75;
    const nx = -(b.y - a.y) / length,
      ny = (b.x - a.x) / length;
    left.push({ x: points[i].x + nx * r, y: points[i].y + ny * r });
    right.push({ x: points[i].x - nx * r, y: points[i].y - ny * r });
  }
  patch(ctx, [...left, ...right.reverse()]);
}
// Foam is a joined hierarchy of lobes and tapered forks anchored to water state.
function claw(ctx, root, tangent, normal, length, width, seed, time) {
  length = Math.min(
    length,
    Math.max(0, root.y - 12) /
      (1.7 * Math.abs(normal.y) + Math.abs(tangent.y) + 0.15),
  );
  const turn = noise2D(seed * 0.013, time * 0.16, seed) * 0.2;
  const points = [];
  for (let k = 0; k <= 10; k++) {
    const t = k / 10,
      reach = length * Math.sin(Math.PI * 1.05 * t);
    const hook = length * (0.85 * t * t + 0.12 * Math.sin(t * Math.PI));
    points.push({
      x: root.x + normal.x * reach + tangent.x * hook,
      y: root.y + normal.y * reach + tangent.y * hook + turn * length * t * t,
    });
  }
  tapered(ctx, points, width);
  for (const [t, side] of [
    [0.42, -1],
    [0.66, 1],
  ]) {
    const origin = points[Math.round(t * 10)],
      reach = length * (side < 0 ? 0.5 : 0.32);
    const fork = [];
    for (let k = 0; k <= 6; k++) {
      const f = k / 6,
        arc = reach * Math.sin(Math.PI * 0.95 * f),
        bend = reach * side * (f + 0.4 * f * f);
      fork.push({
        x: origin.x + normal.x * arc + tangent.x * bend,
        y: origin.y + normal.y * arc + tangent.y * bend,
      });
    }
    tapered(ctx, fork, width * 0.48);
  }
}
function crown(ctx, points, s, energy, seed, pixelScale) {
  if (points.length < 2) return;
  const top = Math.min(...points.map((p) => p.y));
  const size = Math.min(1.65, Math.max(1, 280 / pixelScale));
  for (let i = 1; i < points.length; i++) {
    const p = points[i],
      a = points[i - 1];
    const activation = clamp((top + 65 - p.y) / 45);
    if (activation <= 0) continue;
    line(ctx, [a, p], (9 + energy * 7) * activation);
    if ((p.index ?? i) % 4 !== 0) continue;
    const len = Math.hypot(p.x - a.x, p.y - a.y) || 1;
    let nx = -(p.y - a.y) / len,
      ny = (p.x - a.x) / len;
    if (ny > 0) {
      nx = -nx;
      ny = -ny;
    }
    const tangent = { x: (p.x - a.x) / len, y: (p.y - a.y) / len };
    const material = p.index ?? i;
    const variation = 0.8 + 0.45 * noise2D(material * 0.65, 0, seed);
    claw(
      ctx,
      p,
      tangent,
      { x: nx, y: ny },
      (25 + energy * 16) * variation * activation * size,
      (5 + energy * 3) * activation * size,
      seed + material * 73,
      s.time,
    );
  }
}
export function renderOcean(ctx, s, w, h) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.scale(w / WIDTH, h / HEIGHT);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // A single connected silhouette, selectively exposed through flowing interior marks.
  for (let band = 0; band < 10; band++) {
    let points = [];
    for (let x = 0; x <= WIDTH; x += 3) {
      const d = band * 5.5,
        y =
          surface(s, x) * (1 - band * 0.025) +
          HEIGHT * band * 0.025 +
          d * 0.18 +
          noise2D((x - s.time * 68) / 75, band * 0.17, s.seed + 80) *
            band *
            0.75;
      const n = noise2D((x - s.time * 72) / 44, band * 0.47, s.seed);
      if (n > -0.35 || band < 2)
        points.push({
          x,
          y: y + noise2D((x - s.time * 52) / 90, band * 0.3, s.seed + 11) * 3,
        });
      else if (points.length > 1) {
        line(ctx, points, band < 2 ? 2.8 : 2, band < 2 ? 160 : 145);
        points = [];
      }
    }
    if (points.length > 1)
      line(ctx, points, band < 2 ? 2.8 : 2, band < 2 ? 160 : 145);
  }
  for (let x = 0; x < WIDTH; x += 4) {
    const foam = sample(s.foam, x);
    if (foam > 0.1) {
      const y = surface(s, x);
      line(
        ctx,
        [
          { x, y: y - 2 },
          { x: x + 4, y: surface(s, x + 4) - 2 },
        ],
        4 + foam * 14,
      );
    }
  }
  for (const sheet of s.sheets) {
    const ps = sheet.points.filter((p) => !p.merged);
    if (sheet.wall && ps.length > 2) {
      ctx.fillStyle = "rgb(60,60,60)";
      ctx.beginPath();
      ctx.moveTo(WIDTH, surface(s, WIDTH));
      for (const p of ps) ctx.lineTo(p.x, p.y);
      ctx.lineTo(WIDTH, ps.at(-1).y);
      ctx.closePath();
      ctx.fill();
      for (let band = 1; band < 5; band++) {
        const f = band / 5;
        line(
          ctx,
          ps.map((p) => ({
            x: p.x + (WIDTH - p.x) * f,
            y: p.y + noise2D(p.x / 30, f + s.time * 0.15, s.seed) * 3,
          })),
          2.2,
          105,
        );
      }
    }
    if (!sheet.wall && ps.length > 2) {
      for (let band = 1; band < 6; band++) {
        const interior = ps.map((p, i) => {
          const taper = Math.sin((Math.PI * i) / ps.length);
          return { x: p.x - band * 3 * taper, y: p.y + band * 4 * taper };
        });
        line(ctx, interior, 1.5, 100);
      }
    }
    for (let j = 1; j < ps.length; j++) {
      const p = ps[j],
        a = ps[j - 1];

      line(ctx, [a, p], 3.5 + sheet.energy * 6 * (1 - j / ps.length));
    }
    crown(ctx, ps, s, sheet.energy, sheet.seed, w);
  }

  for (const p of s.particles) {
    line(
      ctx,
      [
        { x: p.x, y: p.y },
        { x: p.x - p.vx * 0.018, y: p.y - p.vy * 0.018 },
      ],
      p.size * 2.2,
    );
  }
  ctx.restore();
}
const dots = [
  [0, 0, 0],
  [0, 1, 1],
  [0, 2, 2],
  [1, 0, 3],
  [1, 1, 4],
  [1, 2, 5],
  [0, 3, 6],
  [1, 3, 7],
];
export function renderBraille(ctx, w, h) {
  const pixels = ctx.getImageData(0, 0, w, h).data,
    rows = [];
  for (let y = 0; y < h; y += 4) {
    let row = "";
    for (let x = 0; x < w; x += 2) {
      let mask = 0;
      for (const [dx, dy, bit] of dots) {
        const px = x + dx,
          py = y + dy;
        if (py >= h) continue;
        const k = (py * w + px) * 4;
        const coverage = (pixels[k] * pixels[k + 3]) / 255;
        let hash = Math.imul(px + 1, 374761393) ^ Math.imul(py + 1, 668265263);
        hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
        const threshold = 32 + (((hash ^ (hash >>> 16)) >>> 0) % 190);
        if (coverage > threshold) mask |= 1 << bit;
      }
      row += String.fromCharCode(0x2800 + mask);
    }
    rows.push(row);
  }
  return rows.join("\n");
}
