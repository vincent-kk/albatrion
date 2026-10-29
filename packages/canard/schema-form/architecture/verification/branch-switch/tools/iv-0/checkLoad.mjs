// Untimed operation assertions precede both rehearsal and the formal marker.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { buildAlternatingRows } from '../../../design-optimization/tools/helpers/buildAlternatingRows.mjs';
import { digest, json } from '../b9-0/files.mjs';
import { createUntimedRecorder } from '../b9-0/untimedRecorder.mjs';
import { getStageRoot } from '../window/getStageRoot.mjs';
import { installDisabledHooks } from './diagnostics/installDisabledHooks.mjs';
import { verifyInputs } from './verifyInputs.mjs';

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
  ['plain', 'current', path.join(root, 'diagnostics/plain.mjs')],
  ['details', 'current', path.join(root, 'diagnostics/details.mjs')],
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
const stageResults = [];
for (const lane of ['A', 'B'])
  for (const mode of [
    'unwrapped',
    'wrapped',
    ...(lane === 'B' ? ['supplemental'] : []),
    ...(lane === 'A' ? ['legacy'] : []),
  ]) {
    const output = execFileSync(
      process.execPath,
      [
        fileURLToPath(new URL('../b9-0/smoke.mjs', import.meta.url)),
        getStageRoot(root, lane),
        mode === 'legacy'
          ? 'engines/legacy.mjs'
          : 'stages/scratch/' + mode + '.mjs',
        mode,
      ],
      { encoding: 'utf8', env: { ...process.env, NODE_ENV: 'production' } },
    );
    stageResults.push({ lane, ...JSON.parse(output) });
  }
assert.equal(observations.filter((row) => row.lane === 'B').length, 22);
json(path.join(root, 'load-check.json'), {
  timed: false,
  inputsSha256: digest(path.join(root, 'inputs.json')).sha256,
  observations,
  stageResults,
});
console.log('IV_0_UNTIMED_LOAD_OK rows=22 stage-bundles=6 legacy-oneOf=120');
