/**
 * Tell whether a top-level token may start a rule that `getVerbatimRuleEnd` can skip.
 * @param css Sheet whose grammar position at `index` is the top-level rule list
 * @param index First code unit of the next token
 * @returns False for whitespace, other control code units, comments and any `<` or `-` start
 * (which may be a CDO/CDC marker); those stay with the token reader
 */
export const isVerbatimRuleStart = (css: string, index: number): boolean => {
  const code = css.charCodeAt(index);
  return code > 32 && code !== 60 && code !== 45 && !(code === 47 && css.charCodeAt(index + 1) === 42);
};
