import assert from 'node:assert/strict';

import { buildFixture } from '../../../../design-optimization/tools/fixtures.mjs';
import { materialize } from '../../../../design-optimization/tools/helpers/materialize.mjs';
import { setupWrite } from '../../b9-0/operation.mjs';
import { rows } from '../../b9-0/rows.mjs';

/**
 * Build one canonical form and expose its synchronous operation plus untimed check.
 * @param {string} rowId One of the three diagnostic fixture IDs.
 * @param {any} engine Plain production engine with private form-build and mount fixture exports.
 * @returns OneOf round trip, siblings write or flat leaf write with writes-per-operation metadata.
 * @throws If a fixture, required leaf or expected output is missing or inconsistent.
 */
export async function setupOperation(rowId, engine) {
  if (rowId !== 'single-flat-1000') {
    const row = rows.find((entry) => entry.id === rowId);
    assert.ok(row);
    const operation = await setupWrite(row, engine);
    return {
      writes: row.shape === 'oneOf' ? 2 : 1,
      run() {
        operation.write();
        if (row.shape === 'oneOf') operation.write();
      },
      check: operation.check,
    };
  }
  const root = engine.buildFieldNodeTree({
    jsonSchema: buildFixture({ shape: 'flat', n: 1000 }),
    onChange() {},
  });
  engine.mountFieldNode(root, undefined, undefined, { deferValidation: false });
  materialize(root);
  const leaf = root.find('/field_000');
  assert.ok(leaf);
  let iteration = 0;
  return {
    writes: 1,
    run() {
      leaf.setValue('profile-' + ++iteration);
    },
    check() {
      assert.equal(leaf.value, 'profile-' + iteration);
      assert.equal(root.value.field_000, leaf.value);
      assert.equal(Object.keys(root.value).length, 1000);
    },
  };
}
