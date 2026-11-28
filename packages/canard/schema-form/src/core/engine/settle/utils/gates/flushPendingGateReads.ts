import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Optional } from '@aileron/declare';

import {
  JSONPointer as $,
  PointerOperator,
  appendSegment,
  isDescendantPath,
  readPointerSegment,
} from '@/schema-form/helpers/jsonPointer';

import type {
  BlueprintChildEntry,
  BlueprintGate,
  BlueprintNode,
} from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { getHostDerived } from '../../../utils/cache/derivedRecords';
import type { SettlementContext } from '../../types/settlement';
import { flushPendingOutput } from '../output/flushPendingOutput';
import { bindGateFrame } from './frames/bindGateFrame';
import { getGateExpression } from './getGateExpression';
import { getGateRegistry } from './getGateRegistry';
import { isChildFrameGate } from './isChildFrameGate';
import { isOwnActiveGate } from './isOwnActiveGate';

/** Finite gate references of a subtree that is about to be changed, each with its bound frame. */
interface GateReadPlan {
  /**
   * Gate references in authored order. `suffix` locates the frame that introduced the condition
   * inside the subtree, relative to the entry path; undefined means the entry's edge transported
   * the condition in, so its frame is bound through the live owner at flush time.
   */
  occurrences: { gate: BlueprintGate; suffix: Optional<string> }[];
  /** Recursive templates keep eager publication before descendant changes. */
  isRecursive: boolean;
}

/** Introduced conditions are matched by authored identity, across declaration copies. */
const conditionKey = (gate: BlueprintGate): string =>
  gate.kind + '\u0000' + gate.schemaPath;

/**
 * Bind every gate reference of a template subtree to the frame that introduced its condition.
 * @param template - Template of the entry about to be selected
 * @returns Plan shared by every occurrence of the template
 */
const buildGateReadPlan = (template: BlueprintNode): GateReadPlan => {
  const plan: GateReadPlan = { occurrences: [], isRecursive: false };
  const ancestors = new Set<BlueprintNode>();
  const visit = (
    node: BlueprintNode,
    suffix: string,
    transported: ReadonlyMap<string, string>,
  ): void => {
    if (ancestors.has(node)) {
      plan.isRecursive = true;
      return;
    }
    ancestors.add(node);
    const frames = new Map(transported);
    const introduce = (gate: BlueprintGate): void => {
      for (const prerequisite of gate.appliesWhen ?? [])
        introduce(prerequisite);
      if (gate.hostPath === node.path) frames.set(conditionKey(gate), suffix);
    };
    const reference = (gate: BlueprintGate, childSuffix?: string): void => {
      for (const prerequisite of gate.appliesWhen ?? [])
        reference(prerequisite);
      plan.occurrences.push({
        gate,
        suffix: childSuffix ?? frames.get(conditionKey(gate)),
      });
    };
    for (const declaration of node.declarations)
      for (const gate of declaration.gates) introduce(gate);
    for (const entry of node.childEntries)
      for (const declaration of entry.declarations)
        for (const gate of declaration.gates) introduce(gate);
    for (const declaration of node.declarations)
      for (const gate of declaration.gates)
        reference(
          gate,
          isOwnActiveGate(gate.schemaPath, declaration.schemaPath)
            ? suffix
            : undefined,
        );
    for (const entry of node.childEntries) {
      const childSuffix = appendSegment(suffix, entry.name);
      for (const declaration of entry.declarations)
        for (const gate of declaration.gates)
          reference(
            gate,
            isChildFrameGate(gate, declaration) ? childSuffix : undefined,
          );
      visit(entry.node, childSuffix, frames);
    }
    for (const [index, item] of (node.prefixItems ?? []).entries())
      for (const candidate of node.prefixItemCandidates?.[index] ?? [item])
        visit(candidate, appendSegment(suffix, index), frames);
    for (const item of node.itemCandidates ?? (node.item ? [node.item] : []))
      visit(item, appendSegment(suffix, node.prefixItems?.length ?? 0), frames);
    ancestors.delete(node);
  };
  visit(template, $.Root, new Map());
  return plan;
};

