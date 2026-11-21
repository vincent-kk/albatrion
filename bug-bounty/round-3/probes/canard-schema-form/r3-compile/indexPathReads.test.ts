import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';

const tree = (jsonSchema: any, defaultValue?: any) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue } as any) as any;

const schema = (itemSchema: any) => ({
  type: 'object',
  properties: {
    items: { type: 'array', items: itemSchema },
    first: { type: 'string', controls: { derived: '(../items/0) ?? "none"' } },
    gate: { type: 'string', default: 'g', controls: { active: '../items/0 === "x"' } },
    gate2: { type: 'string', default: 'g', controls: { active: '../items/1 === "x" || false' } },
    w: { type: 'string', controls: { watch: ['../items/0', '../items/1'] } },
  },
});

/** Reference: evaluate the same expressions directly against the emitted items. */
const expected = (items: string[]) => {
  const out: any = {};
  if (items.length) out.items = items;
  out.first = items[0] ?? 'none';
  if (items[0] === 'x') out.gate = 'g';
  if (items[1] === 'x') out.gate2 = 'g';
  return { value: out, watch: [items[0], items[1]] };
};

const ops: [string, (root: any, model: string[]) => void][] = [
  ['insert0 x', (root, m) => { root.find('/items').insert(0, 'x'); m.splice(0, 0, 'x'); }],
  ['insert1 x', (root, m) => { if (m.length >= 1) { root.find('/items').insert(1, 'x'); m.splice(1, 0, 'x'); } }],
  ['push y', (root, m) => { root.find('/items').push('y'); m.push('y'); }],
  ['remove0', (root, m) => { if (m.length) { root.find('/items').remove(0); m.splice(0, 1); } }],
  ['remove1', (root, m) => { if (m.length > 1) { root.find('/items').remove(1); m.splice(1, 1); } }],
  ['set item0 x', (root, m) => { if (m.length) { root.find('/items/0').setValue('x'); m[0] = 'x'; } }],
  ['set item0 z', (root, m) => { if (m.length) { root.find('/items/0').setValue('z'); m[0] = 'z'; } }],
  ['swap via setValue', (root, m) => { const next = [...m].reverse(); root.find('/items').setValue(next); m.splice(0, m.length, ...next); }],
  ['pop', (root, m) => { if (m.length) { root.find('/items').pop(); m.pop(); } }],
];

describe('expressions that read array index paths follow item moves', () => {
  it('seeded random operation sequences', () => {
    let seed = 7;
    const random = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    const failures: any[] = [];
    for (let run = 0; run < 300 && failures.length < 3; run++) {
      const model: string[] = ['a', 'x'];
      const root = tree(schema({ type: 'string' }), { items: [...model] });
      const trail: string[] = [];
      for (let step = 0; step < 8; step++) {
        const [label, op] = ops[Math.floor(random() * ops.length)];
        trail.push(label);
        op(root, model);
        const actual = {
          value: root.value,
          watch: root.find('/w').watchValues,
        };
        const want = expected(model);
        if (JSON.stringify(actual) !== JSON.stringify(want)) {
          failures.push({ trail: [...trail], actual, want });
          break;
        }
      }
    }
    expect(failures).toEqual([]);
  });
});
