import Ajv from 'ajv';
import { createRequire } from 'node:module';
import { expect, it } from 'vitest';

import { createValidator, plugin } from '../index';

const require = createRequire(import.meta.url);

it('accepts a declared Draft-06 schema after its meta-schema is registered', async () => {
  const schema = {
    $schema: 'http://json-schema.org/draft-06/schema#',
    type: 'number',
    exclusiveMaximum: 5,
  } as const;
  expect(() => plugin.validator.compile(schema)).toThrow(
    /no schema with key or ref/,
  );

  const ajv = new Ajv();
  ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));
  const validate = createValidator(ajv).compile(schema);

  await expect(validate(4)).resolves.toBeNull();
  await expect(validate(5)).resolves.toMatchObject([
    { keyword: 'exclusiveMaximum' },
  ]);
});
