const assert = require('assert');
async function checkFlowerField(page, expectedPlants) {
  const field = page.locator('#flower-field');
  await field.scrollIntoViewIfNeeded();
  await field.focus();
  await page.keyboard.press('End');
  await page.waitForFunction(count => Number(document.querySelector('#flower-art').dataset.plants) === count && document.querySelector('#flower-art').dataset.progress === '1.000000', expectedPlants);
  assert(await page.locator('.flower-growth-hint').isHidden(), 'Growth hint should disappear after interaction');
  const size = await page.locator('#flower-art').boundingBox();
  assert(size.width > 0 && size.height > 0, 'Flower canvas has no rendered area');
  await page.keyboard.press('ArrowLeft');
  await page.waitForFunction(() => Number(document.querySelector('#flower-art').dataset.progress) < 1);
  await page.keyboard.press('End');
  await page.waitForFunction(() => document.querySelector('#flower-art').dataset.progress === '1.000000');
}
module.exports = { checkFlowerField };
