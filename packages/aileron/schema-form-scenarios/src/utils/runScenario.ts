import type { FormScenario, ScenarioAdapter, ScenarioResult } from '../types';

/**
 * Execute shared data through the caller's engine or screen adapter.
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
