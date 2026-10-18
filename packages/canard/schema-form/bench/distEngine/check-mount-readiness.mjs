// Invoked by Node or Bun; checks canonical mount factories before any public value read can hide lazy mount work.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadDistEngine, loadLegacyEngine } from './loadDistEngine.ts';

const packageRoot = fileURLToPath(new URL('../../', import.meta.url));
const workspaceRoot = path.resolve(packageRoot, '../../..');
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'mount-readiness-guard-'));
fs.symlinkSync(
  path.join(workspaceRoot, 'node_modules'),
  path.join(output, 'node_modules'),
  'dir',
);
const surface =
  process.argv.find((arg) => arg.startsWith('--surface='))?.slice(10) ??
  'adapter';
assert.ok(
  ['adapter', 'first-batch'].includes(surface),
  'Unknown canonical surface',
);
let loadFirstBatch;
if (surface === 'first-batch') {
  const source = path.join(
    packageRoot,
    'architecture/verification/perf-optimization/first-batch/b-a2',
  );
  const target = path.join(output, 'first-batch');
  fs.mkdirSync(target);
  const config = fs.readFileSync(path.join(source, 'config.mjs'), 'utf8');
  const fallback =
    "process.env.MEASURE_WORKTREE ?? path.resolve(SB, '../../../../../../../..')";
  assert.ok(config.includes(fallback), 'First-batch root resolver changed');
  fs.writeFileSync(
    path.join(target, 'config.mjs'),
    config.replace(fallback, JSON.stringify(workspaceRoot)),
  );
  fs.copyFileSync(
    path.join(source, 'bench-common.mjs'),
    path.join(target, 'bench-common.mjs'),
  );
  const names = [
    'blueprint',
    'fieldNodeFactory',
    'PathKeyedMap',
    'PathKeyedSet',
    'mountFieldNode',
    'writeFieldNodeInput',
    'buildFieldNodeTree',
  ];
  fs.writeFileSync(
    path.join(target, 'current-baseline.mjs'),
    fs.readFileSync(path.join(packageRoot, 'dist/index.mjs'), 'utf8') +
      '\nexport { ' +
      names.join(', ') +
      ' };\n',
  );
  fs.writeFileSync(
    path.join(target, 'legacy-baseline.mjs'),
    fs.readFileSync(
      path.join(
        workspaceRoot,
        'node_modules/@canard/schema-form_0.16.1/dist/index.mjs',
      ),
      'utf8',
    ) + '\nexport { nodeFromJSONSchema };\n',
  );
  ({ loadEngine: loadFirstBatch } = await import(
    path.join(target, 'bench-common.mjs')
  ));
}

// Match the terminal-mode probes, including the two array terminal shapes.
const scenes = ['object', 'array'].flatMap((kind) =>
  (kind === 'object'
    ? ['T', 'B0', 'B1', 'BN']
    : ['T', 'T0', 'B0', 'BN']
  ).flatMap((host) =>
    (kind === 'object' ? [100, 1000] : [1000, 8000]).map((n) => ({
      kind,
      host,
      n,
      id: `${kind}-${host}-mount-N${n}`,
    })),
  ),
);

function fixture(spec, legacy) {
  const host = { type: spec.kind };
  if (spec.host === 'T' || spec.host === 'T0') {
    if (legacy) host.terminal = true;
    else host.options = { terminal: true };
  }
  if (spec.kind === 'object' && ['B1', 'BN'].includes(spec.host))
    host.properties = Object.fromEntries(
      Array.from({ length: spec.host === 'B1' ? 1 : spec.n }, (_, i) => [
        'k' + i,
        { type: 'number' },
      ]),
    );
  if (spec.kind === 'array' && ['T', 'BN'].includes(spec.host))
    host.items = { type: 'number' };
  const values = Array.from({ length: spec.n }, (_, i) => i);
  return {
    schema: { type: 'object', properties: { h: host } },
    expected: {
      h:
        spec.kind === 'array'
          ? values
          : Object.fromEntries(values.map((v) => ['k' + v, v])),
    },
  };
}

const childrenOf = (node) =>
  Array.from(node.children ?? [], (child) => child?.node ?? child);
const legacyState = (node) => {
  const strategy = node.__strategy__;
  return strategy
    ? {
        expired: strategy.__expired__ ?? null,
        locked: strategy.__locked__ ?? null,
        composedValid: strategy.__composedValid__ ?? null,
      }
    : null;
};
const needsComposition = (state) =>
  state?.expired === true &&
  state.locked !== true &&
  state.composedValid === false;

