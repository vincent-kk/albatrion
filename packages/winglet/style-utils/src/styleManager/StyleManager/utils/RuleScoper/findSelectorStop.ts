import { findCssPunctuation } from '../../../../utils/cssTokens/findCssPunctuation';
import { getFlatSelectorEnd } from './getFlatSelectorEnd';

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
  const stop = getFlatSelectorEnd(css, start);
  const code = css.charCodeAt(stop);
  if (code === 44 || code === 123 || code === 125 || stop === css.length)
    return stop;
  return findCssPunctuation(css, start, probe);
};
