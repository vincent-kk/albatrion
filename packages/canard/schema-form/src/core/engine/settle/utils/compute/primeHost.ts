import { hasOwnProperty } from '@winglet/common-utils/lib';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import { mergeEffectiveSchema } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { captureFieldNodeChange } from '../../../record';
import { getHostDerived } from '../../../utils/cache/derivedRecords';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { SettlementContext } from '../../types/settlement';
import { captureProjectionBaseline } from '../dependencies/captureProjectionBaseline';
import { getGateRegistry } from '../gates/getGateRegistry';
import { updatePendingExitIndex } from '../scratch/updatePendingExitIndex';
import { cloneFromSlot } from '../slots/cloneFromSlot';
import { createFromSlotOverlay } from '../slots/createFromSlotOverlay';
import { enterSlotClone } from '../slots/enterSlotClone';
import { getSlotSource } from '../slots/getSlotSource';
import { isSameChildList } from '../structure/isSameChildList';
import { getDirectChildSelectionPlan } from './childSelection/getDirectChildSelectionPlan';
import { createStaticEntryReuser } from './childSelection/utils/createStaticEntryReuser';
import { prepareStaticHost } from './childSelection/utils/prepareStaticHost';
import { createChildNode } from './createChildNode';
import { enterFieldNode } from './enterFieldNode';

/** Empty active-declaration list: only ungated contributions apply. */
const NO_ACTIVE_DECLARATION_IDS: readonly number[] = Object.freeze([]);

/**
 * Start a gate wheel with only ungated children and their static overlays.
 * @param node - Branch host starting one bounded calculation wheel
 * @param prior - Previous committed shape retained for identity reuse
 * @param context - Current write and its record factory
 * @param hasRelocated - Wheel's already collected relocation evidence
 * @returns Nothing; the host now exposes the fixed baseline shape
 */
export const primeHost = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  prior: Record<string, Self>,
  context: SettlementContext<Self>,
  hasRelocated = true,
): void => {
  const prepared = prepareStaticHost(node, prior, context, hasRelocated);
  if (prepared) {
    (context.presenceSelections ??= new Map()).set(node, {
      structure: prior,
      names: prepared.dynamicNames,
    });
    (context.preparedStaticPriorNames ??= new Map()).set(
      node,
      prepared.dynamicNames,
    );
    if (prepared.selectedStructure === prior)
      prepared.selectedChildren = node.children ?? [];
    node.structure = prepared.baseline;
    node.children = captureFieldNodeChange(
      node,
      'children',
      prepared.baselineChildren,
    );
    return;
  }
  const baseline: Record<string, Self> = {};
  Object.setPrototypeOf(baseline, null);
  const cached =
    node.behavior.type === 'object'
      ? getHostDerived<
          'directChildSelectionPlan',
          ReturnType<typeof getDirectChildSelectionPlan>
        >(node.blueprintNode).directChildSelectionPlan
      : null;
  const direct =
    cached === undefined
      ? context.kind === 'load'
        ? null
        : getDirectChildSelectionPlan(
            node.blueprintNode,
            node.runtime.blueprint,
            false,
          )
      : cached;
  const entries = direct?.baseline ?? node.behavior.declareChildren(node);
  const reuse = createStaticEntryReuser(
    node,
    prior,
    context,
    baseline,
    undefined,
    false,
    hasRelocated,
  );
  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index];
    if (
      baseline[entry.name] ||
      (!direct &&
        !(() => {
          const items = entry.declarations;
          for (let index = 0, count = items.length; index < count; index++) {
            if (!(index in items)) continue;
            const declaration = items[index];
            if (declaration.gates.length === 0) return true;
          }
          return false;
        })())
    )
      continue;
    if (reuse?.(entry)) continue;
    const priorChild = hasOwnProperty(prior, entry.name)
      ? prior[entry.name]
      : undefined;
    const key =
      context.pendingExits.size === 0
        ? undefined
        : JSON.stringify([
            appendSegment(node.path, entry.name),
            getBlueprintNodeIdentity(entry.node),
          ]);
    const pending =
      key === undefined ? undefined : context.pendingExits.get(key);
    const retained =
      !priorChild && !pending ? getSlotSource(node, entry) : undefined;
    const slotSource = retained?.source;
    const slotOverlay = retained?.overlay;
    const child =
      priorChild ??
      pending ??
      (slotSource
        ? cloneFromSlot(node, entry, slotSource, context)
        : slotOverlay
          ? createFromSlotOverlay(node, entry, slotOverlay, context)
          : createChildNode(node, entry));
    context.perished.delete(child);
    if (key !== undefined && context.pendingExits.delete(key)) {
      const path = appendSegment(node.path, entry.name);
      updatePendingExitIndex(context, path, -1);
    }
    if (pending && child === pending) {
      context.revived.add(child);
    }
    if (context.hasGates) getGateRegistry(child.runtime).register(child);
    if (!priorChild && !pending) {
      context.entered.add(child);

      if (child.behavior.type === 'virtual') context.dirtyPaths.add(child.path);
      else if (slotSource || slotOverlay)
        enterSlotClone(node, child, entry.name, context);
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
      captureProjectionBaseline(node, child, !!priorChild, context);
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
