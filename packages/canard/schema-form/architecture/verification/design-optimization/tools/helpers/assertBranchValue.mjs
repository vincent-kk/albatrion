import assert from 'node:assert/strict';

/** Assert the exact active host shape and every default payload value, excluding inactive branches. */
export function assertBranchValue(root, row, index) {
  const value = row.hostPath ? root.value.outer.inner : root.value;
  const expected = { common: 'shared', kind: `kind_${index}` };
  for (let j = 0; j < row.payload; j++)
    expected[`payload_${index}_${String.fromCharCode(97 + j)}`] =
      j % 3 === 0 ? `a_${index}` : j % 3 === 1 ? index : index % 2 === 0;
  assert.deepEqual(value, expected, `${row.id}: selected branch ${index}`);
}
