import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getLatentPathIndex } from '../latentStore/getLatentPathIndex';
import { captureLatentDescendants } from '../transition/captureLatentDescendants';
import { readDepartingAncestorPolicy } from '../transition/readDepartingAncestorPolicy';
import { writeLatentRaw } from '../transition/writeLatentRaw';
import { hasSlotCandidateOwner } from './hasSlotCandidateOwner';
import { readSlotExitPolicy } from './readSlotExitPolicy';

/**
 * Apply current exit policies to sources converted by an earlier array relocation.
 * @param node - Finally detached occurrence that may own converted descendants
 * @param context - Transition journal shared by both source representations
 * @param applyPolicy - Whether policy writes are enabled for this lifetime
 * @returns Nothing; ordinary slot-only exits do not enter latent policy traversal
 */
export const applyConvertedExitPolicy = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  applyPolicy: boolean,
): void => {
  if (
    !node.runtime.latentRaw.size ||
    !node.runtime.latentRaw.pathIndex.under(node.path).size
  )
    return;
  const clear = readSlotExitPolicy(
    node,
    readDepartingAncestorPolicy(context, node),
  );
  if (
    applyPolicy &&
    clear &&
    node.behavior.type === 'array' &&
    !hasSlotCandidateOwner(node)
  ) {
    for (const key of [...(getLatentPathIndex(context).get(node.path) ?? [])])
      writeLatentRaw(context, key, false, undefined);
  } else captureLatentDescendants(context, node, clear, applyPolicy);
};
