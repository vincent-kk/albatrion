import type { FieldNodeRecord } from '../../../record';
import { engineModes } from '../../../utils/cache/engineModes';
import type { GateWheelFrame } from '../../types/gateWheel';
import type { SettlementContext } from '../../types/settlement';
import { flushPresenceTemplates } from '../dependencies/flushPresenceTemplates';
import { registerPresenceChanges } from '../dependencies/registerPresenceChanges';
import { canSkipGateWheel } from '../gates/canSkipGateWheel';
import { finishGateTableRound } from '../gates/finishGateTableRound';
import { gateWheelEvaluation } from '../gates/gateWheelEvaluation';
import { getHostWheelBudgetCap } from '../gates/getGateBudgetCap';
import { prepareGateTableRound } from '../gates/prepareGateTableRound';
import { verifyGateWheelConfirmation } from '../gates/verifyGateWheelConfirmation';
import { updateOutput } from '../output/updateOutput';
import { selectChildren } from './childSelection/selectChildren';
import { discardStaticHostPreparation } from './childSelection/utils/discardStaticHostPreparation';
import { dirtyChildren } from './dirtyChildren';
import { preserveReferences } from './preserveReferences';
import { primeHost } from './primeHost';
import { relocatedGates } from './relocatedGates';
import { scheduleChangedRelocatedGates } from './scheduleChangedRelocatedGates';
import { scheduleRelocatedGates } from './scheduleRelocatedGates';
import { selectNodeSchema } from './selectNodeSchema';
import { computeStableNode } from './utils/computeStableNode';
import { hasIndependentLeafDefaults } from './utils/hasIndependentLeafDefaults';
import { prepareHostWheelPlan } from './utils/prepareHostWheelPlan';

/**
 * Finish a dirty subtree with one descent and a bounded host gate wheel.
 * This helper stays here because it recurses through the exported wrapper; a separate file would create an import cycle.
 * @param node - Current live node reached from the root
 * @param context - Dirty paths and current commit's deferred failure
 * @returns Nothing; the record carries its calculated values
 */
