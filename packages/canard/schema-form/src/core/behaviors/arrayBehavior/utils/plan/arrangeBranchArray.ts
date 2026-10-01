import type { Behavior } from '../../../../record';
import { copyArraySlots } from './copyArraySlots';
import { isValidArrayIndex } from './isValidArrayIndex';

/**
 * Turn a branch array verb into source-position slots without writing state.
 * @param node - Host whose occupied count defines addressable positions
 * @param operation - Requested structural array verb
 * @returns Pure slot proposal, direct update, or no-op
 */
export const arrangeBranchArray: Behavior['arrange'] = (node, operation) => {
  if (node.raw === null) return { kind: 'noop' };
  const count = node.itemCount;
  switch (operation.kind) {
    case 'push':
      return { kind: 'slots',
        slots: [...copyArraySlots(count), { value: operation.value }],
        result: { source: 'length' } };
    case 'pop':
      return count === 0 ? { kind: 'noop' } : {
        kind: 'slots', slots: copyArraySlots(count - 1),
        result: { source: 'removed', index: count - 1 },
      };
    case 'remove':
      return isValidArrayIndex(operation.index, count) ? {
        kind: 'slots', slots: copyArraySlots(count, operation.index),
        result: { source: 'removed', index: operation.index },
      } : { kind: 'noop' };
    case 'update':
      return isValidArrayIndex(operation.index, count) ? {
        kind: 'update', index: operation.index, value: operation.value,
      } : { kind: 'noop' };
    case 'clear':
      return count === 0 ? { kind: 'noop' } : {
        kind: 'slots', slots: [], result: { source: 'void' },
      };
  }
};
