import type { JsonSchema, JsonSchemaError } from '@/schema-form/types';

import { createDivider } from './utils/createDivider';
import { formatType } from './utils/formatType';
import { formatValuePreview } from './utils/formatValuePreview';

/**
 * Formats a structured error message for schema validation failures during form submission.
 * @param value - The form value that failed validation
 * @param errors - Array of validation errors
 * @param jsonSchema - The JSON Schema used for validation
 */
export const formatSchemaValidationFailedError = <T>(
  value: T,
  errors: JsonSchemaError[],
  jsonSchema: JsonSchema,
): string => {
  const divider = createDivider();
  const errorCount = errors.length;

  const errorsSummary = errors
    .slice(0, 5)
    .map((err) => {
      const path = err.dataPath || '(root)';
      const message = err.message || 'Unknown error';
      return `  │    • ${path}: ${message}`;
    })
    .join('\n');

  const hasMoreErrors = errorCount > 5;
  const schemaType = formatType(jsonSchema.type, 'unknown');

  return `
Form submission rejected due to validation errors.

  ╭${divider}
  │  Total Errors:  ${errorCount}
  │  Schema Type:   ${schemaType}
  │  Value:         ${formatValuePreview(value)}
  ├${divider}
  │  Validation Errors:
${errorsSummary}${hasMoreErrors ? `\n  │    ... and ${errorCount - 5} more error(s)` : ''}
  ╰${divider}

The form data did not pass validation against the JSON Schema.
All validation errors must be resolved before submission.

How to fix:
  1. Review each error above and correct the corresponding field
  2. Ensure required fields are filled in
  3. Check that values match the expected format and constraints
  4. Use form.validate() to check errors before submission
`.trim();
};
