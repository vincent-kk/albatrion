import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { plugin as ajv6 } from '@canard/schema-form-ajv6-plugin';
import { plugin as ajv8 } from '@canard/schema-form-ajv8-plugin';
import { plugin as ajv7, createValidator } from '../index';

/** Represent a finite JSON number's decimal spelling as an integer and a power of ten. */
const decimalParts = (value: number) => {
  const [coefficient, power = '0'] = value.toString().split('e');
  const [whole, fraction = ''] = coefficient.split('.');
  return [BigInt(whole + fraction), Number(power) - fraction.length] as const;
};

/** Decide divisibility independently of AJV and IEEE-754 division. */
const isExactMultiple = (value: number, step: number) => {
  const [dividend, valuePower] = decimalParts(value);
  const [divisor, stepPower] = decimalParts(step);
  const power = Math.min(valuePower, stepPower);
  return (
    (dividend * 10n ** BigInt(valuePower - power)) %
      (divisor * 10n ** BigInt(stepPower - power)) ===
    0n
  );
};

it.each([0.1, 0.01, 0.001, 0.05, 0.25, 1e-7, 3, 0.3])(
  'all default plugins agree with exact decimal arithmetic inside the documented envelope: %s',
  async (step) => {
    const schema = { type: 'number', multipleOf: step } as const;
    const validators = [ajv6, ajv7, ajv8].map(({ validator }) =>
      validator.compile(schema),
    );
    const [unit, power] = decimalParts(step);
    for (const multiplier of [
      -999999, -1999, -17, -3, -1, 0, 1, 3, 17, 1999, 999999,
    ]) {
      for (const value of [
        Number(`${unit * BigInt(multiplier)}e${power}`),
        Number(`${unit * BigInt(2 * multiplier + 1) * 5n}e${power - 1}`),
      ]) {
        const expected = isExactMultiple(value, step);
        const actual = await Promise.all(
          validators.map(async (validate) => (await validate(value)) === null),
        );
        expect(actual, `value ${value}, step ${step}`).toEqual([
          expected,
          expected,
          expected,
        ]);
      }
    }
  },
);

it.each([
  [19.995, 0.01],
  [0.35, 0.1],
  [0.300001, 0.3],
])(
  'all default plugins reject the nonmultiple %s of %s',
  async (value, step) => {
    const schema = { type: 'number', multipleOf: step } as const;
    const verdicts = await Promise.all(
      [ajv6, ajv7, ajv8].map(async ({ validator }) => {
        const issues = await validator.compile(schema)(value);
        return issues?.map(({ keyword, dataPath }) => [keyword, dataPath]);
      }),
    );
    expect(verdicts).toEqual([
      [['multipleOf', '']],
      [['multipleOf', '']],
      [['multipleOf', '']],
    ]);
  },
);

it('all default plugins reject a zero multipleOf schema', () => {
  for (const { validator } of [ajv6, ajv7, ajv8])
    expect(() =>
      validator.compile({ type: 'number', multipleOf: 0 }),
    ).toThrow();
});

it('keeps an application-supplied precision policy unchanged', async () => {
  const validator = createValidator(new Ajv({ allErrors: true }));
  expect(
    await validator.compile({ type: 'number', multipleOf: 0.01 })(19.99),
  ).not.toBeNull();
});
