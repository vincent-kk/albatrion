// Every quoted line of each item's 결정 must appear verbatim in the item's canonical source (first 출처 entry).
// An item whose first 출처 is `path:line#n` (or `#a-b`) must quote exactly sentences n (or a..b) of that line (fragment provenance).
// usage: node verbatim-check.mjs <docsRoot> <ledger.md...>
import { readLedgers, parseLocations, docReader, baseReader, splitSentences } from './lib.mjs';
const [root, ...ledgers] = process.argv.slice(2);
const read = docReader(root);
const readBase = baseReader(root);
let bad = 0, fragments = 0;
const items = readLedgers(ledgers);
for (const it of items) {
  const loc = parseLocations(it.출처)[0];
  if (!loc) { bad++; console.log(`${it.id}: no parsable canonical source in 출처`); continue; }
  const versions = [read(loc.file), readBase(loc.file)].filter(Boolean);
  if (!versions.length) { bad++; console.log(`${it.id}: source file not readable (${loc.file})`); continue; }
  const quoted = it.결정.map((l) => l.trim()).filter((l) => l && !l.startsWith('```'));
  if (loc.fragment) {
    fragments++;
    const q = quoted.join(' ');
    const okIn = (doc) => {
      const line = doc[loc.lines[0] - 1] ?? '';
      const sentences = splitSentences(line);
      const first = sentences[loc.fragment - 1], last = sentences[(loc.fragmentEnd ?? loc.fragment) - 1];
      return first && last && line.includes(q) && q.startsWith(first) && q.endsWith(last) && (loc.fragmentEnd || q === first);
    };
    if (!versions.some(okIn)) { bad++; console.log(`${it.id}: fragment ${loc.raw} does not match sentences ${loc.fragment}${loc.fragmentEnd ? '-' + loc.fragmentEnd : ''} of that line (working tree or ${'base commit'})`); }
    continue;
  }
  const missing = quoted.filter((q) => !versions.some((doc) => doc.join('\n').includes(q)));
  if (missing.length) { bad++; console.log(`${it.id} (${loc.file}): ${missing.length}/${quoted.length} quoted lines not verbatim; first: ${missing[0].slice(0, 140)}`); }
}
console.log(`items ${items.length}, fragments ${fragments}, items with non-verbatim decision lines ${bad}`);
