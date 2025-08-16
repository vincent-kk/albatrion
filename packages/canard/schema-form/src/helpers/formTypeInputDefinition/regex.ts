import { JSONPointer } from '@/schema-form/helpers/jsonPointer';

/**
 * Regular expression for validating JSON Pointer paths containing wildcard index patterns.
 * This regex checks if a path contains the wildcard character (*) as a complete segment.
 * The wildcard must be a standalone segment, not part of a larger identifier.
 *
 * Path structure:
 * - Optional fragment prefix (#)
 * - Required separator (/)
 * - Zero or more path segments before the wildcard
 * - The wildcard character (*) as a complete segment
 * - Zero or more path segments after the wildcard
 * - Must not end with a separator
 *
 * @example
 * - Matches: "#/property/`*`", "/property/`*`", "#/array/`*`/field", "/users/`*`/name"
 * - Does not match: "/property＊", "/prop＊erty", "/＊property", "/property/`*`/"
 * (Note: `*` represents the asterisk wildcard character)
 */
export const INCLUDE_INDEX_REGEX = new RegExp(
  `^(\\${JSONPointer.Fragment})?\\${JSONPointer.Separator}(?:.*\\${JSONPointer.Separator})?\\${JSONPointer.Index}(?:\\${JSONPointer.Separator}.*)?(?<!\\${JSONPointer.Separator})$`,
);
