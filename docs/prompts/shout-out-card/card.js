const fs = require('fs');
const bg = process.argv[2] || '';
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const C = { blue:'#0A4DA3', navy:'#082E63', sky:'#CFE0F7', white:'#FFFFFF', ink:'#111418', muted:'#5B6470', page:'#EEF1F5', line:'#DCE1E8' };
const HEAD = "'Inter Display','Inter',Arial,sans-serif";
const BODY = "'Inter',Arial,sans-serif";
const hero = { label:'Shout out of the week · Account Manager · No. 1 on the board', nick:'Big Bear', name:'James Bradley', stats:[['1,619','Sold MTD'],['1,691','Assignments MTD'],['80','Assignments WTD']], line:'1,691 assignments on the month and 80 this week alone. That is not a hot start. That is a workload.' };
const cards = [
 { label:'Making moves', nick:'Carlos Florez', name:'', big:'▲ 149%', cap:'projected assignments vs prior month', line:'More than doubled his pace in a month. Somebody check what he is drinking.' },
 { label:'A Team · Top of the board', nick:'Team 17', name:'Christina & Rob', big:'667', cap:'sold MTD', line:'Most of any team, A, B or C. They are setting the pace for the whole floor.' },
 { label:'Make An Offer · Week of Sep 14 to 18', nick:'Austin Oddo', name:'', big:'86', cap:'assignments for the week', line:'Led the MAO board. Jonathan Jerry was three back at 83, so this one is a race.' },
];
const photoSlot = (size) => `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${C.sky};border:4px solid ${C.white};box-shadow:0 8px 24px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;overflow:hidden"><svg width="${size*0.7}" height="${size*0.7}" viewBox="0 0 100 100"><circle cx="50" cy="36" r="20" fill="${C.blue}" opacity=".55"/><path d="M12 96c3-24 20-36 38-36s35 12 38 36z" fill="${C.blue}" opacity=".55"/></svg></div>`;
const heroCard = `
<div style="position:relative;width:600px;height:560px;border-radius:14px;overflow:hidden;background:${C.navy};font-family:${BODY}">
  ${bg?`<img src="${bg}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(.4) contrast(1.05)">`:''}
  <div style="position:absolute;inset:0;background:linear-gradient(100deg, rgba(8,46,99,.97) 0%, rgba(10,77,163,.88) 55%, rgba(10,77,163,.45) 100%)"></div>
  <div style="position:absolute;right:-40px;top:-40px;width:260px;height:260px;border-radius:50%;border:40px solid rgba(255,255,255,.07)"></div>
  <div style="position:absolute;left:0;top:0;right:0;padding:26px 30px 0;display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      <div style="font-family:${HEAD};font-weight:800;font-size:14px;letter-spacing:.5px;color:${C.white}">Copart <span style="font-weight:500;opacity:.85">Dealer Services</span></div>
      <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.sky};margin-top:6px">CDS Shout Out · Week 39</div>
    </div>
    <div style="background:${C.white};color:${C.navy};font-family:${HEAD};font-weight:900;font-size:12px;letter-spacing:1.5px;padding:7px 11px;border-radius:4px;text-transform:uppercase;box-shadow:0 4px 12px rgba(0,0,0,.2)">Lot&nbsp;#1</div>
  </div>
  <div style="position:absolute;right:30px;top:96px">${photoSlot(150)}</div>
  <div style="position:absolute;left:30px;right:30px;top:118px">
    <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.sky};max-width:360px">${esc(hero.label)}</div>
    <div style="font-family:${HEAD};font-weight:900;font-size:72px;line-height:.95;letter-spacing:-3px;color:${C.white};margin-top:14px;max-width:380px">${esc(hero.nick)}</div>
    <div style="font-size:16px;color:${C.sky};margin-top:10px">${esc(hero.name)}</div>
  </div>
  <div style="position:absolute;left:30px;right:30px;top:352px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
    ${hero.stats.map(([n,l])=>`<div style="background:${C.white};border-radius:8px;padding:14px 14px 12px;border-bottom:5px solid ${C.blue}"><div style="font-family:${HEAD};font-weight:900;font-size:36px;line-height:1;letter-spacing:-1.5px;color:${C.blue}">${n}</div><div style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};margin-top:8px">${l}</div></div>`).join('')}
  </div>
  <div style="position:absolute;left:30px;right:30px;bottom:26px;font-size:16px;line-height:1.5;color:${C.white}">${esc(hero.line)}</div>
</div>`;
const small = c => `
<div style="position:relative;width:600px;border-radius:12px;overflow:hidden;background:${C.white};border:1px solid ${C.line};font-family:${BODY};display:flex">
  <div style="width:8px;background:${C.blue}"></div>
  <div style="padding:22px 24px 20px;flex:1;display:flex;gap:18px;align-items:center">
    <div style="flex:1">
      <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.blue}">${esc(c.label)}</div>
      <div style="font-family:${HEAD};font-weight:900;font-size:34px;line-height:1;letter-spacing:-1.5px;color:${C.ink};margin-top:8px">${esc(c.nick)}</div>
      ${c.name?`<div style="font-size:13px;color:${C.muted};margin-top:4px">${esc(c.name)}</div>`:''}
      <div style="font-size:15px;line-height:1.5;color:#2E333B;margin-top:12px">${esc(c.line)}</div>
    </div>
    <div style="text-align:center;min-width:150px">
      ${photoSlot(84).replace('display:flex','display:inline-flex')}
      <div style="font-family:${HEAD};font-weight:900;font-size:38px;line-height:1;letter-spacing:-1.5px;color:${C.blue};margin-top:10px;white-space:nowrap">${esc(c.big)}</div>
      <div style="font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${C.muted};margin-top:6px;max-width:150px">${esc(c.cap)}</div>
    </div>
  </div>
</div>`;
const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;background:${C.page};padding:28px 0;display:flex;flex-direction:column;align-items:center;gap:14px}</style></head><body>
<div style="width:600px;display:flex;justify-content:space-between;align-items:flex-end;font-family:${BODY};padding:0 4px 4px">
  <div><div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.blue}">Copart Dealer Services</div><div style="font-family:${HEAD};font-weight:900;font-size:34px;letter-spacing:-1.5px;color:${C.ink};line-height:1.05;margin-top:4px">CDS Shout Out</div></div>
  <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};text-align:right">Week 39 · Sep 22 to 26<br>No. 2</div>
</div>
<div style="width:600px;font-family:${BODY};font-size:16px;line-height:1.55;color:#2E333B;padding:0 4px 6px">Team,<br><br>Seven names this week. Some of them you expected. A couple you did not. Every one of them earned it.</div>
${heroCard}
${cards.map(small).join('')}
<div style="width:600px;font-family:${BODY};font-size:12px;color:${C.muted};padding:6px 4px">… three more cards, then The board in brief, Keep pushing, and Ken's sign-off</div>
</body></html>`;
fs.writeFileSync('mid.html', html);
console.log('ok');
