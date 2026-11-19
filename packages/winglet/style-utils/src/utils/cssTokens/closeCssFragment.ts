import { CssTokenKind } from './CssTokenKind';
import { readCssToken } from './readCssToken';

/**
 * Materialize CSS Syntax EOF closure before joining independently injected fragments.
 * @param css One style identifier's stylesheet text.
 * @returns Text with complete lexical and component boundaries to the next identifier.
 */
export function closeCssFragment(css: string): string {
  const trimmed = css.trimEnd(), last = trimmed.charCodeAt(trimmed.length - 1);
  if (!/["'\\([]|\/\*/.test(css) && ((last === 125 && /^[^{}]*\{[^{}]*\}\s*$/.test(css)) || (last === 59 && !css.includes('{')))) return css;
  let index = 0, closers = '', result = css, atDepth = -1, isItemStart = true;
  while (index < css.length) {
    const token = readCssToken(css, index), kind = token % 16;
    const end = Math.floor(token / 16), code = css.charCodeAt(index);
    if (kind === CssTokenKind.Whitespace || kind === CssTokenKind.Comment) { index = end; continue; }
    if (kind === CssTokenKind.OpenComment) result += '*/';
    else if (kind === CssTokenKind.OpenString || kind === CssTokenKind.OpenUrl) {
      let backslashes = 0;
      for (let tail = css.length - 1; css.charCodeAt(tail) === 92; tail--) backslashes++;
      if (backslashes % 2) result += kind === CssTokenKind.OpenString ? '\n' : '\uFFFD';
      result += kind === CssTokenKind.OpenString ? css[index] : ')';
    } else if (kind === CssTokenKind.Function) closers = ')' + closers;
    else if (kind === CssTokenKind.AtKeyword && isItemStart) atDepth = closers.length;
    else if (kind === CssTokenKind.Delimiter) {
      if (code === 123 || code === 40 || code === 91) {
        if (code === 123 && atDepth === closers.length) atDepth = -1;
        closers = (code === 123 ? '}' : code === 40 ? ')' : ']') + closers;
      } else if (css[index] === closers[0]) closers = closers.slice(1);
      if (code === 59 && atDepth === closers.length) atDepth = -1;
    }
    if (end === css.length && (kind === CssTokenKind.Name || kind === CssTokenKind.Hash || kind === CssTokenKind.Dimension || kind === CssTokenKind.AtKeyword)) {
      let backslashes = 0;
      for (let tail = end - 1; css.charCodeAt(tail) === 92; tail--) backslashes++;
      if (backslashes % 2) result += '\uFFFD';
    }
    isItemStart = kind === CssTokenKind.Delimiter && (code === 123 || code === 125 || code === 59);
    index = end;
  }
  if (atDepth >= 0) {
    const count = closers.length - atDepth;
    closers = closers.slice(0, count) + ';' + closers.slice(count);
  }
  return result + closers;
}
