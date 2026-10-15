/**
 * Loaded directly by tsx/Bun. Public array verbs delegate to dispatchPush and
 * dispatchRemove, including their entry/settlement/delivery completion paths.
 * Each sample has a fresh loaded tree; setup and assertions are outside timing.
 * Operations: push, pop, remove-front/remove(1)/remove-mid/remove-end,
 * insert-front/insert-mid/insert-end, update-mid, clear, set-same-length and
 * set-grow (whole-array setValue). remove(1) leaves a
 * long tail of n - 2 items whose paths must shift.
 * Options: --lanes=a,b --operations=a,b --sizes=1000,2000 (defaults: all lanes,
 * all operations, 1000,2000,4000,8000); --smoke lowers samples and sizes.
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

/** One public array verb: its call, its argument, and the exact array it must leave behind. */
interface OperationSpec {
  name: string;
  removeIndex?: (n: number) => number;
  argument: (n: number) => unknown;
  invoke: (root: ArrayRoot, argument: unknown, n: number) => unknown;
  returned: (n: number) => unknown;
  expected: (n: number) => number[];
}
type ArrayRoot = Extract<
  ReturnType<typeof fieldNodeFactory>,
  { push: unknown }
>;

const range = (from: number, to: number): number[] =>
  Array.from({ length: Math.max(0, to - from) }, (_, index) => from + index);
const middle = (n: number): number => Math.floor(n / 2);
const without = (n: number, index: number): number[] => [
  ...range(0, index),
  ...range(index + 1, n),
];
const withMiddleChanged = (n: number): number[] =>
  range(0, n).map((value) => (value === middle(n) ? -1 : value));
const removeSpec = (
  name: string,
  index: (n: number) => number,
): OperationSpec => ({
  name,
  removeIndex: index,
  argument: index,
  invoke: (root, argument) => root.remove(argument as number),
  returned: index,
  expected: (n) => without(n, index(n)),
});
const insertSpec = (
  name: string,
  index: (n: number) => number,
): OperationSpec => ({
  name,
  argument: () => -1,
  invoke: (root, argument, n) => root.insert(index(n), argument),
  returned: (n) => n + 1,
  expected: (n) => [...range(0, index(n)), -1, ...range(index(n), n)],
});
const operationSpecs: OperationSpec[] = [
  {
    name: 'push',
    argument: (n) => n,
    invoke: (root, argument) => root.push(argument),
    returned: (n) => n + 1,
    expected: (n) => range(0, n + 1),
  },
  {
    name: 'pop',
    argument: () => undefined,
    invoke: (root) => root.pop(),
    returned: (n) => n - 1,
    expected: (n) => range(0, n - 1),
  },
  removeSpec('remove-front', () => 0),
  removeSpec('remove', () => 1),
  removeSpec('remove-mid', middle),
  removeSpec('remove-end', (n) => n - 1),
  insertSpec('insert-front', () => 0),
  insertSpec('insert-mid', middle),
  insertSpec('insert-end', (n) => n),
  {
    name: 'update-mid',
    argument: () => -1,
    invoke: (root, argument, n) => root.update(middle(n), argument),
    returned: () => -1,
    expected: withMiddleChanged,
  },
  {
    name: 'clear',
    argument: () => undefined,
    invoke: (root) => root.clear(),
    returned: () => undefined,
    expected: () => [],
  },
  {
    name: 'set-same-length',
    argument: withMiddleChanged,
    invoke: (root, argument) => root.setValue(argument as number[]),
    returned: () => undefined,
    expected: withMiddleChanged,
  },
  {
    name: 'set-grow',
    argument: (n) => range(0, n + 1),
    invoke: (root, argument) => root.setValue(argument as number[]),
    returned: () => undefined,
    expected: (n) => range(0, n + 1),
  },
];
const lanes = [
  { lane: 'mounted', label: '마운트 직후(참고)' },
  { lane: 'drained', label: '정착 뒤(마운트 배달 소진, 참고)' },
  { lane: 'steady', label: '정상 상태(작은 트리 push로 엔진 데움, 계약 레인)' },
  { lane: 'cold', label: '완전히 차가움(64 MB 훑기, 참고)' },
] as const;

/** Read a comma-list option such as `--lanes=a,b`; undefined when absent. */
function listOption(name: string): string[] | undefined {
  const prefix = `--${name}=`;
  const argument = process.argv.find((value) => value.startsWith(prefix));
  return argument?.slice(prefix.length).split(',').filter(Boolean);
}
/** Keep the catalog entries whose key the option names; unknown names throw. */
function select<T>(
  name: string,
  catalog: readonly T[],
  key: (item: T) => string,
): T[] {
  const wanted = listOption(name);
  if (!wanted) return [...catalog];
  const unknown = wanted.filter(
    (item) => !catalog.some((c) => key(c) === item),
  );
  if (unknown.length > 0)
    throw new Error(`Unknown --${name}: ${unknown.join(',')}`);
  return catalog.filter((item) => wanted.includes(key(item)));
}
const allLanes = lanes;
const selectedLanes = select('lanes', allLanes, (item) => item.lane);
const selectedOperations = select(
  'operations',
  operationSpecs,
  (item) => item.name,
);
const selectedSizes = (
  listOption('sizes') ??
  (smoke ? ['1000', '8000'] : ['1000', '2000', '4000', '8000'])
).map(Number);
if (selectedSizes.some((n) => !Number.isInteger(n) || n < 4))
  throw new Error('--sizes needs integers of at least 4');
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

const sizes = selectedLanes.flatMap(({ lane, label }) =>
  selectedOperations.flatMap((spec) =>
    selectedSizes.map((n) => {
      const operation = spec.name;
      const input = range(0, n);
      const expectedOutput = spec.expected(n);
      const expectedReturned = spec.returned(n);
      const argument = spec.argument(n);
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
        const returned = spec.invoke(root, argument, n);
        const elapsed = performance.now() - start;
        const output = root.value;
        if (
          returned !== expectedReturned ||
          !Array.isArray(output) ||
          output.length !== expectedOutput.length ||
          root.children?.length !== expectedOutput.length
        )
          throw new Error(`Array verb did not commit: ${operation}, N=${n}`);
        for (let position = 0; position < expectedOutput.length; position++) {
          const expected = expectedOutput[position];
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
      const removeIndex = spec.removeIndex?.(n);
      return {
        lane,
        laneLabel: label,
        operation,
        n,
        ...(removeIndex === undefined
          ? {}
          : { removeIndex, tailLength: n - removeIndex - 1 }),
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
    ratios: selectedLanes.flatMap(({ lane }) =>
      selectedOperations.flatMap(({ name: operation }) => {
        const rows = sizes.filter(
          (row) => row.lane === lane && row.operation === operation,
        );
        return rows.slice(1).map((row, index) => {
          const tailBefore = rows[index].tailLength;
          return {
            lane,
            operation,
            from: rows[index].n,
            to: row.n,
            medianRatio: row.medianMs / rows[index].medianMs,
            ...(row.tailLength !== undefined && tailBefore
              ? { tailLengthRatio: row.tailLength / tailBefore }
              : {}),
          };
        });
      }),
    ),
  }),
);
