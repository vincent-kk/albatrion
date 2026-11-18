import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { ValidationMode } from '@/schema-form/core/engine/types/state';

import { plugin as ajv6 } from '../../../../schema-form-ajv6-plugin/src/index';
import { plugin as ajv7 } from '../../../../schema-form-ajv7-plugin/src/index';
import { plugin as ajv8 } from '../../../../schema-form-ajv8-plugin/src/default/index';

/** Inactive oneOf branch errors under special property names, with and without a root $id. */
const branchSchema = {
  type: 'object',
  oneOf: [
    {
      properties: { kind: { const: 'a' }, x: { type: 'string', minLength: 3 } },
      required: ['kind'],
    },
    {
      properties: { kind: { const: 'b' }, y: { type: 'string', minLength: 3 } },
      required: ['kind'],
    },
  ],
};

const build = (name: string, withId: boolean, validator: any) =>
  nodeFromJSONSchema({
    jsonSchema: {
      ...(withId ? { $id: 'urn:r3:' + encodeURIComponent(name) + (withId ? ':id' : '') } : {}),
      type: 'object',
      properties: { [name]: { ...branchSchema, properties: { kind: { type: 'string' } } } },
    } as any,
    defaultValue: { [name]: { kind: 'a', x: 'ab' } } as any,
    validationMode: ValidationMode.OnRequest,
    validator,
  });

describe.each([
  ['ajv6', ajv6.validator],
  ['ajv7', ajv7.validator],
  ['ajv8', ajv8.validator],
] as const)('%s inactive branch errors under special names', (_label, validator) => {
  it.each([
    ['plain', false],
    ['a b', false],
    ['이름', false],
    ['100%', false],
    ['a~b', false],
    ['plain', true],
    ['a b', true],
    ['이름', true],
    ['100%', true],
    ['a~b', true],
  ] as const)('property %j (root $id: %s) shows only the active branch error on x', async (name, withId) => {
    const root: any = build(name, withId, validator);
    await root.validate();
    const host = (root.children ?? []).find((child: any) => child.name === name);
    const x = host?.children?.find((child: any) => child.name === 'x');
    const kind = host?.children?.find((child: any) => child.name === 'kind');
    expect({
      x: x?.errors.map((issue: any) => issue.keyword),
      kind: kind?.errors.map((issue: any) => issue.keyword),
    }).toEqual({ x: ['minLength'], kind: [] });
  });
});
