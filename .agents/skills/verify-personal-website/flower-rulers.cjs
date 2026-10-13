const assert = require('assert');

async function checkFlowerRulers(page, expectedPlants) {
  await page.waitForFunction(() => document.querySelectorAll('.timeline-flowers [data-stem-ruler]').length === 11);
  const rulers = await page.locator('.timeline-flowers [data-flower]').evaluateAll(plants =>
    plants.filter(p => getComputedStyle(p).display !== 'none').map(plant => {
      const ruler = plant.querySelector('[data-stem-ruler]');
      return {
        ticks: ruler ? ruler.querySelectorAll('path').length : 0,
        labels: ruler ? [...ruler.querySelectorAll('text')].map(label => {
          const matrix = label.getScreenCTM();
          const font = parseFloat(getComputedStyle(label).fontSize);
          const box = label.getBoundingClientRect();
          return { side: label.getAttribute('text-anchor'), value: label.textContent, screenFont: matrix ? font * Math.hypot(matrix.a, matrix.b) : 0,
            visible: getComputedStyle(label).visibility !== 'hidden' && parseFloat(getComputedStyle(label).opacity) > 0 && box.width > 0 && box.height > 0 };
        }) : []
      };
    })
  );
  assert.equal(rulers.length, expectedPlants, 'Unexpected number of visible flower plants');
  // Guard against the demonstrated style regression; this is not a readability rating.
  // The approved 320px artwork renders these decorative labels at about 5.4px.
  for (const ruler of rulers) {
    assert(ruler.ticks > 4, 'Stem ruler is missing minor ticks');
    assert.deepEqual(ruler.labels.map(l => l.value), ['.10', '.20', '.30', '.40', '.50', '.60', '.70', '.80'], 'Stem ruler labels are missing or incorrect');
    for (const label of ruler.labels) {
      assert.equal(label.side, 'start', 'Ruler labels must stay on the right side');
      assert(label.visible, 'Stem ruler label is hidden or has no rendered size');
      assert(label.screenFont >= 5, `Stem ruler label is too small: ${label.screenFont.toFixed(2)} screen pixels`);
    }
  }
}

module.exports = { checkFlowerRulers };
