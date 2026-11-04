import type { FieldNodeRecord } from '../../../record';
import { flushQueuedEvents } from './flushQueuedEvents';
import { openVisitBatch } from './openVisitBatch';
import { startFieldNodeChain } from './startFieldNodeChain';

/**
 * Finish a non-settlement entry after it queued its events.
 * Outside any entry the events are delivered now; inside a `visitSubtree` walk with no entry
 * open, the walk's batch opens instead, so delivery waits for the walk's end as in `batch`.
 * @param node - Occurrence the entry was called on
 * @returns Nothing; inside an open entry the queued events wait for that entry's exit
 */
export const closeNonSettleEntry = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): void => {
  const runtime = node.rootNode.runtime;
  if (runtime.entryDepth) return;
  if (!runtime.visitDepth)
    return flushQueuedEvents(node.rootNode, true, 'write');
  startFieldNodeChain(node.rootNode, 'write');
  openVisitBatch(node);
};
