import { JsonSchemaError } from '@/schema-form/errors';
import type { JsonSchemaWithRef } from '@/schema-form/types';

export const validateArraySchema = (jsonSchema: JsonSchemaWithRef) => {
  const itemsSchema = jsonSchema.items;
  const prefixItemsSchema = jsonSchema.prefixItems;
  if (itemsSchema === false && !prefixItemsSchema)
    throw new JsonSchemaError(
      'UNEXPECTED_ARRAY_SCHEMA',
      `Array schema with 'items: false' must have 'prefixItems' defined`,
      {
        jsonSchema,
        items: itemsSchema,
        prefixItems: prefixItemsSchema,
      },
    );
  if (itemsSchema === undefined && !prefixItemsSchema)
    throw new JsonSchemaError(
      'UNEXPECTED_ARRAY_SCHEMA',
      `Array schema must have at least one of 'items' or 'prefixItems' defined`,
      {
        jsonSchema,
        items: itemsSchema,
        prefixItems: prefixItemsSchema,
      },
    );
  return true;
};
