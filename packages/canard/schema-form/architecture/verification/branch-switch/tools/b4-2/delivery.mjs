import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

import {
  allNodes,
  drain,
  encode,
  fixture,
  invoke,
  scenes,
} from '../../../perf-optimization/first-batch/c-d/c-common.mjs';

// Reuse the first-batch C fixture corpus and public observer for the two storage models.
process.env.NODE_ENV = 'production';

const values = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const match = /^--(baseline|candidate|output)=(.+)$/.exec(arg);
    assert.ok(match);
    return [match[1], path.resolve(match[2])];
  }),
);
fs.mkdirSync(values.output, { recursive: true });
const extra = [
  'blueprint',
  'fieldNodeFactory',
  'PathKeyedMap',
  'PathKeyedSet',
  'mountFieldNode',
  'writeFieldNodeInput',
  'getControlLayers',
  'readExitLayerPolicy',
];
const engines = [];
for (const variant of ['baseline', 'candidate']) {
  const source = fs.readFileSync(values[variant], 'utf8');
  const exported = source.slice(source.lastIndexOf('export {'));
  const names = extra.filter(
    (name) => !new RegExp(`\\b${name}\\s*(?:,|\\s|})`).test(exported),
  );
  const target = path.join(values.output, variant + '.mjs');
  fs.writeFileSync(target, source + '\nexport { ' + names.join(', ') + ' };\n');
  engines.push({
    M: await import(pathToFileURL(target)),
    variant,
    sha256: createHash('sha256').update(source).digest('hex'),
  });
}
const prepare = async (engine, spec) => {
  const { M } = engine;
  const { schema, input } = spec.fixture ?? fixture(spec);
  const deliveries = [];
  const held = [],
    known = new WeakSet();
  const ids = new WeakMap();
  let nonce = 0;
  const id = (node) => {
    if (!node) return null;
    if (!ids.has(node)) ids.set(node, nonce++);
    return ids.get(node);
  };
  const eventValue = (value, seen = new Map()) => {
    if (value?.blueprintNode && value?.runtime)
      return { $node: id(value), path: value.path, detached: value.detached };
    if (!value || typeof value !== 'object') return encode(value);
    if (seen.has(value)) return { $ref: seen.get(value) };
    seen.set(value, seen.size);
    if (Array.isArray(value))
      return value.map((entry) => eventValue(entry, seen));
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, eventValue(value[key], seen)]),
    );
  };
  const root = M.fieldNodeFactory(M.blueprint(schema), {
    ...(engine.variant === 'baseline' ? { slots: 'off' } : {}),
    diagnostics: { status: 'stable' },
    loadSnapshot: undefined,
    misfitPaths: new M.PathKeyedSet(),
    unsetOnInactive: true,
    onChange: (value) =>
      deliveries.push({ kind: 'onChange', value: eventValue(value) }),
  });
  M.mountFieldNode(root, structuredClone(input), M.SetValueOption.Overwrite);
  assert.equal(root.find('/h').children.length, spec.C);
  await drain();
  if (spec.kind === 'latent') {
    for (let index = 0; index < spec.C; index++) {
      const gate = root.find('/h/k' + index + '/gate');
      if (gate) M.writeFieldNodeInput(gate, false, M.SetValueOption.Overwrite);
    }
    await drain();
    assert.equal(root.inactiveValues.length, spec.C - 1);
  }
  if (spec.fixture) {
    assert.equal(root.find('/h').blueprintNode.hasKeepDescendants, true);
    if (spec.host === 'candidate-array')
      assert.equal(root.blueprintNode.hasPropertyCandidates, true);
    if (spec.inactive) {
      M.writeFieldNodeInput(
        root.find('/show'),
        false,
        M.SetValueOption.Overwrite,
      );
      await drain();
      assert.equal(root.inactiveValues.length, 2);
    }
  }
  const subscribe = () => {
    for (const node of allNodes(root))
      if (!known.has(node)) {
        known.add(node);
        held.push(node);
        id(node);
        node.subscribe((...args) =>
          deliveries.push({
            kind: 'event',
            node: id(node),
            path: node.path,
            args: eventValue(args),
          }),
        );
      }
  };
  subscribe();
  deliveries.length = 0;
  return { root, held, deliveries, subscribe, M, id };
};
/** Preserve the established delivery observer while omitting retired physical stores. */
const snapshot = (state) => {
  const { root, held, M } = state;
  for (const node of allNodes(root)) if (!held.includes(node)) held.push(node);
  return {
    values: encode(root.value),
    raw: encode(root.raw),
    inactiveValues: encode(root.inactiveValues),
    committedRules: encode(root.runtime.committedRuleValues),
    declarations: encode(root.runtime.committedDeclarationIds),
    deliveries: structuredClone(state.deliveries),
    nodes: held.map((node) => {
      const groups = M.getControlLayers(node, new Map());
      return {
        path: node.path,
        kind: node.blueprintNode.kind,
        detached: node.detached,
        active: node.active,
        raw: encode(node.raw),
        local: encode(node.value),
        emit: encode(node.outputValue),
        state: encode(node.state),
        inactive: encode(node.inactiveValues),
        revision: node.revision(),
        revisionBits: Array.from({ length: 17 }, (_, index) =>
          node.revision(2 ** index),
        ),
        exitPolicy: {
          clear: M.readExitLayerPolicy(
            groups,
            node.runtime.committedRuleValues,
            node.runtime.unsetOnInactive === true,
          ),
          groups: encode(groups),
          pendingDelivery: encode(node.pendingDelivery),
          pendingRevision: node.pendingRevision,
          revisionLedger: encode(node.revisionLedger),
        },
      };
    }),
  };
};
const observe = (state) => {
  const result = snapshot(state);
  result.nodes.forEach((node, index) => {
    const reference = state.held[index];
    node.identity = state.id(reference);
    node.parent = state.id(reference.parentNode);
    node.children = reference.children?.map(state.id);
  });
  return result;
};
const priorities = [
  { reversePolicy: true, label: 'reverse-same-layer' },
  { fieldsPolicy: true, label: 'fields-clear' },
  { fieldsPolicy: true, nodePolicy: false, label: 'node-keep' },
  { fieldsPolicy: false, nodePolicy: true, label: 'node-clear' },
].map((extra) => ({
  kind: 'overlap',
  F: 4,
  C: 16,
  op: 'exit',
  ...extra,
  id: 'overlap-F4-C16-exit-' + extra.label,
}));
const keepScenes = ['object', 'array', 'candidate-array'].flatMap((host) =>
  [false, true].map((inactive) => {
    const item = {
      type: 'object',
      properties: {
        drop: { type: 'number' },
        keep: {
          type: 'number',
          controls: { active: '#/show', unsetOnInactive: false },
        },
      },
    };
    const items = [
      { drop: 1 },
      { drop: 2, keep: 12 },
      { drop: 3 },
      { keep: 24 },
    ];
    const h = {
      type: host === 'object' ? 'object' : 'array',
      controls: { active: '#/flag', unsetOnInactive: true },
      ...(host === 'object'
        ? {
            properties: Object.fromEntries(
              items.map((_, index) => ['k' + index, item]),
            ),
          }
        : { items: item }),
    };
    const kept =
      host === 'object'
        ? { k1: { keep: 12 }, k3: { keep: 24 } }
        : [{ keep: 12 }, { keep: 24 }];
    return {
      id: `clearing-keep-${host}-${inactive ? 'inactive' : 'live'}`,
      kind: 'clearing-keep',
      host,
      inactive,
      C: 4,
      op: 'exit',
      fixture: {
        schema: {
          type: 'object',
          properties: {
            flag: { type: 'boolean' },
            show: { type: 'boolean' },
            ...(host === 'candidate-array'
              ? { alternate: { type: 'boolean' } }
              : { h }),
          },
          ...(host === 'candidate-array'
            ? {
                allOf: [
                  { controls: { active: './flag' }, properties: { h } },
                  {
                    controls: { active: './alternate' },
                    properties: {
                      h: {
                        type: 'object',
                        properties: { other: { type: 'string' } },
                      },
                    },
                  },
                ],
              }
            : {}),
        },
        input: {
          flag: true,
          show: true,
          ...(host === 'candidate-array' ? { alternate: false } : {}),
          h:
            host === 'object'
              ? Object.fromEntries(
                  items.map((value, index) => ['k' + index, value]),
                )
              : items,
        },
      },
      expectedInactive: [
        { path: `/h/${host === 'object' ? 'k1' : '0'}/keep`, value: 12 },
        { path: `/h/${host === 'object' ? 'k3' : '1'}/keep`, value: 24 },
      ],
      expectedReentry: inactive ? (host === 'object' ? {} : [{}, {}]) : kept,
      expectedRestored: kept,
    };
  }),
);
const literalStarScene = {
  id: 'literal-star-oneOf-live-sibling',
  kind: 'literal-star',
  C: 2,
  op: 'exit',
  fixture: {
    schema: {
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        h: {
          type: 'object',
          properties: { sibling: { type: 'string' } },
          oneOf: [
            {
              controls: { active: '../flag' },
              properties: {
                '*': { type: 'string', controls: { unsetOnInactive: false } },
              },
            },
            {
              controls: { active: '!../flag' },
              properties: { replacement: { type: 'number', default: 7 } },
            },
          ],
        },
      },
    },
    input: { flag: true, h: { sibling: 'live', '*': 'held' } },
  },
  expectedInactive: [{ path: '/h/%2A', value: 'held' }],
  expectedReentry: { sibling: 'live', '*': 'held' },
};
const rows = [],
  differences = [];
