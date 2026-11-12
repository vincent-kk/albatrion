/**
 * Combines option layers without replacing inherited values with undefined.
 * @param defaults - Lower-priority values, including required modal fields.
 * @param overrides - Higher-priority own properties; false and zero remain valid.
 * @returns A shallow merged object without mutating either input.
 */
export const mergeDefined = <Base extends object, Overrides extends object>(
  defaults: Base,
  overrides: Overrides,
): Base & Overrides => {
  const defined = { ...overrides };
  for (const key in defined)
    if (defined[key] === undefined) delete defined[key];
  return { ...defaults, ...defined };
};
