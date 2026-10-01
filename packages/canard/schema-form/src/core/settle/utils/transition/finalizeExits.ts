import { walkOwnedSchemaNodes } from '../walkOwnedSchemaNodes';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { updateOutput } from '../compute/updateOutput';
import { captureDetachedSchemaNodeReads } from '../detached/captureDetachedSchemaNodeReads';
import { getGateRegistry } from '../gates/getGateRegistry';
import { applyExitClearing } from './applyExitClearing';
import { withdrawDetachedFills } from './withdrawDetachedFills';
import { captureExitedRaw } from './captureExitedRaw';
import { getLatentOrder } from '../latent/getLatentOrder';
import { writeLatentRaw } from './writeLatentRaw';
import { finalizePerished } from './finalizePerished';

/**
 * Decide exits only against the settled final shape, including Source B.
 * @param context - One call's temporarily absent occurrences
 * @returns Nothing; departing references retain their previous commit reads
 */
export const finalizeExits = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  finalizePerished(context);
  let mismatchIndex: Map<string, Set<string>> | undefined;
  for (const node of context.pendingExits.values()) {
    if (node.detached) continue;
    const parent = node.parent;
    if (parent?.structure?.[node.name] === node) continue;
    context.exited.add(node);
    walkOwnedSchemaNodes(node, (departing) => {
      if (!departing.runtime.detachedReads?.has(departing))
        captureDetachedSchemaNodeReads(departing, {
          emit: context.previousEmit,
          context: context.previousContext,
          schema: context.originalSchemas.get(departing.path)?.schema ??
            departing.schema.schema,
        });
      departing.detached = true;
      departing.active = false;
    });
    getGateRegistry(node.runtime).remove(node);
    if (!mismatchIndex) {
      mismatchIndex = new Map();
      for (const path of context.root.runtime.typeMismatchPaths) {
        let ancestor = path;
        while (true) {
          let paths = mismatchIndex.get(ancestor);
          if (!paths) {
            paths = new Set();
            mismatchIndex.set(ancestor, paths);
          }
          paths.add(path);
          if (!ancestor) break;
          ancestor = ancestor.slice(0, ancestor.lastIndexOf('/'));
        }
      }
    }
    for (const path of [...mismatchIndex.get(node.path) ?? []]) {
      context.root.runtime.typeMismatchPaths.delete(path);
      let ancestor = path;
      while (true) {
        mismatchIndex.get(ancestor)?.delete(path);
        if (!ancestor) break;
        ancestor = ancestor.slice(0, ancestor.lastIndexOf('/'));
      }
    }
  }
  withdrawDetachedFills(context);
  const scope = context.kind === 'load' ? context.loadScope : undefined;
  const inLoadScope = (node: Self): boolean => scope !== undefined &&
    (!scope.path || node.path === scope.path || node.path.startsWith(`${scope.path}/`));
  const applyPolicy = !context.suppressAutomaticWrites && context.cause !== 'budget';
  if (applyPolicy) applyExitClearing(context, (node) =>
    inLoadScope(node) || context.throwingGateExits?.has(node) === true);
  for (const node of context.exited)
    if (!inLoadScope(node) && node.detached &&
      (context.entered.has(node) || !applyPolicy ||
        context.throwingGateExits?.has(node)))
      captureExitedRaw(node, false, context, false,
        getLatentOrder(node.parent, node.name, node.blueprintNode));
  if (context.root.runtime.latentRaw.size > 0)
    for (const node of [...context.entered, ...context.revived]) {
      if (node.detached) continue;
      let live = true;
      for (let current: Self | null = node; current?.parent; current = current.parent)
        if (current.parent.structure?.[current.name] !== current) {
          live = false;
          break;
        }
      if (live) writeLatentRaw(context,
        JSON.stringify([node.path, node.blueprintNode.kind]), false, undefined);
    }
  const affectedAncestors = new Set<Self>();
  for (const node of context.exited)
    for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent)
      if (!ancestor.detached) affectedAncestors.add(ancestor);
  for (const ancestor of [...affectedAncestors].sort((left, right) =>
    right.path.length - left.path.length)) updateOutput(ancestor, context);
};
