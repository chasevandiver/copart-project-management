// CDS Shout Out card generator.
// Usage: node card.js content.json out.html
// Renders the email (hero card + six cards + board + close) as HTML. Screenshot it with
// shoot.js for the PNGs. hero_image in the JSON is the weekly hero background (a path
// relative to this folder, or a URL). Leave it empty for a plain Copart blue hero.
// photo fields are optional headshot paths; empty shows the placeholder circle.
const fs = require('fs');
const path = require('path');
const d = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const out = process.argv[3] || 'out.html';
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const C = { blue:'#0A4DA3', navy:'#082E63', sky:'#CFE0F7', white:'#FFFFFF', ink:'#111418', body:'#2E333B', muted:'#5B6470', page:'#EEF1F5', line:'#DCE1E8' };
const HEAD = "'Inter Display','Inter','Arial Black',Arial,sans-serif";
const BODY = "'Inter',Arial,sans-serif";
const src = p => !p ? '' : (/^https?:/.test(p) ? p : 'file://' + path.resolve(path.dirname(process.argv[2]), p));
const photo = (p, size) => p
  ? `<div style="width:${size}px;height:${size}px;border-radius:50%;border:4px solid ${C.white};box-shadow:0 8px 24px rgba(0,0,0,.25);overflow:hidden;background:${C.sky}"><img src="${src(p)}" style="width:100%;height:100%;object-fit:cover"></div>`
  : `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${C.sky};border:4px solid ${C.white};box-shadow:0 8px 24px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center"><svg width="${size*0.7}" height="${size*0.7}" viewBox="0 0 100 100"><circle cx="50" cy="36" r="20" fill="${C.blue}" opacity=".55"/><path d="M12 96c3-24 20-36 38-36s35 12 38 36z" fill="${C.blue}" opacity=".55"/></svg></div>`;
const h = d.hero;
const heroCard = `
<div id="hero" style="position:relative;width:600px;height:560px;border-radius:14px;overflow:hidden;background:${C.navy};font-family:${BODY}">
  ${d.hero_image?`<img src="${src(d.hero_image)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(.4) contrast(1.05)">`:''}
  <div style="position:absolute;inset:0;background:${d.hero_image?`linear-gradient(100deg, rgba(8,46,99,.97) 0%, rgba(10,77,163,.88) 55%, rgba(10,77,163,.45) 100%)`:`linear-gradient(120deg, ${C.navy} 0%, ${C.blue} 70%, #2B74D8 100%)`}"></div>
  <div style="position:absolute;right:-40px;top:-40px;width:260px;height:260px;border-radius:50%;border:40px solid rgba(255,255,255,.07)"></div>
  <div style="position:absolute;left:0;top:0;right:0;padding:26px 30px 0;display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      <div style="font-family:${HEAD};font-weight:800;font-size:14px;letter-spacing:.5px;color:${C.white}">Copart <span style="font-weight:500;opacity:.85">Dealer Services</span></div>
      <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.sky};margin-top:6px">CDS Shout Out · ${esc(d.week_short)}</div>
    </div>
    <div style="background:${C.white};color:${C.navy};font-family:${HEAD};font-weight:900;font-size:12px;letter-spacing:1.5px;padding:7px 11px;border-radius:4px;text-transform:uppercase;box-shadow:0 4px 12px rgba(0,0,0,.2)">${esc(h.tag||'Lot #1')}</div>
  </div>
  <div style="position:absolute;right:30px;top:96px">${photo(h.photo,150)}</div>
  <div style="position:absolute;left:30px;right:30px;top:118px">
    <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.sky};max-width:360px">${esc(h.label)}</div>
    <div style="font-family:${HEAD};font-weight:900;font-size:72px;line-height:.95;letter-spacing:-3px;color:${C.white};margin-top:14px;max-width:380px">${esc(h.nick)}</div>
    ${h.name?`<div style="font-size:16px;color:${C.sky};margin-top:10px">${esc(h.name)}</div>`:''}
  </div>
  <div style="position:absolute;left:30px;right:30px;top:352px;display:grid;grid-template-columns:repeat(${h.stats.length},1fr);gap:10px">
    ${h.stats.map(([n,l])=>`<div style="background:${C.white};border-radius:8px;padding:14px 14px 12px;border-bottom:5px solid ${C.blue}"><div style="font-family:${HEAD};font-weight:900;font-size:36px;line-height:1;letter-spacing:-1.5px;color:${C.blue};white-space:nowrap">${esc(n)}</div><div style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};margin-top:8px">${esc(l)}</div></div>`).join('')}
  </div>
  <div style="position:absolute;left:30px;right:30px;bottom:26px;font-size:16px;line-height:1.5;color:${C.white}">${esc(h.line)}</div>
