import type { ArraySchema, JsonSchema } from '@/schema-form/types';

/**
 * Retrieves the appropriate JSON Schema for an array child at a given index.
 *
 * This function determines the correct schema based on JSON Schema's `prefixItems` and `items` keywords:
 * - If `prefixItems` is not defined, returns the `items` schema for all indices
 * - If `prefixItems` is defined and the index falls within its range, returns the corresponding prefixItems schema
 * - Otherwise, returns the `items` schema for indices beyond prefixItems
 *
 * @precondition The schema is guaranteed to have at least one of `items` or `prefixItems` defined.
 *               This is validated in `schemaNodeFactory.ts` which throws `JsonSchemaError('UNEXPECTED_ARRAY_SCHEMA')`
 *               if neither property is present before the ArrayNode is created.
 *
 * @param schema - The parent array schema containing `items` and optional `prefixItems`
 * @param index - The index of the child element in the array
 * @returns The JSON Schema to apply for the child at the specified index
 */
export const getChildSchema = (
  schema: ArraySchema,
  index: number,
): JsonSchema => {
  const itemSchema = schema.items;
  const prefixItemSchemas = schema.prefixItems;
  if (prefixItemSchemas === undefined) return itemSchema as JsonSchema;
  if (prefixItemSchemas.length > index) return prefixItemSchemas[index];
  return itemSchema as JsonSchema;
};
