import { isArray } from '@winglet/common-utils/filter';

import { SchemaFormError } from '../../../../../errors';
import { FormErrorCode } from '../../../../../errors';
import type { PendingFormErrorRecord } from '../../../../../errors';
import type { FieldNodeRecord } from '../../../record';
import { indexFieldNodeWarning } from '../../../record';
import {
  prepareFieldNodeValidation,
  scheduleFieldNodeRevealDrop,
  settleFieldNodeValidation,
} from '../../../validation';
import { rebuildRootExternalErrors } from '../entry/utils/propagateExternalErrorsToRoot';
import { bundleChainErrors } from '../report/bundleChainErrors';
import { collectChainRecords } from '../report/collectChainRecords';
import { deliverChainRecords } from '../report/deliverChainRecords';
import { captureChainError } from './captureChainError';
import {
  abortFieldNodeChain,
  readChainAbort,
  restoreChainReporters,
} from './chainAbort';
import { discardFieldNodeChainWork } from './discardFieldNodeChainWork';
import { flushFieldNodeSettings } from './flushFieldNodeSettings';
import { flushQueuedEvents } from './flushQueuedEvents';
import { requestFieldNodeValidationWave } from './requestFieldNodeValidationWave';
import { resolveFieldNodeChainRoot } from './resolveFieldNodeChainRoot';
import { runDeliveryWaves } from './runDeliveryWaves';

/**
 * Exit one public write and finish the outermost chain in contract order.
 * @param node - Record whose runtime owns this active stack
 * @returns Nothing; the chain may throw its single failure or aggregate
 */
export const exitFieldNodeChain = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): void => {
  const passed = new Set<Self['runtime']>();
  const activeRoot = resolveFieldNodeChainRoot(node.rootNode, passed);
  let runtime = activeRoot.runtime;
  if ((runtime.entryDepth ?? 0) > 1) {
    runtime.entryDepth = (runtime.entryDepth ?? 0) - 1;
    return;
  }
  let root = runtime.chainRoot ?? activeRoot;
  let errors: unknown[];
  let occurrences: NonNullable<Self['runtime']['chainOccurrences']>;
  let enclosing: Self['runtime']['enclosingChain'];
  const pending: PendingFormErrorRecord[] = [];
  let interrupted: ReturnType<typeof readChainAbort>;
  try {
    const aborted = readChainAbort(runtime.chainErrors);
    if (aborted) throw aborted.error;
    try {
      rebuildRootExternalErrors(root);
    } catch (error) {
      captureChainError(runtime, error);
    }
    runDeliveryWaves(root);
    flushQueuedEvents(
      resolveFieldNodeChainRoot(root, passed),
      true,
      runtime.chainOrigin ?? 'write',
    );
    root = resolveFieldNodeChainRoot(root, passed);
    runtime = root.runtime;
    occurrences = runtime.chainOccurrences ?? [];
    const warnings = runtime.pendingWarningRecords;

    if (warnings?.size) {
      for (const [key, record] of warnings) {
        let hasWarningOccurrence = false;
        for (
          let index = 0, count = occurrences.length;
          index < count;
          index++
        ) {
          const item = occurrences[index];

          if (item.kind === 'record' && item.record === record) {
            hasWarningOccurrence = true;
            break;
          }
        }
        if (!hasWarningOccurrence) {
          pending.push(record);
        }
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
        let hasGuardFailureOccurrence = false;
        for (
          let index = 0, count = occurrences.length;
          index < count;
          index++
        ) {
          const item = occurrences[index];

          if (item.kind === 'record' && item.record === record) {
            hasGuardFailureOccurrence = true;
            break;
          }
        }
        if (!hasGuardFailureOccurrence) {
          pending.push(record);
        }
        (runtime.reportedGuardFailures ??= new Set()).add(key);
      }
      guardRecords.clear();
    }
    const changed = runtime.chainInitialEmit !== root.emit;
    const requests = runtime.validationTargets;
    if (prepareFieldNodeValidation(root)) {
      if (changed && !requests?.has(root)) requestFieldNodeValidationWave(root);
      for (const target of requests ?? [])
        requestFieldNodeValidationWave(target);
    } else if (runtime.validationPendingEntryStamp !== undefined) {
      settleFieldNodeValidation(root, runtime.validationPendingEntryStamp);
    }
    scheduleFieldNodeRevealDrop(root);
    runtime.validationPendingEntryStamp = undefined;
    runtime.validationTargets = undefined;
    runtime.deferLoadValidation = undefined;
    runtime.entryDepth = 0;
    errors = runtime.chainErrors ?? [];
    if (runtime.stateChanged) {
      runtime.stateChanged = false;
      try {
        runtime.onStateChange?.();
      } catch (error) {
        captureChainError(resolveFieldNodeChainRoot(root).runtime, error);
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
        captureChainError(resolveFieldNodeChainRoot(root).runtime, error);
      } else {
        runtime.onChangeBudget = (runtime.onChangeBudget ?? 0) + 1;
        try {
          runtime.onChange(root.emit);
        } catch (error) {
          captureChainError(resolveFieldNodeChainRoot(root).runtime, error);
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
  } catch (error) {
    root = resolveFieldNodeChainRoot(root, passed);
    runtime = root.runtime;
    interrupted = abortFieldNodeChain(runtime, error);
    discardFieldNodeChainWork(root);
    runtime.entryDepth = 0;
    if (!runtime.enclosingChain) runtime.chainOrigin = undefined;
    throw interrupted.error;
  } finally {
    enclosing = runtime.enclosingChain;
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
      stale.chainOrigin = undefined;
    }
    if (interrupted && !enclosing) {
      try {
        settleFieldNodeValidation(root);
      } catch {
        // Cleanup callbacks cannot replace the collaborator failure already propagating.
      } finally {
        try {
          flushFieldNodeSettings(runtime);
        } catch {
          // The first collaborator failure remains the caller's exception.
        } finally {
          restoreChainReporters(interrupted);
        }
      }
    }
  }
  if (enclosing) {
    enclosing.errors.push(...errors);
    for (const record of pending)
      enclosing.occurrences.push({ kind: 'record', record });
    enclosing.occurrences.push(...occurrences);
    return;
  }
  let original: unknown;
  let handlerErrors: unknown[];
  let reportingFailure: ReturnType<typeof readChainAbort>;
  try {
    try {
      original = bundleChainErrors(errors);
      collectChainRecords(
        pending,
        occurrences,
        runtime.chainOrigin ?? 'write',
        runtime.reportedGuardFailures,
      );
      handlerErrors = deliverChainRecords(
        runtime,
        pending,
        original,
        true,
        runtime.chainOrigin ?? 'write',
      );
    } catch (error) {
      reportingFailure = abortFieldNodeChain(runtime, error, errors);
      throw reportingFailure.error;
    } finally {
      runtime.chainOrigin = undefined;
    }
    const exposed = !errors.length
      ? bundleChainErrors(handlerErrors)
      : handlerErrors.length
        ? bundleChainErrors([original, ...handlerErrors])
        : original;
    if (!errors.length && !handlerErrors.length) return;
    throw exposed;
  } finally {
    try {
      flushFieldNodeSettings(runtime, reportingFailure);
    } finally {
      if (reportingFailure) restoreChainReporters(reportingFailure);
    }
  }
};
