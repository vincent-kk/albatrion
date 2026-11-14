import { describe, expect, it } from 'vitest';

import { handleLayoutFeatureScenarios, propReplacementStages } from '../index';

// filid:contract handle-layout-scene-data
describe('handle-layout feature scenarios', () => {
  it('carry the family prefix, unique names, and an expectation on every top-level step', () => {
    const names = handleLayoutFeatureScenarios.map((scenario) => scenario.name);
    expect(new Set(names).size).toBe(names.length);
    for (const scenario of handleLayoutFeatureScenarios) {
      expect(scenario.name.startsWith('handle-layout.')).toBe(true);
      expect(scenario.description).toBeTruthy();
      expect(scenario.steps.every((step) => step.expect !== undefined)).toBe(true);
    }
  });

  it('keep replacement stage labels unique and start from the mounted props', () => {
    const labels = propReplacementStages.map((stage) => stage.label);
    expect(new Set(labels).size).toBe(labels.length);
    expect(propReplacementStages[0]).toMatchObject({ label: 'mounted', reset: false });
  });
});
