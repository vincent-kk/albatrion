import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { plugin as ajv6, createValidator } from '../index';
import cases from './fixtures/decimalParityCases.json';

it.each([0, 1, -1])(
  'matches the shared zero-divisor guard result for %s',
  (value) => {
    const row = cases.zeroDivisor.find((row) => row.value === value);
    if (!row) throw new Error(`Missing zero-divisor case ${value}`);
    const condition = { type: 'number', multipleOf: 0 } satisfies JSONSchema;
    const root = { if: condition };
    const reference = { definitions: { check: condition }, if: { $ref: '#/definitions/check' } };
    expect(ajv6.validator.compileGuard(root, '/if')(value)).toBe(row.valid);
    expect(ajv6.validator.compileGuard(reference, '/if')(value)).toBe(row.valid);
    ajv6.validator.configure({ directGuardCompile: false });
    try {
      expect(ajv6.validator.compileGuard(root, '/if')(value)).toBe(row.valid);
    } finally {
      ajv6.validator.configure({ directGuardCompile: true });
    }
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

it('uses the same decimal tolerance in a root-pointer guard', () => {
  ajv6.validator.configure({ directGuardCompile: false });
  try {
    const guard = ajv6.validator.compileGuard({ if: { type: 'number', multipleOf: 0.01 } }, '/if');
    expect(guard(19.99)).toBe(true);
    expect(guard(19.995)).toBe(false);
  } finally {
    ajv6.validator.configure({ directGuardCompile: true });
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
      ajv6.validator.configure({ directGuardCompile });
      const guard = ajv6.validator.compileGuard(root, '/if');
      expect(guard({ kind: 'ab' })).toBe(true);
      expect(guard({ kind: 'a' })).toBe(false);
    }
  } finally {
    ajv6.validator.configure({ directGuardCompile: true });
  }
  expect(() => ajv6.validator.compile(root)).toThrow(/schema is invalid/);
});
