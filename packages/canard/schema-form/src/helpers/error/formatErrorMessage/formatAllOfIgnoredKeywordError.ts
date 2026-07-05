import { createDivider } from './utils/createDivider';

/**
 * Formats a structured warning message for unsupported keywords that are
 * dropped during `allOf` schema merging.
 * @param keyword - The unsupported keyword found in an `allOf` entry
 */
export const formatAllOfIgnoredKeywordError = (keyword: string): string => {
  const divider = createDivider();
  return `
'allOf' merge does not support the '${keyword}' keyword; it was ignored.

  ╭${divider}
  │  Keyword:  ${keyword}
  ╰${divider}

Composition and conditional keywords inside 'allOf' entries are not merged
(allOf, anyOf, oneOf, not, if, then, else, dependencies, ...). Keeping them
there silently loses their behavior.

How to fix:
  1. Move the '${keyword}' keyword out of the 'allOf' entry
  2. Declare it on the schema that owns the 'allOf', or restructure the branch
`.trim();
};
