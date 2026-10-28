import { resolvePointer } from '@/schema-form/helpers/jsonPointer';
import { isDescendantPath } from '@/schema-form/helpers/jsonPointer';

import { visitFieldNodes } from '../../../navigation';
import type { FieldNodeRecord } from '../../../record';
import { captureFieldNodeChange } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { captureDetachedFieldNodeReads } from '../detached/captureDetachedFieldNodeReads';
import { getGateRegistry } from '../gates/getGateRegistry';
import { applyInactiveValues } from '../inactive/applyInactiveValues';
import { resolveInactiveValue } from '../inactive/resolveInactiveValue';
import { updateOutput } from '../output/updateOutput';
import { finalizeRestoredSlotRaw } from '../slots/finalizeRestoredSlotRaw';
import { retainExitedSlot } from '../slots/retainExitedSlot';
import { finalizePerished } from './finalizePerished';
import { isRekeyedDestination } from './utils/isRekeyedDestination';
import { withdrawDetachedFills } from './withdrawDetachedFills';

/**
 * Decide exits only against the settled final shape, including Source B.
 * @param context - One call's temporarily absent occurrences
 * @returns Nothing; departing references retain their previous commit reads
 */
export const finalizeExits = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  const scope = context.kind === 'load' ? context.loadScope : undefined;
  const inLoadScope = (node: Self): boolean =>
    scope !== undefined &&
    (!scope.path ||
      node.path === scope.path ||
      isDescendantPath(node.path, scope.path));
  const applyPolicy =
    !context.suppressAutomaticWrites && !context.exceededBudget;
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
    const resolveExit = applyPolicy && !rekeyed && !inLoadScope(node) &&
      !context.entered.has(node) && !context.throwingGateExits?.has(node);
    visitFieldNodes(
      node,
      (departing) => {
        if (resolveExit && (departing.blueprintNode.hasInactiveValue || departing.runtime.inactiveListeners?.has(departing)))
          resolveInactiveValue(departing, node, context);
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
          ancestor = resolvePointer(ancestor, '..');
        }
      }
    }
    for (const path of [...(misfitIndex.get(node.path) ?? [])]) {
      context.root.runtime.misfitPaths.delete(path);
      let ancestor = path;
      while (true) {
        misfitIndex.get(ancestor)?.delete(path);
        if (!ancestor) break;
        ancestor = resolvePointer(ancestor, '..');
      }
    }
  }
  withdrawDetachedFills(context);
  for (const node of context.exited)
    if (!inLoadScope(node) && node.detached)
      retainExitedSlot(
        node,
        context,
        applyPolicy &&
          !context.entered.has(node) &&
          !context.throwingGateExits?.has(node),
      );
  applyInactiveValues(context);
  const affectedAncestors = new Set<Self>();
  finalizeRestoredSlotRaw(context);
  for (const node of context.exited)
    for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent)
      if (!ancestor.detached) affectedAncestors.add(ancestor);
  for (const ancestor of [...affectedAncestors].sort(
    (left, right) => right.path.length - left.path.length,
  ))
    updateOutput(ancestor, context);
};
