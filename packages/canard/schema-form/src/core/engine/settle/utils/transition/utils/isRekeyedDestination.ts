import type { Nullable } from '@aileron/declare';

import type { FieldNodeRecord } from '../../../../record';

/**
 * Identify exits whose address belongs to a surviving structural destination.
 * @param node - Exiting occurrence at or below a possibly moved array slot
 * @param moves - Source-move facts already processed by this settlement's rekey
 * @returns Whether rekey already preserved the slot's runtime sources
 */
export const isRekeyedDestination = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  moves: ReadonlyMap<Self, unknown>,
): boolean => {
  for (
    let current: Nullable<Self> = node;
    current?.__parent__;
    current = current.__parent__
  ) {
    if (
      moves.has(current.__parent__) &&
      Number(current.name) < current.__parent__.__itemCount__
    )
      return true;
  }
  return false;
};
