import { arrayScenarios } from '@aileron/schema-form-scenarios';
import type { FormScenarioStep } from '@aileron/schema-form-scenarios';
import { describe, expect, it } from 'vitest';

import { createCoreScenarioAdapter } from './utils/createCoreScenarioAdapter';
import { runScenario } from './utils/runScenario';

const scenario = arrayScenarios.find(({ name }) => name === 'array.terminal-verbs');
if (!scenario) throw new Error('array.terminal-verbs scenario is missing');

// filid:contract scenario-array-terminal
describe('terminal array verbs', () => {
  it('applies each verb to a fresh raw array copy', async () => {
    const adapter = createCoreScenarioAdapter(scenario);
    const checkedAdapter = {
      ...adapter,
      async execute(step: FormScenarioStep) {
        const previousRaw = adapter.root.raw;
        expect(Array.isArray(previousRaw)).toBe(true);
        const previousValue = Array.isArray(previousRaw) ? [...previousRaw] : previousRaw;
        await adapter.execute(step);
        expect(previousRaw).toEqual(previousValue);
        expect(adapter.root.raw).not.toBe(previousRaw);
      },
    };

    await runScenario(scenario, checkedAdapter);
    expect(scenario.initialValue).toEqual(['a', 'b']);
  });
});
