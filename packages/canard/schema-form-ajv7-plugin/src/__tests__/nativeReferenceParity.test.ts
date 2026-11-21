import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { createValidator } from '../index';
import { resolveAjvConstructor } from '../validator/utils/resolveAjvConstructor';

it.each([
  ['encoded slash', { components: { 'a/b': { $ref: 'https://example.test/scope/check' } }, $ref: '#/components/a%2Fb' }],
  ['relative reference in a custom array', { components: [{ $id: 'https://example.test/scope/', payload: { $ref: 'check' } }], $ref: '#/components/0/payload' }],
] satisfies [string, JSONSchema][])('uses native resolution for %s', async (_, schema) => {
  const Constructor = resolveAjvConstructor(Ajv);
  const instance = new Constructor({ allErrors: true, strict: false, logger: false });
  instance.addSchema({ $id: 'https://example.test/scope/check', type: 'string', minLength: 4 });
  const native = instance.compile(schema);
  expect(native('bad')).toBe(false);
  const issues = await createValidator(instance).compile(schema)('bad');
  expect(issues?.map((issue) => issue.source)).toMatchObject(native.errors ?? []);
});
