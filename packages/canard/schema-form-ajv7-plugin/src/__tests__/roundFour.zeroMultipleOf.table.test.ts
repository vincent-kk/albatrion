import type { JSONSchema } from '@canard/schema-form';
import { expect, it } from 'vitest';

import { plugin as ajv7 } from '../index';
import cases from './fixtures/decimalParityCases.json';

it.each([0, 1, -1])(
  'matches the shared zero-divisor guard result for %s',
  (value) => {
    const row = cases.zeroDivisor.find((row) => row.value === value);
    if (!row) throw new Error(`Missing zero-divisor case ${value}`);
    const condition = { type: 'number', multipleOf: 0 } satisfies JSONSchema;
    const root = { if: condition };
    const reference = { definitions: { check: condition }, if: { $ref: '#/definitions/check' } };
    expect(ajv7.validator.compileGuard(root, '/if')(value)).toBe(row.valid);
    expect(ajv7.validator.compileGuard(reference, '/if')(value)).toBe(row.valid);
    ajv7.validator.configure({ directGuardCompile: false });
    try {
      expect(ajv7.validator.compileGuard(root, '/if')(value)).toBe(row.valid);
    } finally {
      ajv7.validator.configure({ directGuardCompile: true });
    }
  },
);

it('uses the same decimal tolerance in a root-pointer guard', () => {
  ajv7.validator.configure({ directGuardCompile: false });
  try {
    const guard = ajv7.validator.compileGuard({ if: { type: 'number', multipleOf: 0.01 } }, '/if');
    expect(guard(19.99)).toBe(true);
    expect(guard(19.995)).toBe(false);
  } finally {
    ajv7.validator.configure({ directGuardCompile: true });
  }
});

it('keeps default guards independent of root meta-schema validation', () => {
  const root = {
    type: 'object',
    properties: { count: { type: 'number', multipleOf: 0 } },
    if: {
      properties: { kind: { type: 'string', minLength: 1.5 } },
      required: ['kind', 'kind'],
    },
  } satisfies JSONSchema;
  try {
    for (const directGuardCompile of [true, false]) {
      ajv7.validator.configure({ directGuardCompile });
      const guard = ajv7.validator.compileGuard(root, '/if');
      expect(guard({ kind: 'ab' })).toBe(true);
      expect(guard({ kind: 'a' })).toBe(false);
    }
  } finally {
    ajv7.validator.configure({ directGuardCompile: true });
  }
  expect(() => ajv7.validator.compile(root)).toThrow(/schema is invalid/);
});
