/**
 * Legacy (0.16.x) counterpart of probe-write-paths.ts, lane `steady` only.
 * Loaded directly by tsx/Bun; the release bundle comes from --bundle=<dist/index.mjs>
 * and only its root exports are used (Form, isObjectNode, NodeState, SetValueOption).
 *
 * Tree creation, as in probe-legacy-array-verbs.ts: the public <Form> is mounted once
 * with react-dom/client into a jsdom container (flushSync render, which also runs the
 * passive effects), drained so React's ready re-render gives the FormHandle its
 * node, and unmounted again (flushSync unmount), all outside timing. The
 * children render prop hands back the root node and returns null; the mount opens
 * Form's onChange forwarding, the unmount removes every React subscription, and the
 * `onChange` prop stays live as the hook for criterion (1). A callback ref keeps the
 * last non-null FormHandle for handle-root.
 *
 * Entries per scene (same values as the new-engine probe):
 * - leaf-input / nested-leaf: the body of 0.16.x SchemaNodeInput's handleChange with
 *   no onChangeRef (readOnly/disabled guard, node.setValue(v, HANDLE_CHANGE_OPTION),
 *   clearExternalErrors, setState Dirty when not dirty). HANDLE_CHANGE_OPTION is the
 *   internal Replace | Propagate | EmitChange | PublishUpdateEvent = 135, which no
 *   public constant spells; the probe checks the bundle still declares it that way.
 * - leaf-overwrite / leaf-merge: leaf.setValue(-1, SetValueOption.Overwrite / Merge).
 * - object-*: h.setValue(argument, SetValueOption.Overwrite / Merge).
 * - handle-root: FormHandle.setValue(next) when the captured handle's node is the
 *   root, otherwise root.setValue(next); the row's `entry` records which.
 * - nested-wide-leaf: the input handler body on the deepest leaf of a D-deep object
 *   with W keys at every level (--wide-width, default 100; --wide-depths, 1,2,4).
 * - gate-toggle-exit: the input handler body writes `flag` false, closing the gate of
 *   one field (`computed.active: '../flag'`) beside N watchers
 *   (`computed.watch: '../a'`); the width is N.
 * - gate-form-one-key: the input handler body writes `h.sw` 2 on host `h` whose K
 *   children are each gated on `'../sw >= 0'`.
 * - latent-object-one-key and misfit-object-one-key: `개념 없음` rows. 0.16.x keeps a
 *   closed then-branch's values in the host value itself (no latent raw store) and
 *   turns a string in a number field into null (no misfit), so neither scene exists.
 *
 * Settlement and timed region, as in probe-legacy-array-verbs.ts: the clock starts
 * right before the call and stops at the later of (1) the Form `onChange` prop called
 * with the expected value (key count and checkpoint values) and (2) the root value
 * and the target node's value and path, and each checkpoint node's value, equal the
 * expectation. The recorder reads the clock first; the check runs after that
 * timestamp, inside the callback. A fallback loop (one microtask hop, then one
 * setImmediate hop) rechecks (2) after every hop, capped at 1,000 hops or 1 s, after
 * which the row is marked failed with no time. For object-same-ref (1) is optional:
 * the probe reads (2) right after the call returns, keeps the loop running for three
 * setImmediate hops so a late onChange is still seen, and stops the clock at the later
 * of the return and that onChange; `onChangeFired` counts the samples where it fired.
 * 0.16.x still publishes host and child events in microtasks after this write, so
 * the row also reports `quiescedMedianMs`: the clock at the end of the first
 * setImmediate hop after the call, when those microtask deliveries have drained
 * (it includes that hop).
 * Per row: median microtask/macrotask hops completed at completion and
 * `completedInOnChange`. `hopBaselineMs` (two setImmediate hops, no write) is a
 * reference only; nothing is subtracted.
 *
 * Steady lane: each sample builds a fresh tree, drains construction work (three
 * rounds of two setImmediate hops), then warms the engine with one leaf input write
 * on a separate one-item object tree (no onChange), drained the same way. After
 * timing the whole root value is compared with the expectation, and input scenes
 * check the target is dirty.
 * Options: --bundle=<dist/index.mjs> (required), --operations=a,b --sizes=10,100
 * --depths=1,4 --wide-width=100 --wide-depths=1,2,4 (defaults 10,100,1000, 1,4,8, 100
 * and 1,2,4); --smoke lowers samples; --check runs a
 * single sample per row with no warm-up and no hop baseline (correctness only).
 */
