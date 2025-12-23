import type { ArraySchema, JsonSchema } from '@/schema-form/types';

/**
 * Retrieves the appropriate JSON Schema for an array child at a given index.
 *
 * This function determines the correct schema based on JSON Schema's `prefixItems` and `items` keywords:
 * - If `prefixItems` is not defined, returns the `items` schema for all indices (or `null` if `items` is also undefined)
 * - If `prefixItems` is defined and the index falls within its range, returns the corresponding prefixItems schema
 * - For indices beyond `prefixItems`, returns the `items` schema (or `null` if `items` is undefined)
 *
 * @param schema - The parent array schema containing optional `items` and `prefixItems`
 * @param index - The index of the child element in the array
 * @returns The JSON Schema to apply for the child at the specified index, or `null` if no schema applies
 */
export const getChildSchema = (
  schema: ArraySchema,
  index: number,
): JsonSchema | null => {
  const itemSchema = schema.items;
  const prefixItemSchemas = schema.prefixItems;
  if (prefixItemSchemas === undefined) return itemSchema || null;
  if (prefixItemSchemas.length > index) return prefixItemSchemas[index] || null;
  return itemSchema || null;
};
