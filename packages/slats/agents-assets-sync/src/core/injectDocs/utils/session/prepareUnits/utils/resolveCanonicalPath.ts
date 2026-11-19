import { realpath } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

/** Resolve a destination through its nearest existing ancestor using one run cache.
 * @param path Absolute file or namespace root, possibly not created yet.
 * @param cache Shared resolution promises for every participant.
 * @returns The physical path used only for ownership comparison.
 */
export function resolveCanonicalPath(
  path: string,
  cache: Map<string, Promise<string>>,
): Promise<string> {
  const previous = cache.get(path);
  if (previous) return previous;
  const result = realpath(path).catch(async (error: NodeJS.ErrnoException) => {
    if (error.code !== 'ENOENT' || dirname(path) === path) throw error;
    return join(
      await resolveCanonicalPath(dirname(path), cache),
      basename(path),
    );
  });
  cache.set(path, result);
  return result;
}
