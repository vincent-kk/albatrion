import type { FieldNodeRecord } from '../../../../../record';
import { getHostDerived } from '../../../../../utils/cache/derivedRecords';
import type { SettlementContext } from '../../../../types/settlement';

/**
 * Discard occurrence witnesses after a failed or path-changing settlement.
 * @param context - Owners actually prepared/read during the current settlement
 * @returns Nothing; immutable blueprint metadata and previous observations remain
 */
export const discardStaticHostPreparation = <
  Self extends FieldNodeRecord<Self>,
>(
  context: SettlementContext<Self>,
): void => {
  for (const host of context.preparedStaticHosts ?? [])
    delete getHostDerived(host).preparedStaticHost;
};
