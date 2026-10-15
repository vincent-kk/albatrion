import type { ArrayArrangePlan, Behavior } from '../../../../record';
import { copyArraySlots } from './copyArraySlots';
import { isValidArrayIndex } from './isValidArrayIndex';
import { isValidInsertIndex } from './isValidInsertIndex';

/** Shared plan for an array verb that changes nothing. */
const NOOP_PLAN: ArrayArrangePlan = { kind: 'noop' };

/** Shared result reporting the array length after a push or an insert. */
const LENGTH_RESULT = { source: 'length' } as const;

/** Shared plan that drops every slot of a non-empty array. */
const CLEAR_SLOTS_PLAN: ArrayArrangePlan = {
  kind: 'slots',
  slots: [],
  result: { source: 'void' },
};

/**
 * Turn a branch array verb into source-position slots without writing state.
 * @param node - Host whose occupied count defines addressable positions
 * @param operation - Requested structural array verb
 * @returns Pure slot proposal, direct update, or no-op
 */
export const arrangeBranchArray: Behavior['arrange'] = (node, operation) => {
  if (
    node.raw === null &&
    operation.kind !== 'push' &&
    operation.kind !== 'insert'
  )
    return NOOP_PLAN;
  const count = node.itemCount;
  switch (operation.kind) {
    case 'push':
      return {
        kind: 'slots',
        slots: [...copyArraySlots(count), { value: operation.value }],
        result: LENGTH_RESULT,
      };
    case 'pop':
      return count === 0
        ? NOOP_PLAN
        : {
            kind: 'slots',
            slots: copyArraySlots(count - 1),
            result: { source: 'removed', index: count - 1 },
          };
    case 'remove':
      return isValidArrayIndex(operation.index, count)
        ? {
            kind: 'slots',
            slots: copyArraySlots(count, operation.index),
            result: { source: 'removed', index: operation.index },
          }
        : NOOP_PLAN;
    case 'insert': {
      if (!isValidInsertIndex(operation.index, count)) return NOOP_PLAN;
      const slots: ({ from: number } | { value: unknown })[] =
        copyArraySlots(count);
      slots.splice(operation.index, 0, { value: operation.value });
      return { kind: 'slots', slots, result: LENGTH_RESULT };
    }
    case 'update':
      return isValidArrayIndex(operation.index, count)
        ? {
            kind: 'update',
            index: operation.index,
            value: operation.value,
          }
        : NOOP_PLAN;
    case 'clear':
      return count === 0 ? NOOP_PLAN : CLEAR_SLOTS_PLAN;
  }
};
