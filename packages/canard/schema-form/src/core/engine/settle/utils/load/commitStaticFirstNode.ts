import { FieldNodeEventType, FieldNodeRevisionLedger } from '../../../record';
import type { FieldNodeRecord } from '../../../record';

/**
 * Finalize one reserved first-load delivery after its children complete.
 * @param node - Occurrence with final local/emit, schema and required state
 * @param automatic - Whether this node or an ancestor supplied a literal default
 * @returns Nothing; all revisions are committed before the dispatcher runs
 */
export const commitStaticFirstNode = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  automatic: boolean,
): void => {
  const current =
    node.behavior.strategy === 'branch'
      ? { local: node.local, emit: node.emit }
      : node.local;
  const payload = { previous: undefined, current };
  const type =
    FieldNodeEventType.UpdateValue | FieldNodeEventType.RequestRefresh;
  node.pendingDelivery = {
    type,
    payload: {
      [FieldNodeEventType.UpdateValue]:
        process.env.NODE_ENV !== 'production'
          ? Object.freeze(payload)
          : payload,
    },
    options: {
      [FieldNodeEventType.UpdateValue]: {
        source: automatic ? 'automatic' : 'load',
      },
    },
  };
  node.deliveryInitialized = true;
  node.revisionLedger = new FieldNodeRevisionLedger(node.revisionLedger, type);
  node.pendingRevision = 0;
};
