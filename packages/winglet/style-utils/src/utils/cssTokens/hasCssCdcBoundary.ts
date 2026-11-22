import { type CssSource, readCssCode } from './readCssCode';

/**
 * Preserve a whitespace boundary that could otherwise create a CDC token.
 * @param source Code units or opaque-free UTF-8 bytes.
 * @param end End of the preceding token before whitespace.
 * @param nextCode First code unit following whitespace.
 * @returns Whether trailing hyphens followed by greater-than need their boundary.
 */
export function hasCssCdcBoundary(source: CssSource, end: number, nextCode: number): boolean {
  return nextCode === 62 && readCssCode(source, end - 1) === 45 && readCssCode(source, end - 2) === 45;
}
