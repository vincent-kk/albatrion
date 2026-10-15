/**
 * Loaded directly by tsx/Bun. P-09: /host has N siblings at its parent;
 * /host/flag changes the host's own if declaration, marking its parent
 * shape-dirty in registerRecalculation. Reset writes are outside timing.
 * Dist timings run first; a separate source pass counts real selectChildren calls.
 * Node uses registerHooks; Bun uses mock.module. Product files stay untouched.
 */
import { createRequire } from 'node:module';
import * as nodeModule from 'node:module';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

import { createBenchmarkValidator } from '../../../bench/distEngine/createBenchmarkValidator';
import { isRuntimeFieldNode as isTestFieldNode } from '../../../bench/distEngine/isRuntimeFieldNode';
import { loadDistEngine } from '../../../bench/distEngine/loadDistEngine';
import type { TestFieldNode } from '../../../src/core/__tests__/fixtures/testFieldNode';
import type { BlueprintSchema } from '../../../src/core/engine';
import type { selectChildren as SelectChildren } from '../../../src/core/engine/settle/utils/compute/childSelection/selectChildren';

const dist = await loadDistEngine();
const engine = { source: 'dist', distSha256: dist.distSha256 };
type CoreEngine = Pick<
  typeof dist,
  | 'SetValueOption'
  | 'blueprint'
  | 'fieldNodeFactory'
  | 'PathKeyedMap'
  | 'PathKeyedSet'
  | 'loadFieldNodeAtMount'
>;

const smoke = process.argv.includes('--smoke');
const warmups = smoke ? 2 : 20;
const samples = smoke ? 3 : 100;
const isBun = Boolean(Reflect.get(globalThis, 'Bun'));
let activeCounts: { host: number; parent: number } | undefined;

/** Count only calls inside the timed write, distinguishing the host and its parent. */
function countSelection(nodePath: string): void {
  if (!activeCounts) return;
  if (nodePath === '/host') activeCounts.host++;
  else if (nodePath === '') activeCounts.parent++;
}

/** Install the original module wrapper only after the dist timing pass is complete. */
async function installCounter() {
  const selectionURL = new URL(
    '../../../src/core/engine/settle/utils/compute/childSelection/selectChildren.ts',
    import.meta.url,
  );
  let restoreCounter = (): void => {};
  if (isBun) {
    const originalModule = await import(`${selectionURL.href}?m0-original`);
    const original: typeof SelectChildren = originalModule.selectChildren;
    const counted: typeof SelectChildren = (
      node,
      context,
      prior,
      computeChild,
      immediate,
    ) => {
      countSelection(node.path);
      return original(node, context, prior, computeChild, immediate);
    };
    const { mock } = createRequire(import.meta.url)('bun:test') as {
      mock: {
        module(
          specifier: string,
          factory: () => { selectChildren: typeof SelectChildren },
        ): void;
      };
    };
    const selectionFile = fileURLToPath(selectionURL);
    mock.module(selectionFile, () => ({ selectChildren: counted }));
    restoreCounter = () =>
      mock.module(selectionFile, () => ({ selectChildren: original }));
  } else {
    const registerHooks: unknown = Reflect.get(nodeModule, 'registerHooks');
    if (typeof registerHooks !== 'function')
      throw new Error(
        'Node registerHooks is required to wrap this ESM export without editing product files',
      );
    const counterKey = Symbol.for('schema-form.m0.selectChildren.counter');
    if (Reflect.has(globalThis, counterKey))
      throw new Error('Probe counter already registered');
    Reflect.set(globalThis, counterKey, countSelection);
    const hooks = registerHooks({
      load(
        url: string,
        context: unknown,
        nextLoad: (url: string, context: unknown) => unknown,
      ) {
        if (url !== selectionURL.href) return nextLoad(url, context);
        return {
          format: 'module',
          shortCircuit: true,
          source: `import { selectChildren as original } from ${JSON.stringify(`${selectionURL.href}?m0-original`)};
const count = Reflect.get(globalThis, Symbol.for('schema-form.m0.selectChildren.counter'));
export const selectChildren = (...args) => { count(args[0].path); return original(...args); };`,
        };
      },
    }) as { deregister(): void };
    restoreCounter = () => {
      hooks.deregister();
      Reflect.deleteProperty(globalThis, counterKey);
    };
  }
  return restoreCounter;
}

/** Return an interpolated quantile of a nonempty sorted timing array. */
function quantile(sorted: number[], p: number): number {
  const at = (sorted.length - 1) * p;
  const low = Math.floor(at);
  return sorted[low] + (sorted[Math.ceil(at)] - sorted[low]) * (at - low);
}

