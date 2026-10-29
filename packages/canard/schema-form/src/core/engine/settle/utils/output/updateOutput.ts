import { isArray } from '@winglet/common-utils/filter';

import { FieldNodeEventType, captureFieldNodeChange } from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import { sameValue } from '../../../utils/compute/sameValue';
import type { SettlementContext } from '../../types/settlement';
import { keepsChildEmissions } from './utils/keepsChildEmissions';

/**
 * Assemble and project a node once from its current child order.
 * For the host of a still-valid append proof it passes the appended position to the row and records the first appended assembly in `arrayAppend.assembled`;
 * for the host of a still-valid pop proof it passes the remaining item count and records the first truncated assembly in `arrayPop.assembled`.
 * @param node - Live node whose row owns assembly and projection
 * @param context - Current commit's changed-node set and the optional `arrayAppend` and `arrayPop` proofs it reads
 * @param recalculated - Direct children recomputed with an unchanged host shape
 * @returns Whether either calculated value changed
 */

export const updateOutput = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  recalculated?: readonly Self[],
): boolean => {
  context.pendingOutputs?.delete(node);
  const host =
    (node.behavior.type === 'array' || node.behavior.type === 'object') &&
    node.behavior.strategy === 'branch';
  const append = context.arrayAppend;
  const appending =
    append !== undefined &&
    append.host === node &&
    append.valid &&
    !recalculated &&
    node.children === append.children &&
    (node.local === append.local || node.local === append.assembled);
  const pop = context.arrayPop;
  const truncating =
    pop !== undefined &&
    pop.host === node &&
    pop.valid &&
    !recalculated &&
    node.children === pop.children &&
    (node.local === pop.local || node.local === pop.assembled);
  const hint =
    recalculated && host
      ? { incremental: false }
      : appending
        ? { incremental: false, append: append.count }
        : truncating
          ? { incremental: false, truncate: pop.count - 1 }
          : undefined;
  const assembled = node.behavior.assemble(
    node,
    node.children ?? [],
    recalculated,
    hint,
  );
  if (appending && hint?.incremental) append.assembled = assembled;
  if (truncating && hint?.incremental) pop.assembled = assembled;
  const previousLocal = node.local;
  let same = false;
  if (hint?.incremental) {
    if (
      node.behavior.type === 'object' &&
      previousLocal !== null &&
      typeof previousLocal === 'object' &&
      assembled !== null &&
      typeof assembled === 'object' &&
      recalculated
    ) {
      same = true;
      for (const child of recalculated)
        if (
          !sameValue(
            Reflect.get(previousLocal, child.name),
            Reflect.get(assembled, child.name),
          )
        ) {
          same = false;
          break;
        }
    }
  } else same = sameValue(node.local, assembled);
  let local = same ? node.local : assembled;
  const baseline = node.deliveryPreviousLocal;
  const revisit =
    (node.deliveryChanges & FieldNodeEventType.UpdateValue) !== 0 &&
    local !== baseline &&
    !(isArray(baseline) && isArray(local) && baseline.length !== local.length);
  if (
    revisit &&
    (!host ||
      ((!recalculated ||
        keepsChildEmissions(node.deliveryPreviousLocal, recalculated)) &&
        keepsChildEmissions(
          node.deliveryPreviousLocal,
          node.children ?? [],
        ))) &&
    sameValue(node.deliveryPreviousLocal, local)
  )
    local = node.deliveryPreviousLocal;
  let projected = node.behavior.project(node, local);
  if (
    node.parent === null &&
    projected === undefined &&
    (node.behavior.type === 'object' || node.behavior.type === 'array')
  )
    projected = local;
  let emit =
    node.emit === node.local && projected === local
      ? local
      : sameValue(node.emit, projected)
        ? node.emit
        : projected;
  if (
    node.deliveryChanges & FieldNodeEventType.UpdateValue &&
    emit !== node.deliveryPreviousEmit &&
    !(
      revisit &&
      emit === local &&
      node.deliveryPreviousEmit === node.deliveryPreviousLocal
    ) &&
    sameValue(node.deliveryPreviousEmit, emit)
  )
    emit = node.deliveryPreviousEmit;
  const changed = local !== node.local || emit !== node.emit;
  node.local = captureFieldNodeChange(node, 'local', local);
  node.emit = captureFieldNodeChange(node, 'emit', emit);
  if (changed) {
    context.changedNodes.add(node);
    const parent = node.parent;
    const index = context.virtualReferenceIndex;
    if (node.behavior.type !== 'virtual' && parent && index) {
      const names = index.get(parent.blueprintNode)?.get(node.name);
      if (names)
        for (const name of names) {
          const virtual = parent.structure?.[name];
          if (virtual?.behavior.type === 'virtual' && !virtual.detached)
            updateOutput(virtual, context);
        }
    }
  }
  return changed;
};
