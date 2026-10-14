// Every recorded owner answer (owner-answers.tsv: path:line, round, label, text) must be cited by at least one ledger item.
// usage: node owner-cited.mjs <owner-answers.tsv> <ledger.md...>
import fs from 'node:fs';
import { readLedgers, parseLocations } from './lib.mjs';
const [tsv, ...ledgers] = process.argv.slice(2);
const cited = new Set();
for (const it of readLedgers(ledgers)) {
  const text = [it.출처, it['닫은 사람'], it.까닭, ...it.보충, ...it.충돌].join('\n');
  for (const loc of parseLocations(text)) for (const n of loc.lines) cited.add(`${loc.file}:${n}`);
}
const rows = fs.readFileSync(tsv, 'utf8').split('\n').filter((r) => r.trim()).map((r) => r.split('\t'));
const missing = rows.filter(([loc]) => !cited.has(loc));
for (const [loc, round, label, text] of missing) console.log(`${loc}\t${round}\t${label}\t${(text ?? '').slice(0, 80)}`);
console.log(`owner answers ${rows.length}, cited ${rows.length - missing.length}, uncited ${missing.length}`);
