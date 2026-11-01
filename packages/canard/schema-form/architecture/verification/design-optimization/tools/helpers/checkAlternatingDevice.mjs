// Invoked by Node CLI; deterministic acceptance math is checked before any formal window.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildAlternatingRows } from './buildAlternatingRows.mjs';
import { buildRows } from './buildRows.mjs';
import { executeAlternatingRows } from './executeAlternatingRows.mjs';
import { readAlternatingConfig } from './readAlternatingConfig.mjs';
import { summarizeAlternating } from './summarizeAlternating.mjs';

const control = { id: 'single-flat-1000' };
function observations(a, b) {
  return a.flatMap((value, repeat) =>
    ['A', 'B'].map((lane, role) => ({
      row: control.id,
      lane,
      repeat,
      pid: repeat * 2 + role + 1,
      samples: { current: [lane === 'A' ? value : b[repeat]] },
      minima: { current: lane === 'A' ? value : b[repeat] },
    })),
  );
}
const a = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28];
const result = summarizeAlternating(
  [control],
  observations(a, Array(10).fill(2)),
);
assert.equal(result.rows.length, 1);
assert.equal(result.rows[0].A.ms, 14);
assert.equal(result.rows[0].Aprime.ms, 24);
assert.equal(result.rows[0].B.ms, 2);
assert.equal(result.rows[0].widthMs, 10);
assert.equal(result.rows[0].decision, 'improved');
for (const value of [0.95, 1.05])
  assert.equal(
    summarizeAlternating(
      [control],
      observations(Array(10).fill(1), Array(10).fill(value)),
    ).quality.passed,
    true,
  );
for (const value of [0.9499, 1.0501])
  assert.equal(
    summarizeAlternating(
      [control],
      observations(Array(10).fill(1), Array(10).fill(value)),
    ).quality.passed,
    false,
  );
assert.equal(
  summarizeAlternating(
    [control],
    observations([1, 1, 1, 1, 1, 3, 3, 3, 3, 3], Array(10).fill(2)),
  ).quality.ratio,
  1,
);
const shifted = summarizeAlternating(
  [control],
  observations(
    Array(5).fill(1).concat(Array(5).fill(0.5)),
    Array(10).fill(0.4),
  ),
);
assert.equal(shifted.rows[0].decision, 'improved');
const rows = buildAlternatingRows();
assert.equal(rows.length, 21);
assert.equal(rows[0].id, control.id);
assert.ok(rows.every((row, i) => rows.findIndex((r) => r.id === row.id) === i));
for (const row of buildRows(false))
  assert.deepEqual(
    rows.find((r) => r.id === row.id),
    row,
  );
