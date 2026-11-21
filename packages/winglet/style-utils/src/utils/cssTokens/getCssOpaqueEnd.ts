import { getCssComponentEnd } from './getCssComponentEnd';
import { getCssEscapeEnd } from './getCssEscapeEnd';
import { getCssUrlEndAtOpen } from './getCssUrlEndAtOpen';
import { getEscapedUrlEnd } from './getEscapedUrlEnd';
import { readCssToken } from './readCssToken';
import { type CssSource, readCssCode } from './readCssCode';

/**
 * Locate opaque token and component boundaries through the common position model.
 * @param source Stylesheet code units or bytes.
 * @param index Candidate quote, comment, escape, parenthesis or bracket.
 * @returns End of that opaque span, or the original position for ordinary text.
 */
export function getCssOpaqueEnd(source: CssSource, index: number): number {
  const code = readCssCode(source, index);
  if (code === 92) {
    const url = getEscapedUrlEnd(source, index);
    return url === index ? getCssEscapeEnd(source, index) : url;
  }
  if (code === 34 || code === 39 || (code === 47 && readCssCode(source, index + 1) === 42)) return Math.floor(readCssToken(source, index) / 16);
  if (code === 40) {
    const url = getCssUrlEndAtOpen(source, index);
    return url === index ? getCssComponentEnd(source, index) : url;
  }
  return code === 91 ? getCssComponentEnd(source, index) : index;
}
