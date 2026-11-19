/** CSS string spans include the newline that ends a bad string. */
const STRING = String.raw`(?:"[^"\\\n\r\f]*(?:"|\r\n|[\n\r\f])|'[^'\\\n\r\f]*(?:'|\r\n|[\n\r\f]))`;
/** Comments and valid escapes cannot contribute structural punctuation. */
const OPAQUE = String.raw`(?:${STRING}|\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\/|\\(?:[0-9a-fA-F]{1,6}(?:\r\n|[ \t\n\r\f])?|[^\n\r\f]))`;
/** Flat components admit opaque spans but defer nested components to token traversal. */
const COMPONENT = String.raw`(?:[^{}()[\]"'\\/]|${OPAQUE})`;
/** A URL token consumes punctuation through its unescaped closing parenthesis. */
const URL = String.raw`(?<![-_a-zA-Z0-9\u0080-\uffff\\])url\((?:[^)"'\\\s]|\\(?:\r\n|[\s\S]))*\)`;
/** Complete flat model alternatives, shared by prelude and declaration probes. */
const SPAN = String.raw`(?:${COMPONENT}|${URL}|\(${COMPONENT}*\)|\[${COMPONENT}*\])*`;
/** Ordinary sheets need only conservative native spans, without the opaque alternatives. */
const SIMPLE_PRELUDE = /(?:[^{}()[\]"'\\/]|\([^{}()[\]"'\\/]*\)|\[[^{}()[\]"'\\/]*\])*\{/y;
/** A plain declaration block cannot contain nested or opaque content. */
const SIMPLE_BLOCK = /[^{}()[\]"'\\/]*\}/y;
/** At-rule statement boundaries use the same plain component model. */
const SIMPLE_STATEMENT = /(?:[^;{}()[\]"'\\/]|\([^{}()[\]"'\\/]*\)|\[[^{}()[\]"'\\/]*\])*[;{}]/y;
/** Qualified rule prelude ending at a structural opening brace. */
const PRELUDE = new RegExp(SPAN + String.raw`\{`, 'iy');
/** At-rule preludes stop at their first non-opaque statement or block delimiter. */
const STATEMENT = new RegExp(SPAN.split('[^{}(').join('[^;{}(') + '[;{}]', 'iy');
/** Flat declaration block ending at a structural closing brace. */
const BLOCK = new RegExp(SPAN + String.raw`\}`, 'iy');

/**
 * Recognize a complete flat lexical span without allocating token objects.
 * @param css Stylesheet text.
 * @param start First code unit to examine.
 * @param isBlock Whether to seek a closing rather than an opening brace.
 * @param statementEnd Whether semicolons also terminate the prelude.
 * @returns Structural brace position, or -1 when full component traversal is required.
 */
export function getCssFlatSpanEnd(css: string, start: number, isBlock: boolean, statementEnd = false): number {
  const simple = statementEnd ? SIMPLE_STATEMENT : isBlock ? SIMPLE_BLOCK : SIMPLE_PRELUDE;
  simple.lastIndex = start;
  if (simple.test(css)) return simple.lastIndex - 1;
  const probe = statementEnd ? STATEMENT : isBlock ? BLOCK : PRELUDE;
  probe.lastIndex = start;
  return probe.test(css) ? probe.lastIndex - 1 : -1;
}
