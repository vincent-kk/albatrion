// Clock-free CLI uses the same operation builders as the 22-row milestone.
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { buildAlternatingRows } from '../../../design-optimization/tools/helpers/buildAlternatingRows.mjs';
import { json } from '../b9-0/files.mjs';
import { createDiagnosticRecorder } from './diagnostics/createDiagnosticRecorder.mjs';
import { installDisabledHooks } from './diagnostics/installDisabledHooks.mjs';

process.env.NODE_ENV = 'production';
const { setupOperation } = await import(
  new URL(
    '../../../design-optimization/tools/helpers/setupOperation.mjs',
    import.meta.url,
  ).href
);
const root = path.resolve(process.argv[2]);
installDisabledHooks(globalThis);
const engine = await import(
  pathToFileURL(path.join(root, 'diagnostics/diagnostics.mjs')).href
);
const recorder = createDiagnosticRecorder(engine);
globalThis.__iv = recorder;
const rowSummaries = [];
for (const row of buildAlternatingRows(true)) {
  recorder.enabled = false;
  const operation = await setupOperation(row, 'current', engine);
  await operation.preflight?.();
  recorder.label = row.id;
  recorder.enabled = true;
  for (let repeat = 0; repeat < 4; repeat++) {
    await operation.run();
    operation.check();
  }
  recorder.enabled = false;
  const observed = recorder.rows.filter((entry) => entry.label === row.id);
  if (row.operation !== 'mount')
    assert.ok(observed.length, row.id + ': observed settlement');
  rowSummaries.push({
    id: row.id,
    operation: row.operation,
    operations: 4,
    settlements: observed.length,
    writes: observed.filter((entry) => entry.kind !== 'load').length,
    ...(row.operation === 'mount'
      ? {
          note: 'Mounts are not writes; static-first mounts bypass general settlement.',
        }
      : {}),
  });
}
json(path.join(root, 'row-diagnostics.json'), {
  timed: false,
  operationsPerRow: 4,
  rowSummaries,
  rows: recorder.rows,
});
console.log('IV_0_ROW_DIAGNOSTICS_OK rows=22 writes=' + recorder.rows.length);
