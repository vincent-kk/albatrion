import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { createValidator } from '../index';

it.each([
  [false, false],
  [false, true],
  [true, false],
  [true, true],
])('compiles a full root with an async keyword (named=%s, marker=%s)', async (named, declared) => {
  const instance = new Ajv({ allErrors: true, strict: false });
  instance.addKeyword({ keyword: 'available', async: true, validate: async () => false });
  const schema: JSONSchema = {
    ...(named ? { $id: 'https://example.test/async-root' } : {}),
    ...(declared ? { $async: true } : {}),
    type: 'object',
    definitions: { rule: { type: 'string', available: true } },
    properties: { name: { $ref: '#/definitions/rule' } },
  };
  const compile = () => createValidator(instance).compile(schema);
  await expect(compile()({ name: 'taken' })).resolves.toMatchObject([
    { keyword: 'available', dataPath: '/name' },
  ]);
  expect(schema.$async).toBe(declared ? true : undefined);
});

it('compiles an unmarked root with only an async format', async () => {
  const instance = new Ajv({ allErrors: true, strict: false });
  instance.addFormat('available', { async: true, validate: async () => false });

  const validate = createValidator(instance).compile({ type: 'string', format: 'available' });

  await expect(validate('taken')).resolves.toMatchObject([
    { keyword: 'format', dataPath: '' },
  ]);
});
