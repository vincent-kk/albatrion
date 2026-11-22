import { describe, expect, it } from 'vitest';

import { attempt, build } from './probeHelpers';

/**
 * EQ10 and RG1 on f3a6cfdae (round 4 items 2, 3 and 14): seeded sequences of virtual group
 * writes and resets, field writes and resets, item writes and array verbs, run one by one and
 * inside one batch. Gate sources are fixed at load so that deferred scalar marks (documented)
 * cannot change which nodes a call finds.
 */
const schema = {
  type: 'object',
  properties: {
    on: { type: 'boolean' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          start: { type: 'string' },
          end: { type: 'string', controls: { active: '../../../on === true' } },
          note: { type: 'string' },
        },
        options: { virtual: { period: { fields: ['start', 'end'] } } },
      },
    },
  },
} as const;

const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type Op = { label: string; run: (root: any) => void };

const makeOps = (seed: number, on: boolean): Op[] => {
  const random = mulberry32(seed);
  const pick = <T,>(list: readonly T[]) => list[Math.floor(random() * list.length)];
  const word = () => pick(['a', 'b', 'c', 'd']) + Math.floor(random() * 10);
  const ops: Op[] = [];
  const count = 2 + Math.floor(random() * 5);
  for (let index = 0; index < count; index++) {
    const item = Math.floor(random() * 3);
    const kind = pick([
      'fieldWrite',
      'groupWrite',
      'groupReset',
      'fieldReset',
      'itemWrite',
      'itemReset',
      'insert',
      'remove',
      'push',
    ] as const);
    const value = word();
    const second = word();
    const field = pick(['start', 'end', 'note'] as const);
    const base = `/items/${item}`;
    ops.push({
      label: `${kind} ${base} ${field} ${value} ${second}`,
      run: (root) => {
        const node = (path: string) => root.find(path);
        if (kind === 'fieldWrite') node(`${base}/${field}`)?.setValue(value);
        else if (kind === 'groupWrite')
          node(`${base}/period`)?.setValue([value, on ? second : undefined]);
        else if (kind === 'groupReset') node(`${base}/period`)?.resetSubtree();
        else if (kind === 'fieldReset') node(`${base}/${field}`)?.resetSubtree();
        else if (kind === 'itemWrite')
          node(base)?.setValue({ start: value, note: second });
        else if (kind === 'itemReset') node(base)?.resetSubtree();
        else if (kind === 'insert')
          node('/items')?.insert(Math.min(item, node('/items').value?.length ?? 0), {
            start: value,
            end: second,
          });
        else if (kind === 'remove') {
          const length = node('/items')?.value?.length ?? 0;
          if (item < length) node('/items')?.remove(item);
        } else node('/items')?.push({ start: value });
      },
    });
  }
  return ops;
};

const load = (on: boolean) => ({
  on,
  items: [
    { start: 's0', end: 'e0', note: 'n0' },
    { start: 's1', end: 'e1', note: 'n1' },
  ],
});

const runSequence = (ops: Op[], on: boolean, batched: boolean) => {
  const { root } = build(schema, load(on));
  const thrown = attempt(() => {
    if (batched) root.batch(() => ops.forEach((op) => op.run(root)));
    else ops.forEach((op) => op.run(root));
  });
  return { value: root.value, thrown };
};

describe('virtual groups in array items: batch against one by one', () => {
  it('600 seeded sequences give the same value', () => {
    const differences: unknown[] = [];
    for (let seed = 1; seed <= 300; seed++)
      for (const on of [true, false]) {
        const ops = makeOps(seed, on);
        const sequential = runSequence(ops, on, false);
        const batched = runSequence(ops, on, true);
        if (JSON.stringify(sequential) !== JSON.stringify(batched))
          differences.push({
            seed,
            on,
            ops: ops.map((op) => op.label),
            sequential,
            batched,
          });
      }
    expect(differences.slice(0, 3)).toEqual([]);
  });
});
