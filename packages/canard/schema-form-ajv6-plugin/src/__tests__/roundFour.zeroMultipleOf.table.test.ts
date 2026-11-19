import { expect, it } from 'vitest';

import { plugin as ajv6 } from '../index';
import { plugin as ajv7 } from '@canard/schema-form-ajv7-plugin';
import { plugin as ajv8 } from '@canard/schema-form-ajv8-plugin';

it.each([0, 1, -1])('default guards agree that zero is never a divisor for %s', (value) => {
  const schema = { if: { type: 'number', multipleOf: 0 } } as const;
  const verdicts = [ajv6, ajv7, ajv8].map(({ validator }) => validator.compileGuard!(schema, '/if')(value));
  expect(verdicts).toEqual([false, false, false]);
});
