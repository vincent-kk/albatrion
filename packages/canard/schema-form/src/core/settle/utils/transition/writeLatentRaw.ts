import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';

/**
 * Change a latent value while recording the pre-transition map state once.
 * @param context - Call whose transition changes may require Source B restoration
 * @param key - Encoded absolute path and kind
 * @param present - Whether the replacement has an entry
 * @param value - Replacement value when present, including explicit undefined
 * @returns Nothing; the root map is updated in place
 */
export const writeLatentRaw = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>, key: string, present: boolean, value: unknown,
): void => {
  const latent = context.root.runtime.latentRaw;
  if (context.inTransition && !context.latentAutomaticLog.has(key))
    context.latentAutomaticLog.set(key, {
      present: latent.has(key), value: latent.get(key),
    });
  if (present) latent.set(key, value);
  else latent.delete(key);
};
