import { isArray } from '@winglet/common-utils/filter';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import { getItemEntry, mergeEffectiveSchema } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';
import { getLoadValue } from '../../loadValues/getLoadValue';
import { canReuseAppendedChild } from './canReuseAppendedChild';
import { canReuseSplicedChildren } from './canReuseSplicedChildren';
import { canReuseTruncatedChildren } from './canReuseTruncatedChildren';

/** Ungated effective schemas select their immutable static contributions. */
const NO_ACTIVE_IDS: readonly number[] = Object.freeze([]);

/**
 * Prove that a static array shape survives a prefix-preserving length change.
 * A valid append proof for this host is checked at its new position alone, a valid pop proof without visiting any position, and a valid splice proof at its tail positions alone;
 * when that check fails the proof is invalidated and the full proof runs.
 * Writes nothing else; publication belongs to the caller.
 * @param node - Array host whose structural operation already published its slots
 * @param context - Settlement facts the proof reads: gate presence, previous item counts, distributed inputs, path changes, pending exits, previous emit and entered records
 * @param prior - Structure captured before the host's selection round
 * @returns Whether every slot is proven to keep its static selection
 */
export const canReuseArrayChildren = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  prior: Record<string, Self>,
): boolean => {
  const append = context.arrayAppend;
  if (append?.host === node && append.valid) {
    if (canReuseAppendedChild(node, context, prior, append)) return true;
    append.valid = false;
  }
  const pop = context.arrayPop;
  if (pop?.host === node && pop.valid) {
    if (canReuseTruncatedChildren(node, context, prior, pop)) return true;
    pop.valid = false;
  }
  const splice = context.arraySplice;
  if (splice?.host === node && splice.valid) {
    if (canReuseSplicedChildren(node, context, prior, splice)) return true;
    splice.valid = false;
  }
  const capabilities = node.runtime.blueprint.capabilities;
  const oldCount = context.arrayCounts.get(node);
  const children = node.children;
  if (
    context.hasGates ||
    !capabilities.branchless ||
    capabilities.hasExpressions ||
    capabilities.hasDerive ||
    oldCount === undefined ||
    oldCount === node.itemCount ||
    node.raw !== undefined ||
    context.distributedInputs.has(node) ||
    context.pathChanges.length > 0 ||
    context.pendingExits.size > 0 ||
    node.structure !== prior ||
    !children ||
    !isArray(getLoadValue(context.previousEmit, node.path))
  )
    return false;
  const prefixCount = Math.min(oldCount, node.itemCount);
  let position = 0;
  for (let index = 0; index < node.itemCount; index++) {
    const entry = getItemEntry(node.blueprintNode, index);
    if (!entry) {
      if (prior[String(index)] !== undefined) return false;
      continue;
    }
    const child = children[position++];
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
      !child.active ||
      child.detached ||
      schema.typeConflict ||
      entry.node.kind === 'virtual' ||
      !entry.declarations.length ||
      (index < prefixCount && context.entered.has(child))
    )
      return false;
  }
  return position === children.length;
};
