/**
 * Loaded directly by tsx/Bun. Public array verbs delegate to dispatchPush and
 * dispatchRemove, including their entry/settlement/delivery completion paths.
 * Each sample has a fresh loaded tree; setup and assertions are outside timing.
 * remove(1) leaves a long tail of n - 2 items whose paths must shift.
 * Lane `mounted` (마운트 직후(참고)) times the verb right after the low-level
 * loadFieldNodeAtMount, so the first verb also drains the pending mount
 * deliveries. Lane `drained` (정착 뒤) mounts through the public mountFieldNode
 * path, whose chain end drains those deliveries before timing starts.
 * Lane `steady` (정상 상태, the contract lane) also pushes once onto a separate
 * one-item tree outside timing, so the engine's shared working set is warm
 * again after the large mount evicted it; lane `cold` instead walks a 64 MB
 * buffer before timing. Time ratios of every lane are reference columns; the
 * contract is judged by work counts (settle.array-append-cost) and --jitless
 * stage timings.
 */
import { performance } from 'node:perf_hooks';

import { isRuntimeFieldNode as isTestFieldNode } from '../../../bench/distEngine/isRuntimeFieldNode';
import { loadDistEngine } from '../../../bench/distEngine/loadDistEngine';
import type { TestFieldNode } from '../../../src/core/__tests__/fixtures/testFieldNode';

const {
  SetValueOption,
  blueprint,
  fieldNodeFactory,
  isArrayNode,
  PathKeyedMap,
  PathKeyedSet,
  loadFieldNodeAtMount,
  mountFieldNode,
  distSha256,
} = await loadDistEngine();
const engine = { source: 'dist', distSha256 };

const smoke = process.argv.includes('--smoke');
const warmups = smoke ? 2 : 20;
const samples = smoke ? 3 : 100;
const removeIndex = 1;
const operations = ['push', 'remove'] as const;
const lanes = [
  { lane: 'mounted', label: '마운트 직후(참고)' },
  { lane: 'drained', label: '정착 뒤(마운트 배달 소진, 참고)' },
  { lane: 'steady', label: '정상 상태(작은 트리 push로 엔진 데움, 계약 레인)' },
  { lane: 'cold', label: '완전히 차가움(64 MB 훑기, 참고)' },
] as const;
const evictionBuffer = new Float64Array((64 * 1024 * 1024) / 8);

/** Create, mount and push once onto a one-item tree so shared engine code and data are cached. */
function warmEngine(): void {
  const tiny = fieldNodeFactory(analysis, {
    diagnostics: { status: 'stable' },
    loadSnapshot: undefined,
    latentRaw: new PathKeyedMap('pair'),
    misfitPaths: new PathKeyedSet(),
    inactiveValuesMemo: new PathKeyedMap<
      readonly { path: string; value: unknown }[]
    >('path'),
  });
  if (!isArrayNode(tiny)) throw new Error('Missing warm-up array node');
  mountFieldNode(tiny, [0], SetValueOption.Overwrite);
  tiny.push(1);
}

/** Read every cache line of a 64 MB buffer so the timed verb starts from evicted caches. */
function evictCaches(): number {
  let sum = 0;
  for (let index = 0; index < evictionBuffer.length; index += 8)
    sum += evictionBuffer[index];
  return sum;
}
const analysis = blueprint({
  type: 'array',
  items: { type: 'number' },
} as const);

/** Return an interpolated quantile of a nonempty sorted timing array. */
function quantile(sorted: number[], p: number): number {
  const at = (sorted.length - 1) * p;
  const low = Math.floor(at);
  return sorted[low] + (sorted[Math.ceil(at)] - sorted[low]) * (at - low);
}

const sizes = lanes.flatMap(({ lane, label }) =>
  operations.flatMap((operation) =>
    (smoke ? [1000, 8000] : [1000, 2000, 4000, 8000]).map((n) => {
      const input = Array.from({ length: n }, (_, index) => index);
      const samplesMs: number[] = [];
      for (let index = -warmups; index < samples; index++) {
        const root = fieldNodeFactory(analysis, {
          diagnostics: { status: 'stable' },
          loadSnapshot: undefined,
          latentRaw: new PathKeyedMap('pair'),
          misfitPaths: new PathKeyedSet(),
          inactiveValuesMemo: new PathKeyedMap<
            readonly { path: string; value: unknown }[]
          >('path'),
        });
        if (!isArrayNode(root) || !isTestFieldNode(root))
          throw new Error('Missing public array node/runtime record');
        const record: TestFieldNode = root;
        if (lane === 'mounted')
          loadFieldNodeAtMount(record, input, SetValueOption.Overwrite);
        else mountFieldNode(root, input, SetValueOption.Overwrite);
        if (lane === 'steady') warmEngine();
        if (lane === 'cold') evictCaches();
        if (root.children?.length !== n || root.value?.length !== n)
          throw new Error(
            `Array fixture length mismatch: ${operation}, N=${n}`,
          );
        const start = performance.now();
        const returned =
          operation === 'push' ? root.push(n) : root.remove(removeIndex);
        const elapsed = performance.now() - start;
        const expectedLength = operation === 'push' ? n + 1 : n - 1;
        const output = root.value;
        if (
          returned !== (operation === 'push' ? expectedLength : removeIndex) ||
          !Array.isArray(output) ||
          output.length !== expectedLength ||
          root.children?.length !== expectedLength
        )
          throw new Error(`Array verb did not commit: ${operation}, N=${n}`);
        for (let position = 0; position < expectedLength; position++) {
          const expected =
            operation === 'remove' && position >= removeIndex
              ? position + 1
              : position;
          const child = root.children[position];
          if (
            output[position] !== expected ||
            child.name !== String(position) ||
            child.path !== `/${position}` ||
            child.emit !== expected
          )
            throw new Error(
              `Array output/path mismatch: ${operation}, N=${n}, at ${position}`,
            );
        }
        if (index >= 0) samplesMs.push(elapsed);
      }
      const sorted = [...samplesMs].sort((a, b) => a - b);
      return {
        lane,
        laneLabel: label,
        operation,
        n,
        ...(operation === 'remove'
          ? { removeIndex, tailLength: n - removeIndex - 1 }
          : {}),
        medianMs: quantile(sorted, 0.5),
        p10Ms: quantile(sorted, 0.1),
        p90Ms: quantile(sorted, 0.9),
        meanMs: samplesMs.reduce((sum, ms) => sum + ms, 0) / samples,
        samplesMs,
      };
    }),
  ),
);

console.log(
  JSON.stringify({
    probe: 'array-verbs',
    engine,
    ledgerRow: 'NODE-026 / SETTLE-017 (array verbs)',
    runtime: Reflect.get(globalThis, 'Bun') ? 'bun' : 'node',
    version: Reflect.get(globalThis, 'Bun')
      ? process.versions.bun
      : process.version,
    nodeEnv: process.env.NODE_ENV ?? 'unset',
    warmups,
    samples,
    sizes,
    ratios: lanes.flatMap(({ lane }) =>
      operations.flatMap((operation) => {
        const rows = sizes.filter(
          (row) => row.lane === lane && row.operation === operation,
        );
        return rows.slice(1).map((row, index) => ({
          lane,
          operation,
          from: rows[index].n,
          to: row.n,
          medianRatio: row.medianMs / rows[index].medianMs,
          ...(operation === 'remove'
            ? {
                tailLengthRatio:
                  (row.n - removeIndex - 1) / (rows[index].n - removeIndex - 1),
              }
            : {}),
        }));
      }),
    ),
  }),
);
