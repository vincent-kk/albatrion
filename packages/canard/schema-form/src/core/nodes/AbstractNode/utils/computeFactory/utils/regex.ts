/**
 * @fileoverview Regular expressions for JSON Pointer path matching in computed expressions.
 *
 * This module provides regex patterns to extract JSON Pointer references from JavaScript
 * expressions used in computed properties (visible, active, readOnly, disabled, watch).
 *
 * ## Supported Path Types
 *
 * ### RFC 6901 Standard Paths
 * - Fragment identifier: `#/property`, `#/nested/path`
 * - Absolute paths: `/property`, `/nested/path`
 * - Escape sequences: `~0` (literal ~), `~1` (literal /)
 *
 * ### Extended Syntax (Non-standard)
 * - Parent reference: `../property`, `../../nested/path`
 * - Current directory: `./property`
 * - Context reference: `@` (standalone only)
 * - Parenthesized root: `(/)` (root path in expressions)
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6901 - JSON Pointer RFC
 * @module
 */
import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

/**
 * Characters that form valid JavaScript identifiers.
 * Used for boundary detection to prevent matching within variable names.
 */
const IDENTIFIER_CHARS = 'a-zA-Z0-9_';

/**
 * Characters used as path prefixes in JSON Pointer syntax.
 * Includes both RFC 6901 standard (#, /) and extended syntax (., @).
 */
const PATH_PREFIX_CHARS = `${$.Fragment}${$.Current}${$.Separator}${$.Context}`;

/**
 * Negative lookbehind to prevent matching within identifiers or after path prefixes.
 *
 * Prevents matches in these contexts:
 * - Within identifiers: `variable../path` → should not match `../path`
 * - After path chars: `##/prop`, `.../prop`, `//prop` → prevents duplicates
 * - After context: `@/path` → `/path` should not be matched separately
 *
 * @example
 * - `foo../bar` → no match (preceded by identifier 'foo')
 * - `!../bar` → matches `../bar` (preceded by operator '!')
 * - `(@)` → matches `@` (preceded by '(')
 */
const NOT_PRECEDED_BY_IDENTIFIER_OR_PATH_CHAR = `(?<![${IDENTIFIER_CHARS}${PATH_PREFIX_CHARS}])`;

/**
 * Negative lookahead to prevent Context (@) from matching when followed by paths or identifiers.
 *
 * Prevents @ from matching when followed by:
 * - Identifier characters: `@property`, `@123`, `@_var`
 * - Path separator: `@/path`
 * - Current/Parent paths: `@./path`, `@../path`
 *
 * Allows @ to match when followed by:
 * - Whitespace: `@ `, `@  `
 * - Operators: `@ ===`, `@ &&`
 * - Parentheses: `@)`, `(@)`
 * - Property access: `@.property` (@ matches, .property remains as JS)
 */
const NOT_FOLLOWED_BY_PATH_START = `(?![${IDENTIFIER_CHARS}\\${$.Separator}]|\\${$.Current}(?:[\\${$.Separator}\\${$.Current}]))`;

/**
 * Single JSON Pointer path segment pattern per RFC 6901.
 *
 * A segment consists of:
 * - Regular characters: all except whitespace, parentheses, `/`, `~`
 * - Escape sequences: `~0` (represents `~`), `~1` (represents `/`)
 *
 * Invalid sequences like `~2`, `~a`, or lone `~` will fail to match.
 *
 * @example Valid segments:
 * - `property` - simple property name
 * - `123` - numeric index
 * - `field~0name` - contains escaped ~ (represents `field~name`)
 * - `path~1segment` - contains escaped / (represents `path/segment`)
 * - `한글` - Unicode property name
 * - `config{env}` - special characters allowed
 * - `"quoted"` - quotes treated as part of key
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6901#section-3
 */
const SINGLE_PATH_SEGMENT = `(?:[^\\s\\(\\)\\${$.Separator}~]|~[01])+`;

/**
 * Multi-level path with segments separated by forward slashes.
 *
 * @example
 * - `property` - single segment
 * - `users/0/name` - multiple segments
 * - `data/items/0` - mixed string and numeric segments
 */
const MULTI_LEVEL_PATH = `${SINGLE_PATH_SEGMENT}(?:\\${$.Separator}${SINGLE_PATH_SEGMENT})*`;

/**
 * Optional path pattern (may or may not exist after a prefix).
 * Uses negative lookahead to prevent trailing slash issues.
 *
 * @example
 * - `#/` matches with empty path
 * - `#/property` matches with path
 * - `#//invalid` won't match double slash
 */
const OPTIONAL_PATH = `(?:${MULTI_LEVEL_PATH})?(?!\\${$.Separator})`;

/**
 * Parent directory references (one or more `../` sequences).
 * This is a non-standard extension for relative path navigation.
 *
 * @example
 * - `../` - one level up
 * - `../../` - two levels up
 * - `../../../` - three levels up
 */
const PARENT_REFERENCES = `(?:\\${$.Parent}\\${$.Separator})+`;

/**
 * Single-character prefix: fragment (`#`) or current directory (`.`).
 * Both require a following separator to form a valid path.
 */
const FRAGMENT_OR_CURRENT_PREFIX = `(?:\\${$.Fragment}|\\${$.Current})`;

/**
 * Context symbol (@) boundary pattern for valid preceding characters.
 * Context can appear after whitespace or opening parenthesis.
 */
const CONTEXT_VALID_PRECEDING = `[\\s(]`;

