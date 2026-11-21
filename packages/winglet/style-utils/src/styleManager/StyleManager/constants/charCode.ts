/**
 * UTF-16 code units the CSS scoper compares with `String.prototype.charCodeAt`.
 */
export const DOUBLE_QUOTE = 34, // '"'
  SINGLE_QUOTE = 39, // "'"
  L_PAREN = 40, // '('
  R_PAREN = 41, // ')'
  ASTERISK = 42, // '*'
  COMMA = 44, // ','
  HYPHEN = 45, // '-'
  SLASH = 47, // '/'
  COLON = 58, // ':'
  SEMICOLON = 59, // ';'
  AT_SIGN = 64, // '@'
  BACKSLASH = 92, // '\'
  UNDERSCORE = 95, // '_'
  LBRACE = 123, // '{'
  RBRACE = 125, // '}'
  WHITESPACE_MAX = 32, // ' ' and every control character below it
  NON_ASCII_MIN = 128; // first code unit outside ASCII, where Unicode whitespace may sit
