import * as path from 'node:path';

/** One sub-path entry point that exports a declaration, as seen when choosing the declaration's canonical page. */
export interface EntryCandidate {
  /** Key of the entry in the package `exports` map, e.g. "./pointer-patch". */
  entryKey: string;
  /** Absolute path of the directory that holds the entry declaration file. */
  entryDir: string;
  /** File boundaries crossed from the entry file to the declaration file. */
  hops: number;
  /** Position of the entry in the package `exports` map; lower comes first. */
  exportsOrder: number;
}

/**
 * Chooses the entry point whose category hosts a declaration's page: the
 * entry with the fewest re-export hops; on a tie, the entry whose directory
 * is the deepest ancestor of the declaration file; on a further tie, the
 * entry listed first in the package `exports` map.
 *
 * @param candidates - The sub-path entries that export the declaration; at least one.
 * @param declarationFile - Absolute path of the declaration file. Ancestry is
 *   judged per path segment, so `utils/patch` is not an ancestor of
 *   `utils/patchModel/x.d.ts`.
 * @returns The chosen candidate.
 * @throws Error when `candidates` is empty.
 */
export function selectCanonicalEntry(candidates: EntryCandidate[], declarationFile: string): EntryCandidate {
  if (candidates.length === 0) throw new Error(`no entry exports ${declarationFile}`);
  const ranked = candidates.map(candidate => ({
    candidate,
    depth: ancestorDepth(candidate.entryDir, declarationFile),
  }));
  ranked.sort(
    (a, b) =>
      a.candidate.hops - b.candidate.hops ||
      b.depth - a.depth ||
      a.candidate.exportsOrder - b.candidate.exportsOrder,
  );
  return ranked[0].candidate;
}

/** Segment count of `dir` when it is an ancestor of `file`, otherwise -1. */
function ancestorDepth(dir: string, file: string): number {
  const relative = path.relative(dir, file);
  const isAncestor =
    relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
  return isAncestor ? path.resolve(dir).split(path.sep).length : -1;
}
