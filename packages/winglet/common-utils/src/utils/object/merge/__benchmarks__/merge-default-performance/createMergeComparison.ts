import type { merge } from '../../merge';
import { createSnapshotModuleLoader } from './createSnapshotModuleLoader';

/**
 * Preserve real module graphs while loading the public comparison and diagnoses.
 * @param baselineRevision - Immutable pre-options release-branch source revision.
 * @param previousRevision - Immutable intermediate options implementation revision.
 * @param packageRoot - Package location supplied by the benchmark harness.
 * @returns Public implementations, shared direct recursion and complete source hashes.
 */
export const createMergeComparison = (
  baselineRevision: string,
  previousRevision: string,
  packageRoot: string,
) => {
  const baselineLoader = createSnapshotModuleLoader(
    baselineRevision,
    packageRoot,
  );
  const candidateLoader = createSnapshotModuleLoader('workspace', packageRoot);
  const previousLoader = createSnapshotModuleLoader(
    previousRevision,
    packageRoot,
  );
  return {
    baseline: baselineLoader.load('src/utils/object/merge.ts')
      .merge as typeof merge,
    candidate: candidateLoader.load('src/utils/object/merge/merge.ts')
      .merge as typeof merge,
    previous: previousLoader.load('src/utils/object/merge.ts')
      .merge as typeof merge,
    direct: candidateLoader.load('src/utils/object/merge/utils/mergeDefault.ts')
      .mergeDefault as typeof merge,
    sourceHashes: {
      baseline: baselineLoader.sourceHashes,
      candidate: candidateLoader.sourceHashes,
      previous: previousLoader.sourceHashes,
    },
  };
};
