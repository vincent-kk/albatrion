import type { JsonSchema } from '@/schema-form/types';

/**
 * Formats property keys preview for error messages.
 * @param properties - The properties to preview
 * @returns Formatted property keys preview string
 */
export const formatPropertyKeysPreview = (
  properties: Record<string, JsonSchema> = {},
): string => {
  const propertyKeys = Object.keys(properties);
  const slicedPropertyKeys = propertyKeys.slice(0, 5);
  return slicedPropertyKeys.length > 0
    ? slicedPropertyKeys.join(', ') + (propertyKeys.length > 5 ? ', ...' : '')
    : '(none)';
};
