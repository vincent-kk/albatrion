import { captureSchemaNodeChange } from '../../../record';
import { mergeEffectiveSchema } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { getGateRegistry } from '../gates/getGateRegistry';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import { escapeSegment } from '@winglet/json/pointer';
import { enterSchemaNode } from './enterSchemaNode';
import { createChildNode } from './createChildNode';
import { indexEnteredLatentKey } from '../latent/indexEnteredLatentKey';
import {
  DIRECT_CHILD_SELECTION_PLANS, getDirectChildSelectionPlan,
} from './selectChildren/utils/getDirectChildSelectionPlan';

/**
 * Start a gate wheel with only ungated children and their static overlays.
 * @param node - Branch host starting one bounded calculation wheel
 * @param prior - Previous committed shape retained for identity reuse
 * @param context - Current write and its record factory
 * @returns Nothing; the host now exposes the fixed baseline shape
 */
export const primeHost = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
  prior: Record<string, Self>,
  context: SettlementContext<Self>,
): void => {
  const baseline: Record<string, Self> = {};
  Object.setPrototypeOf(baseline, null);
  const cached = context.kind !== 'load' && node.behavior.type === 'object'
    ? DIRECT_CHILD_SELECTION_PLANS.get(node.blueprintNode) : null;
  const direct = cached === undefined
    ? getDirectChildSelectionPlan(node.blueprintNode, node.runtime.blueprint, false) : cached;
  const entries = direct?.baseline ?? node.behavior.declareChildren(node);
  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index];
    if (baseline[entry.name] || (!direct && !entry.declarations.some((declaration) =>
      declaration.gates.length === 0))) continue;
    const priorChild = hasOwnProperty(prior, entry.name) ? prior[entry.name] : undefined;
    const key = JSON.stringify([
      `${node.path}/${escapeSegment(entry.name)}`, entry.node.kind,
    ]);
    const pending = context.pendingExits.get(key);
    const child = priorChild ?? pending ?? createChildNode(node, entry);
    context.perished.delete(child);
    context.pendingExits.delete(key);
    if (pending && child === pending) {
      context.revived.add(child);
      indexEnteredLatentKey(context, child);
    }
    if (context.hasGates) getGateRegistry(child.runtime).register(child);
    if (!priorChild && !pending) {
      context.entered.add(child);
      indexEnteredLatentKey(context, child);
      if (child.behavior.type === 'virtual') context.dirtyPaths.add(child.path);
      else enterSchemaNode(node, child, entry.name, context);
      if (child.behavior.strategy === 'branch')
        context.shapeDirtyPaths.add(child.path);
    }
    const schema = mergeEffectiveSchema(child.blueprintNode, [],
      { mode: 'runtime', isAtomic: node.runtime.blueprint?.isAtomic });
    if (child.schema !== schema) {
      if (!context.originalSchemas.has(child.path))
        context.originalSchemas.set(child.path, child.schema);
      child.schema = captureSchemaNodeChange(child, 'schema', schema);
      context.dirtyPaths.add(child.path);
      context.changedNodes.add(child);
    }
    child.active = captureSchemaNodeChange(child, 'active', true);
    child.detached = false;
    baseline[entry.name] = child;
  }
  node.structure = baseline;
  node.children = captureSchemaNodeChange(node, 'children', Object.values(baseline));
};
