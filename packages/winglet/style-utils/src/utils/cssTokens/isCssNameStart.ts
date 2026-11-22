import { type CssSource, readCssCode } from './readCssCode';

/**
 * Check the CSS Syntax three-code-point identifier start without consuming it.
 * @param source Stylesheet code units or ASCII-compatible bytes.
 * @param index Candidate identifier start.
 * @returns Whether a name starts at the given position.
 */
export function isCssNameStart(source: CssSource, index: number): boolean {
  let code = readCssCode(source, index);
  if (code === 45) {
    code = readCssCode(source, ++index);
    if (code === 45) return true;
  }
  if (code === 92) {
    const next = readCssCode(source, index + 1);
    return next !== 10 && next !== 13 && next !== 12;
  }
  return code === 0 || code >= 128 || code === 95 || ((code | 32) >= 97 && (code | 32) <= 122);
}
