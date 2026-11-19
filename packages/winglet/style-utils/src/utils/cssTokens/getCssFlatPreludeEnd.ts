import { getCssFlatSpanEnd } from './getCssFlatSpanEnd';

/**
 * Probe the shared flat position model for a rule prelude.
 * @param css Stylesheet text.
 * @param start Start of a qualified rule prelude.
 * @returns Its structural opening brace, or -1 when detailed traversal is required.
 */
export function getCssFlatPreludeEnd(css: string, start: number): number {
  return getCssFlatSpanEnd(css, start, false);
}
