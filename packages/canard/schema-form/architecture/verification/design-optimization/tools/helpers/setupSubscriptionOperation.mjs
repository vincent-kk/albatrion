import assert from 'node:assert/strict';

import { buildFixture } from '../fixtures.mjs';
import { setup } from '../profile/fixtures.mjs';
import { materialize } from './materialize.mjs';

/** Use the same wave and ten-write subscribed fixtures as the B1 candidate windows. */
export function setupSubscriptionOperation(row, mod) {
  if (row.id === 'wave-1000')
    return { run: setup('wave', 'current', { current: mod }), check() {} };
  assert.equal(row.id, 'single-flat-1000-subscribed');
  const root = mod.buildFieldNodeTree({
    jsonSchema: buildFixture({ shape: 'flat', n: 1000 }),
    onChange() {},
  });
  mod.mountFieldNode(root, undefined, undefined, { deferValidation: false });
  materialize(root);
  assert.equal(root.children.length, 1000);
  let deliveries = 0;
  let iteration = 0;
  let before = 0;
  for (const child of root.children) child.subscribe(() => deliveries++);
  const leaves = Array.from({ length: 10 }, (_, i) =>
    root.find(`/field_${String(i).padStart(3, '0')}`),
  );
  assert.ok(leaves.every(Boolean));
  return {
    run() {
      before = deliveries;
      iteration++;
      for (let i = 0; i < 10; i++)
        leaves[i].setValue(`changed-${iteration}-${i}`);
    },
    check() {
      assert.equal(deliveries - before, 10);
      assert.equal(leaves[9].value, `changed-${iteration}-9`);
    },
  };
}
