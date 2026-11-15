import { map as mapArray } from '@winglet/common-utils/array';
import { EMPTY_ARRAY } from '@winglet/common-utils/constant';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Dictionary, Fn, Optional } from '@aileron/declare';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import { FormErrorCode, SchemaFormError } from '../../../../../../errors';
import type { BlueprintChildEntry } from '../../../../blueprint';
import { mergeEffectiveSchema } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';
import { captureFieldNodeChange } from '../../../../record';
import { getBlueprintNodeIdentity } from '../../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { SettlementContext } from '../../../types/settlement';
import { captureProjectionBaseline } from '../../dependencies/captureProjectionBaseline';
import { supplementSplitOwner } from '../../dependencies/supplementSplitOwner';
import { recordSettlementFailure } from '../../errors/recordSettlementFailure';
import { evaluateGate } from '../../gates/evaluateGate';
import { flushPendingGateReads } from '../../gates/flushPendingGateReads';
import { getGateRegistry } from '../../gates/getGateRegistry';
import { readGateSelectionGroup } from '../../gates/readGateSelectionGroup';
import { getChildDistribution } from '../../input/getChildDistribution';
import { hasDistributedChildInput } from '../../input/hasDistributedChildInput';
import { updatePendingExitIndex } from '../../scratch/updatePendingExitIndex';
import { cloneFromSlot } from '../../slots/cloneFromSlot';
import { createFromSlotOverlay } from '../../slots/createFromSlotOverlay';
import { enterSlotClone } from '../../slots/enterSlotClone';
import { getSlotSource } from '../../slots/getSlotSource';
import { createChildNode } from '../createChildNode';
import { enterFieldNode } from '../enterFieldNode';
import { hasRecursiveExpansion } from '../hasRecursiveExpansion';
import type { DirectChildSelection } from './getDirectChildSelectionPlan';
import { readAdmittedEdgeSchema } from './readAdmittedEdgeSchema';
import { staticIds } from './staticIds';
import type { PreparedDiscriminatorEntry } from './utils/prepareDiscriminatorEntrySelection';
import type { PreparedStaticHost } from './utils/prepareStaticHost';
import { readDiscriminatorEntrySelection } from './utils/readDiscriminatorEntrySelection';

/** Ungated declarations are included by the effective-schema merger itself. */
const NO_ACTIVE_IDS: readonly number[] = EMPTY_ARRAY;
/** Rejected single-declaration positions share an empty selection. */
const NO_DECLARATIONS: BlueprintChildEntry['declarations'] = [];

/** Shared state is allocated once for a host selection, never once per entry. */
export interface ChildSelectionFrame<Self extends FieldNodeRecord<Self>> {
  /** Static occurrences already present in the fixed private baseline. */
  readonly preparedStatic?: PreparedStaticHost<Self>;
  /** Dynamic own entries in actual creation order, excluding rejected admissions. */
  readonly preparedDynamic?: Dictionary<Self>;
  /** Original dynamic membership is retained solely for exit comparison. */
  readonly priorDynamicNames?: readonly string[];
  /** Host whose current `childrenByName` is selected. */
  readonly node: Self;
  /** Settlement effects, dirty paths, failures, latent state and gate evidence. */
  readonly context: SettlementContext<Self>;
  /** Shape retained before the host wheel's ungated start. */
  readonly prior: Dictionary<Self>;
  /** Recursive computation called immediately for a dirty admitted child. */
  readonly computeChild: Fn<[child: Self]>;
  /** Whether entry changes queue host projection before later gates. */
  readonly isImmediate: boolean;
  /** Ordered mutable target; prepared selection inherits static entries while host reads use a view. */
  readonly next: Dictionary<Self>;
  /** First admitted blueprint identity for each authored name. */
  readonly seenNodesByName: Map<string, BlueprintChildEntry['node']>;
  /** Rejected entries collected for the unchanged latent-distribution pass. */
  readonly inactiveEntries: BlueprintChildEntry[];
  /** Whether any visited entry changed shape or effective schema. */
  hasChanged: boolean;
  /** Whether a general-path entry must flush pending gate reads first. */
  readonly shouldFlushReads: boolean;
  /** Prepared once by selectChildren; table and general paths share this entry predicate. */
  readonly canReuseStatic?: Fn<[entry: BlueprintChildEntry], boolean>;
  /** Present only for a table step; its pure recognized expression cannot throw. */
  isTableAdmitted?: boolean;
  /** A table predicate failed at its original first evaluation position. */
  hasTableThrown?: boolean;
}

