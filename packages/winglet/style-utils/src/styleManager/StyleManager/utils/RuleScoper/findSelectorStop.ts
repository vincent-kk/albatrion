import { findCssPunctuation } from '../../../../utils/cssTokens/findCssPunctuation';

/** Escape-free string spans, matching the component reader's flat spans. */
const STRING = String.raw`(?:"[^"\\\n\r\f]*(?:"|\r\n|\r(?!\n)|[\n\f])|'[^'\\\n\r\f]*(?:'|\r\n|\r(?!\n)|[\n\f]))`;
/**
 * Plain selector text, quote-free parentheses (where a URL token and a component
 * end at the same `)`) and flat brackets: spans the probe would skip identically.
 */
const FLAT_SELECTOR = new RegExp(
  String.raw`(?:[^()[\]{},"'\\/]|\([^()[\]{}"'\\/]*\)|\[(?:[^()[\]{}"'\\/]|${STRING})*\])*`,
  'y',
);

/**
 * Find the `{`, `}` or `,` that ends one selector, outside strings, comments and components.
 * @param css Stylesheet text
 * @param start First code unit of the selector
 * @param probe The style-rule punctuation probe, used from the first span the flat search cannot classify
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
  return findCssPunctuation(css, stop, probe);
};
