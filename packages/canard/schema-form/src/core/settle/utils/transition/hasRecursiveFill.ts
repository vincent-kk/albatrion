import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { hasRecursiveExpansion } from '../compute/hasRecursiveExpansion';

/**
 * Apply the shared origin-less expansion judgment to a missing host fill.
 * @param node - Missing host about to receive its authored default
 * @param hosts - Automatically filled hosts in this settlement
 * @param context - Caller and automatic distribution provenance
 * @returns Whether filling repeats an origin-less effective template chain
 */
export const hasRecursiveFill = <Self extends SchemaNodeRecord<Self>>(
  node: Self, hosts: ReadonlySet<Self>, context: SettlementContext<Self>,
): boolean => node.parent !== null && hasRecursiveExpansion(node.parent,
  node.blueprintNode, undefined, context, node.schema, hosts);
