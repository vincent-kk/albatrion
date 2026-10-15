import { hasOwnProperty } from '@winglet/common-utils/lib';
import { escapeSegment } from '@winglet/json/pointer';

import { mergeEffectiveSchema } from '../../../blueprint';
import { captureFieldNodeChange } from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getGateRegistry } from '../gates/getGateRegistry';
import { indexEnteredLatentKey } from '../latentStore/indexEnteredLatentKey';
import { isSameChildList } from '../structure/isSameChildList';
import {
  DIRECT_CHILD_SELECTION_PLANS,
  getDirectChildSelectionPlan,
} from './childSelection/getDirectChildSelectionPlan';
import { createChildNode } from './createChildNode';
import { enterFieldNode } from './enterFieldNode';

/** Empty active-declaration list: only ungated contributions apply. */
const NO_ACTIVE_DECLARATION_IDS: readonly number[] = Object.freeze([]);

/**
 * Start a gate wheel with only ungated children and their static overlays.
 * @param node - Branch host starting one bounded calculation wheel
 * @param prior - Previous committed shape retained for identity reuse
 * @param context - Current write and its record factory
 * @returns Nothing; the host now exposes the fixed baseline shape
 */
export const primeHost = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  prior: Record<string, Self>,
  context: SettlementContext<Self>,
): void => {
  const baseline: Record<string, Self> = {};
  Object.setPrototypeOf(baseline, null);
  const cached =
    context.kind !== 'load' && node.behavior.type === 'object'
      ? DIRECT_CHILD_SELECTION_PLANS.get(node.blueprintNode)
      : null;
  const direct =
    cached === undefined
      ? getDirectChildSelectionPlan(
          node.blueprintNode,
          node.runtime.blueprint,
          false,
        )
      : cached;
  const entries = direct?.baseline ?? node.behavior.declareChildren(node);
  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index];
    if (
      baseline[entry.name] ||
      (!direct &&
        !entry.declarations.some(
          (declaration) => declaration.gates.length === 0,
        ))
    )
      continue;
    const priorChild = hasOwnProperty(prior, entry.name)
      ? prior[entry.name]
      : undefined;
    const key =
      context.pendingExits.size === 0
        ? undefined
        : JSON.stringify([
            node.path + '/' + escapeSegment(entry.name),
            entry.node.kind,
          ]);
    const pending =
      key === undefined ? undefined : context.pendingExits.get(key);
    const child = priorChild ?? pending ?? createChildNode(node, entry);
    context.perished.delete(child);
    if (key !== undefined) context.pendingExits.delete(key);
    if (pending && child === pending) {
      context.revived.add(child);
      indexEnteredLatentKey(context, child);
    }
    if (context.hasGates) getGateRegistry(child.runtime).register(child);
    if (!priorChild && !pending) {
      context.entered.add(child);
      indexEnteredLatentKey(context, child);
      if (child.behavior.type === 'virtual') context.dirtyPaths.add(child.path);
      else enterFieldNode(node, child, entry.name, context);
      if (child.behavior.strategy === 'branch')
        context.shapeDirtyPaths.add(child.path);
    }
    const schema = mergeEffectiveSchema(
      child.blueprintNode,
      NO_ACTIVE_DECLARATION_IDS,
      {
        mode: 'runtime',
        isAtomic: node.runtime.blueprint?.isAtomic,
      },
    );
    if (child.schema !== schema) {
      if (!context.originalSchemas.has(child.path))
        context.originalSchemas.set(child.path, child.schema);
      child.schema = captureFieldNodeChange(child, 'schema', schema);
      context.dirtyPaths.add(child.path);
      context.changedNodes.add(child);
    }
    child.active = captureFieldNodeChange(child, 'active', true);
    child.detached = false;
    baseline[entry.name] = child;
  }
  node.structure = baseline;
  const children = Object.values(baseline);
  const published = node.children;
  node.children = captureFieldNodeChange(
    node,
    'children',
    isSameChildList(published, children) ? published : children,
  );
};
