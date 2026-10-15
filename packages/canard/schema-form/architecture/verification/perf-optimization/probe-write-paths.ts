/**
 * Loaded directly by tsx/Bun. Frequent write paths of the new engine, lane `steady`
 * only, mirroring probe-array-verbs.ts; probe-legacy-write-paths.ts measures the
 * same scenes on 0.16.x.
 * Scenes: width K = keys on the host object (--sizes, default 10,100,1000) and depth
 * D = nesting depth with width 4 per level (--depths, default 1,4,8).
 * - leaf-input: writeFieldNodeInput(leaf, -1, Overwrite), the call FieldInputSlot's
 *   handleChange makes (value write, external-error clearing and dirty in one batch).
 * - leaf-overwrite / leaf-merge: leaf.setValue(-1, Overwrite / Merge).
 * - object-one-key / object-all-keys: h.setValue(next, Overwrite) on host `h` of a
 *   root `{ h: {...K keys} }`; object-same-ref: h.setValue(h.value, Overwrite);
 *   object-merge-one: h.setValue({ key: -1 }, Merge).
 * - nested-leaf: writeFieldNodeInput on the deepest leaf of a D-deep object.
 * - handle-root: root.setValue(next) with one key changed. The steady lane has no
 *   FormHandle; FormRoot's handle.setValue only forwards to root.setValue(value,
 *   options), so the root call is the handle's whole engine path.
 * - nested-wide-leaf: writeFieldNodeInput on the deepest leaf of a D-deep object with
 *   W keys at every level (`o` plus W−1 numbers; --wide-width, default 100;
 *   --wide-depths, default 1,2,4), isolating each ancestor's output comparison.
 * - latent-object-one-key: h.setValue(next, Overwrite) with one key changed while a
 *   closed `then` branch keeps K values as latent raw (supplied at mount).
 * - misfit-object-one-key: the same write while a sibling host holds K strings in
 *   number fields (K misfit paths).
 * - gate-toggle-exit: writeFieldNodeInput(flag, false) closes the gate of one field
 *   (`controls.active: '../flag'`) beside N watchers (`controls.watch: ['../a']`);
 *   the width is N.
 * - gate-form-one-key: writeFieldNodeInput(h.sw, 2) on host `h` whose K children are
 *   each gated on `'../sw >= 0'`; every gate is re-evaluated and stays open.
 * Each sample builds a fresh tree (fieldNodeFactory + mountFieldNode), then warms the
 * engine with one leaf input write on a separate one-item object tree, outside timing.
 * Completion criterion, shared with the legacy probe: the root carries the consumer
 * `onChange` (runtime seed, the hook Form wires) whose recorder reads the clock, stores
 * the value and returns. The timed region ends when the call returns; right after,
 * outside timing, the probe checks (1) onChange was called with the expected value and
 * (2) the root value, host and target nodes' values and paths hold. A sample failing
 * the check is counted in `incompleteAtReturn` instead of being waited for. For
 * object-same-ref (1) is optional: the row records how many samples fired onChange.
 * The final root value is compared with the expectation in full after every sample,
 * and input scenes check the target is dirty.
 * Options: --operations=a,b --sizes=10,100 --depths=1,4 --wide-width=100
 * --wide-depths=1,2,4; --smoke lowers samples;
 * --check runs a single sample per row with no warm-up (correctness only).
 */
import { performance } from 'node:perf_hooks';

import { loadDistEngine } from '../../../bench/distEngine/loadDistEngine';

const {
  SetValueOption,
  blueprint,
  fieldNodeFactory,
  PathKeyedMap,
  PathKeyedSet,
  mountFieldNode,
  writeFieldNodeInput,
  FieldNodeState,
  distSha256,
} = await loadDistEngine();
/** Scenes that go through the input binding and so must leave the target dirty. */
const INPUT_SCENES = new Set([
  'leaf-input',
  'nested-leaf',
  'nested-wide-leaf',
  'gate-toggle-exit',
  'gate-form-one-key',
]);
const engine = { source: 'dist', distSha256 };

