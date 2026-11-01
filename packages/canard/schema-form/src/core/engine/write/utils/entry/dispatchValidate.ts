import type { Nullable } from '@aileron/declare';

import {
  FormErrorCode,
  JSONSchemaError,
  SchemaFormError,
} from '../../../../../errors';
import type { FieldNodeRecord } from '../../../record';
import { ValidationMode } from '../../../types/state';
import type { ValidationIssue } from '../../../validation';
import {
  releaseFieldNodeRevealHistory,
  retainEqualValidationIssues,
  routeValidationIssues,
  runFieldNodeValidation,
  settleFieldNodeValidation,
} from '../../../validation';
import { deliverValidationWave } from '../chain/deliverValidationWave';
import { requestFieldNodeValidationWave } from '../chain/requestFieldNodeValidationWave';
import { bundleChainErrors } from '../report/bundleChainErrors';
import { createFormErrorRecord } from '../report/createFormErrorRecord';
import { deliverChainRecords } from '../report/deliverChainRecords';
import { readFormErrorCode } from '../report/readFormErrorCode';

/**
 * Revalidate the current emitted snapshot on explicit request.
 * @param node - Root or subtree whose displayed errors should refresh.
 * @returns The unfiltered whole-schema verdict; the previous list when the fresh verdict deep-equals it.
 * Retired occurrences validate their frozen snapshot without publishing results.
 * @throws A structured validator compilation or execution failure.
 */
export const dispatchValidate = async <Self extends FieldNodeRecord<Self>>(
  node: Self,
): Promise<readonly ValidationIssue[]> => {
  const runtime = node.rootNode.runtime;
  if (runtime.validationMode === ValidationMode.None) return [];
  if (node.disposed || node.rootNode.disposed)
    return (await runFieldNodeValidation(node)) ?? [];
  if (node === node.rootNode) {
    runtime.validationStamp = (runtime.validationStamp ?? 0) + 1;
    runtime.validationPendingTargets = undefined;
  } else runtime.validationStamp ??= 0;
  const stamp = runtime.validationStamp;
  const running =
    node === node.rootNode ? { stamp, targets: new Set([node]) } : undefined;
  if (running) runtime.validationRunning = running;
  const commit = runtime.commitNumber ?? 0;
  const loadStamp = runtime.validationLoadStamp;
  let result: Nullable<readonly ValidationIssue[]>;
  try {
    result = await runFieldNodeValidation(node);
  } catch (failure) {
    if (node.disposed || node.rootNode.disposed) throw failure;
    const compileFailure =
      failure instanceof SchemaFormError &&
      failure.code === FormErrorCode.ValidatorCompileFailed;
    if (compileFailure && loadStamp !== runtime.validationLoadStamp)
      throw failure;
    if (compileFailure) {
      runtime.validationUnavailable = true;
      settleFieldNodeValidation(node);
    } else if (node === node.rootNode) settleFieldNodeValidation(node, stamp);
    const firstReport = !compileFailure || !runtime.validationCompileReported;
    if (compileFailure) runtime.validationCompileReported = true;
    if (firstReport && runtime.errorReporter?.hasConsumer()) {
      const details =
        failure instanceof SchemaFormError || failure instanceof JSONSchemaError
          ? failure.details
          : undefined;
      const record = createFormErrorRecord(
        true,
        readFormErrorCode(failure),
        'error',
        () => (failure instanceof Error ? failure.message : String(failure)),
        {
          error: failure,
          ...(details ? { details } : {}),
          origin: 'validate',
        },
      );
      const handlerErrors = deliverChainRecords(
        runtime,
        record ? [record] : [],
        failure,
        true,
        'validate',
      );
      if (handlerErrors.length)
        throw bundleChainErrors([failure, ...handlerErrors]);
    }
    throw failure;
  } finally {
    if (running && runtime.validationRunning === running)
      runtime.validationRunning = undefined;
  }
  if (result === null) {
    if (node === node.rootNode) settleFieldNodeValidation(node, stamp);
    return [];
  }
  if (runtime.validationStamp !== stamp) return result;
  if ((runtime.commitNumber ?? 0) !== commit) {
    if (node === node.rootNode) {
      if ((runtime.validationMode ?? 0) & ValidationMode.OnChange)
        requestFieldNodeValidationWave(node);
      else settleFieldNodeValidation(node, stamp);
    }
    return result;
  }
  const issues = retainEqualValidationIssues(node, result);
  routeValidationIssues(node, issues);
  runtime.validationResult = { commit, issues };
  if (node === node.rootNode) {
    if (runtime.validationPending) settleFieldNodeValidation(node, stamp);
    else releaseFieldNodeRevealHistory(node);
  }
  deliverValidationWave(node, issues, commit);
  return issues;
};
