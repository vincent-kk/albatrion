import { readFile } from 'node:fs/promises';

import { assertManagedMarkdown } from '../../markerBlock/index.js';

/** Blocks from the checked document, with their original byte offsets. */
type DocumentSnapshot = ReturnType<typeof assertManagedMarkdown>;

/**
 * Read and scan a shared document once per plan, remembering absent files.
 *
 * Several rule blocks usually target the same `AGENTS.md`, and each of them
 * asks for its current body; re-reading per block would multiply the IO and
 * could observe two different versions within one plan.
 *
 * @returns a reader that answers `null` for a document that does not exist
 */
export function createDocumentReader() {
  const cache = new Map<string, Promise<DocumentSnapshot | null>>();
  return (fileAbs: string) => {
    const hit = cache.get(fileAbs);
    if (hit) return hit;
    const pending = readFile(fileAbs, 'latin1').then(
      (content) => assertManagedMarkdown(content, fileAbs),
      (error: NodeJS.ErrnoException) => {
        if (error?.code === 'ENOENT') return null;
        throw error;
      },
    );
    cache.set(fileAbs, pending);
    return pending;
  };
}
