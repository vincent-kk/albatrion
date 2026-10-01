/**
 * TEST-032: compare array input, whole writes, and retained heap with the legacy engine.
 * Run under Node/V8 and Bun/JSC without overlapping other benchmarks.
 */
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';

import { blueprint } from '../src/core/blueprint';
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
const memorySamples = 7;
let sink = 0;
let retainedTree: unknown;

type Engine = 'new' | 'legacy';
type Item = { key: number };
type BenchLeaf = { setValue(value: number): void; value: unknown };
type BenchTree = { find(pointer: string): BenchLeaf | null;
  children: readonly unknown[] | null; setValue(value: Item[]): void; value: unknown };
type Timing = { medianUs: number; p10Us: number; p90Us: number;
  meanHz: number; samples: number; samplesUs: number[] };

function value(count: number, key: number): Item[] {
  return Array.from({ length: count }, () => ({ key }));
}

function makeTree(engine: Engine, input: Item[], analysis?: ReturnType<typeof blueprint>): BenchTree {
  if (engine === 'legacy')
    return nodeFromJSONSchema({ jsonSchema: schema, defaultValue: input,
      onChange: noop }) as unknown as BenchTree;
  const root = schemaNodeFactory(analysis ?? blueprint(schema), {
    ifPredicates: new Map(), diagnostics: { status: 'stable' },
    loadSnapshot: undefined, latentRaw: new Map(),
    typeMismatchPaths: new Set(), inactiveValuesMemo: new Map(),
  }) as RuntimeSchemaNode;
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
  const sorted = [...samplesUs].sort((left, right) => left - right);
  const percentile = (fraction: number) => sorted[Math.floor((sorted.length - 1) * fraction)];
  const meanUs = samplesUs.reduce((sum, duration) => sum + duration, 0) / sampleCount;
  return { medianUs: percentile(0.5), p10Us: percentile(0.1),
    p90Us: percentile(0.9), meanHz: 1_000_000 / meanUs,
    samples: sampleCount, samplesUs };
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

function main(): void {
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
  const rows = {
    keyInput: { new: keyInput('new', long), legacy: keyInput('legacy', long) },
    wholeWrite: { new: wholeWrite('new', first, second),
      legacy: wholeWrite('legacy', first, second) },
    bytesPerNode: { new: heapSamples('new'), legacy: heapSamples('legacy') },
  };
  console.log(JSON.stringify({ runtime: Reflect.get(globalThis, 'Bun') ? 'bun' : 'node',
    version: Reflect.get(globalThis, 'Bun') ? process.versions.bun : process.version,
    itemCount, writeCount, nodesInHeapTree: 1 + itemCount * 2, rows, sink }));
}

main();
