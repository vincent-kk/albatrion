import { FLAT_CONTENT_PATTERN } from '../../../../utils/cssTokens/flatCssPatterns';

/** The flat brace body that the component reader and the flat style rule both accept. */
const FLAT_BLOCK = new RegExp(FLAT_CONTENT_PATTERN + String.raw`\}`, 'y');

/**
 * Read a flat block exactly as the component reader's flat brace search does.
 * @param css Stylesheet text
 * @param open Index of the block's `{`
 * @returns The index after the closing `}`, or zero when the block is not flat
 */
export const getFlatBlockEnd = (css: string, open: number): number => {
  FLAT_BLOCK.lastIndex = open + 1;
  return FLAT_BLOCK.test(css) ? FLAT_BLOCK.lastIndex : 0;
};