for (const spec of [
  ...scenes(),
  ...priorities,
  ...keepScenes,
  literalStarScene,
]) {
  const [a, b] = await Promise.all(
    engines.map((engine) => prepare(engine, spec)),
  );
  const phases = [];
  const compare = (phase) => {
    const left = observe(a),
      right = observe(b);
    const same = isDeepStrictEqual(left, right);
    assert.equal('latentRaw' in b.root.runtime, false);
    assert.equal('literalStarRaw' in b.root.runtime, false);
    if (spec.fixture) {
      for (const state of [a, b]) {
        if (phase === 'after-drain' || phase === 'second-exit-after-drain')
          assert.deepEqual(
            state.root.inactiveValues,
            spec.expectedInactive,
            spec.id + ':' + phase,
          );
        if (phase === 'reentry-after-drain') {
          assert.deepEqual(
            state.root.find('/h').value,
            spec.expectedReentry,
            spec.id,
          );
          assert.deepEqual(
            state.root.inactiveValues,
            spec.inactive ? spec.expectedInactive : [],
            spec.id,
          );
        }
        if (phase === 'keep-gate-open-after-drain') {
          assert.deepEqual(
            state.root.find('/h').value,
            spec.expectedRestored,
            spec.id,
          );
          assert.deepEqual(state.root.inactiveValues, [], spec.id);
        }
        if (spec.kind === 'literal-star')
          assert.equal(state.root.find('/h/sibling').value, 'live');
      }
    }
    phases.push({
      phase,
      same,
      deliveries: left.deliveries.length,
      ...(spec.fixture
        ? { values: left.values, inactiveValues: left.inactiveValues }
        : {}),
    });
    if (!same) differences.push({ scene: spec.id, phase, left, right });
  };
  compare('before');
  invoke(engines[0], spec, a);
  invoke(engines[1], spec, b);
  compare('write-return');
  await drain();
  compare('after-drain');
  if (spec.op === 'exit') {
    const old = [a, b].map((state) =>
      state.held.find(
        (node) => node.detached && node.blueprintNode.kind === 'number',
      ),
    );
    if (!spec.fixture && old[0] && old[1]) {
      for (const [index, state] of [a, b].entries())
        state.M.writeFieldNodeInput(
          old[index],
          9001,
          state.M.SetValueOption.Overwrite,
        );
      compare('detached-write');
      await drain();
      compare('detached-write-after-drain');
    }
    for (const state of [a, b]) {
      state.M.writeFieldNodeInput(
        state.root.find('/flag'),
        true,
        state.M.SetValueOption.Overwrite,
      );
      state.subscribe();
    }
    compare('reentry');
    await drain();
    compare('reentry-after-drain');
    if (spec.kind === 'clearing-keep') {
      for (const state of [a, b]) {
        state.M.writeFieldNodeInput(
          state.root.find('/show'),
          true,
          state.M.SetValueOption.Overwrite,
        );
        state.subscribe();
      }
      compare('keep-gate-open');
      await drain();
      compare('keep-gate-open-after-drain');
    }
    for (const state of [a, b])
      state.M.writeFieldNodeInput(
        state.root.find('/flag'),
        false,
        state.M.SetValueOption.Overwrite,
      );
    compare('second-exit');
    await drain();
    compare('second-exit-after-drain');
  }
  rows.push({ id: spec.id, phases });
}
fs.writeFileSync(
  path.join(values.output, 'differences.json'),
  JSON.stringify(differences, null, 2) + '\n',
);
const report = {
  kind: 'B4-C-public-delivery',
  engines: engines.map(({ variant, sha256 }) => ({ variant, sha256 })),
  rows,
  phases: rows.reduce((sum, row) => sum + row.phases.length, 0),
  differences: differences.length,
  compared: [
    'values',
    'raw/local/emit',
    'inactiveValues',
    'actual events/payloads/order',
    'all revision bits',
    'node lifetimes, parent and child references',
    'committed declarations and rules',
    'detached reads/writes',
    'legacy raw entries still used by candidate',
  ],
};
fs.writeFileSync(
  path.join(values.output, 'summary.json'),
  JSON.stringify(report, null, 2) + '\n',
);
console.log(
  JSON.stringify({
    scenes: rows.length,
    phases: report.phases,
    differences: differences.length,
  }),
);
if (differences.length) process.exitCode = 1;
