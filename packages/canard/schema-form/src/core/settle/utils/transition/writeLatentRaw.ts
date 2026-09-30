import type { SchemaNodeRecord } from '../../../record';
import type { BlueprintNode } from '../../../blueprint';
import type { SettlementContext } from '../../type';

/**
 * Change a latent value while recording the pre-transition map state once.
 * @param context - Call whose transition changes may require Source B restoration
 * @param key - Encoded absolute path and kind
 * @param present - Whether the replacement has an entry
 * @param value - Replacement value when present, including explicit undefined
 * @param template - Classification template when a new key is recorded
 * @param order - Stable root-to-leaf document position of that occurrence
 * @returns Nothing; the root map is updated in place
 */
export const writeLatentRaw = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>, key: string, present: boolean, value: unknown,
  template?: BlueprintNode, order?: readonly number[],
): void => {
  const runtime = context.root.runtime;
  const latent = runtime.latentRaw;
  if (context.inTransition && !context.latentAutomaticLog.has(key))
    context.latentAutomaticLog.set(key, {
      present: latent.has(key), value: latent.get(key),
    });
  if (present) {
    if (!latent.has(key) || !Object.is(latent.get(key), value) ||
      (template && !runtime.latentRawMetadata?.has(key)))
      runtime.latentRawDirty = true;
    latent.set(key, value);
    if (template && order) {
      const metadata = context.root.runtime.latentRawMetadata ?? new Map();
      context.root.runtime.latentRawMetadata = metadata;
      const identity: unknown = JSON.parse(key);
      if (Array.isArray(identity) && typeof identity[0] === 'string')
        metadata.set(key, { path: identity[0], blueprintNode: template, order });
    }
  }
  else if (latent.delete(key)) runtime.latentRawDirty = true;
};
