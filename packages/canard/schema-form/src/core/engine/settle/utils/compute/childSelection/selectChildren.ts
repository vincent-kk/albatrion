import { hasOwnProperty } from '@winglet/common-utils/lib';
import { escapeSegment } from '@winglet/json/pointer';

import { getItemEntries } from '../../../../blueprint';
import type { BlueprintChildEntry } from '../../../../blueprint';
import { captureFieldNodeChange } from '../../../../record';
import type { FieldNodeRecord } from '../../../../record';
import { getBlueprintNodeIdentity } from '../../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { SettlementContext } from '../../../types/settlement';
import { getChildDistribution } from '../../input/getChildDistribution';
import { hasDistributedChildInput } from '../../input/hasDistributedChildInput';
import { distributeLatentValue } from '../../latent/distributeLatentValue';
import { distributeMovedLatentInput } from '../../latent/distributeMovedLatentInput';
import { getLatentOrder } from '../../latentStore/getLatentOrder';
import { flushPendingOutput } from '../../output/flushPendingOutput';
import { updatePendingExitIndex } from '../../scratch/updatePendingExitIndex';
import { isSameChildList } from '../../structure/isSameChildList';
import { canReuseArrayChildren } from './canReuseArrayChildren';
import { selectTableChildren } from './gateSelection/selectTableChildren';
import {
  DIRECT_CHILD_SELECTION_PLANS,
  getDirectChildSelectionPlan,
} from './getDirectChildSelectionPlan';
import { reuseArrayChildren } from './reuseArrayChildren';
import { selectEntryStep } from './selectEntryStep';
import type { ChildSelectionFrame } from './selectEntryStep';
import { staticShape } from './staticShape';

/**
 * Select all declared direct children in authored order for one host round.
 * Same-named blueprint nodes identify fold groups independently of retained live children.
 * @param node - Branch host whose behavior declares every candidate edge
 * @param context - Gate input, node factory, and deferred failure state
 * @param prior - Shape before the wheel's fixed ungated start
 * @param computeChild - Recursive descent used immediately after a gate change
 * @param immediate - Whether later gates must see each earlier projection
 * @returns Whether shape or effective schemas changed during this round
 */
