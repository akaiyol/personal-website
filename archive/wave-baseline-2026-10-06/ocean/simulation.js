import { clamp, noise2D, seededRandom, lerp } from "./math.js";
export const WIDTH = 1000,
  HEIGHT = 320,
  N = 256,
  DX = WIDTH / (N - 1);
const SPEED = 105,
  FLOW = 52,
  BASE = 225;
function swell(x, t, seed) {
  let z = 0;
  for (const [l, a, c] of [
    [370, 40, 103],
    [223, 25, 119],
    [139, 18, 131],
    [71, 9, 145],
    [43, 4, 150],
  ]) {
    const q = x - c * t;
    z +=
      a *
      Math.cos((q * 2 * Math.PI) / l + seed / l) *
      (1 + 0.45 * noise2D(q / 650, t * 0.04, seed + Math.floor(l)));
  }
  return z + 13 * noise2D((x - 110 * t) / 180, t * 0.05, seed);
}
export function createOcean(seed = 270627) {
  const s = {
    seed,
    time: 0,
    eta: new Float64Array(N),
    v: new Float64Array(N),
    foam: new Float64Array(N),
    cool: new Float64Array(N),
    sheets: [],
    particles: [],
    pressure: 0,
    random: seededRandom(seed),
    impacts: 0,
  };
  for (let i = 0; i < N; i++) {
    const x = i * DX;
    s.eta[i] = swell(x, 0, seed);
    s.v[i] = (swell(x + FLOW * 0.01, 0.01, seed) - s.eta[i]) / 0.01;
  }
  return s;
}
export function sample(a, x) {
  const q = clamp(x / DX, 0, N - 1),
    i = Math.floor(q);
  return lerp(a[i], a[Math.min(N - 1, i + 1)], q - i);
}
export function surface(s, x) {
  return BASE - sample(s.eta, x);
}
export function impulse(s, x, strength, radius = 22) {
  for (
    let i = Math.max(0, Math.floor((x - radius * 3) / DX));
    i < Math.min(N, Math.ceil((x + radius * 3) / DX));
    i++
  ) {
    const w = Math.exp(-(((i * DX - x) / radius) ** 2));
    s.v[i] += strength * 0.15 * w;
    s.foam[i] = clamp(s.foam[i] + Math.abs(strength) * w * 0.008);
  }
}
function drop(s, x, y, vx, vy, size) {
  if (s.particles.length < 700)
    s.particles.push({ x, y, vx, vy, size, age: 0 });
}
function strip(s, x, energy, wall = false) {
  if (
    s.sheets.length >= 22 ||
    (!wall && s.sheets.some((p) => !p.wall && Math.abs(p.root - x) < 105))
  )
    return;
  const points = [];
  const count = 12 + Math.floor(s.random() * 9);
  const launch = Math.min(
    190 * energy,
    Math.sqrt(2 * 185 * Math.max(30, surface(s, x) - 65)),
  );
  for (let j = 0; j < count; j++) {
    const px = wall ? WIDTH - 2 - j * 2.8 : x + 110 * (j / count) * 1.25;
    const age = (j / count) * 1.25;
    const py = surface(s, x) + (wall ? 0 : -launch * age + 92.5 * age * age);
    points.push({
      x: px,
      y: py,
      index: j,
      vx: wall
        ? -40 -
          (energy * 90 * j) / count +
          noise2D(j * 0.22, s.time * 0.3, s.seed) * 12
        : 110 + energy * 25 + j * 3,
      vy: wall
        ? -Math.sqrt(2 * 185 * Math.max(40, surface(s, x) - 24)) *
          (0.98 - 0.45 * (j / count) ** 1.5)
        : -launch + 185 * age,
    });
  }
  s.sheets.push({
    points,
    age: 0,
    wall,
    energy,
    root: x,
    seed: s.seed + Math.round(x) * 37 + Math.round(s.time * 120) * 101,
  });
  if (wall) {
    s.impacts++;
    impulse(s, WIDTH - 42, -32 * energy, 26);
  }
}
export function updateOcean(s, dt) {
  s.time += dt;
  const e = new Float64Array(N),
    v = new Float64Array(N),
    f = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const x = i * DX,
      flow = FLOW * (1 - clamp((x - 880) / 120));
    const back = x - flow * dt,
      h = sample(s.eta, back),
      rate = sample(s.v, back);
    const left = s.eta[Math.max(0, i - 1)],
      right = s.eta[Math.min(N - 1, i + 1)];
    const lap = (left - 2 * s.eta[i] + right) / (DX * DX);
    const target = swell(x, s.time, s.seed);
    const stiffness = SPEED * SPEED * (1 + 0.38 * clamp(h / 65, -1, 1));
    // Spectral-style wind forcing sustains fine swell; differences still propagate
    // through the actual neighbouring field, including impacts and returned water.
    const epsilon = 0.035;
    const future = swell(x + flow * epsilon, s.time + epsilon, s.seed);
    const past = swell(x - flow * epsilon, s.time - epsilon, s.seed);
    const targetRate = (future - past) / (2 * epsilon);
    const targetAcceleration =
      (future - 2 * target + past) / (epsilon * epsilon);
    const targetLap =
      (swell(x - DX, s.time, s.seed) -
        2 * target +
        swell(x + DX, s.time, s.seed)) /
      (DX * DX);
    const forcing =
      targetAcceleration -
      stiffness * targetLap +
      0.065 * targetRate +
      1.5 * (target - h);
    v[i] = clamp(
      (rate + (stiffness * lap + forcing) * dt) * Math.exp(-0.065 * dt),
      -220,
      220,
    );
    e[i] = clamp(h + v[i] * dt, -85, 120);
    f[i] = Math.max(0, sample(s.foam, back) - dt * 0.25);
    s.cool[i] = Math.max(0, s.cool[i] - dt);
  }
  // Incoming boundary condition supplies swell, while the whole domain starts churning.
  e[0] = swell(0, s.time, s.seed);
  v[0] = (e[0] - s.eta[0]) / dt;
  s.eta = e;
  s.v = v;
  s.foam = f;
  const incoming = Math.max(0, v[N - 3]) + Math.max(0, e[N - 3] + 22) * 1.1;
  s.pressure = lerp(s.pressure, incoming, 1 - Math.exp(-dt * 6));
  if (s.pressure > 45 && v[N - 3] > 5 && s.cool[N - 1] === 0) {
    strip(s, WIDTH, clamp(s.pressure / 80, 0.55, 1.6), true);
    s.cool[N - 1] = 0.35 + 0.45 * s.random();
    s.foam[N - 1] = 1;
    s.pressure *= 0.45;
  }
  for (let i = 5; i < N - 12; i++) {
    const slope = (e[i + 2] - e[i - 2]) / (4 * DX);
    if (slope < -0.62 && e[i] > 28 && s.cool[i] === 0 && e[i] >= e[i + 4]) {
      strip(
        s,
        (i - 5) * DX,
        clamp(((e[i] + 20) / 90) * (-slope / 0.8), 0.4, 1.25),
      );
      for (let j = Math.max(0, i - 12); j < Math.min(N, i + 15); j++) {
        s.cool[j] = 1.1 + s.random() * 0.5;
        s.foam[j] = Math.max(s.foam[j], 0.65);
      }
    }
  }
  for (const sheet of s.sheets) {
    sheet.age += dt;
    if (sheet.wall && sheet.age < 0.6) {
      const root = sheet.points[0];
      root.x = WIDTH - 1;
      root.y = surface(s, WIDTH);
      root.vx = 0;
      root.vy = 0;
    }
    if (!sheet.wall) {
      sheet.root += 115 * dt;
      const root = sheet.points[0];
      root.x = Math.min(WIDTH, sheet.root);
      root.y = surface(s, root.x);
      root.vx = 115;
      root.vy = 0;
    }
    for (let j = 0; j < sheet.points.length; j++) {
      const p = sheet.points[j];
      if (p.merged) continue;
      if (j === 0 && (!sheet.wall || sheet.age < 0.6)) continue;
      p.vy += 185 * dt;
      p.vx *= Math.exp(-0.22 * dt);
      if (j) {
        const prev = sheet.points[j - 1],
          dist = Math.hypot(p.x - prev.x, p.y - prev.y),
          stretch = Math.max(0, dist - 7);
        p.vx += (prev.x - p.x) * stretch * 0.5 * dt;
        p.vy += (prev.y - p.y) * stretch * 0.5 * dt;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x > WIDTH - 1) {
        p.x = WIDTH - 1;
        p.vx = -Math.abs(p.vx) * 0.4;
        p.vy -= 50 * dt;
      }
      if (p.y > surface(s, p.x) && sheet.age > 0.3) {
        impulse(s, p.x, -Math.min(55, Math.abs(p.vy) * 0.17), 16);
        p.y = surface(s, p.x);
        p.vy = 0;
        p.merged = true;
      }
      if (s.random() < dt * (sheet.wall ? 5 : 2))
        drop(
          s,
          p.x,
          p.y,
          p.vx + (s.random() - 0.5) * 80,
          p.vy - 20 - s.random() * 70,
          0.7 + s.random() ** 3 * 4.5,
        );
    }
  }
  s.sheets = s.sheets.filter((p) => p.age < (p.wall ? 1.8 : 1.5));
  for (const p of s.particles) {
    p.age += dt;
    p.vy += 210 * dt;
    p.vx *= Math.exp(-0.12 * dt);
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.x > WIDTH) {
      p.x = WIDTH;
      p.vx = -Math.abs(p.vx) * 0.45;
    }
    if (p.vy > 0 && p.y >= surface(s, p.x)) {
      impulse(s, p.x, -Math.min(24, p.vy * 0.08), 10);
      p.age = 10;
    }
  }
  s.particles = s.particles.filter(
    (p) => p.age < 3 && p.x > -10 && p.y < HEIGHT + 10,
  );
}
