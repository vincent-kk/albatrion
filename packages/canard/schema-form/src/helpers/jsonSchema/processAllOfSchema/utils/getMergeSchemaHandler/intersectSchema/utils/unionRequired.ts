import { unique } from '@winglet/common-utils/array';

/**
 * Creates a union of two required field arrays, removing duplicates.
 *
 * This function combines required field arrays from two schemas,
 * ensuring that all required fields from both schemas are included
 * in the result without duplicates.
 *
 * @param baseRequired - The base required fields array (optional)
 * @param sourceRequired - The source required fields array (optional)
 * @returns Combined unique required fields array, or undefined if both are undefined
 */
export const unionRequired = (
  baseRequired?: string[],
  sourceRequired?: string[],
): string[] | undefined => {
  if (!baseRequired && !sourceRequired) return undefined;
  if (!baseRequired) return sourceRequired;
  if (!sourceRequired) return baseRequired;
  return unique([...baseRequired, ...sourceRequired]);
};
