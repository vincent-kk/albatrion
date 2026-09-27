import type { FormScenario, ScenarioResult } from '../types';
import { findScenarioHandle } from './findScenarioHandle';

/**
 * Run shared screen steps using the registration attached by the renderer.
 * @param scenario - Pure data reused by core tests, render tests, and stories.
 * @param element - Registered form root or an ancestor containing one form.
 * @returns The completed step count; registration and adapter failures propagate.
 */
export function playScenario(
  scenario: FormScenario,
  element: Element,
): Promise<ScenarioResult> {
  const { adapter } = findScenarioHandle(element);
  return (async () => {
    let executedSteps = 0;
    for (const step of scenario.steps) {
      await adapter.execute(step);
      await adapter.settle?.();
      if (step.expect) await adapter.assert(step.expect);
      executedSteps += 1;
    }
    return { executedSteps };
  })();
}
