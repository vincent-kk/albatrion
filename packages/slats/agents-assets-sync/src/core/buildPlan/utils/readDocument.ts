import { readFile } from 'node:fs/promises';

/**
 * Read a shared document once per plan, remembering absent files.
 *
 * Several rule blocks usually target the same `AGENTS.md`, and each of them
 * asks for its current body; re-reading per block would multiply the IO and
 * could observe two different versions within one plan.
 *
 * @returns a reader that answers `null` for a document that does not exist
 */
export function createDocumentReader(): (
  fileAbs: string,
) => Promise<string | null> {
  const cache = new Map<string, Promise<string | null>>();
  return (fileAbs) => {
    const hit = cache.get(fileAbs);
    if (hit) return hit;
    const pending = readFile(fileAbs, 'utf-8').then(
      (content) => content,
      (error: NodeJS.ErrnoException) => {
        if (error?.code === 'ENOENT') return null;
        throw error;
      },
    );
    cache.set(fileAbs, pending);
    return pending;
  };
}
