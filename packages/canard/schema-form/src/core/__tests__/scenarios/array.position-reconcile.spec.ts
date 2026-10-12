import { arrayScenarios } from '@aileron/schema-form-scenarios';
import { describe, expect, it } from 'vitest';

import { createCoreScenarioAdapter } from './utils/createCoreScenarioAdapter';
import { runScenario } from './utils/runScenario';

const scenario = arrayScenarios.find(({ name }) => name === 'array.position-reconcile');
if (!scenario) throw new Error('array.position-reconcile scenario is missing');

// filid:contract scenario-array-position
describe('array position reconciliation', () => {
  it('keeps the shifted item key and interaction state', async () => {
    const adapter = createCoreScenarioAdapter(scenario);
    const item = adapter.root.find('/1');
    expect(item).not.toBeNull();
    if (item) item.state = { ...item.state, dirty: true, touched: true };

    await runScenario(scenario, adapter);

    expect(adapter.root.find('/0')?.state).toMatchObject({
      dirty: true, touched: true,
    });
  });
});
