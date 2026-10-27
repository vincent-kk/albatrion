import type { FieldNodeRecord } from '../../../record';
import { getCommittedDeclarationKey } from '../../../utils/controls/getCommittedDeclarationKey';
import type { SettlementContext } from '../../types/settlement';

/**
 * Append an entered or revived occurrence only when its lazy index exists.
 * @param context - Settlement whose latent-key index tracks occurrence additions
 * @param node - Occurrence just added to the entered or revived set
 * @returns Nothing; an existing index gains this occurrence under its current key
 */
export const indexEnteredLatentKey = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  node: Self,
): void => {
  const index = context.enteredLatentKeys;
  if (!index) return;
  const key = getCommittedDeclarationKey(node, node.runtime);
  const occurrences = index.get(key);
  if (occurrences) occurrences.push(node);
  else index.set(key, [node]);
};
