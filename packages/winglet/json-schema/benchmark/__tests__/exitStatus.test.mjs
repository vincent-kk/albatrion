import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'vitest';

test('verify exits non-zero when scanner output violates invariants', () => {
  const result = spawnSync(
    process.execPath,
    [
      '--import',
      fileURLToPath(new URL('./fixtures/failureLoader.mjs', import.meta.url)),
      fileURLToPath(new URL('../verify.mjs', import.meta.url)),
    ],
    { encoding: 'utf8', env: { ...process.env, BENCHMARK_FAILURE: 'verify' } },
  );
  assert.ok(JSON.parse(result.stdout).failed > 0);
  assert.equal(result.status, 1, result.stderr);
}, 60_000);

test('memleak exits non-zero for simulated retained heap growth', () => {
  const result = spawnSync(
    process.execPath,
    [
      '--expose-gc',
      '--import',
      fileURLToPath(new URL('./fixtures/failureLoader.mjs', import.meta.url)),
      fileURLToPath(new URL('../memleak.mjs', import.meta.url)),
    ],
    { encoding: 'utf8', env: { ...process.env, BENCHMARK_FAILURE: 'leak' } },
  );
  assert.equal(JSON.parse(result.stdout).anyLeak, true);
  assert.equal(result.status, 1, result.stderr);
}, 60_000);
