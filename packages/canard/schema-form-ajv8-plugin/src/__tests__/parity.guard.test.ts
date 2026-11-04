// Shared validator parity, guard bundle: rows come from @aileron/schema-form-scenarios/validator.
// Observation rows assert nothing; they print a table row only when PARITY_OBSERVE is set (read from process.env).
import { guardScenarios } from '@aileron/schema-form-scenarios/validator';
import { describe, expect, it } from 'vitest';

import type { ParityRow } from './utils/expandParityRows';
import { indexDeclaredRows } from './utils/indexDeclaredRows';
import { loadParityValidator } from './utils/loadParityValidator';
import { copyOf } from './utils/readValidation';

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
  ['guard.inner-id-ref.eligible', 'default', 'default', true],
  ['guard.inner-id-ref.ineligible', 'default', 'default', true],
  ['guard.dynamic-ref.through-ref', '2020', 'default', true],
  ['guard.recursive-ref.through-ref', '2019', 'default', true],
  ['guard.root-assertions.2020.empty', '2020', 'default', true],
  ['guard.root-assertions.2020.flag', '2020', 'default', true],
  ['guard.nested-if-root-scope.2020.yes', '2020', 'default', true],
  ['guard.nested-if-root-scope.2020.no', '2020', 'default', true],
  ['guard.nested-resource-chain.2020', '2020', 'default', true],
  ['guard.async-root-anchor.2020.root-if', '2020', 'default', true],
  ['guard.async-root-anchor.2020.nested', '2020', 'default', true],
  ['guard.root-assertions.2019.empty', '2019', 'default', true],
  ['guard.root-assertions.2019.flag', '2019', 'default', true],
  ['guard.nested-if-root-scope.2019.yes', '2019', 'default', true],
  ['guard.nested-if-root-scope.2019.no', '2019', 'default', true],
  ['guard.nested-resource-chain.2019', '2019', 'default', true],
  ['guard.async-root-anchor.2019.root-if', '2019', 'default', true],
  ['guard.async-root-anchor.2019.nested', '2019', 'default', true],
  ['guard.self-contained.unrelated-meta-violation.match', 'default', 'default', true],
  ['guard.self-contained.unrelated-meta-violation.other', 'default', 'default', true],
  ['guard.ref.unrelated-meta-violation', 'default', 'default', true],
  ['guard.root-pointer.unrelated-meta-violation', 'default', 'default', false],
  ['guard.meta-only-condition.two-characters', 'default', 'default', true],
  ['guard.meta-only-condition.one-character', 'default', 'default', true],
  ['guard.root-schema-declaration', 'default', 'default', true],
  ['guard.async-condition', 'default', 'default', true],
  ['guard.async-condition', 'default', 'default', false],
  ['guard.off-chain-wrapper.2019', '2019', 'default', true],
  ['guard.non-root-recursive-anchor.2019', '2019', 'default', true],
  ['observe.two-scopes.2020', '2020', 'default', true],
  ['observe.two-scopes.2019', '2019', 'default', true],
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

describe('validator parity: guard scenarios (ajv8)', () => {
  it.each(rows)('%s [%s %s directGuardCompile=%s]', async (id, entry, profile, directGuardCompile) => {
    const scenario = scenarios.get(id);
    if (!scenario) throw new Error(`Unknown parity scenario ${id}`);
    const { validator } = await loadParityValidator(entry, profile, directGuardCompile);
    const root = copyOf(scenario.schema);
    const verdict = verdictOf(() => validator.compileGuard(root, scenario.pointer)(copyOf(scenario.hostValue)));
    validator.release?.(root);
    if (scenario.bundle === 'observation') {
      if (process.env.PARITY_OBSERVE) console.info(`| ${id} | ajv8 ${entry} ${profile} directGuardCompile=${directGuardCompile} | guard ${verdict} |`);
      return;
    }
    if (scenario.expected === 'rejects') expect(String(verdict)).toMatch(/^rejects: /);
    else expect(verdict).toBe(scenario.expected);
  });
});
