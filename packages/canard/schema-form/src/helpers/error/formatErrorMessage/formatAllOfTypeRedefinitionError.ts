import type { JsonSchema } from '@/schema-form/types';

import { createDivider } from './utils/createDivider';
import { formatType } from './utils/formatType';

/**
 * Formats a structured error message for allOf type redefinition errors.
 * @param schema - The base schema
 * @param allOfSchema - The allOf schema that attempts to redefine the type
 */
export const formatAllOfTypeRedefinitionError = (
  schema: JsonSchema,
  allOfSchema: JsonSchema,
): string => {
  const divider = createDivider();
  const baseType = formatType(schema.type);
  const allOfType = formatType(allOfSchema.type);

  return `
Type redefinition not allowed in allOf schema.

  ╭${divider}
  │  Base Schema Type:   ${baseType}
  │  allOf Schema Type:  ${allOfType}
  ├${divider}
  │  Conflict:  allOf schema attempts to change the type
  ╰${divider}

In JSON Schema, when using 'allOf', the type must either be omitted
in the sub-schemas or match the parent schema type exactly.
Redefining the type in allOf would create an impossible constraint.

How to fix:
  1. Remove the 'type' property from the allOf sub-schema:
     {
       "type": "${baseType}",
       "allOf": [
         { "properties": { ... } }  // No type here
       ]
     }

  2. Or ensure the types match:
     {
       "type": "${baseType}",
       "allOf": [
         { "type": "${baseType}", "properties": { ... } }
       ]
     }

  3. If different types are needed, consider using 'oneOf' instead
`.trim();
};
