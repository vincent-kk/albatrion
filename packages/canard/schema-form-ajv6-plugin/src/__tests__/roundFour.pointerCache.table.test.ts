import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { createValidator } from '../index';

it.each([
  {
    applicationFirst: false,
    jsonPointers: false,
    flip: false,
    identified: false,
  },
  {
    applicationFirst: false,
    jsonPointers: false,
    flip: false,
    identified: true,
  },
  {
    applicationFirst: false,
    jsonPointers: false,
    flip: true,
    identified: false,
  },
  {
    applicationFirst: false,
    jsonPointers: false,
    flip: true,
    identified: true,
  },
  {
    applicationFirst: false,
    jsonPointers: true,
    flip: false,
    identified: false,
  },
  {
    applicationFirst: false,
    jsonPointers: true,
    flip: false,
    identified: true,
  },
  {
    applicationFirst: false,
    jsonPointers: true,
    flip: true,
    identified: false,
  },
  { applicationFirst: false, jsonPointers: true, flip: true, identified: true },
  {
    applicationFirst: true,
    jsonPointers: false,
    flip: false,
    identified: false,
  },
  {
    applicationFirst: true,
    jsonPointers: false,
    flip: false,
    identified: true,
  },
  {
    applicationFirst: true,
    jsonPointers: false,
    flip: true,
    identified: false,
  },
  { applicationFirst: true, jsonPointers: false, flip: true, identified: true },
  {
    applicationFirst: true,
    jsonPointers: true,
    flip: false,
    identified: false,
  },
  { applicationFirst: true, jsonPointers: true, flip: false, identified: true },
  { applicationFirst: true, jsonPointers: true, flip: true, identified: false },
  { applicationFirst: true, jsonPointers: true, flip: true, identified: true },
])(
  'keeps cache profiles independent: applicationFirst=$applicationFirst pointers=$jsonPointers flip=$flip id=$identified',
  async ({ applicationFirst, jsonPointers, flip, identified }) => {
    const instance = new Ajv({ allErrors: true, jsonPointers });
    const addressId = 'https://round-four.invalid/address';
    const dynamicId = 'https://round-four.invalid/dynamic';
    const country = {
      $id: 'https://round-four.invalid/country',
      type: 'string',
      enum: ['KR', 'US'],
    };
    const address: JSONSchema = {
      $id: addressId,
      type: 'object',
      properties: {
        street: { type: 'string', minLength: 3 },
        country: { $ref: 'https://round-four.invalid/country' },
      },
    };
    const dynamic: JSONSchema = {
      $id: dynamicId,
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: { x: { type: 'string', minLength: 3 } },
      },
    };
    instance.addSchema(country);
    instance.addSchema(identified ? dynamic : address);
    const target = identified ? dynamicId : addressId;
    const nativeValue = identified
      ? { "it's": { x: 'a' } }
      : { street: 'x', country: 'KR' };
    if (applicationFirst) instance.validate(target, nativeValue);
    if (flip) instance._opts.jsonPointers = !jsonPointers;
    const currentPointers = flip ? !jsonPointers : jsonPointers;
    const control = new Ajv({
      allErrors: true,
      jsonPointers: applicationFirst ? jsonPointers : currentPointers,
    });
    control.addSchema(country);
    control.addSchema(identified ? dynamic : address);
    control.validate(target, nativeValue);
    const nativePaths = control.errors?.map(({ dataPath }) => dataPath);
    const validator = createValidator(instance);
    const schema: JSONSchema = identified
      ? { ...dynamic }
      : { type: 'object', properties: { billing: { $ref: addressId } } };
    const issues = await validator.compile(schema)(
      identified ? nativeValue : { billing: nativeValue },
    );
    expect(issues?.map(({ dataPath }) => dataPath)).toEqual([
      identified ? "/it's/x" : '/billing/street',
    ]);
    expect(instance._opts.jsonPointers).toBe(currentPointers);
    instance.validate(target, nativeValue);
    expect(instance.errors?.map(({ dataPath }) => dataPath)).toEqual(
      nativePaths,
    );
    validator.release?.(schema);
  },
);

it.each([
  ['object', 'name'],
  ['property', 'name'],
  ['object', ''],
  ['property', ''],
  ['object', "it's/~/x"],
  ['property', "it's/~/x"],
] as const)(
  'normalizes required paths independently of errorDataPath=%s for %j',
  async (errorDataPath, name) => {
    const instance = new Ajv({ allErrors: true, errorDataPath });
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        profile: {
          type: 'object',
          properties: { [name]: { type: 'string' } },
          required: [name],
        },
      },
    };
    const issues = await createValidator(instance).compile(schema)({
      profile: {},
    });
    expect(issues?.map(({ keyword, dataPath }) => [keyword, dataPath])).toEqual(
      [
        [
          'required',
          '/profile/' + name.replace(/~/g, '~0').replace(/\//g, '~1'),
        ],
      ],
    );
    expect(instance._opts.errorDataPath).toBe(errorDataPath);
  },
);
