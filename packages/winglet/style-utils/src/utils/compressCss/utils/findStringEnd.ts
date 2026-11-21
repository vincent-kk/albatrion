import { CssTokenKind } from '../../cssTokens/CssTokenKind';
import { getCssStringToken } from '../../cssTokens/getCssStringToken';

/**
 * Read the shared string position with the legacy bad-string newline boundary.
 * @param buffer Stylesheet bytes.
 * @param start Opening quote.
 * @returns Position past a closing quote or before the recovering newline, or EOF.
 */
export const findStringEnd = (buffer: Uint8Array, start: number): number => {
  const token = getCssStringToken(buffer, start), end = Math.floor(token / 16);
  return token % 16 === CssTokenKind.BadString ? end - (buffer[end - 2] === 13 && buffer[end - 1] === 10 ? 2 : 1) : end;
};