const smoke = process.argv.includes('--smoke');
const check = process.argv.includes('--check');
const warmups = check ? 0 : smoke ? 2 : 20;
const samples = check ? 1 : smoke ? 3 : 100;

/** Public FieldNode, the type the input binding accepts. */
type WriteNode = Parameters<typeof writeFieldNodeInput>[0];
/** Authored schema accepted by blueprint. */
type SchemaInput = Parameters<typeof blueprint>[0];
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

type Plain = Record<string, unknown>;
/** Nodes and argument resolved outside timing for one sample. */
interface Prepared {
  target: WriteNode;
  host: WriteNode;
  argument: unknown;
  previousHostValue: unknown;
}
/** One write scene: its tree, its call, and the state it must leave behind. */
interface OperationSpec {
  name: string;
  dimension: 'width' | 'depth' | 'wide-depth';
  schema: (size: number) => Plain;
  input: (size: number) => Plain;
  /** Root value right after the mount when it differs from the input (closed branches). */
  loaded?: (size: number) => Plain;
  /** Check the scene's form-wide condition outside timing and return it for the row. */
  fixture?: (root: WriteNode, size: number) => Plain;
  prepare: (root: WriteNode, size: number) => Prepared;
  invoke: (root: WriteNode, prepared: Prepared) => void;
  expected: (size: number) => Plain;
  /** Pointer to each value the criteria check, with its expected value. */
  checkpoints: (size: number) => [pointer: string, value: unknown][];
  changeOptional?: boolean;
}

const keyOf = (index: number): string => `k${index}`;
const middleKey = (width: number): string => keyOf(Math.floor(width / 2));
const flatSchema = (width: number): Plain => ({
  type: 'object',
  properties: Object.fromEntries(
    Array.from({ length: width }, (_, i) => [keyOf(i), { type: 'number' }]),
  ),
});
const flatInput = (width: number, offset = 0): Plain =>
  Object.fromEntries(
    Array.from({ length: width }, (_, i) => [keyOf(i), i + offset]),
  );
const withKey = (value: Plain, key: string, next: unknown): Plain => ({
  ...value,
  [key]: next,
});
/** Depth-D object: each level holds `o` (next level) and three numbers; the bottom holds a..d. */
const nestedSchema = (depth: number): Plain =>
  depth <= 1
    ? {
        type: 'object',
        properties: Object.fromEntries(
          ['a', 'b', 'c', 'd'].map((key) => [key, { type: 'number' }]),
        ),
      }
    : {
        type: 'object',
        properties: {
          o: nestedSchema(depth - 1),
          a: { type: 'number' },
          b: { type: 'number' },
          c: { type: 'number' },
        },
      };
const nestedInput = (depth: number, leaf = 1): Plain =>
  depth <= 1
    ? { a: 0, b: leaf, c: 2, d: 3 }
    : { o: nestedInput(depth - 1, leaf), a: 0, b: 1, c: 2 };
const nestedLeafPath = (depth: number): string => '/o'.repeat(depth - 1) + '/b';
const wideWidth = Number(
  process.argv.find((value) => value.startsWith('--wide-width='))?.slice(13) ??
    100,
);
if (!Number.isInteger(wideWidth) || wideWidth < 2)
  throw new Error('--wide-width needs an integer of at least 2');
/** Depth-D object with W keys at every level: `o` (next level) or `n0` at the bottom, plus n1..n{W-1}. */
const wideSchema = (depth: number): Plain => ({
  type: 'object',
  properties: Object.fromEntries([
    depth > 1 ? ['o', wideSchema(depth - 1)] : ['n0', { type: 'number' }],
    ...Array.from({ length: wideWidth - 1 }, (_, i) => [
      `n${i + 1}`,
      { type: 'number' },
    ]),
  ]),
});
const wideInput = (depth: number, leaf = 1): Plain =>
  Object.fromEntries([
    depth > 1 ? ['o', wideInput(depth - 1, leaf)] : ['n0', 0],
    ...Array.from({ length: wideWidth - 1 }, (_, i) => [
      `n${i + 1}`,
      depth <= 1 && i === 0 ? leaf : i + 1,
    ]),
  ]);
