import { controlsScenarios } from '@aileron/schema-form-scenarios';
import { describe, it } from 'vitest';

import { createCoreScenarioAdapter } from './utils/createCoreScenarioAdapter';
import { runScenario } from './utils/runScenario';

// filid:contract scenario-runner
describe('controls scenarios on the core node tree', () => {
  it.each(controlsScenarios)('$name', async (scenario) => {
    await runScenario(scenario, createCoreScenarioAdapter(scenario));
  });
});
