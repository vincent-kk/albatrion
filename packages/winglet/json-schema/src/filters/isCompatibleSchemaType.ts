import type { UnknownSchema } from '../types/jsonSchema';

/**
 * Checks if two JSON Schemas have compatible types.
 *
 * Unlike `isIdenticalSchemaType`, this function considers `number` and `integer`
 * as compatible types, and treats nullable differences as compatible.
 *
 * Compatibility rules:
 * - `number` and `integer` are compatible with each other
 * - `[...types, 'null']` is compatible with `[...types]` (nullable compatibility)
 * - `[type]` is equivalent to `type` (single element array equivalence)
 * - `[type, 'null']` is compatible with `type` (nullable single type)
 * - `[]` (empty array) is not compatible with anything, including itself
 * - `['null']` is compatible with `['null']` (null-only arrays are equal)
 *
 * Additional behaviors:
 * - Array element order does not affect compatibility
 * - Only the `type` property is compared; other schema properties are ignored
 * - The function is symmetric: `isCompatibleSchemaType(a, b) === isCompatibleSchemaType(b, a)`
 *
 * @param left - First schema to compare
 * @param right - Second schema to compare
 * @returns `true` if both schemas have compatible types
 *
 * @example
 * // Compatible cases
 * isCompatibleSchemaType({ type: 'number' }, { type: 'integer' }) // true
 * isCompatibleSchemaType({ type: ['string', 'null'] }, { type: 'string' }) // true
 * isCompatibleSchemaType({ type: ['string'] }, { type: 'string' }) // true
 * isCompatibleSchemaType({ type: ['null'] }, { type: ['null'] }) // true
 *
 * @example
 * // Incompatible cases
 * isCompatibleSchemaType({ type: [] }, { type: [] }) // false
 * isCompatibleSchemaType({ type: ['string', 'number'] }, { type: 'string' }) // false
 * isCompatibleSchemaType({ type: 'string' }, { type: 'number' }) // false
 */
export const isCompatibleSchemaType = (
  left: UnknownSchema,
  right: UnknownSchema,
): boolean => {
  const leftType = left.type,
    rightType = right.type;

  if (leftType === undefined || rightType === undefined) return false;
  if (leftType === rightType) return true;

  const isLeftArray = Array.isArray(leftType),
    isRightArray = Array.isArray(rightType);

  if (typeof leftType === 'string' && typeof rightType === 'string')
    return isCompatibleType(leftType, rightType);

  if (isLeftArray && isRightArray) {
    const leftLength = leftType.length,
      rightLength = rightType.length;
    if (leftLength === 0 || rightLength === 0) return false;
    const leftCount = leftLength - (leftType.indexOf('null') !== -1 ? 1 : 0),
      rightCount = rightLength - (rightType.indexOf('null') !== -1 ? 1 : 0);
    if (leftCount === 0 && rightCount === 0) return true;
    if (leftCount !== rightCount) return false;
    for (const lType of leftType) {
      if (
        lType !== 'null' &&
        hasCompatibleTypeInArray(rightType, lType) === false
      )
        return false;
    }
    return true;
  }

  // One is array, one is single
  const array = (isLeftArray ? leftType : rightType) as readonly string[];
  const single = (isLeftArray ? rightType : leftType) as string;

  if (array.length === 1) return isCompatibleType(array[0], single);
  if (array.length === 2) {
    const nullIdx = array[0] === 'null' ? 0 : array[1] === 'null' ? 1 : -1;
    if (nullIdx === -1) return false;
    return isCompatibleType(array[nullIdx === 0 ? 1 : 0], single);
  }
  return false;
};

/**
 * Checks if two single type strings are compatible.
 * Treats `number` and `integer` as compatible types.
 */
const isCompatibleType = (left: string, right: string): boolean =>
  left === right ||
  (left === 'number' && right === 'integer') ||
  (left === 'integer' && right === 'number');

/**
 * Checks if a type array contains a compatible type for the target.
 * Ignores 'null' types during comparison.
 */
const hasCompatibleTypeInArray = (
  types: readonly string[],
  target: string,
): boolean => {
  for (let i = 0, t = types[0], l = types.length; i < l; i++, t = types[i])
    if (t !== 'null' && isCompatibleType(t, target)) return true;
  return false;
};
