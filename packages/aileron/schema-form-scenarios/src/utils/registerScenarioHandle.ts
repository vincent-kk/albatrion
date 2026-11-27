import {
  SCENARIO_HANDLE_ATTRIBUTE,
  SCENARIO_REGISTRATION,
} from '../constants/registration';
import type { ScenarioAdapter, ScenarioRegistration } from '../types';

/**
 * Attach a consumer's handle and bound screen adapter to its rendered root.
 * @param element - Root contained by the element passed to playScenario.
 * @param handle - Consumer-owned structural form handle.
 * @param adapter - User-event and handle operations bound to this form.
 * @returns Cleanup that removes this registration only, preserving replacements.
 */
export function registerScenarioHandle(
  element: Element,
  handle: object,
  adapter: ScenarioAdapter,
): () => void {
  const target = element as Element & {
    [SCENARIO_REGISTRATION]?: ScenarioRegistration;
  };
  const registration = { handle, adapter };
  target[SCENARIO_REGISTRATION] = registration;
  target.setAttribute(SCENARIO_HANDLE_ATTRIBUTE, '');
  return () => {
    if (target[SCENARIO_REGISTRATION] !== registration) return;
    delete target[SCENARIO_REGISTRATION];
    target.removeAttribute(SCENARIO_HANDLE_ATTRIBUTE);
  };
}
