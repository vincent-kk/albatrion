/**
 * Legacy (0.16.x) counterpart of probe-array-verbs.ts, lane `steady` only.
 * Loaded directly by tsx/Bun; the release bundle comes from --bundle=<dist/index.mjs>
 * and only its root exports are used (Form, isArrayNode).
 *
 * Tree creation. 0.16.x exports no React-free tree constructor (nodeFromJSONSchema
 * is internal and absent from the bundle's export list), so each tree comes from
 * the public <Form>, mounted once with react-dom/client into a jsdom container
 * (flushSync render, which also runs the passive effects) and unmounted again
 * (flushSync unmount), all outside timing. React, react-dom and jsdom resolve from
 * the bundle's own location so bundle and renderer share one React. The children
 * render prop (FormChildrenProps.node) hands back the root ArrayNode and returns
 * null, so no input components render. The mount's effect calls Form's onReady,
 * which opens Form's onChange forwarding; the unmount removes every React
 * subscription on the node (no Form code cleans the node itself up). The tree
 * keeps working afterwards, and Form's public `onChange` prop stays live: it is
 * the hook for criterion (1) below, with no React work left inside timing.
 *
 * Settlement in 0.16.x. A verb mutates the child list synchronously, then
 *   1. microtasks: the RequestEmitChange batch recomputes the array value, calls
 *      the root's change handler and dispatches UpdateValue; follow-up batches
 *      deliver UpdateChildren on the root and UpdatePath on every renamed child;
 *   2. macrotask (setImmediate): the verb's returned promise resolves;
 *   3. macrotask (setImmediate), queued during step 1: the root's debounced
 *      onChange (afterMicrotask) reads normalizedValue and calls Form's
 *      handleChange, which forwards to the `onChange` prop.
 * setValue settles steps 1 and 3 the same way but returns undefined.
 *
 * Timed region. performance.now() is read immediately before the verb call. The
 * clock stops at the later of (1) the Form `onChange` prop being called with the
 * expected value (expected length and the expected values at the checkpoint
 * positions) and (2) the root value, root child count, and each checkpoint child's
 * value and path equalling the expectation. The `onChange` recorder is the same
 * function the current probe attaches: it reads performance.now() first and stores
 * the value; the probe's check then runs synchronously in the same callback, after
 * that timestamp, so the check is outside the region. In this release (1) comes
 * after the value is final, so (2) already holds there; should (2) still be false,
 * a fallback loop (one microtask hop, then one setImmediate hop, repeated) rechecks
 * after every hop and stops the clock at the first check that passes (timestamp
 * read before the check). The loop only keeps the event loop moving; it is capped
 * at 1,000 hops or 1 s, after which the row is marked failed with no time. Per
 * sample the probe records how many of its own microtask and macrotask hops had
 * completed at completion; the row reports their medians, and `completedInOnChange`
 * counts samples whose completion was detected inside onChange rather than by the
 * fallback loop. Nothing is subtracted.
 * `hopBaselineMs` (two setImmediate hops with no verb) stays as a reference only.
 * Checkpoints: push/set-grow the new last item; pop the new last item; remove the
 * edited position (when it still exists) and the last item; update-mid and
 * set-same-length the middle; clear none (empty).
 *
 * Steady lane. Each sample builds a fresh loaded tree (mount/unmount, then three
 * rounds of two setImmediate hops drain construction work), then warms the engine
 * like the current probe: a fresh one-item tree [0] (same mount/unmount, no
 * onChange) gets one push(1), drained the same way. React code therefore runs
 * between the large tree and the warm push; the warm push and its drain are the
 * last code before timing. After timing the full value, child names and paths are
 * asserted with the current probe's expectations, and the returned value is read
 * from the already-resolved verb promise.
 *
 * Operations: push, pop, remove-front/remove(1)/remove-mid/remove-end, update-mid,
 * clear, set-same-length, set-grow. insert-front/insert-mid/insert-end have no API
 * in 0.16.x and are reported as `API 없음` rows without a measurement.
 * Options: --bundle=<path to dist/index.mjs> (required), --operations=a,b,
 * --sizes=1000,8000 (default 1000,8000), --smoke lowers samples, --check runs one
 * single sample per row with no warm-up and no hop baseline (correctness only).
 */
import { createHash } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';

