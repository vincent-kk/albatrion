// Invoked with profile/register.mjs; verifies new rows and unchanged canonical fixtures before formal measurement.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { buildFixture } from '../fixtures.mjs';
import { buildRows } from './buildRows.mjs';
import { setupBranchOperation } from './setupBranchOperation.mjs';
import { setupOperation } from './setupOperation.mjs';

process.env.NODE_ENV = 'production';
const runDir = process.argv[2];
const engines = JSON.parse(
  fs.readFileSync(path.join(runDir, 'engines.json')),
).engines;
const mods = Object.fromEntries(
  await Promise.all(
    Object.entries(engines).map(async ([name, e]) => [
      name,
      await import(pathToFileURL(e.destination)),
    ]),
  ),
);
const original = execFileSync(
  'git',
  [
    'show',
    'b8db53997:packages/canard/schema-form/architecture/verification/design-optimization/tools/fixtures.mjs',
  ],
  { encoding: 'utf8' },
);
const baseline = await import(
  `data:text/javascript;base64,${Buffer.from(original).toString('base64')}`
);
for (const row of [...buildRows(false), ...buildRows(true)])
  for (const legacy of [false, true])
    assert.deepEqual(
      buildFixture(row, legacy),
      baseline.buildFixture(row, legacy),
    );
const rows = buildRows(false, true);
assert.equal(rows.length, 10);
assert.equal(
  rows.filter((r, i) => rows.findIndex((other) => other.id === r.id) === i)
    .length,
  rows.length,
);
for (const row of rows) {
  for (const engine of row.currentOnly ? ['current'] : ['legacy', 'current']) {
    const operation = await setupOperation(row, engine, mods[engine]);
    await operation.preflight?.();
    await operation.run();
    operation.check();
  }
}
const guarded = rows.find((r) => r.gate === 'if');
await assert.rejects(
  setupBranchOperation(guarded, 'current', mods.current, {
    validator: undefined,
  }),
  /validator with compileGuard required/,
);
for (const row of rows.filter((r) => r.currentOnly)) {
  let failure;
  try {
    await setupBranchOperation(row, 'legacy', mods.legacy);
  } catch (error) {
    failure = error;
  }
  assert.ok(
    failure,
    `${row.id}: legacy unexpectedly supports the same fixture; reassess pairing`,
  );
  console.log(
    `LEGACY_UNPAIRED ${row.id}: ${failure.code ?? failure.message.split('\n')[0]}`,
  );
}
console.log('B0_DEVICE_OK canonical=24 b0=10 missing-validator=rejected');
