import type { FieldNodeRecord } from '../../../record';
import { InactiveValuesState } from './InactiveValuesState';

/**
 * Narrow the record's opaque slot only inside its settlement owner.
 * @param node - Any occurrence sharing the tree runtime
 * @returns The installed generation owner, absent for static or rebuild-only trees
 */
export const getInactiveValuesState = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): InactiveValuesState<Self> | undefined => {
  const state = node.runtime.inactiveValuesState;
  return state instanceof InactiveValuesState ? state : undefined;
};
