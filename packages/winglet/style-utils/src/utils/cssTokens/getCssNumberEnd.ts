import { type CssSource, readCssCode } from './readCssCode';

/**
 * Consume CSS number syntax without allocating its numeric representation.
 * @param source Stylesheet code units or bytes.
 * @param index A verified number start.
 * @returns Position after its sign, fraction and optional exponent.
 */
export function getCssNumberEnd(source: CssSource, index: number): number {
  let code = readCssCode(source, index);
  if (code === 43 || code === 45) index++;
  while ((code = readCssCode(source, index)) >= 48 && code <= 57) index++;
  if (readCssCode(source, index) === 46 && readCssCode(source, index + 1) >= 48 && readCssCode(source, index + 1) <= 57) {
    index++;
    while ((code = readCssCode(source, index)) >= 48 && code <= 57) index++;
  }
  if ((readCssCode(source, index) | 32) === 101) {
    let exponent = index + 1;
    code = readCssCode(source, exponent);
    if (code === 43 || code === 45) exponent++;
    code = readCssCode(source, exponent);
    if (code >= 48 && code <= 57) {
      index = exponent + 1;
      while ((code = readCssCode(source, index)) >= 48 && code <= 57) index++;
    }
  }
  return index;
}