/** Root array node surface of 0.16.x used by this probe (ArrayNode public members). */
interface LegacyArrayNode {
  readonly value: number[] | undefined;
  readonly children: readonly { node: LegacyChildNode }[] | null;
  push(data?: unknown): Promise<number>;
  pop(): Promise<unknown>;
  update(index: number, data: unknown): Promise<unknown>;
  remove(index: number): Promise<unknown>;
  clear(): Promise<void>;
  setValue(input: unknown, option?: number): void;
  insert?: unknown;
}
/** Child number node surface read by the assertions. */
interface LegacyChildNode {
  readonly name: string;
  readonly path: string;
  readonly value: unknown;
}
/** Root exports of the legacy bundle that this probe touches. */
interface LegacyBundle {
  Form: unknown;
  isArrayNode: (node: unknown) => boolean;
}
/** Consumer onChange recorder; identical in both probes so the consumer cost is equal. */
interface ChangeRecorder {
  calls: number;
  value: unknown;
  at: number;
  onCall: (() => void) | undefined;
  readonly onChange: (value: unknown) => void;
}

/** Create the recorder: the callback reads the clock first, stores the value, then runs the probe hook. */
function createChangeRecorder(): ChangeRecorder {
  const recorder: ChangeRecorder = {
    calls: 0,
    value: undefined,
    at: 0,
    onCall: undefined,
    onChange: (value) => {
      const at = performance.now();
      recorder.calls++;
      recorder.value = value;
      recorder.at = at;
      recorder.onCall?.();
    },
  };
  return recorder;
}

/** Read a scalar option such as `--bundle=x`; undefined when absent. */
function scalarOption(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv
    .find((value) => value.startsWith(prefix))
    ?.slice(prefix.length);
}
/** Read a comma-list option such as `--sizes=a,b`; undefined when absent. */
function listOption(name: string): string[] | undefined {
  return scalarOption(name)?.split(',').filter(Boolean);
}

const bundleOption = scalarOption('bundle');
if (!bundleOption)
  throw new Error('--bundle=<path to dist/index.mjs> is required');
const bundlePath = realpathSync(bundleOption);
const distSha256 = createHash('sha256')
  .update(readFileSync(bundlePath))
  .digest('hex');
const requireFromBundle = createRequire(bundlePath);
/** Import a CommonJS module the bundle resolves, unwrapping the ESM default namespace. */
async function importFromBundle<T>(specifier: string): Promise<T> {
  const namespace = (await import(
    pathToFileURL(requireFromBundle.resolve(specifier)).href
  )) as { default?: T };
  return namespace.default ?? (namespace as T);
}
const { JSDOM } = await importFromBundle<{
  JSDOM: new (html: string) => { window: Window & typeof globalThis };
}>('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>');
Reflect.set(globalThis, 'window', dom.window);
Reflect.set(globalThis, 'document', dom.window.document);
const bundle = (await import(pathToFileURL(bundlePath).href)) as LegacyBundle;
const React = await importFromBundle<{
  createElement: (...args: unknown[]) => unknown;
  version: string;
}>('react');
const ReactDOM = await importFromBundle<{
  flushSync: (callback: () => void) => void;
}>('react-dom');
const ReactDOMClient = await importFromBundle<{
  createRoot: (container: Element) => {
    render: (element: unknown) => void;
    unmount: () => void;
  };
}>('react-dom/client');
const bundleVersion = (
  JSON.parse(
    readFileSync(requireFromBundle.resolve('../package.json'), 'utf8'),
  ) as { version: string }
).version;
const engine = {
  source: 'legacy-dist',
  version: bundleVersion,
  bundlePath,
  distSha256,
  react: React.version,
};

const smoke = process.argv.includes('--smoke');
const check = process.argv.includes('--check');
const warmups = check ? 0 : smoke ? 2 : 20;
const samples = check ? 1 : smoke ? 3 : 100;
const hopCap = 1000;
const timeCapMs = 1000;

const schema = { type: 'array', items: { type: 'number' } } as const;

/** Mount the public <Form> once, capture its root array node, and unmount React again. */
function createTree(
  defaultValue: number[],
  onChange?: (value: unknown) => void,
): LegacyArrayNode {
  let captured: unknown;
  const container = document.createElement('div');
  const root = ReactDOMClient.createRoot(container);
  ReactDOM.flushSync(() =>
    root.render(
      React.createElement(bundle.Form, {
        jsonSchema: schema,
        defaultValue,
        onChange,
        children: ({ node }: { node: unknown }) => {
          captured = node;
          return null;
        },
      }),
    ),
  );
  ReactDOM.flushSync(() => root.unmount());
  if (!bundle.isArrayNode(captured))
    throw new Error('Form did not hand back a root array node');
  return captured as LegacyArrayNode;
}

