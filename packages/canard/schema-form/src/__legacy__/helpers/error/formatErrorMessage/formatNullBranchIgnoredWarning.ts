import { createDivider } from './utils/createDivider';

/**
 * Formats a warning for a `{ type: 'null' }` composition branch that carries a
 * condition or `properties`: such a branch only tells the validator that `null`
 * is valid, so the form reads neither.
 * @param scope - Composition scope the branch belongs to
 * @param ignored - Names of the branch keywords the form does not read
 * @param path - JSON pointer of the node that owns the branch
 */
export const formatNullBranchIgnoredWarning = (
  scope: 'oneOf' | 'anyOf',
  ignored: string[],
  path: string,
): string => {
  const divider = createDivider();
  return `
A '${scope}' branch of type 'null' is used for JSON Schema validation only;
the form does not read its ${ignored.join(' or ')}.

  ╭${divider}
  │  Path:     ${path || '/'}
  │  Ignored:  ${ignored.join(', ')}
  ╰${divider}

A null branch has no fields and is never the active branch. Whether the
object is null is decided by its value — setValue(null), a null default —
not by a branch condition.

How to fix:
  1. Keep the null branch bare:
       { type: 'null' }
  2. Put fields and conditions on the branches of type 'object'
`.trim();
};
