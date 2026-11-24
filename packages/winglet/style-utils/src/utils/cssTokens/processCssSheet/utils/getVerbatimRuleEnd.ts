import {
  FLAT_ESCAPE_PATTERN,
  FLAT_STRING_PATTERN,
} from '../../flatCssPatterns';

/**
 * A style rule whose prelude has only plain text, escapes, quote-free parentheses
 * (where a URL token and a function end at the same `)`) and flat brackets, followed
 * by a flat block: the token reader would end the rule at exactly the same place.
 */
const FLAT_STYLE_RULE = new RegExp(
  String.raw`(?:[^()[\]{}"'\\/]|${FLAT_ESCAPE_PATTERN}|\([^()[\]{}"'\\/]*\)|\[(?:[^()[\]{}"'\\/]|${FLAT_STRING_PATTERN})*\])*\{(?:[^()[\]{}"'\\/]|${FLAT_STRING_PATTERN})*\}`,
  'y',
);

/**
 * An at-rule whose prelude has only plain text without `;`, escapes, quote-free
 * parentheses and flat brackets, and whose block holds plain text, strings and
 * flat nested blocks: the token reader would end the rule at the same place.
 */
const FLAT_AT_RULE = new RegExp(
  String.raw`(?:[^()[\]{}"'\\/;]|${FLAT_ESCAPE_PATTERN}|\([^()[\]{}"'\\/]*\)|\[(?:[^()[\]{}"'\\/]|${FLAT_STRING_PATTERN})*\])*\{(?:[^()[\]{}"'\\/]|${FLAT_STRING_PATTERN}|\{(?:[^()[\]{}"'\\/]|${FLAT_STRING_PATTERN})*\})*\}`,
  'y',
);

/**
 * Skip one complete flat top-level rule that an uncompressed pass copies unchanged.
 * @param css Sheet whose grammar position at `start` is the top-level rule list
 * @param start First code unit of a token that is not whitespace, a comment or a CDO/CDC marker
 * @returns The rule's exclusive end after its block, or zero when token-by-token reading is required
 */
export const getVerbatimRuleEnd = (css: string, start: number): number => {
  const atRule = css.charCodeAt(start) === 64;
  if (atRule) {
    const initial = css.charCodeAt(start + 1) | 32;
    if (initial < 97 || initial > 122) return 0;
  }
  const flat = atRule ? FLAT_AT_RULE : FLAT_STYLE_RULE;
  flat.lastIndex = start;
  return flat.test(css) ? flat.lastIndex : 0;
};
