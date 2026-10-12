import { describe, expect, it } from 'vitest';

import { compositionFeatureScenarios, compositionFindingScenarios } from '../index';

// filid:contract composition-scene-data
describe('composition feature scenarios', () => {
  it.each([
    ['features', compositionFeatureScenarios],
    ['findings', compositionFindingScenarios],
  ] as const)('%s carry the family prefix, unique names, and an expectation on every top-level step', (_, scenarios) => {
    expect(scenarios.length).toBeGreaterThan(0);
    for (const scenario of scenarios) {
      expect(scenario.name.startsWith('composition.')).toBe(true);
      expect(scenario.description).toBeTruthy();
      expect(scenario.steps.length).toBeGreaterThan(0);
      expect(scenario.steps.every((step) => step.expect !== undefined)).toBe(true);
    }
  });

  it('keeps feature and finding names disjoint', () => {
    const names = [...compositionFeatureScenarios, ...compositionFindingScenarios].map((scenario) => scenario.name);
    expect(new Set(names).size).toBe(names.length);
    expect(compositionFindingScenarios.every((scenario) => scenario.name.startsWith('composition.finding-'))).toBe(true);
  });
});
