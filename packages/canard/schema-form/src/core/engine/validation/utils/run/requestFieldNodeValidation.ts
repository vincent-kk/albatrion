import { FormErrorCode } from '../../../../../errors';
import type { FieldNodeRecord } from '../../../record';
import { ValidationMode } from '../../../types/state';
import type { ValidationIssue } from '../../types/issue';
import { retainEqualValidationIssues } from '../route/retainEqualValidationIssues';
import { routeValidationIssues } from '../route/routeValidationIssues';
import { runFieldNodeValidation } from './runFieldNodeValidation';
import { scheduleValidationSlot } from './scheduleValidationSlot';

/**
 * Coalesce write-triggered checks and deliver only the newest commit's verdict.
 * @param node - Root or subtree scope requested by the dispatch chain.
 * @param deliver - Dispatcher callback that emits the latest result as its own wave.
 * @returns Nothing; validation runs in the next frame-backed slot after settlement.
 */
export const requestFieldNodeValidation = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  deliver: (issues: readonly ValidationIssue[], commit: number) => void,
): void => {
  const runtime = node.rootNode.runtime;
  if (
    runtime.validationMode === ValidationMode.None ||
    runtime.validationUnavailable
  )
    return;
  runtime.validationStamp = (runtime.validationStamp ?? 0) + 1;
  runtime.validationRequestStamp = runtime.validationStamp;
  (runtime.validationPendingTargets ??= new Set()).add(node);
  if (runtime.validationQueued) return;
  runtime.validationQueued = true;
  scheduleValidationSlot(() => {
    runtime.validationQueued = false;
    if (runtime.validationStamp !== runtime.validationRequestStamp) {
      runtime.validationPendingTargets = undefined;
      return;
    }
    const targets = runtime.validationPendingTargets ?? new Set([node]);
    runtime.validationPendingTargets = undefined;
    const stamp = runtime.validationStamp;
    const commit = runtime.commitNumber ?? 0;
    void runFieldNodeValidation(node)
      .then((result) => {
        if (result === null) return;
        if (
          runtime.validationStamp !== stamp ||
          (runtime.commitNumber ?? 0) !== commit
        )
          return;
        const issues = retainEqualValidationIssues(node, result);
        for (const target of targets) routeValidationIssues(target, issues);
        runtime.validationResult = { commit, issues };
        deliver(issues, commit);
      })
      .catch((failure: unknown) => {
        if (runtime.validationStamp !== stamp) return;
        if (
          failure !== null &&
          typeof failure === 'object' &&
          'code' in failure &&
          failure.code === FormErrorCode.ValidatorCompileFailed
        ) {
          runtime.validationUnavailable = true;
          if (runtime.validationCompileReported) return;
          runtime.validationCompileReported = true;
        }
        runtime.reportValidationFailure?.(failure);
      });
  });
};
