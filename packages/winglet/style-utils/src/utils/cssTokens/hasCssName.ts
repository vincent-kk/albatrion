import { getCssEscapeCode } from './getCssEscapeCode';
import { getCssEscapeEnd } from './getCssEscapeEnd';
import { type CssSource, readCssCode } from './readCssCode';

/**
 * Compare an already-tokenized name with an ASCII grammar keyword or prefix.
 * @param source CSS text or bytes
 * @param start First position of the name
 * @param end Position after the complete name
 * @param expected ASCII spelling, compared without letter case
 * @param complete Whether the complete name must match rather than only its prefix
 * @returns Whether decoded token characters match the requested spelling
 */
export const hasCssName = (source: CssSource, start: number, end: number, expected: string, complete = true): boolean => {
  let index = start;
  for (let count = 0; count < expected.length; count++) {
    const code = readCssCode(source, index);
    if (((code === 92 ? getCssEscapeCode(source, index) : code) | 32) !== (expected.charCodeAt(count) | 32)) return false;
    index = code === 92 ? getCssEscapeEnd(source, index) : index + 1;
  }
  return complete ? index === end : index <= end;
};
