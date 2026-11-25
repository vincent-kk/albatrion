import Ajv2019 from 'ajv/dist/2019.js';
import { expect, it } from 'vitest';

import { createValidator, plugin } from '../index';

const schema2019 = {
  $schema: 'https://json-schema.org/draft/2019-09/schema',
  type: 'object',
  properties: { name: { type: 'string' } },
  unevaluatedProperties: false,
} as const;

it('refuses a declared Draft 2019-09 $schema on the default instance', () => {
  expect(() => plugin.validator.compile(schema2019)).toThrow(
    /no schema with key or ref/,
  );
});

it('ignores 2019-09 keywords on the default instance when no $schema is declared', async () => {
  const validate = plugin.validator.compile({
    type: 'object',
    properties: { name: { type: 'string' } },
    unevaluatedProperties: false,
  });

  await expect(validate({ name: 'a', extra: 1 })).resolves.toBeNull();
});

it('evaluates a declared Draft 2019-09 schema on a bound AJV 2019 instance', async () => {
  const validate = createValidator(
    new Ajv2019({ allErrors: true, strict: false }),
  ).compile(schema2019);

  await expect(validate({ name: 'a' })).resolves.toBeNull();
  await expect(validate({ name: 'a', extra: 1 })).resolves.toMatchObject([
    { keyword: 'unevaluatedProperties' },
  ]);
});
