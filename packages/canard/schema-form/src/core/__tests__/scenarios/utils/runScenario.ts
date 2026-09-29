import type { FormScenario, ScenarioAdapter, ScenarioResult } from '@aileron/schema-form-scenarios';

/**
 * Execute shared data through the core test's injected engine adapter.
 * @param scenario - Ordered scenario data, including an optional empty step list.
 * @param adapter - Consumer-owned execution, settlement, and assertion operations.
 * @returns The number of completed top-level steps; adapter failures propagate.
 */
export async function runScenario(
  scenario: FormScenario,
  adapter: ScenarioAdapter,
): Promise<ScenarioResult> {
  let executedSteps = 0;
  for (const step of scenario.steps) {
    await adapter.execute(step);
    await adapter.settle?.();
    if (step.expect) await adapter.assert(step.expect);
    executedSteps += 1;
  }
  return { executedSteps };
}
