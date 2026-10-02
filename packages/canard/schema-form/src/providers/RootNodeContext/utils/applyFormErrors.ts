import type { SchemaNode, ValidationIssue } from '@/schema-form/core';

/** Replace path-keyed external errors, clearing paths no longer present. */
export const applyFormErrors = (
  root: SchemaNode,
  errors: readonly ValidationIssue[] = [],
  previous: readonly ValidationIssue[] = [],
): void => {
  const paths = [...errors, ...previous].map((issue) => issue.dataPath);
  root.batch(() => {
    for (let index = 0; index < paths.length; index++) {
      const path = paths[index];
      if (paths.indexOf(path) !== index) continue;
      root
        .find(path)
        ?.setExternalErrors(errors.filter((issue) => issue.dataPath === path));
    }
  });
};
