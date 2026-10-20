import type { BlueprintGate } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { GateWheelFrame } from '../../types/gateWheel';
import type { SettlementContext } from '../../types/settlement';
import { registerPresenceChanges } from '../dependencies/registerPresenceChanges';
import { canSkipGateWheel } from '../gates/canSkipGateWheel';
import { gateWheelEvaluation } from '../gates/gateWheelEvaluation';
import { getHostWheelBudgetCap } from '../gates/getGateBudgetCap';
import { verifyGateWheelConfirmation } from '../gates/verifyGateWheelConfirmation';
import { updateOutput } from '../output/updateOutput';
import { selectChildren } from './childSelection/selectChildren';
import { dirtyChildren } from './dirtyChildren';
import { preserveReferences } from './preserveReferences';
import { primeHost } from './primeHost';
import { relocatedGates } from './relocatedGates';
import { scheduleRelocatedGates } from './scheduleRelocatedGates';
import { selectNodeSchema } from './selectNodeSchema';
import { computeStableNode } from './utils/computeStableNode';
import { hasIndependentLeafDefaults } from './utils/hasIndependentLeafDefaults';

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
  if (gateWheelEvaluation.mode === 'record') {
    const metrics = (context.presenceMetrics ??= {
      computes: new Map(),
      ancestorRechecks: 0,
      ancestorWheels: 0,
      calls: 0,
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
    node.runtime.latentRaw.size === 0 &&
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
  const previous = {
    local: node.local,
    emit: node.emit,
    children: node.children,
    schema: node.schema,
    active: node.active,
  };
  if (node.behavior.strategy !== 'branch') {
    if (node.parent === null) selectNodeSchema(node, context);
    updateOutput(node, context);
    preserveReferences(node, previous, context);
    context.dirtyPaths.delete(node.path);
    return;
  }
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
      preserveReferences(node, previous, context);
      context.dirtyPaths.delete(node.path);
      return;
    }
    if (context.presenceMetrics) context.presenceMetrics.ancestorWheels++;
  }
  const prior = node.structure ?? {};
  const gates: BlueprintGate[] = [];
  const seenGates = new Set<BlueprintGate>();
  if (context.hasGates) {
    const entries = node.behavior.declareChildren(node);
    for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
      const declarations = entries[entryIndex].declarations;
      for (
        let declarationIndex = 0;
        declarationIndex < declarations.length;
        declarationIndex++
      ) {
        const declaredGates = declarations[declarationIndex].gates;
        for (let gateIndex = 0; gateIndex < declaredGates.length; gateIndex++) {
          const gate = declaredGates[gateIndex];
          if (!seenGates.has(gate)) {
            seenGates.add(gate);
            gates.push(gate);
          }
        }
      }
    }
    const declarations = node.blueprintNode.declarations;
    for (
      let declarationIndex = 0;
      declarationIndex < declarations.length;
      declarationIndex++
    ) {
      const declaredGates = declarations[declarationIndex].gates;
      for (let gateIndex = 0; gateIndex < declaredGates.length; gateIndex++) {
        const gate = declaredGates[gateIndex];
        if (!seenGates.has(gate)) {
          seenGates.add(gate);
          gates.push(gate);
        }
      }
    }
    const relocated = relocatedGates(node);
    for (let index = 0; index < relocated.length; index++) {
      const occurrence = relocated[index];
      if (!seenGates.has(occurrence.gate)) {
        seenGates.add(occurrence.gate);
        gates.push(occurrence.gate);
      }
    }
  }
  if (gates.length > 0) primeHost(node, prior, context);
  const initialDirty = dirtyChildren(node, context);
  for (let index = 0; index < initialDirty.length; index++)
    computeNode(initialDirty[index], context);
  if (gates.length > 0 && updateOutput(node, context))
    scheduleRelocatedGates(relocatedGates(node), context);
  let cap = getHostWheelBudgetCap(node, node.runtime.blueprint, gates);
  let confirmation: GateWheelFrame | undefined;
  let previousPredicate: boolean | undefined;
  let lastStructure = prior;
  let registered = false;
  for (let round = 0; round < cap; round++) {
    const frame: GateWheelFrame | undefined =
      gates.length > 0 && context.kind !== 'load'
        ? {
            inputs: new Map(),
            consistent: true,
            gateCount: gates.length,
            throwVersion: context.gateThrowVersion,
            ...(gateWheelEvaluation.mode === 'shadow'
              ? { evaluations: [] }
              : {}),
          }
        : undefined;
    context.gateWheelFrame = frame;
    const schemaChanged =
      node.parent === null && selectNodeSchema(node, context);
    const changed = selectChildren(
      node,
      context,
      prior,
      (child) => computeNode(child, context),
      gates.length > 0,
    );
    const flagged = context.presenceHosts?.delete(node) === true;
    if (flagged || registered)
      registered =
        registerPresenceChanges(node, lastStructure, context) || registered;
    lastStructure = node.structure ?? {};
    const dirty = dirtyChildren(node, context);
    for (let index = 0; index < dirty.length; index++)
      computeNode(dirty[index], context);
    let outputChanged = false;
    if (context.initialOutputs) context.initialOutputs.push(node);
    else outputChanged = updateOutput(node, context);
    const currentRelocated = context.hasGates ? relocatedGates(node) : [];
    for (let index = 0; index < currentRelocated.length; index++) {
      const occurrence = currentRelocated[index];
      if (!seenGates.has(occurrence.gate)) {
        seenGates.add(occurrence.gate);
        gates.push(occurrence.gate);
      }
    }
    cap = getHostWheelBudgetCap(node, node.runtime.blueprint, gates);
    if (outputChanged) scheduleRelocatedGates(currentRelocated, context);
    const wheelChanged = schemaChanged || changed || outputChanged;
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
      if (gateWheelEvaluation.mode === 'skip') {
        gateWheelEvaluation.skipped++;
        preserveReferences(node, previous, context);
        context.dirtyPaths.delete(node.path);
        return;
      }
    }
    confirmation =
      skip && gateWheelEvaluation.mode === 'shadow' ? frame : undefined;
    previousPredicate = skip;
    if (!schemaChanged && !changed && !outputChanged) {
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
  context.gateWheelFrame = undefined;
  try {
    computeNodeBody(node, context);
  } finally {
    context.gateWheelFrame = parentFrame;
  }
};
