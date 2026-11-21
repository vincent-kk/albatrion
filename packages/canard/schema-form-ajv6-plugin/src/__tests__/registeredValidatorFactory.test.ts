import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { createValidatorFactory } from '../index';

const document = {
  $id: 'https://app.invalid/key-form-6.json',
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 3 },
    meta: {
      type: 'object',
      not: { required: ['banned'] },
      additionalProperties: { type: 'number' },
    },
    blocked: false,
  },
  required: ['name'],
};
const asynchronous = {
  $id: 'https://app.invalid/key-async-6.json',
  $async: true,
  type: 'object',
  properties: { name: { type: 'string', remoteOk: true } },
} satisfies Parameters<ReturnType<typeof createValidatorFactory>>[0];

it.each([
  {
    name: 'document by id with valid data',
    key: document.$id,
    schema: { type: 'object' },
    data: { name: 'abc' },
    expected: null,
  },
  {
    name: 'async document by id',
    key: asynchronous.$id,
    schema: asynchronous,
    data: { name: 'taken' },
    expected: [
      {
        dataPath: '/name',
        keyword: 'remoteOk',
        schemaPath: '#/properties/name/remoteOk',
      },
    ],
  },
  {
    name: 'negative requirement from the registered schema',
    key: document.$id,
    schema: { type: 'object', properties: { meta: { not: { required: ['decoy'] } } } },
    data: { name: 'abc', meta: { banned: 1 } },
    expected: [expect.objectContaining({ keyword: 'not', dataPath: '/meta', rejectedKey: 'banned' })],
  },
  {
    name: 'registration key without id',
    key: 'key-only-6',
    schema: { type: 'object' },
    data: { n: 0 },
    expected: [
      {
        dataPath: '/n',
        keyword: 'minimum',
        schemaPath: '#/properties/n/minimum',
      },
    ],
  },
] satisfies {
  name: string;
  key: string;
  schema: Parameters<ReturnType<typeof createValidatorFactory>>[0];
  data: unknown;
  expected: unknown;
}[])(
  'the registered factory preserves native issue paths for $name (DETAIL)',
  async ({ key, schema, data, expected }) => {
    const ajv = new Ajv({ allErrors: true });
    const validate = async (_schema: unknown, value: unknown) =>
      value !== 'taken';
    ajv.addKeyword('remoteOk', { async: true, validate });
    ajv.addSchema(document);
    ajv.addSchema(asynchronous);
    ajv.addSchema(
      {
        type: 'object',
        properties: { n: { type: 'integer', minimum: 1 } },
        required: ['n'],
      },
      'key-only-6',
    );
    const actual = await createValidatorFactory(ajv, key)(schema)(data);
    if (expected === null) expect(actual).toBeNull();
    else expect(actual).toMatchObject(expected);
  },
);

it.each(['object', 'property'] as const)('normalizes the keyed required path in %s mode', async (errorDataPath) => {
  const instance = new Ajv({ allErrors: true, errorDataPath });
  const schema = { properties: { profile: { required: [''] } } };
  const native = instance.compile(schema);
  instance.addSchema(schema, 'keyed-required');
  expect(native({ profile: {} })).toBe(false);
  const validate = createValidatorFactory(instance, 'keyed-required')(schema);
  expect(await validate({ profile: {} })).toMatchObject([
    { keyword: 'required', dataPath: '/profile/', source: { dataPath: native.errors?.[0].dataPath } },
  ]);
});
