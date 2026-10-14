// Insert editor-decision supplements into ledger items from a closing document. Run from architecture/.
// Usage: node ledger/checks/sup-insert.mjs reviews/round-<NN>-closing.md <plan.json>
//   plan.json: [{ "code": "89C-01", "line": 9, "targets": ["ledger/event.md:EVENT-007", ...] }, ...]
//   `line` is the 1-based line of the "  - 【추론】 …" decision in the closing document; the whole
//   decision text is quoted verbatim so verbatim-check and sup-check pass.
// Effects: before each target item's "- 상태:" line a supplement line is inserted in the form
//   `  > 편집자 결정(CODE): "【추론】 …" (\`reviews/round-NN-closing.md:L\`)`, and "- 보충: 없음" becomes "- 보충:".
import fs from 'node:fs';

const [closingPath, planPath] = process.argv.slice(2);
if (!closingPath || !planPath) throw new Error('usage: sup-insert.mjs <closing.md> <plan.json>');
const closing = fs.readFileSync(closingPath, 'utf8').split('\n');
const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));

const quote = (line) => {
  const m = (closing[line - 1] ?? '').match(/^\s*- (【추론】 .*)$/);
  if (!m) throw new Error(`no decision line at ${closingPath}:${line}`);
  return m[1];
};

const files = new Map();
const load = (f) => {
  if (!files.has(f)) files.set(f, fs.readFileSync(f, 'utf8').split('\n'));
  return files.get(f);
};

let inserted = 0;
for (const { code, line, targets } of plan) {
  const sup = `  > 편집자 결정(${code}): "${quote(line)}" (\`${closingPath}:${line}\`)`;
  for (const target of targets) {
    const [file, id] = target.split(':');
    const L = load(file);
    const head = L.findIndex((l) => l.startsWith(`### ${id} `));
    if (head < 0) throw new Error(`missing item ${id} in ${file}`);
    let status = head + 1;
    while (status < L.length && !L[status].startsWith('- 상태:')) {
      if (L[status].startsWith('### ')) throw new Error(`no 상태 line in ${id}`);
      status++;
    }
    let sup_line = -1;
    for (let k = head + 1; k < status; k++) if (L[k].startsWith('- 보충:')) { sup_line = k; break; }
    if (sup_line < 0) throw new Error(`no 보충 line in ${id}`);
    if (L[sup_line].trim() === '- 보충: 없음') L[sup_line] = '- 보충:';
    L.splice(status, 0, sup);
    inserted++;
  }
}
for (const [file, L] of files) fs.writeFileSync(file, L.join('\n'));
console.log('supplements inserted', inserted);
