import type { FieldNodeRecord } from '../../../record';
import type { SetValueOption } from '../../../types/value';
import { writeFieldNode } from '../write/writeFieldNode';
import { canLoadStaticFirstTree } from './canLoadStaticFirstTree';
import { loadStaticFirstTree } from './loadStaticFirstTree';
import { setLoadValue } from './setLoadValue';

/**
 * Start a form's first load lifetime with a retained source snapshot.
 * @param root - Live root of the analyzed form
 * @param value - Immutable mount input
 * @param option - Mount's automatic-write selection
 * @returns Nothing; one settle call commits the loaded tree
 */
export const loadFieldNodeAtMount = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  value: unknown,
  option: SetValueOption,
): void => {
  const nextSnapshot = setLoadValue(root.runtime.loadSnapshot, '', value);
  root.runtime.diagnostics = { status: 'stable' };
  try {
    if (canLoadStaticFirstTree(root, value)) loadStaticFirstTree(root, option);
    else writeFieldNode(root, value, 'load', option);
  } finally {
    root.runtime.loadSnapshot = nextSnapshot;
  }
};
