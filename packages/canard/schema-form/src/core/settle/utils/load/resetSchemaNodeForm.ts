import type { SchemaNodeRecord } from '../../../record';
import type { SetValueOption } from '../../../types/value';
import { writeSchemaNode } from '../write/writeSchemaNode';
import { setLoadValue } from './setLoadValue';
import { clearSubtreeState } from './clearSubtreeState';

/**
 * Load a new committed form prop as the root's fresh lifetime.
 * @param root - Live form root
 * @param value - New source retained by defaultValue reads
 * @param option - Form reset's automatic-write selection
 * @returns Nothing; one settle call commits the loaded tree
 */
export const resetSchemaNodeForm = <Self extends SchemaNodeRecord<Self>>(
  root: Self, value: unknown, option: SetValueOption,
): void => {
  const nextSnapshot = setLoadValue(root.runtime.loadSnapshot, '', value);
  root.runtime.diagnostics = { status: 'stable' };
  clearSubtreeState(root);
  try {
    writeSchemaNode(root, value, 'load', option);
  } finally {
    root.runtime.loadSnapshot = nextSnapshot;
  }
};
