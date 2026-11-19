import { isArray } from '@winglet/common-utils/filter';

import type { Optional } from '@aileron/declare';

import {
  appendSegment,
  isDescendantPath,
} from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord, UnionSpec } from '../../../record';
import { FieldNodeWriteKind } from '../../../types/value';
import { sameValue } from '../../../utils/compute/sameValue';
import type { SettlementContext } from '../../types/settlement';
import { getDeclaredChildNames } from '../declarations/getDeclaredChildNames';
import { pruneInactiveSources } from '../slots/pruneInactiveSources';
import { writeSlotPath } from '../slots/writeSlotPath';
import { arrayExtras } from './arrayExtras';
import { assertVirtualWriteShape } from './assertVirtualWriteShape';
import { hasDistributedChildInput } from './hasDistributedChildInput';
import { isPlain } from './isPlain';
import { nextExtras } from './nextExtras';
import { staticSpec } from './staticSpec';
import { admitsSameValueWrite } from './utils/admitsSameValueWrite';
import { keepsHostKeys } from './utils/keepsHostKeys';
import { restoreWriteEpochPaths } from './utils/restoreWriteEpochPaths';

/** Default of `changedValue`: the caller has not interpreted this node's input. */
const UNINTERPRETED: unique symbol = Symbol('uninterpreted');

/**
 * Mark a terminal source or distribute an object host write by declared key.
 * An object host is written whole only inside the context's replacement scope; under a
 * multi-write batch that scope is the union of the written paths (191C-01).
 * In an admitted static write a host keeping its key set or item count stays out of
 * shape-dirty and its leaf children whose interpreted value equals their source are not marked (W1).
 * @param node - Caller target or descendant reached by a whole host write
 * @param input - Value received at this occurrence's write boundary
 * @param context - Work list recording source, shape, and automatic changes
 * @param spec - Static or narrowed type restriction used for interpretation
 * @param changedValue - A leaf's input already interpreted under the static spec and proven unequal to its source by the distribution's skip test; omitted, the input is interpreted and compared here
 * @returns Nothing; only this node's own state channels are stored here
 */
