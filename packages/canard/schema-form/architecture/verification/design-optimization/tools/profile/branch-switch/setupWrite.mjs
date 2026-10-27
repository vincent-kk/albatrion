import assert from 'node:assert/strict';

import { buildFixture } from '../../fixtures.mjs';
import { materialize } from '../../helpers/materialize.mjs';
import { setupBranchOperation } from '../../helpers/setupBranchOperation.mjs';

/** Prepare a synchronous single-write fixture with assertions outside the timing interval. */
export async function setupWrite(row, mod) {
  if (row.shape !== 'siblings') {
    const expanded = {
      ...row,
      shape: 'branch-switch',
      gate: row.gate ?? 'active',
      payload: row.payload ?? 3,
    };
    const operation = await setupBranchOperation(expanded, 'current', mod);
    await operation.preflight();
    return operation;
  }
  const root = mod.buildFieldNodeTree({
    jsonSchema: buildFixture(row),
    onChange() {},
  });
  mod.mountFieldNode(root, undefined, undefined, { deferValidation: false });
  materialize(root);
  const expected = structuredClone(root.value);
  const leaf = root.find('/type');
  let value = 'a';
  return {
    write() {
      value = value === 'a' ? 'b' : 'a';
      leaf.setValue(value);
    },
    checkWrite() {
      assert.deepEqual(root.value, { ...expected, type: value });
    },
  };
}
