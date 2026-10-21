import { hasOwnProperty } from '@winglet/common-utils/lib';
import { escapeSegment } from '@winglet/json/pointer';

import { FormErrorCode, SchemaFormError } from '../../../../../../errors';
import { mergeEffectiveSchema } from '../../../../blueprint';
import type { BlueprintChildEntry } from '../../../../blueprint';
import { captureFieldNodeChange } from '../../../../record';
import type { FieldNodeRecord } from '../../../../record';
import { getBlueprintNodeIdentity } from '../../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { SettlementContext } from '../../../types/settlement';
import { supplementSplitOwner } from '../../dependencies/supplementSplitOwner';
import { recordSettlementFailure } from '../../errors/recordSettlementFailure';
import { evaluateGate } from '../../gates/evaluateGate';
import { flushPendingGateReads } from '../../gates/flushPendingGateReads';
import { getGateRegistry } from '../../gates/getGateRegistry';
import { getChildDistribution } from '../../input/getChildDistribution';
import { hasDistributedChildInput } from '../../input/hasDistributedChildInput';
import { indexEnteredLatentKey } from '../../latentStore/indexEnteredLatentKey';
import { updatePendingExitIndex } from '../../scratch/updatePendingExitIndex';
import { createChildNode } from '../createChildNode';
import { enterFieldNode } from '../enterFieldNode';
import { hasRecursiveExpansion } from '../hasRecursiveExpansion';
import type { DirectChildSelection } from './getDirectChildSelectionPlan';
import { readAdmittedEdgeSchema } from './readAdmittedEdgeSchema';
import { staticIds } from './staticIds';

/** Ungated declarations are included by the effective-schema merger itself. */
const NO_ACTIVE_IDS: readonly number[] = Object.freeze([]);
/** Rejected single-declaration positions share an empty selection. */
const NO_DECLARATIONS: BlueprintChildEntry['declarations'] = [];

/** Shared state is allocated once for a host selection, never once per entry. */
export interface ChildSelectionFrame<Self extends FieldNodeRecord<Self>> {
  /** Host whose current structure is selected. */
  readonly node: Self;
  /** Settlement effects, dirty paths, failures, latent state and gate evidence. */
  readonly context: SettlementContext<Self>;
  /** Shape retained before the host wheel's ungated start. */
  readonly prior: Record<string, Self>;
  /** Recursive computation called immediately for a dirty admitted child. */
  readonly computeChild: (child: Self) => void;
  /** Whether entry changes queue host projection before later gates. */
  readonly immediate: boolean;
  /** Ordered mutable structure published by this selection call. */
  readonly next: Record<string, Self>;
  /** First admitted blueprint identity for each authored name. */
  readonly seen: Map<string, BlueprintChildEntry['node']>;
  /** Rejected entries collected for the unchanged latent-distribution pass. */
  readonly inactiveEntries: BlueprintChildEntry[];
  /** Whether any visited entry changed shape or effective schema. */
  changed: boolean;
  /** Whether a general-path entry must flush pending gate reads first. */
  readonly flushReads: boolean;
  /** Present only for a table step; its pure recognized expression cannot throw. */
  tableVerdict?: boolean;
}

/**
 * Apply exactly one authored child-selection step to the shared host frame.
 * @param entry - Candidate edge whose declarations, blueprint and name are evaluated
 * @param step - Prepared gate and declaration IDs, or undefined for general selection
 * @param frame - Host, context, prior shape, compute callback, immediate/flush flags,
 * current structure, admitted-name map, inactive list and accumulated changed flag
 * @returns Nothing; mutates frame.changed, frame.next, frame.seen and frame.inactiveEntries
 * @remarks Gate reads may publish pending projections and record inputs or failures.
 * Updates throwing exits, presence hosts, recursion budget, perished/pending exit
 * maps and path counts, revived/entered sets and latent-entry indexes, gate registry,
 * selected declaration IDs, original schemas, dirty/shape/state/change records,
 * child schema/active/detached state and pending host outputs. Creates or enters
 * missing children and calls frame.computeChild for dirty admitted children.
 */
