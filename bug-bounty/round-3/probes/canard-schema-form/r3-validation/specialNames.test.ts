import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { ValidationMode } from '@/schema-form/core/engine/types/state';

// Current plugin sources, not their (older) built dist.
import { plugin as ajv6 } from '../../../../schema-form-ajv6-plugin/src/index';
import { plugin as ajv7 } from '../../../../schema-form-ajv7-plugin/src/index';
import { plugin as ajv8 } from '../../../../schema-form-ajv8-plugin/src/default/index';

const validators = [
  ['ajv6', ajv6.validator],
  ['ajv7', ajv7.validator],
  ['ajv8', ajv8.validator],
] as const;

const names = [
  '__proto__',
  'constructor',
  'toString',
  'hasOwnProperty',
  'valueOf',
  '%',
  '%25',
  '%2F',
  '~',
  '~1',
  '/',
  'a/b',
  'a b',
  '',
  '😀',
  '이름',
  '*',
  '.',
  '..',
  '@',
  '#',
  "'",
  '"',
  '\\',
  '[0]',
  '0',
  'a.b',
  "a'b",
] as const;

const objectWith = (name: string, value: unknown) => {
  const result: Record<string, unknown> = {};
  Object.defineProperty(result, name, {
    value,
    enumerable: true,
    configurable: true,
    writable: true,
  });
  return result;
};

const build = (name: string, validator: any, value: unknown) =>
  nodeFromJSONSchema({
    jsonSchema: {
      type: 'object',
      properties: objectWith(name, { type: 'string', minLength: 3 }) as any,
      required: [name],
    },
    defaultValue: value as any,
    validationMode: ValidationMode.OnRequest,
    validator,
  });

const childNamed = (root: any, name: string) =>
  (root.children ?? []).find((child: any) => child.name === name);

describe.each(validators)('%s special property names', (_label, validator) => {
  it.each(names)('a minLength issue on property %j lands on that field', async (name) => {
    const root = build(name, validator, objectWith(name, 'a'));
    const all = await root.validate();
    const field = childNamed(root, name);
    expect({
      all: all.map((issue) => [issue.keyword, issue.dataPath]),
      field: field?.errors.map((issue: any) => issue.keyword),
      root: root.errors.map((issue) => issue.keyword),
    }).toEqual({
      all: [['minLength', expect.any(String)]],
      field: ['minLength'],
      root: [],
    });
  });

  it.each(names)('a required issue for missing property %j lands on that field', async (name) => {
    const root = build(name, validator, {});
    const all = await root.validate();
    const field = childNamed(root, name);
    expect({
      all: all.map((issue) => issue.keyword),
      field: field?.errors.map((issue: any) => issue.keyword),
      root: root.errors.map((issue) => issue.keyword),
    }).toEqual({ all: ['required'], field: ['required'], root: [] });
  });
});
