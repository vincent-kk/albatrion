import { isArray } from '@winglet/common-utils/filter';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../../record';
import type {
  ArrayAppendProof,
  SettlementContext,
} from '../../../types/settlement';

/**
 * Prove an admitted push's static selection from its new position alone.
 * The retained prefix is unchanged by admission; this checks only facts a later write could have moved.
 * Writes nothing.
 * @param node - Array host whose structural operation already published its slots
 * @param context - Settlement facts the proof reads: gate presence, distributed inputs, path changes, pending exits and the dirty frontier
 * @param prior - Structure captured before the host's selection round
 * @param proof - The settlement's append proof for this host
 * @returns Whether every position keeps its static selection and only the new position may be dirty
 */
export const canReuseAppendedChild = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  prior: Record<string, Self>,
  proof: ArrayAppendProof<Self>,
): boolean => {
  const name = String(proof.count);
  const path = appendSegment(node.path, name);
  const child = prior[name];
  const dirty = context.dirtyChildrenByParent.get(node.path);
  return (
    !context.hasGates &&
    node.raw === undefined &&
    node.itemCount === proof.count + 1 &&
    node.structure === prior &&
    node.children === proof.children &&
    !context.distributedInputs.has(node) &&
    context.pathChanges.length === 0 &&
    context.pendingExits.size === 0 &&
    (dirty === undefined ||
      dirty.size === 0 ||
      (dirty.size === 1 && dirty.has(path))) &&
    (proof.entry === undefined
      ? child === undefined &&
        node.children?.length === 0 &&
        isArray(node.undeclaredValues) &&
        node.undeclaredValues.length === node.itemCount &&
        !dirty?.size
      : child !== undefined &&
        child.blueprintNode === proof.entry.node &&
        child.name === name &&
        child.parent === node &&
        child.path === path &&
        child.schema === proof.schema &&
        child.active &&
        !child.detached)
  );
};
