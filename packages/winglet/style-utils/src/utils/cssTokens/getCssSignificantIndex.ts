import { CssTokenKind } from './CssTokenKind';
import { readCssToken } from './readCssToken';
import { type CssSource, readCssCode } from './readCssCode';

/**
 * Find the next non-comment, non-whitespace token in a lexical stream.
 * @param source Stylesheet code units or bytes.
 * @param index Position to inspect.
 * @returns First significant token start, or EOF.
 */
export function getCssSignificantIndex(source: CssSource, index: number): number {
  while (index < source.length) {
    const code = readCssCode(source, index);
    if (code !== 32 && code !== 9 && code !== 10 && code !== 12 && code !== 13 && !(code === 47 && readCssCode(source, index + 1) === 42)) break;
    const token = readCssToken(source, index), kind = token % 16;
    if (kind !== CssTokenKind.Whitespace && kind !== CssTokenKind.Comment && kind !== CssTokenKind.OpenComment) break;
    index = Math.floor(token / 16);
  }
  return index;
}
