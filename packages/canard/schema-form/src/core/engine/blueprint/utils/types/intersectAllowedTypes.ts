import type { SchemaTypeName } from '../../type';

/**
 * Intersect accepted JSON types while retaining anchor order and integer subsets.
 * @param left - Earlier accepted set; undefined represents unconstrained top
 * @param right - Later accepted set; undefined represents unconstrained top
 * @returns Ordered intersection, with an empty list representing impossibility
 */
export const intersectAllowedTypes = (
  left: readonly SchemaTypeName[] | undefined,
  right: readonly SchemaTypeName[] | undefined,
): readonly SchemaTypeName[] | undefined => {
  if (!left) return right;
  if (!right) return left;
  const result: SchemaTypeName[] = [];
  for (const type of left) {
    const matched = right.includes(type)
      ? type
      : type === 'number' && right.includes('integer')
        ? 'integer'
        : type === 'integer' && right.includes('number')
          ? 'integer'
          : undefined;
    if (matched && !result.includes(matched)) result.push(matched);
  }
  return result;
};
