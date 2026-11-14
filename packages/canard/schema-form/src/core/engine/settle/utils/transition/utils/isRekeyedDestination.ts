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
    current?.parent;
    current = current.parent
  ) {
    if (
      moves.has(current.parent) &&
      Number(current.name) < current.parent.itemCount
    )
      return true;
  }
  return false;
};
