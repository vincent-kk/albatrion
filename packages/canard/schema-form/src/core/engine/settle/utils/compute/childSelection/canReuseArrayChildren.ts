import { EMPTY_ARRAY } from '@winglet/common-utils/constant';
import { isArray } from '@winglet/common-utils/filter';
import { minLite } from '@winglet/common-utils/math';

import type { Dictionary } from '@aileron/declare';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import { getItemEntry, mergeEffectiveSchema } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';
import { getLoadValue } from '../../loadValues/getLoadValue';
import { canReuseAppendedChild } from './canReuseAppendedChild';
import { canReuseSplicedChildren } from './canReuseSplicedChildren';
import { canReuseTruncatedChildren } from './canReuseTruncatedChildren';

/** Ungated effective schemas select their immutable static contributions. */
const NO_ACTIVE_IDS: readonly number[] = EMPTY_ARRAY;

/**
 * Prove that a static array shape survives a prefix-preserving length change.
 * A valid append proof for this host is checked at its new position alone, a valid pop proof without visiting any position, and a valid splice proof at its tail positions alone;
 * when that check fails the proof is invalidated and the full proof runs.
 * Writes nothing else; publication belongs to the caller.
 * @param node - Array host whose structural operation already published its slots
 * @param context - Settlement facts the proof reads: gate presence, previous item counts, distributed inputs, path changes, pending exits, previous output value and entered records
 * @param prior - Children-by-name map captured before the host's selection round
 * @returns Whether every slot is proven to keep its static selection
 */
export const canReuseArrayChildren = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  prior: Dictionary<Self>,
): boolean => {
  const arrayAppend = context.arrayAppend;
  if (arrayAppend?.host === node && arrayAppend.isValid) {
    if (canReuseAppendedChild(node, context, prior, arrayAppend)) return true;
    arrayAppend.isValid = false;
  }
  const arrayPop = context.arrayPop;
  if (arrayPop?.host === node && arrayPop.isValid) {
    if (canReuseTruncatedChildren(node, context, prior, arrayPop)) return true;
    arrayPop.isValid = false;
  }
  const arraySplice = context.arraySplice;
  if (arraySplice?.host === node && arraySplice.isValid) {
    if (canReuseSplicedChildren(node, context, prior, arraySplice)) return true;
    arraySplice.isValid = false;
  }
  const capabilities = node.runtime.blueprint.capabilities;
  const oldCount = context.arrayCounts.get(node);
  const children = node.children;
  if (
    context.hasGates ||
    !capabilities.isBranchless ||
    capabilities.hasExpressions ||
    capabilities.hasDerive ||
    oldCount === undefined ||
    oldCount === node.itemCount ||
    node.source !== undefined ||
    context.distributedInputs.has(node) ||
    context.pathChanges.length > 0 ||
    context.pendingExits.size > 0 ||
    node.childrenByName !== prior ||
    !children ||
    !isArray(getLoadValue(context.previousOutputValue, node.path))
  )
    return false;
  const prefixCount = minLite(oldCount, node.itemCount);
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
      !child.isActive ||
      child.isDetached ||
      schema.hasTypeConflict ||
      entry.node.kind === 'virtual' ||
      !entry.declarations.length ||
      (index < prefixCount && context.enteredNodes.has(child))
    )
      return false;
  }
  return position === children.length;
};
