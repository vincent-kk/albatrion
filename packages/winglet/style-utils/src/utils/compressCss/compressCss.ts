import { CssTokenKind } from '../cssTokens/CssTokenKind';
import { getCssSignificantIndex } from '../cssTokens/getCssSignificantIndex';
import { readCssToken } from '../cssTokens/readCssToken';
import { canDropCssComment } from './utils/canDropCssComment';
import { compressFlatCss } from './utils/compressFlatCss';
import { isDeclarationColon } from './utils/isDeclarationColon';

/**
 * Compresses CSS by removing unnecessary whitespace, comments, and redundant semicolons.
 * Uses shared lexical positions without allocating token objects.
 * Prioritizes speed over perfect compression - some trailing spaces may remain.
 *
 * @param css - The CSS string to compress
 * @returns A compressed CSS string; empty comments retain boundaries between adjacent tokens
 *
 * @note This function prioritizes performance over perfect compression.
 * Some trailing spaces may remain in certain contexts (e.g., media queries)
 * to avoid expensive post-processing operations.
 *
 * @example
 * ```typescript
 * Basic CSS compression:
 * compressCss('.class { color: red; background: blue; }')
 * // Returns: '.class{color:red;background:blue}'
 *
 * Comment removal:
 * compressCss('.class { color: red; /* inline comment *\/ background: blue; }')
 * // Returns: '.class{color:red;background:blue}'
 *
 * Multiple whitespace handling:
 * compressCss('.class1   { color  :   red  ; margin :  10px   20px  ; }')
 * // Returns: '.class1{color:red;margin:10px 20px}'
 *
 * CSS selectors with combinators:
 * compressCss('.class1   .class2   >   .class3 { color: red; }')
 * // Returns: '.class1 .class2>.class3{color:red}'
 *
 * Media queries (may have trailing spaces for performance):
 * compressCss('@media (max-width: 768px) { .container { padding: 0 16px; } }')
 * // Returns: '@media (max-width:768px){.container{padding:0 16px }}' (note trailing space)
 *
 * Complex CSS with comments:
 * compressCss('.container { width: 100%; /* comment *\/ margin: 0 auto; }')
 * // Returns: '.container{width:100%;margin:0 auto}'
 *
 * Empty input:
 * compressCss('') // Returns: ''
 *```
 */
export const compressCss = (css: string): string => {
  if (!css.length) return '';
  if (!/["'\\(]|\/\*/.test(css)) return compressFlatCss(css);
  let output = '', index = 0, previousCode = 0, segmentStart = 0;
  let hasOutput = false;
  let previousKind = CssTokenKind.Delimiter;
  let parentheses = 0, brackets = 0;
  while (index < css.length) {
    const token = readCssToken(css, index), kind = token % 16;
    const end = Math.floor(token / 16), code = css.charCodeAt(index);
    if (kind === CssTokenKind.Comment || kind === CssTokenKind.OpenComment) {
      output += css.slice(segmentStart, index);
      segmentStart = end;
      if (hasOutput && end < css.length) {
        const next = readCssToken(css, end);
        if (!canDropCssComment(previousKind, previousCode, next % 16, css.charCodeAt(end))) output += '/**/';
      }
      index = end;
      continue;
    }
    if (kind === CssTokenKind.Whitespace) {
      output += css.slice(segmentStart, index);
      segmentStart = end;
      if (previousKind === CssTokenKind.Delimiter && previousCode === 92 && (code === 10 || code === 13 || code === 12)) {
        output += code === 13 && css.charCodeAt(index + 1) === 10 ? '\r\n' : css[index];
        previousCode = 32;
        previousKind = CssTokenKind.Whitespace;
        index = end;
        continue;
      }
      if (hasOutput && end < css.length) {
        const nextCode = css.charCodeAt(end);
        const after = previousCode === 123 || previousCode === 125 || previousCode === 59 || previousCode === 58 || previousCode === 44 || previousCode === 62 || previousCode === 126 || previousCode === 40;
        const before = nextCode === 123 || nextCode === 125 || nextCode === 59 || nextCode === 44 || nextCode === 62 || nextCode === 126 || nextCode === 41;
        let keep = !after && !before;
        if (previousCode === 43 || nextCode === 43) keep = parentheses > 0;
        if (parentheses > 0 && (previousCode === 45 || nextCode === 45)) keep = true;
        if (keep && nextCode === 58) keep = !isDeclarationColon(css, end);
        if (keep) { output += ' '; previousCode = 32; previousKind = CssTokenKind.Whitespace; }
      }
      index = end;
      continue;
    }
    if (kind === CssTokenKind.Function) parentheses++;
    if (kind === CssTokenKind.Delimiter) {
      if (code === 40) parentheses++;
      else if (code === 41) parentheses = Math.max(0, parentheses - 1);
      else if (code === 91) brackets++;
      else if (code === 93) brackets = Math.max(0, brackets - 1);
      if (code === 59 && parentheses === 0 && brackets === 0) {
        const head = getCssSignificantIndex(css, end);
        if (css.charCodeAt(head) === 125 || css.charCodeAt(head) === 59) { output += css.slice(segmentStart, index); segmentStart = end; index = end; continue; }
      }
    }
    hasOutput = true;
    previousCode = kind === CssTokenKind.Delimiter || kind === CssTokenKind.Function ? css.charCodeAt(end - 1) : 0;
    previousKind = kind;
    index = end;
  }
  output += css.slice(segmentStart, index);
  return previousKind === CssTokenKind.Whitespace ? output.slice(0, -1) : output;
};
