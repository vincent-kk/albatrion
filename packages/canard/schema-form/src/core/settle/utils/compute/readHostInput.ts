import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';

/**
 * Read what this settle wrote to a host, the only source of its children's inputs.
 * @param node - Branch host whose children are being entered
 * @param context - Current write with its written inputs, kind, and changed raw paths
 * @returns The value this settle wrote or loaded onto the host, or undefined when it wrote none
 */
export const readHostInput = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): unknown => {
  if (context.writtenInputs.has(node)) return context.writtenInputs.get(node);
  return context.kind === 'load' || context.changedRaw.has(node.path)
    ? node.raw : undefined;
};
