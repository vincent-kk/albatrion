import { getCssFlatSpanEnd } from './getCssFlatSpanEnd';

/**
 * Probe a declaration block through the shared flat position model.
 * @param css Stylesheet text.
 * @param open Structural opening brace.
 * @returns Matching closing brace, or -1 when component traversal is required.
 */
export function getCssFlatBlockEnd(css: string, open: number): number {
  return getCssFlatSpanEnd(css, open + 1, true);
}