export const markWrite = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  input: unknown,
  context: SettlementContext<Self>,
  spec: UnionSpec = staticSpec(node.schemaType, node.isNullable),
  changedValue: unknown = UNINTERPRETED,
): void => {
  if (context.writeEpoch !== undefined && context.isAutomatic)
    restoreWriteEpochPaths(context);
  if (
    node.behavior.type === 'virtual' &&
    !context.isAutomatic &&
    context.kind !== FieldNodeWriteKind.Load
  )
    assertVirtualWriteShape(node, input);
  if (context.loadScope) {
    context.enteredNodes.add(node);
  }
  if (context.kind === FieldNodeWriteKind.Load) context.changedNodes.add(node);
  if (
    context.kind === FieldNodeWriteKind.Load &&
    node.behavior.strategy === 'branch'
  )
    context.shapeDirtyPaths.add(node.path);
  const isMerge =
    context.kind === FieldNodeWriteKind.CallerPartial && !context.isAutomatic;
  if (!context.isAutomatic) context.writtenInputs.set(node, input);
  else
    context.automaticLog.push({
      node,
      previousSource: node.source,
      previousExtras: node.extras,
      previousDistributed: context.distributedInputs.get(node),
    });
  const known = changedValue !== UNINTERPRETED;
  const value = known ? changedValue : node.behavior.interpret(input, spec);
  if (node.behavior.strategy !== 'branch') {
    if (known || !sameValue(node.source, value)) {
      node.source = value;
      context.changedSource.add(node.path);
      context.changedNodes.add(node);
      if (context.isAutomatic) context.hasAutomaticChanged = true;
    }
    if (context.writeEpoch !== undefined) node.writeEpoch = context.writeEpoch;
    else context.dirtyPaths.add(node.path);
    return;
  }
  if (node.behavior.type === 'virtual') {
    context.dirtyPaths.add(node.path);
    const fields = node.blueprintNode.fields ?? [];
    const values = isArray(value) ? value : undefined;
    for (let index = 0; index < fields.length; index++) {
      if (
        node === context.target &&
        context.virtualWriteFields &&
        !context.virtualWriteFields.includes(fields[index])
      )
        continue;
      const sibling = node.parent?.childrenByName?.[fields[index]];
      if (!sibling) {
        const parent = node.parent;
        const entry = parent?.blueprintNode.childEntries.find(
          (entry) => entry.name === fields[index],
        );
        if (
          parent &&
          entry &&
          (values?.[index] !== undefined ||
            context.kind === FieldNodeWriteKind.Load)
        ) {
          const path = appendSegment(parent.path, fields[index]);
          if (context.kind === FieldNodeWriteKind.Load)
            pruneInactiveSources(parent.runtime, path, undefined, context);
          writeSlotPath(
            context.root,
            path,
            entry.node,
            values?.[index],
            !isMerge,
            context,
            context.isAutomatic,
          );
          context.dirtyPaths.add(parent.path);
        }
        continue;
      }
      if (
        !context.isAutomatic &&
        context.kind !== FieldNodeWriteKind.Load &&
        !isMerge
      ) {
        (context.virtualReplacementPaths ??= []).push(sibling.path);
        pruneInactiveSources(sibling.runtime, sibling.path, undefined, context);
      }
      markWrite(sibling, values?.[index], context);
    }
    return;
  }
  let nextSource: unknown;
  let extras: unknown;
  let whole: boolean;
  let countChanged = false;

  if (node.behavior.type === 'array') {
    const previousItemCount = node.itemCount;
    if (context.isAutomatic)
      context.arrayStructureLog.push({
        host: node,
        previousItems: [...(node.children ?? [])],
        previousItemCount,
        previousExtras: node.extras,
      });
    if (!context.arrayCounts.has(node))
      context.arrayCounts.set(node, previousItemCount);
    node.itemCount = isArray(value) ? value.length : 0;
    countChanged = node.itemCount !== previousItemCount;
    nextSource = isArray(value) ? undefined : value;
    extras = isArray(value) ? arrayExtras(node, value) : undefined;
    whole = true;
    if (isMerge && node !== context.replacementScope)
      pruneInactiveSources(node.runtime, node.path, undefined, context);
  } else {
    if (!isPlain(value)) {
      nextSource = value;
      extras = undefined;
      whole = true;
      if (isMerge && node !== context.replacementScope)
        pruneInactiveSources(node.runtime, node.path, undefined, context);
    } else {
      const declared = getDeclaredChildNames(node.blueprintNode);
      whole = false;
      if (!isMerge) {
        const replacementPaths = context.replacementPaths;
        if (replacementPaths === undefined) whole = true;
        else
          for (const path of replacementPaths)
            if (node.path === path || isDescendantPath(node.path, path)) {
              whole = true;
              break;
            }
      }
      nextSource = isMerge ? node.source : undefined;
      if (isMerge && nextSource !== undefined) context.wrongKindHosts.add(node);
      extras = nextExtras(node.extras, value, declared, isMerge);
    }
  }
  const sourceChanged = !sameValue(node.source, nextSource);
  const extrasChanged = node.extras !== extras;
  const sameShape =
    node.source === undefined &&
    nextSource === undefined &&
    node.extras === undefined &&
    extras === undefined &&
    !countChanged &&
    admitsSameValueWrite(node, context) &&
    keepsHostKeys(node, value, isMerge);
  if (!sameShape && context.writeEpoch !== undefined)
    restoreWriteEpochPaths(context);
  if (sourceChanged || extrasChanged || countChanged) {
    node.source = nextSource;
    node.extras = extras;
    context.changedSource.add(node.path);
    context.changedNodes.add(node);
    if (context.isAutomatic) context.hasAutomaticChanged = true;
  }
  context.distributedInputs.set(node, {
    input: value,
    isWhole: whole,
    isAutomatic: context.isAutomatic,
  });
  if (context.writeEpoch !== undefined) node.writeEpoch = context.writeEpoch;
  else context.dirtyPaths.add(node.path);
  if (!sameShape) context.shapeDirtyPaths.add(node.path);
  if (node.childrenByName === null) return;
  for (const name of Object.keys(node.childrenByName)) {
    if (node.behavior.type === 'array' && Number(name) >= node.itemCount)
      continue;
    if (
      !whole &&
      !hasDistributedChildInput(value, name, node.behavior.type === 'array')
    )
      continue;
    const child = node.childrenByName[name];
    if (child.behavior.type === 'virtual') continue;
    const childInput = hasDistributedChildInput(
      value,
      name,
      node.behavior.type === 'array',
    )
      ? Reflect.get(value, name)
      : undefined;
    let childSpec: Optional<UnionSpec>;
    let interpreted: unknown = UNINTERPRETED;
    if (sameShape && child.behavior.strategy !== 'branch') {
      childSpec = staticSpec(child.schemaType, child.isNullable);
      interpreted = child.behavior.interpret(childInput, childSpec);
    }
    if (interpreted !== UNINTERPRETED && sameValue(child.source, interpreted))
      continue;
    if (context.isAutomatic) {
      context.writtenInputs.set(child, childInput);
      context.filledNodes.add(child);
    }
    markWrite(child, childInput, context, childSpec, interpreted);
  }
};
