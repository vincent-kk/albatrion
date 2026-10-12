import type { FormScenario } from '@aileron/schema-form-scenarios';

/**
 * Select a shared scenario by its stable name.
 * @param scenarios - A family list exported by @aileron/schema-form-scenarios.
 * @param name - The scenario's `name`; renaming data must fail loudly rather than drop a story.
 * @returns The matching scenario; throws when the name is missing.
 */
export function findScenario(scenarios: readonly FormScenario[], name: string): FormScenario {
  const scenario = scenarios.find((item) => item.name === name);
  if (!scenario) throw new Error(`Missing shared scenario: ${name}`);
  return scenario;
}
