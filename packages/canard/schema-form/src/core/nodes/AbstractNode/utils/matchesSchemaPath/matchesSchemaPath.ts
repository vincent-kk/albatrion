import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

/**
 * Checks if a JSON schema path matches a target path with proper boundary validation.
 *
 * This function performs prefix matching with boundary checks to ensure that the target
 * path represents a complete path segment, not a partial match. It validates that the
 * character immediately following the target path is either a path separator or the
 * end of the string.
 *
 * @param source - The source schema path (may include fragment identifier '#')
 * @param target - The target path to match against
 *
 * @returns true if the target path matches the beginning of the source path with proper boundaries
 *
 * @example
 * ```typescript
 * // Valid matches
 * matchesSchemaPath("#/oneOf/2/properties/workingHours/maximum", "/oneOf/2/properties/workingHours") // true
 * matchesSchemaPath("#/properties/name", "/properties") // true
 * matchesSchemaPath("/oneOf/1/properties/age", "/oneOf/1/properties/age") // true (exact match)
 *
 * // Invalid matches (partial segments)
 * matchesSchemaPath("#/oneOf/2/properties/workingHours", "/oneOf/2/proper") // false
 * matchesSchemaPath("#/properties/username", "/properties/user") // false
 * ```
 *
 * @performance
 * - O(n) time complexity where n is the length of the target path
 * - No memory allocation (uses indexOf and direct character access)
 * - Early termination on mismatch for optimal performance
 */
export const matchesSchemaPath = (source: string, target: string): boolean => {
  const start = source[0] === $.Fragment ? 1 : 0;
  if (source.indexOf(target, start) !== start) return false;
  const endCode = source[start + target.length];
  return endCode === $.Separator || endCode === undefined;
};
