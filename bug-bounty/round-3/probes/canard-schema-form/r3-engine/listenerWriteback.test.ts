import { describe, expect, it } from 'vitest';

import { FieldNodeEventType } from '@/schema-form';

import { attempt, build, diag } from './probeHelpers';

/** Small seeded generator (mulberry32). */
const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const NAMES = ['a', 'b', 'c', 'd'] as const;
const schema = {
  type: 'object',
  properties: Object.fromEntries(NAMES.map((name) => [name, { type: 'string' }])),
} as const;
const VALUES = ['x', 'y', 'z', undefined] as const;

describe('LC2 listener write-back keeps the delivered value chain', () => {
  it('previous/current pairs chain across waves for 300 seeds', () => {
    const problems: unknown[] = [];
    for (let seed = 1; seed <= 300; seed++) {
      const r = rng(seed);
      const pick = <T,>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)];
      const { root } = build(schema, { a: 'x', b: 'x', c: 'x', d: 'x' });
      const logs = new Map<string, [unknown, unknown][]>();
      const before: Record<string, unknown> = {};
      for (const name of NAMES) before[name] = root.find(`/${name}`).value;
      let budget = 6;
      for (const name of NAMES) {
        const node = root.find(`/${name}`);
        const reactions = r() < 0.6;
        const target = pick(NAMES);
        const plan = Array.from({ length: 3 }, () => pick(VALUES));
        let step = 0;
        node.subscribe((event: any) => {
          if (event.type & FieldNodeEventType.UpdateValue) {
            const payload = event.payload?.[FieldNodeEventType.UpdateValue];
            const pair: [unknown, unknown] = [payload?.previous, payload?.current];
            logs.set(name, [...(logs.get(name) ?? []), pair]);
          }
          if (reactions && budget > 0 && step < plan.length) {
            budget--;
            root.find(`/${target}`).setValue(plan[step++]);
          }
        });
      }
      const first = pick(NAMES);
      const thrown = attempt(() => root.find(`/${first}`).setValue(pick(VALUES)));
      for (const name of NAMES) {
        const pairs = logs.get(name) ?? [];
        let expectedPrevious = before[name];
        for (const [previous, current] of pairs) {
          if (previous !== expectedPrevious || previous === current)
            problems.push({ seed, name, pairs, before: before[name] });
          expectedPrevious = current;
        }
        if (expectedPrevious !== root.find(`/${name}`).value)
          problems.push({ seed, name, pairs, final: root.find(`/${name}`).value, thrown: thrown && String(thrown) });
      }
    }
    diag('WB problems', { count: problems.length, first: problems.slice(0, 4) });
    expect(problems.length).toBe(0);
  });
});
