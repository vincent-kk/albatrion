import { describe, expect, it } from 'vitest';

import { structureFeatureScenarios } from '../index';

// filid:contract structure-scene-data
describe('structure feature scenarios', () => {
  it('carry the family prefix, a description, and an expectation on every top-level step', () => {
    expect(structureFeatureScenarios.length).toBeGreaterThan(0);
    for (const scenario of structureFeatureScenarios) {
      expect(scenario.name.startsWith('structure.')).toBe(true);
      expect(scenario.description).toBeTruthy();
      expect(scenario.steps.length).toBeGreaterThan(0);
      expect(scenario.steps.every((step) => step.expect !== undefined)).toBe(true);
    }
  });

  it('keeps scenario names unique', () => {
    const names = structureFeatureScenarios.map((scenario) => scenario.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
