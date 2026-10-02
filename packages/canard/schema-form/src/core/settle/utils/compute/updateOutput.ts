import { captureSchemaNodeChange } from '../../../record';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { sameValue } from './sameValue';

/**
 * Assemble and project a node once from its current child order.
 * @param node - Live node whose row owns assembly and projection
 * @param context - Current commit's changed-node set
 * @param recalculated - Direct children recomputed with an unchanged host shape
 * @returns Whether either calculated value changed
 */
export const updateOutput = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  recalculated?: readonly Self[],
): boolean => {
  context.pendingOutputs?.delete(node);
  const hint = recalculated &&
    (node.behavior.type === 'array' || node.behavior.type === 'object') &&
    node.behavior.strategy === 'branch' ? { incremental: false } : undefined;
  const assembled = node.behavior.assemble(node, node.children ?? [],
    recalculated, hint);
  const previousLocal = node.local;
  const same = hint?.incremental
    ? node.behavior.type === 'object' && previousLocal !== null &&
      typeof previousLocal === 'object' && assembled !== null &&
      typeof assembled === 'object' && recalculated?.every((child) =>
        sameValue(Reflect.get(previousLocal, child.name),
          Reflect.get(assembled, child.name)))
    : sameValue(node.local, assembled);
  const local = same ? node.local : assembled;
  let projected = node.behavior.project(node, local);
  if (node.parent === null && projected === undefined &&
    (node.behavior.type === 'object' || node.behavior.type === 'array'))
    projected = local;
  const emit = node.emit === node.local && projected === local ? local :
    sameValue(node.emit, projected) ? node.emit : projected;
  const changed = local !== node.local || emit !== node.emit;
  node.local = captureSchemaNodeChange(node, 'local', local);
  node.emit = captureSchemaNodeChange(node, 'emit', emit);
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
