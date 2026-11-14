import { isArray } from '@winglet/common-utils/filter';

import type { ArrayArrangePlan, Behavior } from '../../../../record';
import { isValidArrayIndex } from './isValidArrayIndex';
import { isValidInsertIndex } from './isValidInsertIndex';

/** Shared plan for an array verb that changes nothing. */
const NOOP_PLAN: ArrayArrangePlan = { kind: 'noop' };

/** Shared result reporting the array length after a push or an insert. */
const LENGTH_RESULT = { source: 'length' } as const;

/**
 * Propose a copied whole-array source value for a terminal verb.
 * @param node - Terminal record holding the last whole source array
 * @param operation - Requested structural array verb
 * @returns Copied source proposal or no-op when no position can change
 */
export const arrangeTerminalArray: Behavior['arrange'] = (node, operation) => {
  const source = node.source;
  if (
    !isArray(source) &&
    source !== undefined &&
    operation.kind !== 'push' &&
    operation.kind !== 'insert'
  )
    return NOOP_PLAN;
  const items = isArray(source) ? source : [];
  const length = items.length;
  if (operation.kind === 'push')
    return {
      kind: 'source',
      source: [...items, operation.value],
      result: LENGTH_RESULT,
    };
  if (operation.kind === 'clear')
    return length === 0
      ? NOOP_PLAN
      : {
          kind: 'source',
          source: [],
          result: { source: 'void' },
        };
  if (operation.kind === 'pop')
    return length === 0
      ? NOOP_PLAN
      : {
          kind: 'source',
          source: items.slice(0, -1),
          result: { source: 'removed', index: length - 1 },
        };
  if (operation.kind === 'insert') {
    if (!isValidInsertIndex(operation.index, length)) return NOOP_PLAN;
    const inserted = items.slice();
    inserted.splice(operation.index, 0, operation.value);
    return { kind: 'source', source: inserted, result: LENGTH_RESULT };
  }
  if (!isValidArrayIndex(operation.index, length)) return NOOP_PLAN;
  const copy = items.slice();
  if (operation.kind === 'remove') {
    copy.splice(operation.index, 1);
    return {
      kind: 'source',
      source: copy,
      result: { source: 'removed', index: operation.index },
    };
  }
  copy[operation.index] = operation.value;
  return {
    kind: 'source',
    source: copy,
    result: { source: 'updated', index: operation.index },
  };
};
