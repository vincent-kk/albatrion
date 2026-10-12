import { isArray } from '@winglet/common-utils/filter';

import type { SchemaNode, ValidationIssue } from '@/schema-form/core';

/** Shared empty list for a non-array errors prop, read as empty like 0.16.0 (178C-01). */
const NO_ERRORS: readonly ValidationIssue[] = [];

/** Apply the whole form list to the root and replace each non-root path's errors. */
export const applyFormErrors = (
  root: SchemaNode,
  errors: readonly ValidationIssue[] = NO_ERRORS,
  previous: readonly ValidationIssue[] = NO_ERRORS,
): void => {
  if (!isArray(errors)) errors = NO_ERRORS;
  if (!isArray(previous)) previous = NO_ERRORS;
  const resolved = new Map<string, SchemaNode | null>();
  const resolve = (dataPath: string): SchemaNode | null => {
    let node = resolved.get(dataPath);
    if (node === undefined) {
      node = root.find(dataPath);
      resolved.set(dataPath, node);
    }
    return node;
  };
  const groups = new Map<SchemaNode, ValidationIssue[]>();
  const nodes: SchemaNode[] = [];
  for (let index = 0; index < errors.length; index++) {
    const issue = errors[index];
    const node = resolve(issue.dataPath);
    if (!node || node === root) continue;
    let group = groups.get(node);
    if (!group) {
      group = [];
      groups.set(node, group);
      nodes.push(node);
    }
    group.push(issue);
  }
  for (let index = 0; index < previous.length; index++) {
    const node = resolve(previous[index].dataPath);
    if (!node || node === root || groups.has(node)) continue;
    groups.set(node, []);
    nodes.push(node);
  }
  root.batch(() => {
    root.setExternalErrors(errors);
    for (let index = 0; index < nodes.length; index++)
      nodes[index].setExternalErrors(groups.get(nodes[index])!);
  });
};
