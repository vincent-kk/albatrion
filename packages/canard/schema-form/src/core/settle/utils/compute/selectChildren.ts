import { captureSchemaNodeChange } from '../../../record';
import { recordSettlementFailure } from '../errors/recordSettlementFailure';
import { SchemaFormError } from '../../../../errors';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import { escapeSegment } from '@winglet/json/pointer';
import { mergeEffectiveSchema } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { evaluateGate } from '../gates/evaluateGate';
import { SHARED_NODE_CONFLICT } from '../errors/settleErrorCode';
import { getGateRegistry } from '../gates/getGateRegistry';
import { hasSharedConflict } from './hasSharedConflict';
import { flushPendingOutput } from './flushPendingOutput';
import { flushPendingGateReads } from '../gates/flushPendingGateReads';
import { hasRecursiveExpansion } from './hasRecursiveExpansion';
import { RECURSIVE_SHAPE_DIVERGED } from '../errors/settleErrorCode';
import { getLatentOrder } from '../latent/getLatentOrder';
import { distributeLatentValue } from '../latent/distributeLatentValue';
import { enterSchemaNode } from './enterSchemaNode';
import { hasDistributedChildInput } from '../write/hasDistributedChildInput';
import { createChildNode } from './createChildNode';
import type { BlueprintChildEntry, BlueprintNode, EffectiveSchema } from '../../../blueprint';
import { indexEnteredLatentKey } from '../latent/indexEnteredLatentKey';

/** Ungated declarations are included by the effective-schema merger itself. */
const NO_ACTIVE_IDS: readonly number[] = Object.freeze([]);
/** Static selection IDs belong to the analyzed child edge. */
const STATIC_IDS = new WeakMap<BlueprintChildEntry, readonly number[]>();

/** Immutable, ungated object shapes shared by occurrences of one blueprint host. */
const STATIC_SHAPES = new WeakMap<BlueprintNode, readonly {
  entry: BlueprintChildEntry; ids: readonly number[]; schema: EffectiveSchema;
}[] | null>();

/** Return one stable active-ID list for an ungated child edge. */
const staticIds = (entry: BlueprintChildEntry): readonly number[] => {
  let ids = STATIC_IDS.get(entry);
  if (!ids) {
    ids = Object.freeze(entry.declarations.map((declaration) => declaration.id));
    STATIC_IDS.set(entry, ids);
  }
  return ids;
};

/** Memoize an unambiguous static host in the structure's property order. */
const staticShape = (host: BlueprintNode) => {
  if (STATIC_SHAPES.has(host)) return STATIC_SHAPES.get(host);
  const selected: Record<string, {
    entry: BlueprintChildEntry; ids: readonly number[]; schema: EffectiveSchema;
  }> = Object.create(null);
  for (const entry of host.childEntries) {
    const schema = mergeEffectiveSchema(entry.node, NO_ACTIVE_IDS, { mode: 'runtime' });
    if (hasOwnProperty(selected, entry.name) || entry.node.kind === 'virtual' ||
      !entry.declarations.length || schema.typeConflict ||
      entry.declarations.some((declaration) => declaration.gates.length > 0)) {
      STATIC_SHAPES.set(host, null);
      return null;
    }
    selected[entry.name] = { entry, ids: staticIds(entry), schema };
  }
  const shape = Object.values(selected);
  STATIC_SHAPES.set(host, shape);
  return shape;
};

/**
 * Select all declared direct children in authored order for one host round.
 * @param node - Branch host whose behavior declares every candidate edge
 * @param context - Gate input, node factory, and deferred failure state
 * @param prior - Shape before the wheel's fixed ungated start
 * @param computeChild - Recursive descent used immediately after a gate change
 * @param immediate - Whether later gates must see each earlier projection
 * @returns Whether shape or effective schemas changed during this round
 */
