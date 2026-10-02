import { createDivider } from './utils/createDivider';

/**
 * Formats a warning for a `oneOf`/`anyOf` nested inside a composition branch,
 * which is not expanded into form fields (only compositions that are a sibling
 * of `type` build fields).
 * @param scope - Composition scope of the branch holding the nested one
 * @param nestedScope - The ignored nested composition keyword
 * @param path - JSON pointer of the node that owns the branch
 */
export const formatNestedCompositionIgnoredWarning = (
  scope: 'oneOf' | 'anyOf',
  nestedScope: 'oneOf' | 'anyOf',
  path: string,
): string => {
  const divider = createDivider();
  return `
A nested '${nestedScope}' inside a '${scope}' branch is used for JSON Schema
validation, but is not applied when constructing the form.

  ╭${divider}
  │  Path:    ${path || '/'}
  │  Nested:  '${nestedScope}' inside '${scope}'
  ╰${divider}

Only 'oneOf'/'anyOf' declared as a sibling of 'type' drives form construction.
A composition nested directly inside another composition branch is ignored.

How to fix:
  1. Wrap it in a nested object that owns the composition:
       { type: 'object', ${nestedScope}: [ ... ] }
  2. Or lift the '${nestedScope}' onto a schema that declares its own 'type'
`.trim();
};
