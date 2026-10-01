import { isArray } from '@winglet/common-utils/filter';
import type { SchemaNodeRecord, UnionSpec } from '../../../record';
import type { SettlementContext } from '../../type';
import { isPlain } from './isPlain';
import { nextExtras } from './nextExtras';
import { pruneLatentRaw } from './pruneLatentRaw';
import { staticSpec } from './staticSpec';
import { sameValue } from '../compute/sameValue';
import { hasDistributedChildInput } from './hasDistributedChildInput';
import { arrayExtras } from './arrayExtras';

/** Immutable child-name membership indexes keyed by analyzed template. */
const DECLARED_NAMES = new WeakMap<object, Set<string>>();

/**
 * Mark a terminal source or distribute an object host write by declared key.
 * @param node - Caller target or descendant reached by a whole host write
 * @param input - Value received at this occurrence's write boundary
 * @param context - Work list recording source, shape, and automatic changes
 * @param spec - Static or narrowed type restriction used for interpretation
 * @returns Nothing; only this node's own state channels are stored here
 */
export const markWrite = <Self extends SchemaNodeRecord<Self>>(
  node: Self, input: unknown, context: SettlementContext<Self>,
  spec: UnionSpec = staticSpec(node.schemaType, node.nullable),
): void => {
  if (context.loadScope) context.entered.add(node);
  if (context.kind === 'load') context.changedNodes.add(node);
  if (context.kind === 'load' && node.behavior.strategy === 'branch')
    context.shapeDirtyPaths.add(node.path);
  const isMerge = context.kind === 'callerPartial' && !context.automatic;
  if (!context.automatic) context.writtenInputs.set(node, input);
  else context.automaticLog.push({ node, previousRaw: node.raw,
    previousExtras: node.extras,
    previousDistributed: context.distributedInputs.get(node) });
  const value = node.behavior.interpret(input, spec);
  if (node.behavior.strategy !== 'branch') {
    if (!sameValue(node.raw, value)) {
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
    return;
  }
  let nextRaw: unknown;
  let extras: unknown;
  let whole: boolean;
  let countChanged = false;
  if (node.behavior.type === 'array') {
    const previousItemCount = node.itemCount;
    if (context.automatic) context.arrayStructureLog.push({ host: node,
      previousItems: [...node.children ?? []], previousItemCount,
      previousExtras: node.extras });
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
    let declared = DECLARED_NAMES.get(node.blueprintNode);
    if (!declared) {
      declared = new Set(node.blueprintNode.childEntries.map((entry) => entry.name));
      DECLARED_NAMES.set(node.blueprintNode, declared);
    }
    whole = !isMerge;
    nextRaw = isMerge ? node.raw : undefined;
    if (isMerge && nextRaw !== undefined) context.wrongKindHosts.add(node);
    extras = nextExtras(node.extras, value, declared, isMerge);
  }
  const rawChanged = !sameValue(node.raw, nextRaw);
  const extrasChanged = !sameValue(node.extras, extras);
  if (rawChanged || extrasChanged || countChanged) {
    node.raw = nextRaw;
    node.extras = extras;
    context.changedRaw.add(node.path);
    context.changedNodes.add(node);
    if (context.automatic) context.automaticChanged = true;
  }
  context.distributedInputs.set(node, {
    input: value, whole, automatic: context.automatic,
  });
  context.dirtyPaths.add(node.path);
  context.shapeDirtyPaths.add(node.path);
  if (node.structure === null) return;
  for (const name of Object.keys(node.structure)) {
    if (node.behavior.type === 'array' && Number(name) >= node.itemCount) continue;
    if (!whole && !hasDistributedChildInput(value, name,
      node.behavior.type === 'array')) continue;
    const child = node.structure[name];
    const childInput = hasDistributedChildInput(value, name,
      node.behavior.type === 'array') ?
      Reflect.get(value, name) : undefined;
    if (context.automatic) {
      context.writtenInputs.set(child, childInput);
      context.filledNodes.add(child);
    }
    markWrite(child, childInput, context);
  }
};
