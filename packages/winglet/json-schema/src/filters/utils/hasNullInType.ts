import type { UnknownSchema } from '../../types/jsonSchema';

/**
 * Checks if a schema's type includes 'null', indicating it's a nullable type.
 *
 * This utility function examines the `type` property of a JSON schema to determine
 * if it represents a nullable type. In JSON Schema, nullable types are expressed
 * as an array containing the primary type and 'null' (e.g., `['string', 'null']`).
 *
 * @param schema - The JSON schema object to check for nullable type
 * @returns `true` if the schema's type is an array containing 'null', `false` otherwise
 *
 * @example
 * ```typescript
 * hasNullInType({ type: 'string' }); // false
 * hasNullInType({ type: ['string', 'null'] }); // true
 * hasNullInType({ type: ['number', 'null'] }); // true
 * hasNullInType({ type: 'null' }); // false (single 'null' type, not nullable array)
 * ```
 */
export const hasNullInType = (schema: UnknownSchema): boolean =>
  Array.isArray(schema.type) && schema.type.indexOf('null') !== -1;
