import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { SchemaNodeRecord } from '../../../record';
import type { ValidationIssue } from '../../type';
import { isOffUnionBranchIssue } from './isOffUnionBranchIssue';
import { normalizeIssueDataPath } from './normalizeIssueDataPath';
import { updateSchemaNodeGlobalErrors } from './updateSchemaNodeGlobalErrors';

/** Identify a record owned by this tree without an unchecked type assertion. */
const isOwnedNode = <Self extends SchemaNodeRecord<Self>>(
  candidate: unknown, runtime: Self['runtime'],
): candidate is Self => candidate !== null && typeof candidate === 'object' &&
  Reflect.get(candidate, 'runtime') === runtime;

/**
 * Replace displayed validator issues inside a requested live subtree.
 * @param target - Scope being validated; siblings keep their displayed issues.
 * @param issues - Ordered whole-schema verdict retained at form level.
 * @returns Nodes whose displayed validator issues changed.
 */
export const routeValidationIssues = <Self extends SchemaNodeRecord<Self>>(
  target: Self, issues: readonly ValidationIssue[],
): Set<Self> => {
  const root = target.rootNode;
  const runtime = root.runtime;
  const before = runtime.validationErrors ?? new Map<unknown, readonly unknown[]>();
  const next = new Map<unknown, readonly unknown[]>(before);
  let activeIds: Set<number> | undefined;
  if (issues.length > 0 && runtime.committedDeclarationIds?.size) {
    activeIds = new Set<number>();
    for (const ids of runtime.committedDeclarationIds.values())
      for (let index = 0; index < ids.length; index++) activeIds.add(ids[index]);
  }
  const inScope = (node: Self): boolean => node === target ||
    node.path.startsWith(`${target.path}/`);
  for (const node of before.keys())
    if (isOwnedNode<Self>(node, runtime) && inScope(node)) next.delete(node);
  for (let index = 0; index < issues.length; index++) {
    const issue = issues[index];
    if (isOffUnionBranchIssue(issue, runtime.blueprint, activeIds)) continue;
    const path = normalizeIssueDataPath(issue.dataPath);
    let node = root;
    if (path) {
      if (!path.startsWith('/')) continue;
      const segments = path.slice(1).split('/');
      for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex++) {
        const encoded = segments[segmentIndex];
        if (node.structure === null) break;
        const key = encoded.replace(/~1/g, '/').replace(/~0/g, '~');
        if (!hasOwnProperty(node.structure, key)) { node = root; break; }
        const child = node.structure[key];
        if (!child) { node = root; break; }
        node = child;
      }
      if (node === root && path !== '') continue;
    }
    if (issue.rejectedKey) {
      while (node.parent && node.structure === null) node = node.parent;
    }
    if (!inScope(node)) continue;
    const previous = next.get(node) ?? [];
    next.set(node, [...previous, issue]);
  }
  const changed = new Set<Self>();
  const candidates = new Set(before.keys());
  for (const node of next.keys()) candidates.add(node);
  for (const node of candidates) {
    if (!isOwnedNode<Self>(node, runtime) || !inScope(node)) continue;
    const current = node;
    const oldIssues = before.get(node) ?? [];
    const newIssues = next.get(node) ?? [];
    if (oldIssues.length !== newIssues.length) changed.add(current);
    else for (let index = 0; index < oldIssues.length; index++)
      if (oldIssues[index] !== newIssues[index]) { changed.add(current); break; }
  }
  runtime.validationErrors = next;
  if (runtime.validationChangedNodes)
    for (const node of changed) runtime.validationChangedNodes.add(node);
  else runtime.validationChangedNodes = changed;
  if (runtime.routedValidationErrors !== issues) {
    runtime.routedValidationErrors = issues;
    updateSchemaNodeGlobalErrors(root);
  }
  runtime.combinedErrors?.clear();
  return changed;
};
