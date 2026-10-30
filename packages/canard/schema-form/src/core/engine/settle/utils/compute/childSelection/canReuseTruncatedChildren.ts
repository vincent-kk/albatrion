import type { Dictionary } from '@aileron/declare';

import type { FieldNodeRecord } from '../../../../record';
import type {
  ArrayPopProof,
  SettlementContext,
} from '../../../types/settlement';

/**
 * Prove an admitted pop's static selection without visiting its retained positions.
 * Admission proved every retained position static and live; this checks only facts a later write could have moved.
 * Writes nothing.
 * @param node - Array host whose structural operation already published its slots
 * @param context - Settlement facts the proof reads: gate presence, distributed inputs, path changes, pending exits and the dirty frontier
 * @param prior - Structure captured before the host's selection round
 * @param proof - The settlement's pop proof for this host
 * @returns Whether the N-1 retained positions keep the structure and children the truncation published and none of them is dirty
 */
export const canReuseTruncatedChildren = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  prior: Dictionary<Self>,
  proof: ArrayPopProof<Self>,
): boolean => {
  const dirty = context.dirtyChildrenByParent.get(node.path);
  return (
    !context.hasGates &&
    node.raw === undefined &&
    node.itemCount === proof.count - 1 &&
    node.structure === prior &&
    node.children === proof.children &&
    !context.distributedInputs.has(node) &&
    context.pathChanges.length === 0 &&
    context.pendingExits.size === 0 &&
    (dirty === undefined || dirty.size === 0)
  );
};
