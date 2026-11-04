import { describe, it } from 'vitest';

import { settleScenarios } from '@aileron/schema-form-scenarios';

import { createCoreScenarioAdapter } from './utils/createCoreScenarioAdapter';
import { runScenario } from './utils/runScenario';

// filid:contract scenario-settle
describe('settle scenarios on the core node tree', () => {
  it.each(settleScenarios)('$name', async (scenario) => {
    await runScenario(scenario, createCoreScenarioAdapter(scenario));
  });
});
