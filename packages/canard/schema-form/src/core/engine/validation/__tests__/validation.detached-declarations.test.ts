import { expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

// 446C-07 (나): Only active branch issues are displayed on nodes; globalErrors retains the full verdict.
it('shows only active oneOf branch issues after switching A to B and back to A', async () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    controls: { discriminator: 'kind' },
    properties: { kind: { type: 'string' } },
    oneOf: [
      {
        properties: {
          kind: { const: 'A' },
          a: { type: 'string', minLength: 3 },
        },
        required: ['a'],
      },
      {
        properties: {
          kind: { const: 'B' },
          b: { type: 'string', minLength: 5 },
        },
        required: ['b'],
      },
    ],
  });
  root.setValue({ kind: 'A', a: 'a' });
  const kind = root.find('/kind')!;
  const firstA = root.find('/a')!;
  expect(firstA.value).toBe('a');
  expect(root.find('/b')).toBeNull();
  await root.validate();
  expect(firstA.errors.map((issue) => issue.schemaPath)).toEqual([
    '#/oneOf/0/properties/a/minLength',
  ]);
  expect(kind.errors).toEqual([]);

  kind.setValue('B');
  const firstB = root.find('/b')!;
  expect(firstB).not.toBeNull();
  expect(root.find('/a')).toBeNull();
  firstB.setValue('b');
  await root.validate();
  expect(firstB.errors.map((issue) => issue.schemaPath)).toEqual([
    '#/oneOf/1/properties/b/minLength',
  ]);
  expect(kind.errors).toEqual([]);
  expect(root.errors.map((issue) => issue.schemaPath)).toEqual(['#/oneOf']);

  kind.setValue('A');
  const currentA = root.find('/a')!;
  expect(currentA).not.toBe(firstA);
  expect(currentA.value).toBe('a');
  expect(root.find('/b')).toBeNull();
  await root.validate();
  expect(root.globalErrors.map((issue) => issue.schemaPath)).toEqual([
    '#/oneOf/0/properties/a/minLength',
    '#/oneOf/1/required',
    '#/oneOf/1/properties/kind/const',
    '#/oneOf',
  ]);
  expect({
    activeA: currentA.errors.map((issue) => issue.schemaPath),
    kind: kind.errors.map((issue) => issue.schemaPath),
    host: root.errors.map((issue) => issue.schemaPath),
  }).toEqual({
    activeA: ['#/oneOf/0/properties/a/minLength'],
    kind: [],
    host: ['#/oneOf'],
  });
});