/**
 * Apply exactly one authored child-selection step to the shared host frame.
 * @param entry - Candidate edge whose declarations, blueprint and name are evaluated
 * @param step - Prepared gate and declaration IDs, or undefined for general selection
 * @param frame - Host, context, prior shape, compute callback, immediate/flush flags,
 * current `childrenByName`, admitted-name map, inactive list and accumulated changed flag
 * @returns Nothing; mutates frame.changed, frame.next, frame.seenNodesByName and frame.inactiveEntries
 * @remarks Gate reads may publish pending projections and record inputs or failures.
 * Updates throwing exits, presence hosts, projection baselines, recursion budget, perished/pending exit
 * maps and path counts, `revivedNodes`/`enteredNodes` sets and latent-entry indexes, gate registry,
 * selected declaration IDs, original schemas, dirty/shape/state/change records,
 * child schema/active/detached state and pending host outputs. Creates or enters
 * missing children and calls frame.computeChild for dirty admitted children.
 */
export const selectEntryStep = <Self extends FieldNodeRecord<Self>>(
  entry: BlueprintChildEntry,
  step: Optional<DirectChildSelection>,
  frame: ChildSelectionFrame<Self>,
): void => {
  const {
    node,
    context,
    prior,
    computeChild,
    isImmediate,
    next,
    seenNodesByName,
    inactiveEntries,
    shouldFlushReads,
  } = frame;
  if (shouldFlushReads && context.pendingOutputs?.size)
    flushPendingGateReads(
      entry.node,
      appendSegment(node.path, entry.name),
      context,
    );
  let threw = false;
  let declarations: BlueprintChildEntry['declarations'];
  let activeIds: Optional<readonly number[]>;
  let fullyAdmitted = false;
  let discriminator: Optional<PreparedDiscriminatorEntry>;
  if (step?.discriminatorSelection) {
    const round = context.gateSelectionRounds?.get(node);
    const tagGroup = round?.isActive
      ? round.table.groups.find((group) => group.watchedName === entry.name)
      : undefined;
    if (tagGroup)
      discriminator = readDiscriminatorEntrySelection(
        entry,
        step.discriminatorSelection,
        readGateSelectionGroup(node, context, tagGroup),
        node.runtime.blueprint.isAtomic,
      );
  }
  if (discriminator) {
    declarations = entry.declarations;
    activeIds = discriminator.ids;
  } else if (step && !step.isGeneral) {
    const version = context.gateExceptionVersion;
    const admitted =
      frame.isTableAdmitted ??
      (!step.gate || evaluateGate(step.gate, context, node));
    declarations = admitted ? entry.declarations : NO_DECLARATIONS;
    activeIds = admitted ? step.ids : NO_ACTIVE_IDS;
    threw =
      !admitted &&
      (frame.hasTableThrown === true ||
        context.gateExceptionVersion !== version);
  } else if (context.hasGates) {
    // Allocated at the first rejected declaration; until then every one is admitted.
    let active: Optional<(typeof entry.declarations)[number][]>;
    let ids: Optional<number[]>;
    for (let index = 0; index < entry.declarations.length; index++) {
      const declaration = entry.declarations[index];
      const version = context.gateExceptionVersion;
      let admitted = true;
      for (
        let gateIndex = 0;
        gateIndex < declaration.gates.length;
        gateIndex++
      ) {
        const gate = declaration.gates[gateIndex];
        const previousDecision = step?.isGeneral
          ? context.gateWheelFrame?.predicateResults?.get(
              getGateRegistry(node.runtime).locate(node, gate),
            )
          : undefined;
        if (
          !(
            previousDecision ??
            evaluateGate(
              gate,
              context,
              node,
              gate.schemaPath ===
                appendSegment(
                  appendSegment(declaration.schemaPath, 'controls'),
                  'active',
                )
                ? entry.name
                : undefined,
            )
          )
        ) {
          admitted = false;
          break;
        }
      }
      if (admitted) {
        active?.push(declaration);
        ids?.push(declaration.id);
      } else {
        active ??= entry.declarations.slice(0, index);
        ids ??= mapArray(active, (kept) => kept.id);
        if (context.gateExceptionVersion !== version) threw = true;
      }
    }
    fullyAdmitted = active === undefined;
    declarations = active ?? entry.declarations;
    activeIds = ids ?? staticIds(entry, node.blueprintNode);
  } else declarations = entry.declarations;
  if (declarations.length === 0) {
    const priorChild = hasOwnProperty(prior, entry.name)
      ? prior[entry.name]
      : undefined;
    const exiting =
      priorChild?.blueprintNode === entry.node
        ? priorChild
        : !context.pendingExitPaths
              ?.get(node.path)
              ?.has(appendSegment(node.path, entry.name))
          ? undefined
          : context.pendingExits.get(
              JSON.stringify([
                appendSegment(node.path, entry.name),
                getBlueprintNodeIdentity(entry.node),
              ]),
            );
    if (exiting) {
      if (threw) (context.throwingGateExits ??= new Set()).add(exiting);
      else context.throwingGateExits?.delete(exiting);
    }
    if (context.distributedInputs.has(node) || next[entry.name])
      inactiveEntries.push(entry);
    if (
      next[entry.name] &&
      !seenNodesByName.has(entry.name) &&
      next[entry.name].blueprintNode === entry.node
    ) {
      delete next[entry.name];
      frame.hasChanged = true;
      if (isImmediate) {
        (context.pendingOutputs ??= new Set()).add(node);
      }
    }
    return;
  }
  const retained = hasOwnProperty(prior, entry.name)
    ? prior[entry.name]
    : undefined;
  if (retained?.blueprintNode === entry.node)
    context.throwingGateExits?.delete(retained);
  if (seenNodesByName.has(entry.name)) {
    if (seenNodesByName.get(entry.name) !== entry.node) {
      const path = appendSegment(node.path, entry.name);
      recordSettlementFailure(
        context,
        new SchemaFormError(
          FormErrorCode.SharedNodeConflict,
          `Active declarations conflict at ${path}`,
          { path },
        ),
        'sharedConflict',
      );
    }
    return;
  }
  seenNodesByName.set(entry.name, entry.node);
  const priorChild =
    hasOwnProperty(prior, entry.name) &&
    prior[entry.name].blueprintNode === entry.node
      ? prior[entry.name]
      : undefined;
  if (!priorChild && context.hasGates)
    (context.presenceHosts ??= new Set()).add(node);
  const currentChild =
    next[entry.name]?.blueprintNode === entry.node
      ? next[entry.name]
      : undefined;
  const distribution = getChildDistribution(node, entry.name, context);
  const ownsInput =
    distribution &&
    hasDistributedChildInput(
      distribution.input,
      entry.name,
      node.behavior.type === 'array',
    );
  const slotState =
    !priorChild && !currentChild ? getSlotSource(node, entry) : undefined;
  const slotSource = slotState?.instance;
  const slotOverlay = slotState?.overlay;
  const input = ownsInput
    ? Reflect.get(distribution.input, entry.name)
    : undefined;
  if (
    !priorChild &&
    !currentChild &&
    !slotSource &&
    !slotOverlay &&
    hasRecursiveExpansion(node, entry.node, input, context)
  ) {
    if (!context.exceededBudget) {
      const path = appendSegment(node.path, entry.name);
      recordSettlementFailure(
        context,
        new SchemaFormError(
          FormErrorCode.RecursiveShapeDiverged,
          `Recursive shape diverged at ${path}`,
          { path },
        ),
        'budget',
      );
      context.exceededBudget = 'recursion';
    }
    return;
  }
  const key =
    context.pendingExits.size > 0
      ? JSON.stringify([
          appendSegment(node.path, entry.name),
          getBlueprintNodeIdentity(entry.node),
        ])
      : undefined;
  const pending = key === undefined ? undefined : context.pendingExits.get(key);
  const child =
    currentChild ??
    priorChild ??
    pending ??
    (slotSource
      ? cloneFromSlot(node, entry, slotSource, context)
      : slotOverlay
        ? createFromSlotOverlay(node, entry, slotOverlay, context)
        : createChildNode(node, entry));
  context.perishedNodes.delete(child);
  if (key !== undefined && context.pendingExits.delete(key)) {
    const path = appendSegment(node.path, entry.name);
    updatePendingExitIndex(context, path, -1);
  }
  if (pending && child === pending) {
    context.revivedNodes.add(child);
  }
  if (context.hasGates) getGateRegistry(child.runtime).register(child);
  let entryChanged = false;
  if (!priorChild && !currentChild && !pending) {
    context.enteredNodes.add(child);

    if (child.behavior.type === 'virtual') context.dirtyPaths.add(child.path);
    else if (slotSource || slotOverlay)
      enterSlotClone(node, child, entry.name, context);
    else enterFieldNode(node, child, entry.name, context);
    if (child.behavior.strategy === 'branch')
      context.shapeDirtyPaths.add(child.path);
    frame.hasChanged = true;
    entryChanged = true;
  }
  const ids = activeIds ?? staticIds(entry, node.blueprintNode);
  if ((!priorChild && !currentChild) || (pending && child === pending))
    supplementSplitOwner(child, context);
  if (context.selectedDeclarationIds.get(child) !== ids)
    context.selectedDeclarationIds.set(child, ids);
  const isAtomic = node.runtime.blueprint?.isAtomic;
  const admittedEdge = fullyAdmitted
    ? readAdmittedEdgeSchema(
        entry,
        child.blueprintNode,
        isAtomic,
        node.blueprintNode,
      )
    : undefined;
  const effective =
    discriminator?.schema ??
    admittedEdge?.schema ??
    mergeEffectiveSchema(
      child.blueprintNode,
      context.hasGates ? ids : NO_ACTIVE_IDS,
      { mode: 'runtime', isAtomic },
    );
  if (child.schema !== effective) {
    captureProjectionBaseline(
      node,
      child,
      !!(priorChild || currentChild),
      context,
    );
    if (!context.originalSchemas.has(child.path))
      context.originalSchemas.set(child.path, child.schema);
    child.schema = captureFieldNodeChange(child, 'schema', effective);
    context.dirtyPaths.add(child.path);
    if (child.behavior.strategy === 'branch')
      context.shapeDirtyPaths.add(child.path);
    context.changedNodes.add(child);
    frame.hasChanged = true;
    entryChanged = true;
  }
  if (admittedEdge ? admittedEdge.hasConflict : effective.hasTypeConflict) {
    recordSettlementFailure(
      context,
      new SchemaFormError(
        FormErrorCode.SharedNodeConflict,
        `Active declarations conflict at ${child.path}`,
        { path: child.path },
      ),
      'sharedConflict',
    );
  }
  child.isActive = captureFieldNodeChange(child, 'isActive', true);
  child.isDetached = false;
  if (next[entry.name] !== child) {
    frame.hasChanged = true;
    entryChanged = true;
  }
  next[entry.name] = child;
  if (child.behavior.type === 'virtual') {
    context.dirtyPaths.add(child.path);
    context.shapeDirtyPaths.add(child.path);
  }
  if (context.dirtyPaths.has(child.path)) {
    computeChild(child);
    entryChanged = true;
  }
  if (isImmediate && entryChanged) {
    (context.pendingOutputs ??= new Set()).add(node);
  }
};
