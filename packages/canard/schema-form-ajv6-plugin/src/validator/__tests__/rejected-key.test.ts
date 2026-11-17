import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { ajvValidatorPlugin } from '../validatorPlugin';

describe('FRAGMENT-020 FRAGMENT-053 rejectedKey', () => {
  it.each([
    [{ type: 'object', properties: { x: false } }, { x: 1 }, 'x'],
    [{ type: 'object', additionalProperties: false }, { x: 1 }, 'x'],
    [{ type: 'object', propertyNames: { pattern: '^a' } }, { x: 1 }, 'x'],
    [{ type: 'object', not: { required: ['x'] } }, { x: 1 }, 'x'],
  ] as const)('identifies one rejected key', async (schema, value, key) => {
    ajvValidatorPlugin.bind!(new Ajv({ allErrors: true }));
    // The public JSONSchema type excludes boolean child schemas, which Ajv 6 accepts.
    const issues = await ajvValidatorPlugin.compile(schema as unknown as JSONSchema)(value);
    expect(issues?.find((issue) => issue.keyword === 'propertyNames') ?? issues?.[0])
      .toMatchObject({ dataPath: '', rejectedKey: key });
    expect(issues?.every((issue) => issue.rejectedKey === key)).toBe(true);
  });

  it('leaves a multi-name not required rejection at the host', async () => {
    ajvValidatorPlugin.bind!(new Ajv({ allErrors: true }));
    const issues = await ajvValidatorPlugin.compile({ type: 'object', not: { required: ['x', 'y'] } })({ x: 1, y: 2 });
    expect(issues?.[0]?.rejectedKey).toBeUndefined();
  });

  it.each([
    ['then', { properties: { name: { type: 'string', if: { const: 'admin' }, then: false } } }, { name: 'admin' }, '/name'],
    ['allOf', { properties: { f: { allOf: [false] } } }, { f: 1 }, '/f'],
    ['an inlined $ref target', { definitions: { never: false }, properties: { f: { $ref: '#/definitions/never' } } }, { f: 1 }, '/f'],
    ['then under a property named items', { properties: { items: { type: 'array', if: { minItems: 1 }, then: false } } }, { items: [1] }, '/items'],
    ['then under a property named properties', { properties: { properties: { type: 'object', if: { required: ['a'] }, then: false } } }, { properties: { a: 1 } }, '/properties'],
  ])('keeps a false schema reached through %s on the value', async (_, schema, value, dataPath) => {
    ajvValidatorPlugin.bind!(new Ajv({ allErrors: true }));
    const issues = await ajvValidatorPlugin.compile({ type: 'object', ...schema } as unknown as JSONSchema)(value);
    const falseIssue = issues?.find((issue) => issue.keyword === 'false schema');
    expect(falseIssue).toMatchObject({ dataPath });
    expect(falseIssue?.rejectedKey).toBeUndefined();
  });

  it.each([
    ['patternProperties', { patternProperties: { '^x': false } }, { xa: 1 }, '', 'xa'],
    ['a single items schema', { properties: { a: { type: 'array', items: false } } }, { a: [1] }, '/a', '0'],
    ['a tuple items entry', { properties: { a: { type: 'array', items: [false] } } }, { a: [1] }, '/a', '0'],
    ['a property named items', { properties: { o: { type: 'object', properties: { items: false } } } }, { o: { items: 1 } }, '/o', 'items'],
  ])('rejects the child key of a false schema under %s', async (_, schema, value, dataPath, rejectedKey) => {
    ajvValidatorPlugin.bind!(new Ajv({ allErrors: true }));
    const issues = await ajvValidatorPlugin.compile({ type: 'object', ...schema } as unknown as JSONSchema)(value);
    expect(issues?.find((issue) => issue.keyword === 'false schema')).toMatchObject({ dataPath, rejectedKey });
  });

  it('classifies false schemas inside a resource with its own $id by their last segments', async () => {
    ajvValidatorPlugin.bind!(new Ajv({ allErrors: true }));
    const schema = {
      type: 'object',
      definitions: {
        item: { $id: 'http://example.com/a/item.json', type: 'object', properties: { x: false, y: { if: true, then: false } } },
      },
      properties: { b: { $ref: 'http://example.com/a/item.json' } },
    };
    const issues = await ajvValidatorPlugin.compile(schema as unknown as JSONSchema)({ b: { x: 1, y: 1 } });
    expect(issues?.filter((issue) => issue.keyword === 'false schema').map((issue) => [issue.dataPath, issue.rejectedKey]))
      .toEqual([['/b', 'x'], ['/b/y', undefined]]);
  });

  it('keeps the host of a false propertyNames schema and rejects the offending key', async () => {
    ajvValidatorPlugin.bind!(new Ajv({ allErrors: true }));
    const schema = {
      type: 'object',
      properties: { o: { type: 'object', properties: { m: { type: 'object', propertyNames: false } } } },
    };
    const issues = await ajvValidatorPlugin.compile(schema as unknown as JSONSchema)({ o: { m: { k: 1 } } });
    expect(issues?.map((issue) => [issue.keyword, issue.dataPath, issue.rejectedKey])).toEqual([
      ['false schema', '/o/m', 'k'],
      ['propertyNames', '/o/m', 'k'],
    ]);
  });

  it('reports the not required rejected key under a property whose name needs URI encoding', async () => {
    ajvValidatorPlugin.bind!(new Ajv({ allErrors: true }));
    const schema = {
      type: 'object',
      properties: { '이름 a%': { type: 'object', not: { required: ['x'] } } },
    };
    const issues = await ajvValidatorPlugin.compile(schema as JSONSchema)({ '이름 a%': { x: 1 } });
    expect(issues?.[0]).toMatchObject({ keyword: 'not', dataPath: '/이름 a%', rejectedKey: 'x' });
  });
});
