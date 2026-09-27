import type { FormScenario, ScenarioResult } from '../types';
import { findScenarioHandle } from './findScenarioHandle';
import { runScenario } from './runScenario';

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
  return runScenario(scenario, findScenarioHandle(element).adapter);
}