function observe(root, spec, expected, legacy) {
  const host = root.find('/h');
  assert.ok(host, 'Missing host at the mount endpoint');
  const children = childrenOf(host);
  assert.deepStrictEqual(root.value, expected);
  assert.deepStrictEqual(host.value, expected.h);
  assert.deepStrictEqual(Object.keys(host.value), Object.keys(expected.h));
  assert.equal(host.path, '/h');
  assert.equal(
    legacy ? host.group : host.strategy,
    ['T', 'T0'].includes(spec.host) ? 'terminal' : 'branch',
  );
  assert.equal(
    children.length,
    spec.host === 'BN' ? spec.n : spec.host === 'B1' ? 1 : 0,
  );
  for (let i = 0; i < children.length; i++) {
    const name = spec.kind === 'array' ? String(i) : 'k' + i;
    assert.equal(children[i].name, name);
    assert.equal(children[i].path, '/h/' + name);
    assert.equal(children[i].value, expected.h[name]);
  }
  return structuredClone({
    value: root.value,
    host: host.value,
    keys: Object.keys(host.value),
    children: children.map((c) => ({
      name: c.name,
      path: c.path,
      value: c.value,
    })),
  });
}

const rows = [];
for (const legacy of [true, false]) {
  let engine;
  if (surface === 'adapter')
    engine = legacy
      ? await loadLegacyEngine(output)
      : await loadDistEngine(output);
  else {
    const firstBatch = await loadFirstBatch(legacy ? 'legacy' : 'current');
    engine = {
      create: (props) =>
        firstBatch.core(props.jsonSchema, props.defaultValue, props.onChange),
    };
  }
  for (const spec of scenes) {
    const { schema, expected } = fixture(spec, legacy);
    const input = structuredClone(expected);
    let callbacks = 0,
      lastChange;
    let root;
    try {
      root = engine.create({
        jsonSchema: schema,
        defaultValue: input,
        validationMode: 0,
        onChange: (v) => {
          callbacks++;
          lastChange = v;
        },
      });
    } catch (error) {
      if (
        legacy &&
        spec.kind === 'array' &&
        ['T0', 'B0'].includes(spec.host) &&
        error.message.includes(
          "Array must have 'items' or 'prefixItems' defined.",
        )
      ) {
        rows.push({ engine: 'legacy', ...spec, status: 'unsupported' });
        continue;
      }
      throw error;
    }
    // Read the counterexample's flags before find/value/children or any await.
    const rootStateAtReturn = legacy ? legacyState(root) : null;
    const hostStateAtReturn = legacy ? legacyState(root.find('/h')) : null;
    if (
      needsComposition(rootStateAtReturn) ||
      needsComposition(hostStateAtReturn)
    ) {
      rows.push({
        engine: 'legacy',
        ...spec,
        status: 'fail',
        reason: 'lazy-composition-at-clock-boundary',
        rootStateAtReturn,
        hostStateAtReturn,
      });
      continue;
    }
    const atReturn = observe(root, spec, expected, legacy);
    assert.deepStrictEqual(input, expected, 'Mount changed caller input');
    if (callbacks) assert.deepStrictEqual(lastChange, expected);
    const callbacksAtReturn = callbacks;
    await new Promise((resolve) => setTimeout(() => setTimeout(resolve, 0), 0));
    assert.deepStrictEqual(
      observe(root, spec, expected, legacy),
      atReturn,
      'Mount state changed after the endpoint',
    );
    assert.deepStrictEqual(
      input,
      expected,
      'Deferred mount changed caller input',
    );
    assert.equal(
      callbacks,
      callbacksAtReturn,
      'Initial callback was deferred past the endpoint',
    );
    assert.equal(
      callbacks,
      legacy ? 0 : 1,
      'Preserve the known initial callback difference',
    );
    rows.push({
      engine: legacy ? 'legacy' : 'current',
      ...spec,
      status: 'pass',
      rootStateAtReturn,
      hostStateAtReturn,
      callbacksAtReturn,
      callbacksAfterDrain: callbacks,
    });
  }
}
const result = {
  kind: 'correctness-only readiness guard',
  surface,
  sources: Object.fromEntries(
    [
      path.join(packageRoot, 'bench/distEngine/loadDistEngine.ts'),
      path.join(
        packageRoot,
        'architecture/verification/perf-optimization/first-batch/b-a2/bench-common.mjs',
      ),
    ].map((file) => [
      file,
      createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
    ]),
  ),
  runtime: {
    name: process.versions.bun ? 'bun' : 'node',
    version: process.versions.bun ?? process.version,
  },
  timestamp: new Date().toISOString(),
  output,
  rows,
};
fs.writeFileSync(
  path.join(output, 'result.json'),
  JSON.stringify(result, null, 2) + '\n',
);
const failures = rows.filter((r) => r.status === 'fail');
console.log(
  JSON.stringify({
    output,
    surface,
    runtime: result.runtime,
    passed: rows.filter((r) => r.status === 'pass').length,
    unsupported: rows.filter((r) => r.status === 'unsupported').length,
    failed: failures.length,
    firstFailure: failures[0] ?? null,
  }),
);
if (failures.length) process.exitCode = 1;
