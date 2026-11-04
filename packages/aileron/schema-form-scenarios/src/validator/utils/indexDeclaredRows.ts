import type { ValidatorScenario } from '../types';

import { type ParityRow, type ParitySupport, expandParityRows } from './expandParityRows';

/**
 * Check a test file's literal row list against the shared catalogue and index the scenarios by id.
 * The literal list keeps rows countable without running the file; this check keeps it current.
 * @param declared - The rows the test file lists literally, in catalogue order
 * @param scenarios - The bundle the rows come from
 * @param support - The plugin's entries and features
 * @returns The bundle's scenarios by id
 * @throws Error naming both lists when the declared rows differ from the expanded catalogue
 */
export const indexDeclaredRows = <Scenario extends ValidatorScenario>(
  declared: readonly ParityRow[],
  scenarios: readonly Scenario[],
  support: ParitySupport,
): ReadonlyMap<string, Scenario> => {
  const expected = JSON.stringify(expandParityRows(scenarios, support));
  if (JSON.stringify(declared) !== expected)
    throw new Error(`Declared parity rows differ from the catalogue.\ndeclared: ${JSON.stringify(declared)}\nexpected: ${expected}`);
  return new Map(scenarios.map((scenario) => [scenario.id, scenario]));
};
