import { JSONSchemaError, SchemaFormError, VALIDATOR_COMPILE_FAILED } from '../../../../errors';
import type { SchemaNodeRecord } from '../../../record';
import type { ValidationIssue } from '../../../validation';
import { routeValidationIssues, runSchemaNodeValidation } from '../../../validation';
import { ValidationMode } from '../../../types/state';
import { deliverValidationWave } from '../chain/deliverValidationWave';
import { bundleChainErrors } from '../report/bundleChainErrors';
import { createFormErrorRecord } from '../report/createFormErrorRecord';
import { deliverChainRecords } from '../report/deliverChainRecords';
import { readFormErrorCode } from '../report/readFormErrorCode';

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
    const compileFailure = failure instanceof SchemaFormError &&
      failure.code === `SCHEMA_FORM_ERROR.${VALIDATOR_COMPILE_FAILED}`;
    if (compileFailure) runtime.validationUnavailable = true;
    const firstReport = !compileFailure || !runtime.validationCompileReported;
    if (compileFailure) runtime.validationCompileReported = true;
    if (firstReport && runtime.errorReporter?.hasConsumer()) {
      const details = failure instanceof SchemaFormError ||
        failure instanceof JSONSchemaError ? failure.details : undefined;
      const record = createFormErrorRecord(true, readFormErrorCode(failure), 'error',
        () => failure instanceof Error ? failure.message : String(failure),
        { error: failure, ...(details ? { details } : {}), surface: 'rejected' });
      const handlerErrors = deliverChainRecords(runtime, record ? [record] : [],
        failure, true);
      if (handlerErrors.length) throw bundleChainErrors([failure, ...handlerErrors]);
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
