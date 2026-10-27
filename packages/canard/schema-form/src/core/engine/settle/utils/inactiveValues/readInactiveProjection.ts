import { PathKeyedMap } from '../../../utils/pathIndex/PathKeyedMap';
import type {
  InactiveGeneration,
  InactiveProjection,
} from '../../types/inactiveValues';
import { createInactiveProjection } from './createInactiveProjection';
import { replayInactiveGeneration } from './replayInactiveGeneration';

/**
 * Replay deferred commits iteratively so a long unread chain cannot overflow.
 * @param generation - Exact immutable commit requested by live or detached readers
 * @param path - Existing host path captured with that generation
 * @param emptyVersion - Version of an unchanged empty publication
 * @returns Cached host-local sources, selected identities and list version
 */
export const readInactiveProjection = (
  generation: InactiveGeneration,
  path: string,
  emptyVersion: object,
): InactiveProjection => {
  const held = generation.projections.get(path);
  if (held) return held;
  const pending: InactiveGeneration[] = [];
  let cursor: InactiveGeneration | undefined = generation;
  let previous: InactiveProjection | undefined;
  while (cursor) {
    previous = cursor.projections.get(path);
    if (previous) break;
    pending.push(cursor);
    cursor = cursor.parent;
  }
  const view = previous
    ? {
        sources: new PathKeyedMap('pair', previous.sources),
        visibility: new Map(previous.visibility),
        entries: new PathKeyedMap('pair', previous.entries),
        version: previous.version,
        versions: previous.versions && new Map(previous.versions),
      }
    : createInactiveProjection(generation.base, path, emptyVersion);
  for (let index = pending.length - 1; index >= 0; index--)
    replayInactiveGeneration(view, pending[index], path);
  generation.projections.set(path, view);
  return view;
};
