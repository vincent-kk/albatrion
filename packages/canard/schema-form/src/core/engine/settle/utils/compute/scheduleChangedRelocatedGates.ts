import {
  PointerOperator,
  readPointerSegment,
} from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { readProjectedValue } from '../gates/readProjectedValue';
import type { GateOccurrence } from '../gates/type';
import { scheduleRelocatedGates } from './scheduleRelocatedGates';

/**
 * Reschedule relocated gates whose latest actual reads changed after publication.
 * @param gates - Current occurrences evaluated at this host
 * @param context - Settlement retaining reads and receiving dirty paths
 * @returns Whether changed reads scheduled another bounded wheel round
 */
export const scheduleChangedRelocatedGates = <
  Self extends FieldNodeRecord<Self>,
>(
  gates: readonly GateOccurrence[],
  context: SettlementContext<Self>,
): boolean => {
  if (!context.relocatedReads?.size) return false;
  const changed: GateOccurrence[] = [];
  for (const gate of gates) {
    const recorded = context.relocatedReads.get(gate);
    if (!recorded) continue;
    for (let index = 0; index < recorded.paths.length; index++) {
      const path = recorded.paths[index];
      const value =
        readPointerSegment(path, 0) === PointerOperator.Context
          ? context.root.runtime.context
          : readProjectedValue(context, path);
      if (!Object.is(value, recorded.values[index])) {
        changed.push(gate);
        break;
      }
    }
  }
  if (changed.length === 0) return false;
  scheduleRelocatedGates(changed, context);
  return true;
};