const wideLeafPath = (depth: number): string => '/o'.repeat(depth - 1) + '/n1';
/** Number properties x0..x{width-1}. */
const extraProperties = (width: number): Plain =>
  Object.fromEntries(
    Array.from({ length: width }, (_, i) => [`x${i}`, { type: 'number' }]),
  );
const extraInput = (width: number): Plain =>
  Object.fromEntries(Array.from({ length: width }, (_, i) => [`x${i}`, i]));
/** Root with a closed `then` branch of K numbers beside host `h`; the branch values stay latent. */
const latentSchema = (width: number): Plain => ({
  type: 'object',
  properties: { mode: { type: 'boolean' }, h: flatSchema(width) },
  if: { properties: { mode: { const: true } }, required: ['mode'] },
  then: { properties: extraProperties(width) },
});
/** Root with host `h` and a sibling host `m` whose K number leaves hold strings. */
const misfitSchema = (width: number): Plain => ({
  type: 'object',
  properties: { h: flatSchema(width), m: flatSchema(width) },
});
const misfitHost = (width: number): Plain =>
  Object.fromEntries(Array.from({ length: width }, (_, i) => [keyOf(i), 'x']));
/** Root with a gated field `g` and N watchers of `a`. */
const watcherSchema = (watchers: number): Plain => ({
  type: 'object',
  properties: {
    flag: { type: 'boolean' },
    a: { type: 'number' },
    g: { type: 'number', controls: { active: '../flag' } },
    ...Object.fromEntries(
      Array.from({ length: watchers }, (_, i) => [
        `w${i}`,
        { type: 'number', controls: { watch: ['../a'] } },
      ]),
    ),
  },
});
const watcherInput = (watchers: number, flag: boolean): Plain => ({
  flag,
  a: 0,
  ...(flag ? { g: 5 } : {}),
  ...Object.fromEntries(
    Array.from({ length: watchers }, (_, i) => [`w${i}`, i]),
  ),
});
/** Host `h` whose K children are each gated on the sibling `sw`. */
const gatedHostSchema = (width: number): Plain => ({
  type: 'object',
  properties: {
    h: {
      type: 'object',
      properties: {
        sw: { type: 'number' },
        ...Object.fromEntries(
          Array.from({ length: width }, (_, i) => [
            keyOf(i),
            { type: 'number', controls: { active: '../sw >= 0' } },
          ]),
        ),
      },
    },
  },
});
/** Read an internal runtime store size from the root record, outside timing. */
const runtimeStoreSize = (
  root: WriteNode,
  store: 'latentRaw' | 'misfitPaths',
): number => {
  const runtime: unknown = Reflect.get(root, 'runtime');
  const value: unknown =
    runtime !== null && typeof runtime === 'object'
      ? Reflect.get(runtime, store)
      : undefined;
  return value instanceof Map || value instanceof Set
    ? value.size
    : Number(Reflect.get(Object(value), 'size') ?? -1);
};

/** Resolve a pointer to a node or throw. */
function requireNode(root: WriteNode, pointer: string): WriteNode {
  const node = root.find(pointer);
  if (!node) throw new Error(`Missing node ${pointer}`);
  return node;
}
/** Read a JSON pointer out of a plain value. */
function readPointer(value: unknown, pointer: string): unknown {
  let cursor = value;
  for (const segment of pointer.split('/').slice(1)) {
    if (cursor === null || typeof cursor !== 'object') return undefined;
    cursor = (cursor as Plain)[segment];
  }
  return cursor;
}

