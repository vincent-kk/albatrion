import { validationScenarios } from '@aileron/schema-form-scenarios';
import { describe, it } from 'vitest';

import { createObservedCoreScenarioAdapter } from './utils/createObservedCoreScenarioAdapter';
import { runScenario } from './utils/runScenario';

// filid:contract scenario-runner
describe('validation scenarios on the core node tree', () => {
  it.each(validationScenarios)('$name', async (scenario) => {
    await runScenario(scenario, createObservedCoreScenarioAdapter(scenario, 'validation'));
  });
});
