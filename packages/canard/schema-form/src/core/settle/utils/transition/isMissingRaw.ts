import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { hasLatentUnder } from '../latent/hasLatentUnder';

/**
 * Recognize a branch with no own or any-kind descendant source (26C-14).
 * @param node - Newly appearing occurrence considered for default filling
 * @param context - Settlement whose latent-prefix index covers all kinds
 * @returns Whether a default may populate this occurrence
 */
export const isMissingRaw = <Self extends SchemaNodeRecord<Self>>(
  node: Self, context: SettlementContext<Self>,
): boolean => {
  if (node.raw !== undefined) return false;
  if (node.behavior.strategy !== 'branch') return true;
  if (node.extras !== undefined || hasLatentUnder(context, node.path)) return false;
  return (node.children ?? []).every((child) => isMissingRaw(child, context));
};
