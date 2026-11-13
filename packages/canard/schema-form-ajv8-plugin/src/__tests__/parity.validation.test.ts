// Shared validator parity, whole-validation scenarios: rows come from @aileron/schema-form-scenarios/validator.
import { indexDeclaredRows, wholeValidationScenarios } from '@aileron/schema-form-scenarios/validator';
import { describe, expect, it } from 'vitest';

import { copyOf } from './utils/copyOf';
import { loadParityValidator } from './utils/loadParityValidator';
import { readValidation } from './utils/readValidation';

const support = {
  entries: [
    { entry: 'default', draft: '07' },
    { entry: '2019', draft: '2019' },
    { entry: '2020', draft: '2020' },
  ],
  features: ['allowUnionTypes'],
} as const;

/** Rows this file runs, listed literally so they can be counted; checked against the catalogue at collection. */
const rows = [
  ['validation.if-only-oneof-invalid', 'default', 'default', true],
  ['validation.if-only-oneof-invalid', '2019', 'default', true],
  ['validation.if-only-oneof-invalid', '2020', 'default', true],
  ['validation.union-type-error-path', 'default', 'default', true],
  ['validation.union-type-error-path', '2019', 'default', true],
  ['validation.union-type-error-path', '2020', 'default', true],
  ['validation.valid-authored-value', 'default', 'default', true],
  ['validation.valid-authored-value', '2019', 'default', true],
  ['validation.valid-authored-value', '2020', 'default', true],
  ['validation.format-off-by-default', 'default', 'default', true],
  ['validation.format-off-by-default', '2019', 'default', true],
  ['validation.format-off-by-default', '2020', 'default', true],
  ['validation.allow-union-types', 'default', 'default', true],
  ['validation.allow-union-types', '2019', 'default', true],
  ['validation.allow-union-types', '2020', 'default', true],
] as const;

const scenarios = indexDeclaredRows(rows.map((row) => row), wholeValidationScenarios, support);

describe('validator parity: whole-validation scenarios (ajv8)', () => {
  it.each(rows)('%s [%s %s directGuardCompile=%s]', async (id, entry, profile, directGuardCompile) => {
    const scenario = scenarios.get(id);
    if (!scenario) throw new Error(`Unknown parity scenario ${id}`);
    const { validator } = await loadParityValidator(entry, profile, directGuardCompile);
    const root = copyOf(scenario.schema);
    const observed = await readValidation(validator.compile(root), scenario.value);
    validator.release?.(root);
    expect(observed).toEqual(scenario.expected);
  });
});
