import { SchemaNodeEventType } from '../../../../record';
import type { SchemaNodeRecord } from '../../../../record';
import type { ValidationIssue } from '../../../../validation';
import { queueNonSettleEvent } from '../../chain/queueNonSettleEvent';
import { publishRootExternalErrors } from './publishRootExternalErrors';

/** Shared empty list for a node whose external entry was removed. */
const NO_ISSUES: readonly ValidationIssue[] = [];

/**
 * Rebuild the root's external list once from every non-root path changed since the last rebuild (round 185, 188C-01).
 * Issues at a changed path are replaced by that node's current list, appended at the end in
 * first-change order. When the root list already holds each node's references at its path in
 * order, nothing changes and no event is queued, so a form-level apply that placed the same
 * references at the root costs one pass.
 * @param root - Live form root owning the aggregate external list and the pending path map
 * @returns Nothing; a changed root list queues UpdateError and UpdateGlobalError on the root
 */
export const rebuildRootExternalErrors = <Self extends SchemaNodeRecord<Self>>(
  root: Self,
): void => {
  const runtime = root.runtime;
  const pending = runtime.pendingExternalErrorPaths;
  if (!pending?.size) return;
  runtime.pendingExternalErrorPaths = undefined;
  const current = runtime.nodeErrors?.get(root);
  const cursors = new Map<string, number>();
  let kept: ValidationIssue[] | undefined;
  let changed = false;
  if (current)
    for (let index = 0; index < current.length; index++) {
      const issue = current[index];
      const node = pending.get(issue.dataPath);
      if (!node) {
        if (kept) kept.push(issue);
        continue;
      }
      const list = runtime.nodeErrors?.get(node) ?? NO_ISSUES;
      const cursor = cursors.get(issue.dataPath) ?? 0;
      if (cursor < list.length && list[cursor] === issue)
        cursors.set(issue.dataPath, cursor + 1);
      else changed = true;
      if (!kept) kept = current.slice(0, index);
    }
  let appended = 0;
  for (const [path, node] of pending) {
    const length = (runtime.nodeErrors?.get(node) ?? NO_ISSUES).length;
    appended += length;
    if ((cursors.get(path) ?? 0) !== length) changed = true;
  }
  if (!kept && !appended) return;
  if (kept && !changed) return;
  const next = kept ?? (current ? current.slice() : []);
  for (const node of pending.values()) {
    const list = runtime.nodeErrors?.get(node);
    if (list)
      for (let index = 0; index < list.length; index++) next.push(list[index]);
  }
  (runtime.nodeErrors ??= new Map()).set(root, next);
  publishRootExternalErrors(root);
  queueNonSettleEvent(root, SchemaNodeEventType.UpdateError, next);
};

/**
 * Record one non-root node's external change for the root list; apply it now outside an entry.
 * Inside an entry (batch or write) the paths accumulate and the root list is rebuilt once when
 * the outermost entry exits.
 * @param node - Non-root occurrence whose external issues were just replaced or removed
 * @returns Nothing; the root event joins the caller's delivery
 */
export const propagateExternalErrorsToRoot = <
  Self extends SchemaNodeRecord<Self>,
>(
  node: Self,
): void => {
  const root = node.rootNode;
  const runtime = root.runtime;
  (runtime.pendingExternalErrorPaths ??= new Map()).set(node.path, node);
  if (!runtime.entryDepth) rebuildRootExternalErrors(root);
};
