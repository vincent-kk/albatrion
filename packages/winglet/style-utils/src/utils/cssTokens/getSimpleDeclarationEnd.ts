/** Canonical simple declarations contain no opaque or nested component syntax. */
const DECLARATION = /[A-Za-z_-][\w-]*:[^\s"'\\()[\]{};,:/]+(?: [^\s"'\\()[\]{};,:/]+)*[;}]/y;

/**
 * Batch one complete declaration in an already established declaration-list position.
 * @param css The current stylesheet
 * @param start First property-name code unit
 * @returns First position after its semicolon or closing brace, or zero for the general reader
 */
export const getSimpleDeclarationEnd = (css: string, start: number): number => {
  DECLARATION.lastIndex = start;
  return DECLARATION.test(css) ? DECLARATION.lastIndex : 0;
};
