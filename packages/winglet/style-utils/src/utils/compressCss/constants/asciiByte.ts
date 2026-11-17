/**
 * ASCII byte constants for CSS compression processing.
 * Used for byte-level parsing and whitespace/symbol detection.
 */
export const SPACE = 32, // ' ' - Space character
  TAB = 9, // '\t' - Tab character
  LF = 10, // '\n' - Line feed (newline)
  CR = 13, // '\r' - Carriage return
  SLASH = 47, // '/' - Forward slash (for comments)
  BACKSLASH = 92, // '\' - Backslash (escape inside strings)
  HYPHEN = 45, // '-' - Hyphen (identifier character)
  UNDERSCORE = 95, // '_' - Underscore (identifier character)
  ASTERISK = 42, // '*' - Asterisk (for comments)
  DOUBLE_QUOTE = 34, // '"' - Double quote (string delimiter)
  SINGLE_QUOTE = 39, // "'" - Single quote (string delimiter)
  SEMICOLON = 59, // ';' - Semicolon
  LBRACE = 123, // '{' - Left brace
  RBRACE = 125, // '}' - Right brace
  COLON = 58, // ':' - Colon
  COMMA = 44, // ',' - Comma
  GT = 62, // '>' - Greater than (CSS child combinator)
  PLUS = 43, // '+' - Plus (CSS adjacent sibling combinator)
  TILDE = 126, // '~' - Tilde (CSS general sibling combinator)
  L_PAREN = 40, // '(' - Left parenthesis
  R_PAREN = 41; // ')' - Right parenthesis