const leafSpec = (
  name: string,
  invoke: OperationSpec['invoke'],
): OperationSpec => ({
  name,
  dimension: 'width',
  schema: flatSchema,
  input: (width) => flatInput(width),
  prepare: (root, width) => {
    const target = requireNode(root, `/${middleKey(width)}`);
    return { target, host: root, argument: -1, previousHostValue: root.value };
  },
  invoke,
  expected: (width) => withKey(flatInput(width), middleKey(width), -1),
  checkpoints: (width) => [[`/${middleKey(width)}`, -1]],
});
const hostSchema = (width: number): Plain => ({
  type: 'object',
  properties: { h: flatSchema(width) },
});
const hostSpec = (
  name: string,
  argument: (width: number, host: WriteNode) => unknown,
  option: 'Overwrite' | 'Merge',
  expectedHost: (width: number) => Plain,
  changed: (width: number) => string[],
  changeOptional = false,
): OperationSpec => ({
  name,
  dimension: 'width',
  schema: hostSchema,
  input: (width) => ({ h: flatInput(width) }),
  prepare: (root, width) => {
    const host = requireNode(root, '/h');
    const target = requireNode(
      root,
      `/h/${changed(width)[0] ?? middleKey(width)}`,
    );
    return {
      target,
      host,
      argument: argument(width, host),
      previousHostValue: host.value,
    };
  },
  invoke: (_root, { host, argument }) =>
    host.setValue(argument, SetValueOption[option]),
  expected: (width) => ({ h: expectedHost(width) }),
  checkpoints: (width) => {
    const host = expectedHost(width);
    const keys = changed(width);
    return (keys.length > 0 ? keys : [middleKey(width)]).map((key) => [
      `/h/${key}`,
      host[key],
    ]);
  },
  changeOptional,
});
const allKeys = (width: number): string[] =>
  Array.from({ length: width }, (_, i) => keyOf(i));

