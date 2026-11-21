import { describe, expect, it } from 'vitest';

import { EXTERNAL_VALUE_REVISION } from '@/schema-form/constants/externalValueRevision';

import { build, codes, diag } from './probeHelpers';

/** Small seeded generator (mulberry32). */
const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const schema = {
  type: 'object',
  properties: {
    s: { type: 'string' },
    n: { type: 'number' },
    o: {
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'number' },
        c: { type: 'boolean' },
        inner: {
          type: 'object',
          properties: { x: { type: 'string' }, y: { type: 'integer' } },
        },
      },
    },
    list: {
      type: 'array',
      items: {
        type: 'object',
        properties: { k: { type: 'string' }, v: { type: 'number' } },
      },
    },
    tags: { type: 'array', items: { type: 'string' } },
  },
} as const;

const pick = <T,>(r: () => number, xs: readonly T[]) => xs[Math.floor(r() * xs.length)];

const strings = ['', 'a', 'b', undefined, 'a'] as const;
const numbers = [0, 1, 2.5, undefined, 1, '3', -0] as const;
const bools = [true, false, undefined, true] as const;

const genValue = (r: () => number) => {
  const maybe = <T,>(v: T) => (r() < 0.15 ? undefined : v);
  const list = Array.from({ length: Math.floor(r() * 3) }, () =>
    maybe({ k: pick(r, strings), v: pick(r, numbers) }),
  );
  return {
    s: pick(r, strings),
    n: pick(r, numbers),
    o: maybe({
      a: pick(r, strings),
      b: pick(r, numbers),
      c: pick(r, bools),
      inner: maybe({ x: pick(r, strings), y: pick(r, [1, 2, undefined, '4']) }),
    }),
    list: maybe(list),
    tags: maybe(Array.from({ length: Math.floor(r() * 3) }, () => pick(r, strings))),
  };
};

/** Mutate a copy so that most leaves stay equal (same-shape writes). */
const nudge = (r: () => number, value: any): any => {
  const copy = JSON.parse(JSON.stringify(value ?? {}));
  if (r() < 0.5) copy.s = pick(r, strings);
  if (copy.o && r() < 0.6) copy.o.a = pick(r, strings);
  if (copy.o && r() < 0.3) copy.o.b = pick(r, numbers);
  if (copy.o?.inner && r() < 0.4) copy.o.inner.x = pick(r, strings);
  if (Array.isArray(copy.list) && copy.list.length && r() < 0.6) {
    const i = Math.floor(r() * copy.list.length);
    if (copy.list[i]) copy.list[i].k = pick(r, strings);
  }
  if (Array.isArray(copy.tags) && copy.tags.length && r() < 0.6)
    copy.tags[0] = pick(r, strings);
  return copy;
};

const collect = (root: any) => {
  const nodes: any[] = [];
  root.visitSubtree((node: any) => {
    nodes.push(node);
  });
  return nodes;
};

const snapshot = (root: any, events: Map<any, number>, before: any[]) => {
  const result: Record<string, unknown> = {};
  for (const node of before) {
    result[`${node.path}|ev`] = events.get(node) ?? 0;
    result[`${node.path}|rev`] = node.revision();
    if (node.strategy === 'branch')
      result[`${node.path}|ext`] = node.revision(EXTERNAL_VALUE_REVISION);
  }
  for (const node of collect(root)) {
    result[`${node.path}|value`] = JSON.stringify(node.value, (_k, v) =>
      v === undefined ? '__u' : Number.isNaN(v) ? '__nan' : v,
    );
    result[`${node.path}|misfit`] = node.isMisfit;
  }
  result.root = JSON.stringify(root.value);
  result.output = JSON.stringify(root.outputValue);
  return result;
};

const run = (start: any, target: any, mode: 'plain' | 'batch') => {
  const { root, records, changes } = build(schema, start);
  const before = collect(root);
  const events = new Map<any, number>();
  for (const node of before)
    node.subscribe((event: any) => {
      events.set(node, (events.get(node) ?? 0) | event.type);
    });
  records.length = 0;
  changes.length = 0;
  if (mode === 'plain') root.setValue(target);
  else root.batch(() => root.setValue(target));
  return {
    ...snapshot(root, events, before),
    records: codes(records).join(','),
    changes: changes.length,
  };
};

describe('EQ2 single write against the same write in a batch', () => {
  it('root setValue matches root batch(setValue) on 400 seeded cases', () => {
    const r = rng(20261118);
    const mismatches: unknown[] = [];
    for (let i = 0; i < 400; i++) {
      const start = genValue(r);
      const target = r() < 0.7 ? nudge(r, start) : genValue(r);
      const plain = run(start, target, 'plain');
      const batched = run(start, target, 'batch');
      const diff: Record<string, unknown> = {};
      for (const key of new Set([...Object.keys(plain), ...Object.keys(batched)]))
        if ((plain as any)[key] !== (batched as any)[key])
          diff[key] = [(plain as any)[key], (batched as any)[key]];
      if (Object.keys(diff).length) mismatches.push({ i, start, target, diff });
    }
    diag('EQ2 mismatches', { count: mismatches.length, first: mismatches.slice(0, 4) });
    expect(mismatches.length).toBe(0);
  });
});
