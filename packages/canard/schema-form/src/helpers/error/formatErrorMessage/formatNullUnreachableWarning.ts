import { createDivider } from './utils/createDivider';

/**
 * Formats a warning for a nullable object whose `oneOf` can never validate
 * `null`: `oneOf` wants exactly one matching branch, and `null` matches either
 * none of the branches or several.
 * @param path - JSON pointer of the nullable object
 * @param admitting - How many branches accept `null`
 */
export const formatNullUnreachableWarning = (
  path: string,
  admitting: number,
): string => {
  const divider = createDivider();
  const cause =
    admitting === 0
      ? 'no branch accepts null, so null matches none of them'
      : `${admitting} branches accept null, so null matches more than one`;
  return `
This object is nullable, but no validator accepts null under its 'oneOf':
${cause}.

  ╭${divider}
  │  Path:                    ${path || '/'}
  │  Branches accepting null: ${admitting} (exactly 1 is required)
  ╰${divider}

A branch that declares no 'type' accepts null, because 'properties' and
'required' only apply to objects. The form keeps a null value as it is, so
validation of that value fails.

How to fix:
  1. Add one null branch and declare the type of the object branches:
       oneOf: [
         { type: 'null' },
         { type: 'object', properties: { ... } },
       ]
  2. Or use 'anyOf', which a null branch alone satisfies
  3. Ignore this if a branch already rules null out with 'not' or 'allOf'
`.trim();
};
