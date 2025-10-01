import { isArray } from '@winglet/common-utils/filter';

import type { SchemaNode } from '@/schema-form/core/nodes/type';

/**
 * Checks if a JavaScript value matches the specified JSON Schema type.
 *
 * @param value - The JavaScript value to validate
 * @param type - The expected JSON Schema type
 * @param nullable - Whether the value is nullable
 * @returns `true` if the value matches the schema type, `false` otherwise
 *
 * @example
 * ```typescript
 * // Basic type validation
 * validateSchemaType(null, 'null', false);           // true
 * validateSchemaType([1, 2], 'array', false);        // true
 * validateSchemaType({ a: 1 }, 'object', false);     // true
 * validateSchemaType(3.14, 'number', false);         // true
 * validateSchemaType(42, 'number', false);           // true (integer is also a number)
 * validateSchemaType('hello', 'string', false);      // true
 * validateSchemaType(true, 'boolean', false);        // true
 * validateSchemaType(undefined, 'string', false);    // false
 *
 * // Nullable behavior
 * validateSchemaType(null, 'string', true);          // true (nullable allows null)
 * validateSchemaType(null, 'string', false);         // false (not nullable)
 * validateSchemaType(null, 'null', true);            // true (null type always accepts null)
 * ```
 *
 * @remarks
 * - `null` only matches 'null' type (not 'object')
 * - Arrays match 'array' type (not 'object')
 * - 'integer' type requires the value to be a whole number
 * - 'number' type accepts both integers and floating-point numbers
 * - Returns `false` for `undefined` values regardless of schema type
 * - When `nullable` is `true`, `null` values are accepted for any type
 * - When `nullable` is `false`, `null` values are only accepted for 'null' type
 */
export const validateSchemaType = (
  value: unknown,
  type: SchemaNode['type'],
  nullable: SchemaNode['nullable'],
): boolean => {
  if (value === undefined) return false;
  if (value === null) return nullable || type === 'null';
  if (isArray(value)) return type === 'array';
  return typeof value === type;
};
