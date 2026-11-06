// Usage: node shoot.js editions/<week>/email.html editions/<week>
// Writes email.png (full email), hero.png (hero card), card-1.png to card-6.png into the folder.
const { chromium } = require('playwright');
const path = require('path');
const [,, html, dir = path.dirname(html)] = process.argv;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 660, height: 900 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.resolve(html));
  await p.waitForTimeout(600);
  await p.screenshot({ path: path.join(dir, 'email.png'), fullPage: true });
  await p.locator('#hero').screenshot({ path: path.join(dir, 'hero.png') });
  const cards = p.locator('.card');
  for (let i = 0; i < await cards.count(); i++) await cards.nth(i).screenshot({ path: path.join(dir, `card-${i+1}.png`) });
  await b.close();
  console.log('wrote', dir);
})();
