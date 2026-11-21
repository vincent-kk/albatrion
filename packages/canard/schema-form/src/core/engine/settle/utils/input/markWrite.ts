import { isArray } from '@winglet/common-utils/filter';

import type { Optional } from '@aileron/declare';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { Distribution, FieldNodeRecord, UnionSpec } from '../../../record';
import { FieldNodeWriteKind } from '../../../types/value';
import { BATCH_HOST_SOURCE } from '../../../utils/batchHostSource';
import { sameValue } from '../../../utils/compute/sameValue';
import { resolveStorageTargets } from '../../../utils/paths/resolveStorageTargets';
import type { SettlementContext } from '../../types/settlement';
import { getDeclaredChildNames } from '../declarations/getDeclaredChildNames';
import { prepareSourcePruner } from '../slots/prepareSourcePruner';
import { pruneInactiveSources } from '../slots/pruneInactiveSources';
import { writeAbsentConstituent } from '../slots/writeAbsentConstituent';
import { findDepartingChild } from '../transition/findDepartingChild';
import { placeDeclarativeValue } from '../transition/placeDeclarativeValue';
import { supersedeRevivedSlotSource } from '../transition/utils/supersedeRevivedSlotSource';
import { readWriteCoverage } from '../write/readWriteCoverage';
import { arrayExtras } from './arrayExtras';
import { assertVirtualWriteShape } from './assertVirtualWriteShape';
import { decideAddressWrite } from './decideAddressWrite';
import { getWriteChild } from './getWriteChild';
import { hasDistributedChildInput } from './hasDistributedChildInput';
import { isPlain } from './isPlain';
import { nextExtras } from './nextExtras';
import { staticSpec } from './staticSpec';
import { acceptsRetainedWrite } from './utils/acceptsRetainedWrite';
import { admitsSameValueWrite } from './utils/admitsSameValueWrite';
import { keepsHostKeys } from './utils/keepsHostKeys';
import { recordArrayBoundary } from './utils/recordArrayBoundary';
import { recordNamedArrayItems } from './utils/recordNamedArrayItems';
import { recordNamedObjectSlots } from './utils/recordNamedObjectSlots';
import { recordRetainedSource } from './utils/recordRetainedSource';
import { restoreWriteEpochPaths } from './utils/restoreWriteEpochPaths';

/** Default of `changedValue`: the caller has not interpreted this node's input. */
const UNINTERPRETED: unique symbol = Symbol('uninterpreted');

/**
 * Mark a terminal source or distribute an object host write by declared key.
 * An object host is written whole only inside the context's replacement scope; under a
 * multi-write batch that scope is the union of the caller paths (191C-01). A declarative
 * (automatic) write replaces its own target whole inside or outside a batch, and also writes a
 * named value into a child leaving in this settlement, as the same write after the exit does.
 * In an admitted static write a host keeping its key set or item count stays out of
 * shape-dirty and its leaf children whose interpreted value equals their source are not marked (W1).
 * @param node - Caller target or descendant reached by a whole host write
 * @param input - Value received at this occurrence's write boundary
 * @param context - Work list recording source, shape, and automatic changes
 * @param spec - Static or narrowed type restriction used for interpretation
 * @param changedValue - A leaf's input already interpreted under the static spec and proven unequal to its source by the distribution's skip test; omitted, the input is interpreted and compared here
 * @param writeOrigin - Named rule input or replay from a cancelled exit, whose whole omissions also persist
 * @param writeOrder - Original sequence when an existing distribution or input is re-read
 * @returns Nothing; only this node's own state channels are stored here
 */
