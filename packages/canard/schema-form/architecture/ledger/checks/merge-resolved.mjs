// Merges second-pass resolutions (resolved-<DOMAIN>.tsv: key, class, pointer) back into the classification files that hold each key.
// QUOTED rows delete the key's classification row (the sentence is now quoted). Other classes replace the row.
// usage: node merge-resolved.mjs <handoverDir> <classifiedDir>
import fs from 'node:fs';
import path from 'node:path';
const [handoverDir, classifiedDir] = process.argv.slice(2);
const resolved = new Map();
for (const f of fs.readdirSync(handoverDir).filter((n) => n.startsWith('resolved-'))) {
  for (const row of fs.readFileSync(path.join(handoverDir, f), 'utf8').split('\n')) {
    const [key, cls, ptr = ''] = row.split('\t');
    if (key && cls) resolved.set(key.trim(), { cls: cls.trim(), ptr: ptr.trim(), from: f });
  }
}
let replaced = 0, deleted = 0, untouched = resolved.size;
const seen = new Set();
for (const f of fs.readdirSync(classifiedDir).filter((n) => n.startsWith('classified-') && n.endsWith('.tsv'))) {
  const p = path.join(classifiedDir, f);
  const out = [];
  for (const row of fs.readFileSync(p, 'utf8').split('\n')) {
    const key = row.split('\t')[0];
    const r = resolved.get(key);
    if (!r || !/^OUT/.test(row.split('\t')[1] ?? '')) { out.push(row); continue; }
    seen.add(key);
    if (r.cls === 'QUOTED') { deleted++; continue; }
    const ptr = r.cls === 'OUT' ? r.ptr : r.cls === 'HISTORY' ? '' : r.ptr;
    out.push(`${key}\t${r.cls}\t${ptr}`); replaced++;
  }
  fs.writeFileSync(p, out.join('\n'));
}
untouched -= seen.size;
console.log(JSON.stringify({ resolved: resolved.size, replaced, deleted, keysNotFoundAsOut: untouched }));