const operationSpecs: OperationSpec[] = [
  leafSpec('leaf-input', (_root, { target }) =>
    writeFieldNodeInput(target, -1, SetValueOption.Overwrite),
  ),
  leafSpec('leaf-overwrite', (_root, { target }) =>
    target.setValue(-1, SetValueOption.Overwrite),
  ),
  leafSpec('leaf-merge', (_root, { target }) =>
    target.setValue(-1, SetValueOption.Merge),
  ),
  hostSpec(
    'object-one-key',
    (width) => withKey(flatInput(width), middleKey(width), -1),
    'Overwrite',
    (width) => withKey(flatInput(width), middleKey(width), -1),
    (width) => [middleKey(width)],
  ),
  hostSpec(
    'object-same-ref',
    (_width, host) => host.value,
    'Overwrite',
    (width) => flatInput(width),
    () => [],
    true,
  ),
  hostSpec(
    'object-all-keys',
    (width) => flatInput(width, width),
    'Overwrite',
    (width) => flatInput(width, width),
    allKeys,
  ),
  hostSpec(
    'object-merge-one',
    (width) => ({ [middleKey(width)]: -1 }),
    'Merge',
    (width) => withKey(flatInput(width), middleKey(width), -1),
    (width) => [middleKey(width)],
  ),
  {
    name: 'nested-leaf',
    dimension: 'depth',
    schema: nestedSchema,
    input: (depth) => nestedInput(depth),
    prepare: (root, depth) => ({
      target: requireNode(root, nestedLeafPath(depth)),
      host: root,
      argument: -1,
      previousHostValue: root.value,
    }),
    invoke: (_root, { target }) =>
      writeFieldNodeInput(target, -1, SetValueOption.Overwrite),
    expected: (depth) => nestedInput(depth, -1),
    checkpoints: (depth) => [[nestedLeafPath(depth), -1]],
  },
  {
    name: 'handle-root',
    dimension: 'width',
    schema: flatSchema,
    input: (width) => flatInput(width),
    prepare: (root, width) => ({
      target: requireNode(root, `/${middleKey(width)}`),
      host: root,
      argument: withKey(flatInput(width), middleKey(width), -1),
      previousHostValue: root.value,
    }),
    invoke: (root, { argument }) => root.setValue(argument),
    expected: (width) => withKey(flatInput(width), middleKey(width), -1),
    checkpoints: (width) => [[`/${middleKey(width)}`, -1]],
  },
  {
    name: 'nested-wide-leaf',
    dimension: 'wide-depth',
    schema: wideSchema,
    input: (depth) => wideInput(depth),
    prepare: (root, depth) => ({
      target: requireNode(root, wideLeafPath(depth)),
      host: root,
      argument: -1,
      previousHostValue: root.value,
    }),
    invoke: (_root, { target }) =>
      writeFieldNodeInput(target, -1, SetValueOption.Overwrite),
    expected: (depth) => wideInput(depth, -1),
    checkpoints: (depth) => [[wideLeafPath(depth), -1]],
  },
  {
    name: 'latent-object-one-key',
    dimension: 'width',
    schema: latentSchema,
    input: (width) => ({
      mode: false,
      h: flatInput(width),
      ...extraInput(width),
    }),
    loaded: (width) => ({ mode: false, h: flatInput(width) }),
    fixture: (root, width) => {
      const latentEntries = runtimeStoreSize(root, 'latentRaw');
      if (latentEntries !== width)
        throw new Error(
          `Expected ${width} latent entries, got ${latentEntries}`,
        );
      return { latentEntries };
    },
    prepare: (root, width) => ({
      target: requireNode(root, `/h/${middleKey(width)}`),
      host: requireNode(root, '/h'),
      argument: withKey(flatInput(width), middleKey(width), -1),
      previousHostValue: requireNode(root, '/h').value,
    }),
    invoke: (_root, { host, argument }) =>
      host.setValue(argument, SetValueOption.Overwrite),
    expected: (width) => ({
      mode: false,
      h: withKey(flatInput(width), middleKey(width), -1),
    }),
    checkpoints: (width) => [[`/h/${middleKey(width)}`, -1]],
  },
  {
    name: 'misfit-object-one-key',
    dimension: 'width',
    schema: misfitSchema,
    input: (width) => ({ h: flatInput(width), m: misfitHost(width) }),
    fixture: (root, width) => {
      const misfitPaths = runtimeStoreSize(root, 'misfitPaths');
      if (misfitPaths !== width)
        throw new Error(`Expected ${width} misfit paths, got ${misfitPaths}`);
      return { misfitPaths };
    },
    prepare: (root, width) => ({
      target: requireNode(root, `/h/${middleKey(width)}`),
      host: requireNode(root, '/h'),
      argument: withKey(flatInput(width), middleKey(width), -1),
      previousHostValue: requireNode(root, '/h').value,
    }),
    invoke: (_root, { host, argument }) =>
      host.setValue(argument, SetValueOption.Overwrite),
    expected: (width) => ({
      h: withKey(flatInput(width), middleKey(width), -1),
      m: misfitHost(width),
    }),
    checkpoints: (width) => [[`/h/${middleKey(width)}`, -1]],
  },
  {
    name: 'gate-toggle-exit',
    dimension: 'width',
    schema: watcherSchema,
    input: (watchers) => watcherInput(watchers, true),
    prepare: (root) => ({
      target: requireNode(root, '/flag'),
      host: root,
      argument: false,
      previousHostValue: root.value,
    }),
    invoke: (_root, { target }) =>
      writeFieldNodeInput(target, false, SetValueOption.Overwrite),
    expected: (watchers) => watcherInput(watchers, false),
    checkpoints: () => [
      ['/flag', false],
      ['/g', undefined],
    ],
  },
  {
    name: 'gate-form-one-key',
    dimension: 'width',
    schema: gatedHostSchema,
    input: (width) => ({ h: { sw: 1, ...flatInput(width) } }),
    prepare: (root) => ({
      target: requireNode(root, '/h/sw'),
      host: requireNode(root, '/h'),
      argument: 2,
      previousHostValue: requireNode(root, '/h').value,
    }),
    invoke: (_root, { target }) =>
      writeFieldNodeInput(target, 2, SetValueOption.Overwrite),
    expected: (width) => ({ h: { sw: 2, ...flatInput(width) } }),
    checkpoints: (width) => [
      ['/h/sw', 2],
      [`/h/${middleKey(width)}`, Math.floor(width / 2)],
    ],
  },
];
const lane = 'steady';
const laneLabel = '정상 상태(작은 트리 잎 입력으로 엔진 데움, 계약 레인)';

