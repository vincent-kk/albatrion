import { isArray } from '@winglet/common-utils/filter';

import { SchemaFormError } from '../../../../../errors';
import { FormErrorCode } from '../../../../../errors';
import type { FormErrorRecord } from '../../../../../errors';
import type { FieldNodeRecord } from '../../../record';
import { indexFieldNodeWarning } from '../../../record';
import { ValidationMode } from '../../../types/state';
import { requestFieldNodeValidation } from '../../../validation';
import { rebuildRootExternalErrors } from '../entry/utils/propagateExternalErrorsToRoot';
import { bundleChainErrors } from '../report/bundleChainErrors';
import { collectChainRecords } from '../report/collectChainRecords';
import { deliverChainRecords } from '../report/deliverChainRecords';
import { reportValidationFailure } from '../report/reportValidationFailure';
import { captureChainError } from './captureChainError';
import { deliverValidationWave } from './deliverValidationWave';
import { flushQueuedEvents } from './flushQueuedEvents';
import { resolveFieldNodeChainRoot } from './resolveFieldNodeChainRoot';
import { runDeliveryWaves } from './runDeliveryWaves';

/**
 * Exit one public write and finish the outermost chain in contract order.
 * @param node - Record whose runtime owns this active stack
 * @param failure - Caught settlement or user callback failure, if present
 * @returns Nothing; the chain may throw its single failure or aggregate
 */
export const exitFieldNodeChain = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  failure?: unknown,
): void => {
  const passed = new Set<Self['runtime']>();
  const activeRoot = resolveFieldNodeChainRoot(node.rootNode, passed);
  let runtime = activeRoot.runtime;
  if (failure !== undefined) captureChainError(runtime, failure);
  if ((runtime.entryDepth ?? 0) > 1) {
    runtime.entryDepth = (runtime.entryDepth ?? 0) - 1;
    return;
  }
  let root = runtime.chainRoot ?? activeRoot;
  rebuildRootExternalErrors(root);
  runDeliveryWaves(root);
  flushQueuedEvents(resolveFieldNodeChainRoot(root, passed));
  root = resolveFieldNodeChainRoot(root, passed);
  runtime = root.runtime;
  const occurrences = runtime.chainOccurrences ?? [];
  const pending: FormErrorRecord[] = [];
  const warnings = runtime.pendingWarningRecords;
  if (warnings?.size) {
    for (const [key, record] of warnings) {
      if (
        !(() => {
          const items = occurrences;
          for (let index = 0, count = items.length; index < count; index++) {
            if (!(index in items)) continue;
            const item = items[index];
            if (item.kind === 'record' && item.record === record) return true;
          }
          return false;
        })()
      )
        pending.push(record);
      if (!runtime.warningKeys?.has(key)) {
        const parts: unknown = JSON.parse(key.startsWith('[') ? key : 'null');
        const path = isArray(parts) ? parts[1] : undefined;
        indexFieldNodeWarning(
          runtime,
          key,
          typeof path === 'string' ? path : undefined,
          undefined,
          true,
        );
      }
    }
    warnings.clear();
  }
  const guardRecords = runtime.guardFailureRecords;
  if (guardRecords?.size) {
    for (const [key, record] of guardRecords) {
      if (
        !(() => {
          const items = occurrences;
          for (let index = 0, count = items.length; index < count; index++) {
            if (!(index in items)) continue;
            const item = items[index];
            if (item.kind === 'record' && item.record === record) return true;
          }
          return false;
        })()
      )
        pending.push(record);
      (runtime.reportedGuardFailures ??= new Set()).add(key);
    }
    guardRecords.clear();
  }
  const changed = runtime.chainInitialEmit !== root.emit;
  const requests = runtime.validationTargets;
  if (
    !runtime.deferMountValidation &&
    runtime.validationMode &&
    runtime.validationMode & ValidationMode.OnChange
  ) {
    runtime.reportValidationFailure ??= (error) =>
      reportValidationFailure(runtime, error);
    if (changed && !requests?.has(root)) {
      requestFieldNodeValidation(root, (issues, commit) =>
        deliverValidationWave(root, issues, commit),
      );
    }
    for (const target of requests ?? []) {
      requestFieldNodeValidation(target, (issues, commit) =>
        deliverValidationWave(target, issues, commit),
      );
    }
  }
  runtime.validationTargets = undefined;
  runtime.deferMountValidation = undefined;
  runtime.entryDepth = 0;
  const errors = runtime.chainErrors ?? [];
  if (runtime.stateChanged) {
    runtime.stateChanged = false;
    try {
      runtime.onStateChange?.();
    } catch (error) {
      errors.push(error);
      if (runtime.errorReporter?.hasConsumer())
        occurrences.push({ kind: 'error', error });
    }
    root = resolveFieldNodeChainRoot(root, passed);
    runtime = root.runtime;
    runtime.chainErrors = errors;
    runtime.chainOccurrences = occurrences;
  }
  if (changed && runtime.onChange) {
    if ((runtime.onChangeBudget ?? 0) >= 25) {
      const error = new SchemaFormError(
        FormErrorCode.FeedbackLimitExceeded,
        'onChange nesting exceeded 25 callbacks',
      );
      errors.push(error);
      if (runtime.errorReporter?.hasConsumer())
        occurrences.push({ kind: 'error', error });
    } else {
      runtime.onChangeBudget = (runtime.onChangeBudget ?? 0) + 1;
      try {
        runtime.onChange(root.emit);
      } catch (error) {
        errors.push(error);
        if (runtime.errorReporter?.hasConsumer())
          occurrences.push({ kind: 'error', error });
      } finally {
        const raised = new Set<Self['runtime']>();
        root = resolveFieldNodeChainRoot(root, raised);
        runtime = root.runtime;
        for (const owner of raised) {
          owner.onChangeBudget = (owner.onChangeBudget ?? 1) - 1;
          passed.add(owner);
        }
      }
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
  // Adoptions during this chain left every runtime it passed through pointing at the
  // chain's shared error list; return them to the enclosing state as well.
  for (const stale of passed) {
    if (stale === runtime) continue;
    stale.chainErrors = runtime.chainErrors;
    stale.chainRoot = undefined;
  }
  if (enclosing) {
    enclosing.errors.push(...errors);
    for (const record of pending)
      enclosing.occurrences.push({ kind: 'record', record });
    enclosing.occurrences.push(...occurrences);
    return;
  }
  const original = bundleChainErrors(errors);
  const aggregate =
    errors.length > 1 && original instanceof SchemaFormError
      ? original
      : undefined;
  collectChainRecords(
    pending,
    occurrences,
    aggregate,
    'thrown',
    runtime.reportedGuardFailures,
  );
  const handlerErrors = deliverChainRecords(runtime, pending, original, true);
  const exposed = !errors.length
    ? bundleChainErrors(handlerErrors)
    : handlerErrors.length
      ? bundleChainErrors([original, ...handlerErrors])
      : original;
  if (!errors.length && !handlerErrors.length) return;
  throw exposed;
};
