import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { resolveAjvConstructor } from '../validator/utils/resolveAjvConstructor';
import { expect, it } from 'vitest';

import { createValidator } from '../index';

it.each([
  [false, false],
  [false, true],
  [true, false],
  [true, true],
])('delegates full-root async keywords to AJV (named=%s, marker=%s)', async (named, declared) => {
  const instance = new (resolveAjvConstructor(Ajv))({ allErrors: true, strict: false });
  instance.addKeyword({ keyword: 'available', async: true, validate: async () => false });
  const schema: JSONSchema = {
    ...(named ? { $id: 'https://example.test/async-root' } : {}),
    ...(declared ? { $async: true } : {}),
    type: 'object',
    definitions: { rule: { type: 'string', available: true } },
    properties: { name: { $ref: '#/definitions/rule' } },
  };
  const compile = () => createValidator(instance).compile(schema);
  if (!declared) { expect(compile).toThrow(/async keyword in sync schema/); return; }
  await expect(compile()({ name: 'taken' })).resolves.toMatchObject([
    { keyword: 'available', dataPath: '/name' },
  ]);
});
