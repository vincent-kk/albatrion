import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { afterEach, expect, it } from 'vitest';
import { createValidator, createValidatorFactory, plugin } from '../default/index';

/** Public entry selections must observe the same current application state. */
const entries = ['instance', 'factory', 'bound'] as const;
/** Select a public compiler without exposing a private registration to the test. */
const compilerFor = (source: InstanceType<typeof Ajv>, entry: typeof entries[number]) => {
  if (entry === 'factory') return createValidatorFactory(source);
  if (entry === 'instance') return createValidator(source).compile;
  plugin.validator.bind?.(source);
  return plugin.validator.compile;
};
afterEach(() => plugin.validator.configure({ directGuardCompile: true }));

it.each(entries)('current compilation: %s rechecks changed imports for the same root', async entry => {
  const source = new Ajv({ allErrors: true, strict: false, logger: false });
  const id = 'https://current-model.invalid/import';
  source.addSchema({ $id: id, type: 'number' });
  const compile = compilerFor(source, entry);
  const root: JSONSchema = { $ref: id };
  const before = compile(root);
  expect(await before('x')).not.toBeNull();
  source.removeSchema(id);
  source.addSchema({ $id: id, type: 'string' });
  expect(await compile(root)('x')).toEqual(await compile({ ...root })('x'));
  expect(await compile(root)('x')).toBeNull();
  expect(await before('x')).not.toBeNull();
  source.removeSchema(id);
  expect(() => compile(root)).toThrow();
});

it.each(entries)('current compilation: %s rechecks a newly occupied form id', async entry => {
  const source = new Ajv({ allErrors: true, strict: false, logger: false });
  const id = 'https://current-model.invalid/form';
  const root: JSONSchema = { $id: id, type: 'number' };
  const compile = compilerFor(source, entry);
  const old = compile(root);
  source.addSchema({ $id: id, type: 'string' });
  expect(() => compile(root)).toThrow(/already exists/);
  expect(() => compile({ ...root })).toThrow(/already exists/);
  expect(await old(3)).toBeNull();
});

it.each(entries)('current compilation: %s revalidates the same root after its meta-schema changes', async entry => {
  const source = new Ajv({ allErrors: true, strict: false, logger: false });
  const id = 'https://current-model.invalid/meta';
  source.addMetaSchema({ $id: id, type: 'object', properties: { minLength: { type: 'number', minimum: 0 } } });
  const root: JSONSchema = { $schema: id, type: 'string', minLength: 2 };
  const compile = compilerFor(source, entry);
  const old = compile(root);
  source.removeSchema(id);
  source.addMetaSchema({ $id: id, type: 'object', properties: { minLength: { type: 'number', maximum: 1 } } });
  expect(() => compile(root)).toThrow(/schema is invalid|maximum/);
  expect(() => compile({ ...root })).toThrow(/schema is invalid|maximum/);
  expect(await old('xx')).toBeNull();
});

it('current guard selection: changing direct compilation applies to an already visited pointer', () => {
  const source = new Ajv({ strict: false, logger: false });
  const id = 'https://current-model.invalid/guard';
  source.addSchema({ $id: id, type: 'number' });
  plugin.validator.bind?.(source);
  plugin.validator.configure({ directGuardCompile: true });
  const root: JSONSchema = { $id: id, type: 'object', if: { type: 'string' } };
  const old = plugin.validator.compileGuard(root, '/if');
  expect(old('x')).toBe(true);
  plugin.validator.configure({ directGuardCompile: false });
  expect(() => plugin.validator.compileGuard({ ...root }, '/if')).toThrow(/already exists/);
  expect(() => plugin.validator.compileGuard(root, '/if')).toThrow(/already exists/);
  expect(old('x')).toBe(true);
});
