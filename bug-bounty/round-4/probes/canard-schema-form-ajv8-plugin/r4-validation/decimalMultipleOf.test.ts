import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { plugin as ajv8, createValidator } from '../../default/index';
// Plugin sources resolve their own AJV copies (6.12.6 and 7.2.4) from their package folders.
import { plugin as ajv6 } from '../../../../schema-form-ajv6-plugin/src/index';
import { plugin as ajv7 } from '../../../../schema-form-ajv7-plugin/src/index';

/**
 * BS2 and EQ11. JSON Schema validation 6.2.1: a number is valid against `multipleOf` when the
 * division is an integer. The default instances of all three plugins divide in binary floating
 * point and compare with `parseInt`, so common decimal values fail a decimal `multipleOf`, which
 * the UI plugins also use as the input step (documents/docs/canard/schema-form/schema-reference.mdx:245).
 */
const priceSchema = {
  type: 'object',
  properties: {
    price: { type: 'number', multipleOf: 0.01 },
    rating: { type: 'number', multipleOf: 0.1 },
  },
} as const;

const keywordsOf = async (compile: (schema: any) => (value: unknown) => unknown, value: unknown) => {
  const issues = (await compile({ ...priceSchema })(value)) as { keyword?: string; dataPath: string }[] | null;
  return (issues ?? []).map((issue) => `${issue.keyword} ${issue.dataPath}`);
};

describe.each([
  ['ajv6', (schema: any) => ajv6.validator.compile(schema)],
  ['ajv7', (schema: any) => ajv7.validator.compile(schema)],
  ['ajv8', (schema: any) => ajv8.validator.compile(schema)],
] as const)('%s default plugin and decimal multipleOf', (_label, compile) => {
  it('[control] 1.1 and 2.5 are accepted', async () => {
    expect(await keywordsOf(compile, { price: 1.1, rating: 2.5 })).toEqual([]);
  });

  it.each([
    [{ price: 19.99, rating: 0.3 }],
    [{ price: 0.07, rating: 0.7 }],
    [{ price: 4.35, rating: 2.3 }],
  ])('accepts %j, whose values are exact multiples', async (value) => {
    expect(await keywordsOf(compile, value)).toEqual([]);
  });

  it('[control] rejects 19.995 for multipleOf 0.01', async () => {
    expect(await keywordsOf(compile, { price: 19.995, rating: 0.3 })).toContain('multipleOf /price');
  });
});

describe('ajv8 createValidator with multipleOfPrecision', () => {
  it('[control] an instance configured with multipleOfPrecision accepts 19.99 and 0.3', async () => {
    const validator = createValidator(new Ajv({ allErrors: true, strict: false, multipleOfPrecision: 9 }));
    expect(await keywordsOf((schema) => validator.compile(schema), { price: 19.99, rating: 0.3 })).toEqual([]);
  });
});