/**
 * Regular expression for extracting JSON Pointer paths from JavaScript expressions.
 *
 * This regex identifies and extracts JSON Pointer references from computed property
 * expressions, supporting both RFC 6901 standard syntax and custom extensions.
 *
 * ## Pattern Matching Priority
 *
 * 1. **Parent References** (`../`, `../../property`)
 *    - One or more `../` followed by optional path
 *
 * 2. **Fragment/Current** (`#/`, `#/property`, `./`, `./property`)
 *    - Single prefix char + separator + optional path
 *
 * 3. **Absolute Paths** (`/property`, `/nested/path`)
 *    - Separator + required path (prevents lone `/` as division)
 *
 * 4. **Parenthesized Root** (`(/)`)
 *    - Explicit root reference in expressions
 *
 * 5. **Context Reference** (`@`)
 *    - Standalone @ symbol only (not `@/`, `@property`)
 *
 * ## Boundary Handling
 *
 * The regex uses lookbehind/lookahead assertions to:
 * - Prevent matching within JavaScript identifiers
 * - Distinguish `/` as path separator vs division operator
 * - Ensure `@` is standalone (not part of email or decorator)
 *
 * @example Matches
 * ```
 * '../property'      → ['../property']
 * '#/config/value'   → ['#/config/value']
 * './current'        → ['./current']
 * '/absolute/path'   → ['/absolute/path']
 * '(/)'              → ['(/)']
 * '@'                → ['@']
 * '@.prop'           → ['@'] (@ only, .prop is JS access)
 * '../a && #/b'      → ['../a', '#/b']
 * ```
 *
 * @example Does Not Match
 * ```
 * '/'                → [] (division operator)
 * '@property'        → [] (@ must be standalone)
 * '@/path'           → [] (@ cannot prefix paths)
 * 'var../path'       → [] (preceded by identifier)
 * '"@"'              → [] (inside string literal)
 * ```
 */
export const JSON_POINTER_PATH_REGEX = new RegExp(
  `${NOT_PRECEDED_BY_IDENTIFIER_OR_PATH_CHAR}` +
    `(?:` +
    // ──────────────────────────────────────────────────────────────────────
    // Pattern 1: Parent directory references with optional trailing path
    // Matches: '../', '../../property', '../../../nested/path'
    // ──────────────────────────────────────────────────────────────────────
    `${PARENT_REFERENCES}${OPTIONAL_PATH}` +
    `|` +
    // ──────────────────────────────────────────────────────────────────────
    // Pattern 2: Fragment (#) or current (.) prefix with separator and path
    // Matches: '#/', '#/property', './', './property'
    // ──────────────────────────────────────────────────────────────────────
    `${FRAGMENT_OR_CURRENT_PREFIX}\\${$.Separator}${OPTIONAL_PATH}` +
    `|` +
    // ──────────────────────────────────────────────────────────────────────
    // Pattern 3: Absolute path (separator followed by required path)
    // Matches: '/property', '/nested/path', '/123'
    // Does NOT match: '/' alone (treated as division operator)
    // ──────────────────────────────────────────────────────────────────────
    `\\${$.Separator}${MULTI_LEVEL_PATH}` +
    `|` +
    // ──────────────────────────────────────────────────────────────────────
    // Pattern 4: Parenthesized root - explicit root path reference
    // Matches: '(/)' only
    // Use case: Accessing root in expressions like '(/).property'
    // ──────────────────────────────────────────────────────────────────────
    `\\(\\${$.Separator}\\)` +
    `|` +
    // ──────────────────────────────────────────────────────────────────────
    // Pattern 5: Context reference - standalone @ symbol
    // Matches: '@' when preceded by start/whitespace/( and not followed by path
    // Does NOT match: '@property', '@/path', '@./', '@../'
    // Note: '@.prop' matches '@' only; '.prop' remains as JavaScript access
    // ──────────────────────────────────────────────────────────────────────
    `(?:(?<=${CONTEXT_VALID_PRECEDING})\\${$.Context}|^\\${$.Context})${NOT_FOLLOWED_BY_PATH_START}` +
    `)`,
  'g',
);

/**
 * Pattern for optimized simple equality comparison detection.
 *
 * Matches expressions in the form:
 * - `dependencies[n] === "value"`
 * - `(dependencies[n]) === "value"`
 *
 * This pattern enables optimization by detecting simple comparisons that can be
 * evaluated without full expression parsing. When a computed expression matches
 * this pattern, it can be short-circuited for better performance.
 *
 * ## Capture Groups
 * - Group 1: Array index (e.g., `0`, `1`, `2`)
 * - Group 2: Quote character (`'` or `"`)
 * - Group 3: Comparison value
 *
 * @example Matches
 * ```
 * 'dependencies[0] === "active"'       → ['0', '"', 'active']
 * "dependencies[1] === 'enabled'"      → ['1', "'", 'enabled']
 * '(dependencies[2]) === "value"'      → ['2', '"', 'value']
 * ```
 *
 * @example Does Not Match
 * ```
 * 'dependencies[0] !== "value"'        → (uses !== not ===)
 * 'dependencies[0] === true'           → (boolean, not string)
 * 'deps[0] === "value"'                → (wrong array name)
 * ```
 */
export const SIMPLE_EQUALITY_REGEX =
  /^\s*\(?\s*dependencies\[(\d+)\]\s*\)?\s*===\s*(['"])([^'"]+)\2\s*$/;
