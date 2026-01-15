import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { createDivider } from './utils/createDivider';
import { formatJsonPreview } from './utils/formatJsonPreview';

/**
 * Formats a structured error message for circular reference detection in JSON Schema.
 * @param originalErrorMessage - Original error message from the validation error
 * @param schema - The JSON Schema that contains the circular reference
 */
export const formatCircularReferenceError = (
  originalErrorMessage: string,
  schema: JsonSchemaWithVirtual,
): string => {
  const divider = createDivider();
  const { preview: schemaPreview, truncated } = formatJsonPreview(schema);

  return `
Circular reference detected in JSON Schema.

  ╭${divider}
  │  Error:     Circular reference in schema definition
  │  Fallback:  Validation will use fallback mode
  ├${divider}
  │  Schema Preview:
${schemaPreview}${truncated ? '\n  │    ...(truncated)' : ''}
  ╰${divider}

Original error: ${originalErrorMessage}

This typically occurs when a schema references itself directly or indirectly,
creating an infinite loop in the schema definition.

How to fix:
  1. Check for $ref references that point back to parent schemas
  2. Look for recursive type definitions without proper termination
  3. Consider using a $defs section with properly scoped references
`.trim();
};
