import { getCssEscapeEnd } from './getCssEscapeEnd';
import { type CssSource, readCssCode } from './readCssCode';

/** Sticky native spans consume ordinary name code units without token or match objects. */
const PLAIN_NAME = /[-_a-zA-Z0-9\u0080-\uffff]+/y;

/**
 * Consume a CSS name and complete valid escapes, including hex terminator whitespace.
 * @param source Stylesheet code units or bytes.
 * @param index First name code unit.
 * @returns First position outside the name.
 */
export function getCssNameEnd(source: CssSource, index: number): number {
  if (typeof source === 'string') {
    PLAIN_NAME.lastIndex = index;
    if (PLAIN_NAME.test(source)) {
      index = PLAIN_NAME.lastIndex;
      if (source.charCodeAt(index) !== 92) return index;
    }
  }
  while (index < source.length) {
    const code = readCssCode(source, index);
    if (code === 0 || code >= 128 || code === 45 || code === 95 || (code >= 48 && code <= 57) || ((code | 32) >= 97 && (code | 32) <= 122)) index++;
    else if (code === 92) {
      const next = readCssCode(source, index + 1);
      if (next === 10 || next === 13 || next === 12) break;
      index = getCssEscapeEnd(source, index);
    } else break;
  }
  return index;
}