/** Resolve after two setImmediate turns: every microtask and every immediate queued before the first has run. */
const twoHops = (): Promise<void> =>
  new Promise((resolve) => setImmediate(() => setImmediate(resolve)));
const microtaskHop = (): Promise<void> =>
  new Promise((resolve) => queueMicrotask(resolve));
const macrotaskHop = (): Promise<void> =>
  new Promise((resolve) => setImmediate(resolve));
/** Run pending construction or warm-up deliveries to completion, outside timing. */
async function drain(): Promise<void> {
  for (let hop = 0; hop < 3; hop++) await twoHops();
}
/** Create a one-item tree and push once so shared engine code and data are cached. */
async function warmEngine(): Promise<void> {
  const tiny = createTree([0]);
  await drain();
  await tiny.push(1);
  await drain();
}

/** One public array verb: its call, its argument, and the exact array it must leave behind. */
interface OperationSpec {
  name: string;
  removeIndex?: (n: number) => number;
  argument: (n: number) => unknown;
  invoke?: (root: LegacyArrayNode, argument: unknown, n: number) => unknown;
  returned: (n: number) => unknown;
  expected: (n: number) => number[];
  checkpoints: (n: number) => number[];
}
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
  checkpoints: (n) => (index(n) < n - 1 ? [index(n), n - 2] : [n - 2]),
});
const insertSpec = (name: string): OperationSpec => ({
  name,
  argument: () => -1,
  returned: () => undefined,
  expected: () => [],
  checkpoints: () => [],
});
const operationSpecs: OperationSpec[] = [
  {
    name: 'push',
    argument: (n) => n,
    invoke: (root, argument) => root.push(argument),
    returned: (n) => n + 1,
    expected: (n) => range(0, n + 1),
    checkpoints: (n) => [n],
  },
  {
    name: 'pop',
    argument: () => undefined,
    invoke: (root) => root.pop(),
    returned: (n) => n - 1,
    expected: (n) => range(0, n - 1),
    checkpoints: (n) => [n - 2],
  },
  removeSpec('remove-front', () => 0),
  removeSpec('remove', () => 1),
  removeSpec('remove-mid', middle),
  removeSpec('remove-end', (n) => n - 1),
  insertSpec('insert-front'),
  insertSpec('insert-mid'),
  insertSpec('insert-end'),
  {
    name: 'update-mid',
    argument: () => -1,
    invoke: (root, argument, n) => root.update(middle(n), argument),
    returned: () => -1,
    expected: withMiddleChanged,
    checkpoints: (n) => [middle(n)],
  },
  {
    name: 'clear',
    argument: () => undefined,
    invoke: (root) => root.clear(),
    returned: () => undefined,
    expected: () => [],
    checkpoints: () => [],
  },
  {
    name: 'set-same-length',
    argument: withMiddleChanged,
    invoke: (root, argument) => root.setValue(argument as number[]),
    returned: () => undefined,
    expected: withMiddleChanged,
    checkpoints: (n) => [middle(n)],
  },
  {
    name: 'set-grow',
    argument: (n) => range(0, n + 1),
    invoke: (root, argument) => root.setValue(argument as number[]),
    returned: () => undefined,
    expected: (n) => range(0, n + 1),
    checkpoints: (n) => [n],
  },
];
const lane = 'steady';
const laneLabel = '정상 상태(작은 트리 push로 엔진 데움, 계약 레인)';

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
const selectedOperations = select(
  'operations',
  operationSpecs,
  (item) => item.name,
);
const selectedSizes = (listOption('sizes') ?? ['1000', '8000']).map(Number);
if (selectedSizes.some((n) => !Number.isInteger(n) || n < 4))
  throw new Error('--sizes needs integers of at least 4');

/** Return an interpolated quantile of a nonempty sorted timing array. */
function quantile(sorted: number[], p: number): number {
  const at = (sorted.length - 1) * p;
  const low = Math.floor(at);
  return sorted[low] + (sorted[Math.ceil(at)] - sorted[low]) * (at - low);
}
const median = (values: number[]): number =>
  quantile(
    [...values].sort((a, b) => a - b),
    0.5,
  );

