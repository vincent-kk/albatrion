import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import { find } from '../../../../navigation';
import { FieldNodeEventType } from '../../../../record';
import type { FieldNodeRecord } from '../../../../record';
import type { ValidationIssue } from '../../../../validation';
import { queueNonSettleEvent } from '../../chain/queueNonSettleEvent';
import { publishRootExternalErrors } from './publishRootExternalErrors';

/** Shared empty list for a node whose external entry was removed. */
const NO_ISSUES: readonly ValidationIssue[] = [];
/** Separator read once at load; the per-issue path check runs once per root issue on every clear. */
const SEPARATOR = $.Separator;

/**
 * Accept only records of this tree from the pending set.
 * @param candidate - Key held by the pending set
 * @param runtime - Runtime that owns the pending set
 * @returns Whether the key is a node of this tree; a detached one only retires its contribution
 */
const isPendingNode = <Self extends FieldNodeRecord<Self>>(
  candidate: unknown,
  runtime: Self['runtime'],
): candidate is Self =>
  candidate !== null &&
  typeof candidate === 'object' &&
  Reflect.get(candidate, 'runtime') === runtime;

/**
 * Rebuild the root's external list once from every non-root node changed since the last rebuild
 * (round 185, 188C-01, 195C-01). Attribution is by node: an entry leaves the root list when the
 * node contributed that reference before or when its dataPath resolves to the node's path; an
 * entry of the node's current list already present by reference keeps its place and the rest
 * are appended in first-change order. A node detached since its change only retires what it
 * contributed. When nothing changes no event is queued, so a form-level apply that placed the
 * same references at the root costs one pass. An empty result removes the root entry.
 * @param root - Live form root owning the aggregate external list and the pending set
 * @returns Nothing; a changed root list queues UpdateError and UpdateGlobalError on the root
 */
export const rebuildRootExternalErrors = <Self extends FieldNodeRecord<Self>>(
  root: Self,
): void => {
  const runtime = root.runtime;
  const pending = runtime.pendingExternalErrorNodes;
  if (!pending?.size) return;
  runtime.pendingExternalErrorNodes = undefined;
  const nodes: Self[] = [];
  for (const candidate of pending)
    if (isPendingNode<Self>(candidate, runtime)) nodes.push(candidate);
  if (!nodes.length) return;
  const contributions = (runtime.externalContributions ??= new Map());
  const placed = new Set<ValidationIssue>();
  const retired = new Set<ValidationIssue>();
  const paths = new Set<string>();
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    const previous = contributions.get(node);
    if (previous)
      for (let at = 0; at < previous.length; at++) retired.add(previous[at]);
    if (node.detached) {
      contributions.delete(node);
      continue;
    }
    paths.add(node.path);
    const list = runtime.nodeErrors?.get(node);
    if (list) for (let at = 0; at < list.length; at++) placed.add(list[at]);
  }
  const resolved = new Map<string, string>();
  const canonical = (dataPath: string): string => {
    if (dataPath === '' || dataPath.startsWith(SEPARATOR)) return dataPath;
    let path = resolved.get(dataPath);
    if (path === undefined) {
      path = find(root, dataPath)?.path ?? dataPath;
      resolved.set(dataPath, path);
    }
    return path;
  };
  const current = runtime.nodeErrors?.get(root) ?? NO_ISSUES;
  const present = new Set<ValidationIssue>();
  const next: ValidationIssue[] = [];
  let changed = false;
  for (let index = 0; index < current.length; index++) {
    const issue = current[index];
    if (placed.has(issue)) {
      present.add(issue);
      next.push(issue);
    } else if (retired.has(issue) || paths.has(canonical(issue.dataPath)))
      changed = true;
    else next.push(issue);
  }
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    if (node.detached) continue;
    const list = runtime.nodeErrors?.get(node);
    if (list) {
      for (let at = 0; at < list.length; at++)
        if (!present.has(list[at])) {
          next.push(list[at]);
          changed = true;
        }
      contributions.set(node, list);
    } else contributions.delete(node);
  }
  if (!changed) return;
  if (next.length) (runtime.nodeErrors ??= new Map()).set(root, next);
  else runtime.nodeErrors?.delete(root);
  publishRootExternalErrors(root);
  queueNonSettleEvent(root, FieldNodeEventType.UpdateError, next);
};

/**
 * Record one non-root node's external change for the root list; apply it now outside an entry.
 * Inside an entry (batch or write) the nodes accumulate and the root list is rebuilt once when
 * the outermost entry exits or before the next delivery wave.
 * @param node - Non-root occurrence whose external issues were just replaced or removed
 * @returns Nothing; the root event joins the caller's delivery
 */
export const propagateExternalErrorsToRoot = <
  Self extends FieldNodeRecord<Self>,
>(
  node: Self,
): void => {
  const root = node.rootNode;
  const runtime = root.runtime;
  (runtime.pendingExternalErrorNodes ??= new Set()).add(node);
  if (!runtime.entryDepth) rebuildRootExternalErrors(root);
};
