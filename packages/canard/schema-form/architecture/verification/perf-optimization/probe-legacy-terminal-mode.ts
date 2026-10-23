// Invoked directly by node --import tsx or Bun; this terminal-mode probe is verification tooling.
/**
 * Legacy (published 0.16.1) counterpart of probe-terminal-mode.ts, loaded by
 * tsx/Bun. Scenes: root { h: host }; object T/B0/B1/BN, array T/T0/B0/BN.
 * Terminal spelling: this release uses top-level terminal: true; the new
 * engine uses options: { terminal: true }. Object T has no properties; array T
 * has numeric items, matching BN apart from the terminal flag. Array T0 has
 * the terminal flag without items. B0 has no declarations, B1 declares k0 only,
 * and BN declares all object keys or numeric array items. Values are numbers.
 * Array T0 and B0 stay unmeasured: a single construction attempt per schema
 * confirms that this release rejects arrays without items or prefixItems.
 * Operations: object mount/one-key/all-keys; array mount/set-same-length/push/
 * remove-front/clear. IDs are <kind>-<host>-<operation>. Missing public verbs
 * and rejected terminal schemas remain measured:false rows with a reason.
 * Steady setup mirrors legacy write/array siblings: public Form mount/unmount,
 * three two-immediate drains, then one input write on a separate small object
 * and another drain. React/jsdom resolve from --bundle so they share React.
 * Writes stop at the later of matching Form onChange and settled root/host
 * values. The clock-first recorder checks after its timestamp; fallback probe
 * hops are capped at 1000 or 1 s and failures stay in the row set. Nothing is
 * subtracted; completedInOnChange and microtask/macrotask hop medians are kept.
 * Core mount mirrors benchmark-form's sampleCore and loadCoreBenchmark: its
 * React-free legacy factory comes from loadLegacyEngine, whose unchanged digest
 * must match --bundle. Start before core construction; stop at max(factory
 * return, final mount onChange), after drainTicks(2), excluding polling delay.
 * Validation is disabled and the initial root value is asserted in full.
 * Options: --bundle=<dist/index.mjs> (required), --operations=<IDs>,
 * --lanes=core,steady --sizes=100,1000 --lengths=1000,8000. --smoke uses 2/3
 * warm-ups/samples; --check uses 0/1 and no hop baseline; sizes are retained.
 */
import { createHash } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';

import { isArray } from '@winglet/common-utils/filter';

import { loadLegacyEngine } from '../../../bench/distEngine/loadDistEngine';

/** Public SchemaNode members used for host classification and correctness. */
interface ProbeNode {
  readonly value: unknown;
  readonly name: string;
  readonly path: string;
  readonly group: string;
  readonly children?: readonly { node: ProbeNode }[] | null;
  readonly readOnly: boolean;
  readonly disabled: boolean;
  readonly state: Record<number, boolean | undefined>;
  find(pointer: string): ProbeNode | null;
  setValue(value: unknown, option?: number): void;
  clearExternalErrors(): void;
  setState(state: Record<number, boolean>): void;
  push?: (value: number) => Promise<number>;
  remove?: (index: number) => Promise<unknown>;
  clear?: () => Promise<void>;
}
/** Legacy array verbs share the same optional public SchemaNode surface. */
type ArrayHost = ProbeNode;
/** Public release exports consumed by the Form setup and input warm-up. */
interface LegacyBundle {
  Form: unknown;
  isObjectNode: (node: unknown) => boolean;
  SetValueOption: { Overwrite: number };
  NodeState: { Dirty: number };
}
/** Mandatory bundle path supplied using the siblings' scalar option format. */
const bundleOption = scalarOption('bundle');
if (!bundleOption)
  throw new Error('--bundle=<path to dist/index.mjs> is required');
