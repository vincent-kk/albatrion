import Ajv from 'ajv';
import { expect, it, vi } from 'vitest';

import { createValidatorFactory } from '../index';

const address = 'https://app.invalid/keyed-form.json';

it.each([
  [
    address,
    { name: 'x', meta: { banned: 1 } },
    [
      ['minLength', '#/properties/name/minLength', undefined],
      ['not', '#/properties/meta/not', 'banned'],
    ],
  ],
  [`${address}#/properties/meta`, { banned: 1 }, [['not', '#/not', 'banned']]],
  ['app-key', { n: 0 }, [['minimum', '#/properties/n/minimum', undefined]]],
  [
    'app-async',
    { name: 'x' },
    [['remoteOk', '#/properties/name/remoteOk', undefined]],
  ],
] as const)(
  'uses native paths and the selected schema at %s',
  async (key, data, expected) => {
    const ajv = new Ajv({ allErrors: true });
    ajv.addKeyword('remoteOk', {
      async: true,
      validate: async (_schema: boolean, value: string) => value !== 'x',
    });
    ajv.addSchema({
      $id: address,
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 3 },
        meta: { type: 'object', not: { required: ['banned'] } },
      },
    });
    ajv.addSchema(
      { type: 'object', properties: { n: { type: 'number', minimum: 1 } } },
      'app-key',
    );
    ajv.addSchema(
      {
        $async: true,
        type: 'object',
        properties: { name: { remoteOk: true } },
      },
      'app-async',
    );
    const appLookup = vi.spyOn(ajv, 'getSchema');
    const validate = createValidatorFactory(ajv, key)({ type: 'object' });
    const issues = await validate(data);
    expect(
      issues?.map(({ keyword, schemaPath, rejectedKey }) => [
        keyword,
        schemaPath,
        rejectedKey ?? undefined,
      ]),
    ).toEqual(expected);
    expect(appLookup).not.toHaveBeenCalled();
  },
);
