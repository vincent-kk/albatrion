import { findCssPunctuation } from '../../../../utils/cssTokens/findCssPunctuation';
import {
  FLAT_ESCAPE_PATTERN,
  FLAT_STRING_PATTERN,
} from '../../../../utils/cssTokens/flatCssPatterns';

/**
 * Plain selector text, escapes, quote-free parentheses (where a URL token and a
 * component end at the same `)`) and flat brackets: spans the probe would skip identically.
 */
const FLAT_SELECTOR = new RegExp(
  String.raw`(?:[^()[\]{},"'\\/]|${FLAT_ESCAPE_PATTERN}|\([^()[\]{}"'\\/]*\)|\[(?:[^()[\]{}"'\\/]|${FLAT_STRING_PATTERN})*\])*`,
  'y',
);

/**
 * Find the `{`, `}` or `,` that ends one selector, outside strings, comments and components.
 * @param css Stylesheet text
 * @param start First code unit of the selector
 * @param probe The style-rule punctuation probe, which rereads the selector when the flat search
 * stops elsewhere: an escape may spell `url`, so resuming mid-selector could read a later `(` differently
 * @returns The punctuation's index, or the text length when the reader reaches EOF
 */
export const findSelectorStop = (
  css: string,
  start: number,
  probe: RegExp,
): number => {
  FLAT_SELECTOR.lastIndex = start;
  FLAT_SELECTOR.test(css);
  const stop = FLAT_SELECTOR.lastIndex;
  const code = css.charCodeAt(stop);
  if (code === 44 || code === 123 || code === 125 || stop === css.length)
    return stop;
  return findCssPunctuation(css, start, probe);
};