/** Read a comma-list option such as `--sizes=a,b`; undefined when absent. */
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
const selectedOperations = select(
  'operations',
  operationSpecs,
  (item) => item.name,
);
const selectedSizes = (listOption('sizes') ?? ['10', '100', '1000']).map(
  Number,
);
const selectedDepths = (listOption('depths') ?? ['1', '4', '8']).map(Number);
if (selectedSizes.some((n) => !Number.isInteger(n) || n < 2))
  throw new Error('--sizes needs integers of at least 2');
if (selectedDepths.some((n) => !Number.isInteger(n) || n < 1))
  throw new Error('--depths needs integers of at least 1');
const selectedWideDepths = (listOption('wide-depths') ?? ['1', '2', '4']).map(
  Number,
);
if (selectedWideDepths.some((n) => !Number.isInteger(n) || n < 1))
  throw new Error('--wide-depths needs integers of at least 1');
/** Sizes a scene runs over: K, D, or D at the fixed --wide-width. */
const sizesOf = (spec: OperationSpec): number[] =>
  spec.dimension === 'width'
    ? selectedSizes
    : spec.dimension === 'depth'
      ? selectedDepths
      : selectedWideDepths;

/** Build and mount a loaded tree whose root reports changes to `onChange`. */
function createTree(
  schema: Plain,
  input: Plain,
  onChange?: (value: unknown) => void,
): WriteNode {
  const root = fieldNodeFactory(blueprint(schema as SchemaInput), {
    diagnostics: { status: 'stable' },
    loadSnapshot: undefined,
    latentRaw: new PathKeyedMap('pair'),
    misfitPaths: new PathKeyedSet(),
    inactiveValuesMemo: new PathKeyedMap<
      readonly { path: string; value: unknown }[]
    >('path'),
    onChange,
  });
  mountFieldNode(root, input, SetValueOption.Overwrite);
  return root;
}
const warmSchema = flatSchema(1);
/** Create a one-item object tree and write its leaf once so shared engine code and data are cached. */
function warmEngine(): void {
  const tiny = createTree(warmSchema, { k0: 0 });
  writeFieldNodeInput(requireNode(tiny, '/k0'), 1, SetValueOption.Overwrite);
}

/** Return an interpolated quantile of a nonempty sorted timing array. */
function quantile(sorted: number[], p: number): number {
  const at = (sorted.length - 1) * p;
  const low = Math.floor(at);
  return sorted[low] + (sorted[Math.ceil(at)] - sorted[low]) * (at - low);
}

/** Criterion (1): an emitted root value carrying every checkpoint value and the expected key count. */
function matchesChange(
  value: unknown,
  expected: Plain,
  checkpoints: [string, unknown][],
): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    Object.keys(value).length === Object.keys(expected).length &&
    checkpoints.every(([pointer, next]) => readPointer(value, pointer) === next)
  );
}
/** Criterion (2): root value, target node value and path, and host node value at the checkpoints. */
function nodesSettled(
  root: WriteNode,
  prepared: Prepared,
  checkpoints: [string, unknown][],
): boolean {
  const [targetPointer, targetValue] = checkpoints[0];
  return (
    checkpoints.every(
      ([pointer, next]) => readPointer(root.value, pointer) === next,
    ) &&
    prepared.target.value === targetValue &&
    prepared.target.path === targetPointer &&
    checkpoints.every(([pointer, next]) => root.find(pointer)?.value === next)
  );
}

