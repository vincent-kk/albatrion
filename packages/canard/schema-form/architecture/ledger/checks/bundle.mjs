// Builds one source bundle per domain from the section map (`path:line: text` per line) for sentence-check.
// usage: node bundle.mjs <docsRoot> <section-map.tsv> <outDir>
import fs from 'node:fs';
import path from 'node:path';
import { docReader } from './lib.mjs';
const [root, mapPath, outDir] = process.argv.slice(2);
const read = docReader(root);
const byDomain = {};
for (const row of fs.readFileSync(mapPath, 'utf8').split('\n')) {
  if (!row.trim()) continue;
  const [file, start, end, , , , domain] = row.split('\t');
  const lines = read(file);
  for (let n = Number(start); n <= Number(end); n++) (byDomain[domain] ??= []).push(`${file}:${n}: ${lines[n - 1]}`);
}
fs.mkdirSync(outDir, { recursive: true });
for (const [domain, lines] of Object.entries(byDomain)) fs.writeFileSync(path.join(outDir, `bundle-${domain}.md`), lines.join('\n') + '\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries(byDomain).map(([d, l]) => [d, l.length]))));
