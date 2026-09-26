// Sentence-level coverage: every sentence and table row of a source bundle must be quoted verbatim in the ledgers,
// or classified in the TSV (key `path:line#n`, class RESTATES|HISTORY|OUT|VIEW, pointer items). RESTATES and VIEW need pointers that exist.
// usage: node sentence-check.mjs <bundle.md> <classified.tsv> <ledger.md...>
import fs from 'node:fs';
import { splitSentences, readLedgers } from './lib.mjs';
const [bundle, classifiedPath, ...ledgers] = process.argv.slice(2);
const items = readLedgers(ledgers);
const ids = new Set(items.map((i) => i.id));
const split = new Set(items.filter((i) => i.상태.startsWith('분할됨')).map((i) => i.id));
const ledger = ledgers.map((p) => fs.readFileSync(p, 'utf8')).join('\n');
const classified = new Map();
let badClass = 0;
if (fs.existsSync(classifiedPath)) for (const row of fs.readFileSync(classifiedPath, 'utf8').split('\n')) {
  if (!row.trim()) continue;
  const [key, cls, ptr = ''] = row.split('\t');
  const pointers = ptr.split(/[,\s]+/).filter(Boolean);
  if (!['RESTATES', 'HISTORY', 'OUT', 'VIEW'].includes(cls)) { badClass++; console.log(`bad class ${key} ${cls}`); }
  if ((cls === 'RESTATES' || cls === 'VIEW') && (!pointers.length || pointers.some((p) => !ids.has(p)))) { badClass++; console.log(`bad pointer ${key} -> ${ptr}`); }
  else if ((cls === 'RESTATES' || cls === 'VIEW') && pointers.some((p) => split.has(p))) { badClass++; console.log(`pointer to split parent ${key} -> ${ptr}`); }
  classified.set(key, cls);
}
const missing = [];
let total = 0, quoted = 0;
for (const raw of fs.readFileSync(bundle, 'utf8').split('\n')) {
  const m = raw.match(/^([^:\s]+:\d+): (.*)$/);
  if (!m) continue;
  const [, loc, text] = m;
  const body = text.trim();
  if (!body || /^#{1,6} /.test(body) || /^\|\s*-{2,}/.test(body)) continue;
  splitSentences(body).forEach((s, i) => {
    total++;
    const key = `${loc}#${i + 1}`;
    if (ledger.includes(s)) quoted++;
    else if (!classified.has(key)) missing.push(`${key}\t${s.slice(0, 110)}`);
  });
}
console.log(missing.slice(0, 80).join('\n'));
console.log(`sentences ${total}, quoted ${quoted}, classified ${total - quoted - missing.length}, missing ${missing.length}, bad classifications ${badClass}`);
