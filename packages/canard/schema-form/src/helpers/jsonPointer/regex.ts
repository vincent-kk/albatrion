import { JSONPointer } from './enum';

/**
 * Negative lookbehind assertion to prevent matching within existing identifiers.
 * Allows paths to start after operators and punctuation while preventing matches within variable names.
 * More permissive than original to support patterns like !../type.
 * Also prevents multiple consecutive prefix characters like ##/ or .../ and consecutive slashes like #//property.
 */
const NOT_PRECEDED_BY_IDENTIFIER_CHARACTER = `(?<![a-zA-Z0-9_#./])`;

/**
 * Single JSON Pointer path segment pattern.
 * Combines regular characters with proper JSON Pointer escape sequences per RFC 6901.
 * - Regular characters: all except whitespace, parentheses, and special JSON Pointer characters (/, ~)
 * - Escape sequences: ~0 (represents /) and ~1 (represents ~)
 * - Invalid sequences like ~2, ~a, or lone ~ will cause the entire segment to fail matching
 * - Quotes (", ', `) are treated as part of the key, not delimiters
 * - Use parentheses () to explicitly delimit paths from JavaScript expressions when needed
 * @example 'property', '123', 'field~0name' (contains escaped /), 'field~1name' (contains escaped ~), 'config{env}', 'array[0]', 'api.v1.endpoint', '한글', '"quoted"key', "'single'quote", '`backtick`'
 */
const SINGLE_PATH_SEGMENT = `(?:[^\\s\\(\\)/~]|~[01])+`;

/**
 * Multi-level path pattern with segments separated by forward slashes.
 * @example 'property', '123', 'property/subProperty', 'users/0/name'
 */
const MULTI_LEVEL_PATH_PATTERN = `${SINGLE_PATH_SEGMENT}(?:\\${JSONPointer.Separator}${SINGLE_PATH_SEGMENT})*`;

/**
 * Optional path pattern (may or may not exist after a prefix).
 * Uses negative lookahead to prevent matching when followed by another slash.
 */
const OPTIONAL_PATH_PATTERN = `(?:${MULTI_LEVEL_PATH_PATTERN})?(?!\\${JSONPointer.Separator})`;

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
