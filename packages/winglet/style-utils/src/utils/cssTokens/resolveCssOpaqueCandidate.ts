import { skipCssPlainComponents } from './skipCssPlainComponents';

/**
 * Resolve the position found by a driver's native probe through the common model.
 * @param css Source stylesheet text.
 * @param index Opaque opening reported by the native opening probe.
 * @param stop Earliest cached structural candidate.
 * @returns First opaque opening requiring full token traversal, or EOF.
 */
export function resolveCssOpaqueCandidate(
  css: string,
  index: number,
  stop: number,
): number {
  const code = css.charCodeAt(index);
  return code === 40 || code === 91
    ? skipCssPlainComponents(css, index, stop)
    : index;
}
