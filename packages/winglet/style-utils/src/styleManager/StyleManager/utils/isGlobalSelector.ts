import { getCssEscapeCode } from '../../../utils/cssTokens/getCssEscapeCode';
import { getCssEscapeEnd } from '../../../utils/cssTokens/getCssEscapeEnd';

/** Recognize a single root/host pseudo token without joining identifiers separated by comments. */
export const isGlobalSelector = (selector: string): boolean => {
  if (selector.charCodeAt(0) !== 58) return false;
  let cursor = 1;
  while (selector.startsWith('/*', cursor)) {
    const end = selector.indexOf('*/', cursor + 2);
    if (end < 0) return false;
    cursor = end + 2;
  }
  let name = '';
  while (cursor < selector.length && name.length <= 4) {
    const code = selector.charCodeAt(cursor);
    const escaped = code === 92;
    const letter = (escaped ? getCssEscapeCode(selector, cursor) : code) | 32;
    if (letter < 97 || letter > 122) break;
    name += String.fromCharCode(letter);
    cursor = escaped ? getCssEscapeEnd(selector, cursor) : cursor + 1;
  }
  return (
    (name === 'root' || name === 'host') &&
    /^(?:\s|\/\*[\s\S]*?\*\/)*$/.test(selector.slice(cursor))
  );
};
