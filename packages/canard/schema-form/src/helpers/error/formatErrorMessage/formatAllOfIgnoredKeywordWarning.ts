import { createDivider } from './utils/createDivider';

/**
 * Formats a warning for JSON Schema keywords that participate in validation
 * but are not applied while constructing a form from an `allOf` entry.
 * @param keyword - The unsupported form-construction keyword
 */
export const formatAllOfIgnoredKeywordWarning = (keyword: string): string => {
  const divider = createDivider();
  return `
The '${keyword}' keyword inside 'allOf' is used for JSON Schema validation,
but is not used when constructing the form.

  ╭${divider}
  │  Keyword:  ${keyword}
  ╰${divider}

Composition and conditional keywords inside 'allOf' entries are not applied
to form construction (allOf, anyOf, oneOf, not, if, then, else,
dependencies, ...).

How to fix:
  1. Move the '${keyword}' keyword out of the 'allOf' entry
  2. Declare it on the schema that owns the 'allOf', or restructure the branch
`.trim();
};
