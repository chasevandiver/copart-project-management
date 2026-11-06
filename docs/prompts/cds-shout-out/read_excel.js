// Dump every sheet of an .xlsx to plain text. No dependencies: Node only.
// Usage: node read_excel.js inbox/leaderboard.xlsx
const fs = require('fs');
const zlib = require('zlib');
const buf = fs.readFileSync(process.argv[2]);

// Minimal zip reader (xlsx is a zip of XML files)
function readZip(b) {
  let eocd = -1;
  for (let i = b.length - 22; i >= 0; i--) if (b.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('Not a zip/xlsx file');
  const count = b.readUInt16LE(eocd + 10), cdOff = b.readUInt32LE(eocd + 16);
  const files = {};
  let p = cdOff;
  for (let i = 0; i < count; i++) {
    if (b.readUInt32LE(p) !== 0x02014b50) throw new Error('Bad central directory');
    const method = b.readUInt16LE(p + 10), csize = b.readUInt32LE(p + 20), nlen = b.readUInt16LE(p + 28), elen = b.readUInt16LE(p + 30), clen = b.readUInt16LE(p + 32), loff = b.readUInt32LE(p + 42);
    const name = b.toString('utf8', p + 46, p + 46 + nlen);
    const lnlen = b.readUInt16LE(loff + 26), lelen = b.readUInt16LE(loff + 28);
    const start = loff + 30 + lnlen + lelen;
    const data = b.subarray(start, start + csize);
    files[name] = method === 8 ? zlib.inflateRawSync(data) : Buffer.from(data);
    p += 46 + nlen + elen + clen;
  }
  return files;
}
const files = readZip(buf);
const xml = n => files[n] ? files[n].toString('utf8') : '';
const unesc = s => s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,'&');
const textOf = s => unesc([...s.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(m => m[1]).join(''));

// Shared strings
const shared = [...xml('xl/sharedStrings.xml').matchAll(/<si>([\s\S]*?)<\/si>/g)].map(m => textOf(m[1]));
// Sheet names to files
const rels = {};
for (const m of xml('xl/_rels/workbook.xml.rels').matchAll(/<Relationship\b[^>]*>/g)) {
  const id = /Id="([^"]+)"/.exec(m[0]), t = /Target="([^"]+)"/.exec(m[0]);
  if (id && t) rels[id[1]] = t[1].replace(/^\/?(xl\/)?/, 'xl/');
}
const sheets = [...xml('xl/workbook.xml').matchAll(/<sheet\b[^>]*>/g)].map(m => ({
  name: unesc(/name="([^"]+)"/.exec(m[0])[1]),
  file: rels[/r:id="([^"]+)"/.exec(m[0])[1]],
}));
const colIndex = ref => { let n = 0; for (const ch of ref.replace(/\d+/g, '')) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; };

for (const s of sheets) {
  const x = xml(s.file);
  const rows = [...x.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)];
  console.log(`\n=== SHEET: ${s.name} (${rows.length} rows) ===`);
  for (const r of rows) {
    const cells = [];
    for (const c of r[1].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = c[1], inner = c[2] || '';
      const ref = /r="([A-Z]+)\d+"/.exec(attrs), type = /t="([^"]+)"/.exec(attrs);
      const v = /<v>([\s\S]*?)<\/v>/.exec(inner);
      let val = '';
      if (type && type[1] === 's' && v) val = shared[+v[1]] ?? '';
      else if (type && type[1] === 'inlineStr') val = textOf(inner);
      else if (v) val = unesc(v[1]);
      if (ref) cells[colIndex(ref[1])] = val;
    }
    if (cells.some(v => v !== undefined && v !== '')) console.log(Array.from(cells, v => v ?? '').join(' | '));
  }
}
