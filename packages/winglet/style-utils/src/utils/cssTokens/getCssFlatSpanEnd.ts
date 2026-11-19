/** CSS strings containing escapes defer to the complete code-unit state machine. */
const STRING = String.raw`(?:"[^"\\\n\r\f]*(?:"|\r\n|[\n\r\f])|'[^'\\\n\r\f]*(?:'|\r\n|[\n\r\f]))`;
/** A plain unquoted URL start is excluded from the ordinary-name alternative. */
const URL_OPEN = String.raw`(?<![-_a-zA-Z0-9\u0080-\uffff\\])url\((?![ \t\n\r\f]*["'])`;
/** URL and bad-URL remnants consume all punctuation through the unescaped close. */
const URL = String.raw`${URL_OPEN}(?:[^)\\]|\\[\s\S])*\)`;
/** Terminated comments and escape-free strings are disjoint opaque alternatives. */
const OPAQUE = String.raw`(?:${STRING}|\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\/)`;
/** Plain characters cannot start another alternative, keeping failed probes linear. */
const COMPONENT = String.raw`(?:(?!${URL_OPEN})[^{}()[\]"'\\/]|${OPAQUE}|${URL})`;
/** Nested components defer to the full model rather than backtracking through token objects. */
const SPAN = String.raw`(?:${COMPONENT}|\(${COMPONENT}*\)|\[${COMPONENT}*\])*`;
/** Ordinary sheets use native spans without opaque alternatives. */
const SIMPLE_PRELUDE = /(?:[^{}()[\]"'\\/]|\([^{}()[\]"'\\/]*\)|\[[^{}()[\]"'\\/]*\])*\{/y;
/** A plain declaration block contains neither nested nor opaque content. */
const SIMPLE_BLOCK = /[^{}()[\]"'\\/]*\}/y;
/** Statement parsing stops at the first non-opaque statement or block delimiter. */
const SIMPLE_STATEMENT = /(?:[^;{}()[\]"'\\/]|\([^{}()[\]"'\\/]*\)|\[[^{}()[\]"'\\/]*\])*[;{}]/y;
/** Qualified rule prelude. */
const PRELUDE = new RegExp(SPAN + String.raw`\{`, 'iy');
/** At-rule prelude. */
const STATEMENT = new RegExp(SPAN.split('[^{}(').join('[^;{}(') + '[;{}]', 'iy');
/** Declaration block. */
const BLOCK = new RegExp(SPAN + String.raw`\}`, 'iy');
/** Whole ordinary rules are proven with one native probe. */
const SIMPLE_RULE = /(?:[^{}()[\]"'\\/]|\([^{}()[\]"'\\/]*\)|\[[^{}()[\]"'\\/]*\])*\{[^{}()[\]"'\\/]*\}/y;
/** This prelude excludes every raw opening brace from opaque spans. */
const RULE_TOKEN = String.raw`(?:[^{}()[\]"'\\/]|"[^{"\\\n\r\f]*"|'[^{'\\\n\r\f]*')`;
/** The first raw opening brace is structural; block token boundaries still use the shared grammar. */
const RULE = new RegExp(String.raw`(?:${RULE_TOKEN}|\(${RULE_TOKEN}*\)|\[${RULE_TOKEN}*\])*\{${SPAN}\}`, 'iy');

/**
 * Recognize a complete flat lexical span without allocating token objects.
 * @param css Stylesheet text.
 * @param start First code unit to examine.
 * @param isBlock Whether to seek a closing rather than an opening brace.
 * @param statementEnd Whether semicolons also terminate the prelude.
 * @returns Structural brace position, or -1 for full component traversal.
 */
export function getCssFlatSpanEnd(css: string, start: number, isBlock: boolean, statementEnd = false): number {
  const simple = statementEnd ? SIMPLE_STATEMENT : isBlock ? SIMPLE_BLOCK : SIMPLE_PRELUDE;
  simple.lastIndex = start;
  if (simple.test(css)) return simple.lastIndex - 1;
  const probe = statementEnd ? STATEMENT : isBlock ? BLOCK : PRELUDE;
  probe.lastIndex = start;
  return probe.test(css) ? probe.lastIndex - 1 : -1;
}

/**
 * Locate both flat-rule braces with no intermediate token or position objects.
 * @param css Stylesheet text.
 * @param start Start of the qualified rule.
 * @returns close * (length + 1) + open, or -1 for full traversal; very large sheets use full traversal.
 */
export function getCssFlatRule(css: string, start: number): number {
  if (css.length > 0x3ffffff) return -1;
  SIMPLE_RULE.lastIndex = start;
  if (!SIMPLE_RULE.test(css)) { RULE.lastIndex = start; if (!RULE.test(css)) return -1; return (RULE.lastIndex - 1) * (css.length + 1) + css.indexOf('{', start); }
  return (SIMPLE_RULE.lastIndex - 1) * (css.length + 1) + css.indexOf('{', start);
}
