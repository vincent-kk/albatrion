import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { indexEnteredLiteralStarKey } from './indexEnteredLiteralStarKey';

/**
 * Cache entered and revived occurrences by their current path and kind.
 * @param context - Settlement owning the occurrence sets and lazy latent-key index
 * @returns Entered occurrences followed by revived occurrences under each key
 */
export const getEnteredLiteralStarKeys = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): Map<string, Self[]> => {
  if (context.enteredLiteralStarKeys) return context.enteredLiteralStarKeys;
  context.enteredLiteralStarKeys = new Map();
  for (const node of context.entered) indexEnteredLiteralStarKey(context, node);
  for (const node of context.revived) indexEnteredLiteralStarKey(context, node);
  return context.enteredLiteralStarKeys;
};
