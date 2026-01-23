import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { createDivider } from './utils/createDivider';
import { formatJsonPreview } from './utils/formatJsonPreview';
import { formatValuePreview } from './utils/formatValuePreview';
import { getErrorMessage } from './utils/getErrorMessage';

/**
 * Formats a structured error message for injectValueTo execution failures.
 * @param schemaPath - The schema path of the node where the error occurred
 * @param dataPath - The data path of the node where the error occurred
 * @param value - The current value of the node
 * @param rootValue - The root value of the form
 * @param contextValue - The context value
 * @param jsonSchema - The JSON Schema of the node
 * @param error - The original error object
 */
export const formatInjectValueToError = (
  value: unknown,
  dataPath: string,
  rootValue: unknown,
  contextValue: unknown,
  jsonSchema: JsonSchemaWithVirtual,
  schemaPath: string,
  error: unknown,
): string => {
  const divider = createDivider();
  const errorMessage = getErrorMessage(error);
  const { preview: schemaPreview, truncated: schemaTruncated } =
    formatJsonPreview(jsonSchema);
  const valuePreview = formatValuePreview(value);
  const rootValuePreview = formatValuePreview(rootValue);
  const contextValuePreview = formatValuePreview(contextValue);

  return `
An error occurred while executing injectValueTo.

  ╭${divider}
  │  Schema Path:   ${schemaPath}
  │  Data Path:     ${dataPath}
  ├${divider}
  │  Current Value:   ${valuePreview}
  │  Root Value:      ${rootValuePreview}
  │  Context Value:   ${contextValuePreview}
  ├${divider}
  │  Schema Preview:
${schemaPreview}${schemaTruncated ? '\n  │    ...(truncated)' : ''}
  ├${divider}
  │  Error: ${errorMessage}
  ╰${divider}

The injectValueTo function threw an error during execution.
This function is called when the node's value changes to inject values
into other nodes based on the current value.

How to fix:
  1. Check the injectValueTo function in your schema for runtime errors
  2. Verify that all target paths returned by injectValueTo are valid
  3. Ensure the function handles edge cases (null, undefined values)
  4. Check for type mismatches in the injected values
  5. Review any conditional logic that may fail with certain inputs
`.trim();
};
