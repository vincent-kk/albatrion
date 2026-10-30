// Invoked by check:browser-results; retained raw pages are the canonical numeric evidence.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

import ir0Cases from '../../fixtures/input-responsiveness/cases.json';
import ir1Cases from '../../fixtures/input-responsiveness/ir-1-cases.json';
import { checkDerivedRecords } from './helpers/checkDerivedRecords';
import { checkHeavyValidationResults } from './helpers/checkHeavyValidationResults';
import { summarizePage } from './helpers/summarizePage';
import { summarizePairs } from './helpers/summarizePairs';
import { summarizeResults } from './helpers/summarizeResults';
import type { SampleResult } from './helpers/summarizeResults';
import type { PageRecord } from './types';

const repository = path.resolve('../../..');
const destination = path.resolve(
  '../../canard/schema-form/architecture/verification/input-responsiveness',
);
if (process.argv.includes('--stage=ir-2')) {
  checkHeavyValidationResults(
    destination,
    process.argv.includes('--write'),
    process.argv
      .find((arg) => arg.startsWith('--audit-base='))
      ?.slice('--audit-base='.length),
  );
  process.exit(0);
}
const stage = process.argv.includes('--stage=ir-1');
const backfill = process.argv.includes('--suite=backfill');
const quietGates = process.argv.includes('--suite=quiet-gates');
const cases = stage
  ? quietGates
    ? ir1Cases.filter(
        (id) =>
          id.startsWith('replace-') ||
          id.startsWith('type-') ||
          id.startsWith('validation-'),
      )
    : backfill
      ? ['mount-flat-500-on', 'mount-array-1000-on']
      : ir1Cases
  : ir0Cases;
const raw = path.join(
  destination,
  stage
    ? 'raw/ir-1/' + (quietGates ? 'quiet' : backfill ? 'backfill' : 'main')
    : 'raw/ir-0',
);
const complete = JSON.parse(
  gunzipSync(fs.readFileSync(path.join(raw, 'complete.json.gz'))).toString(),
);
const pages: Record<string, PageRecord> = JSON.parse(
  gunzipSync(fs.readFileSync(path.join(raw, 'pages.json.gz'))).toString(),
);
assert.equal(complete.smoke, false);
assert.equal(complete.count, 10);
assert.equal(complete.warmup, 3);
assert.deepEqual(complete.cases, cases);
assert.equal(
  complete.samples.length,
  cases.length * complete.inputs.lanes.length * 10,
);
assert.equal(Object.keys(pages).length, complete.samples.length);
for (const sample of complete.samples as SampleResult[]) {
  const page = pages[sample.file];
  assert.ok(page, sample.file);
  assert.deepEqual(
    summarizePage(page),
    sample.summary,
    sample.file + ' summary reproduces',
  );
  assert.equal(page.mount.allDeferred, 0);
  assert.ok(
    page.handlers.every(
      (event) =>
        (event.trusted || sample.id.startsWith('switch-oneOf-20')) &&
        Number.isFinite(event.wallMs),
    ),
  );
}
for (const id of cases)
  for (const lane of complete.inputs.lanes) {
    const indices = (complete.samples as SampleResult[])
      .filter((entry) => entry.id === id && entry.lane === lane)
      .map((entry) => entry.index)
      .sort((a, b) => a - b);
    assert.deepEqual(
      indices,
      Array.from({ length: 10 }, (_, index) => index),
    );
  }
for (const lane of complete.inputs.lanes) {
  assert.match(complete.inputs.bundles[lane].product.sha256, /^[a-f0-9]{64}$/);
  assert.match(complete.inputs.bundles[lane].browser.sha256, /^[a-f0-9]{64}$/);
}
const rows = summarizeResults(complete.samples);
if (complete.mode === 'paired-relative') {
  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(raw, 'pairs.json'), 'utf8')),
    summarizePairs(complete.samples),
  );
  for (const page of Object.values(pages))
    assert.ok('externalCpu' in page, 'Each paired page preserves external CPU');
}
assert.deepEqual(
  JSON.parse(fs.readFileSync(path.join(raw, 'summary.json'), 'utf8')),
  rows,
);
const changed = execFileSync(
  'git',
  ['diff', '--name-only', stage ? '91c422e0e' : '5d1348ed1'],
  {
    cwd: repository,
    encoding: 'utf8',
  },
)
  .trim()
  .split('\n');
const untracked = execFileSync(
  'git',
  ['ls-files', '--others', '--exclude-standard'],
  { cwd: repository, encoding: 'utf8' },
)
  .trim()
  .split('\n');
for (const file of [...changed, ...untracked].filter(Boolean)) {
  const location = path.join(repository, file);
  if (!fs.existsSync(location) || !fs.statSync(location).isFile()) continue;
  const bytes = fs.readFileSync(location);
  const content = (file.endsWith('.gz') ? gunzipSync(bytes) : bytes).toString();
  assert.ok(
    !new RegExp('/' + '(?:Users|private/tmp|home)/').test(content),
    file + ' contains a machine path',
  );
}
for (const row of rows.filter(
  (row) => row.id === 'type-flat-500' || row.id === 'replace-200-while-typing',
))
  console.log(
    JSON.stringify({
      fixture: row.id,
      lane: row.lane,
      processingP95: row.processing.p95,
      handlerP95: row.handler.p95,
      longestFrame: row.longestFrame,
    }),
  );
for (const id of cases)
  for (let index = 0; index < 10; index++)
    assert.deepEqual(
      (complete.samples as SampleResult[])
        .filter((sample) => sample.id === id && sample.index === index)
        .map((sample) => sample.lane),
      complete.mode === 'paired-relative'
        ? [
            ...complete.inputs.lanes.slice(
              index % complete.inputs.lanes.length,
            ),
            ...complete.inputs.lanes.slice(
              0,
              index % complete.inputs.lanes.length,
            ),
          ]
        : index % 2 === 0
          ? complete.inputs.lanes
          : [...complete.inputs.lanes].reverse(),
      'Alternating lane order',
    );
console.log(
  (stage ? 'IR1' : 'IR0') +
    '_RAW_REPRODUCED samples=' +
    complete.samples.length,
);
if (process.argv.includes('--derived')) {
  assert.ok(stage, '--derived requires --stage=ir-1');
  checkDerivedRecords(destination);
}
