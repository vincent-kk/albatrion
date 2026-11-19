import { createCssOpaqueProbe } from './createCssOpaqueProbe';

/** Private continuation state never aliases a driver's PROBE. */
const PROBE = createCssOpaqueProbe();

/**
 * Skip components proven to contain no native structural candidate.
 * @param css Source stylesheet text.
 * @param index First component opening already found by the driver's PROBE.
 * @param stop Earliest cached structural candidate.
 * @returns First unskipped opaque opening, or EOF.
 */
export function skipCssPlainComponents(
  css: string,
  index: number,
  stop: number,
): number {
  while (index < css.length) {
    const code = css.charCodeAt(index);
    if (code !== 40 && code !== 91) return index;
    const close = css.indexOf(code === 40 ? ')' : ']', index + 1);
    if (close < 0 || close >= stop) return index;
    PROBE.lastIndex = index + 1;
    const next = PROBE.test(css) ? PROBE.lastIndex - 1 : css.length;
    if (next <= close) return index;
    index = next;
  }
  return index;
}
