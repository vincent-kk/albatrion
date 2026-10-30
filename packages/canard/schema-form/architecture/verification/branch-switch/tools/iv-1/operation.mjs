// One write per stage sample; fixture creation and assertions stay outside clocks.
import assert from 'node:assert/strict';

import { buildFixture } from '../../../design-optimization/tools/fixtures.mjs';
import { materialize } from '../../../design-optimization/tools/helpers/materialize.mjs';
import { setupBranchOperation } from '../../../design-optimization/tools/helpers/setupBranchOperation.mjs';
import { setupWrite as setupRootWrite } from '../b9-0/operation.mjs';

/** Prepare the canonical nested stages without changing public operation granularity. */
export async function setupWrite(row, mod, legacy = false) {
  if (row.id === 'switch-nested-oneOf-20') {
    const operation = await setupBranchOperation(
      row,
      legacy ? 'legacy' : 'current',
      mod,
    );
    await operation.preflight();
    return {
      ...operation,
      check: operation.checkWrite,
      settle: async () => {
        for (let i = 0; i < 8; i++) await Promise.resolve();
      },
    };
  }
  if (row.id !== 'single-nested-d6-f4') return setupRootWrite(row, mod, legacy);
  const root = legacy
    ? mod.legacyNodeFromJSONSchema({
        jsonSchema: buildFixture(row, true),
        onChange() {},
      })
    : mod.buildFieldNodeTree({ jsonSchema: buildFixture(row), onChange() {} });
  const settle = async () => {
    for (let i = 0; i < 8; i++) await Promise.resolve();
  };
  if (legacy) await settle();
  else
    mod.mountFieldNode(root, undefined, undefined, { deferValidation: false });
  materialize(root);
  const leaf = root.find('/n0/n0/n0/n0/n0/n0');
  assert.ok(leaf);
  let count = 0;
  let last = leaf.value;
  return {
    root,
    settle,
    write() {
      leaf.setValue((last = 'iv1-' + ++count));
    },
    check() {
      assert.equal(leaf.value, last);
      assert.equal(root.value.n0.n0.n0.n0.n0.n0, last);
    },
  };
}
