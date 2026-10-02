import { PathKeyedMap } from '../src/core/utils/pathIndex/PathKeyedMap';
import { PathKeyedSet } from '../src/core/utils/pathIndex/PathKeyedSet';
/**
 * TEST-032: compare array input, whole writes, and retained heap with the legacy engine.
 * Run under Node/V8 and Bun/JSC without overlapping other benchmarks.
 * --root-applied selects completion timings without heap child processes.
 * This standalone CLI owns its runtime clock, fixtures, and result sink.
 */
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';

import { scheduleMacrotaskSafe } from '@winglet/common-utils/scheduler';

import { blueprint } from '../src/core/blueprint';
import { createTestValidator } from '../src/core/__tests__/fixtures/createTestValidator';
import { schemaNodeFactory, SetValueOption } from '../src/core/SchemaNode';
import type { SchemaNode as RuntimeSchemaNode } from '../src/core/SchemaNode/SchemaNode';
import { loadSchemaNodeAtMount } from '../src/core/settle';
import { nodeFromJSONSchema } from '../src/core/nodeFromJSONSchema';

const schema = { type: 'array' as const, items: {
  type: 'object' as const, properties: { key: { type: 'number' as const } },
} };
const noop = () => {};
const itemCount = 10_000;
const writeCount = 1000;
const sampleCount = 100;
/** Warmup writes excluded from root-applied timing distributions. */
const completionWarmup = 5000;
/** Odd count gives the completion distributions an exact middle sample. */
const completionSamples = 2001;
const memorySamples = 7;
let sink = 0;
let retainedTree: unknown;

type Engine = 'new' | 'legacy';
type Item = { key: number };
type BenchLeaf = { setValue(value: number): void; value: unknown };
type BenchTree = { find(pointer: string): BenchLeaf | null;
  children: readonly unknown[] | null; setValue(value: Item[]): void; value: unknown;
  normalizedValue?: unknown; outputValue?: unknown };
type Timing = { medianUs: number; p10Us: number; p90Us: number;
  meanHz: number; samples: number; samplesUs: number[] };

function value(count: number, key: number): Item[] {
  return Array.from({ length: count }, () => ({ key }));
}

function makeTree(engine: Engine, input: Item[], analysis?: ReturnType<typeof blueprint>,
  onChange: (output: unknown) => void = noop): BenchTree {
  if (engine === 'legacy')
    return nodeFromJSONSchema({ jsonSchema: schema, defaultValue: input,
      onChange }) as unknown as BenchTree;
  const root = schemaNodeFactory(analysis ?? blueprint(schema), {
    diagnostics: { status: 'stable' },
    loadSnapshot: undefined, latentRaw: new PathKeyedMap('pair'),
    typeMismatchPaths: new PathKeyedSet(), inactiveValuesMemo: new PathKeyedMap<readonly { path: string; value: unknown }[]>('path'),
  }, createTestValidator()) as RuntimeSchemaNode;
  loadSchemaNodeAtMount(root, input, SetValueOption.Overwrite);
  return root as unknown as BenchTree;
}

function measure(run: (index: number) => void): Timing {
  for (let index = 0; index < 20; index++) run(index);
  const samplesUs: number[] = [];
  for (let index = 0; index < sampleCount; index++) {
    const start = performance.now();
    run(index + 20);
    samplesUs.push((performance.now() - start) * 1000);
  }
  return summarizeTiming(samplesUs);
}

/** Summarize microsecond samples without changing the acceptance-row percentile rule. */
function summarizeTiming(samplesUs: number[]): Timing {
  const sorted = [...samplesUs].sort((left, right) => left - right);
  const percentile = (fraction: number) => sorted[Math.floor((sorted.length - 1) * fraction)];
  const meanUs = samplesUs.reduce((sum, duration) => sum + duration, 0) / samplesUs.length;
  return { medianUs: percentile(0.5), p10Us: percentile(0.1),
    p90Us: percentile(0.9), meanHz: 1_000_000 / meanUs,
    samples: samplesUs.length, samplesUs };
}

function keyInput(engine: Engine, input: Item[]): Timing {
  const root = makeTree(engine, input);
  const key = root.find('/5000/key');
  if (!key || root.children?.length !== itemCount)
    throw new Error(`${engine}: 10,000-item key fixture mismatch`);
  return measure((index) => {
    key.setValue(index + 1);
    if (key.value !== index + 1) throw new Error(`${engine}: key input was not visible`);
    sink += Number(key.value);
  });
}

