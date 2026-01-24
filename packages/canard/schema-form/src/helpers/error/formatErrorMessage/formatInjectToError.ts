import type { InjectHandlerContext } from '@/schema-form/types';

import { createDivider } from './utils/createDivider';
import { formatJsonPreview } from './utils/formatJsonPreview';
import { formatValuePreview } from './utils/formatValuePreview';
import { getErrorMessage } from './utils/getErrorMessage';

/**
 * Context for formatting injectTo error messages.
 * Extends {@link InjectHandlerContext} with additional error-specific fields.
 */
export interface FormatInjectToErrorContext extends InjectHandlerContext {
  /** The current value that triggered the error */
  value: unknown;
  /** The error that occurred during injectTo execution */
  error: unknown;
}

/**
 * Formats a structured error message for injectTo execution failures.
 *
 * @param context - The error context containing all relevant information
 * @returns A formatted error message string with diagnostic information
 *
 * @example
 * ```typescript
 * const message = formatInjectToError({
 *   value: 'test',
 *   dataPath: '/user/name',
 *   schemaPath: '/properties/user/properties/name',
 *   jsonSchema: { type: 'string' },
 *   parentValue: { name: 'test' },
 *   parentJsonSchema: { type: 'object', properties: { name: { type: 'string' } } },
 *   rootValue: { user: { name: 'test' } },
 *   rootJsonSchema: { type: 'object' },
 *   context: {},
 *   error: new Error('Something went wrong'),
 * });
 * ```
 */
export const formatInjectToError = ({
  value,
  dataPath,
  schemaPath,
  jsonSchema,
  rootValue,
  context,
  error,
}: FormatInjectToErrorContext): string => {
  const divider = createDivider();
  const errorMessage = getErrorMessage(error);
  const { preview: schemaPreview, truncated: schemaTruncated } =
    formatJsonPreview(jsonSchema);
  const valuePreview = formatValuePreview(value);
  const rootValuePreview = formatValuePreview(rootValue);
  const contextValuePreview = formatValuePreview(context);

  return `
An error occurred while executing injectTo.

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

The injectTo function threw an error during execution.
This function is called when the node's value changes to inject values
into other nodes based on the current value.

How to fix:
  1. Check the injectTo function in your schema for runtime errors
  2. Verify that all target paths returned by injectTo are valid
  3. Ensure the function handles edge cases (null, undefined values)
  4. Check for type mismatches in the injected values
  5. Review any conditional logic that may fail with certain inputs
`.trim();
};
