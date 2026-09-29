import { SchemaFormError } from '../../../../errors';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import { escapeSegment } from '@winglet/json/pointer';
import { mergeEffectiveSchema } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { evaluateGate } from '../gates/evaluateGate';
import { SHARED_NODE_CONFLICT } from '../errors/settleErrorCode';
import { markWrite } from '../write/markWrite';
import { getGateRegistry } from '../gates/getGateRegistry';
import { hasSharedConflict } from './hasSharedConflict';
import { updateOutput } from './updateOutput';

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
  const before = node.children ?? [];
  const next: Record<string, Self> = { ...node.structure };
  Object.setPrototypeOf(next, null);
  node.structure = next;
  const seen = new Set<string>();
  let changed = false;
  for (const entry of node.behavior.declareChildren(node)) {
    const active = entry.declarations.filter((declaration) =>
      declaration.gates.every((gate) => evaluateGate(gate, context, node,
        gate.schemaPath === `${declaration.schemaPath}/controls/active`
          ? entry.name : undefined)));
    if (active.length === 0) {
      if (context.changedRaw.has(node.path) || next[entry.name]) {
        const source = node.raw;
        const ownsRaw = source !== null && typeof source === 'object' &&
          hasOwnProperty(source, entry.name);
        if (ownsRaw || context.root.runtime.latentRaw.size > 0) {
          const key = JSON.stringify([
            `${node.path}/${escapeSegment(entry.name)}`, entry.node.kind,
          ]);
          if (ownsRaw)
            context.root.runtime.latentRaw.set(key, Reflect.get(source, entry.name));
          else context.root.runtime.latentRaw.delete(key);
        }
      }
      if (next[entry.name] && !seen.has(entry.name)) {
        delete next[entry.name];
        changed = true;
        if (immediate) {
          node.children = Object.values(next);
          updateOutput(node, context);
        }
      }
      continue;
    }
    if (seen.has(entry.name)) {
      if (next[entry.name]?.blueprintNode.kind !== entry.node.kind && !context.failure) {
        context.failure = new SchemaFormError(SHARED_NODE_CONFLICT,
          `Active declarations conflict at ${node.path}/${entry.name}`,
          { path: `${node.path}/${entry.name}` });
        context.cause = 'sharedConflict';
      }
      continue;
    }
    seen.add(entry.name);
    const priorChild = hasOwnProperty(prior, entry.name) ? prior[entry.name] : undefined;
    const child = next[entry.name] ?? priorChild ??
      context.root.runtime.nodeFactory(entry, node, context.root.runtime);
    getGateRegistry(child.runtime).register(child);
    let entryChanged = false;
    if (!priorChild && !next[entry.name]) {
      const source = node.raw;
      const input = source !== null && typeof source === 'object' &&
        hasOwnProperty(source, entry.name) ? Reflect.get(source, entry.name) : undefined;
      markWrite(child, input, context);
      if (child.behavior.strategy === 'branch')
        context.shapeDirtyPaths.add(child.path);
      changed = true;
      entryChanged = true;
    }
    const ids = active.map((declaration) => declaration.id);
    const effective = mergeEffectiveSchema(child.blueprintNode, ids, { mode: 'runtime' });
    if (child.schema !== effective) {
      if (!context.originalSchemas.has(child.path))
        context.originalSchemas.set(child.path, child.schema);
      child.schema = effective;
      context.dirtyPaths.add(child.path);
      context.changedNodes.add(child);
      changed = true;
      entryChanged = true;
    }
    if ((effective.typeConflict || hasSharedConflict(entry, active)) && !context.failure) {
      context.failure = new SchemaFormError(SHARED_NODE_CONFLICT,
        `Active declarations conflict at ${child.path}`, { path: child.path });
      context.cause = 'sharedConflict';
    }
    child.active = true;
    child.detached = false;
    if (!priorChild && context.root.runtime.latentRaw.size > 0)
      context.root.runtime.latentRaw.delete(
      JSON.stringify([child.path, child.blueprintNode.kind]));
    if (next[entry.name] !== child) {
      changed = true;
      entryChanged = true;
    }
    next[entry.name] = child;
    if (context.dirtyPaths.has(child.path)) {
      computeChild(child);
      entryChanged = true;
    }
    if (immediate && entryChanged) {
      node.children = Object.values(next);
      updateOutput(node, context);
    }
  }
  for (const [name, child] of Object.entries(prior))
    if (!next[name]) {
      child.detached = true;
      child.active = false;
      getGateRegistry(child.runtime).remove(child);
      const key = JSON.stringify([child.path, child.blueprintNode.kind]);
      const source = node.raw;
      if (source !== null && typeof source === 'object' &&
        hasOwnProperty(source, name))
        context.root.runtime.latentRaw.set(key, child.raw);
      else context.root.runtime.latentRaw.delete(key);
      for (const path of [...context.root.runtime.typeMismatchPaths])
        if (path === child.path || path.startsWith(`${child.path}/`))
          context.root.runtime.typeMismatchPaths.delete(path);
      changed = true;
    }
  const nextChildren = Object.values(next);
  if (nextChildren.length !== before.length ||
    nextChildren.some((child, index) => child !== before[index]))
    changed = true;
  node.children = nextChildren;
  if (changed) context.changedNodes.add(node);
  return changed;
};
