// Shared validator parity, guard scenarios, draft-07 entry: rows come from @aileron/schema-form-scenarios/validator.
// Observation rows assert nothing; they print a table row only when PARITY_OBSERVE is set (read from process.env).
import { indexDeclaredRows, guardScenarios } from '@aileron/schema-form-scenarios/validator';
import { describe, expect, it } from 'vitest';

import { copyOf } from './utils/copyOf';
import { loadParityValidator } from './utils/loadParityValidator';

const support = {
  entries: [
    { entry: 'default', draft: '07' },
  ],
  features: [],
} as const;

/** Rows this file runs, listed literally so they can be counted; checked against the catalogue at collection. */
const rows = [
  ['guard.inner-id-ref.eligible', 'default', 'default', true],
  ['guard.inner-id-ref.ineligible', 'default', 'default', true],
  ['guard.self-contained.unrelated-meta-violation.match', 'default', 'default', true],
  ['guard.self-contained.unrelated-meta-violation.other', 'default', 'default', true],
  ['guard.ref.unrelated-meta-violation', 'default', 'default', true],
  ['guard.root-pointer.unrelated-meta-violation', 'default', 'default', false],
  ['guard.meta-only-condition.two-characters', 'default', 'default', true],
  ['guard.meta-only-condition.one-character', 'default', 'default', true],
  ['guard.root-schema-declaration', 'default', 'default', true],
  ['guard.async-condition', 'default', 'default', true],
  ['guard.async-condition', 'default', 'default', false],
] as const;

const scenarios = indexDeclaredRows(rows.map((row) => row), guardScenarios, support);

/**
 * Compile and evaluate one guard, turning a compile exception into its message.
 * @param run - Compiles the guard and evaluates the host value
 * @returns The boolean verdict, or `rejects: <message>` when compilation threw
 */
const verdictOf = (run: () => boolean): boolean | string => {
  try {
    return run();
  } catch (error) {
    return `rejects: ${error instanceof Error ? error.message : String(error)}`;
  }
};

describe('validator parity: guard scenarios, draft-07 entry (ajv6)', () => {
  it.each(rows)('%s [%s %s directGuardCompile=%s]', async (id, entry, profile, directGuardCompile) => {
    const scenario = scenarios.get(id);
    if (!scenario) throw new Error(`Unknown parity scenario ${id}`);
    const { validator } = await loadParityValidator(entry, profile, directGuardCompile);
    const root = copyOf(scenario.schema);
    if (scenario.expected === 'rejects') {
      if (!scenario.failure) throw new Error(`${id} needs failure`);
      expect(() => validator.compileGuard(root, scenario.pointer)).toThrow(new RegExp(scenario.failure, 'i'));
      validator.release?.(root);
      return;
    }
    const verdict = verdictOf(() => validator.compileGuard(root, scenario.pointer)(copyOf(scenario.hostValue)));
    validator.release?.(root);
    if (scenario.bundle === 'observation') {
      if (process.env.PARITY_OBSERVE) console.info(`| ${id} | ajv6 ${entry} ${profile} directGuardCompile=${directGuardCompile} | guard ${verdict} |`);
      return;
    }
    expect(verdict).toBe(scenario.expected);
  });
});
