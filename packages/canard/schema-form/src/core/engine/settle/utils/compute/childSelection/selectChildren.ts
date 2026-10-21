import { hasOwnProperty } from '@winglet/common-utils/lib';
import { escapeSegment } from '@winglet/json/pointer';

import { FormErrorCode, SchemaFormError } from '../../../../../../errors';
import { getItemEntries, mergeEffectiveSchema } from '../../../../blueprint';
import type { BlueprintChildEntry } from '../../../../blueprint';
import { captureFieldNodeChange } from '../../../../record';
import type { FieldNodeRecord } from '../../../../record';
import { getBlueprintNodeIdentity } from '../../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { SettlementContext } from '../../../types/settlement';
import { recordSettlementFailure } from '../../errors/recordSettlementFailure';
import { evaluateGate } from '../../gates/evaluateGate';
import { flushPendingGateReads } from '../../gates/flushPendingGateReads';
import { getGateRegistry } from '../../gates/getGateRegistry';
import { getChildDistribution } from '../../input/getChildDistribution';
import { hasDistributedChildInput } from '../../input/hasDistributedChildInput';
import { distributeLatentValue } from '../../latent/distributeLatentValue';
import { distributeMovedLatentInput } from '../../latent/distributeMovedLatentInput';
import { getLatentOrder } from '../../latentStore/getLatentOrder';
import { indexEnteredLatentKey } from '../../latentStore/indexEnteredLatentKey';
import { flushPendingOutput } from '../../output/flushPendingOutput';
import { isSameChildList } from '../../structure/isSameChildList';
import { createChildNode } from '../createChildNode';
import { enterFieldNode } from '../enterFieldNode';
import { hasRecursiveExpansion } from '../hasRecursiveExpansion';
import { canReuseArrayChildren } from './canReuseArrayChildren';
import {
  DIRECT_CHILD_SELECTION_PLANS,
  getDirectChildSelectionPlan,
} from './getDirectChildSelectionPlan';
import { readAdmittedEdgeSchema } from './readAdmittedEdgeSchema';
import { reuseArrayChildren } from './reuseArrayChildren';
import { staticIds } from './staticIds';
import { staticShape } from './staticShape';

