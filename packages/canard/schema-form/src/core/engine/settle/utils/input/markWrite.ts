import { isArray } from '@winglet/common-utils/filter';

import type { FieldNodeRecord, UnionSpec } from '../../../record';
import { sameValue } from '../../../utils/compute/sameValue';
import type { SettlementContext } from '../../types/settlement';
import { getDeclaredChildNames } from '../declarations/getDeclaredChildNames';
import { indexEnteredLatentKey } from '../latentStore/indexEnteredLatentKey';
import { pruneLatentRaw } from '../latentStore/pruneLatentRaw';
import { arrayExtras } from './arrayExtras';
import { assertVirtualWriteShape } from './assertVirtualWriteShape';
import { hasDistributedChildInput } from './hasDistributedChildInput';
import { isPlain } from './isPlain';
import { nextExtras } from './nextExtras';
import { staticSpec } from './staticSpec';
import { admitsSameValueWrite } from './utils/admitsSameValueWrite';
import { keepsHostKeys } from './utils/keepsHostKeys';

/** Default of `changedValue`: the caller has not interpreted this node's input. */
const UNINTERPRETED: unique symbol = Symbol('uninterpreted');

/**
 * Mark a terminal source or distribute an object host write by declared key.
 * An object host is written whole only inside the context's replacement scope; under a
 * multi-write batch that scope is the union of the written paths (191C-01).
 * In an admitted static write a host keeping its key set or item count stays out of
 * shape-dirty and its leaf children whose interpreted value equals their raw are not marked (W1).
 * @param node - Caller target or descendant reached by a whole host write
 * @param input - Value received at this occurrence's write boundary
 * @param context - Work list recording source, shape, and automatic changes
 * @param spec - Static or narrowed type restriction used for interpretation
 * @param changedValue - A leaf's input already interpreted under the static spec and proven unequal to its raw by the distribution's skip test; omitted, the input is interpreted and compared here
 * @returns Nothing; only this node's own state channels are stored here
 */
export const markWrite = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  input: unknown,
  context: SettlementContext<Self>,
  spec: UnionSpec = staticSpec(node.schemaType, node.nullable),
  changedValue: unknown = UNINTERPRETED,
): void => {
  if (
    node.behavior.type === 'virtual' &&
    !context.automatic &&
    context.kind !== 'load'
  )
    assertVirtualWriteShape(node, input);
  if (context.loadScope) {
    context.entered.add(node);
    indexEnteredLatentKey(context, node);
  }
  if (context.kind === 'load') context.changedNodes.add(node);
  if (context.kind === 'load' && node.behavior.strategy === 'branch')
    context.shapeDirtyPaths.add(node.path);
  const isMerge = context.kind === 'callerPartial' && !context.automatic;
  if (!context.automatic) context.writtenInputs.set(node, input);
  else
    context.automaticLog.push({
      node,
      previousRaw: node.raw,
      previousExtras: node.undeclaredValues,
      previousDistributed: context.distributedInputs.get(node),
    });
  const known = changedValue !== UNINTERPRETED;
  const value = known ? changedValue : node.behavior.interpret(input, spec);
  if (node.behavior.strategy !== 'branch') {
    if (known || !sameValue(node.raw, value)) {
      node.raw = value;
      context.changedRaw.add(node.path);
      context.changedNodes.add(node);
      if (context.automatic) context.automaticChanged = true;
    }
    context.dirtyPaths.add(node.path);
    return;
  }
  if (node.behavior.type === 'virtual') {
    context.dirtyPaths.add(node.path);
    const fields = node.blueprintNode.fields ?? [];
    const values = isArray(value) ? value : undefined;
    for (let index = 0; index < fields.length; index++) {
      const sibling = node.parent?.structure?.[fields[index]];
      if (!sibling) continue;
      if (!context.automatic && context.kind !== 'load' && !isMerge) {
        (context.virtualReplacePaths ??= []).push(sibling.path);
        pruneLatentRaw(sibling.runtime, sibling.path, undefined, context);
      }
      markWrite(sibling, values?.[index], context);
    }
    return;
  }
  let nextRaw: unknown;
  let extras: unknown;
  let whole: boolean;
  let countChanged = false;
  if (node.behavior.type === 'array') {
    const previousItemCount = node.itemCount;
    if (context.automatic)
      context.arrayStructureLog.push({
        host: node,
        previousItems: [...(node.children ?? [])],
        previousItemCount,
        previousExtras: node.undeclaredValues,
      });
    if (!context.arrayCounts.has(node))
      context.arrayCounts.set(node, previousItemCount);
    node.itemCount = isArray(value) ? value.length : 0;
    countChanged = node.itemCount !== previousItemCount;
    nextRaw = isArray(value) ? undefined : value;
    extras = isArray(value) ? arrayExtras(node, value) : undefined;
    whole = true;
    if (isMerge && node !== context.replaceScope)
      pruneLatentRaw(node.runtime, node.path, undefined, context);
  } else if (!isPlain(value)) {
    nextRaw = value;
    extras = undefined;
    whole = true;
    if (isMerge && node !== context.replaceScope)
      pruneLatentRaw(node.runtime, node.path, undefined, context);
  } else {
    const declared = getDeclaredChildNames(node.blueprintNode);
    whole =
      !isMerge &&
      (context.replacePaths === undefined ||
        context.replacePaths.some(
          (path) => node.path === path || node.path.startsWith(path + '/'),
        ));
    nextRaw = isMerge ? node.raw : undefined;
    if (isMerge && nextRaw !== undefined) context.wrongKindHosts.add(node);
    extras = nextExtras(node.undeclaredValues, value, declared, isMerge);
  }
  const rawChanged = !sameValue(node.raw, nextRaw);
  const extrasChanged = node.undeclaredValues !== extras;
  const sameShape =
    node.raw === undefined &&
    nextRaw === undefined &&
    node.undeclaredValues === undefined &&
    extras === undefined &&
    !countChanged &&
    admitsSameValueWrite(node, context) &&
    keepsHostKeys(node, value, isMerge);
  if (rawChanged || extrasChanged || countChanged) {
    node.raw = nextRaw;
    node.undeclaredValues = extras;
    context.changedRaw.add(node.path);
    context.changedNodes.add(node);
    if (context.automatic) context.automaticChanged = true;
  }
  context.distributedInputs.set(node, {
    input: value,
    whole,
    automatic: context.automatic,
  });
  context.dirtyPaths.add(node.path);
  if (!sameShape) context.shapeDirtyPaths.add(node.path);
  if (node.structure === null) return;
  for (const name of Object.keys(node.structure)) {
    if (node.behavior.type === 'array' && Number(name) >= node.itemCount)
      continue;
    if (
      !whole &&
      !hasDistributedChildInput(value, name, node.behavior.type === 'array')
    )
      continue;
    const child = node.structure[name];
    if (child.behavior.type === 'virtual') continue;
    const childInput = hasDistributedChildInput(
      value,
      name,
      node.behavior.type === 'array',
    )
      ? Reflect.get(value, name)
      : undefined;
    let childSpec: UnionSpec | undefined;
    let interpreted: unknown = UNINTERPRETED;
    if (sameShape && child.behavior.strategy !== 'branch') {
      childSpec = staticSpec(child.schemaType, child.nullable);
      interpreted = child.behavior.interpret(childInput, childSpec);
    }
    if (interpreted !== UNINTERPRETED && sameValue(child.raw, interpreted))
      continue;
    if (context.automatic) {
      context.writtenInputs.set(child, childInput);
      context.filledNodes.add(child);
    }
    markWrite(child, childInput, context, childSpec, interpreted);
  }
};
