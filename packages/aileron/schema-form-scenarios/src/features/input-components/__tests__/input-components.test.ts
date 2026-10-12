import { describe, expect, it } from 'vitest';

import { inputComponentsFeatureScenarios, inputResolutionCases } from '../index';

// filid:contract input-components-scene-data
describe('input-components feature scenarios', () => {
  it('carry the family prefix, unique names, and an expectation on every top-level step', () => {
    const names = inputComponentsFeatureScenarios.map((scenario) => scenario.name);
    expect(new Set(names).size).toBe(names.length);
    for (const scenario of inputComponentsFeatureScenarios) {
      expect(scenario.name.startsWith('input-components.')).toBe(true);
      expect(scenario.description).toBeTruthy();
      expect(scenario.steps.every((step) => step.expect !== undefined)).toBe(true);
    }
  });

  it('name resolution cases uniquely and give a winner for every probe field', () => {
    expect(new Set(inputResolutionCases.map((item) => item.label)).size).toBe(inputResolutionCases.length);
    for (const item of inputResolutionCases) expect(Object.keys(item.winners).sort()).toEqual(['/code', '/note', '/title']);
  });
});
