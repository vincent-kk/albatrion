import { FEEDBACK_LIMIT_EXCEEDED, SchemaFormError } from '../../../../errors';
import { SchemaNodeRevisionLedger } from '../../../record';
import type { SchemaNodeDelivery, SchemaNodeRecord } from '../../../record';
import { deliverWave } from './deliverWave';
import { captureChainError } from './captureChainError';
import { runDeliveryWaves } from './runDeliveryWaves';
import { finishQueuedErrors } from '../report/finishQueuedErrors';

/**
 * Accept only live records from this runtime for revision accounting.
 * @param candidate - Key held by the pending event table
 * @param runtime - Runtime that owns the pending wave
 * @returns Whether the key is a live node of this tree
 */
const isQueuedNode = <Self extends SchemaNodeRecord<Self>>(
  candidate: unknown, runtime: Self['runtime'],
): candidate is Self => candidate !== null && typeof candidate === 'object' &&
  Reflect.get(candidate, 'runtime') === runtime &&
  Reflect.get(candidate, 'detached') === false;

/**
 * Deliver merged non-settlement bits in waves after committed events.
 * @param root - Live root owning the queued event table and observers
 * @param caller - Whether a synchronous caller receives standalone failures
 * @returns Nothing; standalone failures are exposed after all deliveries
 */
export const flushQueuedEvents = <Self extends SchemaNodeRecord<Self>>(
  root: Self, caller = true,
): void => {
  const runtime = root.runtime;
  if (runtime.flushingQueuedEvents) return;
  runtime.flushingQueuedEvents = true;
  const standalone = !runtime.entryDepth && !runtime.chainErrors;
  const previousErrors = runtime.chainErrors;
  const previousOccurrences = runtime.chainOccurrences;
  let waves = 0;
  let budgetReported = false;
  if (standalone) {
    runtime.chainErrors = [];
    runtime.chainOccurrences = [];
  }
  try {
    while (runtime.queuedNonSettleEvents?.size || runtime.deliveries?.size ||
      (!runtime.entryDepth && runtime.stateChanged)) {
      if (runtime.deliveries?.size) {
        runDeliveryWaves(root);
        continue;
      }
      if (runtime.queuedNonSettleEvents?.size) {
        waves += 1;
        if (waves > 25) {
          for (const node of runtime.queuedNonSettleEvents)
            node.pendingNonSettleDelivery = undefined;
          runtime.queuedNonSettleEvents = undefined;
          if (!budgetReported)
            captureChainError(runtime, new SchemaFormError(FEEDBACK_LIMIT_EXCEEDED,
              'Non-settlement feedback exceeded 25 waves'));
          budgetReported = true;
          continue;
        }
        const pending: [Self, SchemaNodeDelivery][] = [];
        for (const candidate of runtime.queuedNonSettleEvents) {
          const delivery = candidate.pendingNonSettleDelivery;
          candidate.pendingNonSettleDelivery = undefined;
          if (!delivery) continue;
          if (!isQueuedNode<Self>(candidate, runtime)) continue;
          const node = candidate;
          pending.push([node, delivery]);
          node.revisionLedger = new SchemaNodeRevisionLedger(
            node.revisionLedger, delivery.type);
        }
        runtime.queuedNonSettleEvents = undefined;
        deliverWave(root, pending);
        continue;
      }
      runtime.stateChanged = false;
      try { runtime.onStateChange?.(); }
      catch (error) { captureChainError(runtime, error); }
    }
    if (standalone) finishQueuedErrors(runtime, runtime.chainErrors ?? [],
      runtime.chainOccurrences ?? [], caller);
  } finally {
    runtime.flushingQueuedEvents = false;
    if (standalone) {
      runtime.chainErrors = previousErrors;
      runtime.chainOccurrences = previousOccurrences;
    }
  }
};
