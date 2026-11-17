import type { JSONSchema } from '@canard/schema-form';
import { describe, expect, it } from 'vitest';

import { plugin as plugin2020 } from '../2020';
import { plugin } from '../default';

const validate = (schema: object, data: unknown) =>
  plugin.validator.compile(schema as unknown as JSONSchema)(data);

describe('ValidationIssue.rejectedKey', () => {
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

  it.each([
    ['allOf', { properties: { f: { allOf: [false] } } }, { f: 1 }, '/f'],
    ['an inlined $ref target', { definitions: { never: false }, properties: { f: { $ref: '#/definitions/never' } } }, { f: 1 }, '/f'],
  ])('keeps a false schema reached through %s on the value', async (_, schema, data, dataPath) => {
    const issues = await validate({ type: 'object', ...schema }, data);
    const falseIssue = issues?.find((issue) => issue.keyword === 'false schema');
    expect(falseIssue).toMatchObject({ dataPath });
    expect(falseIssue?.rejectedKey).toBeUndefined();
  });

  it.each([
    ['properties', plugin, { properties: { x: false } }, { x: 1 }, '', 'x'],
    ['patternProperties', plugin, { patternProperties: { '^x': false } }, { xa: 1 }, '', 'xa'],
    ['a single items schema', plugin, { properties: { a: { type: 'array', items: false } } }, { a: [1] }, '/a', '0'],
    ['a tuple items entry', plugin, { properties: { a: { type: 'array', items: [false], minItems: 1, additionalItems: false } } }, { a: [1] }, '/a', '0'],
    ['a prefixItems entry', plugin2020, { properties: { a: { type: 'array', prefixItems: [false], minItems: 1, items: false } } }, { a: [1] }, '/a', '0'],
  ])('rejects the child key of a false schema under %s', async (_, entry, schema, data, dataPath, rejectedKey) => {
    const issues = await entry.validator.compile({ type: 'object', ...schema } as unknown as JSONSchema)(data);
    expect(issues?.find((issue) => issue.keyword === 'false schema')).toMatchObject({ dataPath, rejectedKey });
  });

  it('unescapes JSON Pointer segments of property names that contain a slash or a tilde', async () => {
    const schema = {
      type: 'object',
      properties: { 'a/b~c': { type: 'object', not: { required: ['x'] } }, 'd/e~f': false },
    };
    const issues = await validate(schema, { 'a/b~c': { x: 1 }, 'd/e~f': 1 });
    expect(issues?.map((issue) => [issue.keyword, issue.dataPath, issue.rejectedKey])).toEqual([
      ['not', '/a~1b~0c', 'x'],
      ['false schema', '', 'd/e~f'],
    ]);
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

  it('keeps the host of a false propertyNames schema and rejects the offending key', async () => {
    const schema = {
      type: 'object',
      properties: { o: { type: 'object', properties: { m: { type: 'object', propertyNames: false } } } },
    };
    const issues = await validate(schema, { o: { m: { k: 1 } } });
    expect(issues?.map((issue) => [issue.keyword, issue.dataPath, issue.rejectedKey])).toEqual([
      ['false schema', '/o/m', 'k'],
      ['propertyNames', '/o/m', 'k'],
    ]);
  });
});
