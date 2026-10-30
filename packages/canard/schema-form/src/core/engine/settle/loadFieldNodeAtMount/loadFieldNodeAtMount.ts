import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../record';
import type { WriteOption } from '../../types/value';
import { prepareGateSelection } from '../utils/compute/childSelection/prepareGateSelection';
import { setLoadValue } from '../utils/loadValues/setLoadValue';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { canLoadStaticFirstTree } from './utils/staticFirst/canLoadStaticFirstTree';
import { loadStaticFirstTree } from './utils/staticFirst/loadStaticFirstTree';

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
  option: WriteOption,
): void => {
  const nextSnapshot = setLoadValue(root.runtime.loadSnapshot, $.Root, value);
  root.runtime.diagnostics = { status: 'stable' };
  const previousTransitions = root.runtime.revisionTransitions;
  try {
    const blueprint = root.runtime.blueprint;
    if (
      !blueprint.capabilities.branchless &&
      blueprint.capabilities.hasExpressions
    )
      prepareGateSelection(blueprint);
    if (canLoadStaticFirstTree(root, value)) loadStaticFirstTree(root, option);
    else writeFieldNode(root, value, 'load', option);
  } finally {
    if (root.runtime.revisionTransitions !== previousTransitions)
      root.runtime.revisionTransitions = previousTransitions;
    root.runtime.loadSnapshot = nextSnapshot;
  }
};
