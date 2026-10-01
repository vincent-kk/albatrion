/**
 * Standalone U9 measurements. Run once under Node/V8 and once under Bun/JSC.
 * Each timed sample receives the same schema and input in both runtimes.
 */
import { performance } from 'node:perf_hooks';
import { spawnSync } from 'node:child_process';

import { blueprint } from '../src/core/blueprint';
import type { BlueprintSchema } from '../src/core/blueprint';
import { BEHAVIORS } from '../src/core/behaviors';
import { schemaNodeFactory, SetValueOption } from '../src/core/SchemaNode';
import type { SchemaNode as RuntimeSchemaNode } from '../src/core/SchemaNode/SchemaNode';
import { loadSchemaNodeAtMount } from '../src/core/settle';
import { getGateRegistry } from '../src/core/settle/utils/gates/getGateRegistry';
import { nodeFromJSONSchema } from '../src/core/nodeFromJSONSchema';
import type { JSONSchema } from '../src/types';

const noop = () => {};
const sampleCount = 100;
let sink = 0;
let liveHeapRoot: unknown;

type Sample = { meanMs: number; hz: number; samplesMs: number[] };

function measure(run: (index: number) => void, warmups = 20): Sample {
  for (let index = 0; index < warmups; index++) run(index);
  const samplesMs: number[] = [];
  for (let index = 0; index < sampleCount; index++) {
    const start = performance.now();
    run(index + warmups);
    samplesMs.push(performance.now() - start);
  }
  const meanMs = samplesMs.reduce((sum, value) => sum + value, 0) / samplesMs.length;
  return { meanMs, hz: 1000 / meanMs, samplesMs };
}

function makeNew(schema: BlueprintSchema, value?: unknown) {
  const root = schemaNodeFactory(blueprint(schema), {
    diagnostics: { status: 'stable' },
    loadSnapshot: undefined,
    latentRaw: new Map(),
    typeMismatchPaths: new Set(),
    inactiveValuesMemo: new Map(),
  }) as unknown as RuntimeSchemaNode;
  if (value !== undefined) loadSchemaNodeAtMount(root, value, SetValueOption.Overwrite);
  return root;
}

function makeLegacy(schema: JSONSchema, value?: Record<string, unknown>) {
  return nodeFromJSONSchema({ jsonSchema: schema, defaultValue: value, onChange: noop });
}

function flat(count: number, mixed = false) {
  const properties: Record<string, { type: 'number' | 'string' | 'boolean' }> = {};
  const value: Record<string, number | string | boolean> = {};
  for (let index = 0; index < count; index++) {
    const type = mixed ? (['number', 'string', 'boolean'] as const)[index % 3] : 'number';
    const name = `field_${index}`;
    properties[name] = { type };
    value[name] = type === 'number' ? index : type === 'string' ? String(index) : index % 2 === 0;
  }
  return { schema: { type: 'object' as const, properties }, value };
}

function keyInput(schema: BlueprintSchema, value: Record<string, unknown>) {
  const root = makeNew(schema, value);
  const key = root.find('/key');
  if (!key) throw new Error('key input fixture has no /key');
  return measure((index) => {
    key.setValue(index);
    sink += Number(key.value) & 1;
  });
}

function fragmentSchema(count: number): BlueprintSchema {
  const allOf = Array.from({ length: count }, (_, index) => ({
    controls: { active: './enabled' },
    properties: { [`part_${index}`]: { type: 'string' } },
  }));
  return { type: 'object', properties: {
    enabled: { type: 'boolean' }, key: { type: 'number' },
  }, allOf };
}

function relocatedGateSchema(count: number): BlueprintSchema {
  const properties: Record<string, unknown> = {
    trigger: { type: 'boolean' }, key: { type: 'number' },
  };
  for (let index = 0; index < count; index++)
    properties[`host_${index}`] = { type: 'object', properties: {
      gated: { type: 'string', controls: { active: '#/trigger' } },
    } };
  return { type: 'object', properties };
}

function latentSchema(depth: number): BlueprintSchema {
  let nested: BlueprintSchema = { type: 'object', properties: {
    flag: { type: 'boolean' },
    hidden: { type: 'string', controls: { active: '../flag' } },
  } };
  for (let index = 0; index < depth; index++)
    nested = { type: 'object', properties: { branch: nested } };
  return nested;
}

