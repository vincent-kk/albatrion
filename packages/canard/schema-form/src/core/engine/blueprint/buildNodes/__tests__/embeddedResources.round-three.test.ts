import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

const inner = { type: 'string', default: 'inner' } as const;
const inline = { type: 'object', properties: { value: inner } } as const;
const resource = {
  $id: 'nested.json',
  $defs: { X: inner },
  type: 'object',
  properties: { value: { $ref: '#/$defs/X' } },
} as const;

it.each([true, false])(
  'round-3: an embedded resource fragment equals its inline schema with root collision %s',
  (collision) => {
    const definitions: Record<
      string,
      typeof resource | { type: 'number'; default: number }
    > = { Resource: resource };
    if (collision) definitions.X = { type: 'number', default: 1 };
    const root = {
      $id: 'https://example.test/root.json',
      $defs: definitions,
      type: 'object',
      properties: { entry: { $ref: '#/$defs/Resource' } },
    } as const;
    const actual = nodeFromJSONSchema({ jsonSchema: root });
    const expected = nodeFromJSONSchema({
      jsonSchema: { type: 'object', properties: { entry: inline } },
    });
    expect(actual.value).toEqual(expected.value);
    expect(actual.find('/entry/value')?.type).toBe(
      expected.find('/entry/value')?.type,
    );
  },
);
it('round-3: relative identifiers and forward resource references use the resource base', () => {
  const actual = nodeFromJSONSchema({
    jsonSchema: {
      $id: 'https://example.test/base/root.json',
      type: 'object',
      properties: { entry: { $ref: 'nested/child.json' } },
      $defs: {
        Parent: {
          $id: 'nested/parent.json',
          $defs: { Child: { $id: 'child.json', ...inline } },
        },
      },
    },
  });
  expect(actual.value).toEqual(
    nodeFromJSONSchema({
      jsonSchema: { type: 'object', properties: { entry: inline } },
    }).value,
  );
});
it('round-3: the same fragment in two embedded resources keeps distinct targets', () => {
  const actual = nodeFromJSONSchema({
    jsonSchema: {
      type: 'object',
      properties: {
        first: resource,
        second: {
          ...resource,
          $id: 'second.json',
          $defs: { X: { type: 'number', default: 2 } },
        },
      },
    },
  });
  expect(actual.value).toEqual({
    first: { value: 'inner' },
    second: { value: 2 },
  });
});
it('round-3: embedded templates in array items use the authored resource after insertion', () => {
  const actual = nodeFromJSONSchema({
    jsonSchema: { type: 'array', items: resource },
    defaultValue: [{}],
  });
  actual.push({});
  expect(actual.value).toEqual([{ value: 'inner' }, { value: 'inner' }]);
});
it('round-3: a root pointer into a resource descendant retains that descendants base', () => {
  const actual = nodeFromJSONSchema({
    jsonSchema: {
      type: 'object',
      $defs: { Resource: resource },
      properties: { value: { $ref: '#/$defs/Resource/properties/value' } },
    },
  });
  expect(actual.value).toEqual({ value: 'inner' });
});
it('round-3: unknown external resources still fail without fetching', () => {
  expect(() =>
    nodeFromJSONSchema({
      jsonSchema: {
        $id: 'https://example.test/root.json',
        $ref: 'missing.json',
      },
    }),
  ).toThrow();
});
