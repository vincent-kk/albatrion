/**
 * Intersect allowed kinds while preserving integer as a subset of number.
 * @param {object} left The node's current allowed specification.
 * @param {object} right An active gate's allowed specification.
 * @returns {object} A narrowed specification, reusing left when unchanged.
 */
export function intersectSpec(left, right) {
  const kinds = [];
  for (const kind of left.kinds) {
    if (right.kinds.includes(kind) || kind === 'integer' && right.kinds.includes('number')) kinds.push(kind);
    else if (kind === 'number' && right.kinds.includes('integer')) kinds.push('integer');
  }
  const nullable = left.nullable && right.nullable;
  if (nullable === left.nullable && kinds.length === left.kinds.length && kinds.every((kind, index) => kind === left.kinds[index])) return left;
  return { kinds, nullable };
}
