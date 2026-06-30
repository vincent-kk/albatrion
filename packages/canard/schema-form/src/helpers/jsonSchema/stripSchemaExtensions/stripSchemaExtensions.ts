import { clone } from '@winglet/common-utils/object';
import {
  type JsonScannerOptions,
  JsonSchemaScanner,
} from '@winglet/json-schema/scanner';

import type { JsonSchema, JsonSchemaWithVirtual } from '@/schema-form/types';

import { hasExtensionKeys } from './utils/hasExtensionKeys';

/**
 * Returns a copy of `jsonSchema` with all schema-form extension keys removed
 * (so a plain JSON Schema validator never sees them), WITHOUT mutating the
 * input and WITHOUT a separate detection pass.
 *
 * Why scan a clone: `mutate` shallow-spreads each stripped schema, leaving its
 * nested `properties`/`items` shared with the scanned object; the scanner's
 * `getValue()` then applies deeper strips by writing through those shared
 * references. Scanning the original would therefore strip extension props off
 * the caller's schema in place — the very object the node tree is built from.
 * (Form clones the USER input; this isolates the node-tree schema from the
 * validator's strip — a different object, a different concern.)
 *
 * Why no detection pass: `JsonSchemaScanner.getValue()` returns its input BY
 * REFERENCE when nothing was stripped. So `result === cloned` means "no
 * extension anywhere" and we hand back the ORIGINAL untouched (identity
 * preserved); otherwise `result` is the stripped copy.
 */
export const stripSchemaExtensions = (
  jsonSchema: JsonSchemaWithVirtual,
): JsonSchema => {
  const cloned = clone(jsonSchema);
  const result = new JsonSchemaScanner({ options: { mutate } })
    .scan(cloned)
    .getValue();
  return (result === cloned ? jsonSchema : result) as JsonSchema;
};

const mutate: JsonScannerOptions<JsonSchemaWithVirtual>['mutate'] = ({
  schema,
}) => {
  if (schema == null || !hasExtensionKeys(schema)) return;
  const {
    FormTypeInput,
    FormTypeInputProps,
    FormTypeRendererProps,
    errorMessages,
    options,
    injectTo,
    ...stripedSchema
  } = schema;
  return stripedSchema;
};