/** Canonical public release location used to resolve React and jsdom. */
const bundlePath = realpathSync(bundleOption);
/** Unchanged release bytes used to attest both public and core loading. */
const bundleSource = readFileSync(bundlePath);
/** SHA-256 fingerprint of the provided release. */
const distSha256 = createHash('sha256').update(bundleSource).digest('hex');
/** Resolve renderer dependencies from the public release's location. */
const requireFromBundle = createRequire(bundlePath);
/** Import one dependency from the bundle's resolution context, unwrapping CJS defaults. */
async function importFromBundle<T>(specifier: string): Promise<T> {
  const namespace = (await import(
    pathToFileURL(requireFromBundle.resolve(specifier)).href
  )) as { default?: T };
  return namespace.default ?? (namespace as T);
}
/** Browserless public Form mount environment shared with legacy siblings. */
const { JSDOM } = await importFromBundle<{
  JSDOM: new (html: string) => { window: Window & typeof globalThis };
}>('jsdom');
/** One DOM document for all untimed Form setup. */
const dom = new JSDOM('<!doctype html><html><body></body></html>');
Reflect.set(globalThis, 'window', dom.window);
Reflect.set(globalThis, 'document', dom.window.document);
/** Original public release namespace; no internal symbol is used by steady rows. */
const bundle = (await import(pathToFileURL(bundlePath).href)) as LegacyBundle;
/** Public overwrite flag and dirty marker provided by this release. */
const { SetValueOption, NodeState } = bundle;
/** React singleton resolved from the release, as in the legacy siblings. */
const React = await importFromBundle<{
  createElement: (...args: unknown[]) => unknown;
  version: string;
}>('react');
/** Synchronous public Form renderer used only outside write timing. */
const ReactDOM = await importFromBundle<{
  flushSync: (callback: () => void) => void;
}>('react-dom');
/** Public root constructor used to capture and detach the engine tree. */
const ReactDOMClient = await importFromBundle<{
  createRoot: (container: Element) => {
    render: (element: unknown) => void;
    unmount: () => void;
  };
}>('react-dom/client');
/** Installed release metadata, verified against the requested published version. */
const bundleVersion = (
  JSON.parse(
    readFileSync(requireFromBundle.resolve('../package.json'), 'utf8'),
  ) as { version: string }
).version;
if (bundleVersion !== '0.16.1')
  throw new Error('Expected published 0.16.1, got ' + bundleVersion);
/** React-free core factory used by the established core mount scenes. */
const { create: legacyCore, legacySha256 } = await loadLegacyEngine(
  undefined,
  '0.16.1',
);
if (legacySha256 !== distSha256)
  throw new Error('Core factory digest differs from --bundle');
/** Identity of the unchanged release and its matching renderer. */
const engine = {
  source: 'legacy-dist',
  version: bundleVersion,
  bundlePath,
  distSha256,
  react: React.version,
};
/** Select asynchronous completion diagnostics for the published release. */
const legacy = true;
/** The public legacy host discriminator is group. */
const strategyOf = (node: ProbeNode): string => node.group;
/** Match the siblings' exact input-binding write flags before warming a leaf. */
const LEGACY_INPUT_OPTION = 1 | 2 | 4 | 128;
if (
  !bundleSource
    .toString('utf8')
    .includes(
      'const HANDLE_CHANGE_OPTION = SetValueOption.Replace | SetValueOption.Propagate | SetValueOption.EmitChange | SetValueOption.PublishUpdateEvent;',
    )
)
  throw new Error('The bundle declares a different input write option');
