import { describe, expect, it } from 'vitest';

import { FieldNodeState, SetValueOption } from '@/schema-form';

import { attempt, build, diag } from './probeHelpers';

/** Seeded generator (mulberry32). */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const schema = {
  type: 'object',
  properties: {
    o: {
      type: 'object',
      properties: {
        a: {
          type: 'object',
          properties: { x: { type: 'number' }, y: { type: 'number' } },
        },
        b: { type: 'number' },
      },
    },
    s: { type: 'string' },
    list: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, n: { type: 'number' } },
      },
    },
    tags: { type: 'array', items: { type: 'string' } },
  },
} as const;

const initial = () => ({
  o: { a: { x: 1, y: 2 }, b: 1 },
  s: 's',
  list: [{ name: 'a' }, { name: 'b' }, { name: 'c' }],
  tags: ['t1', 't2'],
});

type Op = { label: string; run: (root: any) => void };

const pick = <T>(r: () => number, xs: readonly T[]) =>
  xs[Math.floor(r() * xs.length)];

/** Build one random operation; every argument is fixed at generation time. */
const makeOp = (r: () => number): Op => {
  const k = pick(r, [0, 1, 2, 4]);
  const word = pick(r, ['p', 'q', 'r', 'z']);
  const num = pick(r, [3, 7, 9]);
  const kind = pick(r, [
    's',
    'ox',
    'oMerge',
    'oOver',
    'rootMerge',
    'push',
    'pop',
    'insert',
    'remove',
    'update',
    'clear',
    'itemName',
    'resetO',
    'resetList',
    'resetItem',
    'err',
    'touch',
    'updaterO',
    'updaterList',
    'tagsPush',
    'tagsRemove',
    'tagsItem',
  ]);
  switch (kind) {
    case 's':
      return { label: `s=${word}`, run: (root) => root.find('/s').setValue(word) };
    case 'ox':
      return {
        label: `o.a.x=${num}`,
        run: (root) => root.find('/o/a/x').setValue(num),
      };
    case 'oMerge':
      return {
        label: `o merge {a:{x:${num}}}`,
        run: (root) =>
          root.find('/o').setValue({ a: { x: num } }, SetValueOption.Merge),
      };
    case 'oOver':
      return {
        label: `o overwrite {a:{y:${num}}}`,
        run: (root) => root.find('/o').setValue({ a: { y: num } }),
      };
    case 'rootMerge':
      return {
        label: `root merge {s:${word}}`,
        run: (root) => root.setValue({ s: word }, SetValueOption.Merge),
      };
    case 'push':
      return {
        label: `push ${word}`,
        run: (root) => root.find('/list').push({ name: word }),
      };
    case 'pop':
      return { label: 'pop', run: (root) => root.find('/list').pop() };
    case 'insert':
      return {
        label: `insert(${k},${word})`,
        run: (root) => root.find('/list').insert(k, { name: word }),
      };
    case 'remove':
      return {
        label: `remove(${k})`,
        run: (root) => root.find('/list').remove(k),
      };
    case 'update':
      return {
        label: `update(${k},${word})`,
        run: (root) => root.find('/list').update(k, { name: word }),
      };
    case 'clear':
      return { label: 'clear', run: (root) => root.find('/list').clear() };
    case 'itemName':
      return {
        label: `list/${k}/name=${word}`,
        run: (root) => root.find(`/list/${k}/name`)?.setValue(word),
      };
    case 'resetO':
      return { label: 'reset o', run: (root) => root.find('/o').resetSubtree() };
    case 'resetList':
      return {
        label: 'reset list',
        run: (root) => root.find('/list').resetSubtree(),
      };
    case 'resetItem':
      return {
        label: `reset list/${k}`,
        run: (root) => root.find(`/list/${k}`)?.resetSubtree(),
      };
    case 'err':
      return {
        label: `err list/${k}/name`,
        run: (root) =>
          root
            .find(`/list/${k}/name`)
            ?.setExternalErrors([
              { dataPath: `/list/${k}/name`, keyword: 'server', message: 'm' },
            ]),
      };
    case 'touch':
      return {
        label: `touch list/${k}/name`,
        run: (root) =>
          root
            .find(`/list/${k}/name`)
            ?.setState({ [FieldNodeState.Touched]: true }),
      };
    case 'updaterO':
      return {
        label: 'o updater b+1',
        run: (root) =>
          root
            .find('/o')
            .setValue((prev: any) => ({ ...prev, b: (prev?.b ?? 0) + 1 })),
      };
    case 'updaterList':
      return {
        label: `list updater append ${word}`,
        run: (root) =>
          root
            .find('/list')
            .setValue((prev: any) => [...(prev ?? []), { name: word }]),
      };
    case 'tagsPush':
      return {
        label: `tags push ${word}`,
        run: (root) => root.find('/tags').push(word),
      };
    case 'tagsRemove':
      return {
        label: `tags remove(${k})`,
        run: (root) => root.find('/tags').remove(k),
      };
    default:
      return {
        label: `tags/${k}=${word}`,
        run: (root) => root.find(`/tags/${k}`)?.setValue(word),
      };
  }
};

