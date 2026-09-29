import { SchemaFormError } from '../../../../errors';
import { mergeEffectiveSchema } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { evaluateGate } from '../gates/evaluateGate';
import { SHARED_NODE_CONFLICT } from '../errors/settleErrorCode';

/**
 * Recompute one node's active overlays and effective schema in a host round.
 * @param node - Current occurrence whose declarations may have changed gates
 * @param context - Projection and deferred failure for this settlement
 * @returns Whether the effective schema reference changed
 */
export const selectNodeSchema = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): boolean => {
  const active = node.blueprintNode.declarations.filter((declaration) =>
    declaration.gates.every((gate) => evaluateGate(gate, context, node)));
  const effective = mergeEffectiveSchema(node.blueprintNode,
    active.map((declaration) => declaration.id), { mode: 'runtime' });
  if (effective.typeConflict && !context.failure) {
    context.failure = new SchemaFormError(SHARED_NODE_CONFLICT,
      `Active declarations conflict at ${node.path}`, { path: node.path });
    context.cause = 'sharedConflict';
  }
  if (node.parent === null)
    node.active = active.some((declaration) => declaration.role === 'declaration');
  if (node.schema === effective) return false;
  node.schema = effective;
  context.changedNodes.add(node);
  return true;
};
