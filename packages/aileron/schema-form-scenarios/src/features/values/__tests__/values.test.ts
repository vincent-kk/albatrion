import { describe, expect, it } from 'vitest';

import { valuesFeatureScenarios, valuesFindingScenarios } from '../index';

// filid:contract values-scene-data
describe('values feature scenarios', () => {
  it.each([
    ['features', valuesFeatureScenarios],
    ['findings', valuesFindingScenarios],
  ] as const)('%s carry the family prefix, unique names, and an expectation on every top-level step', (_, scenarios) => {
    expect(scenarios.length).toBeGreaterThan(0);
    for (const scenario of scenarios) {
      expect(scenario.name.startsWith('values.')).toBe(true);
      expect(scenario.description).toBeTruthy();
      expect(scenario.steps.length).toBeGreaterThan(0);
      expect(scenario.steps.every((step) => step.expect !== undefined)).toBe(true);
    }
  });

  it('keeps feature and finding names disjoint', () => {
    const names = [...valuesFeatureScenarios, ...valuesFindingScenarios].map((scenario) => scenario.name);
    expect(new Set(names).size).toBe(names.length);
    expect(valuesFindingScenarios.every((scenario) => scenario.name.startsWith('values.finding-'))).toBe(true);
  });
});
