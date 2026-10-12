import { describe, expect, it } from 'vitest';

import { compositionFeatureScenarios } from '../index';

// filid:contract composition-scene-data
describe('composition feature scenarios', () => {
  it('carry the family prefix and an expectation on every top-level step', () => {
    expect(compositionFeatureScenarios.length).toBeGreaterThan(0);
    for (const scenario of compositionFeatureScenarios) {
      expect(scenario.name.startsWith('composition.')).toBe(true);
      expect(scenario.description).toBeTruthy();
      expect(scenario.steps.length).toBeGreaterThan(0);
      expect(scenario.steps.every((step) => step.expect !== undefined)).toBe(true);
    }
  });

  it('keep scenario names unique', () => {
    const names = compositionFeatureScenarios.map((scenario) => scenario.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
