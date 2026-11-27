import {
  SCENARIO_HANDLE_ATTRIBUTE,
  SCENARIO_REGISTRATION,
} from '../constants/registration';
import type { ScenarioRegistration } from '../types';

/**
 * Resolve a DOM handoff across independent render and Storybook contexts.
 * @param element - Scope root checked before its descendants.
 * @returns Its own registration or the unique descendant registration.
 * @throws When no registration exists or multiple descendants register handles.
 */
export function findScenarioHandle(element: Element): ScenarioRegistration {
  const own = readRegistration(element);
  if (own) return own;
  const registrations = Array.from(
    element.querySelectorAll(`[${SCENARIO_HANDLE_ATTRIBUTE}]`),
  ).flatMap((candidate) => {
    const registration = readRegistration(candidate);
    return registration ? [registration] : [];
  });
  if (registrations.length !== 1)
    throw new Error(
      registrations.length === 0
        ? 'No scenario handle is registered in the supplied element.'
        : 'Multiple scenario handles are registered in the supplied element.',
    );
  return registrations[0];
}

/**
 * Read element-owned state without extending the global Element interface.
 * @param element - Candidate carrying an optional registration property.
 * @returns The attached registration, or undefined for an unregistered element.
 */
function readRegistration(element: Element): ScenarioRegistration | undefined {
  return (element as Element & {
    [SCENARIO_REGISTRATION]?: ScenarioRegistration;
  })[SCENARIO_REGISTRATION];
}
