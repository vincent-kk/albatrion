/**
 * TEST-071: compare one changed element and a whole replacement in the 04 engine.
 * Run this script separately under Node/V8 and Bun/JSC; do not overlap runs.
 */
import { performance } from 'node:perf_hooks';

import { blueprint } from '../src/core/blueprint';
import { schemaNodeFactory, SetValueOption } from '../src/core/SchemaNode';
import type { SchemaNode } from '../src/core/SchemaNode/SchemaNode';
import { loadSchemaNodeAtMount } from '../src/core/settle';
import { sameValue } from '../src/core/settle/utils/compute/sameValue';

const elementCount = 10_000;
const lastKey = `item_${elementCount - 1}`;
const widths = { small: 1, large: 16 } as const;
// Per element: the item and payload objects, one marker, and `width` payload leaves.
const sizeRatio = (widths.large + 3) / (widths.small + 3);
let sink = 0;

type Kind = 'object' | 'array';
type Mode = 'element' | 'whole';
type Item = { payload: Record<string, number>; marker: number };
type Container = Record<string, Item> | Item[];
type SourceValue = { items: Container };
type Timing = { medianUs: number; p10Us: number; p90Us: number; samples: number };

function item(width: number, marker: number): Item {
  const payload: Record<string, number> = {};
  for (let index = 0; index < width; index++) payload[`value_${index}`] = index;
  return { payload, marker };
}

function wholeValue(kind: Kind, width: number, marker: number): SourceValue {
  if (kind === 'array') {
    const items = Array.from({ length: elementCount }, (_, index) =>
      item(width, index === elementCount - 1 ? marker : 0));
    return { items };
  }
  const items: Record<string, Item> = {};
  for (let index = 0; index < elementCount; index++)
    items[`item_${index}`] = item(width, index === elementCount - 1 ? marker : 0);
  return { items };
}

function elementValues(kind: Kind, width: number): [SourceValue, SourceValue] {
  const first = wholeValue(kind, width, 1);
  if (kind === 'array') {
    const items = (first.items as Item[]).slice();
    items[elementCount - 1] = item(width, 2);
    return [first, { items }];
  }
  return [first, { items: { ...first.items, [lastKey]: item(width, 2) } }];
}

function markerOf(value: unknown, kind: Kind): number {
  const items = (value as SourceValue).items;
  return kind === 'array' ? (items as Item[])[elementCount - 1].marker :
    (items as Record<string, Item>)[lastKey].marker;
}

function makeTree(kind: Kind, initial: SourceValue) {
  let injections = 0;
  const schema = { type: 'object' as const, properties: {
    source: { type: 'object' as const, options: { terminal: true },
      controls: { injectTo: (value: unknown) => {
        injections++;
        return { '../target': markerOf(value, kind) };
      } } },
    target: { type: 'number' as const },
  } };
  const root = schemaNodeFactory(blueprint(schema), {
    ifPredicates: new Map(), diagnostics: { status: 'stable' },
    loadSnapshot: undefined, latentRaw: new Map(),
    typeMismatchPaths: new Set(), inactiveValuesMemo: new Map(),
  }) as SchemaNode;
  loadSchemaNodeAtMount(root, { source: initial }, SetValueOption.Overwrite);
  const source = root.find('/source');
  const target = root.find('/target');
  if (!source || !target || markerOf(source.value, kind) !== 1 ||
    target.value !== 1 || injections !== 1)
    throw new Error(`${kind}: object-sourced injectTo fixture did not load`);
  return { source, target, injectionCount: () => injections };
}

function percentile(sorted: readonly number[], fraction: number): number {
  return sorted[Math.floor((sorted.length - 1) * fraction)];
}

function measure(run: () => void, warmups: number, samples: number, batch: number): Timing {
  for (let index = 0; index < warmups; index++) run();
  const times: number[] = [];
  for (let sample = 0; sample < samples; sample++) {
    const start = performance.now();
    for (let index = 0; index < batch; index++) run();
    times.push((performance.now() - start) * 1000 / batch);
  }
  times.sort((left, right) => left - right);
  return { medianUs: percentile(times, 0.5), p10Us: percentile(times, 0.1),
    p90Us: percentile(times, 0.9), samples };
}

function checkShortcut(kind: Kind): void {
  let visits = 0;
  const shared = new Proxy(item(16, 0), {
    ownKeys(target) { visits++; return Reflect.ownKeys(target); },
    get(target, key, receiver) { visits++; return Reflect.get(target, key, receiver); },
  });
  const left = kind === 'array' ? { items: [shared, item(1, 1)] } :
    { items: { first: shared, last: item(1, 1) } };
  const right = kind === 'array' ? { items: [shared, item(1, 2)] } :
    { items: { first: shared, last: item(1, 2) } };
  if (sameValue(left, right) || visits !== 0)
    throw new Error(`18C-50 shortcut missing for ${kind}: shared element visits=${visits}`);
}

function caseResult(kind: Kind, mode: Mode, width: number) {
  const [first, second] = mode === 'element' ? elementValues(kind, width) :
    [wholeValue(kind, width, 1), wholeValue(kind, width, 2)];
  if (sameValue(first, second)) throw new Error(`${kind}/${mode}: equal comparison input`);
  let comparisons = 0;
  const comparison = measure(() => {
    if (sameValue(first, second)) throw new Error('changed value compared equal');
    sink += ++comparisons & 1;
  }, 40, 61, mode === 'element' ? 20 : 3);

  const tree = makeTree(kind, first);
  let writes = 0;
  const write = measure(() => {
    const next = ++writes % 2 === 1 ? second : first;
    const before = tree.injectionCount();
    tree.source.setValue(next);
    const marker = markerOf(next, kind);
    if (tree.injectionCount() !== before + 1 || tree.target.value !== marker)
      throw new Error(`${kind}/${mode}: injectTo did not commit the changed source`);
    sink += marker;
  }, 6, 31, 1);
  return { comparison, write, injections: tree.injectionCount() };
}

function row(kind: Kind, mode: Mode) {
  const small = caseResult(kind, mode, widths.small);
  const large = caseResult(kind, mode, widths.large);
  const ratio = large.comparison.medianUs / small.comparison.medianUs;
  const pass = mode === 'element' ? ratio <= 1.5 :
    ratio >= sizeRatio * 0.5 && ratio <= sizeRatio * 2;
  return { small, large, ratio, pass,
    line: mode === 'element' ? 'ratio <= 1.5' :
      `ratio ${sizeRatio * 0.5}..${sizeRatio * 2} (size ratio ${sizeRatio})` };
}

function main() {
  for (const kind of ['object', 'array'] as const) checkShortcut(kind);
  const rows = {
    'TEST-071-element': { object: row('object', 'element'),
      array: row('array', 'element') },
    'TEST-071-whole': { object: row('object', 'whole'),
      array: row('array', 'whole') },
  };
  console.log(JSON.stringify({ runtime: Reflect.get(globalThis, 'Bun') ? 'bun' : 'node',
    version: Reflect.get(globalThis, 'Bun') ? process.versions.bun : process.version,
    elements: elementCount, elementDeepNodes: { small: 4, large: 19 },
    sizeRatio, shortcut: 'shared elements not visited', rows, sink }, null, 2));
}

main();
