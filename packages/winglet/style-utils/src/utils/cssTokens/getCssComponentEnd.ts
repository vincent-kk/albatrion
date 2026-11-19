import { CssTokenKind } from './CssTokenKind';
import { readCssToken } from './readCssToken';
import { type CssSource, readCssCode } from './readCssCode';

/** Sticky span probes exclude every character that could change nested lexical context. */
const SIMPLE_PAREN = /[^()[\]{}"'\\/]*\)/y;
/** Flat bracket contents share the same conservative exclusion set. */
const SIMPLE_BRACKET = /[^()[\]{}"'\\/]*\]/y;
/** Flat nested braces require no individual token reads. */
const SIMPLE_BRACE = /[^()[\]{}"'\\/]*\}/y;

/**
 * Skip a bracketed component through shared lexical positions and matching delimiters.
 * @param source Stylesheet code units or bytes.
 * @param open Opening bracket, brace or parenthesis.
 * @returns Position after its matching close, or EOF when unclosed.
 */
export function getCssComponentEnd(source: CssSource, open: number): number {
  const opening = readCssCode(source, open);
  const close = opening === 40 ? 41 : opening === 91 ? 93 : 125;
  if (typeof source === 'string') {
    const probe = opening === 40 ? SIMPLE_PAREN : opening === 91 ? SIMPLE_BRACKET : SIMPLE_BRACE;
    probe.lastIndex = open + 1;
    if (probe.test(source)) return probe.lastIndex;
  }
  let index = open + 1;
  while (index < source.length) {
    const token = readCssToken(source, index), kind = token % 16;
    const end = Math.floor(token / 16), code = readCssCode(source, index);
    if (kind === CssTokenKind.Function) index = getCssComponentEnd(source, end - 1);
    else if (kind === CssTokenKind.Delimiter && (code === 40 || code === 91 || code === 123)) index = getCssComponentEnd(source, index);
    else if (kind === CssTokenKind.Delimiter && code === close) return end;
    else index = end;
  }
  return source.length;
}
