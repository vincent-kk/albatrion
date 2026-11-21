import Ajv from 'ajv';
import { createRequire } from 'node:module';
import { expect, it } from 'vitest';

import { createValidator } from '../index';

const require = createRequire(import.meta.url);
it('checks the documented Draft-06 configuration and default limitation', async () => {
  const schema = {
    $schema: 'http://json-schema.org/draft-06/schema#',
    type: 'number' as const,
    exclusiveMaximum: 5,
  };
  expect(() =>
    createValidator(
      new Ajv({ allErrors: true, nullable: true, format: false }),
    ).compile(schema),
  ).toThrow(/no schema with key or ref/);
  const ajv = new Ajv({ allErrors: true, nullable: true, format: false });
  ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));
  const issues = await createValidator(ajv).compile(schema)(5);
  expect(issues?.map((issue) => issue.keyword)).toEqual(['exclusiveMaximum']);
});
