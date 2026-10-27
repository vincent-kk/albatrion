import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import { visitFieldNodes } from '../../../navigation';
import { captureFieldNodeChange } from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import { getCommittedDeclarationKey } from '../../../utils/controls/getCommittedDeclarationKey';
import type { SettlementContext } from '../../types/settlement';
import { captureDetachedFieldNodeReads } from '../detached/captureDetachedFieldNodeReads';
import { getGateRegistry } from '../gates/getGateRegistry';
import { getLatentOrder } from '../latentStore/getLatentOrder';
import { updateOutput } from '../output/updateOutput';
import { applyExitClearing } from './applyExitClearing';
import { captureExitedRaw } from './captureExitedRaw';
import { captureLatentDescendants } from './captureLatentDescendants';
import { finalizePerished } from './finalizePerished';
import { isRekeyedDestination } from './utils/isRekeyedDestination';
import { withdrawDetachedFills } from './withdrawDetachedFills';
import { writeLatentRaw } from './writeLatentRaw';

/**
 * Decide exits only against the settled final shape, including Source B.
 * @param context - One call's temporarily absent occurrences
 * @returns Nothing; departing references retain their previous commit reads
 */
export const finalizeExits = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  finalizePerished(context);
  let misfitIndex: Map<string, Set<string>> | undefined;
  for (const node of context.pendingExits.values()) {
    if (node.detached) continue;
    const parent = node.parent;
    if (parent?.structure?.[node.name] === node) continue;
    context.exited.add(node);
    const rekeyed =
      context.rekeyedArrayMoves &&
      isRekeyedDestination(node, context.rekeyedArrayMoves);
    visitFieldNodes(
      node,
      (departing) => {
        if (!departing.runtime.detachedReads?.has(departing))
          captureDetachedFieldNodeReads(departing, {
            emit: context.previousEmit,
            context: context.previousContext,
            schema:
              context.originalSchemas.get(departing.path)?.schema ??
              departing.schema.schema,
          });
        if (rekeyed) departing.runtime.misfitPaths.delete(departing.path);
        departing.detached = true;
        departing.active = captureFieldNodeChange(departing, 'active', false);
      },
      { owned: true },
    );
    getGateRegistry(node.runtime).remove(node);
    if (rekeyed) continue;
    if (!misfitIndex) {
      misfitIndex = new Map();
      for (const path of context.root.runtime.misfitPaths) {
        let ancestor = path;
        while (true) {
          let paths = misfitIndex.get(ancestor);
          if (!paths) {
            paths = new Set();
            misfitIndex.set(ancestor, paths);
          }
          paths.add(path);
          if (!ancestor) break;
          ancestor = ancestor.slice(0, ancestor.lastIndexOf($.Separator));
        }
      }
    }
    for (const path of [...(misfitIndex.get(node.path) ?? [])]) {
      context.root.runtime.misfitPaths.delete(path);
      let ancestor = path;
      while (true) {
        misfitIndex.get(ancestor)?.delete(path);
        if (!ancestor) break;
        ancestor = ancestor.slice(0, ancestor.lastIndexOf($.Separator));
      }
    }
  }
  withdrawDetachedFills(context);
  const scope = context.kind === 'load' ? context.loadScope : undefined;
  const inLoadScope = (node: Self): boolean =>
    scope !== undefined &&
    (!scope.path ||
      node.path === scope.path ||
      node.path.startsWith(scope.path + '/'));
  const applyPolicy =
    !context.suppressAutomaticWrites && !context.exceededBudget;
  if (applyPolicy)
    applyExitClearing(
      context,
      (node) =>
        inLoadScope(node) || context.throwingGateExits?.has(node) === true,
    );
  for (const node of context.exited)
    if (
      !inLoadScope(node) &&
      node.detached &&
      (context.entered.has(node) ||
        !applyPolicy ||
        context.throwingGateExits?.has(node))
    ) {
      const ownsLatent = captureExitedRaw(
        node,
        false,
        context,
        false,
        getLatentOrder(node.parent, node.name, node.blueprintNode),
      );
      if (ownsLatent)
        captureLatentDescendants(context, node, false, false, ownsLatent);
    }
  if (context.root.runtime.latentRaw.size > 0)
    for (const node of [...context.entered, ...context.revived]) {
      if (node.detached) continue;
      let live = true;
      for (
        let current: Self | null = node;
        current?.parent;
        current = current.parent
      )
        if (current.parent.structure?.[current.name] !== current) {
          live = false;
          break;
        }
      if (live)
        writeLatentRaw(
          context,
          getCommittedDeclarationKey(node, node.runtime),
          false,
          undefined,
        );
    }
  const affectedAncestors = new Set<Self>();
  for (const node of context.exited)
    for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent)
      if (!ancestor.detached) affectedAncestors.add(ancestor);
  for (const ancestor of [...affectedAncestors].sort(
    (left, right) => right.path.length - left.path.length,
  ))
    updateOutput(ancestor, context);
};
