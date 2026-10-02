import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { indexEnteredLatentKey } from './indexEnteredLatentKey';

/**
 * Cache entered and revived occurrences by their current path and kind.
 * @param context - Settlement owning the occurrence sets and lazy latent-key index
 * @returns Entered occurrences followed by revived occurrences under each key
 */
export const getEnteredLatentKeys = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): Map<string, Self[]> => {
  if (context.enteredLatentKeys) return context.enteredLatentKeys;
  context.enteredLatentKeys = new Map();
  for (const node of context.entered) indexEnteredLatentKey(context, node);
  for (const node of context.revived) indexEnteredLatentKey(context, node);
  return context.enteredLatentKeys;
};
