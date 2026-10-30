// Compare actual mount and write deliveries on both first-load routes and observer states.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

import {
  allNodes,
  drain,
  encode,
} from '../../../perf-optimization/first-batch/c-d/c-common.mjs';

const output = path.resolve(process.argv[2]);
const modules = await Promise.all(
  ['baseline', 'candidate'].map(
    (name) => import(pathToFileURL(path.join(output, name + '.mjs'))),
  ),
);
const schema = {
  type: 'object',
  properties: { x: { type: 'number' }, y: { type: 'string' } },
};
const observe = (root, events) => ({
  value: encode(root.value),
  output: encode(root.outputValue),
  events: structuredClone(events),
  nodes: allNodes(root).map((node) => ({
    path: node.path,
    value: encode(node.value),
    output: encode(node.outputValue),
    state: encode(node.state),
    detached: node.detached,
    revision: node.revision(),
    bits: Array.from({ length: 17 }, (_, bit) => node.revision(2 ** bit)),
  })),
});
const rows = [],
  differences = [];
for (const route of ['static-first', 'generic'])
  for (const observation of ['unobserved', 'revision', 'listener']) {
    const variants = [];
    for (const M of modules) {
      const events = [];
      const root = M.fieldNodeFactory(M.blueprint(schema), {
        diagnostics: { status: 'stable' },
        loadSnapshot: undefined,
        latentRaw: new M.PathKeyedMap('pair'),
        misfitPaths: new M.PathKeyedSet(),
        inactiveValuesMemo: new M.PathKeyedMap('path'),
        onChange: (value) =>
          events.push({ kind: 'onChange', value: encode(value) }),
      });
      if (observation === 'revision') assert.equal(root.revision(), 0);
      if (observation === 'listener')
        root.subscribe((...args) =>
          events.push({ kind: 'root', args: encode(args) }),
        );
      M.mountFieldNode(
        root,
        route === 'generic' ? { x: 0, y: '' } : undefined,
        M.SetValueOption.Overwrite,
        { deferValidation: true },
      );
      assert.equal(
        Boolean(root.runtime.settlementScratch),
        route === 'generic',
        'Actual mount route',
      );
      root.find('/x').setValue(1);
      root.find('/x').setValue(2);
      await drain();
      const phases = [observe(root, events)];
      for (const node of allNodes(root))
        node.subscribe((...args) =>
          events.push({ kind: 'event', path: node.path, args: encode(args) }),
        );
      root.find('/x').setValue(3);
      root.setValue({ x: 4, y: 'changed' });
      await drain();
      phases.push(observe(root, events));
      variants.push(phases);
    }
    const same = isDeepStrictEqual(variants[0], variants[1]);
    const id = route + '-' + observation;
    rows.push({ id, same, phases: 2 });
    if (!same)
      differences.push({ id, baseline: variants[0], candidate: variants[1] });
  }
fs.writeFileSync(
  path.join(output, 'mount-differences.json'),
  JSON.stringify(differences, null, 2) + '\n',
);
const report = {
  kind: 'B4-public-mount-delivery',
  rows,
  phases: 12,
  differences: differences.length,
};
fs.writeFileSync(
  path.join(output, 'mount-summary.json'),
  JSON.stringify(report, null, 2) + '\n',
);
console.log(JSON.stringify(report));
if (differences.length) process.exitCode = 1;