export const selectChildren = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  prior: Record<string, Self>,
  computeChild: (child: Self) => void,
  immediate: boolean,
): boolean => {
  if (
    node.behavior.type === 'array' &&
    canReuseArrayChildren(node, context, prior)
  ) {
    reuseArrayChildren(node, context, prior, computeChild);
    return false;
  }
  if (!context.hasGates && node.behavior.type === 'object') {
    const shape = staticShape(
      node.blueprintNode,
      node.runtime.blueprint?.isAtomic,
    );
    const children = node.children;
    let matches = !!shape && !!children && children.length === shape.length;
    if (matches && shape && children)
      for (let index = 0; index < shape.length; index++) {
        const { entry, schema } = shape[index];
        const child = children[index];
        if (
          child.name !== entry.name ||
          child.blueprintNode !== entry.node ||
          child.schema !== schema ||
          !child.active ||
          child.detached ||
          node.structure?.[entry.name] !== child
        ) {
          matches = false;
          break;
        }
      }
    if (matches && shape && children) {
      for (let index = 0; index < shape.length; index++) {
        const child = children[index];
        if (context.selectedDeclarationIds.get(child) !== shape[index].ids)
          context.selectedDeclarationIds.set(child, shape[index].ids);
        if (context.dirtyPaths.has(child.path)) computeChild(child);
      }
      return false;
    }
  }
  if (node.behavior.type === 'virtual') {
    const before = node.children ?? [];
    const next: Record<string, Self> = Object.create(null);
    const children: Self[] = [];
    const fields = node.blueprintNode.fields;
    for (let index = 0; fields && index < fields.length; index++) {
      const field = fields[index];
      const sibling = node.parent?.structure?.[field];
      if (!sibling) continue;
      next[field] = sibling;
      children.push(sibling);
    }
    let changed = children.length !== before.length;
    for (let index = 0; !changed && index < children.length; index++)
      if (children[index] !== before[index]) changed = true;
    node.structure = next;
    node.children = captureFieldNodeChange(
      node,
      'children',
      changed ? children : before,
    );
    if (changed) {
      context.changedNodes.add(node);
      if (context.hasGates) (context.presenceHosts ??= new Set()).add(node);
    }
    return changed;
  }
  const before = node.children ?? [];
  const next: Record<string, Self> = { ...node.structure };
  Object.setPrototypeOf(next, null);
  if (node.behavior.type === 'array') {
    const names = Object.keys(next);
    for (let index = 0; index < names.length; index++) {
      const name = names[index];
      if (Number(name) >= node.itemCount) delete next[name];
    }
  }
  node.structure = next;
  const seen = new Map<string, BlueprintChildEntry['node']>();
  const inactiveEntries: BlueprintChildEntry[] = [];
  let changed = false;
  const cached =
    context.hasGates && node.behavior.type === 'object'
      ? DIRECT_CHILD_SELECTION_PLANS.get(node.blueprintNode)
      : null;
  const direct =
    cached === undefined
      ? context.kind === 'load'
        ? null
        : getDirectChildSelectionPlan(
            node.blueprintNode,
            node.runtime.blueprint,
            true,
          )
      : cached;
  const entries = direct
    ? node.blueprintNode.childEntries
    : node.behavior.declareChildren(node);
  const count = direct ? direct.steps.length : entries.length;
  const flushReads = immediate && (!direct || context.kind === 'load');
  const frame: ChildSelectionFrame<Self> = {
    node,
    context,
    prior,
    computeChild,
    immediate,
    next,
    seen,
    inactiveEntries,
    changed,
    flushReads,
  };
  const round = direct && context.gateSelectionRounds?.get(node);
  if (round?.active) selectTableChildren(frame, round);
  else
    for (let entryIndex = 0; entryIndex < count; entryIndex++) {
      const step = direct?.steps[entryIndex];
      const entry = step ? step.entry : entries[entryIndex];
      selectEntryStep(entry, step, frame);
    }
  changed = frame.changed;
  flushPendingOutput(node, context);
  for (let index = 0; index < inactiveEntries.length; index++) {
    const entry = inactiveEntries[index];
    if (
      next[entry.name] ||
      seen.has(entry.name) ||
      (context.kind !== 'load' && hasOwnProperty(prior, entry.name))
    )
      continue;
    seen.set(entry.name, entry.node);
    const distribution = getChildDistribution(node, entry.name, context);
    if (
      !distribution ||
      !hasDistributedChildInput(
        distribution.input,
        entry.name,
        node.behavior.type === 'array',
      )
    )
      continue;
    const path = node.path + '/' + escapeSegment(entry.name);
    if (distribution.preserveLatent) {
      distributeMovedLatentInput(
        context,
        path,
        entry.node,
        Reflect.get(distribution.input, entry.name),
        getLatentOrder(node, entry.name, entry.node),
      );
      continue;
    }
    distributeLatentValue(
      node.runtime,
      context,
      path,
      entry.node,
      Reflect.get(distribution.input, entry.name),
      getLatentOrder(node, entry.name, entry.node),
      distribution.whole,
      node.behavior.type === 'array'
        ? getItemEntries(node.blueprintNode, Number(entry.name))
        : node.blueprintNode.childEntries,
      distribution.automatic,
    );
  }
  const priorNames = Object.keys(prior);
  for (let index = 0; index < priorNames.length; index++) {
    const name = priorNames[index];
    const child = prior[name];
    if (next[name] !== child) {
      if (context.hasGates) (context.presenceHosts ??= new Set()).add(node);
      if (node.behavior.type === 'array' && Number(name) >= node.itemCount)
        context.perished.add(child);
      else {
        const key = JSON.stringify([
          child.path,
          getBlueprintNodeIdentity(child.blueprintNode),
        ]);
        const added = !context.pendingExits.has(key);
        context.pendingExits.set(key, child);
        if (added) updatePendingExitIndex(context, child.path, 1);
      }
    }
  }
  const nextChildren = Object.values(next);
  const published = node.children;
  const sameAsBefore = isSameChildList(before, nextChildren);
  if (!sameAsBefore) changed = true;
  node.children = captureFieldNodeChange(
    node,
    'children',
    published === before
      ? sameAsBefore
        ? before
        : nextChildren
      : isSameChildList(published, nextChildren)
        ? published
        : nextChildren,
  );
  if (changed) context.changedNodes.add(node);
  return changed;
};
