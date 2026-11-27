/** Packed token categories; the low four bits never contain an allocated token object. */
export enum CssTokenKind {
  /** One punctuation code unit outside opaque content. */
  Delimiter,
  /** CSS whitespace outside escapes and strings. */
  Whitespace,
  /** A terminated comment. */
  Comment,
  /** A comment ended by EOF. */
  OpenComment,
  /** A terminated quoted string. */
  String,
  /** A quoted string ended by EOF. */
  OpenString,
  /** A string recovered at an unescaped newline. */
  BadString,
  /** An opaque URL or bad-URL token. */
  Url,
  /** An opaque URL ended by EOF. */
  OpenUrl,
  /** An identifier, including its complete escapes. */
  Name,
  /** A function name and its opening parenthesis. */
  Function,
  /** A numeric token. */
  Number,
  /** A number followed by a unit name. */
  Dimension,
  /** A number followed by a percent sign. */
  Percentage,
  /** A hash and its name. */
  Hash,
  /** An at-sign and its name. */
  AtKeyword,
}
