import type { ClassNamesOptions, ClassValue } from './type';
import { normalizeWhitespace } from './utils/normalizeWhitespace';
import { processClassValues } from './utils/processClassValues';

/**
 * Main class names utility function with explicit interface.
 *
 * Combines multiple class values into a single space-separated string,
 * with configurable options for duplicate removal, whitespace normalization,
 * and empty value filtering.
 *
 * @param classes - Array of class values to process
 * @param options - Configuration options for processing
 * @returns Combined class names as a string
 *
 * @example
 * ```typescript
 * // Basic usage
 * classNames(['btn', 'btn-primary']); // → 'btn btn-primary'
 *
 * // With conditional classes
 * classNames(['btn', { 'btn-active': isActive }]); // → 'btn btn-active'
 *
 * // With options
 * classNames(['btn', 'btn', 'primary'], {
 *   removeDuplicates: false
 * }); // → 'btn btn primary'
 *
 * // Complex example
 * classNames([
 *   'btn',
 *   `btn-${variant}`,
 *   size && `btn-${size}`,
 *   { 'btn-disabled': disabled }
 * ]); // → 'btn btn-primary btn-large'
 * ```
 */
export const classNames = (
  classes: ClassValue[],
  options?: ClassNamesOptions,
): string => {
  const removeDuplicates = options?.removeDuplicates ?? true;
  const removeWhitespace = options?.normalizeWhitespace ?? true;
  const filterEmpty = options?.filterEmpty ?? true;
  let result = processClassValues(classes, removeDuplicates);
  if (filterEmpty && !result) return '';
  if (removeWhitespace && !removeDuplicates)
    result = normalizeWhitespace(result);
  return result;
};
