import { FormErrorCode, SchemaFormError } from '../../../../../errors';
import { FieldNodeRevisionLedger } from '../../../record';
import type { FieldNodeDelivery, FieldNodeRecord } from '../../../record';
import { rebuildRootExternalErrors } from '../entry/utils/propagateExternalErrorsToRoot';
import { finishQueuedErrors } from '../report/finishQueuedErrors';
import { captureChainError } from './captureChainError';
import { deliverWave } from './deliverWave';
import { resolveFieldNodeChainRoot } from './resolveFieldNodeChainRoot';
import { runDeliveryWaves } from './runDeliveryWaves';

/**
 * Accept only live records from this runtime for revision accounting.
 * @param candidate - Key held by the pending event table
 * @param runtime - Runtime that owns the pending wave
 * @returns Whether the key is a live node of this tree
 */
const isQueuedNode = <Self extends FieldNodeRecord<Self>>(
  candidate: unknown,
  runtime: Self['runtime'],
): candidate is Self =>
  candidate !== null &&
  typeof candidate === 'object' &&
  Reflect.get(candidate, 'runtime') === runtime &&
  Reflect.get(candidate, 'detached') === false;

/**
 * Deliver merged non-settlement bits in waves after committed events; a non-root
 * external-error change made by a listener is folded into the root list before the
 * next wave and counts against the same feedback budget (195C-01).
 * @param root - Live root owning the queued event table and observers
 * @param caller - Whether a synchronous caller receives standalone failures
 * @returns Nothing; standalone failures are exposed after all deliveries
 */
export const flushQueuedEvents = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  caller = true,
): void => {
  const entryRuntime = root.runtime;
  if (entryRuntime.flushingQueuedEvents) return;
  entryRuntime.flushingQueuedEvents = true;
  const standalone = !entryRuntime.entryDepth && !entryRuntime.chainErrors;
  const previousErrors = entryRuntime.chainErrors;
  const previousOccurrences = entryRuntime.chainOccurrences;
  let waves = 0;
  let budgetReported = false;
  if (standalone) {
    entryRuntime.chainErrors = [];
    entryRuntime.chainOccurrences = [];
  }
  const owners = new Set([entryRuntime]);
  let active = root;
  let runtime = entryRuntime;
  try {
    for (;;) {
      active = resolveFieldNodeChainRoot(active);
      runtime = active.runtime;
      runtime.flushingQueuedEvents = true;
      owners.add(runtime);
      if (
        !runtime.pendingExternalErrorNodes?.size &&
        !runtime.queuedNonSettleEvents?.size &&
        !runtime.deliveries?.size &&
        !(!runtime.entryDepth && runtime.stateChanged)
      )
        break;
      if (runtime.pendingExternalErrorNodes?.size) {
        rebuildRootExternalErrors(active);
        continue;
      }
      if (runtime.deliveries?.size) {
        runDeliveryWaves(active);
        continue;
      }
      if (runtime.queuedNonSettleEvents?.size) {
        waves += 1;
        if (waves > 25) {
          for (const node of runtime.queuedNonSettleEvents)
            node.pendingNonSettleDelivery = undefined;
          runtime.queuedNonSettleEvents = undefined;
          if (!budgetReported)
            captureChainError(
              runtime,
              new SchemaFormError(
                FormErrorCode.FeedbackLimitExceeded,
                'Non-settlement feedback exceeded 25 waves',
              ),
            );
          budgetReported = true;
          continue;
        }
        const pending: [Self, FieldNodeDelivery][] = [];
        for (const candidate of runtime.queuedNonSettleEvents) {
          const delivery = candidate.pendingNonSettleDelivery;
          candidate.pendingNonSettleDelivery = undefined;
          if (!delivery) continue;
          if (!isQueuedNode<Self>(candidate, runtime)) continue;
          const node = candidate;
          pending.push([node, delivery]);
          node.revisionLedger = new FieldNodeRevisionLedger(
            node.revisionLedger,
            delivery.type,
          );
        }
        runtime.queuedNonSettleEvents = undefined;
        deliverWave(active, pending);
        continue;
      }
      runtime.stateChanged = false;
      try {
        runtime.onStateChange?.();
      } catch (error) {
        captureChainError(runtime, error);
      }
    }
    if (standalone)
      finishQueuedErrors(
        runtime,
        runtime.chainErrors ?? [],
        runtime.chainOccurrences ?? [],
        caller,
      );
  } finally {
    for (const owner of owners) {
      owner.flushingQueuedEvents = false;
      if (!standalone) continue;
      owner.chainErrors = previousErrors;
      owner.chainOccurrences = previousOccurrences;
      if (owner !== entryRuntime) owner.chainRoot = undefined;
    }
  }
};
