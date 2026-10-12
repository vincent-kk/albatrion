import { isArray } from '@winglet/common-utils/filter';
import { escapeSegment } from '@winglet/json/pointer';
import type { SchemaNodeRecord, SchemaNodeRuntime } from '../../../record';
import type { SettlementContext } from '../../type';
import { getLatentPathIndex } from '../latent/getLatentPathIndex';
import { setLatentRaw } from '../latent/setLatentRaw';

/**
 * Remove latent sources in a whole-write scope while retaining classification.
 * @param runtime - Tree whose per-kind latent entries are being replaced
 * @param path - Absolute scope path
 * @param names - Optional direct child names covered by the write
 * @param context - Transition whose rollback and prefix index must be updated
 * @returns Nothing; all kinds in the covered paths are removed
 */
export const pruneLatentRaw = <Self extends SchemaNodeRecord<Self>>(
  runtime: SchemaNodeRuntime<Self>, path: string,
  names?: readonly string[], context?: SettlementContext<Self>,
): void => {
  const childPaths = names?.map((name) => `${path}/${escapeSegment(name)}`);
  if (context) {
    const index = getLatentPathIndex(context);
    const paths = childPaths ?? [path];
    for (const childPath of paths)
      for (const key of [...index.get(childPath) ?? []])
        setLatentRaw(runtime,
          context.inTransition ? context.latentAutomaticLog : undefined,
          key, false, undefined, undefined, undefined, context);
    return;
  }
  for (const key of runtime.latentRaw.keys()) {
    const identity: unknown = JSON.parse(key);
    if (!isArray(identity) || typeof identity[0] !== 'string') continue;
    if (childPaths ? childPaths.some((childPath) => identity[0] === childPath ||
      identity[0].startsWith(`${childPath}/`)) :
      !path || identity[0] === path || identity[0].startsWith(`${path}/`))
      setLatentRaw(runtime, undefined, key, false, undefined);
  }
};
