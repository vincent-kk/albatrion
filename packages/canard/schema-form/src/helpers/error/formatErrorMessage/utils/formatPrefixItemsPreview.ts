import type { ArraySchema, JsonSchema } from '@/schema-form/types';

/**
 * Formats prefix items preview for error messages.
 * @param jsonSchema - The array schema to preview
 * @param prefixItemsLength - The length of the prefix items
 * @returns Formatted prefix items preview string
 */
export const formatPrefixItemsPreview = (
  jsonSchema: ArraySchema,
  prefixItemsLength: number,
): string => {
  const items = jsonSchema.prefixItems?.slice(0, 3) ?? [];
  const preview = items
    .map((item) => JSON.stringify((item as JsonSchema).type || item))
    .join(', ');
  return preview + (prefixItemsLength > 3 ? ', ...' : '');
};
