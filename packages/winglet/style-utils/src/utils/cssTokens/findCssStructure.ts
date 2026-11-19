import { getCssFlatSpanEnd } from './getCssFlatSpanEnd';
import { getCssOpaqueEnd } from './getCssOpaqueEnd';

/** Native scans find a candidate; shared opaque boundaries decide whether it is structure. */
const STRUCTURE = /[{}"'\\([]|\/(?=\*)/g;
/** Statement parsing additionally stops at non-opaque semicolons. */
const STATEMENT_STRUCTURE = /[{};"'\\([]|\/(?=\*)/g;

/**
 * Find the next structural delimiter outside complete lexical components.
 * @param css Stylesheet text.
 * @param start Position after the preceding structural delimiter.
 * @param statementEnd Whether a semicolon is also a stopping boundary.
 * @returns Structural delimiter position, or EOF.
 */
export function findCssStructure(css: string, start: number, statementEnd: boolean): number {
  if (statementEnd) {
    const flat = getCssFlatSpanEnd(css, start, false, true);
    if (flat !== -1) return flat;
  }
  const probe = statementEnd ? STATEMENT_STRUCTURE : STRUCTURE;
  probe.lastIndex = start;
  while (probe.test(css)) {
    const index = probe.lastIndex - 1, code = css.charCodeAt(index);
    if (code === 123 || code === 125 || code === 59) return index;
    probe.lastIndex = getCssOpaqueEnd(css, index);
  }
  return css.length;
}
