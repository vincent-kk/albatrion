import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { plugin as ajv6, createValidator } from '../index';
import cases from './fixtures/decimalParityCases.json';

it.each([0.1, 0.01, 0.001, 0.05, 0.25, 1e-7, 3, 0.3])(
  'matches the shared exact decimal results inside the documented envelope: %s',
  async (step) => {
    const row = cases.multiples.find((row) => row.step === step);
    if (!row) throw new Error(`Missing decimal cases for ${step}`);
    const validate = ajv6.validator.compile({
      type: 'number',
      multipleOf: step,
    });
    for (const { value, valid } of row.cases)
      expect(
        (await validate(value)) === null,
        `value ${value}, step ${step}`,
      ).toBe(valid);
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
    const issues = await ajv6.validator.compile({
      type: 'number',
      multipleOf: step,
    })(value);
    expect(issues?.map(({ keyword, dataPath }) => [keyword, dataPath])).toEqual(
      row.issues,
    );
  },
);

it('rejects a zero multipleOf schema as every default plugin does', () => {
  expect(() =>
    ajv6.validator.compile({ type: 'number', multipleOf: 0 }),
  ).toThrow();
});

it('keeps an application-supplied precision policy unchanged', async () => {
  const validator = createValidator(new Ajv({ allErrors: true }));
  expect(
    await validator.compile({ type: 'number', multipleOf: 0.01 })(19.99),
  ).not.toBeNull();
});
