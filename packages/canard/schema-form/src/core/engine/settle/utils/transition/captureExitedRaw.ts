import { getItemEntries } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { getCommittedDeclarationKey } from '../../../utils/controls/getCommittedDeclarationKey';
import type { SettlementContext } from '../../types/settlement';
import { captureArrayLatent } from '../latent/captureArrayLatent';
import { DetachedWriteAddress } from '../latentStore/DetachedWriteAddress';
import { HostLatent } from '../latentStore/HostLatent';
import { captureOwnLatent } from '../latentStore/captureOwnLatent';
import { getLatentPathIndex } from '../latentStore/getLatentPathIndex';
import { pruneLatentRaw } from '../latentStore/pruneLatentRaw';
import { distributeAbsentChildInputs } from './distributeAbsentChildInputs';
import { isReplacedLivePath } from './isReplacedLivePath';
import { readUnsetPolicy } from './readUnsetPolicy';
import { selectCandidateOwnedLatent } from './selectCandidateOwnedLatent';
import { writeLatentRaw } from './writeLatentRaw';

/**
 * Capture each departing occurrence's own source under its resolved policy.
 * @param node - Detached occurrence including its last committed children
 * @param inherited - Parent or form policy at this depth
 * @param context - Settlement whose latent changes may need rollback
 * @param policy - Whether exit clearing applies to this subtree
 * @param order - This occurrence's blueprint document order
 * @param inheritedOwnership - Enclosing candidate's restriction on latent cleanup
 * @param structural - Preserve every descendant source during candidate-bearing slot recreation
 * @returns The ownership restriction resolved for this capture, when any; object
 * children and multi-candidate array items retain their own
 * entries, and newly written absent object children are distributed as latent too (211C-01)
 */
export const captureExitedRaw = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  inherited: boolean,
  context: SettlementContext<Self>,
  policy: boolean,
  order: readonly number[],
  inheritedOwnership?: (key: string) => boolean,
  structural = false,
): ((key: string) => boolean) | undefined => {
  const ownsLatent = selectCandidateOwnedLatent(node, inheritedOwnership);
  const clear = policy && readUnsetPolicy(node, inherited);
  if (
    node.behavior.type !== 'array' ||
    structural ||
    (!clear && node.blueprintNode.hasCandidateDescendants)
  ) {
    for (const child of node.children ?? []) {
      if (child.parent !== node) continue;
      if (
        node.behavior.type === 'array' &&
        !structural &&
        !child.blueprintNode.hasCandidateDescendants &&
        getItemEntries(node.blueprintNode, Number(child.name)).length < 2
      )
        continue;
      const entries = node.blueprintNode.childEntries;
      const index = entries.findIndex(
        (entry) =>
          entry.name === child.name && entry.node === child.blueprintNode,
      );
      captureExitedRaw(
        child,
        clear,
        context,
        policy,
        [
          ...order,
          index >= 0
            ? index
            : node.behavior.type === 'array'
              ? Number(child.name)
              : 0,
        ],
        ownsLatent,
        structural,
      );
    }
  }
  if (
    !clear &&
    node.behavior.type !== 'array' &&
    node.behavior.type !== 'virtual' &&
    node.behavior.strategy === 'branch'
  )
    distributeAbsentChildInputs(node, context, order);
  const key = getCommittedDeclarationKey(node, node.runtime);
  const value =
    clear && (!ownsLatent || ownsLatent(key))
      ? undefined
      : node.behavior.type === 'array' &&
          node.behavior.strategy === 'branch' &&
          node.raw === undefined
        ? captureArrayLatent(node, context)
        : captureOwnLatent(node, context.root.runtime.latentRaw.get(key));
  if (
    !structural &&
    node.behavior.type === 'array' &&
    node.behavior.strategy === 'branch'
  ) {
    let retained: { key: string; value: unknown }[] | undefined;
    if (value instanceof HostLatent && value.retainedItemNames)
      for (const name of value.retainedItemNames) {
        const keys = getLatentPathIndex(context).get(node.path + '/' + name);
        if (!keys) continue;
        for (const key of keys)
          (retained ??= []).push({
            key,
            value: node.runtime.latentRaw.get(key),
          });
      }
    if (ownsLatent) {
      if (!clear)
        for (const descendant of getLatentPathIndex(context).get(node.path) ??
          [])
          if (ownsLatent(descendant))
            writeLatentRaw(context, descendant, false, undefined);
    } else pruneLatentRaw(node.runtime, node.path, undefined, context);
    if (retained)
      for (const entry of retained)
        writeLatentRaw(context, entry.key, true, entry.value);
  }
  writeLatentRaw(
    context,
    key,
    value !== undefined && !isReplacedLivePath(context, node.path),
    value,
    node.blueprintNode,
    order,
  );
  const metadata = node.runtime.latentRawMetadata?.get(key);
  if (metadata) DetachedWriteAddress.retain(node, metadata, node.runtime);
  return ownsLatent;
};
