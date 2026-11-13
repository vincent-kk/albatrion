import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'vitest';

import { assertFreshBuild, loadScanners, packageRoot } from '../_lib.mjs';
import { compareBuilds } from '../compare/compareBuilds.mjs';
import { evaluateComparison } from '../compare/evaluateComparison.mjs';
import { measurePair } from '../compare/measurePair.mjs';

test('actual comparison CLI rejects simulated slow measurements without a success marker', () => {
  const result = spawnSync(
    process.execPath,
    [
      '--import',
      fileURLToPath(new URL('./fixtures/failureLoader.mjs', import.meta.url)),
      fileURLToPath(new URL('../compare.mjs', import.meta.url)),
      '--baseline',
      join(packageRoot, 'dist'),
      '--max-slowdown',
      '1.08',
    ],
    { encoding: 'utf8', env: { ...process.env, BENCHMARK_FAILURE: 'slow' } },
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /"ratio": 0.5/);
  assert.match(result.stderr, /slowdown 2 > 1.08/);
  assert.doesNotMatch(result.stdout, /COMPARE_OK/);
});

test('enforces per-case bounds even when the group mean passes', () => {
  const cases = [
    { name: 'slow', group: 'traversal', ratio: 0.5 },
    { name: 'fast', group: 'traversal', ratio: 2 },
  ];
  assert.throws(
    () => evaluateComparison(cases, { maxSlowdown: 1.08 }),
    /slow: slowdown/,
  );
  assert.throws(
    () => evaluateComparison(cases, { maxSpeedup: 1.08 }),
    /fast: speedup/,
  );
  assert.deepEqual(evaluateComparison(cases, { min: { traversal: 1 } }), {
    traversal: 1,
  });
  assert.throws(
    () => evaluateComparison(cases, { min: { traversal: 1.01 } }),
    /geometric mean/,
  );
  assert.throws(
    () => evaluateComparison(cases, { min: { typo: 1 } }),
    /Unknown group/,
  );
});

test('refuses unequal work before timing', async () => {
  const build = await loadScanners();
  class MissingChildScanner extends build.JSONSchemaScanner {
    scan() {
      return super.scan({ type: 'object' });
    }
  }
  await assert.rejects(
    compareBuilds(
      [build, { ...build, JSONSchemaScanner: MissingChildScanner }],
      [
        {
          name: 'missing-child',
          group: 'noCallback',
          schema: { properties: { a: { type: 'string' } } },
        },
      ],
    ),
    /Work mismatch/,
  );
});

test('detects a slower scanner implementation while its work fingerprint stays equal', async () => {
  const build = await loadScanners();
  class SlowScanner extends build.JSONSchemaScanner {
    scan(schema) {
      const result = super.scan(schema);
      const start = performance.now();
      while (performance.now() - start < 0.5) {}
      return result;
    }
  }
  const cases = await compareBuilds(
    [build, { ...build, JSONSchemaScanner: SlowScanner }],
    [{ name: 'slower-build', group: 'noCallback', schema: { type: 'string' } }],
    { warmupMs: 20, batchMs: 1, rounds: 5 },
  );
  assert.equal(cases[0].visits, 1);
  assert.throws(
    () => evaluateComparison(cases, { maxSlowdown: 1.08 }),
    /slower-build: slowdown/,
  );
});

test('separates first getValue preparation from timing and alternates build order', async () => {
  let clock = 0;
  const order = [];
  const workloads = [0, 1].map((side) => ({
    prepare(count) {
      clock += 100;
      return Array.from({ length: count }, () => ({ used: false }));
    },
    run(prepared, index) {
      assert.equal(prepared[index].used, false);
      prepared[index].used = true;
      order.push(side);
      clock += side ? 2 : 1;
    },
  }));
  const result = await measurePair(workloads, false, {
    now: () => clock,
    warmupMs: 1,
    batchMs: 1,
    rounds: 3,
  });
  assert.equal(result.baselineMs, 1);
  assert.equal(result.currentMs, 2);
  assert.deepEqual(order, [0, 1, 0, 1, 1, 0, 0, 1]);
});

test('freshness includes nested source files and checks both runtime entries', () => {
  const root = mkdtempSync(join(tmpdir(), 'schema-freshness-'));
  try {
    mkdirSync(join(root, 'src/nested'), { recursive: true });
    const source = join(root, 'src/nested/schema.ts');
    writeFileSync(source, '');
    utimesSync(source, 20, 20);
    for (const driver of ['sync', 'async']) {
      const directory = join(root, 'dist/utils/JSONSchemaScanner', driver);
      mkdirSync(directory, { recursive: true });
      const entry = join(directory, 'index.mjs');
      writeFileSync(entry, '');
      utimesSync(entry, 30, 30);
    }
    assert.doesNotThrow(() => assertFreshBuild(root));
    utimesSync(source, 40, 40);
    assert.throws(() => assertFreshBuild(root), /Stale build/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
