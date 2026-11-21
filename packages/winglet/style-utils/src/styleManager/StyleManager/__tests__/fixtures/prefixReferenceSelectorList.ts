import { getCssOpaqueEnd } from '../../../../utils/cssTokens/getCssOpaqueEnd';
import { prefixSelector } from '../../utils/prefixSelector';
import { trimSelector } from '../../utils/trimSelector';

/**
 * Scope the components of a selector list.
 * @param css Stylesheet text.
 * @param start First source index in the selector list.
 * @param end Exclusive end of the selector list.
 * @param prefix Scope selector followed by one space.
 * @returns Scoped selectors with only unescaped boundary whitespace trimmed.
 */
export const prefixReferenceSelectorList = (
  css: string,
  start: number,
  end: number,
  prefix: string,
): string => {
  let scoped = '';
  let partStart = start;
  for (let index = start; index < end; index++) {
    if (css[index] === ',') {
      scoped += prefixSelector(trimSelector(css.slice(partStart, index)), prefix) + ',';
      partStart = index + 1;
    } else {
      const next = getCssOpaqueEnd(css, index);
      if (next > index) index = next - 1;
    }
  }
  return scoped + prefixSelector(trimSelector(css.slice(partStart, end)), prefix);
};