export const selectEntryStep = <Self extends FieldNodeRecord<Self>>(
  entry: BlueprintChildEntry,
  step: DirectChildSelection | undefined,
  frame: ChildSelectionFrame<Self>,
): void => {
  const {
    node,
    context,
    prior,
    computeChild,
    immediate,
    next,
    seen,
    inactiveEntries,
    flushReads,
  } = frame;
  if (flushReads && context.pendingOutputs?.size)
    flushPendingGateReads(
      entry.node,
      node.path + '/' + escapeSegment(entry.name),
      context,
    );
  let threw = false;
  let declarations: BlueprintChildEntry['declarations'];
  let activeIds: readonly number[] | undefined;
  let fullyAdmitted = false;
  if (step) {
    const version = context.gateThrowVersion;
    const admitted =
      frame.tableVerdict ??
      (!step.gate || evaluateGate(step.gate, context, node));
    declarations = admitted ? entry.declarations : NO_DECLARATIONS;
    activeIds = admitted ? step.ids : NO_ACTIVE_IDS;
    threw = !admitted && context.gateThrowVersion !== version;
  } else if (context.hasGates) {
    // Allocated at the first rejected declaration; until then every one is admitted.
    let active: (typeof entry.declarations)[number][] | undefined;
    let ids: number[] | undefined;
    for (let index = 0; index < entry.declarations.length; index++) {
      const declaration = entry.declarations[index];
      const version = context.gateThrowVersion;
      let admitted = true;
      for (
        let gateIndex = 0;
        gateIndex < declaration.gates.length;
        gateIndex++
      ) {
        const gate = declaration.gates[gateIndex];
        if (
          !evaluateGate(
            gate,
            context,
            node,
            gate.schemaPath === declaration.schemaPath + '/controls/active'
              ? entry.name
              : undefined,
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
        ids ??= active.map((kept) => kept.id);
        if (context.gateThrowVersion !== version) threw = true;
      }
    }
    fullyAdmitted = active === undefined;
    declarations = active ?? entry.declarations;
    activeIds = ids ?? staticIds(entry);
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
              ?.has(node.path + '/' + escapeSegment(entry.name))
          ? undefined
          : context.pendingExits.get(
              JSON.stringify([
                node.path + '/' + escapeSegment(entry.name),
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
      !seen.has(entry.name) &&
      next[entry.name].blueprintNode === entry.node
    ) {
      delete next[entry.name];
      frame.changed = true;
      if (immediate) {
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
  if (seen.has(entry.name)) {
    if (seen.get(entry.name) !== entry.node) {
      recordSettlementFailure(
        context,
        new SchemaFormError(
          FormErrorCode.SharedNodeConflict,
          `Active declarations conflict at ${node.path}/${entry.name}`,
          { path: `${node.path}/${entry.name}` },
        ),
        'sharedConflict',
      );
    }
    return;
  }
  seen.set(entry.name, entry.node);
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
  const latent = context.root.runtime.latentRaw;
  const latentKey =
    latent.size > 0 && !priorChild
      ? JSON.stringify([
          node.path + '/' + escapeSegment(entry.name),
          getBlueprintNodeIdentity(entry.node),
        ])
      : undefined;
  const input = ownsInput
    ? Reflect.get(distribution.input, entry.name)
    : distribution?.whole
      ? undefined
      : latentKey !== undefined && latent.has(latentKey)
        ? latent.get(latentKey)
        : undefined;
  if (
    !priorChild &&
    !currentChild &&
    hasRecursiveExpansion(node, entry.node, input, context)
  ) {
    if (!context.exceededBudget) {
      recordSettlementFailure(
        context,
        new SchemaFormError(
          FormErrorCode.RecursiveShapeDiverged,
          `Recursive shape diverged at ${node.path}/${entry.name}`,
          { path: `${node.path}/${entry.name}` },
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
          node.path + '/' + escapeSegment(entry.name),
          getBlueprintNodeIdentity(entry.node),
        ])
      : undefined;
  const pending = key === undefined ? undefined : context.pendingExits.get(key);
  const child =
    currentChild ?? priorChild ?? pending ?? createChildNode(node, entry);
  context.perished.delete(child);
  if (key !== undefined && context.pendingExits.delete(key)) {
    const path = node.path + '/' + escapeSegment(entry.name);
    updatePendingExitIndex(context, path, -1);
  }
  if (pending && child === pending) {
    context.revived.add(child);
    indexEnteredLatentKey(context, child);
  }
  if (context.hasGates) getGateRegistry(child.runtime).register(child);
  let entryChanged = false;
  if (!priorChild && !currentChild && !pending) {
    context.entered.add(child);
    indexEnteredLatentKey(context, child);
    if (child.behavior.type === 'virtual') context.dirtyPaths.add(child.path);
    else enterFieldNode(node, child, entry.name, context);
    if (child.behavior.strategy === 'branch')
      context.shapeDirtyPaths.add(child.path);
    frame.changed = true;
    entryChanged = true;
  }
  const ids = activeIds ?? staticIds(entry);
  if ((!priorChild && !currentChild) || (pending && child === pending))
    supplementSplitOwner(child, context);
  if (context.selectedDeclarationIds.get(child) !== ids)
    context.selectedDeclarationIds.set(child, ids);
  const isAtomic = node.runtime.blueprint?.isAtomic;
  const admittedEdge = fullyAdmitted
    ? readAdmittedEdgeSchema(entry, child.blueprintNode, isAtomic)
    : undefined;
  const effective =
    admittedEdge?.schema ??
    mergeEffectiveSchema(
      child.blueprintNode,
      context.hasGates ? ids : NO_ACTIVE_IDS,
      { mode: 'runtime', isAtomic },
    );
  if (child.schema !== effective) {
    if (!context.originalSchemas.has(child.path))
      context.originalSchemas.set(child.path, child.schema);
    child.schema = captureFieldNodeChange(child, 'schema', effective);
    context.dirtyPaths.add(child.path);
    if (child.behavior.strategy === 'branch')
      context.shapeDirtyPaths.add(child.path);
    context.changedNodes.add(child);
    frame.changed = true;
    entryChanged = true;
  }
  if (admittedEdge ? admittedEdge.conflict : effective.typeConflict) {
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
  child.active = captureFieldNodeChange(child, 'active', true);
  child.detached = false;
  if (next[entry.name] !== child) {
    frame.changed = true;
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
  if (immediate && entryChanged) {
    (context.pendingOutputs ??= new Set()).add(node);
  }
};
