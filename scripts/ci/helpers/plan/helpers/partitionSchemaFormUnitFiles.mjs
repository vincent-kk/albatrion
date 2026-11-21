/**
 * Per-file test costs from PR 671, scaled by the ratios of the identical build
 * steps. Costs below 500 ms use their observed mean. Import/setup costs use
 * the pooled per-file mean because the CI reporter records only test bodies.
 */
const testMilliseconds = {
  "src/__tests__/fixtures/remountEquivalence/__tests__/corpus.test.ts": 500,
  "src/__tests__/importModel.test.ts": 5600,
  "src/__tests__/migration/migrationGuide.test.ts": 8600,
  "src/__tests__/pointerIsolation.test.ts": 2000,
  "src/__tests__/publicSurface.test.ts": 11400,
  "src/__tests__/publishedReactTypes.round-five.test.ts": 10100,
  "src/components/FieldProxy/__tests__/renderCounts.test.ts": 1700,
  "src/components/FieldProxy/components/FieldInputBridge/__tests__/layoutCounts.test.ts": 2100,
  "src/components/Form/__tests__/Form.renderCounts.test.ts": 1900,
  "src/core/__tests__/dependencyDirection.test.ts": 800,
  "src/core/__tests__/fixtures/observationIdentity/__tests__/capture.test.ts": 500,
  "src/core/__tests__/regression/selfcheck-v5-notify.test.ts": 800,
  "src/core/__tests__/remount-equivalence/corpus.test.ts": 20000,
  "src/core/__tests__/remount-equivalence/targeted.test.ts": 4600,
  "src/core/engine/__tests__/batchCallerReviewModel.test.ts": 67500,
  "src/core/engine/__tests__/batchDeclarativeWrites.test.ts": 85900,
  "src/core/engine/__tests__/batchTwoLayerContract.test.ts": 600,
  "src/core/engine/__tests__/blueprint.branchless-differential.test.ts": 4100,
  "src/core/engine/__tests__/declarativeWriteRoutingModel.test.ts": 21200,
  "src/core/engine/__tests__/itemless-declarations.fallback.test.ts": 900,
  "src/core/engine/__tests__/itemless-declarations.observations.test.ts": 500,
  "src/core/engine/__tests__/liveWholeFillOrder.test.ts": 800,
  "src/core/engine/__tests__/liveWholeNestedFillExit.test.ts": 600,
  "src/core/engine/__tests__/liveWholeWriteExit.test.ts": 1500,
  "src/core/engine/__tests__/refusedResetOverlap.test.ts": 500,
  "src/core/engine/__tests__/retainedSourceEventModel.test.ts": 7800,
  "src/core/engine/__tests__/retainedSourcesBudget.test.ts": 600,
  "src/core/engine/__tests__/revivedDepartingWriteSecondExit.test.ts": 3600,
  "src/core/engine/__tests__/virtualArrayModel.round-five.test.ts": 6300,
  "src/core/engine/__tests__/virtualStorageModel.round-five.test.ts": 38900,
  "src/core/engine/__tests__/virtualTopologyModel.round-five.test.ts": 8200,
  "src/core/engine/behaviors/utils/parse/__tests__/interpret.properties.test.ts": 2100,
  "src/core/engine/blueprint/compileBlueprintExpressions/__tests__/equality.evaluator.test.ts": 2500,
  "src/core/engine/navigation/__tests__/wildcardScale.round-four.test.ts": 2100,
  "src/core/engine/settle/__tests__/selectChildren.head-differential.test.ts": 2300,
  "src/core/engine/settle/__tests__/settle.admitted-edge-schema.test.ts": 500,
  "src/core/engine/settle/__tests__/settle.array-scaling.test.ts": 15600,
  "src/core/engine/settle/__tests__/settle.delivery-watch-exit.test.ts": 900,
  "src/core/engine/settle/__tests__/settle.delivery-watch-index.test.ts": 500,
  "src/core/engine/settle/__tests__/settle.dirty-consume-modes.test.ts": 21000,
  "src/core/engine/settle/__tests__/settle.feature-pass-scaling.test.ts": 900,
  "src/core/engine/settle/__tests__/settle.gate-predicate-allocation.test.ts": 700,
  "src/core/engine/settle/__tests__/settle.gate-predicate.test.ts": 700,
  "src/core/engine/settle/__tests__/settle.gate-selection.test.ts": 600,
  "src/core/engine/settle/__tests__/settle.gate-table-loading.test.ts": 1900,
  "src/core/engine/settle/__tests__/settle.gate-table-wheel-differential.test.ts": 2900,
  "src/core/engine/settle/__tests__/settle.gate-wheel-counts.test.ts": 800,
  "src/core/engine/settle/__tests__/settle.gate-wheel-differential.test.ts": 2600,
  "src/core/engine/settle/__tests__/settle.host-preparation.test.ts": 700,
  "src/core/engine/settle/__tests__/settle.host-static-partition.test.ts": 700,
  "src/core/engine/settle/__tests__/settle.latent-scaling.test.ts": 800,
  "src/core/engine/settle/__tests__/settle.misfit-scaling.test.ts": 3700,
  "src/core/engine/settle/__tests__/settle.non-wheel-preservation.test.ts": 1300,
  "src/core/engine/settle/__tests__/settle.presence-counts.test.ts": 19900,
  "src/core/engine/settle/__tests__/settle.presence-delta.test.ts": 700,
  "src/core/engine/settle/__tests__/settle.presence-evaluation-counts.test.ts": 20000,
  "src/core/engine/settle/__tests__/settle.presence-index.test.ts": 23800,
  "src/core/engine/settle/__tests__/settle.presence-readers.test.ts": 1400,
  "src/core/engine/settle/__tests__/settle.remount-equivalence-presence-metrics.test.ts": 2600,
  "src/core/engine/settle/__tests__/settle.sibling-preparation.test.ts": 700,
  "src/core/engine/settle/__tests__/settle.static-same-value-write-cost.test.ts": 900,
  "src/core/engine/settle/__tests__/settle.ungated-split-cost.test.ts": 500,
  "src/core/engine/settle/__tests__/settle.write-epoch.test.ts": 800,
  "src/core/engine/settle/arrangeFieldNodeItems/__tests__/settle.array-append-cost.test.ts": 800,
  "src/core/engine/settle/arrangeFieldNodeItems/__tests__/settle.array-append.test.ts": 1600,
  "src/core/engine/settle/arrangeFieldNodeItems/__tests__/settle.array-pop-cost.test.ts": 900,
  "src/core/engine/settle/arrangeFieldNodeItems/__tests__/settle.array-pop.test.ts": 1700,
  "src/core/engine/settle/arrangeFieldNodeItems/__tests__/settle.array-splice-cost.test.ts": 1200,
  "src/core/engine/settle/loadFieldNodeAtMount/__tests__/fixed-first-load.test.ts": 700,
  "src/core/engine/settle/loadFieldNodeAtMount/__tests__/static-first-load-differential.test.ts": 1100,
  "src/core/engine/settle/utils/scratch/__tests__/DirtyPathSet.consume-differential.test.ts": 2300,
  "src/core/engine/validation/__tests__/reentrantValidator.round-three.test.ts": 3000,
  "src/core/engine/write/utils/report/__tests__/forEachFailureLeaf.test.ts": 600,
  "src/core/engine/write/utils/report/__tests__/hostileFailure.test.ts": 500,
  "src/providers/FormErrorContext/__tests__/nestedCapture.test.ts": 500,
  "src/types/__tests__/exactOptional.round-four.test.ts": 22500,
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
      milliseconds: 1000 + (testMilliseconds[path] ?? 90),
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
