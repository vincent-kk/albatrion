import { plugin as ajv7 } from '@canard/schema-form-ajv7-plugin';
import { plugin as ajv8 } from '@canard/schema-form-ajv8-plugin';
import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { plugin as ajv6, createValidator } from '../index';

it.each([0, 1, -1])(
  'default guards agree that zero is never a divisor for %s',
  (value) => {
    const schema = { if: { type: 'number', multipleOf: 0 } } as const;
    const verdicts = [ajv6, ajv7, ajv8].map(({ validator }) =>
      validator.compileGuard!(schema, '/if')(value),
    );
    expect(verdicts).toEqual([false, false, false]);
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
