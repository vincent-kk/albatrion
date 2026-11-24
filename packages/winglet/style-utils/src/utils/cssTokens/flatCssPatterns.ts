/**
 * Escape-free string spans: a quote through its closing quote, or through the
 * newline that ends a bad string, as the string reader ends them.
 */
export const FLAT_STRING_PATTERN = String.raw`(?:"[^"\\\n\r\f]*(?:"|\r\n|\r(?!\n)|[\n\f])|'[^'\\\n\r\f]*(?:'|\r\n|\r(?!\n)|[\n\f]))`;

/**
 * One escape as the escape reader consumes it: up to six hex digits and one
 * optional whitespace (CRLF counts once), or any other single code unit except a newline.
 * Every branch admits exactly one split, so a failed match never backtracks into an escape.
 */
export const FLAT_ESCAPE_PATTERN = String.raw`\\(?:(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{1,5}(?![0-9a-fA-F]))(?:\r\n|\r(?!\n)|[ \t\n\f]|(?![ \t\n\r\f]))|[^0-9a-fA-F\n\r\f])`;
