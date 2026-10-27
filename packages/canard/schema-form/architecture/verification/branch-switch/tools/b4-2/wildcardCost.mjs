import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Session } from 'node:inspector/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { writeHeapSnapshot } from 'node:v8';

import { HeapGraph } from '../../../perf-optimization/first-batch/c-d/heap-graph.mjs';
import { createSlotRecorder } from './recorder.mjs';

// Supplemental accounting for the approved literal-star latent-path exception.
process.env.NODE_ENV = 'production';

assert.ok(globalThis.gc, 'Node --expose-gc required');
const bundle = path.resolve(process.argv[2]),
  output = path.resolve(process.argv[3]);
const recorder = createSlotRecorder();
globalThis.__b0 = recorder;
const M = await import(pathToFileURL(bundle));
const stores = [
  'literalStarRaw',
  'literalStarRawMetadata',
  'literalStarValueEntries',
  'literalStarValuesMemo',
];
const stages = ['captureExitedRaw', 'setLatentRaw', 'updateInactiveValuesMemo'];

/** Prepare a fresh tree; optionally hide its descendant outside accounting. */
const make = (name, hideDescendant = true) => {
  recorder.enabled = false;
  const root = M.buildFieldNodeTree({
    jsonSchema: {
      type: 'object',
      properties: {
        hostOpen: { type: 'boolean' },
        xOpen: { type: 'boolean' },
        otherOpen: { type: 'boolean' },
        [name]: {
          type: 'object',
          controls: { active: '../hostOpen' },
          properties: {
            x: { type: 'string', controls: { active: '../../xOpen' } },
          },
        },
        other: {
          type: 'object',
          controls: { active: '../otherOpen' },
          properties: { x: { type: 'string' } },
        },
      },
    },
    onChange() {},
    unsetOnInactive: false,
  });
  M.mountFieldNode(
    root,
    {
      hostOpen: true,
      xOpen: true,
      otherOpen: true,
      [name]: { x: 'held' },
      other: { x: 'live match' },
    },
    undefined,
    { deferValidation: true },
  );
  const host = root.children.find((node) => node.name === name);
  if (hideDescendant) root.find('/xOpen').setValue(false);
  return { root, host };
};

/** Report each departure separately, with source construction excluded. */
const calls = (name, phase) => {
  const samples = [];
  for (let index = -20; index < 100; index++) {
    const state = make(name, phase === 'close-host');
    recorder.reset();
    recorder.enabled = true;
    state.root
      .find(phase === 'close-host' ? '/hostOpen' : '/xOpen')
      .setValue(false);
    recorder.enabled = false;
    if (index >= 0)
      samples.push(
        Object.fromEntries(
          stages.map((stage) => [stage, recorder.metrics[stage]?.calls ?? 0]),
        ),
      );
  }
  fs.writeFileSync(
    output + '.' + name.replace('*', 'star') + '.' + phase + '.calls.raw.json',
    JSON.stringify(samples),
  );
  return {
    phase,
    warmups: 20,
    writes: 100,
    callsPerWrite: Object.fromEntries(
      stages.map((stage) => {
        const counts = samples.map((sample) => sample[stage]);
        return [
          stage,
          { minimum: Math.min(...counts), maximum: Math.max(...counts) },
        ];
      }),
    ),
  };
};

/** Measure each store's exclusive dominator bytes and the complete held fixture. */
const memory = async (name) => {
  globalThis.__B4_FALLBACK_FIXTURE = make(name);
  globalThis.__B4_FALLBACK_FIXTURE.root.find('/hostOpen').setValue(false);
  const session = new Session();
  session.connect();
  await session.post('Runtime.enable');
  await session.post('HeapProfiler.enable');
  globalThis.gc();
  globalThis.gc();
  const file = output + '.' + name.replace('*', 'star') + '.heapsnapshot';
  writeHeapSnapshot(file);
  const graph = HeapGraph.read(file),
    analysis = graph.dominators();
  const objects = [];
  // Resolve IDs after the snapshot so inspector references cannot change dominance.
  for (const store of stores) {
    const result = await session.post('Runtime.evaluate', {
      expression:
        'globalThis.__B4_FALLBACK_FIXTURE.root.runtime[' +
        JSON.stringify(store) +
        ']',
      objectGroup: 'b4-fallback-stores',
    });
    if (!result.result.objectId) {
      objects.push({
        store,
        entries: 0,
        shallowBytes: 0,
        exclusiveRetainedBytes: 0,
      });
      continue;
    }
    const id = await session.post('HeapProfiler.getHeapObjectId', {
      objectId: result.result.objectId,
    });
    let index = -1;
    for (let node = 0; node < graph.n; node++)
      if (String(graph.id(node)) === id.heapSnapshotObjectId) {
        index = node;
        break;
      }
    assert.ok(index >= 0, store + ' is in the snapshot');
    objects.push({
      store,
      entries: globalThis.__B4_FALLBACK_FIXTURE.root.runtime[store].size,
      shallowBytes: graph.size(index),
      exclusiveRetainedBytes: graph.retained[index],
    });
  }
  await session.post('Runtime.releaseObjectGroup', {
    objectGroup: 'b4-fallback-stores',
  });
  session.disconnect();
  const retainedBytes = graph.retained[graph.anchor('__B4_FALLBACK_FIXTURE')];
  if (name === '*') {
    globalThis.__B4_FALLBACK_FIXTURE.root.find('/otherOpen').setValue(false);
    assert.deepEqual(
      globalThis.__B4_FALLBACK_FIXTURE.host.inactiveValues,
      [],
      'Unread old host keeps its final publication',
    );
  }
  return { stores: objects, fixtureRetainedBytes: retainedBytes, analysis };
};
fs.mkdirSync(path.dirname(output), { recursive: true });
const sample = async (name) => ({
  name,
  phases: ['hide-descendant', 'close-host'].map((phase) => calls(name, phase)),
  ...(await memory(name)),
});
const normal = await sample('group');
const wildcard = await sample('*');
for (const phase of normal.phases)
  for (const stage of stages)
    assert.equal(phase.callsPerWrite[stage].maximum, 0);
assert.ok(wildcard.phases[0].callsPerWrite.setLatentRaw.minimum > 0);
assert.ok(wildcard.phases[0].callsPerWrite.captureExitedRaw.minimum > 0);
const report = {
  node: process.version,
  normal,
  wildcard,
  fixtureByteDifference:
    wildcard.fixtureRetainedBytes - normal.fixtureRetainedBytes,
  method:
    'Fresh-tree descendant-hide and host-close calls, each with 20 warmups/100 counted writes; V8 strong-edge dominators for each legacy store and one root-plus-old-host fixture after both departures. Store bytes exclude objects shared between stores; fixture bytes include shared bookkeeping and held source nodes. The two fixtures differ only in the host name. A blueprint subtree containing a literal-star child uses the literal-star publication compatibility path; no timing adoption claim.',
};
fs.writeFileSync(output + '.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
