import type { SchemaNode, ValidationIssue } from '@/schema-form/core';

/** Apply the whole form list to the root and replace each non-root path's errors. */
export const applyFormErrors = (
  root: SchemaNode,
  errors: readonly ValidationIssue[] = [],
  previous: readonly ValidationIssue[] = [],
): void => {
  const groups = new Map<string, ValidationIssue[]>();
  const paths: string[] = [];
  for (let index = 0; index < errors.length; index++) {
    const issue = errors[index];
    const path = issue.dataPath;
    let group = groups.get(path);
    if (!group) {
      group = [];
      groups.set(path, group);
      paths.push(path);
    }
    group.push(issue);
  }
  for (let index = 0; index < previous.length; index++) {
    const path = previous[index].dataPath;
    if (groups.has(path)) continue;
    groups.set(path, []);
    paths.push(path);
  }
  root.batch(() => {
    root.setExternalErrors(errors);
    for (let index = 0; index < paths.length; index++) {
      const path = paths[index];
      const node = root.find(path);
      if (node && node !== root)
        node.setExternalErrors(groups.get(path)!);
    }
  });
};
