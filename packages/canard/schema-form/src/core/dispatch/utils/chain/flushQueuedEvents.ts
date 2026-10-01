import { FEEDBACK_LIMIT_EXCEEDED, SchemaFormError } from '../../../../errors';
import { EMPTY_REVISION_LEDGER, SchemaNodeEventType } from '../../../record';
import type { SchemaNodeRecord } from '../../../record';
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
  const standalone = !runtime.entryDepth;
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
          runtime.queuedNonSettleEvents = undefined;
          if (!budgetReported)
            captureChainError(runtime, new SchemaFormError(FEEDBACK_LIMIT_EXCEEDED,
              'Non-settlement feedback exceeded 25 waves'));
          budgetReported = true;
          continue;
        }
        const pending = runtime.queuedNonSettleEvents;
        runtime.queuedNonSettleEvents = undefined;
        for (const [candidate, delivery] of pending) {
          if (!isQueuedNode<Self>(candidate, runtime)) continue;
          const node = candidate;
          const ledger: Record<number, number> =
            node.revisionLedger === EMPTY_REVISION_LEDGER ? {} :
              { ...node.revisionLedger };
          for (let bit = 1; bit <= SchemaNodeEventType.UpdateDiagnostics; bit *= 2)
            if (delivery.type & bit) ledger[bit] = (ledger[bit] ?? 0) + 1;
          node.revisionLedger = ledger;
        }
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
