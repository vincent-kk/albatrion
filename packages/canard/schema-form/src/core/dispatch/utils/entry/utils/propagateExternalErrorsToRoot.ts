import { SchemaNodeEventType } from '../../../../record';
import type { SchemaNodeRecord } from '../../../../record';
import type { ValidationIssue } from '../../../../validation';
import { updateSchemaNodeGlobalErrors } from '../../../../validation';
import { queueNonSettleEvent } from '../../chain/queueNonSettleEvent';

/**
 * Reflect one non-root node's external issues in the root list by path (round 185).
 * Issues at that path are replaced by the given ones, appended at the end; an
 * unchanged root list is left as it is, so a form-level apply that already placed
 * the same issue references at the root costs one pass and no event.
 * @param root - Live form root owning the aggregate external list
 * @param path - Absolute path of the node whose external issues changed
 * @param errors - The node's new external issues, empty when cleared
 * @returns Nothing; the root event joins the caller's delivery
 */
export const propagateExternalErrorsToRoot = <
  Self extends SchemaNodeRecord<Self>,
>(
  root: Self,
  path: string,
  errors: readonly ValidationIssue[],
): void => {
  const runtime = root.runtime;
  const current = runtime.nodeErrors?.get(root);
  let kept: ValidationIssue[] | undefined;
  let matched = 0;
  if (current)
    for (let index = 0; index < current.length; index++) {
      const issue = current[index];
      if (issue.dataPath !== path) {
        if (kept) kept.push(issue);
        continue;
      }
      if (matched < errors.length && errors[matched] === issue) matched++;
      else matched = -1;
      if (!kept) kept = current.slice(0, index);
    }
  if (!kept && !errors.length) return;
  if (
    matched === errors.length &&
    kept &&
    kept.length + matched === current!.length
  )
    return;
  const next = kept ?? (current ? current.slice() : []);
  for (let index = 0; index < errors.length; index++) next.push(errors[index]);
  (runtime.nodeErrors ??= new Map()).set(root, next);
  updateSchemaNodeGlobalErrors(root);
  queueNonSettleEvent(root, SchemaNodeEventType.UpdateError, next);
};
