import type { JSONSchema } from '@canard/schema-form';
import { describe, expect, it } from 'vitest';

import { plugin } from '../default';

const validate = (schema: object, data: unknown) =>
  plugin.validator.compile(schema as unknown as JSONSchema)(data);

describe('ValidationIssue.rejectedKey from the default entry', () => {
  it('does not fabricate a rejected key from the root required list for a not-required inside a nested $id resource', async () => {
    const schema = {
      type: 'object',
      required: ['name'],
      definitions: {
        item: { $id: 'urn:schema-form-ajv8:rejected-key-item', type: 'object', not: { required: ['banned'] } },
      },
      properties: {
        name: { type: 'string' },
        b: { $ref: 'urn:schema-form-ajv8:rejected-key-item' },
      },
    };
    const issues = await validate(schema, { name: 'n', b: { banned: 1 } });
    const notIssue = issues?.find((issue) => issue.keyword === 'not');
    expect(notIssue?.dataPath).toBe('/b');
    expect(notIssue?.rejectedKey).toBeUndefined();
  });

  it('reports the rejected key for a root-level not-required in a root with $id', async () => {
    const schema = {
      $id: 'urn:schema-form-ajv8:rejected-key-root',
      type: 'object',
      not: { required: ['banned'] },
    };
    const issues = await validate(schema, { banned: 1 });
    expect(issues?.find((issue) => issue.keyword === 'not')).toMatchObject({ dataPath: '', rejectedKey: 'banned' });
  });

  it('keeps a value-level false schema (then: false) on the value instead of rejecting its key', async () => {
    const schema = {
      type: 'object',
      properties: { name: { type: 'string', if: { const: 'admin' }, then: false } },
    };
    const issues = await validate(schema, { name: 'admin' });
    const falseIssue = issues?.find((issue) => issue.keyword === 'false schema');
    expect(falseIssue).toMatchObject({ dataPath: '/name' });
    expect(falseIssue?.rejectedKey).toBeUndefined();
  });

  it('reports not-required rejected key under a property whose name needs URI encoding', async () => {
    const schema = {
      type: 'object',
      properties: { '이름 a%': { type: 'object', not: { required: ['x'] } } },
    };
    const issues = await validate(schema, { '이름 a%': { x: 1 } });
    expect(issues?.[0]).toMatchObject({ keyword: 'not', dataPath: '/이름 a%', rejectedKey: 'x' });
  });

  it('attaches the rejected key to every issue a propertyNames failure produces', async () => {
    const schema = {
      type: 'object',
      properties: { meta: { type: 'object', propertyNames: { pattern: '^a' } } },
    };
    const issues = await validate(schema, { meta: { bad: 1 } });
    expect(issues?.map((issue) => issue.keyword)).toEqual(['pattern', 'propertyNames']);
    for (const issue of issues ?? []) expect(issue).toMatchObject({ dataPath: '/meta', rejectedKey: 'bad' });
  });
});
