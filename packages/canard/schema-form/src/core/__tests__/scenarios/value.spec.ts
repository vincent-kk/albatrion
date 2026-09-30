import { valueScenarios } from '@aileron/schema-form-scenarios';
import { describe, it } from 'vitest';

import { createCoreScenarioAdapter } from './utils/createCoreScenarioAdapter';
import { runScenario } from './utils/runScenario';

// filid:contract scenario-runner
describe('value scenarios on the core node tree', () => {
  it.each(valueScenarios)('$name', async (scenario) => {
    await runScenario(scenario, createCoreScenarioAdapter(scenario));
  });
});
