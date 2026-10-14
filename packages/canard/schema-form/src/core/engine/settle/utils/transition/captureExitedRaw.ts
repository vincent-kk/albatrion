import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { captureArrayLatent } from '../latent/captureArrayLatent';
import { captureOwnLatent } from '../latentStore/captureOwnLatent';
import { pruneLatentRaw } from '../latentStore/pruneLatentRaw';
import { distributeAbsentChildInputs } from './distributeAbsentChildInputs';
import { isReplacedLivePath } from './isReplacedLivePath';
import { readUnsetPolicy } from './readUnsetPolicy';
import { writeLatentRaw } from './writeLatentRaw';

/**
 * Capture each departing occurrence's own source under its resolved policy.
 * @param node - Detached occurrence including its last committed children
 * @param inherited - Parent or form policy at this depth
 * @param context - Settlement whose latent changes may need rollback
 * @param policy - Whether exit clearing applies to this subtree
 * @param order - This occurrence's blueprint document order
 * @returns Nothing; each descendant receives its own latent entry, and a declared child
 * this settlement's write supplied without a node is distributed as latent too (211C-01)
 */
export const captureExitedRaw = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  inherited: boolean,
  context: SettlementContext<Self>,
  policy: boolean,
  order: readonly number[],
): void => {
  const clear = policy && readUnsetPolicy(node, inherited);
  for (const child of node.behavior.type === 'array'
    ? []
    : (node.children ?? [])) {
    if (child.parent !== node) continue;
    const entries = node.blueprintNode.childEntries;
    const exact = entries.findIndex(
      (entry) =>
        entry.name === child.name && entry.node === child.blueprintNode,
    );
    const index =
      exact >= 0
        ? exact
        : entries.findIndex(
            (entry) =>
              entry.name === child.name &&
              entry.node.kind === child.blueprintNode.kind,
          );
    captureExitedRaw(child, clear, context, policy, [
      ...order,
      index >= 0 ? index : 0,
    ]);
  }
  if (
    !clear &&
    node.behavior.type !== 'array' &&
    node.behavior.type !== 'virtual' &&
    node.behavior.strategy === 'branch'
  )
    distributeAbsentChildInputs(node, context, order);
  const key = JSON.stringify([node.path, node.blueprintNode.kind]);
  const value = clear
    ? undefined
    : node.behavior.type === 'array' &&
        node.behavior.strategy === 'branch' &&
        node.raw === undefined
      ? captureArrayLatent(node, context)
      : captureOwnLatent(node, context.root.runtime.latentRaw.get(key));
  if (node.behavior.type === 'array' && node.behavior.strategy === 'branch')
    pruneLatentRaw(node.runtime, node.path, undefined, context);
  writeLatentRaw(
    context,
    key,
    value !== undefined && !isReplacedLivePath(context, node.path),
    value,
    node.blueprintNode,
    order,
  );
};
