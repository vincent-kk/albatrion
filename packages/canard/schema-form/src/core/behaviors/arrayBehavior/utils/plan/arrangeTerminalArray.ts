import { isArray } from '@winglet/common-utils/filter';
import type { Behavior } from '../../../../record';
import { isValidArrayIndex } from './isValidArrayIndex';

/**
 * Propose a copied whole-array raw value for a terminal verb.
 * @param node - Terminal record holding the last whole raw array
 * @param operation - Requested structural array verb
 * @returns Copied raw proposal or no-op when no position can change
 */
export const arrangeTerminalArray: Behavior['arrange'] = (node, operation) => {
  const raw = node.raw;
  if (!isArray(raw) && raw !== undefined && operation.kind !== 'push')
    return { kind: 'noop' };
  const source = isArray(raw) ? raw : [];
  const length = source.length;
  if (operation.kind === 'push') return {
    kind: 'raw', raw: [...source, operation.value], result: { source: 'length' },
  };
  if (operation.kind === 'clear') return length === 0 ? { kind: 'noop' } : {
    kind: 'raw', raw: [], result: { source: 'void' },
  };
  if (operation.kind === 'pop') return length === 0 ? { kind: 'noop' } : {
    kind: 'raw', raw: source.slice(0, -1),
    result: { source: 'removed', index: length - 1 },
  };
  if (!isValidArrayIndex(operation.index, length)) return { kind: 'noop' };
  const copy = source.slice();
  if (operation.kind === 'remove') {
    copy.splice(operation.index, 1);
    return { kind: 'raw', raw: copy,
      result: { source: 'removed', index: operation.index } };
  }
  copy[operation.index] = operation.value;
  return { kind: 'raw', raw: copy,
    result: { source: 'updated', index: operation.index } };
};
