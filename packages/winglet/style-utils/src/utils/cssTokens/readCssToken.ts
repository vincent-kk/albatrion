import { CssTokenKind } from './CssTokenKind';
import { getCssNameEnd } from './getCssNameEnd';
import { getCssNumberEnd } from './getCssNumberEnd';
import { getCssStringToken } from './getCssStringToken';
import { getCssUrlToken } from './getCssUrlToken';
import { isCssNameStart } from './isCssNameStart';
import { isCssUrlName } from './isCssUrlName';
import { type CssSource, readCssCode } from './readCssCode';

/**
 * Read one CSS Syntax lexical position without allocating token objects.
 * @param source Stylesheet code units or ASCII-compatible bytes.
 * @param start First code unit of a token.
 * @returns First position after the token times sixteen plus its category.
 */
export function readCssToken(source: CssSource, start: number): number {
  const code = readCssCode(source, start);
  let index = start + 1;
  if (code === 32 || code === 9 || code === 10 || code === 12 || code === 13) {
    while (index < source.length) {
      const next = readCssCode(source, index);
      if (next !== 32 && next !== 9 && next !== 10 && next !== 12 && next !== 13) break;
      index++;
    }
    return index * 16 + CssTokenKind.Whitespace;
  }
  if (code === 47 && readCssCode(source, index) === 42) {
    index++;
    while (index < source.length && !(readCssCode(source, index) === 42 && readCssCode(source, index + 1) === 47)) index++;
    return index < source.length ? (index + 2) * 16 + CssTokenKind.Comment : source.length * 16 + CssTokenKind.OpenComment;
  }
  if (code === 34 || code === 39) return getCssStringToken(source, start);
  if (code === 123 || code === 125 || code === 58 || code === 59 || code === 44 || code === 40 || code === 41 || code === 91 || code === 93 || code === 62 || code === 126 || code === 61 || code === 42) return index * 16 + CssTokenKind.Delimiter;
  const next = readCssCode(source, index);
  const after = readCssCode(source, index + 1);
  if ((code >= 48 && code <= 57) || (code === 46 && next >= 48 && next <= 57) || ((code === 43 || code === 45) && ((next >= 48 && next <= 57) || (next === 46 && after >= 48 && after <= 57)))) {
    index = getCssNumberEnd(source, start);
    if (isCssNameStart(source, index)) return getCssNameEnd(source, index) * 16 + CssTokenKind.Dimension;
    if (readCssCode(source, index) === 37) return (index + 1) * 16 + CssTokenKind.Percentage;
    return index * 16 + CssTokenKind.Number;
  }
  if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code === 95 || code >= 128 || isCssNameStart(source, start)) {
    index = getCssNameEnd(source, start);
    if (readCssCode(source, index) !== 40) return index * 16 + CssTokenKind.Name;
    if (isCssUrlName(source, start, index)) {
      const url = getCssUrlToken(source, index);
      if (url !== 0) return url;
    }
    return (index + 1) * 16 + CssTokenKind.Function;
  }
  if ((code === 35 || code === 64) && (isCssNameStart(source, index) || (next >= 48 && next <= 57)))
    return getCssNameEnd(source, index) * 16 + (code === 35 ? CssTokenKind.Hash : CssTokenKind.AtKeyword);
  return index * 16 + CssTokenKind.Delimiter;
}
