// Renders PNGs from the email HTML. Tries, in order: Playwright with the Edge already on the
// machine, Playwright with Chrome, Playwright's own Chromium, then the Edge or Chrome
// command line with no Playwright at all. Node only is required for the last path.
// Usage: node shoot.js editions/<week>/email.html editions/<week>
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const [,, html, dir = path.dirname(process.argv[2])] = process.argv;
const abs = p => 'file://' + path.resolve(p).replace(/\\/g, '/');

async function withPlaywright() {
  if (process.env.NO_PLAYWRIGHT) return false;
  let pw; try { pw = require('playwright'); } catch { return false; }
  const tries = [{ channel: 'msedge' }, { channel: 'chrome' }, {}];
  for (const opts of tries) {
    let b; try { b = await pw.chromium.launch(opts); } catch { continue; }
    const p = await b.newPage({ viewport: { width: 660, height: 900 }, deviceScaleFactor: 2 });
    await p.goto(abs(html)); await p.waitForTimeout(600);
    await p.screenshot({ path: path.join(dir, 'email.png'), fullPage: true });
    await p.locator('#hero').screenshot({ path: path.join(dir, 'hero.png') });
    const cards = p.locator('.card');
    for (let i = 0; i < await cards.count(); i++) await cards.nth(i).screenshot({ path: path.join(dir, `card-${i+1}.png`) });
    await b.close();
    console.log('rendered with Playwright', opts.channel || 'chromium');
    return true;
  }
  return false;
}

function findBrowser() {
  const c = process.env.BROWSER_EXE ? [process.env.BROWSER_EXE] : [];
  const pf = [process.env['ProgramFiles(x86)'], process.env.ProgramFiles, process.env.LOCALAPPDATA].filter(Boolean);
  for (const base of pf) c.push(path.join(base, 'Microsoft/Edge/Application/msedge.exe'), path.join(base, 'Google/Chrome/Application/chrome.exe'));
  c.push('/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/microsoft-edge', '/usr/bin/google-chrome', '/usr/bin/chromium', '/opt/pw-browsers/chromium');
  return c.find(p => fs.existsSync(p));
}

function withCli() {
  const exe = findBrowser();
  if (!exe) return false;
  const src = fs.readFileSync(html, 'utf8');
  const body = /<body[^>]*>([\s\S]*)<\/body>/.exec(src)[1];
  const style = /<style>([\s\S]*?)<\/style>/.exec(src)[1];
  const pieces = [];
  const hero = /<div id="hero"[\s\S]*?<\/div>\s*<\/div>\s*(?=<div class="card")/.exec(body);
  if (hero) pieces.push(['hero', hero[0], 560]);
  const cards = body.match(/<div class="card"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g) || [];
  cards.forEach((c, i) => pieces.push([`card-${i+1}`, c, 230]));
  const shot = (name, inner, w, h) => {
    const f = path.join(dir, `_${name}.html`);
    fs.writeFileSync(f, `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${style} body{padding:0;background:#EEF1F5;display:block}</style></head><body>${inner}</body></html>`);
    execFileSync(exe, ['--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=2', `--window-size=${w},${h}`, `--screenshot=${path.resolve(dir, name + '.png')}`, abs(f)], { stdio: 'ignore' });
    fs.unlinkSync(f);
  };
  for (const [name, inner, h] of pieces) shot(name, inner, 600, h);
  execFileSync(exe, ['--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=2', '--window-size=660,5400', `--screenshot=${path.resolve(dir, 'email.png')}`, abs(html)], { stdio: 'ignore' });
  console.log('rendered with', exe);
  return true;
}

(async () => {
  if (await withPlaywright()) return;
  if (withCli()) return;
  console.log('No browser found. Open ' + html + ' in Edge and print or screenshot it.');
  process.exitCode = 2;
})();
