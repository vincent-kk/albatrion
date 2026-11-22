import { describe, expect, it } from 'vitest';

import { FieldNodeState, SetValueOption } from '@/schema-form';

import { comparable, type Op, pick, rng, runMode } from './differentialKit';
import { diag } from './probeHelpers';

const schema = {
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['A', 'B'], default: 'A' },
    groups: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: { v: { type: 'number' } },
            },
          },
          size: {
            type: 'number',
            controls: { derived: '(../rows)?.length ?? 0' },
          },
        },
      },
    },
    count: {
      type: 'number',
      controls: { derived: '(../groups)?.length ?? 0' },
    },
  },
  controls: { discriminator: 'kind' },
  oneOf: [
    {
      properties: {
        kind: { const: 'A' },
        fa: { type: 'string' },
      },
    },
    {
      properties: {
        kind: { const: 'B' },
        fb: { type: 'string' },
      },
    },
  ],
} as const;

const initial = () => ({
  kind: 'A',
  fa: 'kept-a',
  groups: [
    { title: 'g0', rows: [{ v: 1 }, { v: 2 }] },
    { title: 'g1', rows: [{ v: 3 }] },
    { title: 'g2', rows: [] },
  ],
});

const heldPaths = [
  '/groups/0',
  '/groups/1',
  '/groups/2',
  '/groups/0/rows/0',
  '/groups/0/rows/1',
  '/groups/1/rows/0',
  '/groups/0/title',
  '/groups/1/title',
  '/groups/0/rows/1/v',
] as const;

const makeOp = (r: () => number): Op => {
  const g = pick(r, [0, 1, 2]);
  const j = pick(r, [0, 1, 3]);
  const word = pick(r, ['p', 'q', 'z']);
  const num = pick(r, [5, 8]);
  const h = pick(r, heldPaths);
  const kind = pick(r, [
    'gPush',
    'gRemove',
    'gInsert',
    'gPop',
    'gUpdate',
    'rPush',
    'rRemove',
    'rInsert',
    'rClear',
    'title',
    'v',
    'heldWrite',
    'heldReset',
    'heldErr',
    'heldTouch',
    'kind',
    'fa',
    'fb',
    'rootMerge',
    'groupMerge',
    'relocate',
  ]);
  switch (kind) {
    case 'gPush':
      return {
        label: `groups.push(${word})`,
        run: (root) => root.find('/groups').push({ title: word, rows: [{ v: num }] }),
      };
    case 'gRemove':
      return { label: `groups.remove(${g})`, run: (root) => root.find('/groups').remove(g) };
    case 'gInsert':
      return {
        label: `groups.insert(${g},${word})`,
        run: (root) => root.find('/groups').insert(g, { title: word }),
      };
    case 'gPop':
      return { label: 'groups.pop', run: (root) => root.find('/groups').pop() };
    case 'gUpdate':
      return {
        label: `groups.update(${g},${word})`,
        run: (root) => root.find('/groups').update(g, { title: word, rows: [] }),
      };
    case 'rPush':
      return {
        label: `groups/${g}/rows.push(${num})`,
        run: (root) => root.find(`/groups/${g}/rows`)?.push({ v: num }),
      };
    case 'rRemove':
      return {
        label: `groups/${g}/rows.remove(${j})`,
        run: (root) => root.find(`/groups/${g}/rows`)?.remove(j),
      };
    case 'rInsert':
      return {
        label: `groups/${g}/rows.insert(${j},${num})`,
        run: (root) => root.find(`/groups/${g}/rows`)?.insert(j, { v: num }),
      };
    case 'rClear':
      return {
        label: `groups/${g}/rows.clear`,
        run: (root) => root.find(`/groups/${g}/rows`)?.clear(),
      };
    case 'title':
      return {
        label: `groups/${g}/title=${word}`,
        run: (root) => root.find(`/groups/${g}/title`)?.setValue(word),
      };
    case 'v':
      return {
        label: `groups/${g}/rows/${j}/v=${num}`,
        run: (root) => root.find(`/groups/${g}/rows/${j}/v`)?.setValue(num),
      };
    case 'heldWrite':
      return {
        label: `held ${h} write`,
        run: (_root, held) => {
          const node = held[h];
          if (!node) return;
          if (node.type === 'string') node.setValue(word);
          else if (node.type === 'number') node.setValue(num);
          else if (h.includes('rows')) node.setValue({ v: num });
          else node.setValue({ title: word }, SetValueOption.Merge);
        },
      };
    case 'heldReset':
      return {
        label: `held ${h} resetSubtree`,
        run: (_root, held) => held[h]?.resetSubtree(),
      };
    case 'heldErr':
      return {
        label: `held ${h} external error`,
        run: (_root, held) =>
          held[h]?.setExternalErrors([
            { dataPath: held[h].path, keyword: `srv${word}`, message: 'm' },
          ]),
      };
    case 'heldTouch':
      return {
        label: `held ${h} touched`,
        run: (_root, held) =>
          held[h]?.setState({ [FieldNodeState.Touched]: true }),
      };
    case 'kind':
      return {
        label: `kind=${word === 'p' ? 'B' : 'A'}`,
        run: (root) => root.find('/kind').setValue(word === 'p' ? 'B' : 'A'),
      };
    case 'fa':
      return { label: `fa=${word}`, run: (root) => root.find('/fa')?.setValue(word) };
    case 'fb':
      return { label: `fb=${word}`, run: (root) => root.find('/fb')?.setValue(word) };
    case 'rootMerge':
      return {
        label: `root merge {fa:${word}}`,
        run: (root) => root.setValue({ fa: word }, SetValueOption.Merge),
      };
    case 'groupMerge':
      return {
        label: `groups/${g} merge {title:${word}}`,
        run: (root) =>
          root.find(`/groups/${g}`)?.setValue({ title: word }, SetValueOption.Merge),
      };
    default:
      return {
        label: `groups relocate ${g}->0`,
        run: (root) => {
          const list = root.find('/groups');
          const moved = list.remove(g);
          if (moved !== undefined) list.insert(0, moved);
        },
      };
  }
};

describe('EQ10 nested arrays, held references, branches and derived values (seeded)', () => {
  it('batch, nested batch and visitSubtree equal sequential calls over 400 sequences', () => {
    const diffs: unknown[] = [];
    for (let seed = 1; seed <= 400; seed++) {
      const r = rng(seed * 7919);
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
    const modeDiffs = diffs.filter((d: any) => d.batch || d.nested || d.visit);
    diag('nestedDifferential', { count: diffs.length, modeDiffs: modeDiffs.length });
    for (const d of [...modeDiffs, ...diffs.filter((d: any) => !(d.batch || d.nested || d.visit))].slice(0, 60)) diag('nestedDiff', d);
    expect(diffs.length).toBe(0);
  });
});