/** Build a public Form tree, capture its object root, and remove all React subscriptions. */
function createTree(
  schema: Record<string, unknown>,
  input: RootValue,
  onChange?: (value: unknown) => void,
): ProbeNode {
  let captured: unknown;
  const root = ReactDOMClient.createRoot(document.createElement('div'));
  ReactDOM.flushSync(() =>
    root.render(
      React.createElement(bundle.Form, {
        jsonSchema: schema,
        defaultValue: input,
        onChange,
        children: ({ node }: { node: unknown }) => {
          captured = node;
          return null;
        },
      }),
    ),
  );
  ReactDOM.flushSync(() => root.unmount());
  if (!bundle.isObjectNode(captured))
    throw new Error('Form did not hand back an object root');
  return captured as ProbeNode;
}
/** Run the same legacy core factory as benchmark-form, with validation disabled. */
function createCore(
  schema: Record<string, unknown>,
  input: RootValue,
  onChange: (value: unknown) => void,
): ProbeNode {
  return legacyCore({
    jsonSchema: schema,
    defaultValue: input,
    validationMode: 0,
    onChange,
  } as Parameters<typeof legacyCore>[0]) as unknown as ProbeNode;
}
/** Drain construction and warm one tiny object's leaf using the public input write sequence. */
async function prepareSteady(): Promise<void> {
  await drain();
  const tiny = createTree(
    { type: 'object', properties: { k0: { type: 'number' } } },
    { k0: 0 } as unknown as RootValue,
  );
  await drain();
  const leaf = tiny.find('/k0');
  if (!leaf) throw new Error('Missing warm-up leaf');
  if (!leaf.readOnly && !leaf.disabled) {
    leaf.setValue(1, LEGACY_INPUT_OPTION);
    leaf.clearExternalErrors();
    if (!leaf.state[NodeState.Dirty])
      leaf.setState({ [NodeState.Dirty]: true });
  }
  await drain();
}
/** Time one public operation to matching onChange plus settled values, with capped probe hops. */
async function timeWrite(
  spec: Scene,
  root: ProbeNode,
  host: ProbeNode,
  recorder: ChangeRecorder,
  expected: RootValue,
  n: number,
): Promise<Outcome> {
  const hops = { microtask: 0, macrotask: 0 };
  let completedAt: number | undefined;
  let completedHops = { ...hops };
  let changeSeen = false;
  let inOnChange = false;
  const complete = (at: number, fromOnChange: boolean): void => {
    completedAt = at;
    completedHops = { ...hops };
    inOnChange = fromOnChange;
  };
  recorder.onCall = () => {
    if (completedAt !== undefined) return;
    if (!changeSeen && matchesRoot(recorder.value, expected)) changeSeen = true;
    if (changeSeen && nodesSettled(root, host, spec, expected))
      complete(recorder.at, true);
  };
  const recheck = (): void => {
    if (completedAt !== undefined || !changeSeen) return;
    const at = performance.now();
    if (nodesSettled(root, host, spec, expected)) complete(at, false);
  };
  const start = performance.now();
  const returnedSlot = invoke(spec, host, expected, n);
  while (completedAt === undefined) {
    if (
      hops.microtask + hops.macrotask >= 1000 ||
      performance.now() - start > 1000
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
  return completedAt === undefined
    ? {
        ok: false,
        reason: changeSeen
          ? 'onChange matched but nodes never settled'
          : 'onChange never matched (calls: ' + recorder.calls + ')',
        microtaskHops: hops.microtask,
        macrotaskHops: hops.macrotask,
        inOnChange,
        returnedSlot,
      }
    : {
        ok: true,
        elapsed: completedAt - start,
        microtaskHops: completedHops.microtask,
        macrotaskHops: completedHops.macrotask,
        inOnChange,
        returnedSlot,
      };
}

/** Host shapes and public operations shared by the two independent probes. */
const catalogs = [
  ...['T', 'B0', 'B1', 'BN'].flatMap((host) =>
    ['mount', 'one-key', 'all-keys'].map((op) => ({
      kind: 'object',
      host,
      op,
      name: 'object-' + host + '-' + op,
    })),
  ),
  ...['T', 'T0', 'B0', 'BN'].flatMap((host) =>
    ['mount', 'set-same-length', 'push', 'remove-front', 'clear'].map((op) => ({
      kind: 'array',
      host,
      op,
      name: 'array-' + host + '-' + op,
    })),
  ),
];
/** One requested scene, with a size-independent operation identifier. */
type Scene = (typeof catalogs)[number];
/** Numeric host snapshot supplied at mount and compared after each operation. */
type HostValue = number[] | Record<string, number>;
/** Root snapshot for every scene; the host is always reachable at /h. */
type RootValue = { h: HostValue };
/** Consumer recorder matching the sibling probes' clock-first callback. */
interface ChangeRecorder {
  calls: number;
  value: unknown;
  at: number;
  onCall: (() => void) | undefined;
  readonly onChange: (value: unknown) => void;
}
/** Create a clock-first recorder; onCall checks completion after its timestamp. */
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
/** Read a scalar --name=value argument, returning undefined when absent. */
function scalarOption(name: string): string | undefined {
  const prefix = '--' + name + '=';
  return process.argv
    .find((value) => value.startsWith(prefix))
    ?.slice(prefix.length);
}
/** Read a comma-list argument using the siblings' empty-entry filtering. */
function listOption(name: string): string[] | undefined {
  return scalarOption(name)?.split(',').filter(Boolean);
}
/** Select catalog entries and reject unknown option names before measuring. */
function select<T>(
  name: string,
  catalog: readonly T[],
  key: (item: T) => string,
): T[] {
  const wanted = listOption(name);
  if (!wanted) return [...catalog];
  const unknown = wanted.filter(
    (item) => !catalog.some((entry) => key(entry) === item),
  );
  if (unknown.length)
    throw new Error('Unknown --' + name + ': ' + unknown.join(','));
  return catalog.filter((item) => wanted.includes(key(item)));
}
/** Read positive size lists; at least two positions expose B1's extras path. */
function dimensions(name: string, defaults: string[]): number[] {
  const values = (listOption(name) ?? defaults).map(Number);
  if (values.some((n) => !Number.isInteger(n) || n < 2))
    throw new Error('--' + name + ' needs integers of at least 2');
  return values;
}
/** Smoke and correctness-only flags retain the sibling probes' sample counts. */
const smoke = process.argv.includes('--smoke');
/** Correctness-only mode has one sample, no warm-ups, and no hop baseline. */
const check = process.argv.includes('--check');
/** Unrecorded iterations per row: twenty normally and two for smoke. */
const warmups = check ? 0 : smoke ? 2 : 20;
/** Recorded iterations per row: one hundred normally and three for smoke. */
const samples = check ? 1 : smoke ? 3 : 100;
/** Object key counts; smoke preserves both requested dimensions. */
const objectSizes = dimensions('sizes', ['100', '1000']);
/** Array lengths; smoke preserves both requested dimensions. */
const arrayLengths = dimensions('lengths', ['1000', '8000']);
/** Mount uses the core lane; writes and public verbs use the steady lane. */
const selectedLanes = select('lanes', ['core', 'steady'], (lane) => lane);
/** Fully qualified operation identifiers use the same filtering as siblings. */
const selectedOperations = select('operations', catalogs, (spec) => spec.name);
/** Return a root schema with only the declarations required by the scene. */
function schemaOf(spec: Scene, n: number): Record<string, unknown> {
  const host: Record<string, unknown> = { type: spec.kind };
  if (spec.host === 'T' || spec.host === 'T0') {
    if (legacy) host.terminal = true;
    else host.options = { terminal: true };
  }
  if (spec.kind === 'object' && (spec.host === 'B1' || spec.host === 'BN'))
    host.properties = Object.fromEntries(
      Array.from({ length: spec.host === 'B1' ? 1 : n }, (_, index) => [
        'k' + index,
        { type: 'number' },
      ]),
    );
  if (spec.kind === 'array' && (spec.host === 'T' || spec.host === 'BN'))
    host.items = { type: 'number' };
  return { type: 'object', properties: { h: host } };
}
/** Build an N-key object or L-position array with deterministic numeric values. */
function inputOf(spec: Scene, n: number): RootValue {
  const values = Array.from({ length: n }, (_, index) => index);
  return {
    h:
      spec.kind === 'array'
        ? values
        : Object.fromEntries(values.map((value) => ['k' + value, value])),
  };
}
/** Build the complete expected snapshot outside the timed region. */
function expectedOf(spec: Scene, n: number): RootValue {
  const input = inputOf(spec, n);
  if (spec.op === 'mount') return input;
  if (spec.kind === 'object') {
    const host = input.h as Record<string, number>;
    if (spec.op === 'all-keys')
      Object.keys(host).forEach((key) => {
        host[key] += n;
      });
    else host['k' + Math.floor(n / 2)] = -1;
  } else {
    const host = input.h as number[];
    if (spec.op === 'set-same-length') host[Math.floor(n / 2)] = -1;
    if (spec.op === 'push') host.push(n);
    if (spec.op === 'remove-front') host.shift();
    if (spec.op === 'clear') host.length = 0;
  }
  return input;
}
/** Match host size and first/middle/last values, as the sibling completion checks do. */
function matchesHost(value: unknown, expected: HostValue): boolean {
  if (!value || typeof value !== 'object') return false;
  const keys = Object.keys(expected);
  if (
    isArray(expected) !== isArray(value) ||
    Object.keys(value).length !== keys.length
  )
    return false;
  if (isArray(expected) && (value as number[]).length !== expected.length)
    return false;
  return [0, Math.floor(keys.length / 2), keys.length - 1].every(
    (index) =>
      index < 0 ||
      index >= keys.length ||
      Reflect.get(value, keys[index]) === Reflect.get(expected, keys[index]),
  );
}
/** Project an empty cleared array out of its parent, matching default omitEmpty semantics. */
function rootSnapshot(expected: RootValue): Record<string, unknown> {
  return isArray(expected.h) && expected.h.length === 0 ? {} : expected;
}
/** Match the root projection and the host's completion checkpoints. */
function matchesRoot(value: unknown, expected: RootValue): boolean {
  if (!value || typeof value !== 'object') return false;
  const projected = rootSnapshot(expected);
  if (Object.keys(value).length !== Object.keys(projected).length) return false;
  return (
    !('h' in projected) || matchesHost(Reflect.get(value, 'h'), expected.h)
  );
}
/** Return direct child nodes without exposing either engine's runtime internals. */
function childrenOf(node: ProbeNode): ProbeNode[] {
  return Array.from(node.children ?? [], (child: unknown) =>
    child && typeof child === 'object' && 'node' in child
      ? (Reflect.get(child, 'node') as ProbeNode)
      : (child as ProbeNode),
  );
}
/** Require the public host node; only branch containers own declared children. */
function hostOf(root: ProbeNode): ProbeNode {
  const host = root.find('/h');
  if (!host) throw new Error('Missing /h host node');
  return host;
}
/** Return the child count dictated by the host schema, rather than by raw value size. */
function expectedChildCount(spec: Scene, expected: RootValue): number {
  if (spec.host === 'B1') return 1;
  return spec.host === 'BN' ? Object.keys(expected.h).length : 0;
}
/** Check root/host values and declared children at completion checkpoints. */
function nodesSettled(
  root: ProbeNode,
  host: ProbeNode,
  spec: Scene,
  expected: RootValue,
): boolean {
  if (
    !matchesRoot(root.value, expected) ||
    !matchesHost(host.value, expected.h) ||
    host.path !== '/h'
  )
    return false;
  const children = childrenOf(host);
  if (children.length !== expectedChildCount(spec, expected)) return false;
  const positions = [0, Math.floor(children.length / 2), children.length - 1];
  return positions.every((index) => {
    if (index < 0 || index >= children.length) return true;
    const child = children[index];
    const key = spec.kind === 'array' ? String(index) : 'k' + index;
    return (
      child.name === key &&
      child.path === '/h/' + key &&
      child.value === Reflect.get(expected.h, key)
    );
  });
}
/** Assert complete values, host classification and every declared child's value/path. */
function assertCommitted(
  root: ProbeNode,
  spec: Scene,
  expected: RootValue,
  label: string,
): void {
  const host = hostOf(root);
  if (
    JSON.stringify(root.value) !== JSON.stringify(rootSnapshot(expected)) ||
    JSON.stringify(host.value) !== JSON.stringify(expected.h) ||
    !nodesSettled(root, host, spec, expected)
  )
    throw new Error('Snapshot or settlement mismatch: ' + label);
  if (
    strategyOf(host) !==
    (spec.host === 'T' || spec.host === 'T0' ? 'terminal' : 'branch')
  )
    throw new Error('Host classification mismatch: ' + label);
  childrenOf(host).forEach((child, index) => {
    const key = spec.kind === 'array' ? String(index) : 'k' + index;
    if (
      child.name !== key ||
      child.path !== '/h/' + key ||
      child.value !== Reflect.get(expected.h, key)
    )
      throw new Error('Child value/path mismatch: ' + label + ', ' + key);
  });
  if (
    spec.host === 'B1' &&
    (root.find('/h/k1') || childrenOf(host)[0]?.name !== 'k0')
  )
    throw new Error('B1 extras unexpectedly became child nodes: ' + label);
}
/** Resolve after one microtask, keeping legacy delivery progress observable. */
const microtaskHop = (): Promise<void> =>
  new Promise((resolve) => queueMicrotask(resolve));
/** Resolve after one immediate turn without adding a timer-floor correction. */
const macrotaskHop = (): Promise<void> =>
  new Promise((resolve) => setImmediate(resolve));
/** Drain two immediate turns, the legacy siblings' construction drain unit. */
const twoHops = (): Promise<void> =>
  new Promise((resolve) => setImmediate(() => setImmediate(resolve)));
/** Drain three two-immediate rounds outside write and verb timing. */
async function drain(): Promise<void> {
  for (let hop = 0; hop < 3; hop++) await twoHops();
}
/** Drain two zero-delay timers exactly like benchmark-form's drainTicks(2). */
const drainMountTicks = (): Promise<void> =>
  new Promise((resolve) => setTimeout(() => setTimeout(resolve, 0), 0));
/** Invoke only a public host verb; setValue always explicitly uses Overwrite. */
function invoke(
  spec: Scene,
  host: ProbeNode,
  expected: RootValue,
  n: number,
): unknown {
  const array = host as ArrayHost;
  if (spec.op === 'push') return array.push!(n);
  if (spec.op === 'remove-front') return array.remove!(0);
  if (spec.op === 'clear') return array.clear!();
  return host.setValue(expected.h, SetValueOption.Overwrite);
}
/** Explain absent public verbs instead of simulating them with whole-value writes. */
function unsupportedVerb(spec: Scene, host: ProbeNode): string | undefined {
  const name = spec.op === 'remove-front' ? 'remove' : spec.op;
  if (
    ['push', 'remove', 'clear'].includes(name) &&
    typeof Reflect.get(host, name) !== 'function'
  )
    return (
      'Public ' + name + '() is unavailable on ' + spec.kind + '-' + spec.host
    );
  return undefined;
}
/** Interpolate a quantile of a nonempty sorted timing vector. */
function quantile(sorted: number[], p: number): number {
  const at = (sorted.length - 1) * p;
  const low = Math.floor(at);
  return sorted[low] + (sorted[Math.ceil(at)] - sorted[low]) * (at - low);
}
/** Return the midpoint median, with no value for empty vectors. */
function median(values: number[]): number | null {
  return values.length
    ? quantile(
        [...values].sort((a, b) => a - b),
        0.5,
      )
    : null;
}
/** A timed completion, including the diagnostic probe hops rather than engine task counts. */
interface Outcome {
  ok: boolean;
  elapsed?: number;
  microtaskHops: number;
  macrotaskHops: number;
  inOnChange: boolean;
  reason?: string;
  returnedSlot?: unknown;
}
/** Diagnostic host classifications emitted without contaminating JSON stdout. */
const smokeChecks: Record<string, unknown>[] = [];
/** Check public host classifications and confirm each expected legacy rejection once. */
async function inspectHosts(): Promise<Record<string, string>> {
  const unsupported: Record<string, string> = {};
  for (const kind of ['object', 'array']) {
    for (const host of kind === 'object'
      ? ['T', 'B0', 'B1']
      : ['T', 'T0', 'B0']) {
      const spec = catalogs.find(
        (entry) => entry.kind === kind && entry.host === host,
      )!;
      const n = kind === 'object' ? objectSizes[0] : arrayLengths[0];
      const input = inputOf(spec, n);
      const expectedRejection =
        legacy && kind === 'array' && (host === 'T0' || host === 'B0');
      let root: ProbeNode;
      try {
        root = createCore(schemaOf(spec, n), input, () => {});
      } catch (error) {
        const detail =
          error instanceof Error ? error.message.split('\n')[0] : String(error);
        if (
          expectedRejection &&
          detail.includes("Array must have 'items' or 'prefixItems' defined.")
        ) {
          unsupported[kind + '-' + host] =
            '0.16.1 rejects arrays without items or prefixItems';
          smokeChecks.push({
            kind,
            host,
            pass: true,
            measured: false,
            rejectionConfirmed: true,
            reason: unsupported[kind + '-' + host],
            error: detail,
          });
          continue;
        }
        unsupported[kind + '-' + host] = 'Schema rejected: ' + detail;
        smokeChecks.push({
          kind,
          host,
          pass: false,
          reason: unsupported[kind + '-' + host],
        });
        continue;
      }
      if (expectedRejection)
        throw new Error(
          '0.16.1 unexpectedly accepted array ' + host + ' without items',
        );
      await drain();
      const node = hostOf(root);
      const strategy = strategyOf(node);
      if ((host === 'T' || host === 'T0') && strategy !== 'terminal') {
        unsupported[kind + '-' + host] =
          'Terminal flag produced ' + strategy + ', expected terminal';
        smokeChecks.push({
          kind,
          host,
          pass: false,
          strategy,
          reason: unsupported[kind + '-' + host],
        });
        continue;
      }
      assertCommitted(root, spec, input, 'host smoke ' + kind + '-' + host);
      const result = {
        kind,
        host,
        pass: true,
        strategy,
        children: childrenOf(node).length,
        ...(host === 'B1'
          ? {
              n,
              extras: n - 1,
              extraValuesPresent:
                Object.keys(node.value as object).length === n &&
                !root.find('/h/k1'),
            }
          : {}),
      };
      smokeChecks.push(result);
    }
  }
  return unsupported;
}
/** Time core construction to max(factory return, final mount callback), excluding tick polling. */
async function timeMount(
  schema: Record<string, unknown>,
  input: RootValue,
  spec: Scene,
  recorder: ChangeRecorder,
): Promise<{ root: ProbeNode; outcome: Outcome }> {
  const start = performance.now();
  const root = createCore(schema, input, recorder.onChange);
  const constructedAt = performance.now();
  await drainMountTicks();
  const elapsed = Math.max(constructedAt, recorder.at) - start;
  const ok =
    (recorder.calls === 0 || matchesRoot(recorder.value, input)) &&
    nodesSettled(root, hostOf(root), spec, input);
  return {
    root,
    outcome: {
      ok,
      elapsed,
      microtaskHops: 0,
      macrotaskHops: 2,
      inOnChange: recorder.at > constructedAt,
      ...(ok
        ? {}
        : {
            reason:
              'Core mount did not hold the initial root value after two ticks',
          }),
    },
  };
}
/** Emit all rows, preserving failed and unsupported rows in the common differential row set. */
async function run(): Promise<void> {
  const unsupportedHosts = await inspectHosts();
  const hopSamples: number[] = [];
  if (legacy && !check) {
    for (let index = -warmups; index < samples; index++) {
      const start = performance.now();
      await twoHops();
      if (index >= 0) hopSamples.push(performance.now() - start);
    }
  }
  const sizes: Record<string, unknown>[] = [];
  for (const spec of selectedOperations) {
    const lane = spec.op === 'mount' ? 'core' : 'steady';
    if (!selectedLanes.includes(lane)) continue;
    for (const n of spec.kind === 'object' ? objectSizes : arrayLengths) {
      const schema = schemaOf(spec, n);
      const input = inputOf(spec, n);
      const expected = expectedOf(spec, n);
      const samplesMs: number[] = [];
      const microtaskHops: number[] = [];
      const macrotaskHops: number[] = [];
      let completedInOnChange = 0;
      let incompleteAtReturn = 0;
      let assertionPasses = 0;
      let warmupAssertionPasses = 0;
      const hostProblem = unsupportedHosts[spec.kind + '-' + spec.host];
      const expectedRejection =
        legacy &&
        spec.kind === 'array' &&
        (spec.host === 'T0' || spec.host === 'B0');
      let reason = expectedRejection ? hostProblem : undefined;
      let failure: string | undefined = expectedRejection
        ? undefined
        : hostProblem;
      for (
        let index = -warmups;
        !reason && !failure && index < samples;
        index++
      ) {
        const recorder = createChangeRecorder();
        let root: ProbeNode;
        let outcome: Outcome;
        if (spec.op === 'mount') {
          ({ root, outcome } = await timeMount(schema, input, spec, recorder));
        } else {
          root = await createTree(schema, input, recorder.onChange);
          const host = hostOf(root);
          reason = unsupportedVerb(spec, host);
          if (reason) break;
          await prepareSteady();
          assertCommitted(
            root,
            spec,
            input,
            'fixture ' + spec.name + ', N=' + n,
          );
          recorder.calls = 0;
          recorder.value = undefined;
          recorder.at = 0;
          outcome = await timeWrite(spec, root, host, recorder, expected, n);
        }
        if (!outcome.ok) {
          if (!legacy) incompleteAtReturn++;
          failure = outcome.reason ?? 'Completion assertion failed';
          break;
        }
        assertCommitted(root, spec, expected, spec.name + ', N=' + n);
        if (spec.op !== 'mount') {
          const returned = await outcome.returnedSlot;
          const expectedReturned =
            spec.op === 'push'
              ? n + 1
              : spec.op === 'remove-front'
                ? 0
                : undefined;
          if (returned !== expectedReturned)
            throw new Error('Unexpected public verb result: ' + spec.name);
        }
        if (index < 0) warmupAssertionPasses++;
        else {
          assertionPasses++;
          samplesMs.push(outcome.elapsed!);
          microtaskHops.push(outcome.microtaskHops);
          macrotaskHops.push(outcome.macrotaskHops);
          if (outcome.inOnChange) completedInOnChange++;
        }
      }
      const measured = !reason && !failure;
      const sorted = [...samplesMs].sort((a, b) => a - b);
      sizes.push({
        lane,
        laneLabel: lane === 'core' ? 'Core mount' : 'Steady state',
        operation: spec.name,
        kind: spec.kind,
        host: spec.host,
        n,
        measured,
        ...(reason ? { reason, status: 'unsupported' } : {}),
        ...(failure ? { reason: failure, failure, status: 'failed' } : {}),
        assertionPasses,
        warmupAssertionPasses,
        medianMs: measured ? quantile(sorted, 0.5) : null,
        p10Ms: measured ? quantile(sorted, 0.1) : null,
        p90Ms: measured ? quantile(sorted, 0.9) : null,
        meanMs: measured
          ? samplesMs.reduce((sum, ms) => sum + ms, 0) / samples
          : null,
        completionMicrotaskHopsMedian: measured ? median(microtaskHops) : null,
        completionMacrotaskHopsMedian: measured ? median(macrotaskHops) : null,
        ...(legacy ? { completedInOnChange } : { incompleteAtReturn }),
        samplesMs: measured ? samplesMs : [],
      });
    }
  }
  console.log(
    JSON.stringify({
      probe: legacy ? 'terminal-mode-legacy' : 'terminal-mode',
      engine,
      runtime: Reflect.get(globalThis, 'Bun') ? 'bun' : 'node',
      version: Reflect.get(globalThis, 'Bun')
        ? process.versions.bun
        : process.version,
      nodeEnv: process.env.NODE_ENV ?? 'unset',
      warmups,
      samples,
      completion: legacy
        ? 'later of expected onChange and settled root/host values; capped at 1000 hops or 1 s'
        : 'call return, checked immediately outside timing',
      mountCompletion:
        'max(core factory return, final mount onChange); drainTicks(2) polling excluded; initial root value asserted',
      ...(legacy ? { hopBaselineMs: check ? null : median(hopSamples) } : {}),
      smokeChecks,
      sizes,
      ratios: selectedOperations.flatMap((spec) => {
        const rows = sizes.filter(
          (row) => row.operation === spec.name && row.measured,
        );
        return rows.slice(1).map((row, index) => ({
          lane: row.lane,
          operation: spec.name,
          from: rows[index].n,
          to: row.n,
          medianRatio:
            (row.medianMs as number) / (rows[index].medianMs as number),
        }));
      }),
    }),
  );
  if (
    sizes.some((row) => row.status === 'failed') ||
    smokeChecks.some((result) => result.pass === false)
  )
    process.exitCode = 1;
}
await run();