export const markWrite = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  input: unknown,
  context: SettlementContext<Self>,
  spec: UnionSpec = staticSpec(node.schemaType, node.isNullable),
  changedValue: unknown = UNINTERPRETED,
  writeOrigin?: Distribution['writeOrigin'],
  writeOrder?: number,
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
  else {
    if (writeOrder === undefined)
      writeOrder = context.retainedWriteOrder =
        (context.retainedWriteOrder ?? 0) + 1;
    if (!acceptsRetainedWrite(node, context, writeOrder)) return;
    recordRetainedSource(node, context, writeOrigin, writeOrder);
    if (writeOrigin !== undefined) context.writtenInputs.set(node, input);
    if (context.isMarkingLiveRule || context.replayingDepartingWrite) {
      const previousRight =
        context.retainedSources?.get(node)?.revivedSlotSource;
      if (
        previousRight &&
        previousRight.write !== context.replayingDepartingWrite
      )
        supersedeRevivedSlotSource(previousRight);
    }
  }
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
    const parent = node.parent;
    if (!parent) return;
    const targets =
      (node === context.target ? context.virtualWriteTargets : undefined) ??
      resolveStorageTargets(node);
    const values = isArray(value) ? value : undefined;
    for (const target of targets ?? []) {
      const { child: sibling, entry } = getWriteChild(
        parent.blueprintNode,
        parent,
        target.name,
      );
      const input = values?.[target.index];
      const partial = decideAddressWrite(
        sibling?.blueprintNode ?? entry?.node,
        input,
        isMerge,
      );
      if (!sibling) {
        if (entry)
          writeAbsentConstituent(context, parent.path, entry, input, !partial);
        continue;
      }
      if (context.kind === FieldNodeWriteKind.Load)
        prepareSourcePruner(sibling)(
          sibling.runtime,
          sibling.path,
          undefined,
          context,
        );
      else if (!context.isAutomatic && !partial) {
        (context.virtualReplacementPaths ??= []).push(sibling.path);
        pruneInactiveSources(sibling.runtime, sibling.path, undefined, context);
      }
      markWrite(
        sibling,
        input,
        context,
        undefined,
        undefined,
        writeOrigin,
        writeOrder,
      );
    }
    return;
  }
  let nextSource: unknown;
  let extras: unknown;
  let whole: boolean;
  let countChanged = false;

  if (node.behavior.type === 'array') {
    const previousItemCount = node.itemCount;
    if (context.isAutomatic) recordArrayBoundary(node, context);
    if (!context.arrayCounts.has(node))
      context.arrayCounts.set(node, previousItemCount);
    node.itemCount = isArray(value) ? value.length : 0;
    countChanged = node.itemCount !== previousItemCount;
    if (context.isAutomatic)
      recordNamedArrayItems(
        node,
        value,
        previousItemCount,
        context,
        writeOrigin,
      );
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
      whole =
        !decideAddressWrite(node.blueprintNode, value, isMerge) &&
        (context.isAutomatic ||
          !context.writeOrigins ||
          readWriteCoverage(context.writeOrigins, node.path, 'whole') !==
            undefined);
      nextSource = isMerge
        ? node.source
        : context.writeOrigins && Reflect.get(value, BATCH_HOST_SOURCE);
      if (nextSource !== undefined) context.wrongKindHosts.add(node);
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
  const distribution: Distribution = {
    input: value,
    isWhole: whole,
    isAutomatic: context.isAutomatic,
  };
  if (writeOrigin !== undefined) distribution.writeOrigin = writeOrigin;
  if (writeOrder !== undefined) distribution.writeOrder = writeOrder;
  context.distributedInputs.set(node, distribution);
  if (context.isAutomatic && writeOrigin !== undefined && isPlain(value))
    recordNamedObjectSlots(node, value, context);
  if (context.writeEpoch !== undefined) node.writeEpoch = context.writeEpoch;
  else context.dirtyPaths.add(node.path);
  if (!sameShape) context.shapeDirtyPaths.add(node.path);
  if (node.childrenByName === null) return;
  for (const name of Object.keys(node.childrenByName)) {
    if (node.behavior.type === 'array' && Number(name) >= node.itemCount)
      continue;
    const child = node.childrenByName[name];
    if (child.behavior.type === 'virtual') continue;
    const hasInput = hasDistributedChildInput(
      value,
      name,
      node.behavior.type === 'array',
    );
    if (!whole && !hasInput) continue;
    const childInput = hasInput ? Reflect.get(value, name) : undefined;
    let childSpec: Optional<UnionSpec>;
    let interpreted: unknown = UNINTERPRETED;
    if (sameShape && child.behavior.strategy !== 'branch') {
      childSpec = staticSpec(child.schemaType, child.isNullable);
      interpreted = child.behavior.interpret(childInput, childSpec);
    }
    if (interpreted !== UNINTERPRETED && sameValue(child.source, interpreted))
      continue;
    let childOrigin = writeOrigin;
    if (context.isAutomatic) {
      if (!acceptsRetainedWrite(child, context, writeOrder)) continue;
      if (!hasInput && childOrigin === 'declarative') childOrigin = undefined;
      if (childOrigin === undefined) {
        context.writtenInputs.set(child, childInput);
        context.filledNodes.add(child);
      }
    }
    markWrite(
      child,
      childInput,
      context,
      childSpec,
      interpreted,
      childOrigin,
      writeOrder,
    );
  }
  if (
    !context.isAutomatic ||
    context.pendingExits.size === 0 ||
    node.behavior.type === 'array' ||
    !isPlain(value)
  )
    return;
  for (const name of Object.keys(value)) {
    const childInput = Reflect.get(value, name);
    if (childInput === undefined || node.childrenByName[name]) continue;
    const departing = findDepartingChild(node, name, context);
    if (departing)
      placeDeclarativeValue(
        context,
        appendSegment(node.path, name),
        departing.blueprintNode,
        childInput,
      );
  }
};
