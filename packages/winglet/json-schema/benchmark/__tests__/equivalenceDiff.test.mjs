import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'vitest';

import { diffSnapshots } from '../equivalenceDiff/diffSnapshots.mjs';

const script = fileURLToPath(
  new URL('../equivalenceDiff.mjs', import.meta.url),
);
const capture = spawnSync(
  process.execPath,
  [fileURLToPath(new URL('../equivalence.mjs', import.meta.url))],
  { encoding: 'utf8' },
);
assert.equal(capture.status, 0, capture.stderr);
const current = JSON.parse(capture.stdout);

/** Run the actual CLI against a temporary frozen snapshot, removing it even after assertion failure. */
function runSnapshot(content, args = []) {
  const directory = mkdtempSync(join(tmpdir(), 'schema-equivalence-'));
  try {
    const baseline = join(directory, 'baseline.json');
    writeFileSync(baseline, content);
    return spawnSync(
      process.execPath,
      [script, '--baseline', baseline, ...args],
      { encoding: 'utf8' },
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('rejects broken baseline JSON without a success marker', () => {
  const result = runSnapshot('{broken');
  assert.notEqual(result.status, 0);
  assert.doesNotMatch(result.stdout, /EQUIVALENCE_DIFF_OK/);
  assert.match(
    result.stderr,
    /Expected property name|Unexpected token|not valid JSON/,
  );
});

test('rejects a missing case even if its name is allowed', () => {
  const missing = { ...current };
  delete missing.refChain;
  const result = runSnapshot(JSON.stringify(missing), ['--allow', 'refChain']);
  assert.notEqual(result.status, 0);
  assert.doesNotMatch(result.stdout, /EQUIVALENCE_DIFF_OK/);
  assert.match(result.stderr, /Case set mismatch.*refChain/);
});

test('rejects an extra case', () => {
  const result = runSnapshot(JSON.stringify({ ...current, extra: {} }));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /missing current \[extra\]/);
  assert.doesNotMatch(result.stdout, /EQUIVALENCE_DIFF_OK/);
});

test('reports a changed case and accepts only its explicit allowance', () => {
  const changed = { ...current, refChain: { changed: true } };
  const rejected = runSnapshot(JSON.stringify(changed));
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.stderr, /Unexpected changes: \[refChain\]/);
  assert.doesNotMatch(rejected.stdout, /EQUIVALENCE_DIFF_OK/);
  const allowed = runSnapshot(JSON.stringify(changed), [
    '--allow',
    'refChain',
    '--require-changed',
    'refChain',
  ]);
  assert.equal(allowed.status, 0, allowed.stderr);
  assert.match(allowed.stdout, /EQUIVALENCE_DIFF_OK/);
});

test('rejects a required change that did not happen', () => {
  const result = runSnapshot(JSON.stringify(current), [
    '--allow',
    'refChain',
    '--require-changed',
    'refChain',
  ]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /required but unchanged: \[refChain\]/);
  assert.doesNotMatch(result.stdout, /EQUIVALENCE_DIFF_OK/);
});

test('rejects malformed snapshots and unknown case names', () => {
  for (const snapshot of [null, [], {}, 4])
    assert.throws(() => diffSnapshots(snapshot, current), /Invalid baseline/);
  assert.throws(
    () => diffSnapshots(current, current, { allow: ['typo'] }),
    /Unknown cases: typo/,
  );
});

test('ignores object key order while preserving array order', () => {
  assert.deepEqual(
    diffSnapshots({ a: { x: 1, y: 2 } }, { a: { y: 2, x: 1 } }),
    [],
  );
  assert.throws(
    () => diffSnapshots({ a: [1, 2] }, { a: [2, 1] }),
    /Unexpected changes: \[a\]/,
  );
});
