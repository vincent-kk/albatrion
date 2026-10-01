import { FEEDBACK_LIMIT_EXCEEDED, SchemaFormError } from '../../../../errors';
import type { FormErrorRecord } from '../../../../errors';
import type { SchemaNodeRecord } from '../../../record';
import { ValidationMode } from '../../../types/state';
import { requestSchemaNodeValidation } from '../../../validation';
import { deliverValidationWave } from './deliverValidationWave';
import { reportValidationFailure } from '../report/reportValidationFailure';
import { runDeliveryWaves } from './runDeliveryWaves';
import { flushQueuedEvents } from './flushQueuedEvents';
import { resolveSchemaNodeChainRoot } from './resolveSchemaNodeChainRoot';
import { bundleChainErrors } from '../report/bundleChainErrors';
import { collectChainRecords } from '../report/collectChainRecords';
import { deliverChainRecords } from '../report/deliverChainRecords';
import { captureChainError } from './captureChainError';

/**
 * Exit one public write and finish the outermost chain in contract order.
 * @param node - Record whose runtime owns this active stack
 * @param failure - Caught settlement or user callback failure, if present
 * @returns Nothing; the chain may throw its single failure or aggregate
 */
export const exitSchemaNodeChain = <Self extends SchemaNodeRecord<Self>>(
  node: Self, failure?: unknown,
): void => {
  const activeRoot = resolveSchemaNodeChainRoot(node.rootNode);
  const runtime = activeRoot.runtime;
  if (failure !== undefined) captureChainError(runtime, failure);
  if ((runtime.entryDepth ?? 0) > 1) {
    runtime.entryDepth = (runtime.entryDepth ?? 0) - 1;
    return;
  }
  const root = runtime.chainRoot ?? activeRoot;
  runDeliveryWaves(root);
  flushQueuedEvents(root);
  const occurrences = runtime.chainOccurrences ?? [];
  const pending: FormErrorRecord[] = [];
  const warnings = runtime.pendingWarningRecords;
  if (warnings?.size) {
    for (const record of warnings.values())
      if (!occurrences.some((item) => item.kind === 'record' && item.record === record))
        pending.push(record);
    warnings.clear();
  }
  const guardRecords = runtime.guardFailureRecords;
  if (guardRecords?.size) {
    for (const [key, record] of guardRecords) {
      if (!occurrences.some((item) => item.kind === 'record' && item.record === record))
        pending.push(record);
      (runtime.reportedGuardFailures ??= new Set()).add(key);
    }
    guardRecords.clear();
  }
  const changed = runtime.chainInitialEmit !== root.emit;
  const requests = runtime.validationTargets;
  if (runtime.validationMode && runtime.validationMode & ValidationMode.OnChange) {
    runtime.reportValidationFailure ??= (error) =>
      reportValidationFailure(runtime, error);
    if (changed && !requests?.has(root)) {
      requestSchemaNodeValidation(root, (issues, commit) =>
        deliverValidationWave(root, issues, commit));
    }
    for (const target of requests ?? []) {
      requestSchemaNodeValidation(target, (issues, commit) =>
        deliverValidationWave(target, issues, commit));
    }
  }
  runtime.validationTargets = undefined;
  runtime.entryDepth = 0;
  const errors = runtime.chainErrors ?? [];
  if (runtime.stateChanged) {
    runtime.stateChanged = false;
    try { runtime.onStateChange?.(); }
    catch (error) {
      errors.push(error);
      if (runtime.errorReporter?.hasConsumer())
        occurrences.push({ kind: 'error', error });
    }
    runtime.chainErrors = errors;
    runtime.chainOccurrences = occurrences;
  }
  if (changed && runtime.onChange) {
    if ((runtime.onChangeBudget ?? 0) >= 25) {
      const error = new SchemaFormError(FEEDBACK_LIMIT_EXCEEDED,
        'onChange nesting exceeded 25 callbacks');
      errors.push(error);
      if (runtime.errorReporter?.hasConsumer())
        occurrences.push({ kind: 'error', error });
    }
    else {
      runtime.onChangeBudget = (runtime.onChangeBudget ?? 0) + 1;
      try { runtime.onChange(root.emit); }
      catch (error) {
        errors.push(error);
        if (runtime.errorReporter?.hasConsumer())
          occurrences.push({ kind: 'error', error });
      }
      finally { runtime.onChangeBudget -= 1; }
    }
  }
  const enclosing = runtime.enclosingChain;
  runtime.enclosingChain = enclosing?.outer;
  runtime.chainErrors = enclosing?.errors;
  runtime.chainRoot = undefined;
  runtime.feedbackBudget = 0;
  runtime.feedbackBlockedListeners = undefined;
  runtime.feedbackLimitReported = false;
  runtime.chainOccurrences = enclosing?.occurrences;
  if (enclosing) {
    enclosing.errors.push(...errors);
    for (const record of pending) enclosing.occurrences.push({ kind: 'record', record });
    enclosing.occurrences.push(...occurrences);
    return;
  }
  const original = bundleChainErrors(errors);
  const aggregate = errors.length > 1 && original instanceof SchemaFormError
    ? original : undefined;
  collectChainRecords(pending, occurrences, aggregate, 'thrown',
    runtime.reportedGuardFailures);
  const handlerErrors = deliverChainRecords(runtime, pending, original, true);
  const exposed = !errors.length ? bundleChainErrors(handlerErrors) :
    handlerErrors.length ? bundleChainErrors([original, ...handlerErrors]) : original;
  if (!errors.length && !handlerErrors.length) return;
  throw exposed;
};