const snapshot = (root: any, labels: WeakMap<object, string>) => ({
  value: JSON.stringify(root.value),
  output: JSON.stringify(root.outputValue),
  items: (root.find('/list')?.children ?? []).map((item: any) => {
    const name = item.find('./name');
    return {
      id: labels.get(item) ?? 'new',
      name: item.value?.name,
      errors: (name?.errors ?? []).map((e: any) => e.keyword),
      touched: !!name?.isTouched,
    };
  }),
  tags: (root.find('/tags')?.children ?? []).map(
    (item: any) => labels.get(item) ?? 'new',
  ),
});

type Mode = 'sequential' | 'batch' | 'visit';

export const runMode = (ops: Op[], mode: Mode) => {
  const { root, changes } = build(schema, initial());
  const labels = new WeakMap<object, string>();
  for (const item of root.find('/list').children)
    labels.set(item, `item:${item.value.name}`);
  for (const item of root.find('/tags').children)
    labels.set(item, `tag:${item.value}`);
  changes.length = 0;
  const errors: string[] = [];
  const all = () => {
    for (const op of ops) {
      const thrown = attempt(() => op.run(root));
      if (thrown) errors.push(`${op.label}: ${String(thrown)}`);
    }
  };
  if (mode === 'sequential') all();
  else if (mode === 'batch') {
    const thrown = attempt(() => root.batch(all));
    if (thrown) errors.push(`batch: ${String(thrown)}`);
  } else {
    const thrown = attempt(() =>
      root.visitSubtree((node: any) => {
        if (node === root) all();
        return false;
      }),
    );
    if (thrown) errors.push(`visit: ${String(thrown)}`);
  }
  const snap = snapshot(root, labels);
  const lastChange = changes.length
    ? JSON.stringify(changes[changes.length - 1])
    : undefined;
  return {
    ...snap,
    errors,
    onChangeMatchesOutput:
      lastChange === undefined ? 'none' : lastChange === snap.output,
  };
};

describe('EQ10 batch and visitSubtree against sequential calls (seeded)', () => {
  it('300 random sequences give the same values, identities, errors and touched flags', () => {
    const diffs: unknown[] = [];
    for (let seed = 1; seed <= 300; seed++) {
      const r = rng(seed);
      const length = 2 + Math.floor(r() * 4);
      const ops = Array.from({ length }, () => makeOp(r));
      const sequential = runMode(ops, 'sequential');
      const batch = runMode(ops, 'batch');
      const visit = runMode(ops, 'visit');
      const strip = (x: any) => ({ ...x, errors: x.errors.length, onChangeMatchesOutput: x.onChangeMatchesOutput === false ? 'MISMATCH' : 'ok' });
      const a = JSON.stringify(strip(sequential));
      const b = JSON.stringify(strip(batch));
      const c = JSON.stringify(strip(visit));
      if (a !== b || a !== c)
        diffs.push({
          seed,
          ops: ops.map((op) => op.label),
          sequential,
          batch: a === b ? 'same' : batch,
          visit: a === c ? 'same' : visit,
        });
    }
    diag('batchDifferential', { count: diffs.length });
    for (const d of diffs.slice(0, 60)) diag('diff', d);
    expect(diffs.length).toBe(0);
  });
});
