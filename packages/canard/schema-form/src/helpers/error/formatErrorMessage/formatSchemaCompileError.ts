import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { createDivider } from './utils/createDivider';
import { formatJsonPreview } from './utils/formatJsonPreview';
import { getErrorMessage } from './utils/getErrorMessage';

/**
 * Formats a structured error message for a validator compilation failure.
 *
 * Covers every compile failure except circular references, which keep their own
 * dedicated message (see formatCircularReferenceError). The causes vary —
 * contradictory keywords, an unresolvable `$ref`, a malformed keyword shape, an
 * invalid `pattern` regex, a duplicate `$id` — so the validator's own message is
 * the only reliable diagnosis and is surfaced as the headline reason instead of
 * being replaced by a guess.
 *
 * @param error - Error thrown by the validator while compiling the schema
 * @param schema - The JSON Schema that failed to compile
 */
export const formatSchemaCompileError = (
  error: unknown,
  schema: JsonSchemaWithVirtual,
): string => {
  const divider = createDivider();
  const { preview: schemaPreview, truncated } = formatJsonPreview(schema);
  const message = getErrorMessage(error);
  const [headline] = message.split('\n');
  const kind = error instanceof Error ? error.name : typeof error;

  return `
JSON Schema compilation failed.

  ╭${divider}
  │  Reason:    ${headline}
  │  Kind:      ${kind}
  │  Fallback:  Validation will use fallback mode
  ├${divider}
  │  Schema Preview:
${schemaPreview}${truncated ? '\n  │    ...(truncated)' : ''}
  ╰${divider}

Original error: ${message}

The validator rejected this schema, so it was never compiled. Validation now
reports this failure for every value instead of checking it.

How to fix:
  1. Read the reason above — it names the keyword the validator objected to
  2. Remove contradictory keywords (e.g. 'nullable: false' with type ['string', 'null'])
  3. Make sure every $ref resolves inside this schema or its $defs
  4. Check keyword shapes against the JSON Schema spec (e.g. 'required' must be an array)
`.trim();
};
