import { isArray } from '@winglet/common-utils/filter';

import type { ArrayArrangePlan, Behavior } from '../../../../record';
import { isValidArrayIndex } from './isValidArrayIndex';

/** Shared plan for an array verb that changes nothing. */
const NOOP_PLAN: ArrayArrangePlan = { kind: 'noop' };

/** Shared result reporting the array length after a push. */
const LENGTH_RESULT = { source: 'length' } as const;

/**
 * Propose a copied whole-array raw value for a terminal verb.
 * @param node - Terminal record holding the last whole raw array
 * @param operation - Requested structural array verb
 * @returns Copied raw proposal or no-op when no position can change
 */
export const arrangeTerminalArray: Behavior['arrange'] = (node, operation) => {
  const raw = node.raw;
  if (!isArray(raw) && raw !== undefined && operation.kind !== 'push')
    return NOOP_PLAN;
  const source = isArray(raw) ? raw : [];
  const length = source.length;
  if (operation.kind === 'push')
    return {
      kind: 'raw',
      raw: [...source, operation.value],
      result: LENGTH_RESULT,
    };
  if (operation.kind === 'clear')
    return length === 0
      ? NOOP_PLAN
      : {
          kind: 'raw',
          raw: [],
          result: { source: 'void' },
        };
  if (operation.kind === 'pop')
    return length === 0
      ? NOOP_PLAN
      : {
          kind: 'raw',
          raw: source.slice(0, -1),
          result: { source: 'removed', index: length - 1 },
        };
  if (!isValidArrayIndex(operation.index, length)) return NOOP_PLAN;
  const copy = source.slice();
  if (operation.kind === 'remove') {
    copy.splice(operation.index, 1);
    return {
      kind: 'raw',
      raw: copy,
      result: { source: 'removed', index: operation.index },
    };
  }
  copy[operation.index] = operation.value;
  return {
    kind: 'raw',
    raw: copy,
    result: { source: 'updated', index: operation.index },
  };
};