function exerciseSize(n: number, core: CoreEngine, countCalls: boolean) {
  const {
    SetValueOption,
    blueprint,
    fieldNodeFactory,
    PathKeyedMap,
    PathKeyedSet,
    loadFieldNodeAtMount,
  } = core;
  const properties: Record<string, unknown> = {
    host: {
      type: 'object',
      properties: { flag: { type: 'boolean' } },
      if: { properties: { flag: { const: true } }, required: ['flag'] },
      then: {
        properties: { selected: { type: 'string', default: 'entered' } },
      },
    },
  };
  const value: Record<string, unknown> = { host: { flag: false } };
  for (let index = 0; index < n; index++) {
    properties[`s${index}`] = { type: 'string' };
    value[`s${index}`] = String(index);
  }
  const schema: BlueprintSchema = { type: 'object', properties };
  const root = fieldNodeFactory(
    blueprint(schema),
    {
      diagnostics: { status: 'stable' },
      loadSnapshot: undefined,
      latentRaw: new PathKeyedMap('pair'),
      misfitPaths: new PathKeyedSet(),
      inactiveValuesMemo: new PathKeyedMap<
        readonly { path: string; value: unknown }[]
      >('path'),
    },
    createBenchmarkValidator(),
  );
  if (!isTestFieldNode(root)) throw new Error('Missing runtime record');
  const rootRecord: TestFieldNode = root;
  loadFieldNodeAtMount(rootRecord, value, SetValueOption.Overwrite);
  const flag = root.find('/host/flag');
  if (!flag) throw new Error('Missing non-root if host flag');
  const samplesMs: number[] = [];
  const hostSamples: number[] = [];
  const parentSamples: number[] = [];
  for (let index = -warmups; index < samples; index++) {
    flag.setValue(false);
    if (root.find('/host/selected'))
      throw new Error('P-09 branch did not exit');
    const counts = { host: 0, parent: 0 };
    activeCounts = countCalls ? counts : undefined;
    let elapsed: number;
    try {
      const start = countCalls ? 0 : performance.now();
      flag.setValue(true);
      elapsed = countCalls ? 0 : performance.now() - start;
    } finally {
      activeCounts = undefined;
    }
    if (
      flag.value !== true ||
      root.children?.length !== n + 1 ||
      root.find('/host/selected')?.value !== 'entered'
    )
      throw new Error(`P-09 if declaration did not change at N=${n}`);
    if (countCalls && (counts.host < 1 || counts.parent < 1))
      throw new Error(
        `P-09 selectChildren wrapper missed the host or parent: ${JSON.stringify(counts)}`,
      );
    for (let sibling = 0; sibling < n; sibling++)
      if (root.structure?.[`s${sibling}`].emit !== String(sibling))
        throw new Error(`P-09 sibling ${sibling} changed`);
    if (index >= 0) {
      if (countCalls) {
        hostSamples.push(counts.host);
        parentSamples.push(counts.parent);
      } else samplesMs.push(elapsed);
    }
  }
  return { samplesMs, hostSamples, parentSamples };
}

const timings = (smoke ? [1000] : [1000, 2000, 4000, 8000]).map((n) => {
  const { samplesMs } = exerciseSize(n, dist, false);
  const sorted = [...samplesMs].sort((a, b) => a - b);
  return {
    n,
    source: 'dist',
    medianMs: quantile(sorted, 0.5),
    p10Ms: quantile(sorted, 0.1),
    p90Ms: quantile(sorted, 0.9),
    meanMs: samplesMs.reduce((sum, ms) => sum + ms, 0) / samples,
    samplesMs,
  };
});

const restoreCounter = await installCounter();
const sizes = await (async () => {
  try {
    // Source imports are confined to the untimed instrumentation pass.
    const sourceCore = await import('../../../src/core/index');
    const sourceEngine = await import('../../../src/core/engine/index');
    return timings.map((timing) => {
      const { hostSamples, parentSamples } = exerciseSize(
        timing.n,
        { ...sourceCore, ...sourceEngine },
        true,
      );
      return {
        ...timing,
        selectChildrenCalls: {
          source: 'src',
          hostPath: '/host',
          hostSamples,
          parentPath: '',
          parentSamples,
        },
      };
    });
  } finally {
    restoreCounter();
  }
})();

console.log(
  JSON.stringify({
    probe: 'if-host-siblings',
    engine,
    ledgerRow: 'P-09',
    runtime: Reflect.get(globalThis, 'Bun') ? 'bun' : 'node',
    version: Reflect.get(globalThis, 'Bun')
      ? process.versions.bun
      : process.version,
    nodeEnv: process.env.NODE_ENV ?? 'unset',
    warmups,
    samples,
    callCounting: isBun
      ? 'Bun mock.module export wrapper'
      : 'Node registerHooks ESM export wrapper',
    timingIncludesCounterOverhead: false,
    sizes,
    ratios: sizes.slice(1).map((row, index) => ({
      from: sizes[index].n,
      to: row.n,
      medianRatio: row.medianMs / sizes[index].medianMs,
    })),
  }),
);
