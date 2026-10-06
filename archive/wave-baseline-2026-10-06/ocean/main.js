import { createOcean, updateOcean } from "./simulation.js";
import { renderOcean, renderBraille } from "./render.js";
const element = document.querySelector("#waves");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d", { willReadFrequently: true });
const study = document.body.dataset.oceanStudy === "true";
const forcedStatic =
  study && new URLSearchParams(location.search).get("motion") === "reduce";
const isReduced = () => reduced.matches || forcedStatic;
const requestedTime = study
  ? new URLSearchParams(location.search).get("time")
  : null;
const checkpoint =
  requestedTime !== null
    ? Math.max(0, Math.min(60, Number(requestedTime) || 0))
    : null;
const seed = 270627;
let ocean = createOcean(seed),
  width = 0,
  height = 0,
  accumulator = 0;
function render() {
  if (!width || !height) return;
  renderOcean(context, ocean, width, height);
  element.textContent = renderBraille(context, width, height);
}
function resize() {
  const probe = document.createElement("span");
  probe.textContent = "⣿";
  probe.style.cssText = `position:absolute;visibility:hidden;font:${getComputedStyle(element).font};`;
  element.append(probe);
  const cell = probe.getBoundingClientRect().width || 6;
  probe.remove();
  width = Math.ceil(element.clientWidth / cell) * 2;
  height =
    Math.ceil(
      element.clientHeight / parseFloat(getComputedStyle(element).lineHeight),
    ) * 4;
  canvas.width = width;
  canvas.height = height;
  render();
}
function staticComposition() {
  ocean = createOcean(seed);
  for (let i = 0; i < 660; i++) updateOcean(ocean, 1 / 120);
  render();
}
// A separate simulation clock prevents render throttling from changing water speed.
let previous = 0,
  paint = 0;
function tick(now) {
  const dt = previous ? Math.min((now - previous) / 1000, 0.08) : 0;
  previous = now;
  if (!document.hidden && !isReduced()) {
    accumulator += dt;
    while (accumulator >= 1 / 120) {
      updateOcean(ocean, 1 / 120);
      accumulator -= 1 / 120;
    }
    if (now - paint >= 50) {
      render();
      paint = now;
    }
  }
  requestAnimationFrame(tick);
}
reduced.addEventListener("change", () => {
  accumulator = 0;
  previous = 0;
  if (isReduced()) staticComposition();
  else {
    ocean = createOcean(seed);
    render();
  }
});
document.addEventListener("visibilitychange", () => {
  previous = 0;
  accumulator = 0;
});
new ResizeObserver(resize).observe(element);
resize();
if (isReduced()) staticComposition();
else if (checkpoint !== null) {
  for (let i = 0; i < Math.round(checkpoint * 120); i++)
    updateOcean(ocean, 1 / 120);
  render();
}
if (checkpoint === null) requestAnimationFrame(tick);
