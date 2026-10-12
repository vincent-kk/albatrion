import { arrayScenarios } from '@aileron/schema-form-scenarios';
import { describe, it } from 'vitest';

import { createCoreScenarioAdapter } from './utils/createCoreScenarioAdapter';
import { runScenario } from './utils/runScenario';

// filid:contract scenario-array
describe('array scenarios on the core node tree', () => {
  const coreOnly = [
    'array.position-reconcile', 'array.terminal-verbs',
    'array.source-b-structure',
  ];
  it.each(arrayScenarios.filter(({ name }) => !coreOnly.includes(name)))('$name',
    async (scenario) => {
      await runScenario(scenario, createCoreScenarioAdapter(scenario));
    });
});
