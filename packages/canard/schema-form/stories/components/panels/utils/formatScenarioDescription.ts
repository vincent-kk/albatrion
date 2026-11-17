import { splitScenarioDescription } from './splitScenarioDescription';

/**
 * Turn authored scenario prose into one display paragraph without changing scenario data.
 * @param description - Authored prose containing contract labels, table references or provenance markers.
 * @returns The sentences of `splitScenarioDescription` joined by single spaces.
 */
export function formatScenarioDescription(description: string): string {
  return splitScenarioDescription(description).join(' ');
}
