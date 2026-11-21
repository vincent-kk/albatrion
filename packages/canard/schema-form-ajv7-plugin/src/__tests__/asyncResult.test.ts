import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { createValidatorFactory } from '../index';
import { resolveAjvConstructor } from '../validator/utils/resolveAjvConstructor';

it.each([false, 0, '', null])('resolves successfully with native async value %j', async (value) => {
  const instance = new (resolveAjvConstructor(Ajv))({ allErrors: true, strict: false });
  const schema = { $async: true } as const;
  instance.addSchema(schema, 'async-value');
  expect(await instance.getSchema('async-value')?.(value)).toBe(value);
  await expect(createValidatorFactory(instance, 'async-value')(schema)(value)).resolves.toBeNull();
});
