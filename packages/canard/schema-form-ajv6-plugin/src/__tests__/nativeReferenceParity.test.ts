import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { createValidator } from '../index';

it.each([
  ['encoded slash', { components: { 'a/b': { $ref: 'https://example.test/scope/check' } }, $ref: '#/components/a%2Fb' }],
  ['relative reference in a custom array', { components: [{ $id: 'https://example.test/scope/', payload: { $ref: 'check' } }], $ref: '#/components/0/payload' }],
] satisfies [string, JSONSchema][])('uses native resolution for %s', async (_, schema) => {
  const Constructor = Ajv;
  const instance = new Constructor({ allErrors: true, logger: false });
  instance.addSchema({ $id: 'https://example.test/scope/check', type: 'string', minLength: 4 });
  const native = instance.compile(schema);
  expect(native('bad')).toBe(false);
  const issues = await createValidator(instance).compile(schema)('bad');
  expect(issues?.map((issue) => issue.source)).toMatchObject(native.errors ?? []);
});

it.each(['macro', 'anchored fragment'] as const)('uses native async semantics for a marked %s', async (selection) => {
  const Constructor = Ajv;
  const instance = new Constructor({ allErrors: true, logger: false });
  instance.addFormat('custom', { async: true, validate: async (value: string) => value === 'valid' });
  instance.addKeyword('available', { macro: () => ({ format: 'custom' }) });
  const schema: JSONSchema = selection === 'macro'
    ? { $async: true, type: 'string', available: true }
    : { $async: true, components: { name: { $id: '#leaf', type: 'string', format: 'custom' } }, $ref: '#leaf' };
  const native = instance.compile(schema);
  const validate = createValidator(instance).compile(schema);
  await expect(native('valid')).resolves.toBe('valid');
  await expect(validate('valid')).resolves.toBeNull();
  await expect(native('invalid')).rejects.toMatchObject({ errors: [expect.objectContaining({ keyword: 'format' }), ...(selection === 'macro' ? [expect.objectContaining({ keyword: 'available' })] : [])] });
  expect((await validate('invalid'))?.map((issue) => issue.keyword)).toEqual(selection === 'macro' ? ['format', 'available'] : ['format']);
});
