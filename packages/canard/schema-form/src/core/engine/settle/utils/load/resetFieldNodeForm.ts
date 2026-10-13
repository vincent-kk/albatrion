import type { FieldNodeRecord } from '../../../record';
import type { WriteOption } from '../../../types/value';
import { writeFieldNode } from '../write/writeFieldNode';
import { clearSubtreeState } from './clearSubtreeState';
import { setLoadValue } from './setLoadValue';

/**
 * Load a new committed form prop as the root's fresh lifetime.
 * @param root - Live form root
 * @param value - New source retained by defaultValue reads
 * @param option - Form reset's automatic-write selection
 * @returns Nothing; one settle call commits the loaded tree
 */
export const resetFieldNodeForm = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  value: unknown,
  option: WriteOption,
): void => {
  const nextSnapshot = setLoadValue(root.runtime.loadSnapshot, '', value);
  root.runtime.diagnostics = { status: 'stable' };
  clearSubtreeState(root);
  try {
    writeFieldNode(root, value, 'load', option);
  } finally {
    root.runtime.loadSnapshot = nextSnapshot;
  }
};