</div>`;
const small = c => `
<div class="card" style="position:relative;width:600px;border-radius:12px;overflow:hidden;background:${C.white};border:1px solid ${C.line};font-family:${BODY};display:flex">
  <div style="width:8px;background:${C.blue}"></div>
  <div style="padding:22px 24px 20px;flex:1;display:flex;gap:18px;align-items:center">
    <div style="flex:1">
      <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.blue}">${esc(c.label)}</div>
      <div style="font-family:${HEAD};font-weight:900;font-size:34px;line-height:1;letter-spacing:-1.5px;color:${C.ink};margin-top:8px">${esc(c.nick)}</div>
      ${c.name?`<div style="font-size:13px;color:${C.muted};margin-top:4px">${esc(c.name)}</div>`:''}
      <div style="font-size:15px;line-height:1.5;color:${C.body};margin-top:12px">${esc(c.line)}</div>
    </div>
    <div style="text-align:center;min-width:150px;display:flex;flex-direction:column;align-items:center">
      ${photo(c.photo,84)}
      <div style="font-family:${HEAD};font-weight:900;font-size:38px;line-height:1;letter-spacing:-1.5px;color:${C.blue};margin-top:10px;white-space:nowrap">${esc(c.big)}</div>
      <div style="font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${C.muted};margin-top:6px;max-width:150px">${esc(c.cap)}</div>
    </div>
  </div>
</div>`;
const board = `
<div style="width:600px;background:${C.white};border:1px solid ${C.line};border-radius:12px;padding:20px 24px 8px;font-family:${BODY}">
  <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.blue};margin-bottom:10px">The board, in brief</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
  ${Object.entries(d.board).map(([title,rows])=>`<div style="margin-bottom:14px"><div style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};padding-bottom:4px">${esc(title)}</div>${rows.map(r=>`<div style="display:flex;justify-content:space-between;align-items:baseline;padding:6px 0;border-top:1px solid ${C.line};font-size:13px;color:${C.ink}"><span><b>${esc(r[0])}</b>${r[1]?` <span style="color:${C.muted}">${esc(r[1])}</span>`:''}</span><b style="font-family:${HEAD};font-size:15px;white-space:nowrap">${esc(r[2])}</b></div>`).join('')}</div>`).join('')}
  </div>
</div>`;
const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;background:${C.page};padding:28px 0;display:flex;flex-direction:column;align-items:center;gap:14px}</style></head><body>
<div style="width:600px;display:flex;justify-content:space-between;align-items:flex-end;font-family:${BODY};padding:0 4px 4px">
  <div><div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.blue}">Copart Dealer Services</div><div style="font-family:${HEAD};font-weight:900;font-size:34px;letter-spacing:-1.5px;color:${C.ink};line-height:1.05;margin-top:4px">CDS Shout Out</div></div>
  <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};text-align:right">${esc(d.week_label)}<br>${esc(d.issue)}</div>
</div>
<div style="width:600px;font-family:${BODY};font-size:16px;line-height:1.55;color:${C.body};padding:0 4px 6px">Team,<br><br>${esc(d.intro)}</div>
${heroCard}
${d.cards.map(small).join('')}
${board}
<div style="width:600px;font-family:${BODY};font-size:16px;line-height:1.55;color:${C.body};padding:14px 4px 0">${esc(d.close)}</div>
<div style="width:600px;font-family:${HEAD};font-weight:900;font-size:21px;letter-spacing:-.5px;color:${C.ink};padding:6px 4px 0">${esc(d.signoff)}</div>
<div style="width:600px;font-family:${BODY};font-size:13px;color:${C.muted};padding:0 4px 20px">${esc(d.from)}</div>
</body></html>`;
fs.writeFileSync(out, html);
console.log('wrote', out);
