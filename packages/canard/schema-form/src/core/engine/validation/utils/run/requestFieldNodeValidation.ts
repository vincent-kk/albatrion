import { FormErrorCode } from '../../../../../errors';
import type { FieldNodeRecord } from '../../../record';
import { ValidationMode } from '../../../types/state';
import { createValidationCadence } from '../../../validationScheduling';
import type { ValidationIssue } from '../../types/issue';
import { isFieldNodeValidationCurrent } from '../read/isFieldNodeValidationCurrent';
import { isFieldNodeValidationLifetimeCurrent } from '../read/isFieldNodeValidationLifetimeCurrent';
import { retainEqualValidationIssues } from '../route/retainEqualValidationIssues';
import { routeValidationIssues } from '../route/routeValidationIssues';
import { failValidationCompile } from './failValidationCompile';
import { runFieldNodeValidation } from './runFieldNodeValidation';
import { settleFieldNodeValidation } from './settleFieldNodeValidation';

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
  const root = node.rootNode;
  const runtime = root.runtime;
  if (
    runtime.validationMode === ValidationMode.None ||
    runtime.validationUnavailable
  )
    return;
  runtime.validationPending = true;
  const active = runtime.validationRunning;
  if (active && active.stamp === runtime.validationStamp)
    for (const target of active.targets)
      (runtime.validationPendingTargets ??= new Set()).add(target);
  runtime.validationStamp = (runtime.validationStamp ?? 0) + 1;
  runtime.validationRequestStamp = runtime.validationStamp;
  (runtime.validationPendingTargets ??= new Set()).add(node);
  const epoch = runtime.validationEpoch;
  const load = runtime.validationLoadStamp;
  runtime.validationRun = () => {
    if (
      node.rootNode.disposed ||
      runtime.validationEpoch !== epoch ||
      runtime.validationLoadStamp !== load ||
      runtime.validationMode === ValidationMode.None ||
      runtime.validationStamp !== runtime.validationRequestStamp
    ) {
      runtime.validationPendingTargets = undefined;
      return false;
    }
    const targets = runtime.validationPendingTargets ?? new Set([node]);
    runtime.validationPendingTargets = undefined;
    const stamp = runtime.validationStamp ?? 0;
    const running = { stamp, targets };
    runtime.validationRunning = running;
    const commit = runtime.commitNumber ?? 0;
    void runFieldNodeValidation(node)
      .then((result) => {
        if (runtime.validationRunning === running)
          runtime.validationRunning = undefined;
        if (!isFieldNodeValidationCurrent(node, load, epoch, stamp)) return;
        if (result === null) {
          settleFieldNodeValidation(node, stamp);
          return;
        }
        if ((runtime.commitNumber ?? 0) !== commit) {
          for (const target of targets)
            (runtime.validationPendingTargets ??= new Set()).add(target);
          runtime.validationCadence?.request();
          return;
        }
        const issues = retainEqualValidationIssues(node, result);
        routeValidationIssues(targets, issues);
        runtime.validationResult = { commit, issues };
        settleFieldNodeValidation(node, stamp);
        if (isFieldNodeValidationCurrent(node, load, epoch, stamp, commit))
          deliver(issues, commit);
      })
      .catch((failure: unknown) => {
        if (runtime.validationRunning === running)
          runtime.validationRunning = undefined;
        if (
          !isFieldNodeValidationLifetimeCurrent(root, epoch) ||
          runtime.validationStamp !== stamp
        )
          return;
        settleFieldNodeValidation(node, stamp);
        if (!isFieldNodeValidationLifetimeCurrent(root, epoch)) return;
        if (
          failure !== null &&
          typeof failure === 'object' &&
          'code' in failure &&
          failure.code === FormErrorCode.ValidatorCompileFailed
        )
          failValidationCompile(node, failure);
        else runtime.reportValidationFailure?.(failure);
      });
    return true;
  };
  runtime.validationCadence ??= createValidationCadence(
    () => runtime.validationRun?.() ?? false,
    () => performance.now(),
  );
  runtime.validationCadence.request();
};
