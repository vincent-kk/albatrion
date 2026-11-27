import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { createValidatorFactory } from '../index';

it('refuses a mutating instance when creating a standalone factory', () => {
  expect(() => createValidatorFactory(new Ajv({ coerceTypes: true }))).toThrow(
    expect.objectContaining({ name: 'ValidatorBindRefusedError' }),
  );
});

it('refuses to compile a keyed validator after coercion is enabled', () => {
  const ajv = new Ajv();
  const key = 'https://app.example/alias';
  ajv.addSchema({ properties: { field: { type: 'number' } } }, key);
  const compile = createValidatorFactory(ajv, key);
  Reflect.get(ajv, '_opts').coerceTypes = true;

  expect(() => compile({})).toThrow(
    expect.objectContaining({ name: 'ValidatorBindRefusedError' }),
  );
});
