// CLI verification of published evidence, preserved performance values, contract citations, and scope.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url)), D = path.dirname(here);
const pkg = path.resolve(D, '../../..'), repo = path.resolve(pkg, '../../..');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const s = read(path.join(D, 'profile-112-branch-summary.json'));
const original = read(path.join(D, 'profile-111-final/reporter-output.json'));
const head = execFileSync('git', ['--no-optional-locks', 'rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
assert.equal(head, 'bef81f4d747d028b05082d594138148520e4d992');
assert.equal(s.head, head);
assert.equal(execFileSync('git', ['--no-optional-locks', 'diff', '--name-only', '--', 'packages/canard/schema-form/src'],
  { cwd: repo, encoding: 'utf8' }).trim(), '');
assert.equal(s.part1.recalculatedRows.length, 104);
assert.equal(s.part1.numericalChanges.length, 103);
assert.equal(s.part1.numericalChanges.filter(r => !r.fixture.startsWith('array-')).length, 91);
assert.equal(s.part1.verdictChanges.length, 2);
assert.equal(s.part1.needsRemeasurement.length, 0);
assert.equal(s.part1.reconstructionProof.historicalToolSha256, '956d8674d4d81fe52d3165cf30d94cc27d32a03c7afa3550729e6f4363f87473');
assert.equal(s.part1.reconstructionProof.allHistoricalToolHashesMatch, true);
assert.equal(s.part1.reconstructionProof.everyDiagnosticObservationAssertsNewScheduledZero, true);
assert.equal(s.part1.reconstructionProof.everyDiagnosticObservationAssertsTailZero, true);
assert(s.part1.arrayRows.every(r => r.differenceUs === 0 && r.withinNoise && r.allRunsWithinNoise));
assert(s.part1.recalculatedRows.every(r => r.afterDifferenceUs === 0 && r.afterPass && r.runs.length === 3 &&
  r.runs.every(r => r.afterDifferenceUs === 0 && r.afterPass)));
assert.equal(s.part1.canonicalRowEndToEndResult.result, 'CANONICAL_ROW_END_TO_END_OK');

const tableLines = fs.readFileSync(path.join(D, 'profile-111-final.md'), 'utf8').split('\n');
let axis = false, checkedRows = 0;
const modes = { '마운트': 'mount', 'BF 갱신': 'update', '첫 갱신': 'update-first', '이후 갱신': 'update-later' };
for (const line of tableLines) {
  if (line.startsWith('## 고정 두 분기 전환 축')) axis = true;
  const c = line.split('|').map(c => c.trim());
  if (c.length !== 12 || !['off', 'on'].includes(c[2]) || !(c[3] in modes)) continue;
  const source = axis ? original.branchAxisRows : modes[c[3]].startsWith('update-') ? original.updateSplitRows : original.officialRows;
  const prior = source.find(r => r.fixture === c[1] && r.validation === c[2] && r.mode === modes[c[3]]);
  assert(prior, line);
  assert.equal(c[4], `${(prior.new.metric.median * 1000).toFixed(3)} / ${(prior.old.metric.median * 1000).toFixed(3)}`);
  assert.equal(c[5], prior.ratio.toFixed(3) + '×');
  assert.equal(c[6], '통과 · 통/통/통');
  assert.equal(Number(c[7].split('/')[0]), 0);
  if (c[1] === 'array-100' && ['update', 'update-first'].includes(modes[c[3]])) {
    assert.equal(c[9], '미달'); assert.equal(c[10], '소유자 수용(104라운드)');
  }
  checkedRows++;
}
assert.equal(checkedRows, 108);

for (const [mode, fits] of Object.entries(s.part2.cpuFits)) {
  assert.equal(fits.functions.length, 262);
  const sum = rows => rows.reduce((sum, r) => sum + r, 0);
  assert(Math.abs(sum(fits.functions.map(f => f.self.slopeUsPerBranch)) - fits.total.slopeUsPerBranch) < 1e-8);
  assert(Math.abs(sum(fits.partition.map(g => g.raw.slopeUsPerBranch)) - fits.total.slopeUsPerBranch) < 1e-8);
  for (const fn of fits.functions) {
    assert.equal(fn.bySize.length, 4);
    assert(fn.bySize.every(p => p.selfAndChildrenUs + 1e-8 >= p.selfUs && p.selfUs >= 0));
  }
  if (mode !== 'second') {
    assert(Math.abs(sum(fits.functions.map(f => f.official111SelfShareEstimate.slopeUsPerBranch)) -
      s.part2.officialFits[mode].slopeUsPerBranch) < 1e-8);
    assert(Math.abs(sum(fits.partition.map(g => g.official111ShareEstimate.slopeUsPerBranch)) -
      s.part2.officialFits[mode].slopeUsPerBranch) < 1e-8);
  }
}
assert.equal(s.part2.visitAssessment.bySite.length, 52);
const normalize = text => text.replace(/[`*_]/g, '').replace(/\s+/g, ' ').trim();
for (const contract of Object.values(s.part2.visitAssessment.contractBasis)) {
  const text = fs.readFileSync(path.join(pkg, contract.file), 'utf8').split('\n')[contract.line - 1];
  assert(normalize(text).includes(normalize(contract.sentence)), contract.file + ':' + contract.line);
}
const expression = 'src/core/settle/utils/gates/evaluateGate.ts:117:expression.evaluate';
for (const size of [5, 10, 20, 40]) {
  const raw = read(path.join(here, `counts-oneOf-${size}-r1.json`));
  for (const [mode, factor] of [['first', 16], ['second', 8], ['later', 8]])
    assert.equal(Object.values(raw.records[mode].counts[expression]).reduce((a, b) => a + b, 0), size * factor);
}
assert.equal(s.part2.cpuRecords.flatMap(r => Object.values(r.modes)).reduce((n, m) => n + m.negativeDeltas, 0), 3);
const report = fs.readFileSync(path.join(D, 'profile-112-branch.md'), 'utf8');
for (const match of report.matchAll(/\]\(([^)]+)\)/g)) {
  const target = match[1].split('#')[0];
  if (!target || target.includes('://')) continue;
  assert(fs.existsSync(path.resolve(D, target)), target);
}
assert(fs.readFileSync(path.join(D, 'remeasure-86c02.md'), 'utf8').includes('## 110라운드 측정기 sentinel 정정'));
const sizes = fs.readdirSync(here).map(file => ({ file, bytes: fs.statSync(path.join(here, file)).size }));
assert(sizes.every(r => r.bytes <= 5_000_000));
assert(sizes.every(r => !/\.map$|\.cjs$|\.bundle\.|\.cache$/.test(r.file)));
assert.equal(s.audit.measuredProcesses, 58); assert.equal(s.audit.sequential, true); assert.equal(s.audit.allNaturalExits, true);
console.log(JSON.stringify({ result: 'PROFILE_112_ARTIFACTS_OK', head, rawRows: 104, changedRows: 103,
  otherChangedRows: 91, tableRows: checkedRows, arrayRows: 12, functionFrames: 262, visitSites: 52,
  maxEvidenceFile: sizes.toSorted((a, b) => b.bytes - a.bytes)[0], productSourceDiff: 0,
  cpuSlopeUsPerBranch: { bf: s.part2.cpuFits.bf.total.slopeUsPerBranch, later: s.part2.cpuFits.later.total.slopeUsPerBranch } }));