import { createHash } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';

/** Node surface of 0.16.x used by this probe (public SchemaNode members). */
interface LegacyNode {
  readonly value: unknown;
  readonly path: string;
  readonly readOnly: boolean;
  readonly disabled: boolean;
  readonly state: Record<number, boolean | undefined>;
  find(pointer: string): LegacyNode | null;
  setValue(value: unknown, option?: number): void;
  clearExternalErrors(): void;
  setState(state: Record<number, boolean>): void;
}
/** FormHandle members this probe touches. */
interface LegacyHandle {
  node?: LegacyNode;
  setValue(value: unknown, option?: number): void;
}
/** Root exports of the legacy bundle that this probe touches. */
interface LegacyBundle {
  Form: unknown;
  isObjectNode: (node: unknown) => boolean;
  NodeState: { Dirty: number };
  SetValueOption: { Overwrite: number; Merge: number };
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
const bundleSource = readFileSync(bundlePath);
const distSha256 = createHash('sha256').update(bundleSource).digest('hex');
const LEGACY_INPUT_OPTION = 1 | 2 | 4 | 128;
if (
  !bundleSource
    .toString('utf8')
    .includes(
      'const HANDLE_CHANGE_OPTION = SetValueOption.Replace | SetValueOption.Propagate | SetValueOption.EmitChange | SetValueOption.PublishUpdateEvent;',
    )
)
  throw new Error('The bundle declares a different input write option');
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
const { SetValueOption, NodeState } = bundle;
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
const optionalWaitHops = 3;

type Plain = Record<string, unknown>;
/** A mounted tree: its root node and the last non-null FormHandle. */
interface Tree {
  root: LegacyNode;
  handle: LegacyHandle | undefined;
}

/** Mount the public <Form>, let React flush the ready re-render that gives the handle its node, capture both, and unmount React again. */
async function createTree(
  jsonSchema: Plain,
  defaultValue: Plain,
  onChange?: (value: unknown) => void,
): Promise<Tree> {
  let captured: unknown;
  let handle: LegacyHandle | undefined;
  const container = document.createElement('div');
  const root = ReactDOMClient.createRoot(container);
  ReactDOM.flushSync(() =>
    root.render(
      React.createElement(bundle.Form, {
        jsonSchema,
        defaultValue,
        onChange,
        ref: (value: LegacyHandle | null) => {
          if (value) handle = value;
        },
        children: ({ node }: { node: unknown }) => {
          captured = node;
          return null;
        },
      }),
    ),
  );
  await drain();
  ReactDOM.flushSync(() => root.unmount());
  if (!bundle.isObjectNode(captured))
    throw new Error('Form did not hand back a root object node');
  return { root: captured as LegacyNode, handle };
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

/** Body of 0.16.x SchemaNodeInput's handleChange when no onChangeRef is set. */
function writeLegacyInput(node: LegacyNode, input: unknown): void {
  if (node.readOnly || node.disabled) return;
  node.setValue(input, LEGACY_INPUT_OPTION);
  node.clearExternalErrors();
  if (!node.state[NodeState.Dirty]) node.setState({ [NodeState.Dirty]: true });
}

/** Nodes and argument resolved outside timing for one sample. */
interface Prepared {
  target: LegacyNode;
  host: LegacyNode;
  argument: unknown;
  previousHostValue: unknown;
}
/** One write scene: its tree, its call, and the state it must leave behind. */
interface OperationSpec {
  name: string;
  dimension: 'width' | 'depth' | 'wide-depth';
  /** Why 0.16.x has no comparable concept; the row is reported without a measurement. */
  unsupported?: string;
  schema: (size: number) => Plain;
  input: (size: number) => Plain;
  prepare: (root: LegacyNode, size: number) => Prepared;
  invoke: (tree: Tree, prepared: Prepared) => void;
  expected: (size: number) => Plain;
  /** Pointer to each value the criteria check, with its expected value. */
  checkpoints: (size: number) => [pointer: string, value: unknown][];
  changeOptional?: boolean;
}
/** Scene flags kept beside the spec. */
const INPUT_SCENES = new Set([
  'leaf-input',
  'nested-leaf',
  'nested-wide-leaf',
  'gate-toggle-exit',
  'gate-form-one-key',
]);

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
/** Root with a gated field `g` and N watchers of `a` (0.16.x `computed` syntax). */
const watcherSchema = (watchers: number): Plain => ({
  type: 'object',
  properties: {
    flag: { type: 'boolean' },
    a: { type: 'number' },
    g: { type: 'number', computed: { active: '../flag' } },
    ...Object.fromEntries(
      Array.from({ length: watchers }, (_, i) => [
        `w${i}`,
        { type: 'number', computed: { watch: '../a' } },
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
/** Host `h` whose K children are each gated on the sibling `sw` (0.16.x `computed` syntax). */
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
            { type: 'number', computed: { active: '../sw >= 0' } },
          ]),
        ),
      },
    },
  },
});
/** A scene whose engine concept 0.16.x lacks: reported as `개념 없음` without a measurement. */
const unsupportedSpec = (name: string, reason: string): OperationSpec => ({
  name,
  dimension: 'width',
  unsupported: reason,
  schema: () => ({}),
  input: () => ({}),
  prepare: () => {
    throw new Error(`${name} is not measured on 0.16.x`);
  },
  invoke: () => undefined,
  expected: () => ({}),
  checkpoints: () => [],
});

