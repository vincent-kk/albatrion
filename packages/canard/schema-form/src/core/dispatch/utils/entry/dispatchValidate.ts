import type { SchemaNodeRecord } from '../../../record';
import type { ValidationIssue } from '../../../validation';
import { routeValidationIssues, runSchemaNodeValidation } from '../../../validation';
import { deliverValidationWave } from '../chain/deliverValidationWave';
import { reportValidationFailure } from '../report/reportValidationFailure';
import { VALIDATOR_COMPILE_FAILED } from '../../../../errors';
import { ValidationMode } from '../../../types/state';

/**
 * Revalidate the current emitted snapshot on explicit request.
 * @param node - Root or subtree whose displayed errors should refresh.
 * @returns The fresh, unfiltered whole-schema verdict.
 * @throws A structured validator compilation or execution failure.
 */
export const dispatchValidate = async <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): Promise<readonly ValidationIssue[]> => {
  const runtime = node.rootNode.runtime;
  if (runtime.validationMode === ValidationMode.None) return [];
  runtime.validationStamp = (runtime.validationStamp ?? 0) + 1;
  runtime.validationPendingTargets = undefined;
  const stamp = runtime.validationStamp;
  const commit = runtime.commitNumber ?? 0;
  let issues: readonly ValidationIssue[] | null;
  try { issues = await runSchemaNodeValidation(node); }
  catch (failure) {
    if (failure !== null && typeof failure === 'object' &&
      'code' in failure &&
      failure.code === `SCHEMA_FORM_ERROR.${VALIDATOR_COMPILE_FAILED}`) {
      runtime.validationUnavailable = true;
      if (!runtime.validationCompileReported) {
        runtime.validationCompileReported = true;
        if (runtime.errorReporter?.hasConsumer())
          reportValidationFailure(runtime, failure);
      }
    }
    throw failure;
  }
  if (issues === null) return [];
  if (runtime.validationStamp === stamp && (runtime.commitNumber ?? 0) === commit) {
    routeValidationIssues(node, issues);
    runtime.validationResult = { commit, issues };
    deliverValidationWave(node, issues, commit);
  }
  return issues;
};
