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

it.each(['macro', 'anchored fragment'] as const)('uses native async semantics for a marked %s', async (selection) => {
  const Constructor = resolveAjvConstructor(Ajv);
  const instance = new Constructor({ allErrors: true, strict: false, logger: false });
  instance.addFormat('custom', { async: true, validate: async (value: string) => value === 'valid' });
  instance.addKeyword({ keyword: 'available', macro: () => ({ format: 'custom' }) });
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

it('keeps an active form address private during compilation from a custom keyword', async () => {
  const Constructor = resolveAjvConstructor(Ajv);
  const instance = new Constructor({ strict: false, logger: false });
  const validator = createValidator(instance);
  const address = 'https://example.test/outer-form';
  const target = address + '#/definitions/shared';
  let nestedFailure: unknown;
  instance.addKeyword({
    keyword: 'compileNested',
    compile() {
      try {
        validator.compile({ $ref: target });
      } catch (error) {
        nestedFailure = error;
      }
      return () => true;
    },
  });

  const validate = validator.compile({
    $id: address,
    compileNested: true,
    definitions: { shared: { type: 'number' } },
  });
  expect(nestedFailure).toMatchObject({
    message: expect.stringContaining(target),
  });
  expect(instance.getSchema(address)).toBeUndefined();
  await expect(validate(42)).resolves.toBeNull();
});

it.each(['macro', 'local pointer'] as const)('compiles an unmarked named root with an async %s', async (location) => {
  const ajv = new Ajv({ strict: false, allErrors: true });
  ajv.addFormat('late-format', { async: true, validate: async (value: string) => value === 'valid' });
  ajv.addKeyword({ keyword: 'macroFormat', macro: () => ({ format: 'late-format' }) });
  const $id = 'https://example.test/implicit-async';
  const schema: JSONSchema = location === 'macro'
    ? { $id, type: 'string', macroFormat: true }
    : { $id, components: { name: { type: 'string', format: 'late-format' } }, $ref: '#/components/name' };
  const validate = createValidator(ajv).compile(schema);

  await expect(validate('valid')).resolves.toBeNull();
  await expect(validate('invalid')).resolves.toEqual(
    expect.arrayContaining([expect.objectContaining({ keyword: 'format' })]),
  );
});

it('resolves a newly selected fragment in an already used application document', async () => {
  const ajv = new Ajv({ strict: false });
  const doc = 'https://example.test/document';
  const string = 'https://example.test/string';
  const number = 'https://example.test/number';
  ajv.addSchema({ $id: string, type: 'string' });
  ajv.addSchema({ $id: number, type: 'number' });
  ajv.addSchema({ $id: doc, components: { a: { $ref: string }, b: { $ref: number } } });
  const validator = createValidator(ajv);

  await expect(validator.compile({ $ref: doc + '#/components/a' })('x')).resolves.toBeNull();
  const validate = validator.compile({ $ref: doc + '#/components/b' });
  await expect(validate('x')).resolves.toMatchObject([{ keyword: 'type', details: { type: 'number' } }]);
  await expect(validate(1)).resolves.toBeNull();
});
