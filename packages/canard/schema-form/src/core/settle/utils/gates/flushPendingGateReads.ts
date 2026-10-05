import { hasOwnProperty } from '@winglet/common-utils/lib';
import { escapeSegment, unescapeSegment } from '@winglet/json/pointer';
import type { BlueprintGate, BlueprintNode } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { flushPendingOutput } from '../compute/flushPendingOutput';
import { resolveDependencyPath } from '../paths/resolveDependencyPath';
import { getGateExpression } from './getGateExpression';
import { bindGateHostPath } from './bindGateHostPath';

/** Finite gate occurrences relative to a subtree that is about to be changed. */
interface GateReadPlan {
  /** Template owner and live suffix used by the regular occurrence resolver. */
  occurrences: { gate: BlueprintGate; node: BlueprintNode;
    suffix: string; childSuffix?: string }[];
  /** Recursive templates keep eager publication before descendant changes. */
  recursive: boolean;
}

/** Templates share their read plan across array items and settlement calls. */
const READ_PLANS = new WeakMap<BlueprintNode, GateReadPlan>();

/**
 * Publish read ancestors before an entry can mutate their in-progress subtree.
 * @param template - Template of the entry about to be selected
 * @param path - Entry's bound data path, including actual outer array indices
 * @param context - Pending ancestor outputs and this tree's compiled gates
 * @returns Nothing; ancestor reads retain the preceding completed-entry value
 */
export const flushPendingGateReads = <Self extends SchemaNodeRecord<Self>>(
  template: BlueprintNode,
  path: string,
  context: SettlementContext<Self>,
): void => {
  if (context.root.runtime.blueprint.capabilities.branchless) return;
  if (!context.pendingOutputs?.size) return;
  let plan = READ_PLANS.get(template);
  if (!plan) {
    const built: GateReadPlan = { occurrences: [], recursive: false };
    const ancestors = new Set<BlueprintNode>();
    const visit = (node: BlueprintNode, suffix: string): void => {
      if (ancestors.has(node)) {
        built.recursive = true;
        return;
      }
      ancestors.add(node);
      for (const declaration of node.declarations)
        for (const gate of declaration.gates)
          built.occurrences.push({ gate, node, suffix,
            childSuffix: gate.schemaPath === `${node.schemaPath}/controls/active`
              ? suffix : undefined });
      for (const entry of node.childEntries) {
        const childSuffix = `${suffix}/${escapeSegment(entry.name)}`;
        for (const declaration of entry.declarations)
          for (const gate of declaration.gates)
            built.occurrences.push({ gate, node, suffix,
              childSuffix: gate.schemaPath === `${declaration.schemaPath}/controls/active`
                ? childSuffix : undefined });
        visit(entry.node, childSuffix);
      }
      for (const [index, item] of (node.prefixItems ?? []).entries())
        visit(item, `${suffix}/${index}`);
      if (node.item) visit(node.item, `${suffix}/${node.prefixItems?.length ?? 0}`);
      ancestors.delete(node);
    };
    visit(template, '');
    plan = built;
    READ_PLANS.set(template, plan);
  }
  if (plan.recursive) {
    for (const host of context.pendingOutputs) flushPendingOutput(host, context);
    return;
  }
  const flushRead = (read: string): void => {
    if (read === '@') return;
    const local = read === path || read.startsWith(`${path}/`);
    for (const host of context.pendingOutputs ?? []) {
      // A read inside the entry walks the entry node that the host holds before its subtree gates run.
      if (local && host.raw === undefined) continue;
      if (read === host.path) flushPendingOutput(host, context);
      else if (read.startsWith(`${host.path}/`)) {
        const name = unescapeSegment(read.slice(host.path.length + 1).split('/')[0]);
        if (host.raw !== undefined || !host.structure ||
          !hasOwnProperty(host.structure, name)) flushPendingOutput(host, context);
      }
    }
  };
  const blueprint = context.root.runtime.blueprint;
  const flushGate = (gate: BlueprintGate, node: BlueprintNode,
    occurrencePath: string, childHostPath?: string): void => {
    for (const parent of gate.appliesWhen ?? []) flushGate(parent, node, occurrencePath);
    const hostPath = bindGateHostPath(gate, node.path,
      occurrencePath, childHostPath);
    if (gate.kind !== 'active') flushRead(hostPath);
    else {
      const expression = getGateExpression(blueprint, gate.schemaPath);
      for (const dependency of expression?.dependencies ?? [])
        flushRead(resolveDependencyPath(hostPath, dependency));
    }
  };
  for (const occurrence of plan.occurrences) {
    flushGate(occurrence.gate, occurrence.node,
      `${path}${occurrence.suffix}`, occurrence.childSuffix === undefined
        ? undefined : `${path}${occurrence.childSuffix}`);
  }
};
