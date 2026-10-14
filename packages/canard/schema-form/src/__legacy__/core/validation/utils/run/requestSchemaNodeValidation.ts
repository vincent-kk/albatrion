import { VALIDATOR_COMPILE_FAILED } from '../../../../errors';
import type { SchemaNodeRecord } from '../../../record';
import { ValidationMode } from '../../../types/state';
import type { ValidationIssue } from '../../type';
import { routeValidationIssues } from '../route/routeValidationIssues';
import { runSchemaNodeValidation } from './runSchemaNodeValidation';

/**
 * Coalesce write-triggered checks and deliver only the newest commit's verdict.
 * @param node - Root or subtree scope requested by the dispatch chain.
 * @param deliver - Dispatcher callback that emits the latest result as its own wave.
 * @returns Nothing; validation runs in a microtask after synchronous settlement.
 */
export const requestSchemaNodeValidation = <Self extends SchemaNodeRecord<Self>>(
  node: Self, deliver: (issues: readonly ValidationIssue[], commit: number) => void,
): void => {
  const runtime = node.rootNode.runtime;
  if (runtime.validationMode === ValidationMode.None ||
    runtime.validationUnavailable) return;
  runtime.validationStamp = (runtime.validationStamp ?? 0) + 1;
  runtime.validationRequestStamp = runtime.validationStamp;
  (runtime.validationPendingTargets ??= new Set()).add(node);
  if (runtime.validationQueued) return;
  runtime.validationQueued = true;
  queueMicrotask(() => {
    runtime.validationQueued = false;
    if (runtime.validationStamp !== runtime.validationRequestStamp) {
      runtime.validationPendingTargets = undefined;
      return;
    }
    const targets = runtime.validationPendingTargets ?? new Set([node]);
    runtime.validationPendingTargets = undefined;
    const stamp = runtime.validationStamp;
    const commit = runtime.commitNumber ?? 0;
    void runSchemaNodeValidation(node).then((issues) => {
      if (issues === null) return;
      if (runtime.validationStamp !== stamp || (runtime.commitNumber ?? 0) !== commit)
        return;
      for (const target of targets) routeValidationIssues(target, issues);
      runtime.validationResult = { commit, issues };
      deliver(issues, commit);
    }).catch((failure: unknown) => {
      if (runtime.validationStamp !== stamp) return;
      if (failure !== null && typeof failure === 'object' &&
        'code' in failure &&
        failure.code === `SCHEMA_FORM_ERROR.${VALIDATOR_COMPILE_FAILED}`) {
        runtime.validationUnavailable = true;
        if (runtime.validationCompileReported) return;
        runtime.validationCompileReported = true;
      }
      runtime.reportValidationFailure?.(failure);
    });
  });
};