function latentValue(depth: number, index: number): Record<string, unknown> {
  let value: Record<string, unknown> = { flag: false, hidden: String(index) };
  for (let level = 0; level < depth; level++) value = { branch: value };
  return value;
}

function heapUsed() { return process.memoryUsage().heapUsed; }

function collect() {
  const bun = Reflect.get(globalThis, 'Bun') as { gc?: (force: boolean) => void } | undefined;
  const nodeGc = Reflect.get(globalThis, 'gc') as (() => void) | undefined;
  if (bun?.gc) bun.gc(true);
  else if (nodeGc) { nodeGc(); nodeGc(); }
  else throw new Error('B2 needs a GC-enabled child process');
}

function heapSample(create: () => unknown, nodes: number) {
  const bytes: number[] = [];
  for (let index = 0; index < 7; index++) {
    collect();
    const before = heapUsed();
    liveHeapRoot = create();
    collect();
    bytes.push((heapUsed() - before) / nodes);
    sink += Number(Boolean(liveHeapRoot));
    liveHeapRoot = undefined;
    collect();
  }
  const sorted = [...bytes].sort((left, right) => left - right);
  return { bytesPerNode: sorted[Math.floor(sorted.length / 2)], samples: bytes };
}

function b2() {
  if (Reflect.get(globalThis, 'Bun')) {
    const run = (kind: 'new' | 'legacy') => {
      const samples: number[] = [];
      for (let index = 0; index < 7; index++) {
        const child = spawnSync(process.execPath,
          ['bench/node-and-settle.bench.ts', `--heap-one=${kind}`],
          { encoding: 'utf8', cwd: process.cwd() });
        if (child.status !== 0) throw new Error(`B2 ${kind} child failed: ${child.stderr}`);
        samples.push(Number(child.stdout.trim()));
      }
      const sorted = [...samples].sort((left, right) => left - right);
      return { bytesPerNode: sorted[Math.floor(sorted.length / 2)], samples };
    };
    return { new: run('new'), legacy: run('legacy') };
  }
  const { schema, value } = flat(5000);
  const analysis = blueprint(schema);
  const makeTree = () => {
    const root = schemaNodeFactory(analysis, {
      diagnostics: { status: 'stable' },
      loadSnapshot: undefined,
      latentRaw: new Map(), typeMismatchPaths: new Set(), inactiveValuesMemo: new Map(),
    }) as unknown as RuntimeSchemaNode;
    loadSchemaNodeAtMount(root, value, SetValueOption.Overwrite);
    return root;
  };
  return { new: heapSample(makeTree, 5001), legacy: heapSample(() => makeLegacy(schema, value), 5001) };
}

function heapOne(kind: 'new' | 'legacy') {
  const { schema, value } = flat(5000);
  const analysis = kind === 'new' ? blueprint(schema) : undefined;
  collect();
  const before = heapUsed();
  if (analysis) {
    const root = schemaNodeFactory(analysis, {
      diagnostics: { status: 'stable' },
      loadSnapshot: undefined,
      latentRaw: new Map(), typeMismatchPaths: new Set(), inactiveValuesMemo: new Map(),
    }) as unknown as RuntimeSchemaNode;
    loadSchemaNodeAtMount(root, value, SetValueOption.Overwrite);
    liveHeapRoot = root;
  } else liveHeapRoot = makeLegacy(schema, value);
  collect();
  const bytes = (heapUsed() - before) / 5001;
  sink += Number(Boolean(liveHeapRoot));
  console.log(bytes);
}

