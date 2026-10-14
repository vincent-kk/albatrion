import { describe, it } from 'vitest';

import { exitScenarios } from '@aileron/schema-form-scenarios';

import { createCoreScenarioAdapter } from './utils/createCoreScenarioAdapter';
import { runScenario } from './utils/runScenario';

// filid:contract scenario-exit
describe('exit scenarios on the core node tree', () => {
  it.each(exitScenarios)('$name', async (scenario) => {
    await runScenario(scenario, createCoreScenarioAdapter(scenario));
  });
});
