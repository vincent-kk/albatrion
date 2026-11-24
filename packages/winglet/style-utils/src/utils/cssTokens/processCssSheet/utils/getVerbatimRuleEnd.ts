import { createCssPunctuationProbe } from '../../createCssPunctuationProbe';
import { findCssPunctuation } from '../../findCssPunctuation';
import { getCssComponentEnd } from '../../getCssComponentEnd';

/** A qualified rule's prelude ends at its block; a stray `}` needs the token reader. */
const STYLE_PRELUDE = createCssPunctuationProbe('{}');
/** An at-rule's prelude also ends at a statement semicolon. */
const AT_RULE_PRELUDE = createCssPunctuationProbe('{};');

/**
 * Skip one complete top-level rule that an uncompressed pass copies unchanged.
 * @param css Sheet whose grammar position at `start` is the top-level rule list
 * @param start First code unit of a token that is not whitespace, a comment or a CDO/CDC marker
 * @returns The rule's exclusive end after its block or statement semicolon, or zero when token-by-token reading is required
 */
export const getVerbatimRuleEnd = (css: string, start: number): number => {
  const first = css.charCodeAt(start);
  const atRule = first === 64;
  if (atRule) {
    const initial = css.charCodeAt(start + 1) | 32;
    if (initial < 97 || initial > 122) return 0;
  }
  const stop = findCssPunctuation(
    css,
    start,
    atRule ? AT_RULE_PRELUDE : STYLE_PRELUDE,
  );
  const code = css.charCodeAt(stop);
  if (code === 59) return stop + 1;
  return code === 123 ? getCssComponentEnd(css, stop, 0) : 0;
};
