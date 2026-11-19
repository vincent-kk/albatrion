import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { plugin as ajv6, createValidator } from '../index';
import cases from './fixtures/decimalParityCases.json';

it.each([0, 1, -1])(
  'matches the shared zero-divisor guard result for %s',
  (value) => {
    const row = cases.zeroDivisor.find((row) => row.value === value);
    if (!row) throw new Error(`Missing zero-divisor case ${value}`);
    const schema = { if: { type: 'number', multipleOf: 0 } } as const;
    expect(ajv6.validator.compileGuard!(schema, '/if')(value)).toBe(row.valid);
  },
);

it.each([
  [0.1, 0.35],
  [0.01, 19.995],
  [0.3, 0.300001],
])(
  'preserves native error shape for multipleOf %s rejecting %s',
  async (step, value) => {
    const schema = {
      type: 'object',
      properties: { n: { type: 'number', multipleOf: step } },
    } as const;
    const native = createValidator(
      new Ajv({
        allErrors: true,
        nullable: true,
        verbose: true,
        format: false,
        multipleOfPrecision: 9,
      }),
    );
    expect(await ajv6.validator.compile(schema)({ n: value })).toEqual(
      await native.compile(schema)({ n: value }),
    );
  },
);
