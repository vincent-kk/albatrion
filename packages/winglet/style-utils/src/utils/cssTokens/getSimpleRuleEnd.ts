const RULE = /[.#]?[A-Za-z_][\w-]*\{(?:[A-Za-z_-][\w-]*:[^\s"'\\()[\]{};,:/]+(?: [^\s"'\\()[\]{};,:/]+)*;)*[A-Za-z_-][\w-]*:[^\s"'\\()[\]{};,:/]+(?: [^\s"'\\()[\]{};,:/]+)*\}/y;

/**
 * Read one complete rule with an already compressed simple selector and declarations.
 * @param css Sheet whose grammar position is a rule list
 * @param start First code unit of the candidate rule
 * @returns Its exclusive end, or zero when token-by-token reading is required
 */
export const getSimpleRuleEnd = (css: string, start: number): number => {
  RULE.lastIndex = start;
  return RULE.test(css) ? RULE.lastIndex : 0;
};
