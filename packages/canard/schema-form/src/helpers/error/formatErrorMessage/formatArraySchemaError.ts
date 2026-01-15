import type { ArraySchema } from '@/schema-form/types';

import { createDivider } from './utils/createDivider';
import { formatJsonPreview } from './utils/formatJsonPreview';
import { formatPrefixItemsPreview } from './utils/formatPrefixItemsPreview';

/**
 * Formats a structured error message when 'items: false' is used without 'prefixItems'.
 * @param jsonSchema - The array schema that caused the error
 */
export const formatItemsFalseWithoutPrefixItemsError = (
  jsonSchema: ArraySchema,
): string => {
  const divider = createDivider();
  const { preview: schemaPreview, truncated } = formatJsonPreview(jsonSchema);

  return `
Invalid array schema: 'items: false' requires 'prefixItems' to be defined.

  ╭${divider}
  │  Schema Type:   array
  │  items:         false
  │  prefixItems:   undefined
  ├${divider}
  │  Schema Preview:
${schemaPreview}${truncated ? '\n  │    ...(truncated)' : ''}
  ╰${divider}

When 'items' is set to 'false', it means no additional items are allowed
beyond those defined in 'prefixItems'. Without 'prefixItems', the array
would have no valid schema for any elements.

How to fix:
  1. Add 'prefixItems' array to define allowed tuple elements:
     {
       "type": "array",
       "items": false,
       "prefixItems": [
         { "type": "string" },
         { "type": "number" }
       ]
     }

  2. Or remove 'items: false' and use a regular items schema:
     {
       "type": "array",
       "items": { "type": "string" }
     }
`.trim();
};

/**
 * Formats a structured error message when neither 'items' nor 'prefixItems' is defined.
 * @param _jsonSchema - The array schema that caused the error
 */
export const formatMissingItemsAndPrefixItemsError = (
  _jsonSchema: ArraySchema,
): string => {
  const divider = createDivider();

  return `
Invalid array schema: Array must have 'items' or 'prefixItems' defined.

  ╭${divider}
  │  Schema Type:   array
  │  items:         undefined
  │  prefixItems:   undefined
  ╰${divider}

An array schema must define either 'items' (schema for all elements)
or 'prefixItems' (schemas for tuple positions) to be valid.

How to fix:
  1. Add 'items' for homogeneous arrays:
     {
       "type": "array",
       "items": { "type": "string" }
     }

  2. Add 'prefixItems' for tuple arrays:
     {
       "type": "array",
       "prefixItems": [
         { "type": "string" },
         { "type": "number" }
       ]
     }

  3. Combine both for tuples with additional items:
     {
       "type": "array",
       "prefixItems": [{ "type": "string" }],
       "items": { "type": "number" }
     }
`.trim();
};

/**
 * Formats a structured error message when 'maxItems' exceeds 'prefixItems' length without 'items'.
 * @param jsonSchema - The array schema that caused the error
 * @param maxItems - The maxItems value
 * @param prefixItemsLength - Length of prefixItems array
 */
export const formatMaxItemsExceedsPrefixItemsError = (
  jsonSchema: ArraySchema,
  maxItems: number,
  prefixItemsLength: number,
): string => {
  const divider = createDivider();
  const prefixItemsPreview = formatPrefixItemsPreview(
    jsonSchema,
    prefixItemsLength,
  );

  return `
Invalid array schema: 'maxItems' exceeds 'prefixItems' length without 'items' schema.

  ╭${divider}
  │  Schema Type:      array
  │  maxItems:         ${maxItems}
  │  prefixItems:      [${prefixItemsPreview}] (length: ${prefixItemsLength})
  │  items:            undefined
  ├${divider}
  │  Problem:  maxItems (${maxItems}) > prefixItems.length (${prefixItemsLength})
  ╰${divider}

Without an 'items' schema, there's no definition for array indices
beyond prefixItems. Setting maxItems > prefixItems.length would allow
elements without a schema.

How to fix:
  1. Set maxItems to ${prefixItemsLength} or less:
     { "maxItems": ${prefixItemsLength} }

  2. Or add 'items' schema for additional elements:
     {
       "items": { "type": "string" },
       "maxItems": ${maxItems}
     }
`.trim();
};

/**
 * Formats a structured error message when 'minItems' exceeds 'prefixItems' length without 'items'.
 * @param jsonSchema - The array schema that caused the error
 * @param minItems - The minItems value
 * @param prefixItemsLength - Length of prefixItems array
 */
export const formatMinItemsExceedsPrefixItemsError = (
  jsonSchema: ArraySchema,
  minItems: number,
  prefixItemsLength: number,
): string => {
  const divider = createDivider();
  const prefixItemsPreview = formatPrefixItemsPreview(
    jsonSchema,
    prefixItemsLength,
  );

  return `
Invalid array schema: 'minItems' exceeds 'prefixItems' length without 'items' schema.

  ╭${divider}
  │  Schema Type:      array
  │  minItems:         ${minItems}
  │  prefixItems:      [${prefixItemsPreview}] (length: ${prefixItemsLength})
  │  items:            undefined
  ├${divider}
  │  Problem:  minItems (${minItems}) > prefixItems.length (${prefixItemsLength})
  ╰${divider}

Without an 'items' schema, there's no way to create array elements
beyond prefixItems. Setting minItems > prefixItems.length would
require elements that cannot be created.

How to fix:
  1. Set minItems to ${prefixItemsLength} or less:
     { "minItems": ${prefixItemsLength} }

  2. Or add 'items' schema for additional elements:
     {
       "items": { "type": "string" },
       "minItems": ${minItems}
     }
`.trim();
};
