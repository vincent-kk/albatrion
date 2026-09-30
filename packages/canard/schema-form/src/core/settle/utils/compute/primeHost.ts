import { mergeEffectiveSchema } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { markWrite } from '../write/markWrite';
import { getGateRegistry } from '../gates/getGateRegistry';
import { readHostInput } from './readHostInput';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import { escapeSegment } from '@winglet/json/pointer';

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
  for (const entry of node.behavior.declareChildren(node)) {
    if (baseline[entry.name] || !entry.declarations.some((declaration) =>
      declaration.gates.length === 0)) continue;
    const priorChild = hasOwnProperty(prior, entry.name) ? prior[entry.name] : undefined;
    const key = JSON.stringify([
      `${node.path}/${escapeSegment(entry.name)}`, entry.node.kind,
    ]);
    const pending = context.pendingExits.get(key);
    const child = priorChild ?? pending ??
      context.root.runtime.nodeFactory(entry, node, context.root.runtime);
    context.pendingExits.delete(key);
    if (context.hasGates) getGateRegistry(child.runtime).register(child);
    if (!priorChild && !pending) {
      context.entered.add(child);
      const source = readHostInput(node, context);
      const sourceInput = source !== null && typeof source === 'object' &&
        hasOwnProperty(source, entry.name) ? Reflect.get(source, entry.name) : undefined;
      const latentKey = JSON.stringify([
        `${node.path}/${escapeSegment(entry.name)}`, entry.node.kind,
      ]);
      const input = node.runtime.latentRaw.has(latentKey)
        ? node.runtime.latentRaw.get(latentKey) : sourceInput;
      markWrite(child, input, context);
      if (child.behavior.strategy === 'branch')
        context.shapeDirtyPaths.add(child.path);
    }
    const schema = mergeEffectiveSchema(child.blueprintNode, [], { mode: 'runtime' });
    if (child.schema !== schema) {
      if (!context.originalSchemas.has(child.path))
        context.originalSchemas.set(child.path, child.schema);
      child.schema = schema;
      context.dirtyPaths.add(child.path);
      context.changedNodes.add(child);
    }
    child.active = true;
    child.detached = false;
    baseline[entry.name] = child;
  }
  node.structure = baseline;
  node.children = Object.values(baseline);
};
