import { createDivider } from './utils/createDivider';
import { formatJsonPreview } from './utils/formatJsonPreview';

/**
 * Formats a structured error message for unknown JSON Schema type errors.
 * @param unknownType - The unknown type that was encountered
 * @param jsonSchema - The schema containing the unknown type
 */
export const formatUnknownJsonSchemaError = (
  unknownType: unknown,
  jsonSchema: unknown,
): string => {
  const divider = createDivider();
  const validTypes = [
    'string',
    'number',
    'integer',
    'boolean',
    'array',
    'object',
    'null',
  ];
  const { preview: schemaPreview } = formatJsonPreview(jsonSchema, 8);

  return `
Unknown JSON Schema type encountered.

  ╭${divider}
  │  Received Type:  '${String(unknownType)}'
  │  Valid Types:    ${validTypes.join(', ')}
  ├${divider}
  │  Schema:
${schemaPreview}
  │    ...
  ╰${divider}

The schema contains a type that is not recognized by the form builder.
Only standard JSON Schema types are supported.

How to fix:
  1. Change the type to one of: ${validTypes.join(', ')}
  2. If using a custom type, ensure it's properly handled
  3. Check for typos in the type name
  4. For nullable types, use: { "type": ["string", "null"] }
`.trim();
};
