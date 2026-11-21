import { describe, expect, it } from 'vitest';

import { applyPatch } from '@/json';

/** Mulberry32 seeded generator. */
const random = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const keys = ['a', 'b', 'c', '', '~x', 'a/b'];
const value = (next: () => number, depth: number): unknown => {
  const roll = next();
  if (depth > 2 || roll < 0.35) return [1, 'x', null, true, 0][Math.floor(next() * 5)];
  if (roll < 0.65) return Array.from({ length: Math.floor(next() * 3) }, () => value(next, depth + 1));
  const object: Record<string, unknown> = {};
  for (const key of keys) if (next() < 0.4) object[key] = value(next, depth + 1);
  return object;
};

/** Collects every pointer of a document so operations target existing and missing places. */
const pointers = (document: unknown): string[] => {
  const result: string[] = [''];
  const walk = (node: unknown, prefix: string) => {
    if (node === null || typeof node !== 'object') return;
    for (const key of Object.keys(node)) {
      const pointer = `${prefix}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`;
      result.push(pointer);
      walk((node as Record<string, unknown>)[key], pointer);
    }
  };
  walk(document, '');
  return result;
};

const operation = (next: () => number, document: unknown) => {
  const places = pointers(document);
  const pick = () => places[Math.floor(next() * places.length)];
  const target = () => (next() < 0.7 ? pick() : `${pick()}/${next() < 0.5 ? '-' : 'n'}`);
  const ops = ['add', 'remove', 'replace', 'move', 'copy', 'test'] as const;
  const op = ops[Math.floor(next() * ops.length)];
  if (op === 'move' || op === 'copy') return { op, from: pick(), path: target() };
  if (op === 'remove') return { op, path: pick() };
  return { op, path: op === 'add' ? target() : pick(), value: value(next, 1) } as any;
};

const run = (source: unknown, patches: any[], immutable: boolean) => {
  try {
    return { value: JSON.stringify(applyPatch(source as any, patches, { immutable })) };
  } catch (error) {
    return { error: (error as { code?: string }).code ?? String(error) };
  }
};

describe('applyPatch immutable against mutable on the same patches (EQ11)', () => {
  it('agree on 4,000 seeded documents and patch lists', () => {
    const differences: unknown[] = [];
    for (let seed = 1; seed <= 4000 && differences.length < 5; seed++) {
      const next = random(seed);
      const document = { root: value(next, 0) };
      const patches: any[] = [];
      let current: unknown = structuredClone(document);
      for (let index = 0, count = 1 + Math.floor(next() * 4); index < count; index++) {
        const patch = operation(next, current);
        patches.push(patch);
        try { current = applyPatch(current as any, [patch]); } catch { /* keep generating */ }
      }
      const immutable = run(structuredClone(document), structuredClone(patches), true);
      const mutable = run(structuredClone(document), structuredClone(patches), false);
      if (JSON.stringify(immutable) !== JSON.stringify(mutable)) differences.push({ seed, patches, immutable, mutable });
      // EQ10: the same list applied one operation at a time in mutable mode
      let stepwise: { value?: string; error?: string } = { value: undefined };
      let state: any = structuredClone(document);
      for (const patch of structuredClone(patches)) {
        const step = run(state, [patch], false);
        if (step.error !== undefined) { stepwise = step; break; }
        state = JSON.parse(step.value!);
        stepwise = step;
      }
      if (JSON.stringify(stepwise) !== JSON.stringify(mutable)) differences.push({ seed, patches, stepwise, mutable });
    }
    expect(differences).toEqual([]);
  });
});
