import { CssTokenKind } from './CssTokenKind';
import { readCssToken } from './readCssToken';

/** Boundaries outside which a plain literal span cannot change grammar state. */
const STOP = new Uint8Array(128);
for (const code of [9, 10, 12, 13, 32, 34, 39, 92, 40, 41, 91, 93, 123, 125, 58, 59, 44, 64, 47, 60, 62]) STOP[code] = 1;

/**
 * Read a shared grammar position, using literal spans where token identity cannot affect the writer.
 * @param css One stylesheet fragment
 * @param start First code unit to consume
 * @returns The shared packed end position and category; plain spans use delimiter punctuation at their tail
 */
export const readCssSheetToken = (css: string, start: number): number => {
  const code = css.charCodeAt(start);
  if (code === 60 && css.startsWith('<!--', start)) return (start + 4) * 16 + CssTokenKind.Delimiter;
  if (code === 45 && css.startsWith('-->', start)) return (start + 3) * 16 + CssTokenKind.Delimiter;
  if (code === 123 || code === 125 || code === 58 || code === 59 || code === 44 || code === 40 || code === 41 || code === 91 || code === 93 || code === 62) return (start + 1) * 16 + CssTokenKind.Delimiter;
  if (code === 32 || code === 9 || code === 10 || code === 12 || code === 13) {
    let end = start + 1;
    while (end < css.length) {
      const next = css.charCodeAt(end);
      if (next !== 32 && next !== 9 && next !== 10 && next !== 12 && next !== 13) break;
      end++;
    }
    return end * 16 + CssTokenKind.Whitespace;
  }
  if (code > 32 && !STOP[code]) {
    let end = start + 1;
    while (end < css.length && !STOP[css.charCodeAt(end)]) end++;
    const next = css.charCodeAt(end);
    if (next !== 40 && next !== 92) {
      const tail = css.charCodeAt(end - 1);
      return end * 16 + (tail === 43 || tail === 126 ? CssTokenKind.Delimiter : CssTokenKind.Name);
    }
  }
  return readCssToken(css, start);
};
