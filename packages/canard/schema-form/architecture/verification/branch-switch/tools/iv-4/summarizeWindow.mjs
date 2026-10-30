// Postprocess one completed window using IV-4's strict all-row rule; never starts measurements.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync, gzipSync } from 'node:zlib';

import { digest } from '../b9-0/files.mjs';
import { compactQuietCheck } from '../b9-1/helpers/compactQuietCheck.mjs';
import { portableEvidence } from '../b9-1/helpers/portableEvidence.mjs';

const [root, output] = process.argv
  .slice(2)
  .map((value) => path.resolve(value));
const here = path.dirname(fileURLToPath(import.meta.url));
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
assert.ok(fs.existsSync(path.join(root, 'window-end.json')));
assert.ok(!fs.existsSync(output), 'Never overwrite published window evidence');
const scratch = path.join(
  root,
  'summary-' + path.basename(output) + '.noindex',
);
assert.ok(!fs.existsSync(scratch));
const inherited = spawnSync(
  process.execPath,
  [path.join(here, '../iv-2/summarize.mjs'), root, scratch],
  {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  },
);
assert.equal(inherited.status, 0, inherited.stderr);
const inputs = read(path.join(root, 'inputs.json'));
const rows = read(path.join(scratch, 'rows.json'));
const oldJudgment = read(path.join(scratch, 'judgment.json'));
const firstWrite = read(path.join(scratch, 'first-write-exchange.json'));
const heaps = read(path.join(scratch, 'heap.json'));
const tests = read(path.join(scratch, 'test073.json'));
const formal = read(path.join(root, 'formal-start.json'));
const quiet = read(path.join(root, 'quiet-window.json'));
assert.equal(quiet.approved, true);
assert.equal(quiet.policy.averageMs, 30000);
assert.equal(quiet.policy.spotlightMaxWaitMs, 30000);
const regressions = rows.rows.filter((row) => row.decision === 'regressed');
const test073 = tests.filter((row) => row.regression);
const judgment = {
  productHead: inputs.candidateCommit,
  baselineHead: inputs.baselineCommit,
  rows: rows.rows.length,
  processes: oldJudgment.validated.pairProcesses,
  quality: rows.quality,
  rawExchangeUs: oldJudgment.weightedExchange.totalUs,
  firstWriteAdditionUs: firstWrite.addedTotalUs,
  exchangeUs: firstWrite.adjustedTotalUs,
  regressions: regressions.map((row) => row.id),
  test073Regressions: test073,
  heaps,
  deviceCompleted: oldJudgment.deviceCompleted,
  method:
    'IV-4: strict negative weighted exchange including nonnegative cold-first-write additions; zero outside-width regressions on any row, including mounts; TEST-073 zero; Node and Bun B median <= A maximum. IV-2-specific stage predicates are reported only as diagnostics.',
  execution: digest(fileURLToPath(import.meta.url)),
};
judgment.adoptable =
  judgment.deviceCompleted &&
  rows.quality.passed &&
  judgment.exchangeUs < 0 &&
  regressions.length === 0 &&
  test073.length === 0 &&
  heaps.every((heap) => heap.passed);
fs.mkdirSync(output, { recursive: false });
for (const file of fs.readdirSync(scratch)) {
  if (file === 'cpu-prechecks.json.gz') continue;
  const target = ['judgment.json', 'first-write-exchange.json'].includes(file)
    ? 'iv2-' + file
    : file;
  const bytes = fs.readFileSync(path.join(scratch, file));
  const compressed = file.endsWith('.gz');
  const contents = (compressed ? gunzipSync(bytes) : bytes)
    .toString()
    .replaceAll('/opt/homebrew', '<toolchain>')
    .replaceAll('/usr/local', '<toolchain>');
  fs.writeFileSync(
    path.join(output, target),
    compressed ? gzipSync(contents) : contents,
  );
}
const portable = (value) =>
  JSON.parse(
    JSON.stringify(portableEvidence(value))
      .replaceAll('/opt/homebrew', '<toolchain>')
      .replaceAll('/usr/local', '<toolchain>'),
  );
const write = (name, value) =>
  fs.writeFileSync(
    path.join(output, name + '.json'),
    JSON.stringify(portable(value), null, 2) + '\n',
  );
write('judgment', judgment);
write('authority', read(path.join(root, 'iv4-authority.json')));
write('quiet-start', compactQuietCheck(quiet));
const since = Date.parse(formal.startedAt);
const childObservations = fs
  .readdirSync(path.join(root, 'cpu-prechecks'))
  .filter((name) => name.endsWith('.json'))
  .map((name) => ({ name, ...read(path.join(root, 'cpu-prechecks', name)) }))
  .filter((row) => Date.parse(row.at) >= since);
const parentObservations = fs
  .readdirSync(root)
  .filter((name) => name.startsWith('cpu-') && name.endsWith('.json'))
  .map((name) => ({ name, ...read(path.join(root, name)) }))
  .filter((row) => Date.parse(row.at) >= since);
assert.ok(childObservations.length >= 440);
assert.ok(
  [...childObservations, ...parentObservations].every(
    (row) => row.gating === false,
  ),
);
fs.writeFileSync(
  path.join(output, 'cpu-observations.json.gz'),
  gzipSync(
    JSON.stringify(portable({ childObservations, parentObservations })) + '\n',
  ),
);
// Apply the same path redaction to copied inherited reports, preserving every numerical sample.
for (const file of fs
  .readdirSync(output)
  .filter((name) => name.endsWith('.json')))
  write(file.slice(0, -5), read(path.join(output, file)));
console.log(
  'IV4_WINDOW_JUDGMENT ' +
    JSON.stringify({
      adoptable: judgment.adoptable,
      exchangeUs: judgment.exchangeUs,
      rawExchangeUs: judgment.rawExchangeUs,
      regressions: judgment.regressions,
      test073: test073.length,
      heaps: heaps.map((heap) => ({
        runtime: heap.runtime,
        passed: heap.passed,
      })),
    }),
);