const rows = selectedOperations.flatMap((spec) =>
  sizesOf(spec).map((size) => {
    const operation = spec.name;
    const schema = spec.schema(size);
    const input = spec.input(size);
    const loadedJson = JSON.stringify(spec.loaded?.(size) ?? input);
    const expected = spec.expected(size);
    const expectedJson = JSON.stringify(expected);
    const checkpoints = spec.checkpoints(size);
    const samplesMs: number[] = [];
    let incompleteAtReturn = 0;
    let incompleteReason: string | undefined;
    let onChangeFired = 0;
    let hostReferenceKept = 0;
    let fixtureInfo: Plain = {};
    for (let index = -warmups; index < samples; index++) {
      const recorder = createChangeRecorder();
      const root = createTree(schema, input, recorder.onChange);
      warmEngine();
      if (JSON.stringify(root.value) !== loadedJson)
        throw new Error(`Fixture mismatch: ${operation}, size=${size}`);
      if (spec.fixture) fixtureInfo = spec.fixture(root, size);
      const prepared = spec.prepare(root, size);
      recorder.calls = 0;
      recorder.value = undefined;
      const start = performance.now();
      spec.invoke(root, prepared);
      const elapsed = performance.now() - start;
      const changeDelivered =
        recorder.calls > 0 &&
        matchesChange(recorder.value, expected, checkpoints);
      if (index >= 0 && recorder.calls > 0) onChangeFired++;
      if (
        (!changeDelivered && !spec.changeOptional) ||
        !nodesSettled(root, prepared, checkpoints)
      ) {
        incompleteAtReturn++;
        incompleteReason ??=
          changeDelivered || spec.changeOptional
            ? 'nodes not settled at return'
            : `onChange not called with the expected value at return (calls: ${recorder.calls})`;
      }
      if (index >= 0 && prepared.host.value === prepared.previousHostValue)
        hostReferenceKept++;
      if (JSON.stringify(root.value) !== expectedJson)
        throw new Error(`Write did not commit: ${operation}, size=${size}`);
      if (
        INPUT_SCENES.has(operation) &&
        !prepared.target.state[FieldNodeState.Dirty]
      )
        throw new Error(
          `Input write did not mark dirty: ${operation}, size=${size}`,
        );
      if (spec.fixture) spec.fixture(root, size);
      if (index >= 0) samplesMs.push(elapsed);
    }
    const sorted = [...samplesMs].sort((a, b) => a - b);
    return {
      lane,
      laneLabel,
      operation,
      n: size,
      dimension: spec.dimension,
      ...(spec.dimension === 'width'
        ? { width: size }
        : spec.dimension === 'depth'
          ? { depth: size }
          : { depth: size, width: wideWidth }),
      ...fixtureInfo,
      medianMs: quantile(sorted, 0.5),
      p10Ms: quantile(sorted, 0.1),
      p90Ms: quantile(sorted, 0.9),
      meanMs: samplesMs.reduce((sum, ms) => sum + ms, 0) / samples,
      completionMicrotaskHopsMedian: 0,
      completionMacrotaskHopsMedian: 0,
      incompleteAtReturn,
      ...(incompleteReason === undefined ? {} : { incompleteReason }),
      onChangeFired,
      hostReferenceKept,
      samplesMs,
    };
  }),
);

console.log(
  JSON.stringify({
    probe: 'write-paths',
    engine,
    ledgerRow:
      'L2 write paths (leaf onChange, object setValue, nested leaf, handle)',
    runtime: Reflect.get(globalThis, 'Bun') ? 'bun' : 'node',
    version: Reflect.get(globalThis, 'Bun')
      ? process.versions.bun
      : process.version,
    nodeEnv: process.env.NODE_ENV ?? 'unset',
    warmups,
    samples,
    sizes: rows,
    ratios: selectedOperations.flatMap(({ name: operation }) => {
      const own = rows.filter((row) => row.operation === operation);
      return own.slice(1).map((row, index) => ({
        lane,
        operation,
        from: own[index].n,
        to: row.n,
        medianRatio: row.medianMs / own[index].medianMs,
      }));
    }),
  }),
);