function wholeWrite(engine: Engine, first: Item[], second: Item[]): Timing {
  const root = makeTree(engine, first);
  if (root.children?.length !== writeCount)
    throw new Error(`${engine}: 1000-item whole-write fixture mismatch`);
  return measure((index) => {
    const expected = index % 2;
    root.setValue(expected === 0 ? first : second);
    const observed = (root.value as Item[])[500].key;
    if (observed !== expected) throw new Error(`${engine}: whole write was not visible`);
    sink += observed;
  });
}

/**
 * Time writes through root application: synchronous return for new, root onChange for legacy.
 * Inputs are the acceptance fixtures; second selects whole writes instead of leaf writes.
 * Root/event assertions and Promise allocation/resumption are outside the timed endpoint.
 * Legacy batches RequestEmitChange in microtasks, then debounces root onChange in a
 * scheduleMacrotaskSafe turn (setImmediate on Node/Bun, setTimeout fallback).
 */
function rootAppliedRunner(engine: Engine, first: Item[], second?: Item[]) {
  let observe: ((output: unknown, completedAt: number) => void) | undefined;
  const root = makeTree(engine, first, undefined,
    (output) => observe?.(output, performance.now()));
  const key = second ? undefined : root.find('/5000/key');
  const position = second ? 500 : 5000;
  if ((!second && !key) || root.children?.length !== first.length)
    throw new Error(`${engine}: root-applied fixture mismatch`);
  return async (index: number): Promise<number> => {
    const expected = second ? (index + 1) % 2 : index + 1;
    let startedAt = 0;
    let elapsedUs = 0;
    let rootKeyAtEvent: number | undefined;
    let getValueKeyAtEvent: number | undefined;
    let eventKey: number | undefined;
    let eventOutput: Item[] | undefined;
    const completed = engine === 'legacy' ? new Promise<void>((resolve) => {
      observe = (output, completedAt) => {
        elapsedUs = (completedAt - startedAt) * 1000;
        rootKeyAtEvent = (root.value as Item[])[position].key;
        getValueKeyAtEvent = (root.normalizedValue as Item[])[position].key;
        eventKey = (output as Item[])[position].key;
        eventOutput = output as Item[];
        observe = undefined;
        resolve();
      };
    }) : undefined;
    startedAt = performance.now();
    if (second) root.setValue(expected === 0 ? first : second);
    else key!.setValue(expected);
    if (engine === 'new') elapsedUs = (performance.now() - startedAt) * 1000;
    else await completed;
    const observed = (root.value as Item[])[position].key;
    const output = (engine === 'legacy' ? root.normalizedValue : root.outputValue) as Item[];
    if (observed !== expected || engine === 'legacy' &&
      (rootKeyAtEvent !== expected || getValueKeyAtEvent !== expected || eventKey !== expected) ||
      output[position].key !== expected)
      throw new Error(`${engine}: root-applied write/event was not visible`);
    if (second && ((root.value as Item[]).some((item) => item.key !== expected) ||
      output.some((item) => item.key !== expected) ||
      engine === 'legacy' && eventOutput?.some((item) => item.key !== expected)))
      throw new Error(`${engine}: root-applied whole write was only partially visible`);
    sink += observed;
    return elapsedUs;
  };
}

/** Drain untimed engine event cascades so one engine's queued work cannot enter the other's timer. */
async function drainEvents(): Promise<void> {
  await new Promise<void>((resolve) => scheduleMacrotaskSafe(resolve));
  await new Promise<void>((resolve) => scheduleMacrotaskSafe(resolve));
}

/** Alternate each pair's order (new/legacy, legacy/new), yielding ABBA blocks. */
async function rootAppliedPair(first: Item[], second?: Item[]) {
  const runners = { new: rootAppliedRunner('new', first, second),
    legacy: rootAppliedRunner('legacy', first, second) };
  const samplesUs: Record<Engine, number[]> = { new: [], legacy: [] };
  await drainEvents();
  for (let index = 0; index < completionWarmup + completionSamples; index++) {
    const order: Engine[] = index % 2 === 0 ? ['new', 'legacy'] : ['legacy', 'new'];
    for (const engine of order) {
      const elapsedUs = await runners[engine](index);
      if (index >= completionWarmup) samplesUs[engine].push(elapsedUs);
      await drainEvents();
    }
  }
  return { new: summarizeTiming(samplesUs.new), legacy: summarizeTiming(samplesUs.legacy) };
}