function b3() {
  const schemas: BlueprintSchema[] = [
    { type: 'string' }, { type: 'number' }, { type: 'boolean' },
    { type: 'null' }, { type: ['string', 'number'] },
    { type: 'object', properties: { child: { type: 'string' } } },
    { type: 'object', options: { terminal: true } },
  ];
  const nodes = schemas.map((schema) => makeNew(schema));
  const virtualRoot = makeNew({ type: 'object',
    properties: { source: { type: 'string' } },
    options: { virtual: { pair: { fields: ['source'] } } },
  }, { source: 'value' });
  const virtual = virtualRoot.find('/pair');
  if (!virtual) throw new Error('B3 virtual fixture is missing');
  nodes.push(virtual);
  const first = nodes[0];
  const ownKeys = Object.getOwnPropertyNames(first).join(',');
  const sameLayout = nodes.filter((node) => Object.getPrototypeOf(node) ===
    Object.getPrototypeOf(first) && Object.getOwnPropertyNames(node).join(',') === ownKeys).length;
  const rows = Object.values(BEHAVIORS).flatMap((entry) =>
    [entry?.branch, entry?.terminal].filter((row) => row !== undefined));
  const firstRow = rows[0];
  const rowKeys = Object.getOwnPropertyNames(firstRow).join(',');
  const sameRowLayout = rows.filter((row) => Object.getPrototypeOf(row) ===
    Object.getPrototypeOf(firstRow) && Object.getOwnPropertyNames(row).join(',') === rowKeys).length;
  const haveSameMap = process.argv.includes('--map-child')
    ? new Function('left', 'right', 'return %HaveSameMap(left, right)') as
      (left: object, right: object) => boolean : undefined;
  return { checkedKinds: nodes.map((node) => `${node.type}/${node.strategy}`),
    sameLayout, count: nodes.length,
    sameRowLayout, rowCount: rows.length,
    hiddenMap: haveSameMap ? nodes.filter((node) => haveSameMap(first, node)).length :
      'unavailable without engine diagnostics',
    hiddenRowMap: haveSameMap ? rows.filter((row) => haveSameMap(firstRow, row)).length :
      'unavailable without engine diagnostics' };
}

function b4() {
  const result = b3();
  return { receiverLayouts: result.count === result.sameLayout ? 1 : result.count - result.sameLayout + 1,
    checkedKinds: result.count, note: 'receiver layout proxy; IC slot count is not exposed' };
}

function latentCosts() {
  const latent = (depth: number) => {
    const inputs = Array.from({ length: 120 }, (_, index) => latentValue(depth, index));
    const root = makeNew(latentSchema(depth), latentValue(depth, -1));
    let previousMemo = root.inactiveValues;
    return measure((index) => {
      root.setValue(inputs[index]);
      const memo = root.inactiveValues;
      if (memo === previousMemo || memo[0]?.value !== String(index))
        throw new Error(`18C-67 ancestor memo was not updated at depth ${depth}`);
      previousMemo = memo;
      sink += memo.length;
    });
  };
  return { depth0: latent(0), depth4: latent(4), depth8: latent(8) };
}

function verifyFixtures() {
  const fragments = makeNew(fragmentSchema(64), { enabled: true, key: 0 });
  const relocated = makeNew(relocatedGateSchema(64), { trigger: true, key: 0 });
  const latent = makeNew(latentSchema(8), latentValue(8, 0));
  const gated = Array.from({ length: 64 }, (_, index) =>
    relocated.find(`/host_${index}/gated`)).filter(Boolean).length;
  const rootGates = getGateRegistry(relocated.runtime).relocated('');
  const relocatedAtRoot = Array.from({ length: 64 }, (_, index) =>
    `/host_${index}/gated`).filter((path) => rootGates.some((entry) =>
    entry.hostPath === path && entry.evaluationHostPath === '')).length;
  const counts = { activeFragments: (fragments.children?.length ?? 0) - 2,
    relocatedGates: gated, relocatedAtRoot,
    inactiveValues: latent.inactiveValues.length };
  if (counts.activeFragments !== 64 || counts.relocatedGates !== 64 ||
    counts.relocatedAtRoot !== 64 ||
    counts.inactiveValues !== 1)
    throw new Error(`U9 fixture mismatch: ${JSON.stringify(counts)}`);
  return counts;
}

function b5() {
  const small = flat(50);
  const newRoot = makeNew(small.schema, small.value);
  const oldRoot = makeLegacy(small.schema, small.value);
  const newKey = newRoot.find('/field_0');
  const oldKey = oldRoot.find('/field_0') as unknown as {
    setValue: (value: number) => void;
  } | null;
  if (!newKey || !oldKey) throw new Error('B5 fixture mismatch');
  const newSample = measure((index) => {
    newKey.setValue(index);
    const observed = Number(Reflect.get(newRoot.value as object, 'field_0'));
    if (observed !== index) throw new Error('B5 new root has not committed the input');
    sink += observed;
  });
  const oldSample = measure((index) => {
    oldKey.setValue(index);
    const observed = Number(Reflect.get(oldRoot.value as object, 'field_0'));
    if (observed !== index) throw new Error('B5 legacy root has not committed the input');
    sink += observed;
  });
  return { new: newSample, legacy: oldSample };
}