/** Resolve a pointer to a node or throw. */
function requireNode(root: LegacyNode, pointer: string): LegacyNode {
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
  prepare: (root, width) => ({
    target: requireNode(root, `/${middleKey(width)}`),
    host: root,
    argument: -1,
    previousHostValue: root.value,
  }),
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
  argument: (width: number, host: LegacyNode) => unknown,
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
  invoke: (_tree, { host, argument }) =>
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
let handleEntry: 'FormHandle.setValue' | 'root.setValue' | undefined;

const operationSpecs: OperationSpec[] = [
  leafSpec('leaf-input', (_tree, { target }) => writeLegacyInput(target, -1)),
  leafSpec('leaf-overwrite', (_tree, { target }) =>
    target.setValue(-1, SetValueOption.Overwrite),
  ),
  leafSpec('leaf-merge', (_tree, { target }) =>
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
    invoke: (_tree, { target }) => writeLegacyInput(target, -1),
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
    invoke: ({ root, handle }, { argument }) =>
      handle?.node === root
        ? handle.setValue(argument)
        : root.setValue(argument),
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
    invoke: (_tree, { target }) => writeLegacyInput(target, -1),
    expected: (depth) => wideInput(depth, -1),
    checkpoints: (depth) => [[wideLeafPath(depth), -1]],
  },
  unsupportedSpec(
    'latent-object-one-key',
    '0.16.x has no latent raw store: values of a closed then-branch stay in the host value itself',
  ),
  unsupportedSpec(
    'misfit-object-one-key',
    '0.16.x does not keep wrong-kind leaves: a string in a number field becomes null and the host drops out of the value',
  ),
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
    invoke: (_tree, { target }) => writeLegacyInput(target, false),
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
    invoke: (_tree, { target }) => writeLegacyInput(target, 2),
    expected: (width) => ({ h: { sw: 2, ...flatInput(width) } }),
    checkpoints: (width) => [
      ['/h/sw', 2],
      [`/h/${middleKey(width)}`, Math.floor(width / 2)],
    ],
  },
];
const lane = 'steady';
const laneLabel = '정상 상태(작은 트리 잎 입력으로 엔진 데움, 계약 레인)';

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

