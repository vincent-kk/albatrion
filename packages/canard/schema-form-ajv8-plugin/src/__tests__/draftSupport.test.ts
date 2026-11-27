import Ajv from 'ajv';
import { createRequire } from 'node:module';
import { expect, it } from 'vitest';

import { plugin as plugin2019 } from '../2019/index';
import { plugin as plugin2020 } from '../2020/index';
import { createValidator, plugin } from '../default/index';

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
  ajv.addMetaSchema(require('ajv/dist/refs/json-schema-draft-06.json'));
  const validate = createValidator(ajv).compile(schema);

  await expect(validate(4)).resolves.toBeNull();
  await expect(validate(5)).resolves.toMatchObject([
    { keyword: 'exclusiveMaximum' },
  ]);
});

it('checks registered formats in a custom instance', async () => {
  const ajv = new Ajv({ strict: false, validateFormats: true });
  const addFormats = require('ajv-formats');
  addFormats(ajv);
  const validate = createValidator(ajv).compile({
    type: 'string',
    format: 'email',
  });

  await expect(validate('invalid')).resolves.toMatchObject([
    { keyword: 'format' },
  ]);
  await expect(validate('name@example.test')).resolves.toBeNull();
});

it.each([
  ['http://json-schema.org/draft-07/schema#', plugin],
  ['https://json-schema.org/draft/2019-09/schema', plugin2019],
  ['https://json-schema.org/draft/2020-12/schema', plugin2020],
] as const)(
  'validates an explicitly declared %s schema from its entry',
  async ($schema, entry) => {
    const validate = entry.validator.compile({ $schema, type: 'number' });

    await expect(validate(1)).resolves.toBeNull();
    await expect(validate('x')).resolves.toMatchObject([{ keyword: 'type' }]);
  },
);
