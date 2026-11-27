import { BIT_MASK_NONE } from '@/schema-form/constants/bitmask';

import {
  FieldNodeEventType,
  FieldNodeRevisionLedger,
  advanceFieldNodeRevision,
  canOmitFieldNodePayload,
} from '../../../../record';
import type { FieldNodeRecord } from '../../../../record';
import { FieldNodeWriteKind } from '../../../../types/value';

/** Delivery type of a static first load: a value update plus a refresh request. */
const STATIC_FIRST_DELIVERY_TYPE =
  FieldNodeEventType.UpdateValue | FieldNodeEventType.RequestRefresh;

/**
 * Finalize one reserved first-load delivery after its children complete.
 * @param node - Occurrence with final stored and output values, schema and required state
 * @param isAutomatic - Whether this node or an ancestor supplied a literal default
 * @returns Nothing; all revisions are committed before the dispatcher runs
 */
export const commitStaticFirstNode = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  isAutomatic: boolean,
): void => {
  const type = STATIC_FIRST_DELIVERY_TYPE;
  const silent = canOmitFieldNodePayload(node);
  if (silent) node.__pendingDelivery__ = undefined;
  else {
    const current =
      node.behavior.strategy === 'branch'
        ? { value: node.__value__, outputValue: node.__outputValue__ }
        : node.__value__;
    const payload = { previous: undefined, current };
    node.__pendingDelivery__ = {
      type,
      payload: {
        [FieldNodeEventType.UpdateValue]:
          process.env.NODE_ENV !== 'production'
            ? Object.freeze(payload)
            : payload,
      },
      options: {
        [FieldNodeEventType.UpdateValue]: {
          source: isAutomatic
            ? FieldNodeWriteKind.Automatic
            : FieldNodeWriteKind.Load,
        },
      },
    };
  }
  node.__isDeliveryInitialized__ = true;
  if (silent) advanceFieldNodeRevision(node, type, silent);
  else
    node.__revisionLedger__ = new FieldNodeRevisionLedger(
      node.__revisionLedger__,
      type,
    );
  node.__pendingRevisionMask__ = BIT_MASK_NONE;
};
