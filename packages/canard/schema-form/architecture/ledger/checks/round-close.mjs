// Round bookkeeping after a closing document is written. Run from architecture/.
// Usage: node ledger/checks/round-close.mjs <NN> <plan-row> <handoff-bullet> <map-row>
//   plan-row       : one table row for PLAN §5 (replaces the single row there) and PLAN-LOG §1 (appended).
//   handoff-bullet : the new round bullet for HANDOFF §1 (ends with " 다음 라운드 번호는 <NN+1>.").
//   map-row        : the HANDOFF §5 file-map row for reviews/round-<NN>-*.md.
// Effects: HANDOFF §1 keeps the three newest round bullets (the oldest moves to PLAN-LOG §2 end),
// the previous bullet loses its "다음 라운드 번호는 NN." tail, and the §1 heading date is refreshed.
import fs from 'node:fs';

const [NN, planRow, bullet, mapRow] = process.argv.slice(2);
if (!NN || !planRow || !bullet || !mapRow) throw new Error('usage: round-close.mjs <NN> <plan-row> <handoff-bullet> <map-row>');

{
  const log = fs.readFileSync('PLAN-LOG.md', 'utf8').split('\n');
  const s2 = log.findIndex((l) => l.startsWith('## 2. '));
  let end = s2;
  while (log[end - 1].trim() === '') end--;
  log.splice(end, 0, planRow);
  fs.writeFileSync('PLAN-LOG.md', log.join('\n'));

  const plan = fs.readFileSync('PLAN.md', 'utf8').split('\n');
  const s5 = plan.findIndex((l) => l.startsWith('## 5. 기록'));
  const row = plan.findIndex((l, k) => k > s5 && l.startsWith('| 2026'));
  if (row < 0) throw new Error('PLAN §5 row not found');
  plan[row] = planRow;
  fs.writeFileSync('PLAN.md', plan.join('\n'));
}

{
  const h = fs.readFileSync('HANDOFF.md', 'utf8').split('\n');
  const s1 = h.findIndex((l) => l.startsWith('## 1. '));
  const s2 = h.findIndex((l) => l.startsWith('## 2. '));
  const rounds = [];
  for (let k = s1 + 1; k < s2; k++) if (/^- \*\*[0-9]+라운드\(/.test(h[k])) rounds.push(k);
  if (rounds.length === 0) throw new Error('no round bullets in HANDOFF §1');
  const newest = rounds[rounds.length - 1];
  const prevNN = h[newest].match(/^- \*\*([0-9]+)라운드\(/)[1];
  const tail = ` 다음 라운드 번호는 ${NN}.`;
  if (!h[newest].includes(tail)) throw new Error(`previous bullet lacks "${tail.trim()}"`);
  h[newest] = h[newest].replace(tail, '');
  h.splice(newest + 1, 0, bullet);
  const oldest = h.splice(rounds[0], 1)[0];
  const log = fs.readFileSync('PLAN-LOG.md', 'utf8').split('\n');
  while (log[log.length - 1].trim() === '') log.pop();
  log.push(oldest, '');
  fs.writeFileSync('PLAN-LOG.md', log.join('\n'));
  h[s1] = h[s1].replace(/\([^)]*\)$/, `(2026-10-02, ${NN}라운드 닫힘; 07 전환 진행 중)`);
  const j = h.findIndex((l) => l.startsWith(`| \`reviews/round-${prevNN}-`));
  if (j < 0) throw new Error(`HANDOFF §5 row for round ${prevNN} not found`);
  h.splice(j + 1, 0, mapRow);
  fs.writeFileSync('HANDOFF.md', h.join('\n'));
}
console.log('ok');