const computeNodeBody = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): void => {
  if (
    !context.hasGates &&
    context.root.runtime.blueprint.capabilities.branchless &&
    context.shapeDirtyPaths.size === 0 &&
    context.entered.size === 0
  ) {
    computeStableNode(node, context);
    return;
  }
  if (!context.dirtyPaths.has(node.path)) return;
  if (context.hasGates) {
    context.presenceClock = (context.presenceClock ?? 0) + 1;
    (context.presenceComputeStarts ??= new Map()).set(
      node,
      context.presenceClock,
    );
  }
  if (engineModes.gateWheel === 'record') {
    const metrics = (context.presenceMetrics ??= {
      computes: new Map(),
      ancestorRechecks: 0,
      ancestorWheels: 0,
      calls: 0,
      ownerInsertions: 0,
      indexLookups: 0,
    });
    metrics.computes.set(node.path, (metrics.computes.get(node.path) ?? 0) + 1);
  }
  if (
    node === context.root &&
    context.kind === 'load' &&
    node.behavior.type === 'object' &&
    node.behavior.strategy === 'branch' &&
    !node.deliveryInitialized &&
    !context.suppressAutomaticWrites &&
    !context.hasGates &&
    context.writtenInputs.get(node) === undefined &&
    hasIndependentLeafDefaults(node.runtime.blueprint)
  )
    context.initialOutputs = [];
  context.stateDirtyNodes.add(node);
  if (
    !context.hasGates &&
    node.parent !== null &&
    node.behavior.strategy === 'terminal' &&
    context.entered.has(node)
  ) {
    if (context.initialOutputs) context.initialOutputs.push(node);
    else updateOutput(node, context);
    context.dirtyPaths.delete(node.path);
    return;
  }
  if (!context.hasGates && !context.shapeDirtyPaths.has(node.path)) {
    if (node.behavior.strategy === 'branch') {
      const recalculated = dirtyChildren(node, context);
      for (let index = 0; index < recalculated.length; index++)
        computeNode(recalculated[index], context);
      updateOutput(node, context, recalculated);
    } else {
      if (node.parent === null) selectNodeSchema(node, context);
      updateOutput(node, context);
    }
    context.dirtyPaths.delete(node.path);
    return;
  }
  if (!context.originalSchemas.has(node.path))
    context.originalSchemas.set(node.path, node.schema);
  if (node.behavior.strategy !== 'branch') {
    if (node.parent === null) selectNodeSchema(node, context);
    updateOutput(node, context);
    context.dirtyPaths.delete(node.path);
    return;
  }
  const previousLocal = node.local;
  const previousEmit = node.emit;
  const previousChildren = node.children;
  const previousSchema = node.schema;
  const previousActive = node.active;
  if (!context.shapeDirtyPaths.has(node.path)) {
    const recalculated = dirtyChildren(node, context);
    let registrations = context.presenceRegistrations ?? 0;
    for (let index = 0; index < recalculated.length; index++)
      computeNode(recalculated[index], context);
    let wheel = context.shapeDirtyPaths.has(node.path);
    let computed: Set<Self> | undefined;
    while (!wheel && (context.presenceRegistrations ?? 0) !== registrations) {
      if (context.presenceMetrics) context.presenceMetrics.ancestorRechecks++;
      registrations = context.presenceRegistrations ?? 0;
      computed ??= new Set(recalculated);
      const pending: Self[] = [];
      const candidates = dirtyChildren(node, context);
      for (let index = 0; index < candidates.length; index++) {
        const child = candidates[index];
        if (!context.dirtyPaths.has(child.path)) continue;
        if (computed.has(child)) {
          wheel = true;
          break;
        }
        pending.push(child);
      }
      if (wheel) break;
      for (let index = 0; index < pending.length; index++) {
        computed.add(pending[index]);
        recalculated.push(pending[index]);
        computeNode(pending[index], context);
      }
      wheel = context.shapeDirtyPaths.has(node.path);
    }
    if (!wheel) {
      updateOutput(node, context, recalculated);
      context.dirtyPaths.delete(node.path);
      return;
    }
    if (context.presenceMetrics) context.presenceMetrics.ancestorWheels++;
  }
  const previous = {
    local: previousLocal,
    emit: previousEmit,
    children: previousChildren,
    schema: previousSchema,
    active: previousActive,
  };
  const prior = node.structure ?? {};
  let wheelPlan = context.hasGates ? prepareHostWheelPlan(node) : undefined;
  let gates = wheelPlan?.gates ?? [];
  const relocated = wheelPlan?.relocated ?? [];
  if (gates.length > 0) primeHost(node, prior, context, relocated.length > 0);
  const initialDirty = dirtyChildren(node, context);
  for (let index = 0; index < initialDirty.length; index++)
    computeNode(initialDirty[index], context);
  const deferBaseline =
    wheelPlan?.baselineEligible === true &&
    context.kind !== 'load' &&
    !context.distributedInputs.has(node) &&
    context.pathChanges.length === 0;
  if (deferBaseline) (context.pendingOutputs ??= new Set()).add(node);
  else if (gates.length > 0 && updateOutput(node, context))
    scheduleRelocatedGates(relocatedGates(node), context);
  let cap = wheelPlan
    ? context.distributedInputs.size > 0 || wheelPlan.cap === undefined
      ? (wheelPlan.cap = getHostWheelBudgetCap(
          node,
          node.runtime.blueprint,
          gates,
          node.runtime,
        ))
      : wheelPlan.cap
    : 1;
  let confirmation: GateWheelFrame | undefined;
  let previousPredicate: boolean | undefined;
  let lastStructure = prior;
  let registered = false;
  let hasRelocated = relocated.length > 0;
  for (let round = 0; round < cap; round++) {
    const roundLocal = node.local;
    const roundEmit = node.emit;
    const frame: GateWheelFrame | undefined =
      gates.length > 0 && context.kind !== 'load'
        ? {
            inputs: new Map(),
            consistent: true,
            gateCount: gates.length,
            throwVersion: context.gateThrowVersion,
            ...(engineModes.gateWheel === 'shadow' ? { evaluations: [] } : {}),
          }
        : undefined;
    context.gateWheelFrame = frame;
    prepareGateTableRound(node, context, round);
    const schemaChanged =
      node.parent === null && selectNodeSchema(node, context);
    if (context.hasGates) {
      context.presenceClock = (context.presenceClock ?? 0) + 1;
      (context.presenceRoundStarts ??= new Map()).set(
        node,
        context.presenceClock,
      );
    }
    const publication = { flushed: false };
    const changed = selectChildren(
      node,
      context,
      prior,
      (child) => computeNode(child, context),
      gates.length > 0,
      hasRelocated,
      registered,
      publication,
    );
    const flagged = context.presenceHosts?.delete(node) === true;
    if (flagged || registered)
      registered =
        registerPresenceChanges(node, lastStructure, context) || registered;
    if (registered) lastStructure = node.structure ?? {};
    flushPresenceTemplates(node, context);
    const dirty = dirtyChildren(node, context);
    for (let index = 0; index < dirty.length; index++)
      computeNode(dirty[index], context);
    let outputChanged = false;
    const unchangedPublication =
      deferBaseline &&
      !hasRelocated &&
      !schemaChanged &&
      !changed &&
      dirty.length === 0 &&
      !context.pendingOutputs?.has(node) &&
      node.local === roundLocal &&
      node.emit === roundEmit &&
      !context.distributedInputs.has(node) &&
      context.pathChanges.length === 0;
    if (context.initialOutputs) context.initialOutputs.push(node);
    else if (
      !unchangedPublication &&
      (!deferBaseline ||
        hasRelocated ||
        !publication.flushed ||
        dirty.length > 0 ||
        context.pendingOutputs?.has(node))
    )
      outputChanged = updateOutput(node, context);
    if (wheelPlan) wheelPlan = prepareHostWheelPlan(node, wheelPlan);
    gates = wheelPlan?.gates ?? gates;
    const currentRelocated = wheelPlan?.relocated ?? [];
    hasRelocated = currentRelocated.length > 0;
    cap = wheelPlan
      ? context.distributedInputs.size > 0 || wheelPlan.cap === undefined
        ? (wheelPlan.cap = getHostWheelBudgetCap(
            node,
            node.runtime.blueprint,
            gates,
            node.runtime,
          ))
        : wheelPlan.cap
      : 1;
    if (outputChanged) scheduleRelocatedGates(currentRelocated, context);
    const publishedChanged =
      !outputChanged &&
      context.kind !== 'load' &&
      (node.local !== roundLocal || node.emit !== roundEmit) &&
      scheduleChangedRelocatedGates(currentRelocated, context);
    const wheelChanged =
      schemaChanged || changed || outputChanged || publishedChanged;
    finishGateTableRound(node, context);
    if (frame && confirmation)
      verifyGateWheelConfirmation(confirmation, frame, wheelChanged);
    if (frame && previousPredicate === false && !wheelChanged)
      gateWheelEvaluation.missed++;
    const skip =
      frame !== undefined &&
      wheelChanged &&
      canSkipGateWheel(node, context, frame, round, cap, gates.length);
    if (skip) {
      gateWheelEvaluation.predictions++;
      if (engineModes.gateWheel === 'skip') {
        gateWheelEvaluation.skipped++;
        preserveReferences(node, previous, context);
        context.dirtyPaths.delete(node.path);
        return;
      }
    }
    confirmation =
      skip && engineModes.gateWheel === 'shadow' ? frame : undefined;
    previousPredicate = skip;
    if (!schemaChanged && !changed && !outputChanged && !publishedChanged) {
      preserveReferences(node, previous, context);
      context.dirtyPaths.delete(node.path);
      return;
    }
  }
  if (gates.length > 0) context.hostWheelExceeded = cap;
  preserveReferences(node, previous, context);
  context.dirtyPaths.delete(node.path);
};

/**
 * Isolate recursive computation so a child host never contributes parent gate witnesses.
 * @param node - Dirty subtree reached by the existing compute traversal
 * @param context - Current settlement with its caller's optional gate frame
 * @returns Nothing; restores the caller frame even if computation throws
 */
export const computeNode = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): void => {
  const parentFrame = context.gateWheelFrame;
  let computed = false;
  context.gateWheelFrame = undefined;
  try {
    computeNodeBody(node, context);
    if (node === context.root) flushPresenceTemplates(undefined, context);
    computed = true;
  } finally {
    context.gateWheelFrame = parentFrame;
    if (node === context.root) {
      if (!computed) discardStaticHostPreparation(context);
      context.restoreGateSelectionDirty?.();
      context.gateSelectionRounds?.clear();
    }
  }
};
