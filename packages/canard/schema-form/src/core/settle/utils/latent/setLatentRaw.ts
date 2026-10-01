import { PathKeyedMap } from '../../../utils/pathIndex/PathKeyedMap';
import { isArray } from '@winglet/common-utils/filter';

import type { BlueprintNode } from '../../../blueprint';
import type { SchemaNodeRecord, SchemaNodeRuntime } from '../../../record';
import type { SettlementContext } from '../../type';
import { indexLatentDescendant } from './indexLatentDescendant';

/**
 * Change one latent entry and retain its classification across deletions.
 * @param runtime - Tree-local latent values and classification metadata
 * @param log - Transition rollback log, when this write is automatic
 * @param key - Encoded absolute path and node kind
 * @param present - Whether this key has a new value
 * @param value - Replacement source, including explicit undefined
 * @param template - Blueprint classification for a new entry
 * @param order - Occurrence's document order from the root
 * @param context - Settlement whose path index and prefix memo track this write
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
  const index = context?.latentDescendantKeys;
  const identity: unknown = index ? JSON.parse(key) : undefined;
  const path = isArray(identity) && typeof identity[0] === 'string' ?
    identity[0] : undefined;
  const missingMetadata = present && template !== undefined &&
    !runtime.latentRawMetadata?.has(key);
  if (log && !log.has(key)) log.set(key, { present: had, value: prior });
  if (present) latent.set(key, value);
  else latent.delete(key);
  if (template && order) {
    const metadata = runtime.latentRawMetadata ??= new PathKeyedMap('pair');
    runtime.latentRawMetadata = metadata;
    const identity: unknown = JSON.parse(key);
    if (isArray(identity) && typeof identity[0] === 'string')
      metadata.set(key, { path: identity[0], blueprintNode: template, order });
  }
  if (index && path !== undefined && had && !present)
    indexLatentDescendant(index, key, path, false);
  if (index && path !== undefined && present && !had)
    indexLatentDescendant(index, key, path, true);
  if (had !== present || present && !Object.is(prior, value) || missingMetadata) {
    runtime.latentRawDirty = true;
    if (context) context.latentPrefixes = undefined;
  }
};
