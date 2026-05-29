/**
 * JSON Pointer path extraction from computed expressions.
 *
 * Patterns: `#/path` `./path` `../path` `/path` `@` `#` `(/)`
 * Escapes: `~0`(~) `~1`(/) per RFC 6901
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6901
 * @module
 */
import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

/** JS identifier chars for boundary detection */
const IDENTIFIER_CHARS = 'a-zA-Z0-9_';

/** Path prefix chars: `#` `.` `/` `@` */
const PATH_PREFIX_CHARS = `${$.Fragment}${$.Current}${$.Separator}${$.Context}`;

/**
 * Lookbehind: blocks match after identifiers, path chars, quotes, backslash.
 * `foo../bar` `"../path"` `\/pattern\/` → no match
 */
const NOT_PRECEDED_BY_IDENTIFIER_OR_PATH_CHAR = `(?<![${IDENTIFIER_CHARS}${PATH_PREFIX_CHARS}"'\`\\\\])`;

/**
 * Lookahead for `@` `#`: allows `.prop` `[key]` `)]}`  operators `$`.
 * Blocks `/` and identifiers. Use `(@)/path` instead of `@/path`.
 */
const FOLLOWED_BY_VALID_JS_TOKEN = `(?=\\${$.Current}(?![\\${$.Separator}\\${$.Current}])|[\\[\\]\\)\\}\\s,;:?=!<>&|+\\-*%~^]|$)`;

/** Balanced `[...]` `{...}` within segment: `items[0]` `config{env}` */
const BALANCED_BRACKETS = `\\[[^\\s\\(\\)\\[\\]\\{\\}]*\\]`;
const BALANCED_BRACES = `\\{[^\\s\\(\\)\\[\\]\\{\\}]*\\}`;

/**
 * Unbalanced bracket followed by path chars → include in path.
 * `#/weird}key` → include `}`, `${../path}` → exclude `}`
 */
const CONTINUING_BRACKET = `[\\[\\]\\{\\}](?=[^\\s\\(\\)\\[\\]\\{\\}\\${$.Separator}~])`;

/**
 * Path segment: chars except `\s()[]{}~/`, or `~0` `~1`, or balanced/continuing brackets.
 * Valid: `prop` `123` `한글` `field~0name` `items[0]` `config{env}` `weird}key`
 */
const SINGLE_PATH_SEGMENT = `(?:[^\\s\\(\\)\\[\\]\\{\\}\\${$.Separator}~]|~[01]|${BALANCED_BRACKETS}|${BALANCED_BRACES}|${CONTINUING_BRACKET})+`;

/** Multi-level: `segment/segment/...` */
const MULTI_LEVEL_PATH = `${SINGLE_PATH_SEGMENT}(?:\\${$.Separator}${SINGLE_PATH_SEGMENT})*`;

/** Optional path, no trailing slash */
const OPTIONAL_PATH = `(?:${MULTI_LEVEL_PATH})?(?!\\${$.Separator})`;

/** Parent refs: `../` `../../` ... */
const PARENT_REFERENCES = `(?:\\${$.Parent}\\${$.Separator})+`;

/** Fragment/current prefix: `#` `.` */
const FRAGMENT_OR_CURRENT_PREFIX = `(?:\\${$.Fragment}|\\${$.Current})`;

/** Chars blocking standalone `@` `#`: identifiers, path prefixes, quotes, backslash */
const CONTEXT_INVALID_PRECEDING_CHARS = `${IDENTIFIER_CHARS}${PATH_PREFIX_CHARS}"'\`\\\\`;

/**
 * Extracts JSON Pointer paths from JS expressions.
 *
 * | Pattern | Example | Match |
 * |---------|---------|-------|
 * | Fragment/Current | `#/prop` `./prop` | full path |
 * | Parent | `../prop` `../../prop` | full path |
 * | Absolute | `/prop` | full path |
 * | Context | `@` `@.prop` | `@` only (JS handles `.prop`) |
 * | Root | `(/)` | `/` only |
 * | Fragment | `#` `#.prop` | `#` only (JS handles `.prop`) |
 *
 * Division vs Path:
 * - `/prop` → path, `a / b` → division (spaces)
 * - `../val/2` → path, `../val / 2` → path + division
 * - `@/path` → no match (ambiguous), use `(@)/path`
 *
 * Limitations:
 * - Nested brackets: `items[a[0]]` → stops at inner `]`
 * - Spaces in brackets: `items[ 0 ]` → stops at space
 *
 * @example
 * '../enabled === true'  → ['../enabled']
 * '@.canEdit && ../x'    → ['@', '../x']
 * '(../price) / 100'     → ['../price']
 */
export const JSON_POINTER_PATH_REGEX = new RegExp(
  `${NOT_PRECEDED_BY_IDENTIFIER_OR_PATH_CHAR}` +
    `(?:` +
    // Pattern 1: #/ or ./ with optional path
    `${FRAGMENT_OR_CURRENT_PREFIX}\\${$.Separator}${OPTIONAL_PATH}` +
    `|` +
    // Pattern 2: ../ (one or more) with optional path
    `${PARENT_REFERENCES}${OPTIONAL_PATH}` +
    `|` +
    // Pattern 3: /path (requires path, lone / is division)
    `\\${$.Separator}${MULTI_LEVEL_PATH}` +
    `|` +
    // Pattern 4: @ standalone
    `(?:(?<![${CONTEXT_INVALID_PRECEDING_CHARS}])\\${$.Context}|^\\${$.Context})${FOLLOWED_BY_VALID_JS_TOKEN}` +
    `|` +
    // Pattern 5: (/) → captures / only
    `(?<=\\()\\${$.Separator}(?=\\))` +
    `|` +
    // Pattern 6: # standalone
    `(?:(?<![${CONTEXT_INVALID_PRECEDING_CHARS}])\\${$.Fragment}|^\\${$.Fragment})${FOLLOWED_BY_VALID_JS_TOKEN}` +
    `)`,
  'g',
);

/**
 * Detects simple equality: `dependencies[n] === "value"`
 *
 * Captures: [index, quote, value]
 * @example `dependencies[0] === "active"` → ['0', '"', 'active']
 */
export const SIMPLE_EQUALITY_REGEX =
  /^\s*\(?\s*dependencies\[(\d+)\]\s*\)?\s*===\s*(['"])([^'"]+)\2\s*$/;
