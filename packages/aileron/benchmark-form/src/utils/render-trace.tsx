import { createRef } from 'react';

import { createRoot } from 'react-dom/client';

import {
  Form,
  type FormHandle,
  type FormTypeRendererProps,
  type JsonSchema,
} from '@canard/schema-form';

import {
  buildArraySchema,
  buildFlatSchema,
  buildNestedSchema,
} from '../fixtures/scale-schemas';
import { drainTicks, drainUntilReady, forceGc, setupJsdom } from './setup-env';

setupJsdom();

/**
 * Render-count instrumentation for the React layer.
 *
 * A `CustomFormTypeRenderer` increments a per-path counter on every commit.
 * Because `SchemaNodeProxy` wraps the renderer in `memo`, a count only
 * increases when React actually re-renders that node — memo-skipped nodes
 * are NOT counted. So `renderCounts` is the exact set of nodes React
 * committed, keyed by JSON Pointer path.
 *
 * Protocol per scenario:
 *   1. mount, drain → record mount render distribution
 *   2. clear counter
 *   3. setValue on ONE leaf node, drain → record the re-render fan-out
 *
 * The question this answers: when a single field changes, how many OTHER
 * nodes re-render? Ideal = the field itself + its ancestors (value bubbles
 * up). Anything beyond that (siblings) is wasted React work.
 */
const renderCounts = new Map<string, number>();

function CountingRenderer({ path, Input }: FormTypeRendererProps) {
  renderCounts.set(path, (renderCounts.get(path) ?? 0) + 1);
  return <Input />;
}

function total(): number {
  let sum = 0;
  for (const c of renderCounts.values()) sum += c;
  return sum;
}

interface Scenario {
  label: string;
  schema: JsonSchema;
  target: string;
}

async function measure({ label, schema, target }: Scenario): Promise<void> {
  renderCounts.clear();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const ref = createRef<FormHandle<JsonSchema>>();

  try {
    root.render(
      <Form
        ref={ref}
        jsonSchema={schema}
        CustomFormTypeRenderer={CountingRenderer}
        onChange={() => {}}
        onValidate={() => {}}
      />,
    );
    await drainUntilReady(() => ref.current?.findNode(target) != null);
    await drainTicks(2);

    const mountNodes = renderCounts.size;
    const mountTotal = total();
    const mountRemounts = [...renderCounts.entries()].filter(
      ([, c]) => c > 1,
    ).length;

    // Isolate a single field mutation. Targets are always string leaves;
    // narrowing on `type` keeps setValue's argument type correct (no cast).
    renderCounts.clear();
    const node = ref.current?.findNode(target);
    if (node?.type !== 'string')
      throw new Error(`expected string leaf at ${target}, got ${node?.type}`);
    node.setValue(`changed_${label}`);
    await drainTicks(2);

    const changeTotal = total();
    const rerendered = [...renderCounts.entries()]
      .filter(([, c]) => c > 0)
      .sort((a, b) => b[1] - a[1]);
    const ancestors = target.split('/').filter(Boolean).length; // depth
    const ideal = ancestors + 1; // target + each ancestor incl. root

    console.log(`\n=== ${label}  (setValue ${target}) ===`);
    console.log(
      `  mount:    ${mountNodes} nodes, ${mountTotal} renders` +
        ` (avg ${(mountTotal / mountNodes).toFixed(2)}/node, ${mountRemounts} nodes rendered >1×)`,
    );
    console.log(
      `  1 change: ${rerendered.length} nodes re-rendered, ${changeTotal} total commits`,
    );
    console.log(
      `  ideal:    ~${ideal} nodes (target + ${ancestors} ancestors)` +
        `  →  over-render ${(rerendered.length / ideal).toFixed(1)}×`,
    );
    const head = rerendered.slice(0, 12);
    for (const [p, c] of head)
      console.log(`     ${c}×  ${p === '' ? '(root)' : p}`);
    if (rerendered.length > head.length)
      console.log(`     … +${rerendered.length - head.length} more`);
  } finally {
    root.unmount();
    container.remove();
  }
}

/**
 * Separates the O(N) cost of a single field change into:
 *   - value-getter: pure `rootNode.value` read (node-tree cost, no React)
 *   - setValue+drain: full wall-clock per change (node cascade + React commit)
 *
 * If both scale with N, the O(N) lives in the node tree (value composition),
 * not in React rendering — the render-count proof already shows React only
 * commits a constant number of nodes per change.
 */
async function measureTiming({
  label,
  schema,
  target,
}: Scenario): Promise<void> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const ref = createRef<FormHandle<JsonSchema>>();

  try {
    root.render(
      <Form
        ref={ref}
        jsonSchema={schema}
        onChange={() => {}}
        onValidate={() => {}}
      />,
    );
    await drainUntilReady(() => ref.current?.findNode(target) != null);
    await drainTicks(2);

    const node = ref.current?.findNode(target);
    const rootNode = ref.current?.node;
    if (node?.type !== 'string' || !rootNode)
      throw new Error(`not ready (string leaf expected): ${label}`);

    // (A) pure root.value getter cost
    const GET_ITER = 2000;
    forceGc();
    let t = performance.now();
    for (let i = 0; i < GET_ITER; i++) void rootNode.value;
    const getterUs = ((performance.now() - t) / GET_ITER) * 1000;

    // (B) single setValue + 1 macrotask drain wall-clock
    const CHANGES = 40;
    forceGc();
    t = performance.now();
    for (let i = 0; i < CHANGES; i++) {
      node.setValue(`v_${i}`);
      await drainTicks(1);
    }
    const changeMs = (performance.now() - t) / CHANGES;

    console.log(
      `  ${label.padEnd(14)} value-getter ${getterUs.toFixed(2).padStart(7)}µs/read` +
        `   |   setValue+drain ${changeMs.toFixed(3).padStart(7)}ms/change`,
    );
  } finally {
    root.unmount();
    container.remove();
  }
}

const deepLeaf = (depth: number): string =>
  '/' + Array.from({ length: depth }, () => 'n0').join('/');

async function main(): Promise<void> {
  const scenarios: Scenario[] = [
    { label: 'flat-50', schema: buildFlatSchema(50), target: '/field_000' },
    { label: 'flat-500', schema: buildFlatSchema(500), target: '/field_000' },
    {
      label: 'nested-d3-f4',
      schema: buildNestedSchema(3, 4),
      target: deepLeaf(3),
    },
    {
      label: 'nested-d5-f4',
      schema: buildNestedSchema(5, 4),
      target: deepLeaf(5),
    },
    {
      label: 'array-100',
      schema: buildArraySchema(100),
      target: '/items/0/name',
    },
  ];
  for (const scenario of scenarios) await measure(scenario);

  console.log('\n=== O(N) decomposition: value-getter vs full change ===');
  const sizes = [50, 100, 500, 1000];
  for (const n of sizes)
    await measureTiming({
      label: `flat-${n}`,
      schema: buildFlatSchema(n),
      target: '/field_000',
    });

  console.log('\n done.');
}

main();
