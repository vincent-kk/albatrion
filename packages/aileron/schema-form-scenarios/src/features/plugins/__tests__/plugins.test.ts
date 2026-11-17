import { describe, expect, it } from 'vitest';

import { pluginsFeatureScenarios, rendererCases, validatorSourceCases } from '../index';

// filid:contract plugins-scene-data
describe('plugins feature scenarios', () => {
  it('carry the family prefix, unique names, and an expectation on every top-level step', () => {
    const names = pluginsFeatureScenarios.map((scenario) => scenario.name);
    expect(new Set(names).size).toBe(names.length);
    for (const scenario of pluginsFeatureScenarios) {
      expect(scenario.name.startsWith('plugins.')).toBe(true);
      expect(scenario.description).toBeTruthy();
      expect(scenario.steps.every((step) => step.expect !== undefined)).toBe(true);
    }
  });

  it('keep case labels unique and give every factory case its keyword', () => {
    for (const labels of [validatorSourceCases.map((item) => item.label), rendererCases.map((item) => item.label)])
      expect(new Set(labels).size).toBe(labels.length);
    expect(validatorSourceCases.filter((item) => item.source === 'factory').every((item) => item.factoryKeyword)).toBe(true);
  });
});
