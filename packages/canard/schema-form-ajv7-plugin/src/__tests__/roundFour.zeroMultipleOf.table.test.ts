import { expect, it } from 'vitest';

import { plugin as ajv7 } from '../index';
import cases from './fixtures/decimalParityCases.json';

it.each([0, 1, -1])(
  'matches the shared zero-divisor guard result for %s',
  (value) => {
    const row = cases.zeroDivisor.find((row) => row.value === value);
    if (!row) throw new Error(`Missing zero-divisor case ${value}`);
    const schema = { if: { type: 'number', multipleOf: 0 } } as const;
    expect(ajv7.validator.compileGuard!(schema, '/if')(value)).toBe(row.valid);
  },
);
