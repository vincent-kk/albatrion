import {
  FLAT_CONTENT_PATTERN,
  FLAT_ESCAPE_PATTERN,
} from '../../../../utils/cssTokens/flatCssPatterns';

/**
 * Plain selector text, escapes, quote-free parentheses (where a URL token and a
 * component end at the same `)`) and flat brackets: spans the probe would skip identically.
 */
const FLAT_SELECTOR = new RegExp(
  String.raw`(?:[^()[\]{},"'\\/]|${FLAT_ESCAPE_PATTERN}|\([^()[\]{}"'\\/]*\)|\[${FLAT_CONTENT_PATTERN}\])*`,
  'y',
);

/**
 * Read the longest flat selector span.
 * @param css Stylesheet text
 * @param start First code unit of the selector
 * @returns The first index the flat span does not cover; its code unit is a top-level `{`, `}` or `,`
 * only when every code unit before it belongs to a flat selector element
 */
export const getFlatSelectorEnd = (css: string, start: number): number => {
  FLAT_SELECTOR.lastIndex = start;
  FLAT_SELECTOR.test(css);
  return FLAT_SELECTOR.lastIndex;
};
