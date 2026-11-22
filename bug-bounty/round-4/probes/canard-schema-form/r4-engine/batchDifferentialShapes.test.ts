import { describe, expect, it } from 'vitest';

import { SetValueOption } from '@/schema-form';

import { comparable, type Op, pick, rng, runMode } from './differentialKit';
import { diag } from './probeHelpers';

/** Virtual group, nullable object, terminal array and an item array; no automatic rules. */
const schema = {
  type: 'object',
  properties: {
    start: { type: 'string' },
    end: { type: 'string' },
    meta: {
      type: ['object', 'null'],
      properties: {
        k: { type: 'string' },
        sub: { type: 'object', properties: { z: { type: 'number' } } },
      },
    },
    tags: { type: 'array', items: { type: 'string' }, options: { terminal: true } },
    rows: {
      type: 'array',
      items: {
        type: 'object',
        properties: { a: { type: 'string' }, b: { type: 'string' } },
      },
    },
  },
  options: { virtual: { period: { fields: ['start', 'end'] } } },
} as const;

const initial = () => ({
  start: 's0',
  end: 'e0',
  meta: { k: 'k0', sub: { z: 1 } },
  tags: ['t0'],
  rows: [{ a: 'a0', b: 'b0' }, { a: 'a1', b: 'b1' }],
});

const heldPaths = ['/rows/0', '/rows/1', '/rows/1/a', '/meta/sub', '/meta/k', '/period'];

const makeOp = (r: () => number): Op => {
  const k = pick(r, [0, 1, 3]);
  const w = pick(r, ['p', 'q']);
  const n = pick(r, [4, 6]);
  const h = pick(r, heldPaths);
  const kind = pick(r, [
    'period',
    'periodUpdater',
    'start',
    'metaNull',
    'metaObj',
    'metaMerge',
    'metaK',
    'metaSubZ',
    'tags',
    'tagsUpdater',
    'rowsPushEmpty',
    'rowsInsertEmpty',
    'rowsRemove',
    'rowsPop',
    'rowsUpdate',
    'rowMerge',
    'rowA',
    'rootMerge',
    'rootMergeNull',
    'heldWrite',
    'heldReset',
    'rowsClear',
    'metaUpdater',
  ]);
  switch (kind) {
    case 'period':
      return { label: `period=[${w},${n}]`, run: (root) => root.find('/period').setValue([w, `${n}`]) };
    case 'periodUpdater':
      return {
        label: 'period updater swap',
        run: (root) => root.find('/period').setValue((prev: any) => [prev?.[1], prev?.[0]]),
      };
    case 'start':
      return { label: `start=${w}`, run: (root) => root.find('/start').setValue(w) };
    case 'metaNull':
      return { label: 'meta=null', run: (root) => root.find('/meta').setValue(null) };
    case 'metaObj':
      return { label: `meta={k:${w}}`, run: (root) => root.find('/meta').setValue({ k: w }) };
    case 'metaMerge':
      return {
        label: `meta merge {sub:{z:${n}}}`,
        run: (root) => root.find('/meta').setValue({ sub: { z: n } }, SetValueOption.Merge),
      };
    case 'metaK':
      return { label: `meta/k=${w}`, run: (root) => root.find('/meta/k')?.setValue(w) };
    case 'metaSubZ':
      return { label: `meta/sub/z=${n}`, run: (root) => root.find('/meta/sub/z')?.setValue(n) };
    case 'tags':
      return { label: `tags=[${w}]`, run: (root) => root.find('/tags').setValue([w, w]) };
    case 'tagsUpdater':
      return {
        label: `tags updater append ${w}`,
        run: (root) => root.find('/tags').setValue((prev: any) => [...(prev ?? []), w]),
      };
    case 'rowsPushEmpty':
      return { label: 'rows.push()', run: (root) => root.find('/rows').push() };
    case 'rowsInsertEmpty':
      return { label: `rows.insert(${k})`, run: (root) => root.find('/rows').insert(k) };
    case 'rowsRemove':
      return { label: `rows.remove(${k})`, run: (root) => root.find('/rows').remove(k) };
    case 'rowsPop':
      return { label: 'rows.pop', run: (root) => root.find('/rows').pop() };
    case 'rowsUpdate':
      return {
        label: `rows.update(${k},{b:${w}})`,
        run: (root) => root.find('/rows').update(k, { b: w }),
      };
    case 'rowMerge':
      return {
        label: `rows/${k} merge {a:${w}}`,
        run: (root) => root.find(`/rows/${k}`)?.setValue({ a: w }, SetValueOption.Merge),
      };
    case 'rowA':
      return { label: `rows/${k}/a=${w}`, run: (root) => root.find(`/rows/${k}/a`)?.setValue(w) };
    case 'rootMerge':
      return {
        label: `root merge {meta:{k:${w}},end:${n}}`,
        run: (root) => root.setValue({ meta: { k: w }, end: `${n}` }, SetValueOption.Merge),
      };
    case 'rootMergeNull':
      return {
        label: 'root merge {meta:null}',
        run: (root) => root.setValue({ meta: null }, SetValueOption.Merge),
      };
    case 'heldWrite':
      return {
        label: `held ${h} write`,
        run: (_root, held) => {
          const node = held[h];
          if (!node) return;
          if (h === '/period') return node.setValue([w, w]);
          if (h === '/meta/sub') return node.setValue({ z: n });
          if (h === '/meta/k' || h === '/rows/1/a') return node.setValue(w);
          return node.setValue({ a: w });
        },
      };
    case 'heldReset':
      return { label: `held ${h} resetSubtree`, run: (_root, held) => held[h]?.resetSubtree() };
    case 'rowsClear':
      return { label: 'rows.clear', run: (root) => root.find('/rows').clear() };
    default:
      return {
        label: 'meta updater k+',
        run: (root) =>
          root.find('/meta').setValue((prev: any) => (prev ? { ...prev, k: `${prev.k}+` } : { k: '+' })),
      };
  }
};

describe('EQ10 virtual, nullable, terminal and item arrays: batch against sequential (seeded)', () => {
  it('500 sequences agree on values, returns, identity and delivery', () => {
    const diffs: any[] = [];
    for (let seed = 1; seed <= 500; seed++) {
      const r = rng(seed * 104729);
      const length = 2 + Math.floor(r() * 4);
      const ops = Array.from({ length }, () => makeOp(r));
      const sequential = runMode(schema, initial, ops, 'sequential', heldPaths);
      const seqKey = comparable(sequential);
      const out: Record<string, unknown> = {};
      for (const mode of ['batch', 'nested', 'visit'] as const) {
        const result = runMode(schema, initial, ops, mode, heldPaths);
        if (comparable(result) !== seqKey) out[mode] = result;
      }
      const selfIssues =
        sequential.missedValueEvent.length +
        sequential.stalePayload.length +
        sequential.missedErrorEvent.length +
        (sequential.onChange === 'MISMATCH' ? 1 : 0);
      if (Object.keys(out).length || selfIssues)
        diffs.push({ seed, ops: ops.map((op) => op.label), sequential, ...out });
    }
    const modeDiffs = diffs.filter((d) => d.batch || d.nested || d.visit);
    diag('shapesDifferential', { count: diffs.length, modeDiffs: modeDiffs.length });
    for (const d of [...modeDiffs, ...diffs.filter((d) => !(d.batch || d.nested || d.visit))].slice(0, 80))
      diag('shapesDiff', d);
    expect(diffs.length).toBe(0);
  });
});
