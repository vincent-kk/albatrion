import { CSS_POSITION_CLASS } from './cssPositionClass';
import { getCssEscapeEnd } from './getCssEscapeEnd';
import { getCssStringToken } from './getCssStringToken';
import { getCssUrlEndAtOpen } from './getCssUrlEndAtOpen';
import { getEscapedUrlEnd } from './getEscapedUrlEnd';
import { readCssToken } from './readCssToken';

/**
 * Consume a text component with local nesting and table-classified ordinary runs.
 * @param css Stylesheet text containing the component.
 * @param open Its opening parenthesis, bracket or brace.
 * @returns Position after the matching close, or EOF.
 */
export function getCssTextComponentEnd(css: string, open: number): number {
  const opening = css.charCodeAt(open);
  const close = opening === 40 ? 41 : opening === 91 ? 93 : 125;
  let depth = 1,
    index = open + 1;
  while (index < css.length) {
    let code = css.charCodeAt(index);
    while (code >= 128 || (CSS_POSITION_CLASS[code] & 32) === 0) {
      if (++index >= css.length) return css.length;
      code = css.charCodeAt(index);
    }
    if (code === 34 || code === 39)
      index = Math.floor(getCssStringToken(css, index) / 16);
    else if (code === 92) {
      const url = getEscapedUrlEnd(css, index);
      index = url === index ? getCssEscapeEnd(css, index) : url;
    } else if (code === 47 && css.charCodeAt(index + 1) === 42)
      index = Math.floor(readCssToken(css, index) / 16);
    else if (code === 40 || code === 91 || code === 123) {
      const url = code === 40 ? getCssUrlEndAtOpen(css, index) : index;
      if (url !== index) index = url;
      else if (code === opening) {
        depth++;
        index++;
      } else index = getCssTextComponentEnd(css, index);
    } else if (code === close && --depth === 0) return index + 1;
    else index++;
  }
  return css.length;
}
