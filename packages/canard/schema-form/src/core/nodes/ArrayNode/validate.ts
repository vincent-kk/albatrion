import { JsonSchemaError } from '@/schema-form/errors';
import type { ArraySchema } from '@/schema-form/types';

/**
 * Validates an array schema to ensure it has a valid structure for ArrayNode creation.
 *
 * @param jsonSchema - The JSON Schema to validate
 * @throws {JsonSchemaError} If the schema structure is invalid
 * @returns true if the schema is valid
 */
export const validateArraySchema = (jsonSchema: ArraySchema) => {
  const itemsSchema = jsonSchema.items;
  const prefixItemsSchema = jsonSchema.prefixItems;
  const minItems = jsonSchema.minItems;
  const maxItems = jsonSchema.maxItems;
  const prefixItemsLength = prefixItemsSchema?.length ?? 0;

  // Case 1: items: false requires prefixItems to define the allowed tuple elements
  if (itemsSchema === false && !prefixItemsSchema)
    throw new JsonSchemaError(
      'UNEXPECTED_ARRAY_SCHEMA',
      `Array schema with 'items: false' must have 'prefixItems' defined to specify allowed tuple elements`,
      {
        jsonSchema,
        items: itemsSchema,
        prefixItems: prefixItemsSchema,
      },
    );

  // Case 2: No items schema defined
  if (itemsSchema === undefined) {
    // Case 2-1: No prefixItems either - array has no schema for any items
    if (!prefixItemsSchema)
      throw new JsonSchemaError(
        'UNEXPECTED_ARRAY_SCHEMA',
        `Array schema must have at least one of 'items' or 'prefixItems' defined`,
        {
          jsonSchema,
          items: itemsSchema,
          prefixItems: prefixItemsSchema,
        },
      );

    // Case 2-2: prefixItems exists but maxItems allows more items than prefixItems defines
    // Without 'items', there's no schema for indices beyond prefixItems
    if (maxItems !== undefined && prefixItemsLength < maxItems)
      throw new JsonSchemaError(
        'UNEXPECTED_ARRAY_SCHEMA',
        `Array schema without 'items' cannot have 'maxItems' (${maxItems}) greater than 'prefixItems' length (${prefixItemsLength}). ` +
          `Define 'items' schema for indices beyond prefixItems, or set 'maxItems' to ${prefixItemsLength} or less.`,
        {
          jsonSchema,
          items: itemsSchema,
          prefixItems: prefixItemsSchema,
          maxItems,
          prefixItemsLength,
        },
      );

    // Case 2-3: prefixItems exists but minItems requires more items than prefixItems defines
    // Without 'items', there's no schema to create items beyond prefixItems
    if (minItems !== undefined && prefixItemsLength < minItems)
      throw new JsonSchemaError(
        'UNEXPECTED_ARRAY_SCHEMA',
        `Array schema without 'items' cannot have 'minItems' (${minItems}) greater than 'prefixItems' length (${prefixItemsLength}). ` +
          `Define 'items' schema for indices beyond prefixItems, or set 'minItems' to ${prefixItemsLength} or less.`,
        {
          jsonSchema,
          items: itemsSchema,
          prefixItems: prefixItemsSchema,
          minItems,
          prefixItemsLength,
        },
      );
  }

  return true;
};
