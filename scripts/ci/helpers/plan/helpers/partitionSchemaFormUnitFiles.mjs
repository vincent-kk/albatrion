/** Slow file runtimes (ms), rounded up from the slower PR runs; each file also pays import/setup cost. */
const testMilliseconds = {
  "src/__tests__/importModel.test.ts": 6100,
  "src/__tests__/migration/migrationGuide.test.ts": 5700,
  "src/__tests__/pointerIsolation.test.ts": 2200,
  "src/__tests__/publicSurface.test.ts": 6700,
  "src/__tests__/publishedReactTypes.round-five.test.ts": 7400,
  "src/components/FieldProxy/__tests__/renderCounts.test.ts": 2000,
  "src/components/FieldProxy/components/FieldInputBridge/__tests__/layoutCounts.test.ts": 1900,
  "src/components/Form/__tests__/Form.renderCounts.test.ts": 1200,
  "src/core/__tests__/remount-equivalence/corpus.test.ts": 20300,
  "src/core/__tests__/remount-equivalence/targeted.test.ts": 4700,
  "src/core/engine/__tests__/batchCallerReviewModel.test.ts": 51700,
  "src/core/engine/__tests__/batchDeclarativeWrites.test.ts": 60100,
  "src/core/engine/__tests__/blueprint.branchless-differential.test.ts": 4000,
  "src/core/engine/__tests__/declarativeWriteRoutingModel.test.ts": 20400,
  "src/core/engine/__tests__/retainedSourceEventModel.test.ts": 8000,
  "src/core/engine/__tests__/revivedDepartingWriteSecondExit.test.ts": 2800,
  "src/core/engine/__tests__/virtualArrayModel.round-five.test.ts": 3800,
  "src/core/engine/__tests__/virtualStorageModel.round-five.test.ts": 24400,
  "src/core/engine/__tests__/virtualTopologyModel.round-five.test.ts": 5500,
  "src/core/engine/behaviors/utils/parse/__tests__/interpret.properties.test.ts": 3000,
  "src/core/engine/blueprint/compileBlueprintExpressions/__tests__/equality.evaluator.test.ts": 2600,
  "src/core/engine/navigation/__tests__/wildcardScale.round-four.test.ts": 1100,
  "src/core/engine/settle/__tests__/selectChildren.head-differential.test.ts": 2300,
  "src/core/engine/settle/__tests__/settle.array-scaling.test.ts": 17500,
  "src/core/engine/settle/__tests__/settle.dirty-consume-modes.test.ts": 12900,
  "src/core/engine/settle/__tests__/settle.gate-table-loading.test.ts": 1200,
  "src/core/engine/settle/__tests__/settle.gate-table-wheel-differential.test.ts": 2700,
  "src/core/engine/settle/__tests__/settle.gate-wheel-differential.test.ts": 2700,
  "src/core/engine/settle/__tests__/settle.misfit-scaling.test.ts": 3900,
  "src/core/engine/settle/__tests__/settle.non-wheel-preservation.test.ts": 1500,
  "src/core/engine/settle/__tests__/settle.presence-counts.test.ts": 10900,
  "src/core/engine/settle/__tests__/settle.presence-evaluation-counts.test.ts": 20200,
  "src/core/engine/settle/__tests__/settle.presence-index.test.ts": 28500,
  "src/core/engine/settle/__tests__/settle.remount-equivalence-presence-metrics.test.ts": 1900,
  "src/core/engine/settle/arrangeFieldNodeItems/__tests__/settle.array-append.test.ts": 2000,
  "src/core/engine/settle/arrangeFieldNodeItems/__tests__/settle.array-pop.test.ts": 1200,
  "src/core/engine/settle/loadFieldNodeAtMount/__tests__/static-first-load-differential.test.ts": 1300,
  "src/core/engine/settle/utils/scratch/__tests__/DirtyPathSet.consume-differential.test.ts": 1300,
  "src/core/engine/validation/__tests__/reentrantValidator.round-three.test.ts": 2500,
  "src/types/__tests__/exactOptional.round-four.test.ts": 14400,
};

/**
 * Assigns the most expensive unit files first to the shard with the lowest estimated cost.
 * @param {string[]} paths Unique POSIX file paths relative to the schema-form workspace.
 * @param {number} count Positive number of shards.
 * @returns {string[][]} Files in each shard, ordered by descending estimated cost.
 */
export function partitionSchemaFormUnitFiles(paths, count) {
  const shards = Array.from({ length: count }, () => ({
    paths: [],
    milliseconds: 0,
  }));
  const files = paths
    .map((path) => ({
      path,
      milliseconds: 800 + (testMilliseconds[path] ?? 100),
    }))
    .sort(
      (a, b) => b.milliseconds - a.milliseconds || (a.path < b.path ? -1 : 1),
    );

  for (const { path, milliseconds } of files) {
    const shard = shards.reduce((lowest, candidate) =>
      candidate.milliseconds < lowest.milliseconds ? candidate : lowest,
    );
    shard.paths.push(path);
    shard.milliseconds += milliseconds;
  }
  return shards.map(({ paths }) => paths);
}
