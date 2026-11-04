import { describe, expect, it } from 'vitest';

import { contextStages, derivationFeatureScenarios, resetInteractionStages } from '../index';

// filid:contract derivation-scene-data
describe('derivation feature scenarios', () => {
  it('carry the family prefix, unique names, and an expectation on every top-level step', () => {
    const names = derivationFeatureScenarios.map((scenario) => scenario.name);
    expect(new Set(names).size).toBe(names.length);
    for (const scenario of derivationFeatureScenarios) {
      expect(scenario.name.startsWith('derivation.')).toBe(true);
      expect(scenario.description).toBeTruthy();
      expect(scenario.steps.every((step) => step.expect !== undefined)).toBe(true);
    }
  });

  it('keep stage labels unique and start the reset stages from an edit', () => {
    const labels = contextStages.map((stage) => stage.label);
    expect(new Set(labels).size).toBe(labels.length);
    expect(resetInteractionStages[0].act).toBe('editName');
  });
});
