// Shared validator parity, lifetime scenarios: rows come from @aileron/schema-form-scenarios/validator.
import { type ParityRow, indexDeclaredRows, lifetimeScenarios } from '@aileron/schema-form-scenarios/validator';
import { describe, it } from 'vitest';

import { loadParityValidator } from './utils/loadParityValidator';
import { runLifetimeStep } from './utils/runLifetimeStep';

const support = {
  entries: [
    { entry: 'default', draft: '07' },
    { entry: '2019', draft: '2019' },
  ],
  features: [],
} as const;

/** Rows this file runs, listed literally so they can be counted; checked against the catalogue at collection. */
const rows = [
  ['lifetime.guard-before-compile.self-contained', 'default', 'default', true],
  ['lifetime.guard-before-compile.self-contained', '2019', 'default', true],
  ['lifetime.guard-before-compile.root-ref', 'default', 'default', true],
  ['lifetime.guard-before-compile.root-ref', '2019', 'default', true],
  ['lifetime.release-twice', 'default', 'default', true],
  ['lifetime.release-twice', '2019', 'default', true],
  ['lifetime.two-roots-same-id', 'default', 'default', true],
  ['lifetime.two-roots-same-id', 'default', 'default', false],
  ['lifetime.two-roots-same-id', '2019', 'default', true],
  ['lifetime.two-roots-same-id', '2019', 'default', false],
  ['lifetime.recompile-after-registration-failure', 'default', 'default', true],
  ['lifetime.recompile-after-registration-failure', '2019', 'default', true],
  ['lifetime.consumer-schema-kept', 'default', 'custom', true],
  ['lifetime.consumer-schema-kept', '2019', 'custom', true],
  ['lifetime.consumer-meta-schema-kept', 'default', 'custom', true],
] as const satisfies readonly ParityRow[];

const scenarios = indexDeclaredRows(rows, lifetimeScenarios, support);

describe('validator parity: lifetime scenarios (ajv7)', () => {
  it.each(rows)('%s [%s %s directGuardCompile=%s]', async (id, entry, profile, directGuardCompile) => {
    const scenario = scenarios.get(id);
    if (!scenario) throw new Error(`Unknown parity scenario ${id}`);
    const { validator, instance } = await loadParityValidator(entry, profile, directGuardCompile);
    for (const step of scenario.steps) await runLifetimeStep(step, validator, instance);
  });
});
