import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../index';

const validate = (schema: object, data: unknown) =>
  createValidator(new Ajv({ strict: false, allErrors: true })).compile(
    schema as unknown as JSONSchema,
  )(data);

describe('ValidationIssue.rejectedKey for value-level false schemas', () => {
  it('keeps a false schema (then: false) on the value instead of rejecting its key', async () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string', if: { const: 'admin' }, then: false },
      },
    };
    const issues = await validate(schema, { name: 'admin' });
    const falseIssue = issues?.find((issue) => issue.keyword === 'false schema');
    expect(falseIssue).toMatchObject({ dataPath: '/name' });
    expect(falseIssue?.rejectedKey).toBeUndefined();
  });

  it.each([
    ['allOf', { properties: { f: { allOf: [false] } } }, { f: 1 }, '/f'],
    [
      'an inlined $ref target',
      {
        definitions: { never: false },
        properties: { f: { $ref: '#/definitions/never' } },
      },
      { f: 1 },
      '/f',
    ],
    [
      'a schema dependency',
      {
        properties: {
          o: { type: 'object', dependencies: { items: false } },
        },
      },
      { o: { items: 1 } },
      '/o',
    ],
  ])(
    'keeps a false schema reached through %s on the value',
    async (_, schema, data, dataPath) => {
      const issues = await validate({ type: 'object', ...schema }, data);
      const falseIssue = issues?.find(
        (issue) => issue.keyword === 'false schema',
      );
      expect(falseIssue).toMatchObject({ dataPath });
      expect(falseIssue?.rejectedKey).toBeUndefined();
    },
  );

  it('keeps the host of a false propertyNames schema and rejects the offending key', async () => {
    const schema = {
      type: 'object',
      properties: {
        o: {
          type: 'object',
          properties: { m: { type: 'object', propertyNames: false } },
        },
      },
    };
    const issues = await validate(schema, { o: { m: { k: 1 } } });
    expect(
      issues?.map((issue) => [issue.keyword, issue.dataPath, issue.rejectedKey]),
    ).toEqual([
      ['false schema', '/o/m', 'k'],
      ['propertyNames', '/o/m', 'k'],
    ]);
  });
});
