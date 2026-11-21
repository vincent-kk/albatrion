import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019.js';
import { describe, expect, it } from 'vitest';

import { ajvValidatorPlugin } from '../validatorPlugin';

describe('FRAGMENT-020 FRAGMENT-053 rejectedKey', () => {
  it.each([
    [{ type: 'object', properties: { x: false } }, { x: 1 }, 'x'],
    [{ type: 'object', additionalProperties: false }, { x: 1 }, 'x'],
    [{ type: 'object', propertyNames: { pattern: '^a' } }, { x: 1 }, 'x'],
    [{ type: 'object', not: { required: ['x'] } }, { x: 1 }, 'x'],
  ] as const)('identifies the rejected property', async (schema, value, key) => {
    ajvValidatorPlugin.bind?.(new Ajv({ allErrors: true, strict: false }));
    const issues = await ajvValidatorPlugin.compile(schema as unknown as JSONSchema)(value);
    expect(issues?.find((issue) => issue.keyword === 'propertyNames') ?? issues?.[0])
      .toMatchObject({ dataPath: '', rejectedKey: key });
  });

  it('leaves a multiple-required not schema at the host', async () => {
    ajvValidatorPlugin.bind?.(new Ajv({ allErrors: true, strict: false }));
    const issues = await ajvValidatorPlugin.compile({ type: 'object', not: { required: ['x', 'y'] } })({ x: 1, y: 2 });
    expect(issues?.[0]?.rejectedKey).toBeUndefined();
  });

  it.each([
    ['needs URI encoding', '이름 a%', '/이름 a%'],
    ['has a slash and a tilde', 'a/b~c', '/a~1b~0c'],
  ])('reports the not-required rejected key under a property whose name %s', async (_, name, dataPath) => {
    const issues = await validate(
      { type: 'object', properties: { [name]: { type: 'object', not: { required: ['x'] } } } },
      { [name]: { x: 1 } },
    );
    expect(issues?.[0]).toMatchObject({ keyword: 'not', dataPath, rejectedKey: 'x' });
  });

  it('keeps a value-level false schema (then: false) on the value instead of rejecting its key', async () => {
    const issues = await validate(
      { type: 'object', properties: { name: { type: 'string', if: { const: 'admin' }, then: false } } },
      { name: 'admin' },
    );
    const falseIssue = issues?.find((issue) => issue.keyword === 'false schema');
    expect(falseIssue).toMatchObject({ dataPath: '/name' });
    expect(falseIssue?.rejectedKey).toBeUndefined();
  });

  it.each([
    ['allOf', { properties: { f: { allOf: [false] } } }, { f: 1 }, '/f'],
    ['an inlined $ref target', { definitions: { never: false }, properties: { f: { $ref: '#/definitions/never' } } }, { f: 1 }, '/f'],
    ['dependencies', { properties: { o: { type: 'object', dependencies: { a: false } } } }, { o: { a: 1 } }, '/o'],
    ['then on a field named items', { properties: { items: { if: { const: 'a' }, then: false } } }, { items: 'a' }, '/items'],
    ['then on a field named properties', { properties: { properties: { if: { const: 'a' }, then: false } } }, { properties: 'a' }, '/properties'],
    ['a $ref to a definition named items', { definitions: { items: false }, properties: { f: { $ref: '#/definitions/items' } } }, { f: 1 }, '/f'],
    ['a dependency named items', { properties: { o: { type: 'object', dependencies: { items: false } } } }, { o: { items: 1 } }, '/o'],
  ])('keeps a false schema reached through %s on the value', async (_, schema, value, dataPath) => {
    const issues = await validate({ type: 'object', ...schema }, value);
    const falseIssue = issues?.find((issue) => issue.keyword === 'false schema');
    expect(falseIssue).toMatchObject({ dataPath });
    expect(falseIssue?.rejectedKey).toBeUndefined();
  });

  it.each([
    ['a $ref to a $defs entry named items', { $defs: { items: false }, properties: { f: { $ref: '#/$defs/items' } } }, { f: 1 }, '/f'],
    ['a dependent schema named items', { properties: { o: { type: 'object', dependentSchemas: { items: false } } } }, { o: { items: 1 } }, '/o'],
  ])('keeps a 2019-09 false schema reached through %s on the value', async (_, schema, value, dataPath) => {
    const issues = await validate({ type: 'object', ...schema }, value, Ajv2019);
    const falseIssue = issues?.find((issue) => issue.keyword === 'false schema');
    expect(falseIssue).toMatchObject({ dataPath });
    expect(falseIssue?.rejectedKey).toBeUndefined();
  });

  it.each([
    ['a property whose name has a slash and a tilde', { properties: { 'd/e~f': false } }, { 'd/e~f': 1 }, '', 'd/e~f'],
    ['patternProperties', { patternProperties: { '^x': false } }, { xa: 1 }, '', 'xa'],
    ['a single items schema', { properties: { a: { type: 'array', items: false } } }, { a: [1] }, '/a', '0'],
    ['a single items schema on a field named items', { properties: { items: { type: 'array', items: false } } }, { items: [1] }, '/items', '0'],
    ['a tuple items entry', { properties: { a: { type: 'array', items: [false] } } }, { a: [1] }, '/a', '0'],
  ])('rejects the child key of a false schema under %s', async (_, schema, value, dataPath, rejectedKey) => {
    const issues = await validate({ type: 'object', ...schema }, value);
    expect(issues?.find((issue) => issue.keyword === 'false schema')).toMatchObject({ dataPath, rejectedKey });
  });

  it.each([
    ['m', { o: { type: 'object', properties: { m: { type: 'object', propertyNames: false } } } }, { o: { m: { k: 1 } } }, '/o/m'],
    ['items', { items: { type: 'object', propertyNames: false } }, { items: { k: 1 } }, '/items'],
  ])('keeps the host %s of a false propertyNames schema and rejects the offending key', async (_, properties, value, dataPath) => {
    const issues = await validate({ type: 'object', properties }, value);
    expect(issues?.map((issue) => [issue.keyword, issue.dataPath, issue.rejectedKey])).toEqual([
      ['false schema', dataPath, 'k'],
      ['propertyNames', dataPath, 'k'],
    ]);
  });
});

/** Validate through a fresh binding so earlier rows cannot leak registrations. */
const validate = (schema: object, value: unknown, Constructor: typeof Ajv = Ajv) => {
  ajvValidatorPlugin.bind?.(new Constructor({ allErrors: true, strict: false }));
  return ajvValidatorPlugin.compile(schema as unknown as JSONSchema)(value);
};
