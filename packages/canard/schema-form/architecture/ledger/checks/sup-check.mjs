// Every 보충 and 충돌 quotation `> [label: ]"<text>" (`path:line[-line]`...)` must be verbatim at the cited lines.
// usage: node sup-check.mjs <docsRoot> <ledger.md...>
import { readLedgers, docReader, baseReader } from './lib.mjs';
const [root, ...ledgers] = process.argv.slice(2);
const read = docReader(root);
const readBase = baseReader(root);
let total = 0, bad = 0, unparsed = 0;
for (const it of readLedgers(ledgers)) {
  for (const line of [...it.보충, ...it.충돌]) {
    if (line.trim() === '없음') continue;
    total++;
    const m = line.match(/^\s*(?:[^"]*?:\s*)?"(.*)"\s*\(`([^`:]+):(\d+)(?:-(\d+))?`/) ?? line.match(/`([^`:]+):(\d+)(?:-(\d+))?`의 "(.*?)"(?:은|는|이|가)/);
    if (!m) { unparsed++; console.log(`${it.id} UNPARSED: ${line.trim().slice(0, 120)}`); continue; }
    const [quote, file, from, to] = m[1].endsWith('.md') ? [m[4], m[1], m[2], m[3]] : [m[1], m[2], m[3], m[4]];
    const versions = [read(file), readBase(file)].filter(Boolean);
    if (!versions.length) { bad++; console.log(`${it.id} NO FILE ${file}`); continue; }
    const found = versions.some((lines) => lines.slice(Number(from) - 1, Number(to ?? from)).join('\n').includes(quote));
    if (!found) { bad++; console.log(`${it.id} NOT AT ${file}:${from}${to ? '-' + to : ''}: ${quote.slice(0, 90)}`); }
  }
}
console.log(`supplement and conflict quotes ${total}, not verbatim at cited lines ${bad}, unparsed ${unparsed}`);
