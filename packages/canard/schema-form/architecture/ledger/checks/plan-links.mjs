// Every ledger ID a plan document cites must exist and be in force; every in-force LANDING item that defines a PR must be cited by some plan document.
// usage: node plan-links.mjs <plan.md...> -- <ledger.md...>
import fs from 'node:fs';
import { readLedgers } from './lib.mjs';
const argv = process.argv.slice(2);
const sep = argv.indexOf('--');
const plans = argv.slice(0, sep), ledgers = argv.slice(sep + 1);
const items = new Map(readLedgers(ledgers).map((it) => [it.id, it]));
const inForce = (it) => it.상태.startsWith('현행');
let problems = 0, cited = new Set();
for (const p of plans) {
  // An index line "- <ID> <title>" quotes an item title verbatim, so only its leading ID is a citation; closing-block titles ("- 18C-nn …") are quotes too.
  const ids = [];
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    if (/^\s*- 18C-\d+ /.test(line)) continue;
    const lead = line.match(/^\s*- ([A-Z]{4,9}-\d{3}) /);
    if (lead) { ids.push(lead[1]); continue; }
    for (const m of line.matchAll(/\b([A-Z]{4,9}-\d{3})\b/g)) ids.push(m[1]);
  }
  for (const id of ids) {
    const it = items.get(id);
    if (!it) { problems++; console.log(`${p}: ${id} does not exist`); continue; }
    if (!inForce(it)) { problems++; console.log(`${p}: ${id} is not in force (${it.상태})`); continue; }
    cited.add(id);
  }
}
const prDefs = [...items.values()].filter((it) => inForce(it) && it.id.startsWith('LANDING-') && /(^|\s)PR-\d/.test(it.title ?? ''));
for (const it of prDefs) if (!cited.has(it.id)) { problems++; console.log(`uncited PR-defining item: ${it.id} ${it.title}`); }
console.log(`plan docs ${plans.length}, cited ids ${cited.size}, PR-defining LANDING items ${prDefs.length}, problems ${problems}`);