/**
 * Bind a condition introduced outside the entry's subtree, through the live owner.
 * The entry's edge carries a copy of every condition it transports; a virtual group's edges
 * carry none of its constituents' conditions, so those bind in the owner's own frame.
 * @param owner - Live node selecting the entry
 * @param entry - Edge whose declarations carry the condition or one of its prerequisites
 * @param gate - Template reference of the transported condition
 * @returns Host frame address; throws `Missing gate transport` when neither the edge nor the
 * owner's frame carries the condition
 */
const bindTransported = <Self extends FieldNodeRecord<Self>>(
  owner: Self,
  entry: BlueprintChildEntry,
  gate: BlueprintGate,
): string => {
  const key = conditionKey(gate);
  for (const applied of entry.declarations)
    for (const carried of applied.gates) {
      if (conditionKey(carried) === key)
        return bindGateFrame(owner, carried, applied, entry.name).hostPath;
      const prerequisite = findPrerequisite(carried, key);
      if (prerequisite) return bindGateFrame(owner, prerequisite).hostPath;
    }
  return bindGateFrame(owner, gate).hostPath;
};

/** A prerequisite is evaluated in its consumer's frame, never in a child frame. */
const findPrerequisite = (
  gate: BlueprintGate,
  key: string,
): Optional<BlueprintGate> => {
  for (const prerequisite of gate.appliesWhen ?? [])
    if (conditionKey(prerequisite) === key) return prerequisite;
    else {
      const nested = findPrerequisite(prerequisite, key);
      if (nested) return nested;
    }
  return undefined;
};

/**
 * Publish read ancestors before an entry can mutate their in-progress subtree.
 * @param owner - Live node about to select the entry
 * @param entry - Edge about to be selected
 * @param context - Pending ancestor outputs and this tree's compiled gates
 * @returns Nothing; ancestor reads retain the preceding completed-entry value
 */
export const flushPendingGateReads = <Self extends FieldNodeRecord<Self>>(
  owner: Self,
  entry: BlueprintChildEntry,
  context: SettlementContext<Self>,
): void => {
  if (context.root.runtime.blueprint.capabilities.isBranchless) return;
  if (!context.pendingOutputs?.size) return;
  const template = entry.node;
  const path = appendSegment(owner.path, entry.name);
  let plan = getHostDerived<'readPlans', GateReadPlan>(template).readPlans;
  if (!plan) {
    plan = buildGateReadPlan(template);
    getHostDerived<'readPlans', GateReadPlan>(template).readPlans = plan;
  }
  if (plan.isRecursive) {
    for (const host of context.pendingOutputs)
      flushPendingOutput(host, context);
    return;
  }
  const flushRead = (read: string): void => {
    if (readPointerSegment(read, 0) === PointerOperator.Context) return;
    const local = read === path || isDescendantPath(read, path);
    for (const host of context.pendingOutputs ?? []) {
      // A read inside the entry walks the entry node that the host holds before its subtree gates run.
      if (local && host.source === undefined) continue;
      if (read === host.path) flushPendingOutput(host, context);
      else if (isDescendantPath(read, host.path)) {
        const name = readPointerSegment(read.slice(host.path.length + 1), 0);
        if (typeof name !== 'string') continue;
        if (
          host.source !== undefined ||
          !host.__childrenByName__ ||
          (host.behavior.type !== 'array' &&
          Object.getPrototypeOf(host.__childrenByName__) === null
            ? // structure values are always live nodes, so undefined means absent.
              host.__childrenByName__[name] === undefined
            : !hasOwnProperty(host.__childrenByName__, name))
        )
          flushPendingOutput(host, context);
      }
    }
  };
  const blueprint = context.root.runtime.blueprint;
  const registry = getGateRegistry(context.root.runtime);
  for (const { gate, suffix } of plan.occurrences) {
    const hostPath =
      suffix === undefined
        ? bindTransported(owner, entry, gate)
        : path + suffix;
    if (gate.kind !== 'active') flushRead(hostPath);
    else {
      const expression = getGateExpression(blueprint, gate.schemaPath);
      for (const dependency of expression?.dependencies ?? [])
        flushRead(registry.resolveRead(hostPath, dependency));
    }
  }
};
