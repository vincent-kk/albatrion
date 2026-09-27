import type { JSONScannerOptions } from '@winglet/json-schema/scanner';

/**
 * Remove reserved groups only when the schema scanner visits an actual schema.
 * @param entry - Scanner-owned entry, never a const/enum/default data object.
 * @returns A stripped shallow replacement, or undefined when no group is present.
 */
export const removeFormGroups: NonNullable<JSONScannerOptions['mutate']> = ({
  schema,
}) => {
  if (!schema || typeof schema !== 'object') return;
  if (
    !['controls', 'options', 'presentation'].some((key) =>
      Object.prototype.hasOwnProperty.call(schema, key),
    )
  )
    return;
  const { controls, options, presentation, ...stripped } = schema;
  return stripped;
};
