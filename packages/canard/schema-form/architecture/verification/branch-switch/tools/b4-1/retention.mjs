import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { writeHeapSnapshot } from 'node:v8';

import { buildBranchRows } from '../../../design-optimization/tools/helpers/buildBranchRows.mjs';
import { setupWrite } from '../../../design-optimization/tools/profile/branch-switch/setupWrite.mjs';
import { HeapGraph } from '../../../perf-optimization/first-batch/c-d/heap-graph.mjs';

// Invoked once per fixture in Node --expose-gc; V8 dominators measure slot-owned bytes.
process.env.NODE_ENV = 'production';

const options = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const match = /^--(bundle|row|output)=(.+)$/.exec(arg);
    assert.ok(match, 'Expected bundle, row and output');
    return [match[1], match[2]];
  }),
);
const row = buildBranchRows().find((row) => row.id === options.row);
assert.ok(row && globalThis.gc);
const module = await import(pathToFileURL(path.resolve(options.bundle)));
let root;
const operation = await setupWrite(row, {
  ...module,
  buildFieldNodeTree(...args) {
    root = module.buildFieldNodeTree(...args);
    return root;
  },
});
for (let index = 0; index < 120; index++) operation.write();
operation.checkWrite();
globalThis.__B4_TREE = root;
const hosts = [];
const visit = (node) => {
  if (node.inactiveSlots?.size) {
    let nodes = 0;
    const count = (source) => {
      nodes++;
      for (const child of Object.values(source.structure ?? {})) count(child);
      for (const sourceChild of source.inactiveSlots?.values() ?? [])
        count(sourceChild);
    };
    for (const source of node.inactiveSlots.values()) count(source);
    hosts.push({
      path: node.path,
      slots: node.inactiveSlots.size,
      retainedNodes: nodes,
    });
  }
  for (const child of Object.values(node.structure ?? {})) visit(child);
};
visit(root);
// A host path labels a heap object; storing its Map elsewhere would change dominance.
const measure = (label, trackedHeapIds = []) => {
  globalThis.gc();
  globalThis.gc();
  const file = path.resolve(options.output + '.' + label + '.heapsnapshot');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  writeHeapSnapshot(file);
  const graph = HeapGraph.read(file);
  const analysis = graph.dominators();
  const maps = [];
  for (let index = 0; index < graph.n; index++) {
    if (graph.name(index) !== 'FieldNode' || graph.type(index) !== 'object')
      continue;
    let map, nodePath;
    for (
      let edge = graph.start[index];
      edge < graph.start[index + 1];
      edge += graph.es
    ) {
      if (graph.edgeType(edge) !== 'property') continue;
      if (graph.edgeName(edge) === 'inactiveSlots') map = graph.target(edge);
      if (graph.edgeName(edge) === 'storedPath')
        nodePath = graph.name(graph.target(edge));
    }
    if (map !== undefined && graph.name(map) === 'Map')
      maps.push({
        path: nodePath,
        heapId: graph.id(map),
        retainedNodeHeapIds: graph.rpo
          .filter((index) => {
            if (
              graph.name(index) !== 'FieldNode' ||
              graph.type(index) !== 'object'
            )
              return false;
            let owner = index;
            while (owner !== map && owner !== 0) owner = graph.idom[owner];
            return owner === map;
          })
          .map((index) => graph.id(index)),
        bytes: graph.retained[map],
        shallowBytes: graph.size(map),
      });
  }
  return {
    label,
    analysis,
    matchingNumericHeapIds: trackedHeapIds.filter((id) =>
      graph.rpo.some((index) => graph.id(index) === id),
    ),
    hosts: hosts.map((host) => {
      const matches = maps.filter((entry) => entry.path === host.path);
      assert.equal(matches.length, 1, 'One live owning host per fixture path');
      return { ...host, ...matches[0] };
    }),
  };
};
const unread = measure('unread');
void root.inactiveValues;
const read = measure('read');
const trackedHeapIds = read.hosts.flatMap((host) => [
  host.heapId,
  ...host.retainedNodeHeapIds,
]);
root.resetSubtree();
await new Promise(setImmediate);
hosts.length = 0;
visit(root);
const reset = measure('reset', trackedHeapIds);
console.log(
  JSON.stringify({
    row: row.id,
    node: process.version,
    unread,
    read,
    lifetime: {
      writesBeforeSnapshot: 120,
      release: 'resetSubtree followed by delivery drain and two full GCs',
      trackedHeapIds,
      identity:
        'Numeric IDs may be reused across independent snapshots; matches do not establish object survival or collection',
      reset,
      limitation:
        'Only objects exclusively dominated by each slot Map are tracked; externally retained detached nodes are outside this byte estimate. Nested slot Map sizes may overlap and must not be summed.',
    },
    method:
      'V8 strong-edge immediate dominators; bytes exclusively retained by each inactiveSlots Map, including detached source trees; shared blueprints excluded',
  }),
);
