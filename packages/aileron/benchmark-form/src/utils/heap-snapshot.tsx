import { createRef } from 'react';

import fs from 'node:fs';
import path from 'node:path';
import v8 from 'node:v8';
import { createRoot } from 'react-dom/client';

import { Form, type FormHandle, type SchemaNode } from '@canard/schema-form';

import {
  ARRAY_CASES,
  FLAT_CASES,
  NESTED_CASES,
  ONEOF_HEAVY_CASES,
  type ScaleCase,
} from '../fixtures/scale-schemas';
import { drainUntilReady, forceGc, setupJsdom } from './setup-env';

/**
 * App-level heap retained measurement for mounted schema-form trees.
 *
 * ⚠️ The reported `Δheap` is the FULL app footprint — React fiber tree +
 * JSDOM DOM elements + schema-form node tree. It is NOT the schema-form
 * node tree's retained size in isolation. Two correct uses:
 *   1. Per-VERSION memory regression: React/JSDOM contribution is constant
 *      across schema-form versions on the same schema, so the version-to-
 *      version Δ isolates schema-form's own memory change.
 *   2. Per-NODE schema-form footprint: use `--snapshot` to emit a
 *      `.heapsnapshot`, then `parse-heapsnapshot.tsx` to aggregate shallow
 *      self-size BY constructor (ObjectNode/StringNode/...). That filters
 *      out React/JSDOM by class name.
 *
 * Per-scenario, self-contained (forceGc → before → mount+ready → count →
 * forceGc → after → unmount → forceGc). `--repeat=K` reports median Δ.
 *
 * Usage:
 *   node --expose-gc --import tsx src/utils/heap-snapshot.tsx --all --repeat=3
 *   node --expose-gc --import tsx src/utils/heap-snapshot.tsx --scenario array-1000 --snapshot
 */

setupJsdom();

const EMPTY_LABEL = 'empty';

const SCENARIOS: Record<string, ScaleCase | null> = {
  [EMPTY_LABEL]: null,
  ...Object.fromEntries(
    [...FLAT_CASES, ...NESTED_CASES, ...ARRAY_CASES, ...ONEOF_HEAVY_CASES].map(
      (c) => [c.label, c],
    ),
  ),
};

function parseFlag(name: string, fallback: string): string {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (arg) return arg.split('=')[1];
  const idx = process.argv.indexOf(`--${name}`);
  if (
    idx >= 0 &&
    process.argv[idx + 1] &&
    !process.argv[idx + 1].startsWith('--')
  ) {
    return process.argv[idx + 1];
  }
  return fallback;
}

function firstKey(sc: ScaleCase): string {
  const props = (sc.schema as { properties?: Record<string, unknown> })
    .properties;
  return props ? Object.keys(props)[0] : '';
}

/** Count every node in the tree via the full `subnodes` walk. */
function countNodes(root: SchemaNode): number {
  let count = 1;
  const stack: SchemaNode[] = [root];
  while (stack.length) {
    const n = stack.pop()!;
    const subs = n.subnodes;
    if (subs)
      for (const child of subs) {
        count += 1;
        stack.push(child.node);
      }
  }
  return count;
}

interface ScenarioResult {
  scenario: string;
  nodeCount: number;
  deltaHeap: number;
  samples: number[];
}

async function measureOnce(sc: ScaleCase | null): Promise<{
  deltaHeap: number;
  nodeCount: number;
}> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const ref = createRef<FormHandle>();

  forceGc();
  const before = process.memoryUsage().heapUsed;

  let nodeCount = 0;
  if (sc) {
    root.render(
      <Form
        ref={ref}
        jsonSchema={sc.schema}
        onValidate={() => {}}
        onChange={() => {}}
      />,
    );
    const key = firstKey(sc);
    await drainUntilReady(() => ref.current?.findNode(`/${key}`) != null);
    const anyNode = ref.current!.findNode(`/${key}`) as SchemaNode;
    nodeCount = countNodes(anyNode.rootNode);
  }

  forceGc();
  const after = process.memoryUsage().heapUsed;
  const deltaHeap = after - before;

  root.unmount();
  container.remove();
  forceGc();

  return { deltaHeap, nodeCount };
}

