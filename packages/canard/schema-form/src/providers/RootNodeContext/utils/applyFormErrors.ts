import type { SchemaNode, ValidationIssue } from '@/schema-form/core';

/** Apply the whole form list to the root and replace each non-root path's errors. */
export const applyFormErrors = (
  root: SchemaNode,
  errors: readonly ValidationIssue[] = [],
  previous: readonly ValidationIssue[] = [],
): void => {
  const paths = [...errors, ...previous].map((issue) => issue.dataPath);
  root.batch(() => {
    root.setExternalErrors(errors);
    for (let index = 0; index < paths.length; index++) {
      const path = paths[index];
      if (paths.indexOf(path) !== index) continue;
      const node = root.find(path);
      if (node && node !== root)
        node.setExternalErrors(errors.filter((issue) => issue.dataPath === path));
    }
  });
};
