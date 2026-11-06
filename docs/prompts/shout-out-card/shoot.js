// Usage: node shoot.js out.html prefix
// Writes prefix-email.png (full email), prefix-hero.png (hero card), prefix-card-N.png (each small card).
const { chromium } = require('playwright');
const [,, html, prefix='shoutout'] = process.argv;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 660, height: 900 }, deviceScaleFactor: 2 });
  await p.goto('file://' + require('path').resolve(html));
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${prefix}-email.png`, fullPage: true });
  await p.locator('#hero').screenshot({ path: `${prefix}-hero.png` });
  const cards = p.locator('.card');
  for (let i = 0; i < await cards.count(); i++) await cards.nth(i).screenshot({ path: `${prefix}-card-${i+1}.png` });
  await b.close();
})();
