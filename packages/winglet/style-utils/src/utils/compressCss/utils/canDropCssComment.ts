import { CssTokenKind } from '../../cssTokens/CssTokenKind';

/**
 * Keep comment boundaries whenever adjacent lexical tokens could coalesce.
 * @param previous Category of the preceding emitted token.
 * @param previousCode Last code unit of that token, only inspected for delimiters.
 * @param next Category of the following token.
 * @param nextCode First code unit of that token, only inspected for delimiters.
 * @returns Whether punctuation or standalone whitespace already separates the tokens.
 */
export function canDropCssComment(previous: CssTokenKind, previousCode: number, next: CssTokenKind, nextCode: number): boolean {
  if (previous === CssTokenKind.Whitespace || next === CssTokenKind.Whitespace || previous === CssTokenKind.Function || previous === CssTokenKind.String || previous === CssTokenKind.Url) return true;
  return (previous === CssTokenKind.Delimiter && isSeparator(previousCode)) || (next === CssTokenKind.Delimiter && isSeparator(nextCode));
}

/** Punctuation whose adjacent tokens cannot become one name, number, hash or function. */
function isSeparator(code: number): boolean {
  return code === 123 || code === 125 || code === 58 || code === 59 || code === 44 || code === 41 || code === 91 || code === 93;
}
