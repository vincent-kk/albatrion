// Run outside the timing samples; delivery inputs expose the existing tree factory.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { collectRetainedNodes } from './collectRetainedNodes.mjs';

process.env.NODE_ENV = 'production';
const options = Object.fromEntries(
  process.argv.slice(2).map((argument) => {
    const match = /^--(baseline|candidate|output)=(.+)$/.exec(argument);
    assert.ok(match);
    return [match[1], path.resolve(match[2])];
  }),
);
const report = {};
for (const lane of ['baseline', 'candidate']) {
  const M = await import(pathToFileURL(options[lane]));
  const root = M.fieldNodeFactory(
    M.blueprint({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        group: {
          type: 'object',
          controls: { active: '../open' },
          properties: {
            childOpen: { type: 'boolean' },
            leaf: { type: 'string' },
            held: { type: 'string', controls: { active: '../childOpen' } },
            list: {
              type: 'array',
              items: {
                type: 'object',
                properties: { text: { type: 'string' } },
              },
            },
          },
        },
      },
    }),
    {
      diagnostics: { status: 'stable' },
      misfitPaths: new M.PathKeyedSet(),
      unsetOnInactive: false,
    },
  );
  M.mountFieldNode(
    root,
    {
      open: true,
      group: {
        childOpen: true,
        leaf: 'kept',
        held: 'hidden',
        list: [{ text: 'first' }],
        extra: { retained: true },
      },
    },
    M.SetValueOption.Overwrite,
  );
  root.find('/group/childOpen').setValue(false);
  const initial = collectRetainedNodes(root).length;
  const rows = [];
  for (let cycle = 1; cycle <= 64; cycle++) {
    const previous = root.find('/group');
    root.find('/open').setValue(false);
    const closed = collectRetainedNodes(root).length;
    assert.equal(root.inactiveSlots.size, 1);
    root.find('/open').setValue(true);
    const reachable = collectRetainedNodes(root);
    assert.equal(reachable.includes(previous), false);
    assert.equal(root.inactiveSlots.size, 0);
    assert.equal(root.inactiveSlotOverlays?.size ?? 0, 0);
    assert.equal(reachable.length, initial);
    assert.equal(
      root.inactiveValues.some((entry) => entry.path === '/group'),
      false,
    );
    rows.push({
      cycle,
      closed,
      open: reachable.length,
      oldReachable: false,
      activeSlots: 0,
    });
  }
  report[lane] = {
    initial,
    cycles: rows.length,
    min: Math.min(...rows.map((row) => row.open)),
    max: Math.max(...rows.map((row) => row.open)),
    rows,
  };
}
fs.writeFileSync(options.output, JSON.stringify(report, null, 2) + '\n');
console.log(
  'B11_RETENTION_OK ' +
    JSON.stringify(
      Object.fromEntries(
        Object.entries(report).map(([lane, { initial, cycles, min, max }]) => [
          lane,
          { initial, cycles, min, max },
        ]),
      ),
    ),
);