function main() {
  const one = process.argv.find((argument) => argument.startsWith('--heap-one='));
  if (one) {
    const kind = one.slice('--heap-one='.length);
    if (kind !== 'new' && kind !== 'legacy') throw new Error(`Unknown heap kind: ${kind}`);
    heapOne(kind);
    return;
  }
  if (process.argv.includes('--heap-child')) {
    console.log(JSON.stringify(b2()));
    return;
  }
  if (process.argv.includes('--map-child') || process.argv.includes('--b3-only')) {
    console.log(JSON.stringify(b3()));
    return;
  }
  if (process.argv.includes('--fixtures-only')) {
    console.log(JSON.stringify(verifyFixtures()));
    return;
  }
  if (process.argv.includes('--b5-only')) {
    console.log(JSON.stringify(b5()));
    return;
  }
  if (process.argv.includes('--latent-only')) {
    console.log(JSON.stringify(latentCosts()));
    return;
  }
  const fixtures = verifyFixtures();

  const large = flat(10000, true);
  const largeAnalysis = blueprint(large.schema);
  const freshLarge = () => {
    const root = schemaNodeFactory(largeAnalysis, {
      diagnostics: { status: 'stable' },
      loadSnapshot: undefined,
      latentRaw: new Map(), typeMismatchPaths: new Set(), inactiveValuesMemo: new Map(),
    }) as unknown as RuntimeSchemaNode;
    loadSchemaNodeAtMount(root, large.value, SetValueOption.Overwrite);
    return root;
  };
  const newLarge = freshLarge();
  const oldLarge = makeLegacy(large.schema, large.value);
  const newNodes = newLarge.children;
  const oldNodes = oldLarge.children?.map((entry) => entry.node);
  if (newNodes?.length !== 10000 || oldNodes?.length !== 10000)
    throw new Error(`B1 fixture mismatch: new ${newNodes?.length}, legacy ${oldNodes?.length}`);
  const read = (nodes: readonly { type: string; value: unknown }[]) => measure(() => {
    let count = 0;
    for (const node of nodes) {
      count += node.type.length;
      if (node.value !== undefined) count++;
    }
    sink += count;
  });
  const B1 = { new: read(newNodes), legacy: read(oldNodes) };

  let B2: ReturnType<typeof b2>;
  if (Reflect.get(globalThis, 'Bun')) B2 = b2();
  else {
    const child = spawnSync(process.execPath,
      ['--expose-gc', '--import', 'tsx', 'bench/node-and-settle.bench.ts', '--heap-child'],
      { encoding: 'utf8', cwd: process.cwd(), maxBuffer: 1024 * 1024 * 4 });
    if (child.status !== 0) throw new Error(`B2 child failed: ${child.stderr}`);
    B2 = JSON.parse(child.stdout) as ReturnType<typeof b2>;
  }
  let B3 = b3();
  if (!Reflect.get(globalThis, 'Bun')) {
    const child = spawnSync(process.execPath,
      ['--allow-natives-syntax', '--import', 'tsx',
        'bench/node-and-settle.bench.ts', '--map-child'],
      { encoding: 'utf8', cwd: process.cwd() });
    if (child.status !== 0) throw new Error(`B3 child failed: ${child.stderr}`);
    B3 = JSON.parse(child.stdout) as ReturnType<typeof b3>;
  }
  const B4 = b4();

  const B5 = b5();
  const B6 = {
    new: measure(() => { sink += Number(Boolean(freshLarge())); }, 5),
    legacy: measure(() => { sink += Number(Boolean(makeLegacy(large.schema, large.value))); }, 5),
  };

  const fragments = {
    n0: keyInput(fragmentSchema(0), { enabled: true, key: 0 }),
    n16: keyInput(fragmentSchema(16), { enabled: true, key: 0 }),
    n64: keyInput(fragmentSchema(64), { enabled: true, key: 0 }),
  };
  const latent = latentCosts();
  const gates = {
    n0: keyInput(relocatedGateSchema(0), { trigger: true, key: 0 }),
    n16: keyInput(relocatedGateSchema(16), { trigger: true, key: 0 }),
    n64: keyInput(relocatedGateSchema(64), { trigger: true, key: 0 }),
  };
  console.log(JSON.stringify({ runtime: Reflect.get(globalThis, 'Bun') ? 'bun' : 'node',
    version: Reflect.get(globalThis, 'Bun') ? process.versions.bun : process.version,
    samples: sampleCount, fixtures, rows: { B1, B2, B3, B4, B5, B6,
      '18C-15': fragments, '18C-67': latent, '18C-81': gates }, sink }));
}

main();
