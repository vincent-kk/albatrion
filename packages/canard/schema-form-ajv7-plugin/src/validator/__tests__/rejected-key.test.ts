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
});

it('reads a negative key below a URI-encoded schema token', async () => {
  const name = '이름 %/~';
  const root = { type: 'object', properties: { [name]: { not: { required: ['blocked'] } } } } as const;
  const issues = await ajvValidatorPlugin.compile(root)({ [name]: { blocked: true } });
  expect(issues?.find(({ keyword }) => keyword === 'not')).toMatchObject({
    dataPath: '/이름 %~1~0',
    rejectedKey: 'blocked',
  });
});

it('leaves false under a dependent schema named items on the object', async () => {
  ajvValidatorPlugin.bind(new Ajv2019({ strict: false }));
  const schema = { properties: { value: { dependentSchemas: { items: false } } } };
  const issues = await ajvValidatorPlugin.compile(schema)({ value: { items: true } });
  expect(issues?.find(({ keyword }) => keyword === 'false schema')).toMatchObject({
    dataPath: '/value',
  });
  expect(issues?.find(({ keyword }) => keyword === 'false schema')?.rejectedKey).toBeUndefined();
});
