// Lists sentences classified `OUT → <DOMAIN>` in any classification file that no ledger quotes yet, grouped by target domain.
// usage: node handover.mjs <bundlesDir> <classifiedDir> <outDir> <ledger.md...>
import fs from 'node:fs';
import path from 'node:path';
import { splitSentences } from './lib.mjs';
const [bundlesDir, classifiedDir, outDir, ...ledgers] = process.argv.slice(2);
const ledger = ledgers.map((p) => fs.readFileSync(p, 'utf8')).join('\n');
const sentenceByKey = new Map();
for (const f of fs.readdirSync(bundlesDir)) {
  for (const raw of fs.readFileSync(path.join(bundlesDir, f), 'utf8').split('\n')) {
    const m = raw.match(/^([^:\s]+:\d+): (.*)$/);
    if (!m) continue;
    const body = m[2].trim();
    if (!body || /^#{1,6} /.test(body) || /^\|\s*-{2,}/.test(body)) continue;
    splitSentences(body).forEach((s, i) => sentenceByKey.set(`${m[1]}#${i + 1}`, s));
  }
}
const byTarget = {};
let total = 0, quoted = 0;
for (const f of fs.readdirSync(classifiedDir).filter((n) => n.startsWith('classified-') && n.endsWith('.tsv'))) {
  const from = f.slice(11, -4);
  for (const row of fs.readFileSync(path.join(classifiedDir, f), 'utf8').split('\n')) {
    const [key, cls, ptr = ''] = row.split('\t');
    if (cls !== 'OUT') continue;
    const t = ptr.match(/→\s*([A-Z]+)/);
    if (!t) continue;
    total++;
    const s = sentenceByKey.get(key);
    if (s && ledger.includes(s)) { quoted++; continue; }
    (byTarget[t[1]] ??= []).push(`${key}\t${from}\t${s ?? '(sentence not found)'}`);
  }
}
fs.mkdirSync(outDir, { recursive: true });
for (const [t, rows] of Object.entries(byTarget)) fs.writeFileSync(path.join(outDir, `handover-${t}.tsv`), rows.join('\n') + '\n');
console.log(JSON.stringify({ handed: total, alreadyQuoted: quoted, pending: Object.fromEntries(Object.entries(byTarget).map(([t, r]) => [t, r.length])) }));
