import { FEEDBACK_LIMIT_EXCEEDED, JSONSchemaError, SchemaFormError } from '../../../../errors';
import type { FormErrorRecord } from '../../../../errors';
import type { SchemaNodeRecord } from '../../../record';
import { ValidationMode } from '../../../types/state';
import { runDeliveryWaves } from './runDeliveryWaves';
import { flushQueuedEvents } from './flushQueuedEvents';
import { resolveSchemaNodeChainRoot } from './resolveSchemaNodeChainRoot';
import { bundleChainErrors } from '../report/bundleChainErrors';
import { createFormErrorRecord } from '../report/createFormErrorRecord';
import { deliverChainRecords } from '../report/deliverChainRecords';
import { readFormErrorCode } from '../report/readFormErrorCode';
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
    if (changed && !requests?.has(root)) {
      try { runtime.requestValidation?.(root); }
      catch (error) { captureChainError(runtime, error); }
    }
    for (const target of requests ?? []) {
      try { runtime.requestValidation?.(target); }
      catch (error) { captureChainError(runtime, error); }
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
  runtime.chainErrors = undefined;
  runtime.chainRoot = undefined;
  runtime.feedbackBudget = 0;
  runtime.feedbackBlockedListeners = undefined;
  runtime.feedbackLimitReported = false;
  const original = bundleChainErrors(errors);
  const aggregate = errors.length > 1 && original instanceof SchemaFormError
    ? original : undefined;
  for (const occurrence of occurrences) {
    if (occurrence.kind === 'record') {
      pending.push(occurrence.record);
      continue;
    }
    const error = occurrence.error;
      const existing = pending.find((record) =>
        record.level === 'error' && record.code === readFormErrorCode(error) &&
        error instanceof SchemaFormError &&
        record.schemaPath === error.details.schemaPath);
      if (existing && error instanceof SchemaFormError) {
        existing.error = error;
        existing.details = error.details;
        existing.surface = 'thrown';
        if (aggregate) existing.aggregate = aggregate;
        continue;
      }
      const record = createFormErrorRecord(true, readFormErrorCode(error), 'error',
        () => error instanceof Error ? error.message : String(error),
        { error, ...(error instanceof SchemaFormError ||
          error instanceof JSONSchemaError ? { details: error.details } : {}),
          ...(aggregate ? { aggregate } : {}), surface: 'thrown' });
      if (record) pending.push(record);
  }
  const handlerErrors = deliverChainRecords(runtime, pending, original, true);
  runtime.chainOccurrences = undefined;
  const exposed = !errors.length ? bundleChainErrors(handlerErrors) :
    handlerErrors.length ? bundleChainErrors([original, ...handlerErrors]) : original;
  if (errors.length || handlerErrors.length) throw exposed;
};
