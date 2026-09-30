import type { BlueprintNode } from '../../../blueprint';
import type { SchemaNodeRecord, SchemaNodeRuntime } from '../../../record';
import type { SettlementContext } from '../../type';

/**
 * Change one latent entry and retain its classification across deletions.
 * @param runtime - Tree-local latent values and classification metadata
 * @param log - Transition rollback log, when this write is automatic
 * @param key - Encoded absolute path and node kind
 * @param present - Whether this key has a new value
 * @param value - Replacement source, including explicit undefined
 * @param template - Blueprint classification for a new entry
 * @param order - Occurrence's document order from the root
 * @param context - Settlement whose latent-prefix memo must be invalidated
 * @returns Nothing; the tree's latent map changes in place
 */
export const setLatentRaw = <Self extends SchemaNodeRecord<Self>>(
  runtime: SchemaNodeRuntime<Self>,
  log: Map<string, { present: boolean; value: unknown }> | undefined,
  key: string, present: boolean, value: unknown,
  template?: BlueprintNode, order?: readonly number[],
  context?: SettlementContext<Self>,
): void => {
  const latent = runtime.latentRaw;
  const had = latent.has(key);
  const prior = latent.get(key);
  const missingMetadata = present && template !== undefined &&
    !runtime.latentRawMetadata?.has(key);
  if (log && !log.has(key)) log.set(key, { present: had, value: prior });
  if (present) latent.set(key, value);
  else latent.delete(key);
  if (template && order) {
    const metadata = runtime.latentRawMetadata ?? new Map();
    runtime.latentRawMetadata = metadata;
    const identity: unknown = JSON.parse(key);
    if (Array.isArray(identity) && typeof identity[0] === 'string')
      metadata.set(key, { path: identity[0], blueprintNode: template, order });
  }
  if (had !== present || present && !Object.is(prior, value) || missingMetadata) {
    runtime.latentRawDirty = true;
    if (context) context.latentPrefixes = undefined;
  }
};
