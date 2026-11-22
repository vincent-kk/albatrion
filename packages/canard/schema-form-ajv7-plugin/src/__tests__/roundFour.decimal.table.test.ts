import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { plugin as ajv7, createValidator } from '../index';
import cases from './fixtures/decimalParityCases.json';

it.each([0.1, 0.01, 0.001, 0.05, 0.25, 1e-7, 3, 0.3])(
  'matches the shared exact decimal results inside the documented envelope: %s',
  async (step) => {
    const row = cases.multiples.find((row) => row.step === step);
    if (!row) throw new Error(`Missing decimal cases for ${step}`);
    const schema = { type: 'number', multipleOf: step } satisfies JSONSchema;
    const validate = ajv7.validator.compile(schema);
    const guard = ajv7.validator.compileGuard({ if: schema }, '/if');
    for (const { value, valid } of row.cases) {
      const sample = `value ${value}, step ${step}`;
      expect((await validate(value)) === null, sample).toBe(valid);
      expect(guard(value), sample).toBe(valid);
    }
  },
);

it.each([
  [19.995, 0.01],
  [0.35, 0.1],
  [0.300001, 0.3],
])(
  'matches the shared issues for nonmultiple %s of %s',
  async (value, step) => {
    const row = cases.nonmultiples.find(
      (row) => row.value === value && row.step === step,
    );
    if (!row) throw new Error(`Missing nonmultiple ${value} of ${step}`);
    const schema = { type: 'number', multipleOf: step } satisfies JSONSchema;
    const issues = await ajv7.validator.compile(schema)(value);
    expect(ajv7.validator.compileGuard({ if: schema }, '/if')(value)).toBe(false);
    const native = new Ajv({ allErrors: true, multipleOfPrecision: 9 }).compile(schema);
    expect(native(value)).toBe(false);
    expect(issues?.[0]?.source).toEqual(native.errors?.[0]);
    expect(issues?.map(({ keyword, dataPath }) => [keyword, dataPath])).toEqual(
      row.issues,
    );
  },
);

it('rejects a zero multipleOf schema as every default plugin does', () => {
  expect(() =>
    ajv7.validator.compile({ type: 'number', multipleOf: 0 }),
  ).toThrow();
});

it('keeps an application-supplied precision policy unchanged', async () => {
  const schema = { type: 'number', multipleOf: 0.01 } satisfies JSONSchema;
  for (const multipleOfPrecision of [undefined, 9]) {
    const validator = createValidator(new Ajv({ allErrors: true, multipleOfPrecision }));
    const native = new Ajv({ allErrors: true, multipleOfPrecision }).compile(schema);
    const validate = validator.compile(schema);
    const guard = validator.compileGuard({ if: schema }, '/if');
    for (const value of [19.99, 19.995]) {
      expect((await validate(value)) === null).toBe(native(value));
      expect(guard(value)).toBe(native(value));
    }
  }
});