function median(xs: number[]): number {
  const sorted = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

async function measureScenario(
  label: string,
  repeat: number,
): Promise<ScenarioResult> {
  const sc = SCENARIOS[label];
  if (sc === undefined)
    throw new Error(
      `Unknown scenario "${label}". Choices: ${Object.keys(SCENARIOS).join(', ')}`,
    );
  const samples: number[] = [];
  let nodeCount = 0;
  for (let i = 0; i < repeat; i++) {
    const r = await measureOnce(sc);
    samples.push(r.deltaHeap);
    nodeCount = r.nodeCount;
  }
  return { scenario: label, nodeCount, deltaHeap: median(samples), samples };
}

function fmtBytes(n: number): string {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs < 1024) return `${sign}${abs}B`;
  if (abs < 1024 * 1024) return `${sign}${(abs / 1024).toFixed(1)}KB`;
  return `${sign}${(abs / (1024 * 1024)).toFixed(2)}MB`;
}

async function writeSnapshotFor(label: string, ts: string, outBase: string) {
  const sc = SCENARIOS[label];
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const ref = createRef<FormHandle>();
  if (sc) {
    root.render(
      <Form
        jsonSchema={sc.schema}
        ref={ref}
        onValidate={() => {}}
        onChange={() => {}}
      />,
    );
    const key = firstKey(sc);
    await drainUntilReady(() => ref.current?.findNode(`/${key}`) != null);
  }
  forceGc();
  const outDir = path.resolve(process.cwd(), 'results');
  const snapPath = path.join(outDir, `${outBase}-${label}-${ts}.heapsnapshot`);
  v8.writeHeapSnapshot(snapPath);
  console.log(`💾 snapshot: ${snapPath}`);
  root.unmount();
  container.remove();
}

async function main() {
  if (typeof (globalThis as any).gc !== 'function') {
    console.error('error: this tool requires node --expose-gc');
    process.exit(1);
  }

  const repeat = Math.max(1, parseInt(parseFlag('repeat', '3'), 10) || 3);
  const runAll = process.argv.includes('--all');
  const writeSnapshot = process.argv.includes('--snapshot');
  const outBase = parseFlag('out', 'heap');

  const labels = runAll
    ? Object.keys(SCENARIOS)
    : [parseFlag('scenario', 'array-1000')];

  console.log(
    `📦 heap-snapshot | repeat=${repeat} | scenarios=${labels.length} (app-level Δ incl. React+JSDOM)`,
  );

  const results: ScenarioResult[] = [];
  for (const label of labels) {
    const r = await measureScenario(label, repeat);
    results.push(r);
    console.log(
      `  ${label}: Δ=${fmtBytes(r.deltaHeap)} | nodes=${r.nodeCount}`,
    );
  }

  const empty = results.find((r) => r.scenario === EMPTY_LABEL);
  const floor = empty?.deltaHeap ?? 0;
  if (results.length > 1) {
    console.log('\n📊 Per-node app-level (net of empty floor):');
    console.log(`  empty floor: ${fmtBytes(floor)}`);
    console.log('| scenario | nodes | Δheap | net | per-node |');
    console.log('| --- | --- | --- | --- | --- |');
    for (const r of results) {
      if (r.scenario === EMPTY_LABEL) continue;
      const net = r.deltaHeap - floor;
      const perNode = r.nodeCount ? net / r.nodeCount : 0;
      console.log(
        `| ${r.scenario} | ${r.nodeCount} | ${fmtBytes(r.deltaHeap)} | ${fmtBytes(net)} | ${fmtBytes(perNode)} |`,
      );
    }
  }

  const outDir = path.resolve(process.cwd(), 'results');
  fs.mkdirSync(outDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonPath = path.join(outDir, `heap-${ts}.json`);
  fs.writeFileSync(
    jsonPath,
    JSON.stringify({ timestamp: ts, repeat, floor, results }, null, 2),
  );
  console.log(`\n💾 Saved: ${jsonPath}`);

  if (writeSnapshot) {
    await writeSnapshotFor(labels[labels.length - 1], ts, outBase);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