/** Criterion (1): an emitted value with the expected length and checkpoint values. */
function matchesChange(
  value: unknown,
  expected: number[],
  checkpoints: number[],
): boolean {
  return (
    Array.isArray(value) &&
    value.length === expected.length &&
    checkpoints.every((position) => value[position] === expected[position])
  );
}
/** Criterion (2): root value, child count and checkpoint children's value and path. */
function nodesSettled(
  root: LegacyArrayNode,
  expected: number[],
  checkpoints: number[],
): boolean {
  const children = root.children;
  if (
    !matchesChange(root.value, expected, checkpoints) ||
    (children?.length ?? 0) !== expected.length
  )
    return false;
  return checkpoints.every((position) => {
    const child = children?.[position]?.node;
    return child?.value === expected[position] && child.path === `/${position}`;
  });
}

/** Throw unless the root holds exactly `expected` with children named and pathed by index. */
function assertCommitted(
  root: LegacyArrayNode,
  expected: number[],
  label: string,
): void {
  const output = root.value;
  const children = root.children;
  if (
    !Array.isArray(output) ||
    output.length !== expected.length ||
    children?.length !== expected.length
  )
    throw new Error(`Array verb did not commit: ${label}`);
  for (let position = 0; position < expected.length; position++) {
    const child = children[position].node;
    if (
      output[position] !== expected[position] ||
      child.name !== String(position) ||
      child.path !== `/${position}` ||
      child.value !== expected[position]
    )
      throw new Error(`Array output/path mismatch: ${label}, at ${position}`);
  }
}

/** Outcome of one timed sample: completion time and the probe hops completed by then. */
type SampleOutcome =
  | {
      ok: true;
      elapsed: number;
      microtaskHops: number;
      macrotaskHops: number;
      inOnChange: boolean;
    }
  | { ok: false; reason: string };

/** Time one verb until (1) and (2) both hold, keeping the event loop moving with capped hops. */
async function timeVerb(
  spec: OperationSpec & {
    invoke: NonNullable<OperationSpec['invoke']>;
  },
  root: LegacyArrayNode,
  recorder: ChangeRecorder,
  argument: unknown,
  n: number,
  expected: number[],
  checkpoints: number[],
): Promise<SampleOutcome & { returnedSlot?: unknown }> {
  const hops = { microtask: 0, macrotask: 0 };
  let completedAt: number | undefined;
  let completedHops = { microtask: 0, macrotask: 0 };
  let changeSeen = false;
  let inOnChange = false;
  const complete = (at: number, fromOnChange: boolean): void => {
    completedAt = at;
    completedHops = { ...hops };
    inOnChange = fromOnChange;
  };
  recorder.calls = 0;
  recorder.onCall = () => {
    if (completedAt !== undefined) return;
    if (!changeSeen && matchesChange(recorder.value, expected, checkpoints))
      changeSeen = true;
    if (changeSeen && nodesSettled(root, expected, checkpoints))
      complete(recorder.at, true);
  };
  const recheck = (): void => {
    if (completedAt !== undefined || !changeSeen) return;
    const at = performance.now();
    if (nodesSettled(root, expected, checkpoints)) complete(at, false);
  };
  const start = performance.now();
  const returnedSlot = spec.invoke(root, argument, n);
  while (completedAt === undefined) {
    if (
      hops.microtask + hops.macrotask >= hopCap ||
      performance.now() - start > timeCapMs
    )
      break;
    await microtaskHop();
    hops.microtask++;
    recheck();
    if (completedAt !== undefined) break;
    await macrotaskHop();
    hops.macrotask++;
    recheck();
  }
  recorder.onCall = undefined;
  if (completedAt === undefined)
    return {
      ok: false,
      reason: changeSeen
        ? 'onChange matched but nodes never settled'
        : `onChange never matched (calls: ${recorder.calls})`,
      returnedSlot,
    };
  return {
    ok: true,
    elapsed: completedAt - start,
    microtaskHops: completedHops.microtask,
    macrotaskHops: completedHops.macrotask,
    inOnChange,
    returnedSlot,
  };
}

const hopSamples: number[] = [];
if (!check)
  for (let index = -warmups; index < samples; index++) {
    const start = performance.now();
    await twoHops();
    const elapsed = performance.now() - start;
    if (index >= 0) hopSamples.push(elapsed);
  }
const hopBaselineMs = check ? null : median(hopSamples);

