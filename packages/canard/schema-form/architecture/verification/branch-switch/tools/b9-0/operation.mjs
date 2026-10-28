// Loaded by workers; setup and value assertions remain outside every timed interval.
import assert from 'node:assert/strict';

import { buildFixture } from '../../../design-optimization/tools/fixtures.mjs';
import { materialize } from '../../../design-optimization/tools/helpers/materialize.mjs';

export async function setupWrite(row, mod, legacy = false) {
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
  const initial = structuredClone(root.value);
  const siblings = row.shape === 'siblings';
  const leaf = root.find(siblings ? '/type' : '/kind');
  assert.ok(leaf);
  let last = 0;
  const write = () => {
    last = last === 0 ? (siblings ? 1 : row.n - 1) : 0;
    leaf.setValue(siblings ? (last ? 'b' : 'a') : `kind_${last}`);
  };
  const check = () => {
    if (siblings) {
      assert.deepEqual(root.value, {
        ...initial,
        type: last ? 'b' : 'a',
        ...(legacy ? { x: last ? 'B' : 'A', y: last ? 2 : 1 } : {}),
      });
      return;
    }
    const expected = { common: 'shared', kind: `kind_${last}` };
    for (let i = 0; i < (row.siblings ?? 0); i++) expected[`pad_${i}`] = i;
    for (let i = 0; i < (row.payload ?? 3); i++)
      expected[`payload_${last}_${String.fromCharCode(97 + i)}`] =
        i % 3 === 0 ? `a_${last}` : i % 3 === 1 ? last : last % 2 === 0;
    assert.deepEqual(root.value, expected, row.id);
  };
  check();
  return { root, write, check, settle };
}
