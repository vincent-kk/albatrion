import type { EffectiveSchema } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { sameValue } from './sameValue';

/** Calculated identities held at entry to one bounded node computation. */
export interface CalculatedSnapshot<Self> {
  local: unknown;
  emit: unknown;
  children: readonly Self[] | null;
  schema: EffectiveSchema;
  active: boolean;
}

/**
 * Keep last commit's identities when a temporary gate baseline settles equally.
 * @param node - Recomputed record whose final values may match the prior commit
 * @param previous - Identities captured before the fixed host start
 * @param context - Changed-node set to trim after a no-op calculation
 * @returns Nothing; restores only equal calculated references
 */
export const preserveReferences = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
  previous: CalculatedSnapshot<Self>,
  context: SettlementContext<Self>,
): void => {
  if (sameValue(previous.local, node.local)) node.local = previous.local;
  if (sameValue(previous.emit, node.emit)) node.emit = previous.emit;
  if (previous.children && node.children &&
    previous.children.length === node.children.length &&
    previous.children.every((child, index) => child === node.children?.[index]))
    node.children = previous.children;
  if (node.local === previous.local && node.emit === previous.emit &&
    node.children === previous.children &&
    node.schema === (context.originalSchemas.get(node.path) ?? previous.schema) &&
    node.active === previous.active && !context.changedRaw.has(node.path) &&
    !context.entered.has(node))
    context.changedNodes.delete(node);
};
