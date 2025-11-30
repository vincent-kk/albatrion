import { extractSchemaInfo } from '@/schema-form/helpers/jsonSchema/extractSchemaInfo';
import type { JsonSchema, JsonSchemaType } from '@/schema-form/types';

/**
 * Processes schema type during allOf schema merging.
 *
 * @description
 * Handles two aspects of type merging:
 *
 * 1. Numeric type intersection:
 *    - `number` ∩ `integer` = `integer` (integer is a subset of number)
 *    - Other type combinations preserve the base type
 *
 * 2. Nullable handling:
 *    Unifies two ways of expressing nullable in JSON Schema:
 *    - `nullable: true` property
 *    - `type: ['string', 'null']` array format
 *
 *    Nullable merge rules:
 *    - Result is nullable only when both base and source are nullable (intersection)
 *    - When source has no nullable info, it defaults to nullable (permissive)
 *    - Result is normalized to `type: [baseType, 'null']` array format
 *    - `nullable` property is removed to prevent duplicate representation
 *
 * @template T - JSON Schema type extending JsonSchema
 * @param {T} base - The base schema to be mutated with merged type result
 * @param {Partial<T>} source - The source schema to merge type from
 * @returns {void}
 *
 * @example
 * // Numeric type intersection
 * processSchemaType({ type: 'number' }, { type: 'integer' })
 * // Result: { type: 'integer' }
 *
 * @example
 * // Both nullable → result is nullable
 * processSchemaType({ type: 'string', nullable: true }, { nullable: true })
 * // Result: { type: ['string', 'null'] }
 *
 * @example
 * // Base nullable, source explicit non-nullable → result is non-nullable
 * processSchemaType({ type: 'string', nullable: true }, { nullable: false })
 * // Result: { type: 'string' }
 *
 * @example
 * // Base nullable, source has no nullable info → result is nullable (permissive)
 * processSchemaType({ type: ['string', 'null'] }, {})
 * // Result: { type: ['string', 'null'] }
 */
export const processSchemaType = <T extends JsonSchema>(
  base: T,
  source: Partial<T>,
) => {
  const baseInfo = extractSchemaInfo(base);
  if (baseInfo === null) return;
  const sourceInfo = extractSchemaInfo(source);
  const sourceNullable = (sourceInfo?.nullable ?? source.nullable) !== false;

  type Type = (typeof base)['type'];
  const schemaType = intersectNumericType(baseInfo.type, sourceInfo?.type);
  if (base.nullable !== undefined) base.nullable = undefined;
  if (baseInfo.nullable && sourceNullable)
    base.type = (schemaType !== 'null' ? [schemaType, 'null'] : 'null') as Type;
  else base.type = schemaType as Type;
};

const intersectNumericType = (
  baseType: JsonSchemaType,
  sourceType?: JsonSchemaType,
) => (baseType === 'number' && sourceType === 'integer' ? 'integer' : baseType);
