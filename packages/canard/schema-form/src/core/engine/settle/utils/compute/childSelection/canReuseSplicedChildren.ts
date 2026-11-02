import type { Dictionary } from '@aileron/declare';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import { getItemEntry, mergeEffectiveSchema } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';
import type {
  ArraySpliceProof,
  SettlementContext,
} from '../../../types/settlement';

/** Ungated effective schemas select their immutable static contributions. */
const NO_ACTIVE_IDS: readonly number[] = Object.freeze([]);

/**
 * Prove an admitted middle remove's or insert's static selection from its tail positions alone.
 * The prefix before `proof.index` is proven unchanged by reference: the published children and structure are intact and no prefix child is dirty.
 * Each tail position must hold the same static, live child under its new name, and only an insert's own position may hold a newly entered child.
 * Writes nothing.
 * @param node - Array host whose structural operation already published its slots
 * @param context - Settlement facts the proof reads: gate presence, distributed inputs, path changes, pending exits, entered nodes and the dirty frontier
 * @param prior - Structure captured before the host's selection round
 * @param proof - The settlement's splice proof for this host
 * @returns Whether every position keeps its static selection and only tail positions may be dirty
 */
export const canReuseSplicedChildren = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  prior: Dictionary<Self>,
  proof: ArraySpliceProof<Self>,
): boolean => {
  const children = node.children;
  if (
    context.hasGates ||
    node.raw !== undefined ||
    node.itemCount !== (proof.entry ? proof.count + 1 : proof.count - 1) ||
    node.structure !== prior ||
    !children ||
    children !== proof.children ||
    context.distributedInputs.has(node) ||
    context.pathChanges.length !== proof.pathChanges ||
    context.pendingExits.size > 0
  )
    return false;
  for (const name of context.dirtyChildrenByParent.get(node.path)?.values() ??
    [])
    if (!(Number(name) >= proof.index)) return false;
  for (let index = proof.index; index < node.itemCount; index++) {
    const entry = getItemEntry(node.blueprintNode, index);
    if (!entry) return false;
    const child = children[index];
    const schema = mergeEffectiveSchema(entry.node, NO_ACTIVE_IDS, {
      mode: 'runtime',
      isAtomic: node.runtime.blueprint.isAtomic,
    });
    if (
      !child ||
      child !== prior[entry.name] ||
      child.blueprintNode !== entry.node ||
      child.name !== entry.name ||
      child.parent !== node ||
      child.path !== appendSegment(node.path, entry.name) ||
      child.schema !== schema ||
      !child.isActive ||
      child.detached ||
      schema.typeConflict ||
      entry.node.kind === 'virtual' ||
      !entry.declarations.length ||
      (context.entered.has(child) && !(proof.entry && index === proof.index))
    )
      return false;
  }
  return true;
};
