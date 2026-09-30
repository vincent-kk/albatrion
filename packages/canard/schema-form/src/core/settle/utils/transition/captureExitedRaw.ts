import type { SchemaNodeRecord } from '../../../record';
import { captureOwnLatent } from '../latent/captureOwnLatent';
import { readUnsetPolicy } from './readUnsetPolicy';
import type { SettlementContext } from '../../type';
import { writeLatentRaw } from './writeLatentRaw';
import { isReplacedLivePath } from './isReplacedLivePath';

/**
 * Capture each departing occurrence's own source under its resolved policy.
 * @param node - Detached occurrence including its last committed children
 * @param inherited - Parent or form policy at this depth
 * @param context - Settlement whose latent changes may need rollback
 * @param policy - Whether exit clearing applies to this subtree
 * @param order - This occurrence's blueprint document order
 * @returns Nothing; each descendant receives its own latent entry
 */
export const captureExitedRaw = <Self extends SchemaNodeRecord<Self>>(
  node: Self, inherited: boolean, context: SettlementContext<Self>,
  policy: boolean, order: readonly number[],
): void => {
  const clear = policy && readUnsetPolicy(node, inherited);
  for (const child of node.children ?? []) {
    const entries = node.blueprintNode.childEntries;
    const exact = entries.findIndex((entry) =>
      entry.name === child.name && entry.node === child.blueprintNode);
    const index = exact >= 0 ? exact : entries.findIndex((entry) =>
      entry.name === child.name && entry.node.kind === child.blueprintNode.kind);
    captureExitedRaw(child, clear, context, policy,
      [...order, index >= 0 ? index : 0]);
  }
  const key = JSON.stringify([node.path, node.blueprintNode.kind]);
  const value = clear ? undefined : captureOwnLatent(node,
    context.root.runtime.latentRaw.get(key));
  writeLatentRaw(context, key, value !== undefined &&
    !isReplacedLivePath(context, node.path), value, node.blueprintNode, order);
};
