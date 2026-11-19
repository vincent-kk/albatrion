import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../index';

/** Local and recursive resources keep native and normalized profiles independent. */
const inputs = [
  {
    kind: 'pointer',
    body: {
      type: 'object',
      properties: { 'a/b~': { $ref: '#/definitions/leaf' } },
      definitions: { leaf: { type: 'string', minLength: 3 } },
    },
    value: { 'a/b~': 'x' },
    path: '/a~1b~0',
  },
  {
    kind: 'anchor',
    body: {
      type: 'object',
      properties: { 'a/b~': { $ref: '#leaf' } },
      definitions: { leaf: { $id: '#leaf', type: 'string', minLength: 3 } },
    },
    value: { 'a/b~': 'x' },
    path: '/a~1b~0',
  },
  {
    kind: 'recursive',
    body: {
      type: 'object',
      properties: {
        'a/b~': { type: 'string', minLength: 3 },
        nested: { $ref: '#' },
      },
    },
    value: { nested: { 'a/b~': 'x' } },
    path: '/nested/a~1b~0',
  },
] as const;

describe.each([false, true])('native registered first=%s', (nativeFirst) => {
  it.each(inputs)(
    'preserves $kind resources through compile, release and recompile',
    async ({ kind, body, value, path }) => {
      const instance = new Ajv({
        allErrors: true,
        jsonPointers: false,
        format: false,
      });
      const id = 'https://round-four.invalid/profile/' + kind;
      const schema: JSONSchema = { ...body, $id: id };
      if (nativeFirst) instance.addSchema(schema);
      const before = nativeFirst ? instance.getSchema(id) : undefined;
      const adapter = createValidator(instance);
      const validate = adapter.compile(schema);
      expect((await validate(value))?.[0].dataPath).toBe(path);
      const native = nativeFirst
        ? instance.getSchema(id)
        : new Ajv({
            allErrors: true,
            jsonPointers: false,
            format: false,
          }).compile(schema);
      if (!nativeFirst) expect(instance.getSchema(id)).toBeUndefined();
      if (!native) throw new Error('Registered native schema is missing');
      expect(native(value)).toBe(false);
      expect(native.errors?.[0].dataPath).not.toBe(path);
      if (before) expect(native).toBe(before);
      adapter.release?.(schema);
      if (nativeFirst) expect(instance.getSchema(id)).toBe(native);
      else expect(instance.getSchema(id)).toBeUndefined();
      const repeated: JSONSchema = { ...body, $id: id };
      expect((await adapter.compile(repeated)(value))?.[0].dataPath).toBe(path);
      adapter.release?.(repeated);
    },
  );
});