const flags = [
  '--baseline-bundle={scratch}/a.mjs',
  '--candidate-bundle={scratch}/b.mjs',
  '--quiet-since=2026-01-01T00:00:00Z',
];
assert.equal(readAlternatingConfig(flags).runs, 10);
assert.throws(() => readAlternatingConfig([...flags, '--runs=8']), /Formal/);
assert.throws(
  () => readAlternatingConfig([...flags, '--warmups=19']),
  /Formal/,
);
assert.throws(() => readAlternatingConfig([...flags, '--runs=3']), /even/);
let calls = 0;
let published;
const code = executeAlternatingRows(
  { formal: true, runs: 10 },
  [control, { id: 'must-not-run' }],
  (row, lane, repeat) => {
    calls++;
    assert.equal(row.id, control.id);
    assert.equal(lane, calls % 2 ? 'A' : 'B');
    return {
      row: row.id,
      repeat,
      pid: calls,
      minima: { current: lane === 'A' ? 1 : 1.1 },
    };
  },
  (results, completed) =>
    (published = summarizeAlternating(completed, results)),
);
assert.equal(calls, 20);
assert.equal(code, 2);
assert.equal(published.rows.length, 1);
assert.equal(published.quality.passed, false);
const pending = [fileURLToPath(new URL('../', import.meta.url))];
let syntax = 0;
while (pending.length) {
  const directory = pending.pop();
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) pending.push(target);
    else if (entry.name.endsWith('.mjs')) {
      const result = spawnSync(process.execPath, ['--check', target], {
        encoding: 'utf8',
      });
      assert.equal(result.status, 0, `${target}: ${result.stderr}`);
      syntax++;
    }
  }
}
if (process.env.ALTERNATING_FROZEN_SOURCE) {
  const changed = execFileSync(
    'git',
    [
      'diff',
      '--name-only',
      process.env.ALTERNATING_FROZEN_SOURCE,
      '--',
      'packages/canard/schema-form/src',
      'packages/canard/schema-form/dist',
    ],
    { encoding: 'utf8' },
  );
  assert.equal(changed, '', 'Frozen product source and dist');
}
console.log('ALTERNATING_MATH_OK');
const legacyRows = [
  control,
  { id: 'paired-other' },
  { id: 'paired-middle' },
  { id: 'no-legacy', currentOnly: true },
];
function legacyObservations(id, current, legacy, scale) {
  return observations(Array(10).fill(1), Array(10).fill(current)).map((r) => ({
    ...r,
    row: id,
    minima: { ...r.minima, legacy: scale * (r.lane === 'A' ? 1 : legacy) },
  }));
}
const legacySummary = summarizeAlternating(
  legacyRows,
  [
    ...legacyObservations(control.id, 1.3, 0.96, 1),
    ...legacyObservations('paired-other', 2, 1, 1000),
    ...legacyObservations('paired-middle', 0.5, 1.04, 100),
    ...legacyObservations('no-legacy', 3, 3, 5),
  ],
  'legacy',
);
assert.equal(legacySummary.quality.ratio, 1);
assert.equal(legacySummary.quality.passed, true);
assert.equal(legacySummary.quality.assessedRows, 3);
assert.equal(legacySummary.rows[3].legacyRatio, null);
assert.equal(legacySummary.rows[0].currentRatio, 1.3);
assert.ok(Math.abs(legacySummary.rows[0].ratioOfRatios - 1.3 / 0.96) < 1e-12);
assert.equal(
  readAlternatingConfig([...flags, '--quality=legacy']).quality,
  'legacy',
);
let deferredCalls = 0;
assert.equal(
  executeAlternatingRows(
    { formal: true, runs: 10, quality: 'legacy' },
    [control, { id: 'second' }],
    (row, lane, repeat) => ({ row: row.id, repeat, pid: ++deferredCalls }),
    () => ({ quality: { passed: false } }),
  ),
  2,
);
assert.equal(deferredCalls, 40);
console.log('ALTERNATING_LEGACY_QUALITY_OK');
console.log(
  `ALTERNATING_CONTRACT_OK syntax=${syntax} rows=21 control-abort=20`,
);

const runDir = process.argv[2];
if (runDir) {
  const report = JSON.parse(
    fs.readFileSync(path.join(runDir, 'results.json'), 'utf8'),
  );
  assert.equal(report.rows.length, 21);
  assert.equal(report.completed, true);
  assert.equal(report.results.length, 21 * report.config.runs * 2);
  if (report.config.quality === 'legacy') {
    assert.equal(report.quality.kind, 'legacy');
    assert.equal(report.quality.assessedRows, 17);
    assert.equal(report.quality.omittedRows.length, 4);
    for (const row of report.rows)
      assert.equal(row.legacyRatio === null, row.currentOnly === true);
  }
  const pids = report.results.map((r) => r.pid);
  assert.ok(pids.every((pid, index) => pids.indexOf(pid) === index));
  for (const row of report.rows) {
    const measured = report.results.filter((r) => r.row === row.id);
    for (let index = 0; index < measured.length; index++) {
      const item = measured[index];
      assert.equal(item.lane, index % 2 ? 'B' : 'A');
      assert.equal(item.repeat, Math.floor(index / 2));
      assert.equal(item.samples.current.length, report.config.samples);
      assert.equal(item.minima.current, Math.min(...item.samples.current));
      const command = JSON.parse(
        fs.readFileSync(
          path.join(
            runDir,
            `${row.id}-${item.lane}-${item.repeat}.command.json`,
          ),
          'utf8',
        ),
      );
      assert.equal(command.status, 0);
    }
  }
  for (const lane of ['A', 'B'])
    for (const job of Object.values(report.engines[lane].engines)) {
      const original = fs.readFileSync(job.source);
      assert.equal(
        createHash('sha256').update(original).digest('hex'),
        job.sha256,
      );
      assert.ok(
        fs
          .readFileSync(job.destination)
          .subarray(0, original.length)
          .equals(original),
      );
    }
  console.log(
    `ALTERNATING_ARTIFACT_OK rows=21 processes=${report.results.length}`,
  );
}

const payloadRows = buildAlternatingRows(true);
assert.equal(buildAlternatingRows().length, 21);
assert.equal(payloadRows.length, 22);
assert.equal(payloadRows.filter((row) => row.id === 'switch-payload-12').length, 1);
assert.equal(payloadRows.filter((row) => !row.currentOnly).length, 18);
console.log('ALTERNATING_PAYLOAD_REGISTRY_OK rows=22 legacy=18');
