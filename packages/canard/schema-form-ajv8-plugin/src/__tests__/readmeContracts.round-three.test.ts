import Ajv from 'ajv';
import { createRequire } from 'node:module';
import { expect, it } from 'vitest';

import { createValidator } from '../default/index';

const require = createRequire(import.meta.url);
it('checks the documented Draft-06 configuration and default limitation', async () => {
  const schema = {
    $schema: 'http://json-schema.org/draft-06/schema#',
    type: 'number' as const,
    exclusiveMaximum: 5,
  };
  expect(() =>
    createValidator(
      new Ajv({ allErrors: true, strict: false, validateFormats: false }),
    ).compile(schema),
  ).toThrow(/no schema with key or ref/);
  const ajv = new Ajv({
    allErrors: true,
    strict: false,
    validateFormats: false,
  });
  ajv.addMetaSchema(require('ajv/dist/refs/json-schema-draft-06.json'));
  const issues = await createValidator(ajv).compile(schema)(5);
  expect(issues?.map((issue) => issue.keyword)).toEqual(['exclusiveMaximum']);
});
it('checks the migration example with explicitly registered formats', async () => {
  const addFormats = require('ajv-formats');
  const ajv = new Ajv({ strict: false, validateFormats: true });
  addFormats(ajv);
  const issues = await createValidator(ajv).compile({
    type: 'string',
    format: 'email',
  })('invalid');
  expect(issues?.map((issue) => issue.keyword)).toEqual(['format']);
});