/** Measure empty await/resumption with Promise allocation excluded, without subtracting it. */
async function emptyAwait(): Promise<Timing> {
  const samplesUs: number[] = [];
  for (let index = 0; index < completionWarmup + completionSamples; index++) {
    const completed = Promise.resolve();
    const start = performance.now();
    await completed;
    const elapsedUs = (performance.now() - start) * 1000;
    if (index >= completionWarmup) samplesUs.push(elapsedUs);
  }
  return summarizeTiming(samplesUs);
}

function collect(): void {
  const bun = Reflect.get(globalThis, 'Bun') as { gc?: (force: boolean) => void } | undefined;
  const nodeGc = Reflect.get(globalThis, 'gc') as (() => void) | undefined;
  if (bun?.gc) bun.gc(true);
  else if (nodeGc) { nodeGc(); nodeGc(); }
  else throw new Error('Heap measurement requires --expose-gc on Node');
}

function heapOne(engine: Engine): void {
  const input = value(itemCount, 0);
  const analysis = engine === 'new' ? blueprint(schema) : undefined;
  collect();
  const before = process.memoryUsage().heapUsed;
  retainedTree = makeTree(engine, input, analysis);
  if (retainedTree === undefined) throw new Error('Tree was not retained');
  collect();
  const nodes = 1 + itemCount * 2;
  const bytesPerNode = (process.memoryUsage().heapUsed - before) / nodes;
  process.stdout.write(String(bytesPerNode));
}

function heapSamples(engine: Engine) {
  const bun = Boolean(Reflect.get(globalThis, 'Bun'));
  const args = bun ? ['bench/array.bench.ts', `--heap-one=${engine}`] :
    ['--expose-gc', '--import', 'tsx', 'bench/array.bench.ts', `--heap-one=${engine}`];
  const samples: number[] = [];
  for (let index = 0; index < memorySamples; index++) {
    const child = spawnSync(process.execPath, args,
      { cwd: process.cwd(), encoding: 'utf8' });
    if (child.status !== 0)
      throw new Error(`${engine} heap child failed: ${child.stderr}`);
    const bytes = Number(child.stdout.trim());
    if (!Number.isFinite(bytes)) throw new Error(`${engine} heap child produced no number`);
    samples.push(bytes);
  }
  const sorted = [...samples].sort((left, right) => left - right);
  return { medianBytesPerNode: sorted[Math.floor(sorted.length / 2)],
    p10BytesPerNode: sorted[Math.floor((sorted.length - 1) * 0.1)],
    p90BytesPerNode: sorted[Math.floor((sorted.length - 1) * 0.9)],
    samples: memorySamples, samplesBytesPerNode: samples };
}

async function main(): Promise<void> {
  const heapArgument = process.argv.find((argument) => argument.startsWith('--heap-one='));
  if (heapArgument) {
    const engine = heapArgument.slice('--heap-one='.length);
    if (engine !== 'new' && engine !== 'legacy') throw new Error(`Unknown engine: ${engine}`);
    heapOne(engine);
    return;
  }
  const long = value(itemCount, 0);
  const first = value(writeCount, 0);
  const second = value(writeCount, 1);
  const acceptanceRows = process.argv.includes('--root-applied') ? {} : {
    keyInput: { new: keyInput('new', long), legacy: keyInput('legacy', long) },
    wholeWrite: { new: wholeWrite('new', first, second),
      legacy: wholeWrite('legacy', first, second) },
    bytesPerNode: { new: heapSamples('new'), legacy: heapSamples('legacy') },
  };
  const rows = {
    ...acceptanceRows,
    keyInputRootApplied: await rootAppliedPair(long),
    wholeWriteRootApplied: await rootAppliedPair(first, second),
    emptyAwait: await emptyAwait(),
  };
  console.log(JSON.stringify({ runtime: Reflect.get(globalThis, 'Bun') ? 'bun' : 'node',
    version: Reflect.get(globalThis, 'Bun') ? process.versions.bun : process.version,
    itemCount, writeCount, completionWarmup, completionSamples,
    completionOrder: 'alternating pairs: new/legacy, legacy/new (ABBA); untimed event drain after each write',
    completionEndpoint: { new: 'synchronous setValue return; root value/outputValue checked',
      legacy: 'root onChange entry; root value/normalizedValue and event output checked',
      waiterResumptionTimed: false, emptyAwaitSubtracted: false },
    macrotask: scheduleMacrotaskSafe.name,
    nodesInHeapTree: 1 + itemCount * 2, rows, sink }));
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
