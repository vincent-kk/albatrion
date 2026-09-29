import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { sameValue } from './sameValue';

/**
 * Assemble and project a node once from its current child order.
 * @param node - Live node whose row owns assembly and projection
 * @param context - Current commit's changed-node set
 * @returns Whether either calculated value changed
 */
export const updateOutput = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): boolean => {
  const assembled = node.behavior.assemble(node, node.children ?? []);
  const local = sameValue(node.local, assembled) ? node.local : assembled;
  let projected = node.behavior.project(node, local);
  if (node.parent === null && node.behavior.type === 'object' &&
    node.behavior.strategy === 'branch' && projected === undefined)
    projected = local;
  const emit = sameValue(node.emit, projected) ? node.emit : projected;
  const changed = local !== node.local || emit !== node.emit;
  node.local = local;
  node.emit = emit;
  if (changed) context.changedNodes.add(node);
  return changed;
};
