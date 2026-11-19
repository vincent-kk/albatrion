import { CssTokenKind } from '../../cssTokens/CssTokenKind';
import { getCssComponentEnd } from '../../cssTokens/getCssComponentEnd';
import { readCssToken } from '../../cssTokens/readCssToken';
import { type CssSource, readCssCode } from '../../cssTokens/readCssCode';

/**
 * Distinguish declaration punctuation from a descendant pseudo selector.
 * @param source Stylesheet code units or bytes.
 * @param colon Colon whose following component values determine its role.
 * @returns Whether a declaration terminator occurs before a rule block opener.
 */
export function isDeclarationColon(source: CssSource, colon: number): boolean {
  let index = colon + 1;
  while (index < source.length) {
    const token = readCssToken(source, index), kind = token % 16;
    const end = Math.floor(token / 16), code = readCssCode(source, index);
    if (kind === CssTokenKind.Function) index = getCssComponentEnd(source, end - 1);
    else if (kind === CssTokenKind.Delimiter) {
      if (code === 59 || code === 125) return true;
      if (code === 123) return false;
      index = code === 40 || code === 91 ? getCssComponentEnd(source, index) : end;
    } else index = end;
  }
  return false;
}
