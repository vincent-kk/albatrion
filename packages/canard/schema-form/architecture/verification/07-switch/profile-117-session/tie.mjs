// CLI interpretation of the three requested G26 runs; targets and owner acceptance are unchanged.
import fs from 'node:fs';
import path from 'node:path';
import { directory, HEAD, hash, emit } from './runtime.mjs';
const file = path.join(directory, '../profile-114-g26/summary.json');
const source = JSON.parse(fs.readFileSync(file, 'utf8'));
const rows = source.react.ownerRows.filter(row => row.metric.includes('update')).map(row => {
  const ratios = row.old.runs.map((value, index) => row.current.runs[index] / value);
  return { fixture: row.fixture, metric: row.metric, target: row.target, ratios,
    remains: ratios.every(value => value > row.target), tie: ratios.some(value => value <= row.target) && ratios.some(value => value > row.target),
    oldRunMedians: row.old.runs, headRunMedians: row.current.runs };
});
emit('tie-B.json', { HEAD, sourceHead: source.head, source: '../profile-114-g26/summary.json', sourceSha256: hash(fs.readFileSync(file)),
  rule: '94C-02: a row misses only if every one of the three ratios exceeds its target', rows,
  remaining: rows.filter(row => row.remains), ties: rows.filter(row => row.tie), acceptanceWidened: false });
console.log(`동률 ${rows.filter(row => row.tie).length}행이며, 남은 미달은 wall ${rows.filter(row => row.remains && row.metric === 'render-update-wall').length}행과 Profiler ${rows.filter(row => row.remains && row.metric === 'profiler-update').length}행입니다.`);
