import { expect, it } from 'vitest';

import type { JSONSchema } from '@canard/schema-form';

import { constraintValidator } from './fixtures/constraintValidator';

it.each([
  {
    schema: { type: 'number', multipleOf: 0.1 },
    value: 0.30000000000000004,
    keyword: null,
  },
  {
    schema: { type: 'number', multipleOf: 0.3 },
    value: 0.300001,
    keyword: 'multipleOf',
  },
  { schema: { type: 'number', minimum: 1 }, value: 0, keyword: 'minimum' },
  { schema: { type: 'number', maximum: 1 }, value: 2, keyword: 'maximum' },
  { schema: { type: 'integer' }, value: 1.5, keyword: 'type' },
  {
    schema: { type: 'number', multipleOf: 0.1 },
    value: 0.35,
    keyword: 'multipleOf',
  },
  { schema: { type: 'number', multipleOf: 0.01 }, value: 19.99, keyword: null },
  { schema: { type: 'array', minItems: 2 }, value: ['a'], keyword: 'minItems' },
  {
    schema: { type: 'array', maxItems: 1 },
    value: ['a', 'b'],
    keyword: 'maxItems',
  },
  {
    schema: { type: 'object', minProperties: 2 },
    value: { a: 1 },
    keyword: 'minProperties',
  },
] satisfies { schema: JSONSchema; value: unknown; keyword: string | null }[])(
  'independently detects $keyword constraints in the UI validation fixture',
  ({ schema, value, keyword }) => {
    const validate = constraintValidator.validator.compile(schema);
    expect(validate(value)?.map((issue) => issue.keyword) ?? null).toEqual(
      keyword ? [keyword] : null,
    );
  },
);

it('routes collection and array-item issues to their actual data paths', () => {
  const validate = constraintValidator.validator.compile({
    type: 'object',
    properties: {
      'a/b': { type: 'array', minItems: 2, items: { type: 'integer' } },
    },
  });
  expect(
    validate({ 'a/b': [1.5] })?.map(({ dataPath, keyword }) => [
      dataPath,
      keyword,
    ]),
  ).toEqual([
    ['/a~1b', 'minItems'],
    ['/a~1b/0', 'type'],
  ]);
});
