import { EMPTY_ARRAY } from '@winglet/common-utils/constant';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Dictionary } from '@aileron/declare';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import { mergeEffectiveSchema } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { captureFieldNodeChange } from '../../../record';
import { FieldNodeWriteKind } from '../../../types/value';
import { getHostDerived } from '../../../utils/cache/derivedRecords';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { SettlementContext } from '../../types/settlement';
import { captureProjectionBaseline } from '../dependencies/captureProjectionBaseline';
import { getGateRegistry } from '../gates/getGateRegistry';
import { updatePendingExitIndex } from '../scratch/updatePendingExitIndex';
import { cloneFromSlot } from '../slots/cloneFromSlot';
import { createFromSlotOverlay } from '../slots/createFromSlotOverlay';
import { getSlotSource } from '../slots/getSlotSource';
import { applyDepartingSource } from '../source/applyDepartingSource';
import { isSameChildList } from '../structure/isSameChildList';
import { getDirectChildSelectionPlan } from './childSelection/getDirectChildSelectionPlan';
import { createStaticEntryReuser } from './childSelection/utils/createStaticEntryReuser';
import { prepareStaticHost } from './childSelection/utils/prepareStaticHost';
import { createChildNode } from './createChildNode';
import { enterFieldNode } from './enterFieldNode';
import { prepareFixedFirstHost } from './firstLoad/prepareFixedFirstHost';

/** Annotates the lazily created `presenceSelections`; an argument-less `new Map()` would be `Map<any, any>`. */
type PresenceSelections<Self> = Map<
  Self,
  {
    readonly childrenByName: Readonly<Dictionary<Self>>;
    readonly names: readonly string[];
  }
>;
/** Annotates the lazily created `preparedStaticPriorNames`; an argument-less `new Map()` would be `Map<any, any>`. */
type PreparedStaticPriorNames<Self> = Map<Self, readonly string[]>;

/** Empty active-declaration list: only ungated contributions apply. */
const NO_ACTIVE_DECLARATION_IDS: readonly number[] = EMPTY_ARRAY;

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
  prior: Dictionary<Self>,
  context: SettlementContext<Self>,
  hasRelocated = true,
): void => {
  if (context.fixedFirstLoad && prepareFixedFirstHost(node, context)) return;
  const prepared = prepareStaticHost(node, prior, context, hasRelocated);
  if (prepared) {
    const selections: PresenceSelections<Self> = (context.presenceSelections ??=
      new Map());
    selections.set(node, {
      childrenByName: prior,
      names: prepared.dynamicNames,
    });
    const names: PreparedStaticPriorNames<Self> =
      (context.preparedStaticPriorNames ??= new Map());
    names.set(node, prepared.dynamicNames);
    if (prepared.selectedChildrenByName === prior)
      prepared.selectedChildren = node.children ?? [];
    node.childrenByName = prepared.baseline;
    node.children = captureFieldNodeChange(
      node,
      'children',
      prepared.baselineChildren,
    );
    return;
  }
  const baseline: Dictionary<Self> = {};
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
      ? context.kind === FieldNodeWriteKind.Load
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
    if (baseline[entry.name]) continue;
    if (!direct) {
      let hasUngatedDeclaration = false;
      for (const declaration of entry.declarations)
        if (declaration.gates.length === 0) {
          hasUngatedDeclaration = true;
          break;
        }
      if (!hasUngatedDeclaration) continue;
    }
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
    const slotSource = retained?.instance;
    const slotOverlay = retained?.overlay;
    const child =
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
      applyDepartingSource(context, child);
    }
    if (context.hasGates) getGateRegistry(child.runtime).register(child);
    if (!priorChild && !pending) {
      context.enteredNodes.add(child);

      if (child.behavior.type === 'virtual') context.dirtyPaths.add(child.path);
      else
        enterFieldNode(
          node,
          child,
          entry,
          context,
          !!(slotSource || slotOverlay),
        );
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
    child.isActive = captureFieldNodeChange(child, 'isActive', true);
    child.isDetached = false;
    baseline[entry.name] = child;
  }
  node.childrenByName = baseline;
  const children = Object.values(baseline);
  const publishedChildren = node.children;
  node.children = captureFieldNodeChange(
    node,
    'children',
    isSameChildList(publishedChildren, children) ? publishedChildren : children,
  );
  if (context.fixedFirstLoad) prepareFixedFirstHost(node, context, true);
};
