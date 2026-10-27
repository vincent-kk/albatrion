import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord, FieldNodeRuntime } from '../../../record';
import { readNodeKeyPath } from '../../../utils/nodeIdentity/readNodeKeyPath';
import { PathKeyedMap } from '../../../utils/pathIndex/PathKeyedMap';
import type { SettlementContext } from '../../types/settlement';
import { DetachedWriteAddress } from './DetachedWriteAddress';

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
export const setLatentRaw = <Self extends FieldNodeRecord<Self>>(
  runtime: FieldNodeRuntime<Self>,
  log: Map<string, { present: boolean; value: unknown }> | undefined,
  key: string,
  present: boolean,
  value: unknown,
  template?: BlueprintNode,
  order?: readonly number[],
  context?: SettlementContext<Self>,
): void => {
  const latent = runtime.latentRaw;
  const had = latent.has(key);
  const prior = latent.get(key);
  const missingMetadata =
    present && template !== undefined && !runtime.latentRawMetadata?.has(key);
  if (log && !log.has(key)) log.set(key, { present: had, value: prior });
  if (present) latent.set(key, value);
  else latent.delete(key);
  if (template && order) {
    const metadata = (runtime.latentRawMetadata ??= new PathKeyedMap('pair'));
    runtime.latentRawMetadata = metadata;
    const path =
      latent.pathIndex.pathOf(key) ??
      metadata.get(key)?.path ??
      readNodeKeyPath(key);
    if (path !== undefined) {
      const previous = metadata.get(key);
      const current = { path, blueprintNode: template, order };
      if (previous) DetachedWriteAddress.transfer(previous, current, runtime);
      metadata.set(key, current, [path]);
    }
  }
  if (
    had !== present ||
    (present && !Object.is(prior, value)) ||
    missingMetadata
  ) {
    runtime.latentRawDirty = true;
    if (context) context.latentPrefixes = undefined;
  }
};
