import Ajv, { type Options } from 'ajv';
import { expect, it, vi } from 'vitest';

import { createValidator, createValidatorFactory } from '../default/index';
import { captureApplicationState } from './utils/ownershipModel/captureApplicationState';

it('ownership limits: boolean roots are explicitly refused at every compilation entry', () => {
  const instance = new Ajv({ allErrors: true });
  const adapter = createValidator(instance);
  expect(() => Reflect.apply(adapter.compile, adapter, [false])).toThrow(
    TypeError,
  );
  expect(() =>
    Reflect.apply(adapter.compileGuard!, adapter, [true, '']),
  ).toThrow(TypeError);
  const factory = createValidatorFactory(instance);
  expect(() => Reflect.apply(factory, undefined, [false])).toThrow(TypeError);
});

it('ownership limits: loadSchema stays unused and a failed same-copy compile remains retryable', async () => {
  const loadSchema = vi.fn(async () => ({ type: 'string' }));
  const instance = new Ajv({ allErrors: true, loadSchema });
  const root = {
    type: 'object',
    properties: { value: { $ref: 'https://model.invalid/late' } },
  } satisfies import('@canard/schema-form').JSONSchema;
  const adapter = createValidator(instance);
  expect(() => adapter.compile(root)).toThrow();
  expect(loadSchema).not.toHaveBeenCalled();
  instance.addSchema({ $id: 'https://model.invalid/late', type: 'string' });
  expect(await adapter.compile(root)({ value: 2 })).not.toBeNull();
  const first = adapter.compile(root);
  expect(adapter.compile(root)).toBe(first);
});

it('ownership limits: enabling a mutating option later refuses new compilation but keeps a cached snapshot', async () => {
  const instance = new Ajv({ allErrors: true });
  const adapter = createValidator(instance);
  const root = {
    type: 'string',
  } satisfies import('@canard/schema-form').JSONSchema;
  const validate = adapter.compile(root);
  Reflect.set(instance.opts, 'coerceTypes', true);
  expect(adapter.compile(root)).toBe(validate);
  expect(() => adapter.compile({ ...root })).toThrow(/coerceTypes/);
  expect(await validate(2)).not.toBeNull();
});

it('ownership limits: a non-standard constructor is refused with an isolation error', () => {
  const token = Symbol('constructor-token');
  class Restricted extends Ajv {
    constructor(options: Options, supplied?: symbol) {
      if (supplied !== token)
        throw new Error('Missing application constructor token');
      super(options);
    }
  }
  const instance = new Restricted({ allErrors: true }, token);
  expect(() => createValidator(instance).compile({ type: 'string' })).toThrow(
    /isolat/i,
  );
});

it('ownership profile: removed bootstrap schemas do not return in private compilers', async () => {
  const id = 'https://model.invalid/bootstrap';
  const instance = new Ajv({
    allErrors: true,
    schemas: [{ $id: id, type: 'number' }],
  });
  instance.removeSchema(id);
  const before = captureApplicationState(instance);
  const root = {
    $id: id,
    type: 'string',
  } satisfies import('@canard/schema-form').JSONSchema;
  const validate = createValidator(instance).compile(root);
  expect(await validate('ok')).toBeNull();
  expect(captureApplicationState(instance)).toEqual(before);
});

it('ownership profile: a registered keyword keeps its compiled meta-schema after that reference is removed', async () => {
  const id = 'https://model.invalid/keyword-meta';
  const instance = new Ajv({ allErrors: true });
  instance.addSchema({ $id: id, type: 'number' });
  instance.addKeyword({
    keyword: 'modelMetaKeyword',
    type: 'string',
    metaSchema: { $ref: id },
    validate: (length: number, value: string) => value.length >= length,
  });
  instance.removeSchema(id);
  const before = captureApplicationState(instance);
  const root = {
    type: 'string',
    modelMetaKeyword: 3,
  } satisfies import('@canard/schema-form').JSONSchema;
  const validate = createValidator(instance).compile(root);
  expect(await validate('yes')).toBeNull();
  expect(await validate('x')).not.toBeNull();
  expect(captureApplicationState(instance)).toEqual(before);
});
