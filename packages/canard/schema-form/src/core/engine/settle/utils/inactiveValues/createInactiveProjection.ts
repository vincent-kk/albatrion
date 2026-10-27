import { PathKeyedMap } from '../../../utils/pathIndex/PathKeyedMap';
import type {
  InactiveBase,
  InactiveProjection,
} from '../../types/inactiveValues';

/**
 * Copy only one host's compacted candidate range, retaining published item objects.
 * @param base - Immutable compacted sources and list versions
 * @param path - Existing host path, including the root's empty path
 * @param emptyVersion - Shared version for paths whose empty list never changed
 * @returns A private mutable view used only while replaying this read
 */
export const createInactiveProjection = (
  base: InactiveBase,
  path: string,
  emptyVersion: object,
): InactiveProjection => ({
  sources: new PathKeyedMap(
    'pair',
    [...base.sources.pathIndex.under(path)].map(
      (key) => [key, base.sources.get(key)!] as const,
    ),
  ),
  visibility: new Map(),
  entries: new PathKeyedMap(
    'pair',
    [...base.entries.pathIndex.under(path)].map(
      (key) => [key, base.entries.get(key)!] as const,
    ),
  ),
  version: base.versions.get(path) ?? emptyVersion,
  versions: path === '' ? new Map(base.versions) : undefined,
});
