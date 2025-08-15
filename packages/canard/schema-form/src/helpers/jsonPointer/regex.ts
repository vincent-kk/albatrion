import { JSONPointer } from './enum';

/**
 * JSON Pointer segment character pattern.
 * Supports: letters, digits (including as first character), underscore, dollar sign, Unicode.
 * Used both for segment content and negative lookbehind assertion.
 * @example Matches: 'property', '123', '0', '_private', '$special', '한글', '属性'
 */
const JSON_POINTER_SEGMENT_CHARACTER = `[a-zA-Z0-9_$\\u0080-\\uFFFF]`;

/**
 * Negative lookbehind assertion to prevent matching within existing identifiers.
 * Ensures JSON Pointer patterns are only matched when not preceded by identifier characters.
 */
const NOT_PRECEDED_BY_IDENTIFIER_CHARACTER = `(?<!${JSON_POINTER_SEGMENT_CHARACTER})`;

/**
 * Single JSON Pointer path segment pattern.
 * @example 'property', '123', 'field1', '_private', '$special', '한글'
 */
const SINGLE_PATH_SEGMENT = `${JSON_POINTER_SEGMENT_CHARACTER}+`;

/**
 * Multi-level path pattern with segments separated by forward slashes.
 * @example 'property', '123', 'property/subProperty', 'users/0/name'
 */
const MULTI_LEVEL_PATH_PATTERN = `${SINGLE_PATH_SEGMENT}(?:\\${JSONPointer.Separator}${SINGLE_PATH_SEGMENT})*`;

/**
 * Optional path pattern (may or may not exist after a prefix).
 */
const OPTIONAL_PATH_PATTERN = `(?:${MULTI_LEVEL_PATH_PATTERN})?`;

/**
 * Parent directory references pattern (one or more '../' sequences).
 * @example '../', '../../', '../../../'
 */
const MULTIPLE_PARENT_DIRECTORY_REFERENCES = `(?:\\${JSONPointer.Parent}\\${JSONPointer.Separator})+`;

/**
 * Single-character prefix pattern for fragment (#) or current directory (.).
 */
const SINGLE_CHARACTER_PREFIX_PATTERN = `(?:\\${JSONPointer.Fragment}|\\${JSONPointer.Current})`;

/**
 * Regular expression for matching JSON Pointer paths in text.
 * This regex identifies and extracts JSON Pointer references from source code.
 * It supports various path formats including relative, absolute, and fragment references.
 *
 * Supported patterns:
 * - Parent references: '../property', '../../nested/property'
 * - Current directory: './property'
 * - Fragment references: '#/property', '#/' (root)
 * - Absolute paths: '/property', '/nested/path', '/123' (numeric segments)
 * - Parenthesized root: '(/)' (treated as root path)
 *
 * The regex ensures paths are not matched within existing JavaScript identifiers
 * by using negative lookbehind assertions.
 *
 * Special handling for forward slash (/):
 * - When followed immediately by an identifier or digit: treated as absolute path (e.g., '/property', '/123')
 * - When part of #/ or wrapped in parentheses: treated as root (e.g., '#/', '(/)')
 * - When standalone with spaces: treated as division operator (e.g., 'a / b')
 *
 * @example
 * - Matches: './property', '../property', '../../trigger', '#/property', '#/', '/property', '/123', '(/)'
 * - Does not match: '/' (lone slash is division operator)
 */
export const JSON_POINTER_REGEX = new RegExp(
  `${NOT_PRECEDED_BY_IDENTIFIER_CHARACTER}` +
    `(?:` +
    // Pattern 1: Parent directory references (one or more) followed by optional path
    // Matches: '../', '../../property', '../../../nested/path'
    `${MULTIPLE_PARENT_DIRECTORY_REFERENCES}${OPTIONAL_PATH_PATTERN}` +
    `|` +
    // Pattern 2: Single-character prefix (# or .) followed by separator and optional path
    // Matches: '#/', '#/property', './', './property'
    `${SINGLE_CHARACTER_PREFIX_PATTERN}\\${JSONPointer.Separator}${OPTIONAL_PATH_PATTERN}` +
    `|` +
    // Pattern 3: Absolute path - forward slash followed by required path
    // Matches: '/property', '/nested/path', '/123' (including numeric segments)
    // Does not match: '/' (treated as division operator)
    `\\${JSONPointer.Separator}${MULTI_LEVEL_PATH_PATTERN}` +
    `|` +
    // Pattern 4: Parenthesized root slash - slash wrapped in parentheses
    // Matches: '(/)' (treated as root path reference)
    `\\(\\${JSONPointer.Separator}\\)` +
    `)`,
  'g',
);

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
