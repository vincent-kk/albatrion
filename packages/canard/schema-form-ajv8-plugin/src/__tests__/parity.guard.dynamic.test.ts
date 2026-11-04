// Shared validator parity, guard scenarios, dynamic-scope entries: rows come from @aileron/schema-form-scenarios/validator.
// Observation rows assert nothing; they print a table row only when PARITY_OBSERVE is set (read from process.env).
import { type ParityRow, indexDeclaredRows, guardScenarios } from '@aileron/schema-form-scenarios/validator';
import { describe, expect, it } from 'vitest';

import { copyOf } from './utils/copyOf';
import { loadParityValidator } from './utils/loadParityValidator';

const support = {
  entries: [
    { entry: '2019', draft: '2019' },
    { entry: '2020', draft: '2020' },
  ],
  features: ['allowUnionTypes'],
} as const;

/** Rows this file runs, listed literally so they can be counted; checked against the catalogue at collection. */
const rows = [
  ['guard.dynamic-ref.through-ref', '2020', 'default', true],
  ['guard.recursive-ref.through-ref', '2019', 'default', true],
  ['guard.root-assertions.2020.empty', '2020', 'default', true],
  ['guard.root-assertions.2020.flag', '2020', 'default', true],
  ['guard.nested-if-root-scope.2020.yes', '2020', 'default', true],
  ['guard.nested-if-root-scope.2020.no', '2020', 'default', true],
  ['guard.nested-resource-chain.2020', '2020', 'default', true],
  ['guard.nested-resource-chain.2020.missing-ok', '2020', 'default', true],
  ['guard.async-root-anchor.2020.root-if', '2020', 'default', true],
  ['guard.async-root-anchor.2020.nested', '2020', 'default', true],
  ['guard.root-assertions.2019.empty', '2019', 'default', true],
  ['guard.root-assertions.2019.flag', '2019', 'default', true],
  ['guard.nested-if-root-scope.2019.yes', '2019', 'default', true],
  ['guard.nested-if-root-scope.2019.no', '2019', 'default', true],
  ['guard.nested-resource-chain.2019', '2019', 'default', true],
  ['guard.nested-resource-chain.2019.missing-ok', '2019', 'default', true],
  ['guard.async-root-anchor.2019.root-if', '2019', 'default', true],
  ['guard.async-root-anchor.2019.nested', '2019', 'default', true],
  ['guard.off-chain-wrapper.2019', '2019', 'default', true],
  ['guard.non-root-recursive-anchor.2019', '2019', 'default', true],
  ['observe.two-scopes.2020', '2020', 'default', true],
  ['guard.off-chain-wrapper.2020', '2020', 'default', true],
  ['guard.host-anchor-ancestor.2020.ok', '2020', 'default', true],
  ['guard.host-anchor-ancestor.2020.missing-ok', '2020', 'default', true],
  ['guard.two-scopes-off-chain.2019', '2019', 'default', true],
  ['observe.non-root-anchor-with-inner-ancestor.2019', '2019', 'default', true],
] as const satisfies readonly ParityRow[];

const scenarios = indexDeclaredRows(rows, guardScenarios, support);

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

describe('validator parity: guard scenarios, dynamic-scope entries (ajv8)', () => {
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
      if (process.env.PARITY_OBSERVE) console.info(`| ${id} | ajv8 ${entry} ${profile} directGuardCompile=${directGuardCompile} | guard ${verdict} |`);
      return;
    }
    expect(verdict).toBe(scenario.expected);
  });
});
