import { getCssTextComponentEnd } from './getCssTextComponentEnd';
import { CssTokenKind } from './CssTokenKind';
import { FLAT_CONTENT_PATTERN } from './flatCssPatterns';
import { type CssSource, readCssCode } from './readCssCode';
import { readCssToken } from './readCssToken';

/** Flat parenthesized positions; nested and escaped forms use token traversal. */
const SIMPLE_PAREN = new RegExp(FLAT_CONTENT_PATTERN + String.raw`\)`, 'y');
/** Flat bracketed positions. */
const SIMPLE_BRACKET = new RegExp(FLAT_CONTENT_PATTERN + String.raw`\]`, 'y');
/** Flat brace positions. */
const SIMPLE_BRACE = new RegExp(FLAT_CONTENT_PATTERN + String.raw`\}`, 'y');

/**
 * Skip a bracketed component through shared lexical positions and matching delimiters.
 * @param source Stylesheet code units or bytes.
 * @param open Opening bracket, brace or parenthesis.
 * @param unclosedEnd Result to use when no matching close exists.
 * @returns Position after its matching close, or `unclosedEnd` (EOF by default).
 */
export function getCssComponentEnd(
  source: CssSource,
  open: number,
  unclosedEnd = source.length,
): number {
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
    return getCssTextComponentEnd(source, open, unclosedEnd);
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
  return unclosedEnd;
}
