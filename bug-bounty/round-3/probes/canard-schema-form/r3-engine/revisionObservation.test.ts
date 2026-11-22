import { describe, expect, it } from 'vitest';

import { attempt, build, diag } from './probeHelpers';

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
    on: { type: 'boolean' },
    name: { type: 'string' },
    gated: { type: 'string', controls: { active: '../on === true' } },
    upper: {
      type: 'string',
      controls: { derived: '((../name) ?? "").toUpperCase()' },
    },
    watcher: { type: 'string', controls: { watch: ['../name'] } },
    list: {
      type: 'array',
      items: {
        type: 'object',
        properties: { k: { type: 'string' }, n: { type: 'number' } },
      },
    },
  },
} as const;

type Op = (root: any) => void;

const genOps = (r: () => number, count: number): Op[] => {
  const ops: Op[] = [];
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)];
  for (let i = 0; i < count; i++) {
    const kind = Math.floor(r() * 7);
    const v = pick(['', 'a', 'b', undefined]);
    const n = pick([0, 1, 2, undefined]);
    const idx = Math.floor(r() * 3);
    if (kind === 0) ops.push((root) => root.find('/on').setValue(r() < 0.5));
    else if (kind === 1) ops.push((root) => root.find('/name').setValue(v));
    else if (kind === 2) ops.push((root) => root.find('/gated')?.setValue(v));
    else if (kind === 3) ops.push((root) => root.find('/list').push({ k: v, n }));
    else if (kind === 4) ops.push((root) => root.find('/list').remove(idx));
    else if (kind === 5)
      ops.push((root) => root.find(`/list/${idx}/k`)?.setValue(v));
    else ops.push((root) => root.setValue({ ...root.value, name: v, on: r() < 0.5 }));
  }
  return ops;
};

const collect = (root: any) => {
  const nodes: any[] = [];
  root.visitSubtree((node: any) => {
    nodes.push(node);
  });
  return nodes;
};

const BITS = Array.from({ length: 16 }, (_, i) => 1 << i);

const ledger = (root: any) => {
  const out: Record<string, number[]> = {};
  for (const node of collect(root)) out[node.path] = BITS.map((bit) => node.revision(bit));
  return out;
};

const runScenario = (seed: number, mode: 'cold' | 'observed' | 'listened') => {
  // Each mode replays the same seeded decisions.
  const r = rng(seed);
  const ops = genOps(r, 12);
  const { root } = build(schema, { on: true, name: 'x', list: [{ k: 'a' }] });
  for (const op of ops) {
    if (mode === 'observed') for (const node of collect(root)) node.revision();
    if (mode === 'listened')
      for (const node of collect(root)) node.subscribe(() => {});
    attempt(() => op(root));
  }
  return { ledger: ledger(root), value: JSON.stringify(root.value) };
};

describe('revision ledger does not depend on observation', () => {
  it('cold, observed and listened trees count the same bits (150 seeds)', () => {
    const mismatches: unknown[] = [];
    for (let seed = 1; seed <= 150; seed++) {
      const cold = runScenario(seed, 'cold');
      const observed = runScenario(seed, 'observed');
      const listened = runScenario(seed, 'listened');
      for (const [label, other] of [
        ['observed', observed],
        ['listened', listened],
      ] as const) {
        if (other.value !== cold.value) {
          mismatches.push({ seed, label, kind: 'value', cold: cold.value, other: other.value });
          continue;
        }
        for (const path of Object.keys(cold.ledger)) {
          const a = cold.ledger[path];
          const b = other.ledger[path];
          if (!b || a.some((x, i) => x !== b[i]))
            mismatches.push({ seed, label, path, cold: a, other: b });
        }
      }
    }
    diag('REV mismatches', { count: mismatches.length, first: mismatches.slice(0, 5) });
    expect(mismatches.length).toBe(0);
  });
});
