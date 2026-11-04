import type { FieldNodeRecord } from '../../../../record';
import type { WriteOption } from '../../../../types/value';
import { writeFieldNode } from '../../../utils/write/writeFieldNode';

/**
 * Compose fixed membership with the ordinary guard, default and commit lifecycle.
 * @param root - Fresh root already admitted by canLoadFixedFirstTree
 * @param option - Existing automatic-write override bits
 * @returns Nothing; ordinary settlement owns failures and one final commit
 */
export const loadFixedFirstTree = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  option: WriteOption,
): void => {
  writeFieldNode(
    root,
    undefined,
    'load',
    option,
    'load',
    undefined,
    root.runtime.blueprint.fixedFirstLoadPlan,
  );
};
