// Untimed operation assertions precede both rehearsal and the formal marker.
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { buildAlternatingRows } from '../../../design-optimization/tools/helpers/buildAlternatingRows.mjs';
import { digest, json } from '../b9-0/files.mjs';
import { createUntimedRecorder } from '../b9-0/untimedRecorder.mjs';
import { installDisabledHooks } from '../iv-0/diagnostics/installDisabledHooks.mjs';
import { verifyInputs } from '../iv-0/verifyInputs.mjs';
import { getStageRoot } from '../window/getStageRoot.mjs';

process.env.NODE_ENV = 'production';
const { setupOperation } = await import(
  new URL(
    '../../../design-optimization/tools/helpers/setupOperation.mjs',
    import.meta.url,
  ).href
);
const root = path.resolve(process.argv[2]);
verifyInputs(root);
installDisabledHooks(globalThis);
const observations = [];
for (const [lane, engineName, file] of [
  ['A', 'current', path.join(getStageRoot(root, 'A'), 'engines/current.mjs')],
  ['B', 'current', path.join(getStageRoot(root, 'B'), 'engines/current.mjs')],
  ['L', 'legacy', path.join(getStageRoot(root, 'A'), 'engines/legacy.mjs')],
]) {
  const recorder = createUntimedRecorder();
  Reflect.set(globalThis, '__b0', recorder);
  const engine = await import(pathToFileURL(file).href);
  for (const row of buildAlternatingRows(true)) {
    if (engineName === 'legacy' && 'currentOnly' in row && row.currentOnly)
      continue;
    recorder.enabled = false;
    const operation = await setupOperation(row, engineName, engine);
    await operation.preflight?.();
    recorder.enabled = true;
    for (let repeat = 0; repeat < 2; repeat++) {
      await operation.run();
      operation.check();
    }
    observations.push({ lane, row: row.id, operations: 2, passed: true });
  }
}
assert.equal(observations.filter((row) => row.lane === 'B').length, 22);
json(path.join(root, 'load-check.json'), {
  timed: false,
  inputsSha256: digest(path.join(root, 'inputs.json')).sha256,
  observations,
});
console.log('IV_5_UNTIMED_LOAD_OK S=22 E=22 L=18');
