import { getCssTextComponentEnd } from './getCssTextComponentEnd';
import { CssTokenKind } from './CssTokenKind';
import { type CssSource, readCssCode } from './readCssCode';
import { readCssToken } from './readCssToken';

/** Escape-free string spans cannot change the surrounding component nesting. */
const STRING = String.raw`(?:"[^"\\\n\r\f]*(?:"|\r\n|\r(?!\n)|[\n\f])|'[^'\\\n\r\f]*(?:'|\r\n|\r(?!\n)|[\n\f]))`;
/** All alternatives have disjoint first code units; nested and escaped forms use token traversal. */
const CONTENT = String.raw`(?:[^()[\]{}"'\\/]|${STRING})*`;
/** Flat parenthesized positions. */
const SIMPLE_PAREN = new RegExp(CONTENT + String.raw`\)`, 'y');
/** Flat bracketed positions. */
const SIMPLE_BRACKET = new RegExp(CONTENT + String.raw`\]`, 'y');
/** Flat brace positions. */
const SIMPLE_BRACE = new RegExp(CONTENT + String.raw`\}`, 'y');

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
    const probe =
      opening === 40
        ? SIMPLE_PAREN
        : opening === 91
          ? SIMPLE_BRACKET
          : SIMPLE_BRACE;
    probe.lastIndex = open + 1;
    if (probe.test(source)) return probe.lastIndex;
    return getCssTextComponentEnd(source, open);
  }
  let index = open + 1;
  while (index < source.length) {
    const token = readCssToken(source, index),
      kind = token % 16;
    const end = Math.floor(token / 16),
      code = readCssCode(source, index);
    if (kind === CssTokenKind.Function)
      index = getCssComponentEnd(source, end - 1);
    else if (
      kind === CssTokenKind.Delimiter &&
      (code === 40 || code === 91 || code === 123)
    )
      index = getCssComponentEnd(source, index);
    else if (kind === CssTokenKind.Delimiter && code === close) return end;
    else index = end;
  }
  return source.length;
}
