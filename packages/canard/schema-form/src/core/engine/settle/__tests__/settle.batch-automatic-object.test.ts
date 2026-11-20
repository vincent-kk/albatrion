import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../../types/jsonSchema';
import { ValidationMode } from '../../types/state';

const inject = (target: string) => (value: unknown) =>
  typeof value === 'string' ? { [target]: JSON.parse(value) } : {};

const schema = {
  type: 'object',
  properties: {
    yOn: { type: 'boolean' },
    other: { type: 'boolean' },
    object: {
      type: 'object',
      properties: {
        x: { type: 'string' },
        y: { type: 'string', controls: { active: '/yOn === true' } },
        nested: { type: 'object', properties: { p: { type: 'string' } } },
      },
    },
    source: {
      type: 'string',
      controls: { injectTo: inject('../object') },
    },
    nestedSource: {
      type: 'string',
      controls: { injectTo: inject('../object/nested') },
    },
  },
} as const satisfies AuthoredSchema;

type Root = ReturnType<typeof nodeFromJSONSchema>;

/** Run the same calls in sequence or in one batch, then report the stored and retained state. */
const observe = (
  yOn: boolean,
  calls: readonly ((root: Root) => void)[],
  batched: boolean,
) => {
  const root = nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: { yOn, object: { x: 'x0', y: 'y0', nested: { p: 'p0' } } },
    validationMode: ValidationMode.None,
  });
  const write = () => {
    for (const call of calls) call(root);
  };
  if (batched) root.batch(write);
  else write();
  return {
    value: root.value,
    retained: root.inactiveValues.map(({ path, value }) => ({ path, value })),
  };
};

const set =
  (path: string, value: unknown) =>
  (root: Root): void =>
    root.find(path)!.setValue(value);

it.each([
  ['omits a live descendant', true, [{ x: 'o' }]],
  ['names an inactive descendant', false, [{ x: 'o', y: 'p' }]],
  ['writes a nested object', true, [{ nested: { p: 'n' } }]],
])(
  'a declarative object write that %s applies the same in a batch and in sequence',
  (_, yOn, [written]) => {
    const calls = [
      set('/other', true),
      set('/source', JSON.stringify(written)),
    ];
    expect(observe(yOn, calls, true)).toEqual(observe(yOn, calls, false));
  },
);

it('a caller write before a declarative write to the same object equals the sequence', () => {
  const calls = [
    set('/object', { x: 'caller', nested: { p: 'caller' } }),
    set('/source', JSON.stringify({ x: 'o' })),
  ];
  expect(observe(true, calls, true)).toEqual(observe(true, calls, false));
});

it('overlapping declarative writes apply in rank order in a batch and in sequence', () => {
  const calls = [
    set('/source', JSON.stringify({ x: 'o' })),
    set('/nestedSource', JSON.stringify({ p: 'n' })),
  ];
  expect(observe(true, calls, true)).toEqual(observe(true, calls, false));
});

it('a declarative write to a node leaving in the same settlement is retained as written after the exit', () => {
  const calls = [
    set('/yOn', false),
    set('/source', JSON.stringify({ x: 'o', y: 'p' })),
  ];
  expect(observe(true, calls, true)).toEqual(observe(true, calls, false));
});
