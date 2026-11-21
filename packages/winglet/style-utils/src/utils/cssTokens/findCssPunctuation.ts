import { getCssOpaqueEnd } from './getCssOpaqueEnd';

/**
 * Find the next structural delimiter outside strings, comments and components.
 * Native search skips plain CSS; only opaque openings enter the token reader.
 * @param css Complete text or a bounded selector prelude.
 * @param start First unconsumed source index.
 * @param probe Native candidates for this grammar position.
 * @returns The delimiter's index, or the text length when the reader reaches EOF.
 */
export function findCssPunctuation(
  css: string,
  start: number,
  probe: RegExp,
): number {
  probe.lastIndex = start;
  while (probe.test(css)) {
    const index = probe.lastIndex - 1;
    const code = css.charCodeAt(index);
    if (code === 123 || code === 125 || code === 59 || code === 44) return index;
    const end = getCssOpaqueEnd(css, index);
    if (end > index) probe.lastIndex = end;
  }
  return css.length;
}
