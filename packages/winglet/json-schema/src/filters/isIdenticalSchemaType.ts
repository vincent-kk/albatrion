import type { UnknownSchema } from '../types/jsonSchema';

/**
 * Compares whether two JSON Schemas have identical types.
 *
 * Supports both JSON Schema and OpenAPI 3.0 nullable representations:
 * - `nullable: true` property (OpenAPI 3.0)
 * - `type: ['string', 'null']` array format (JSON Schema)
 *
 * @param left - First schema to compare
 * @param right - Second schema to compare
 * @returns `true` if both schemas have identical types (considering nullable)
 *
 * @example
 * // Simple type comparison
 * isIdenticalSchemaType({ type: 'string' }, { type: 'string' }) // true
 * isIdenticalSchemaType({ type: 'string' }, { type: 'number' }) // false
 *
 * @example
 * // Nullable equivalence
 * isIdenticalSchemaType(
 *   { type: ['string', 'null'] },
 *   { type: 'string', nullable: true }
 * ) // true
 *
 * @example
 * // Array type with single element
 * isIdenticalSchemaType({ type: ['string'] }, { type: 'string' }) // true
 */
export const isIdenticalSchemaType = (
  left: UnknownSchema,
  right: UnknownSchema,
) => {
  const leftType = left.type,
    rightType = right.type;
  if (leftType === undefined || rightType === undefined) return false;
  if (leftType === rightType) return true;

  const isLeftArray = Array.isArray(leftType),
    isRightArray = Array.isArray(rightType);
  const isLeftNullInType = isLeftArray && leftType.indexOf('null') !== -1,
    isRightNullInType = isRightArray && rightType.indexOf('null') !== -1;
  const isLeftNullable = left.nullable === true || isLeftNullInType,
    isRightNullable = right.nullable === true || isRightNullInType;

  if (isLeftArray && isRightArray) {
    if (isLeftNullable === isRightNullable) {
      const leftNonNullCount = leftType.length - (isLeftNullInType ? 1 : 0),
        rightNonNullCount = rightType.length - (isRightNullInType ? 1 : 0);
      if (leftNonNullCount !== rightNonNullCount) return false;
      for (const lType of leftType) {
        if (lType === 'null' && isRightNullable) continue;
        if (rightType.indexOf(lType) === -1) return false;
      }
      return true;
    }
    return false;
  }

  const array = isLeftArray ? leftType : rightType;
  const single = isLeftArray ? rightType : leftType;
  if (array.length === 1) return array[0] === single;
  if (array.length === 2) {
    const nullIndex = array[0] === 'null' ? 0 : array[1] === 'null' ? 1 : null;
    if (nullIndex === null || !isRightNullable || !isLeftNullable) return false;
    return array[nullIndex === 0 ? 1 : 0] === single;
  }
  return false;
};
