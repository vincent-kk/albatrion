import type { BlueprintGate } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { dirtyChildren } from './dirtyChildren';
import { primeHost } from './primeHost';
import { preserveReferences } from './preserveReferences';
import { selectChildren } from './selectChildren';
import { selectNodeSchema } from './selectNodeSchema';
import { relocatedGates } from './relocatedGates';
import { scheduleRelocatedGates } from './scheduleRelocatedGates';
import { updateOutput } from './updateOutput';
import { getHostWheelBudgetCap } from '../gates/getGateBudgetCap';
import { hasIndependentLeafDefaults } from './utils/hasIndependentLeafDefaults';

/**
 * Finish a dirty subtree with one descent and a bounded host gate wheel.
 * @param node - Current live node reached from the root
 * @param context - Dirty paths and current commit's deferred failure
 * @returns Nothing; the record carries its calculated values
 */
export const computeNode = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): void => {
  if (!context.dirtyPaths.has(node.path)) return;
  if (node === context.root && context.kind === 'load' &&
    node.behavior.type === 'object' && node.behavior.strategy === 'branch' &&
    !node.deliveryInitialized && !context.suppressAutomaticWrites &&
    !context.hasGates && context.writtenInputs.get(node) === undefined &&
    node.runtime.latentRaw.size === 0 &&
    hasIndependentLeafDefaults(node.runtime.blueprint)) context.initialOutputs = [];
  context.stateDirtyNodes.add(node);
  if (!context.hasGates && node.parent !== null &&
    node.behavior.strategy === 'terminal' && context.entered.has(node)) {
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
  const previous = { local: node.local, emit: node.emit, children: node.children,
    schema: node.schema, active: node.active };
  if (node.behavior.strategy !== 'branch') {
    if (node.parent === null) selectNodeSchema(node, context);
    updateOutput(node, context);
    preserveReferences(node, previous, context);
    context.dirtyPaths.delete(node.path);
    return;
  }
  if (!context.shapeDirtyPaths.has(node.path)) {
    const recalculated = dirtyChildren(node, context);
    for (let index = 0; index < recalculated.length; index++)
      computeNode(recalculated[index], context);
    updateOutput(node, context, recalculated);
    preserveReferences(node, previous, context);
    context.dirtyPaths.delete(node.path);
    return;
  }
  const prior = node.structure ?? {};
  const gates: BlueprintGate[] = [];
  const seenGates = new Set<BlueprintGate>();
  if (context.hasGates) {
    const entries = node.behavior.declareChildren(node);
    for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
      const declarations = entries[entryIndex].declarations;
      for (let declarationIndex = 0; declarationIndex < declarations.length; declarationIndex++) {
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
    for (let declarationIndex = 0; declarationIndex < declarations.length; declarationIndex++) {
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
  for (let round = 0; round < cap; round++) {
    const schemaChanged = node.parent === null && selectNodeSchema(node, context);
    const changed = selectChildren(node, context, prior,
      (child) => computeNode(child, context), gates.length > 0);
    const dirty = dirtyChildren(node, context);
    for (let index = 0; index < dirty.length; index++) computeNode(dirty[index], context);
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
