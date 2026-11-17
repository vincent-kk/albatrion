// Invoked standalone by Node/Bun; copied dist and compiled verification fixtures execute in the supplied ignored run directory.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

process.env.NODE_ENV = 'production';
const packageRoot = fileURLToPath(new URL('../../../', import.meta.url));
const root = path.resolve(packageRoot, '../../..');
const arg = (name, fallback) =>
  process.argv
    .find((value) => value.startsWith('--' + name + '='))
    ?.slice(name.length + 3) ?? fallback;
const runArgument = arg('run');
assert.ok(runArgument, 'Pass --run=<ignored run directory>; there is no default');
const run = path.resolve(runArgument);
const label = arg('label', 'candidate');
const mode = process.argv[2];
const hash = (value) => createHash('sha256').update(value).digest('hex');
const fileHash = (file) => hash(fs.readFileSync(file));
const write = (name, data) => {
  const file = path.join(run, name);
  assert.ok(!fs.existsSync(file), 'Never overwrite raw: ' + file);
  fs.writeFileSync(
    file,
    typeof data === 'string' ? data : JSON.stringify(data, null, 2) + '\n',
  );
  return file;
};
const names = [
  'buildFieldNodeTree',
  'mountFieldNode',
  'dispatchSetValue',
  'dispatchPush',
  'dispatchInsert',
  'dispatchRemove',
  'dispatchPop',
  'dispatchClear',
  'dispatchUpdate',
  'dispatchBatch',
  'subscribeFieldNode',
  'getItemEntries',
];
const current = path.join(packageRoot, 'dist/index.mjs');
const baseline = path.join(
  run,
  'baseline/packages/canard/schema-form/dist/index.mjs',
);
const manifestPath = path.join(run, label + '.bundles.json');
const load = async (file) => import(pathToFileURL(file).href);
const runtime = process.versions.bun ? 'bun' : 'node';

if (mode === 'prepare') {
  await import('./fixtures/itemlessRuleTargetBinding/readiness.mjs');
} else if (mode === 'compare') {
  await import('./fixtures/itemlessRuleTargetBinding/compare.mjs');
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath));
  for (const bundle of Object.values(manifest.bundles)) {
    assert.equal(fileHash(bundle.rawPath), bundle.rawSHA256);
    assert.equal(fileHash(bundle.executedPath), bundle.executedSHA256);
  }
  if (mode === 'count') {
    const engines = {};
    for (const engine of ['base', 'candidate'])
      engines[engine] = await load(manifest.bundles[engine].countedPath);
    const positiveRows = [];
    for (const host of ['root', 'nested'])
      for (const n of [1000, 8000])
        for (const freshRun of [1, 2]) {
          const row = { runtime, host, n, freshRun };
          for (const name of ['base', 'candidate']) {
            const engine = engines[name];
            globalThis.__itemlessCalls = 0;
            const values = Array.from({ length: n }, (_, i) => i);
            const input = host === 'root' ? values : { list: values };
            const root = engine.buildFieldNodeTree({
              jsonSchema:
                host === 'root'
                  ? { type: 'array' }
                  : { type: 'object', properties: { list: { type: 'array' } } },
              defaultValue: input,
            });
            engine.mountFieldNode(root);
            assert.deepEqual(root.value, input);
            row[name === 'base' ? 'baselineCalls' : 'candidateCalls'] =
              globalThis.__itemlessCalls;
            row[name + 'Children'] = (
              host === 'root' ? root : root.find('/list')
            ).children.length;
          }
          positiveRows.push(row);
        }
    const file = write(label + '-counts-' + runtime + '.json', {
      positiveRows,
    });
    console.log(JSON.stringify({ file, positiveRows }));
  } else if (mode === 'preflight' || mode === 'measure') {
    const { materializeMountedValues } = await load(
      path.join(packageRoot, 'bench/distEngine/loadDistEngine.ts'),
    );
    const { runMountPreflight, runMountMeasurements } = await load(
      path.join(
        packageRoot,
        'src/core/__tests__/fixtures/itemlessDeclarations/measurements.mjs',
      ),
    );
    const engines = {
      base: await load(manifest.bundles.base.executedPath),
      candidate: await load(manifest.bundles.candidate.executedPath),
      legacy: await load(manifest.legacy.executedPath),
    };
    const round = Number(arg('round', '1'));
    const result =
      mode === 'preflight'
        ? await runMountPreflight(engines, materializeMountedValues)
        : await runMountMeasurements(engines, materializeMountedValues, round);
    const prefix = arg('measurement-prefix', 'corrected-measure');
    const file = write(
      mode === 'preflight'
        ? label + '-preflight-' + runtime + '.json'
        : prefix + '-' + runtime + '-' + round + '.json',
      {
        ...result,
        runtime,
        version: process.versions.bun ?? process.version,
        manifestPath,
        fixtureToolPath: path.join(
          packageRoot,
          'src/core/__tests__/fixtures/itemlessDeclarations/measurements.mjs',
        ),
        fixtureToolSHA256: fileHash(
          path.join(
            packageRoot,
            'src/core/__tests__/fixtures/itemlessDeclarations/measurements.mjs',
          ),
        ),
      },
    );
    console.log(
      JSON.stringify({
        file,
        mode,
        runtime,
        round: mode === 'measure' ? round : undefined,
        statusCounts: result.statusCounts ?? result.preflight.statusCounts,
        primaryScenes:
          result.primarySceneIds?.length ??
          result.preflight.primarySceneIds.length,
        referenceScenes:
          result.referenceSceneIds?.length ??
          result.preflight.referenceSceneIds.length,
        timedRows:
          result.timedRowsPerExecution ??
          result.preflight.timedRowsPerExecution,
        rows:
          mode === 'measure'
            ? result.rows.map(({ id, engine, medianMs }) => ({
                id,
                engine,
                medianMs,
              }))
            : undefined,
        referenceRows:
          mode === 'measure'
            ? result.referenceRows.map(({ id, engine, medianMs }) => ({
                id,
                engine,
                medianMs,
              }))
            : undefined,
      }),
    );
  } else throw new Error('Unknown mode: ' + mode);
}