/** Ungated declarations are included by the effective-schema merger itself. */
const NO_ACTIVE_IDS: readonly number[] = Object.freeze([]);
/** Rejected single-declaration positions share an empty selection. */
const NO_DECLARATIONS: BlueprintChildEntry['declarations'] = [];

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
    context.kind !== 'load' &&
    context.hasGates &&
    node.behavior.type === 'object'
      ? DIRECT_CHILD_SELECTION_PLANS.get(node.blueprintNode)
      : null;
  const direct =
    cached === undefined
      ? getDirectChildSelectionPlan(
          node.blueprintNode,
          node.runtime.blueprint,
          true,
        )
      : cached;
  const entries = direct
    ? node.blueprintNode.childEntries
    : node.behavior.declareChildren(node);
  const count = direct ? direct.steps.length : entries.length;
  const flushReads = immediate && !direct;
  for (let entryIndex = 0; entryIndex < count; entryIndex++) {
    const step = direct?.steps[entryIndex];
    const entry = step ? step.entry : entries[entryIndex];
    if (flushReads && context.pendingOutputs?.size)
      flushPendingGateReads(
        entry.node,
        node.path + '/' + escapeSegment(entry.name),
        context,
      );
    let threw = false;
    let declarations: BlueprintChildEntry['declarations'];
    let activeIds: readonly number[] | undefined;
    let fullyAdmitted = false;
    if (step) {
      const version = context.gateThrowVersion;
      const admitted = !step.gate || evaluateGate(step.gate, context, node);
      declarations = admitted ? entry.declarations : NO_DECLARATIONS;
      activeIds = admitted ? step.ids : NO_ACTIVE_IDS;
      threw = !admitted && context.gateThrowVersion !== version;
    } else if (context.hasGates) {
      // Allocated at the first rejected declaration; until then every one is admitted.
      let active: (typeof entry.declarations)[number][] | undefined;
      let ids: number[] | undefined;
      for (let index = 0; index < entry.declarations.length; index++) {
        const declaration = entry.declarations[index];
        const version = context.gateThrowVersion;
        let admitted = true;
        for (
          let gateIndex = 0;
          gateIndex < declaration.gates.length;
          gateIndex++
        ) {
          const gate = declaration.gates[gateIndex];
          if (
            !evaluateGate(
              gate,
              context,
              node,
              gate.schemaPath === declaration.schemaPath + '/controls/active'
                ? entry.name
                : undefined,
            )
          ) {
            admitted = false;
            break;
          }
        }
        if (admitted) {
          active?.push(declaration);
          ids?.push(declaration.id);
        } else {
          active ??= entry.declarations.slice(0, index);
          ids ??= active.map((kept) => kept.id);
          if (context.gateThrowVersion !== version) threw = true;
        }
      }
      fullyAdmitted = active === undefined;
      declarations = active ?? entry.declarations;
      activeIds = ids ?? staticIds(entry);
    } else declarations = entry.declarations;
    if (declarations.length === 0) {
      const priorChild = hasOwnProperty(prior, entry.name)
        ? prior[entry.name]
        : undefined;
      const exiting =
        priorChild?.blueprintNode === entry.node
          ? priorChild
          : !context.pendingExitPaths?.has(
                node.path + '/' + escapeSegment(entry.name),
              )
            ? undefined
            : context.pendingExits.get(
                JSON.stringify([
                  node.path + '/' + escapeSegment(entry.name),
                  getBlueprintNodeIdentity(entry.node),
                ]),
              );
      if (exiting) {
        if (threw) (context.throwingGateExits ??= new Set()).add(exiting);
        else context.throwingGateExits?.delete(exiting);
      }
      if (context.distributedInputs.has(node) || next[entry.name])
        inactiveEntries.push(entry);
      if (
        next[entry.name] &&
        !seen.has(entry.name) &&
        next[entry.name].blueprintNode === entry.node
      ) {
        delete next[entry.name];
        changed = true;
        if (immediate) {
          (context.pendingOutputs ??= new Set()).add(node);
        }
      }
      continue;
    }
    const retained = hasOwnProperty(prior, entry.name)
      ? prior[entry.name]
      : undefined;
    if (retained?.blueprintNode === entry.node)
      context.throwingGateExits?.delete(retained);
    if (seen.has(entry.name)) {
      if (seen.get(entry.name) !== entry.node) {
        recordSettlementFailure(
          context,
          new SchemaFormError(
            FormErrorCode.SharedNodeConflict,
            `Active declarations conflict at ${node.path}/${entry.name}`,
            { path: `${node.path}/${entry.name}` },
          ),
          'sharedConflict',
        );
      }
      continue;
    }
    seen.set(entry.name, entry.node);
    const priorChild =
      hasOwnProperty(prior, entry.name) &&
      prior[entry.name].blueprintNode === entry.node
        ? prior[entry.name]
        : undefined;
    if (!priorChild && context.hasGates)
      (context.presenceHosts ??= new Set()).add(node);
    const currentChild =
      next[entry.name]?.blueprintNode === entry.node
        ? next[entry.name]
        : undefined;
    const distribution = getChildDistribution(node, entry.name, context);
    const ownsInput =
      distribution &&
      hasDistributedChildInput(
        distribution.input,
        entry.name,
        node.behavior.type === 'array',
      );
    const latent = context.root.runtime.latentRaw;
    const latentKey =
      latent.size > 0 && !priorChild
        ? JSON.stringify([
            node.path + '/' + escapeSegment(entry.name),
            getBlueprintNodeIdentity(entry.node),
          ])
        : undefined;
    const input = ownsInput
      ? Reflect.get(distribution.input, entry.name)
      : distribution?.whole
        ? undefined
        : latentKey !== undefined && latent.has(latentKey)
          ? latent.get(latentKey)
          : undefined;
    if (
      !priorChild &&
      !currentChild &&
      hasRecursiveExpansion(node, entry.node, input, context)
    ) {
      if (!context.exceededBudget) {
        recordSettlementFailure(
          context,
          new SchemaFormError(
            FormErrorCode.RecursiveShapeDiverged,
            `Recursive shape diverged at ${node.path}/${entry.name}`,
            { path: `${node.path}/${entry.name}` },
          ),
          'budget',
        );
        context.exceededBudget = 'recursion';
      }
      continue;
    }
    const key =
      context.pendingExits.size > 0
        ? JSON.stringify([
            node.path + '/' + escapeSegment(entry.name),
            getBlueprintNodeIdentity(entry.node),
          ])
        : undefined;
    const pending =
      key === undefined ? undefined : context.pendingExits.get(key);
    const child =
      currentChild ?? priorChild ?? pending ?? createChildNode(node, entry);
    context.perished.delete(child);
    if (key !== undefined && context.pendingExits.delete(key)) {
      const path = node.path + '/' + escapeSegment(entry.name);
      const count = context.pendingExitPaths?.get(path) ?? 0;
      if (count > 1) context.pendingExitPaths!.set(path, count - 1);
      else context.pendingExitPaths?.delete(path);
    }
    if (pending && child === pending) {
      context.revived.add(child);
      indexEnteredLatentKey(context, child);
    }
    if (context.hasGates) getGateRegistry(child.runtime).register(child);
    let entryChanged = false;
    if (!priorChild && !currentChild && !pending) {
      context.entered.add(child);
      indexEnteredLatentKey(context, child);
      if (child.behavior.type === 'virtual') context.dirtyPaths.add(child.path);
      else enterFieldNode(node, child, entry.name, context);
      if (child.behavior.strategy === 'branch')
        context.shapeDirtyPaths.add(child.path);
      changed = true;
      entryChanged = true;
    }
    const ids = activeIds ?? staticIds(entry);
    if (context.selectedDeclarationIds.get(child) !== ids)
      context.selectedDeclarationIds.set(child, ids);
    const isAtomic = node.runtime.blueprint?.isAtomic;
    const admittedEdge = fullyAdmitted
      ? readAdmittedEdgeSchema(entry, child.blueprintNode, isAtomic)
      : undefined;
    const effective =
      admittedEdge?.schema ??
      mergeEffectiveSchema(
        child.blueprintNode,
        context.hasGates ? ids : NO_ACTIVE_IDS,
        { mode: 'runtime', isAtomic },
      );
    if (child.schema !== effective) {
      if (!context.originalSchemas.has(child.path))
        context.originalSchemas.set(child.path, child.schema);
      child.schema = captureFieldNodeChange(child, 'schema', effective);
      context.dirtyPaths.add(child.path);
      if (child.behavior.strategy === 'branch')
        context.shapeDirtyPaths.add(child.path);
      context.changedNodes.add(child);
      changed = true;
      entryChanged = true;
    }
    if (admittedEdge ? admittedEdge.conflict : effective.typeConflict) {
      recordSettlementFailure(
        context,
        new SchemaFormError(
          FormErrorCode.SharedNodeConflict,
          `Active declarations conflict at ${child.path}`,
          { path: child.path },
        ),
        'sharedConflict',
      );
    }
    child.active = captureFieldNodeChange(child, 'active', true);
    child.detached = false;
    if (next[entry.name] !== child) {
      changed = true;
      entryChanged = true;
    }
    next[entry.name] = child;
    if (child.behavior.type === 'virtual') {
      context.dirtyPaths.add(child.path);
      context.shapeDirtyPaths.add(child.path);
    }
    if (context.dirtyPaths.has(child.path)) {
      computeChild(child);
      entryChanged = true;
    }
    if (immediate && entryChanged) {
      (context.pendingOutputs ??= new Set()).add(node);
    }
  }
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
        if (!context.pendingExits.has(key)) {
          const paths = (context.pendingExitPaths ??= new Map());
          paths.set(child.path, (paths.get(child.path) ?? 0) + 1);
        }
        context.pendingExits.set(key, child);
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
