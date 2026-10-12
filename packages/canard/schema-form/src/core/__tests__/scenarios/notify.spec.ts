import { notifyScenarios } from '@aileron/schema-form-scenarios';
import { describe, it } from 'vitest';

import { createObservedCoreScenarioAdapter } from './utils/createObservedCoreScenarioAdapter';
import { runScenario } from './utils/runScenario';

// filid:contract scenario-notify
describe('notify scenarios on the core node tree', () => {
  it.each(notifyScenarios)('$name', async (scenario) => {
    await runScenario(scenario, createObservedCoreScenarioAdapter(scenario, 'notify'));
  });
});
