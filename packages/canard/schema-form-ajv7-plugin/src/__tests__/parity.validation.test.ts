// Shared validator parity, whole-validation scenarios: rows come from @aileron/schema-form-scenarios/validator.
import { type ParityRow, indexDeclaredRows, wholeValidationScenarios } from '@aileron/schema-form-scenarios/validator';
import { describe, expect, it } from 'vitest';

import { copyOf } from './utils/copyOf';
import { loadParityValidator } from './utils/loadParityValidator';
import { readValidation } from './utils/readValidation';

const support = {
  entries: [
    { entry: 'default', draft: '07' },
    { entry: '2019', draft: '2019' },
  ],
  features: [],
} as const;

/** Rows this file runs, listed literally so they can be counted; checked against the catalogue at collection. */
const rows = [
  ['validation.if-only-oneof-invalid', 'default', 'default', true],
  ['validation.if-only-oneof-invalid', '2019', 'default', true],
  ['validation.union-type-error-path', 'default', 'default', true],
  ['validation.union-type-error-path', '2019', 'default', true],
  ['validation.valid-authored-value', 'default', 'default', true],
  ['validation.valid-authored-value', '2019', 'default', true],
  ['validation.format-off-by-default', 'default', 'default', true],
  ['validation.format-off-by-default', '2019', 'default', true],
] as const satisfies readonly ParityRow[];

const scenarios = indexDeclaredRows(rows, wholeValidationScenarios, support);

describe('validator parity: whole-validation scenarios (ajv7)', () => {
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
