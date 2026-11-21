import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { createValidator } from '../index';

it('round-5 ajv6 1: release preserves both application object validation and its compiled function', async () => {
  const instance = new Ajv({ allErrors: true });
  const schema = {
    $id: 'https://round-five.invalid/application-cache',
    type: 'string',
    minLength: 3,
  } satisfies JSONSchema;
  const compiled = instance.compile(schema);
  const before = [
    instance.validate(schema, 'x'),
    instance.validate(schema, 'valid'),
  ];
  const adapter = createValidator(instance);
  const form = { ...schema };
  const first = (await adapter.compile(form)('x'))?.map(
    ({ keyword, dataPath }) => ({ keyword, dataPath }),
  );
  adapter.release?.(form);
  expect([
    instance.validate(schema, 'x'),
    instance.validate(schema, 'valid'),
  ]).toEqual(before);
  expect(instance.compile(schema)).toBe(compiled);
  expect(
    (await adapter.compile({ ...schema })('x'))?.map(
      ({ keyword, dataPath }) => ({ keyword, dataPath }),
    ),
  ).toEqual(first);
});

it('round-5 ajv6 5: application removal before and after another form compile is equivalent', async () => {
  const results = [];
  for (const compileFirst of [false, true]) {
    const instance = new Ajv({ allErrors: true });
    const schema = {
      $id: 'https://round-five.invalid/removed',
      type: 'string',
      minLength: 3,
    } satisfies JSONSchema;
    instance.addSchema({ $id: schema.$id, type: 'number' });
    const adapter = createValidator(instance);
    if (compileFirst) await adapter.compile({ type: 'string' })('valid');
    instance.removeSchema(schema.$id);
    results.push(
      (await adapter.compile(schema)('x'))?.map(({ keyword, dataPath }) => ({
        keyword,
        dataPath,
      })),
    );
  }
  expect(results[1]).toEqual(results[0]);
});

it('round-5 ajv6 6: first and second async compile of the same named root are equivalent', async () => {
  const instance = new Ajv({ allErrors: true });
  instance.addKeyword('available', {
    async: true,
    type: 'string',
    validate: async () => false,
  });
  const schema = {
    $id: 'https://round-five.invalid/async-repeat',
    type: 'object',
    properties: { name: { type: 'string', available: true } },
  } satisfies JSONSchema;
  const adapter = createValidator(instance);
  const first = (await adapter.compile(schema)({ name: 'taken' }))?.map(
    ({ keyword, dataPath }) => ({ keyword, dataPath }),
  );
  expect(
    (await adapter.compile(schema)({ name: 'taken' }))?.map(
      ({ keyword, dataPath }) => ({ keyword, dataPath }),
    ),
  ).toEqual(first);
});