export const selectChildren = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  prior: Record<string, Self>,
  computeChild: (child: Self) => void,
  immediate: boolean,
): boolean => {
  if (!context.hasGates && node.behavior.type === 'object') {
    const shape = staticShape(node.blueprintNode);
    const children = node.children;
    if (shape && children && children.length === shape.length &&
      shape.every(({ entry, schema }, index) => {
        const child = children[index];
        return child.name === entry.name && child.blueprintNode === entry.node &&
          child.schema === schema && child.active && !child.detached &&
          node.structure?.[entry.name] === child;
      })) {
      for (let index = 0; index < shape.length; index++) {
        const child = children[index];
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
    for (const field of node.blueprintNode.fields ?? []) {
      const sibling = node.parent?.structure?.[field];
      if (!sibling) continue;
      next[field] = sibling;
      children.push(sibling);
    }
    const changed = children.length !== before.length ||
      children.some((child, index) => child !== before[index]);
    node.structure = next;
    node.children = captureSchemaNodeChange(node, 'children', changed ? children : before);
    if (changed) context.changedNodes.add(node);
    return changed;
  }
  const before = node.children ?? [];
  const next: Record<string, Self> = { ...node.structure };
  Object.setPrototypeOf(next, null);
  if (node.behavior.type === 'array')
    for (const name of Object.keys(next))
      if (Number(name) >= node.itemCount) delete next[name];
  node.structure = next;
  const seen = new Set<string>();
  const inactiveEntries: BlueprintChildEntry[] = [];
  let changed = false;
  for (const entry of node.behavior.declareChildren(node)) {
    if (immediate) flushPendingGateReads(entry.node,
      `${node.path}/${escapeSegment(entry.name)}`, context);
    let threw = false;
    const active = context.hasGates ? entry.declarations.filter((declaration) => {
      const version = context.gateThrowVersion;
      const admitted = declaration.gates.every((gate) => evaluateGate(gate, context,
        node, gate.schemaPath === `${declaration.schemaPath}/controls/active`
          ? entry.name : undefined));
      if (!admitted && context.gateThrowVersion !== version) threw = true;
      return admitted;
    }) : entry.declarations;
    if (active.length === 0) {
      const priorChild = hasOwnProperty(prior, entry.name)
        ? prior[entry.name] : undefined;
      const exiting = priorChild?.blueprintNode.kind === entry.node.kind
        ? priorChild : context.pendingExits.get(JSON.stringify([
          `${node.path}/${escapeSegment(entry.name)}`, entry.node.kind]));
      if (exiting) {
        if (threw) (context.throwingGateExits ??= new Set()).add(exiting);
        else context.throwingGateExits?.delete(exiting);
      }
      if (context.distributedInputs.has(node) ||
        next[entry.name]) inactiveEntries.push(entry);
      if (next[entry.name] && !seen.has(entry.name) &&
        next[entry.name].blueprintNode.kind === entry.node.kind) {
        delete next[entry.name];
        changed = true;
        if (immediate) {
          (context.pendingOutputs ??= new Set()).add(node);
        }
      }
      continue;
    }
    const retained = hasOwnProperty(prior, entry.name)
      ? prior[entry.name] : undefined;
    if (retained?.blueprintNode.kind === entry.node.kind)
      context.throwingGateExits?.delete(retained);
    if (seen.has(entry.name)) {
      if (next[entry.name]?.blueprintNode.kind !== entry.node.kind) {
        recordSettlementFailure(context, new SchemaFormError(SHARED_NODE_CONFLICT,
          `Active declarations conflict at ${node.path}/${entry.name}`,
          { path: `${node.path}/${entry.name}` }), 'sharedConflict');
      }
      continue;
    }
    seen.add(entry.name);
    const priorChild = hasOwnProperty(prior, entry.name) &&
      prior[entry.name].blueprintNode.kind === entry.node.kind
      ? prior[entry.name] : undefined;
    const currentChild = next[entry.name]?.blueprintNode.kind === entry.node.kind
      ? next[entry.name] : undefined;
    const distribution = context.distributedInputs.get(node);
    const ownsInput = distribution &&
      hasDistributedChildInput(distribution.input, entry.name,
        node.behavior.type === 'array');
    const latent = context.root.runtime.latentRaw;
    const latentKey = latent.size > 0 && !priorChild ? JSON.stringify([
      `${node.path}/${escapeSegment(entry.name)}`, entry.node.kind,
    ]) : undefined;
    const input = ownsInput ? Reflect.get(distribution.input, entry.name) :
      distribution?.whole ? undefined :
        latentKey !== undefined && latent.has(latentKey) ? latent.get(latentKey) : undefined;
    if (!priorChild && !currentChild &&
      hasRecursiveExpansion(node, entry.node, input, context)) {
      if (!context.exceededBudget) {
        recordSettlementFailure(context, new SchemaFormError(RECURSIVE_SHAPE_DIVERGED,
          `Recursive shape diverged at ${node.path}/${entry.name}`,
          { path: `${node.path}/${entry.name}` }), 'budget');
        context.exceededBudget = 'recursion';
      }
      continue;
    }
    const key = JSON.stringify([
      `${node.path}/${escapeSegment(entry.name)}`, entry.node.kind,
    ]);
    const pending = context.pendingExits.get(key);
    const child = currentChild ?? priorChild ?? pending ?? createChildNode(node, entry);
    context.perished.delete(child);
    context.pendingExits.delete(key);
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
      else enterSchemaNode(node, child, entry.name, context);
      if (child.behavior.strategy === 'branch')
        context.shapeDirtyPaths.add(child.path);
      changed = true;
      entryChanged = true;
    }
    const ids = context.hasGates ? active.map((declaration) => declaration.id) :
      staticIds(entry);
    context.selectedDeclarationIds.set(child, ids);
    const effective = mergeEffectiveSchema(child.blueprintNode,
      context.hasGates ? ids : NO_ACTIVE_IDS, { mode: 'runtime' });
    if (child.schema !== effective) {
      if (!context.originalSchemas.has(child.path))
        context.originalSchemas.set(child.path, child.schema);
      child.schema = captureSchemaNodeChange(child, 'schema', effective);
      context.dirtyPaths.add(child.path);
      if (child.behavior.strategy === 'branch')
        context.shapeDirtyPaths.add(child.path);
      context.changedNodes.add(child);
      changed = true;
      entryChanged = true;
    }
    if ((effective.typeConflict || hasSharedConflict(entry, active))) {
      recordSettlementFailure(context, new SchemaFormError(SHARED_NODE_CONFLICT,
        `Active declarations conflict at ${child.path}`, { path: child.path }), 'sharedConflict');
    }
    child.active = captureSchemaNodeChange(child, 'active', true);
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
  for (const entry of inactiveEntries) {
    if (next[entry.name] || seen.has(entry.name) ||
      (context.kind !== 'load' && hasOwnProperty(prior, entry.name))) continue;
    seen.add(entry.name);
    const distribution = context.distributedInputs.get(node);
    if (!distribution ||
      !hasDistributedChildInput(distribution.input, entry.name,
        node.behavior.type === 'array')) continue;
    distributeLatentValue(node.runtime, context,
      `${node.path}/${escapeSegment(entry.name)}`, entry.node,
      Reflect.get(distribution.input, entry.name),
      getLatentOrder(node, entry.name, entry.node), distribution.whole,
      node.blueprintNode.childEntries, distribution.automatic);
  }
  for (const [name, child] of Object.entries(prior))
    if (next[name] !== child) {
      if (node.behavior.type === 'array' && Number(name) >= node.itemCount)
        context.perished.add(child);
      else {
        const key = JSON.stringify([child.path, child.blueprintNode.kind]);
        context.pendingExits.set(key, child);
      }
    }
  const nextChildren = Object.values(next);
  if (nextChildren.length !== before.length ||
    nextChildren.some((child, index) => child !== before[index]))
    changed = true;
  node.children = captureSchemaNodeChange(node, 'children', nextChildren);
  if (changed) context.changedNodes.add(node);
  return changed;
};