const sizes: Record<string, unknown>[] = [];
for (const spec of selectedOperations) {
  for (const n of selectedSizes) {
    const operation = spec.name;
    const { invoke } = spec;
    if (!invoke) {
      const probeRoot = createTree([0]);
      if (probeRoot.insert !== undefined)
        throw new Error(`insert exists in this release; measure ${operation}`);
      sizes.push({
        lane,
        laneLabel,
        operation,
        n,
        measured: false,
        status: 'API 없음',
        medianMs: null,
        p10Ms: null,
        p90Ms: null,
        meanMs: null,
        samplesMs: [],
      });
      continue;
    }
    const input = range(0, n);
    const expectedOutput = spec.expected(n);
    const expectedReturned = spec.returned(n);
    const checkpoints = spec.checkpoints(n);
    const argument = spec.argument(n);
    const label = `${operation}, N=${n}`;
    const samplesMs: number[] = [];
    const microtaskHops: number[] = [];
    const macrotaskHops: number[] = [];
    let completedInOnChange = 0;
    let failure: string | undefined;
    for (let index = -warmups; index < samples; index++) {
      const recorder = createChangeRecorder();
      const root = createTree(input, recorder.onChange);
      if (recorder.calls === 0)
        throw new Error(`Form onChange forwarding is not live: ${label}`);
      await drain();
      await warmEngine();
      assertCommitted(root, input, `fixture ${label}`);
      const outcome = await timeVerb(
        { ...spec, invoke },
        root,
        recorder,
        argument,
        n,
        expectedOutput,
        checkpoints,
      );
      if (!outcome.ok) {
        failure = outcome.reason;
        break;
      }
      const returned = await outcome.returnedSlot;
      if (returned !== expectedReturned)
        throw new Error(
          `Unexpected verb result: ${label}: ${String(returned)}`,
        );
      assertCommitted(root, expectedOutput, label);
      if (index >= 0) {
        samplesMs.push(outcome.elapsed);
        microtaskHops.push(outcome.microtaskHops);
        macrotaskHops.push(outcome.macrotaskHops);
        if (outcome.inOnChange) completedInOnChange++;
      }
    }
    const removeIndex = spec.removeIndex?.(n);
    const removeFields =
      removeIndex === undefined
        ? {}
        : { removeIndex, tailLength: n - removeIndex - 1 };
    if (failure !== undefined) {
      sizes.push({
        lane,
        laneLabel,
        operation,
        n,
        measured: false,
        status: 'failed',
        failure,
        ...removeFields,
        medianMs: null,
        p10Ms: null,
        p90Ms: null,
        meanMs: null,
        samplesMs: [],
      });
      continue;
    }
    const sorted = [...samplesMs].sort((a, b) => a - b);
    sizes.push({
      lane,
      laneLabel,
      operation,
      n,
      measured: true,
      ...removeFields,
      medianMs: quantile(sorted, 0.5),
      p10Ms: quantile(sorted, 0.1),
      p90Ms: quantile(sorted, 0.9),
      meanMs: samplesMs.reduce((sum, ms) => sum + ms, 0) / samples,
      completionMicrotaskHopsMedian: median(microtaskHops),
      completionMacrotaskHopsMedian: median(macrotaskHops),
      completedInOnChange,
      samplesMs,
    });
  }
}

console.log(
  JSON.stringify({
    probe: 'array-verbs-legacy',
    engine,
    ledgerRow: 'NODE-026 / SETTLE-017 (array verbs, legacy column)',
    runtime: Reflect.get(globalThis, 'Bun') ? 'bun' : 'node',
    version: Reflect.get(globalThis, 'Bun')
      ? process.versions.bun
      : process.version,
    nodeEnv: process.env.NODE_ENV ?? 'unset',
    warmups,
    samples,
    completion:
      'later of Form onChange called with the expected value and node value/path settled; probe hops capped at 1000 or 1 s',
    hopBaselineMs,
    sizes,
    ratios: selectedOperations.flatMap(({ name: operation }) => {
      const rows = sizes.filter(
        (row) => row.operation === operation && row.measured,
      );
      return rows.slice(1).map((row, index) => {
        const before = rows[index];
        const tailBefore =
          'tailLength' in before ? before.tailLength : undefined;
        const tailAfter = 'tailLength' in row ? row.tailLength : undefined;
        return {
          lane,
          operation,
          from: before.n,
          to: row.n,
          medianRatio: (row.medianMs as number) / (before.medianMs as number),
          ...(tailAfter !== undefined && tailBefore
            ? { tailLengthRatio: tailAfter / tailBefore }
            : {}),
        };
      });
    }),
  }),
);
