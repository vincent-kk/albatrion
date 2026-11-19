import { describe, expect, it } from 'vitest';

import { FieldNodeState, ValidationMode } from '@/schema-form';

import { build, diag } from './probeHelpers';

/** Size of every collection-valued field of an object, keyed by field name. */
const sizes = (target: any, prefix = '') => {
  const out: Record<string, number> = {};
  if (!target || typeof target !== 'object') return out;
  for (const key of Object.keys(target)) {
    const value = target[key];
    if (value instanceof Map || value instanceof Set) out[prefix + key] = value.size;
    else if (Array.isArray(value)) out[prefix + key] = value.length;
  }
  return out;
};

/** Fields whose size keeps growing between the two measurements. */
const growth = (a: Record<string, number>, b: Record<string, number>) =>
  Object.fromEntries(
    Object.entries(b)
      .filter(([k, v]) => v > (a[k] ?? 0) && v > 4)
      .map(([k, v]) => [k, `${a[k] ?? 0} -> ${v}`]),
  );

const schema = {
  type: 'object',
  properties: {
    gate: { type: 'boolean', default: true },
    kind: { type: 'string', enum: ['A', 'B'], default: 'A' },
    list: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          twice: { type: 'string', controls: { derived: '../name' } },
        },
      },
    },
    extra: { type: 'string', controls: { active: '../gate === true' } },
  },
  controls: { discriminator: 'kind' },
  oneOf: [
    { properties: { kind: { const: 'A' }, fa: { type: 'string' } } },
    { properties: { kind: { const: 'B' }, fb: { type: 'string' } } },
  ],
} as const;

const measure = (cycle: (root: any, i: number) => void, rounds: number, extra: any = {}) => {
  const { root } = build(schema, { gate: true, kind: 'A', list: [{ name: 'a' }] }, extra);
  const run = (n: number, from: number) => {
    for (let i = from; i < from + n; i++) cycle(root, i);
  };
  run(rounds, 0);
  const first = { ...sizes(root.runtime), ...sizes(root, 'root.') };
  run(rounds * 9, rounds);
  const second = { ...sizes(root.runtime), ...sizes(root, 'root.') };
  return growth(first, second);
};

const cycles: Record<string, (root: any, i: number) => void> = {
  'push then pop': (root, i) => {
    root.find('/list').push({ name: `n${i}` });
    root.find('/list').pop();
  },
  'insert(0) then remove(0)': (root, i) => {
    root.find('/list').insert(0, { name: `n${i}` });
    root.find('/list').remove(0);
  },
  'push with an external error and touched state, then pop': (root, i) => {
    const list = root.find('/list');
    list.push({ name: `n${i}` });
    const name = list.children[list.children.length - 1].find('./name');
    name.setExternalErrors([{ dataPath: name.path, keyword: 'server', message: 'm' }]);
    name.setState({ [FieldNodeState.Touched]: true });
    list.pop();
  },
  'push, subscribe, cleanup, pop': (root, i) => {
    const list = root.find('/list');
    list.push({ name: `n${i}` });
    const item = list.children[list.children.length - 1];
    const off = item.subscribe(() => {});
    off();
    list.pop();
  },
  'gate off and on': (root) => {
    root.find('/gate').setValue(false);
    root.find('/gate').setValue(true);
  },
  'branch A to B and back': (root) => {
    root.find('/kind').setValue('B');
    root.find('/kind').setValue('A');
  },
  'whole array write of alternating length': (root, i) => {
    root.find('/list').setValue(i % 2 ? [{ name: 'a' }] : [{ name: 'a' }, { name: `n${i}` }]);
  },
  'resetSubtree of a pushed item, then pop': (root, i) => {
    const list = root.find('/list');
    list.push({ name: `n${i}` });
    list.children[list.children.length - 1].resetSubtree();
    list.pop();
  },
  'batch of push and pop': (root, i) => {
    const list = root.find('/list');
    root.batch(() => {
      list.push({ name: `n${i}` });
      list.pop();
    });
  },
};

describe('LC4 per-runtime collections stay bounded while the shape stays constant', () => {
  for (const [name, cycle] of Object.entries(cycles)) {
    it(`${name}`, () => {
      const grown = measure(cycle, 20);
      diag(`growth ${name}`, grown);
      expect(grown).toEqual({});
    });
  }

  it('OnChange mode: push and pop with an issue-producing validator', () => {
    const validator = {
      compile: () => (value: any) =>
        (value?.list ?? []).flatMap((item: any, index: number) =>
          item?.name?.startsWith('n')
            ? [{ dataPath: `/list/${index}/name`, keyword: 'pattern', message: 'x' }]
            : [],
        ),
      compileGuard: () => () => true,
    };
    const grown = measure(
      (root, i) => {
        root.find('/list').push({ name: `n${i}` });
        root.validate();
        root.find('/list').pop();
      },
      20,
      { validator, validationMode: ValidationMode.OnChange },
    );
    diag('growth validation', grown);
    expect(grown).toEqual({});
  });
});
