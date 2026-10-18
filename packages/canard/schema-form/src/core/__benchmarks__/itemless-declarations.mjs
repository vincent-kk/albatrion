// Invoked standalone by Node/Bun; copied dist and compiled verification fixtures execute in the supplied ignored run directory.
import { buildSync } from 'esbuild';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath, pathToFileURL } from 'node:url';

process.env.NODE_ENV = 'production';
const packageRoot = fileURLToPath(new URL('../../../', import.meta.url));
const root = path.resolve(packageRoot, '../../..');
const arg = (name, fallback) =>
  process.argv
    .find((value) => value.startsWith('--' + name + '='))
    ?.slice(name.length + 3) ?? fallback;
const run = path.resolve(
  arg(
    'run',
    path.join(root, '.seiri/tasks/itemless-declarations/run-task_b9d615956067'),
  ),
);
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
  const bundles = {};
  for (const [engine, source] of [
    ['base', baseline],
    ['candidate', current],
  ]) {
    const bytes = fs.readFileSync(source, 'utf8');
    for (const name of names)
      assert.match(
        bytes,
        new RegExp('^(?:const|let|var|function) ' + name + '(?:[ (=;])', 'm'),
      );
    const rawPath = write(label + '-' + engine + '-raw.mjs', bytes);
    const executedPath = write(
      label + '-' + engine + '.mjs',
      bytes + '\nexport { ' + names.join(', ') + ' };\n',
    );
    const anchor = 'const getItemEntries = (template, index) => {';
    assert.equal(bytes.split(anchor).length, 2);
    const counted = bytes.replace(
      anchor,
      anchor + '\n globalThis.__itemlessCalls++;',
    );
    const countedPath = write(
      label + '-' + engine + '-counted.mjs',
      counted + '\nexport { ' + names.join(', ') + ' };\n',
    );
    bundles[engine] = {
      source,
      rawPath,
      rawSHA256: hash(bytes),
      executedPath,
      executedSHA256: fileHash(executedPath),
      countedPath,
      countedSHA256: fileHash(countedPath),
    };
  }
  const fixtureRoot = path.join(packageRoot, 'src/core/__tests__/fixtures');
  const fixturePath = path.join(run, label + '-fixtures.mjs');
  assert.ok(!fs.existsSync(fixturePath));
  const compiled = buildSync({
    stdin: {
      contents:
        `export {runItemlessScene} from ${JSON.stringify(path.join(fixtureRoot, 'itemlessDeclarations/observe.ts'))};\n` +
        `export {makeItemlessScene} from ${JSON.stringify(path.join(fixtureRoot, 'itemlessDeclarations/scenes.ts'))};\n` +
        `export {createTestValidator} from ${JSON.stringify(path.join(fixtureRoot, 'createTestValidator.ts'))};`,
      resolveDir: root,
    },
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    outfile: fixturePath,
    metafile: true,
  });
  const fixtureInputs = Object.keys(compiled.metafile.inputs)
    .filter((p) => p !== '<stdin>')
    .map((p) => {
      const absolute = path.resolve(root, p);
      return { path: absolute, sha256: fileHash(absolute) };
    });
  const legacySource = path.join(
    root,
    'node_modules/@canard/schema-form_0.16.1/dist/index.mjs',
  );
  const legacyBytes = fs.readFileSync(legacySource, 'utf8');
  const legacyPath = write(
    label + '-legacy.mjs',
    legacyBytes + '\nexport { nodeFromJSONSchema };\n',
  );
  write(label + '.bundles.json', {
    bundles,
    fixturePath,
    fixtureSHA256: fileHash(fixturePath),
    fixtureInputs,
    legacy: {
      source: legacySource,
      sourceSHA256: hash(legacyBytes),
      executedPath: legacyPath,
      executedSHA256: fileHash(legacyPath),
    },
    tool: {
      path: fileURLToPath(import.meta.url),
      sha256: fileHash(fileURLToPath(import.meta.url)),
    },
  });
  console.log(
    JSON.stringify({
      marker: 'ITEMLESS_BUNDLES_PREPARED',
      label,
      bundles,
      fixtureInputs: fixtureInputs.length,
    }),
  );
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath));
  for (const bundle of Object.values(manifest.bundles)) {
    assert.equal(fileHash(bundle.rawPath), bundle.rawSHA256);
    assert.equal(fileHash(bundle.executedPath), bundle.executedSHA256);
  }
  if (mode === 'compare') {
    const fixture = await load(manifest.fixturePath);
    const matrix = JSON.parse(
      fs.readFileSync(
        path.join(root, '.seiri/tasks/itemless-declarations/matrix.json'),
      ),
    );
    assert.equal(Object.values(matrix).flat().length, 58);
    const base = await load(manifest.bundles.base.executedPath);
    const candidate = await load(manifest.bundles.candidate.executedPath);
    const cases = [],
      failures = [],
      baselineSelfComparisons = [];
    for (const [group, ids] of Object.entries(matrix))
      for (const id of ids) {
        try {
          const first = fixture.runItemlessScene(
            base,
            fixture.makeItemlessScene(id),
            fixture.createTestValidator(),
          );
          const second = fixture.runItemlessScene(
            base,
            fixture.makeItemlessScene(id),
            fixture.createTestValidator(),
          );
          const next = fixture.runItemlessScene(
            candidate,
            fixture.makeItemlessScene(id),
            fixture.createTestValidator(),
          );
          assert.deepEqual(first, second, id + '/baseline-self');
          assert.deepEqual(first, next, id + '/dist-comparison');
          baselineSelfComparisons.push({ id, first, second });
          cases.push({
            id: runtime + '/' + id,
            group,
            runtime,
            phase: first.phase,
            baseline: first.observation,
            candidate: next.observation,
            baselineError: first.error,
            candidateError: next.error,
          });
        } catch (error) {
          failures.push({
            id,
            group,
            message: error.message,
            stack: error.stack,
          });
        }
      }
    const negativeControls = [];
    const selected = cases.find((row) =>
      row.id.endsWith('/derive-inject-target'),
    );
    if (selected)
      for (const kind of [
        'rules-omission',
        'alias-loss',
        'event-loss',
        'rule-target-change',
      ]) {
        const original = structuredClone(selected.baseline),
          corrupted = structuredClone(original);
        if (kind === 'rules-omission') delete corrupted.rules;
        if (kind === 'alias-loss') corrupted.referenceMatrix = [];
        if (kind === 'event-loss') corrupted.listenerHistory = [];
        if (kind === 'rule-target-change') corrupted.ruleTargets = [];
        let comparatorExit = 0;
        try {
          assert.deepEqual(original, corrupted);
        } catch {
          comparatorExit = 1;
        }
        assert.equal(comparatorExit, 1);
        negativeControls.push({ kind, original, corrupted, comparatorExit });
      }
    const file = write(label + '-compare-' + runtime + '.json', {
      runtime,
      version: process.versions.bun ?? process.version,
      cases,
      failures,
      baselineSelfComparisons,
      negativeControls,
      manifestPath,
      manifestSHA256: fileHash(manifestPath),
    });
    console.log(
      JSON.stringify({
        file,
        completed: cases.length,
        failures: failures.map(({ id, message }) => ({
          id,
          message: message.slice(0, 250),
        })),
        negativeControls: negativeControls.length,
      }),
    );
    if (failures.length) process.exitCode = 1;
  } else if (mode === 'count') {
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
  } else if (mode === 'measure') {
    const round = Number(arg('round', '1'));
    const reverse = round === 2;
    const { materializeMountedValues } = await load(
      path.join(packageRoot, 'bench/distEngine/loadDistEngine.ts'),
    );
    const engines = {
      base: await load(manifest.bundles.base.executedPath),
      candidate: await load(manifest.bundles.candidate.executedPath),
      legacy: await load(manifest.legacy.executedPath),
    };
    const specs = [
      ['root-itemless-N1000', 'root', 'itemless', 1000],
      ['root-itemless-N8000', 'root', 'itemless', 8000],
      ['nested-itemless-N1000', 'nested', 'itemless', 1000],
      ['nested-itemless-N8000', 'nested', 'itemless', 8000],
      ['root-BN-N1000', 'root', 'BN', 1000],
      ['root-BN-N8000', 'root', 'BN', 8000],
      ['root-terminal-N1000', 'root', 'terminal', 1000],
      ['root-terminal-N8000', 'root', 'terminal', 8000],
      ['object-B0-N1000', 'root', 'object', 1000],
    ];
    if (reverse) specs.reverse();
    const rows = [],
      unsupported = [];
    for (const [id, host, kind, n] of specs)
      for (const name of reverse
        ? ['legacy', 'candidate', 'base']
        : ['base', 'candidate', 'legacy']) {
        const schema =
          kind === 'object'
            ? { type: 'object' }
            : {
                type: 'array',
                ...(kind === 'BN' || kind === 'terminal'
                  ? { items: { type: 'number' } }
                  : {}),
                ...(kind === 'terminal'
                  ? name === 'legacy'
                    ? { terminal: true }
                    : { options: { terminal: true } }
                  : {}),
              };
        const jsonSchema =
          host === 'nested'
            ? { type: 'object', properties: { list: schema } }
            : schema;
        const values = Array.from({ length: n }, (_, i) => i);
        const expected =
          kind === 'object'
            ? Object.fromEntries(values.map((value) => ['k' + value, value]))
            : host === 'nested'
              ? { list: values }
              : values;
        if (name === 'legacy' && kind === 'itemless') {
          let rejected = false;
          try { engines.legacy.nodeFromJSONSchema({ jsonSchema, defaultValue: structuredClone(expected) }); }
          catch (error) {
            assert.ok(error.message.includes("Array must have 'items' or 'prefixItems' defined."));
            rejected = true; unsupported.push({ id, engine: name, reason: error.message });
          }
          assert.ok(rejected, 'Legacy support changed; re-evaluate the reference lane');
          continue;
        }
        const samplesMs = [],
          observations = [];
        for (let sample = -20; sample < 100; sample++) {
          const input = structuredClone(expected);
          let callbacks = 0,
            lastChange;
          const props = {
            jsonSchema,
            defaultValue: input,
            validationMode: 0,
            onChange: (value) => {
              callbacks++;
              lastChange = value;
            },
          };
          const start = performance.now();
          const root =
            name === 'legacy'
              ? engines.legacy.nodeFromJSONSchema(props)
              : engines[name].buildFieldNodeTree(props);
          if (name !== 'legacy') engines[name].mountFieldNode(root);
          materializeMountedValues(root);
          const end = performance.now();
          const target = host === 'nested' ? root.find('/list') : root;
          const children = Array.from(target.children ?? [], child => child?.node ?? child);
          assert.equal(children.length, kind === 'BN' ? n : 0);
          assert.equal(name === 'legacy' ? target.group : target.strategy, kind === 'terminal' ? 'terminal' : 'branch');
          const targetExpected = host === 'nested' ? expected.list : expected;
          assert.deepEqual(target.value, targetExpected);
          assert.deepEqual(Object.keys(target.value), Object.keys(targetExpected));
          for (let index = 0; index < children.length; index++) {
            assert.equal(children[index].name, String(index));
            assert.equal(children[index].path, target.path + '/' + index);
            assert.equal(children[index].value, targetExpected[index]);
          }
          const noLazyWorkAfterClock = [root, target, ...children].every(
            (node) =>
              !node.__strategy__ ||
              !(
                node.__strategy__.__expired__ === true &&
                node.__strategy__.__locked__ !== true &&
                node.__strategy__.__composedValid__ === false
              ),
          );
          assert.ok(noLazyWorkAfterClock);
          assert.deepEqual(root.value, expected);
          assert.deepEqual(input, expected);
          assert.deepEqual(Object.keys(root.value), Object.keys(expected));
          const callbacksAtEnd = callbacks;
          assert.equal(callbacks, name === 'legacy' ? 0 : 1);
          if (callbacks) assert.deepEqual(lastChange, expected);
          const captured = structuredClone(root.value);
          await new Promise((resolve) =>
            setTimeout(() => setTimeout(resolve, 0), 0),
          );
          assert.deepEqual(root.value, captured);
          assert.deepEqual(target.value, targetExpected);
          for (let index = 0; index < children.length; index++) assert.equal(children[index].value, targetExpected[index]);
          assert.deepEqual(input, expected);
          assert.equal(callbacks, callbacksAtEnd);
          if (sample >= 0) {
            samplesMs.push(end - start);
            observations.push({
              immediate: true,
              full: true,
              stable: true,
              caller: true,
              order: true,
              noLazyWorkAfterClock,
              callbacksAtEnd,
              callbacksAfterDrain: callbacks,
              asynchronous: false,
            });
          }
        }
        const sorted = [...samplesMs].sort((a, b) => a - b);
        rows.push({
          id,
          runtime,
          engine: name,
          round,
          warmups: 20,
          samplesMs,
          observations,
          medianMs: (sorted[49] + sorted[50]) / 2,
          correctnessFailures: 0,
          asyncAfterEndpoint: 0,
          callbackCount: name === 'legacy' ? 0 : 1,
          drainStable: true,
        });
      }
    const file = write('measure-' + runtime + '-' + round + '.json', {
      rows,
      unsupported,
      runtime,
      version: process.versions.bun ?? process.version,
      round,
      reverse,
      manifestPath,
    });
    console.log(
      JSON.stringify({
        file,
        rows: rows.map(({ id, engine, medianMs }) => ({
          id,
          engine,
          medianMs,
        })),
        unsupported: unsupported.length,
      }),
    );
  } else throw new Error('Unknown mode: ' + mode);
}
