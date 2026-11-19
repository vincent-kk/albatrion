import { CssTokenKind } from './CssTokenKind';
import { type CssSource, readCssCode } from './readCssCode';

/**
 * Materialize an opaque token's EOF semantics without re-reading the fragment.
 * @param source Text or bytes whose last lexical token is known
 * @param kind Category of the final token
 * @param start Its opening position
 * @param compressed Whether comments were removed by the writer
 * @returns Only the lexical suffix; component closure belongs to the position stack
 */
export const getCssEofSuffix = (source: CssSource, kind: CssTokenKind, start: number, compressed: boolean): string => {
  if (kind === CssTokenKind.OpenComment) return compressed ? '' : '*/';
  if (kind !== CssTokenKind.OpenString && kind !== CssTokenKind.OpenUrl && kind !== CssTokenKind.Name && kind !== CssTokenKind.Hash && kind !== CssTokenKind.Dimension && kind !== CssTokenKind.AtKeyword) return '';
  let slashes = 0;
  for (let index = source.length - 1; readCssCode(source, index) === 92; index--) slashes++;
  const odd = slashes % 2 !== 0;
  if (kind === CssTokenKind.OpenString) return (odd ? '\n' : '') + String.fromCharCode(readCssCode(source, start));
  if (kind === CssTokenKind.OpenUrl) return (odd ? '\uFFFD' : '') + ')';
  return odd ? '\uFFFD' : '';
};
