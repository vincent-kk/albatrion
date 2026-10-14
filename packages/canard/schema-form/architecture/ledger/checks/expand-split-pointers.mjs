// Rewrites RESTATES/VIEW pointers that name a 분할됨 parent item so they name that parent's fragments instead.
// usage: node expand-split-pointers.mjs <classified.tsv...> -- <ledger.md...>
import fs from 'node:fs';
import { readLedgers } from './lib.mjs';
const args = process.argv.slice(2);
const sep = args.indexOf('--');
const tsvs = args.slice(0, sep), ledgers = args.slice(sep + 1);
const frag = new Map();
for (const it of readLedgers(ledgers)) {
  const m = it.상태.match(/^분할됨\(→\s*(.*)\)/);
  if (m) frag.set(it.id, m[1].split(/[,\s]+/).filter((x) => /^[A-Z]+-\d{3}$/.test(x)));
}
let changed = 0;
for (const tsv of tsvs) {
  const rows = fs.readFileSync(tsv, 'utf8').split('\n');
  const out = rows.map((row) => {
    const [key, cls, ptr = ''] = row.split('\t');
    if (cls !== 'RESTATES' && cls !== 'VIEW') return row;
    const ids = ptr.split(/[,\s]+/).filter(Boolean);
    if (!ids.some((id) => frag.has(id))) return row;
    const expanded = [...new Set(ids.flatMap((id) => frag.get(id) ?? [id]))];
    changed++;
    return `${key}\t${cls}\t${expanded.join(',')}`;
  });
  fs.writeFileSync(tsv, out.join('\n'));
}
console.log(`split parents ${frag.size}, rows rewritten ${changed}`);