const warmSchema = flatSchema(1);
/** Create a one-item object tree and write its leaf once so shared engine code and data are cached. */
async function warmEngine(): Promise<void> {
  const tiny = await createTree(warmSchema, { k0: 0 });
  await drain();
  writeLegacyInput(requireNode(tiny.root, '/k0'), 1);
  await drain();
}

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
/** Criterion (2): root value, target node value and path, and each checkpoint node's value. */
function nodesSettled(
  root: LegacyNode,
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

/** Outcome of one timed sample. */
type SampleOutcome =
  | {
      ok: true;
      elapsed: number;
      microtaskHops: number;
      macrotaskHops: number;
      inOnChange: boolean;
      onChangeFired: boolean;
      quiescedMs: number | undefined;
    }
  | { ok: false; reason: string };

/** Time one write until (1) and (2) hold, keeping the event loop moving with capped hops. */
async function timeWrite(
  spec: OperationSpec,
  tree: Tree,
  prepared: Prepared,
  recorder: ChangeRecorder,
  expected: Plain,
  checkpoints: [string, unknown][],
): Promise<SampleOutcome> {
  const hops = { microtask: 0, macrotask: 0 };
  let completedAt: number | undefined;
  let completedHops = { microtask: 0, macrotask: 0 };
  let changeSeen = false;
  let inOnChange = false;
  let badChange = false;
  let quiescedAt: number | undefined;
  const complete = (at: number, fromOnChange: boolean): void => {
    completedAt = at;
    completedHops = { ...hops };
    inOnChange = fromOnChange;
  };
  recorder.calls = 0;
  recorder.onCall = () => {
    if (!matchesChange(recorder.value, expected, checkpoints)) {
      if (spec.changeOptional) badChange = true;
      return;
    }
    changeSeen = true;
    if (completedAt !== undefined && !spec.changeOptional) return;
    if (nodesSettled(tree.root, prepared, checkpoints))
      complete(recorder.at, true);
  };
  const recheck = (): void => {
    if (completedAt !== undefined || !changeSeen) return;
    const at = performance.now();
    if (nodesSettled(tree.root, prepared, checkpoints)) complete(at, false);
  };
  const start = performance.now();
  spec.invoke(tree, prepared);
  if (spec.changeOptional) {
    const returnedAt = performance.now();
    if (nodesSettled(tree.root, prepared, checkpoints))
      complete(returnedAt, false);
    while (hops.macrotask < optionalWaitHops) {
      await microtaskHop();
      hops.microtask++;
      await macrotaskHop();
      quiescedAt ??= performance.now();
      hops.macrotask++;
    }
  } else
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
  if (badChange)
    return { ok: false, reason: 'onChange fired with an unexpected value' };
  if (completedAt === undefined)
    return {
      ok: false,
      reason: spec.changeOptional
        ? 'nodes not settled after the call'
        : changeSeen
          ? 'onChange matched but nodes never settled'
          : `onChange never matched (calls: ${recorder.calls})`,
    };
  return {
    ok: true,
    elapsed: completedAt - start,
    microtaskHops: completedHops.microtask,
    macrotaskHops: completedHops.macrotask,
    inOnChange,
    onChangeFired: recorder.calls > 0,
    quiescedMs: quiescedAt === undefined ? undefined : quiescedAt - start,
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

const rows: Record<string, unknown>[] = [];
for (const spec of selectedOperations) {
  for (const size of sizesOf(spec)) {
    const operation = spec.name;
    if (spec.unsupported !== undefined) {
      rows.push({
        lane,
        laneLabel,
        operation,
        n: size,
        dimension: spec.dimension,
        width: size,
        measured: false,
        status: '개념 없음',
        reason: spec.unsupported,
        medianMs: null,
        p10Ms: null,
        p90Ms: null,
        meanMs: null,
        samplesMs: [],
      });
      continue;
    }
    const schema = spec.schema(size);
    const input = spec.input(size);
    const expected = spec.expected(size);
    const expectedJson = JSON.stringify(expected);
    const checkpoints = spec.checkpoints(size);
    const label = `${operation}, size=${size}`;
    const samplesMs: number[] = [];
    const microtaskHops: number[] = [];
    const macrotaskHops: number[] = [];
    let completedInOnChange = 0;
    let onChangeFired = 0;
    let hostReferenceKept = 0;
    const quiescedMs: number[] = [];
    let failure: string | undefined;
    for (let index = -warmups; index < samples; index++) {
      const recorder = createChangeRecorder();
      const tree = await createTree(schema, input, recorder.onChange);
      if (recorder.calls === 0)
        throw new Error(`Form onChange forwarding is not live: ${label}`);
      await drain();
      await warmEngine();
      if (JSON.stringify(tree.root.value) !== JSON.stringify(input))
        throw new Error(`Fixture mismatch: ${label}`);
      if (operation === 'handle-root')
        handleEntry =
          tree.handle?.node === tree.root
            ? 'FormHandle.setValue'
            : 'root.setValue';
      const prepared = spec.prepare(tree.root, size);
      const outcome = await timeWrite(
        spec,
        tree,
        prepared,
        recorder,
        expected,
        checkpoints,
      );
      if (!outcome.ok) {
        failure = outcome.reason;
        break;
      }
      if (JSON.stringify(tree.root.value) !== expectedJson)
        throw new Error(`Write did not commit: ${label}`);
      if (
        INPUT_SCENES.has(operation) &&
        !prepared.target.state[NodeState.Dirty]
      )
        throw new Error(`Input write did not mark dirty: ${label}`);
      if (index >= 0 && prepared.host.value === prepared.previousHostValue)
        hostReferenceKept++;
      if (index >= 0) {
        samplesMs.push(outcome.elapsed);
        microtaskHops.push(outcome.microtaskHops);
        macrotaskHops.push(outcome.macrotaskHops);
        if (outcome.inOnChange) completedInOnChange++;
        if (outcome.onChangeFired) onChangeFired++;
        if (outcome.quiescedMs !== undefined)
          quiescedMs.push(outcome.quiescedMs);
      }
    }
    const shape = {
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
      ...(operation === 'handle-root' ? { entry: handleEntry } : {}),
    };
    if (failure !== undefined) {
      rows.push({
        ...shape,
        measured: false,
        status: 'failed',
        failure,
        medianMs: null,
        p10Ms: null,
        p90Ms: null,
        meanMs: null,
        samplesMs: [],
      });
      continue;
    }
    const sorted = [...samplesMs].sort((a, b) => a - b);
    rows.push({
      ...shape,
      measured: true,
      medianMs: quantile(sorted, 0.5),
      p10Ms: quantile(sorted, 0.1),
      p90Ms: quantile(sorted, 0.9),
      meanMs: samplesMs.reduce((sum, ms) => sum + ms, 0) / samples,
      completionMicrotaskHopsMedian: median(microtaskHops),
      completionMacrotaskHopsMedian: median(macrotaskHops),
      completedInOnChange,
      onChangeFired,
      hostReferenceKept,
      ...(quiescedMs.length > 0
        ? { quiescedMedianMs: median(quiescedMs) }
        : {}),
      samplesMs,
    });
  }
}

console.log(
  JSON.stringify({
    probe: 'write-paths-legacy',
    engine,
    ledgerRow: 'L2 write paths (legacy column)',
    runtime: Reflect.get(globalThis, 'Bun') ? 'bun' : 'node',
    version: Reflect.get(globalThis, 'Bun')
      ? process.versions.bun
      : process.version,
    nodeEnv: process.env.NODE_ENV ?? 'unset',
    warmups,
    samples,
    completion:
      'later of Form onChange called with the expected value and node values/paths settled (object-same-ref: later of the return and any onChange); probe hops capped at 1000 or 1 s',
    hopBaselineMs,
    sizes: rows,
    ratios: selectedOperations.flatMap(({ name: operation }) => {
      const own = rows.filter(
        (row) => row.operation === operation && row.measured,
      );
      return own.slice(1).map((row, index) => ({
        lane,
        operation,
        from: own[index].n,
        to: row.n,
        medianRatio: (row.medianMs as number) / (own[index].medianMs as number),
      }));
    }),
  }),
);
