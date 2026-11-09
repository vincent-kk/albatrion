import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Optional } from '@aileron/declare';

import { parsePointer } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import type { ValidationIssue } from '../../types/issue';
import { createValidationScope } from './createValidationScope';
import { isOffUnionBranchIssue } from './isOffUnionBranchIssue';
import { updateFieldNodeGlobalErrors } from './updateFieldNodeGlobalErrors';

/** Identify a record owned by this tree without an unchecked type assertion. */
const isOwnedNode = <Self extends FieldNodeRecord<Self>>(
  candidate: unknown,
  runtime: Self['runtime'],
): candidate is Self =>
  candidate !== null &&
  typeof candidate === 'object' &&
  Reflect.get(candidate, 'runtime') === runtime;

/**
 * Replace displayed validator issues across the requested subtrees in one pass.
 * @param targets - Same-root scopes being validated; unselected siblings keep their issues.
 * @param issues - Ordered whole-schema verdict retained at form level.
 * @returns Union of changed nodes; a singleton scope retains the single-target result.
 */
export const routeValidationIssues = <Self extends FieldNodeRecord<Self>>(
  targets: Iterable<Self>,
  issues: readonly ValidationIssue[],
): Set<Self> => {
  const scopes = [...targets];
  const first = scopes[0];
  if (!first) return new Set();
  const root = first.rootNode;
  const runtime = root.runtime;
  const before =
    runtime.validationErrors ?? new Map<unknown, readonly unknown[]>();
  const next = new Map<unknown, readonly unknown[]>(before);
  let activeIds: Optional<Set<number>>;
  if (issues.length > 0 && runtime.committedDeclarationIds?.size) {
    activeIds = new Set<number>();
    for (const ids of runtime.committedDeclarationIds.values())
      for (let index = 0; index < ids.length; index++)
        activeIds.add(ids[index]);
  }
  const inScope = createValidationScope(scopes);
  for (const node of before.keys())
    if (isOwnedNode<Self>(node, runtime) && inScope(node)) next.delete(node);
  for (let index = 0; index < issues.length; index++) {
    const issue = issues[index];
    if (isOffUnionBranchIssue(issue, runtime.blueprint, activeIds)) continue;
    const path = issue.dataPath;
    let node = root;
    let resolved = true;
    if (path) {
      const parsed = parsePointer(path);
      if (!parsed.absolute) continue;
      const segments = parsed.segments;
      for (
        let segmentIndex = 0;
        segmentIndex < segments.length;
        segmentIndex++
      ) {
        const key = segments[segmentIndex];
        if (typeof key !== 'string') {
          resolved = false;
          break;
        }
        if (node.structure === null) break;
        if (!hasOwnProperty(node.structure, key)) {
          resolved = false;
          break;
        }
        const child = node.structure[key];
        if (!child) {
          resolved = false;
          break;
        }
        node = child;
      }
      if (!resolved) continue;
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
    else if (isSameItems(oldIssues, newIssues)) {
      if (newIssues.length) next.set(node, oldIssues);
    } else changed.add(current);
  }
  runtime.validationErrors = next;
  if (runtime.validationChangedNodes)
    for (const node of changed) runtime.validationChangedNodes.add(node);
  else runtime.validationChangedNodes = changed;
  if (runtime.routedValidationErrors !== issues) {
    runtime.routedValidationErrors = issues;
    runtime.validationListChanged = true;
    updateFieldNodeGlobalErrors(root);
  }
  for (const node of changed) runtime.combinedErrors?.delete(node);
  return changed;
};

/**
 * Compare two routed issue lists of equal length by item identity.
 * @param before - Issues the node held after the previous routing.
 * @param after - Issues routed to the node now.
 * @returns True when every position holds the same issue object.
 */
const isSameItems = (
  before: readonly unknown[],
  after: readonly unknown[],
): boolean => {
  for (let index = 0; index < before.length; index++)
    if (before[index] !== after[index]) return false;
  return true;
};
