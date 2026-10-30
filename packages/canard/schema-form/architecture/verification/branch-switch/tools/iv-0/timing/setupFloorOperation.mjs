import assert from 'node:assert/strict';

import { setupWrite } from '../../b9-0/operation.mjs';
import { rows } from '../../b9-0/rows.mjs';

/**
 * Use one canonical fixture for no-op, one-leaf and shape-switch writes.
 * @param {string} rowId - Canonical B9 floor or protected oneOf row
 * @param {string} variant - Independently prepared noop, leaf or switch operation
 * @param {any} engine - Plain or instrumented engine with identical product logic
 * @returns Promise of a synchronous write and its untimed correctness check
 */
export async function setupFloorOperation(rowId, variant, engine) {
  assert.ok(['noop', 'leaf', 'switch'].includes(variant));
  const row = rows.find((entry) => entry.id === rowId);
  assert.ok(row);
  const operation = await setupWrite(row, engine);
  if (variant === 'switch') return operation;
  const leaf = operation.root.find(
    variant === 'noop'
      ? row.shape === 'siblings'
        ? '/type'
        : '/kind'
      : row.shape === 'siblings'
        ? '/x'
        : '/common',
  );
  assert.ok(leaf);
  const initial = leaf.value;
  let last = initial,
    iteration = 0;
  return {
    root: operation.root,
    write() {
      last = variant === 'noop' ? initial : 'leaf-' + ++iteration;
      leaf.setValue(last);
    },
    check() {
      assert.equal(leaf.value, last);
      assert.equal(operation.root.value[leaf.name], last);
    },
  };
}
