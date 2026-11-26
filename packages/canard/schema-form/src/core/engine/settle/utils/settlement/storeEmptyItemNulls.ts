import { isItemLeafBehavior } from '../../../behaviors';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { isLiveOccurrence } from '../transition/isLiveOccurrence';

/**
 * Store null as the source of an item leaf position the settlement leaves without a value (I2).
 * @param node - Node this settlement changed or entered
 * @param context - Settlement whose entered nodes and pending exits are read
 * @returns Nothing; the source becomes null only when the position existed before this settlement or is live at its end
 */
const storeEmptyItemNull = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): void => {
  if (
    node.source === undefined &&
    isItemLeafBehavior(node.behavior) &&
    (!context.enteredNodes.has(node) || isLiveOccurrence(node, context))
  )
    node.source = null;
};

/**
 * Give every empty item leaf position this settlement changed or entered its null source, after
 * the fill and the budget restoration, so that the fill never refills it later.
 * @param context - Settlement whose fill and budget restoration have run
 * @returns Nothing; only sources of item leaf nodes left undefined change, without events, since
 * their rows read null and undefined alike
 */
export const storeEmptyItemNulls = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  for (const node of context.changedNodes) storeEmptyItemNull(node, context);
  for (const node of context.enteredNodes) storeEmptyItemNull(node, context);
};
