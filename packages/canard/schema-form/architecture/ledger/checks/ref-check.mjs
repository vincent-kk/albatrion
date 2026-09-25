// Numbering is dense per file and never reused; every ID reference resolves; each file's index table matches its items.
// usage: node ref-check.mjs <ledger.md...>
import fs from 'node:fs';
import { parseLedger } from './lib.mjs';
const problems = [];
const all = new Map();
const files = process.argv.slice(2).map((p) => ({ p, text: fs.readFileSync(p, 'utf8') }));
for (const { p, text } of files) {
  const items = parseLedger(text);
  if (!items.length) continue;
  const prefixes = new Set(items.map((i) => i.id.split('-')[0]));
  if (prefixes.size !== 1) problems.push(`${p}: mixed prefixes ${[...prefixes].join(',')}`);
  items.forEach((it, i) => {
    const want = `${it.id.split('-')[0]}-${String(i + 1).padStart(3, '0')}`;
    if (it.id !== want) problems.push(`${p}: ${it.id} at position ${i + 1} (expected ${want})`);
    if (all.has(it.id)) problems.push(`${p}: duplicate ${it.id}`);
    all.set(it.id, it);
    for (const f of ['상태', '출처', '닫은 사람', '라운드']) if (!it[f]) problems.push(`${it.id}: empty ${f}`);
    if (!it.결정.length) problems.push(`${it.id}: empty 결정`);
    if (!it.보충.length) problems.push(`${it.id}: 보충 missing (write 없음 when there is none)`);
  });
  const rows = text.split('\n').filter((l) => /^\| [A-Z]+-\d{3} \|/.test(l)).map((l) => l.split('|').map((x) => x.trim()));
  if (rows.length !== items.length) problems.push(`${p}: index rows ${rows.length} vs items ${items.length}`);
  for (const r of rows) {
    const it = items.find((i) => i.id === r[1]);
    if (!it) { problems.push(`${p}: index row for missing item ${r[1]}`); continue; }
    if (r[3] !== it.상태) problems.push(`${r[1]}: index status "${r[3]}" vs item "${it.상태}"`);
    if (r[4] !== it['닫은 사람']) problems.push(`${r[1]}: index closer differs from item field`);
  }
}
for (const { text } of files) for (const m of text.matchAll(/\b[A-Z]{3,}-\d{3}\b/g)) if (!all.has(m[0]) && !/^(R\d+G|PR)-/.test(m[0])) problems.push(`dangling reference ${m[0]}`);
console.log([...new Set(problems)].slice(0, 60).join('\n'));
console.log(`items ${all.size}, problems ${new Set(problems).size}`);
