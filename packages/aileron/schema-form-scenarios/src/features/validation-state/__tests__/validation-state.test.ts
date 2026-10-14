import { describe, expect, it } from 'vitest';

import {
  externalErrorStages,
  formatErrorCases,
  interactionStateStages,
  showErrorCases,
  validationModeCases,
  validationStateFeatureScenarios,
} from '../index';

// filid:contract validation-state-scene-data
describe('validation-state feature scenarios', () => {
  it('carry the family prefix, unique names, and an expectation on every top-level step', () => {
    const names = validationStateFeatureScenarios.map((scenario) => scenario.name);
    expect(new Set(names).size).toBe(names.length);
    for (const scenario of validationStateFeatureScenarios) {
      expect(scenario.name.startsWith('validation-state.')).toBe(true);
      expect(scenario.description).toBeTruthy();
      expect(scenario.steps.every((step) => step.expect !== undefined)).toBe(true);
    }
  });

  it('name every validation mode and display policy exactly once', () => {
    expect(validationModeCases.map((item) => item.mode).sort()).toEqual(['None', 'OnChange', 'OnRequest']);
    expect(showErrorCases.map((item) => item.policy).sort()).toEqual(['Always', 'Dirty', 'DirtyTouched', 'Never', 'Touched']);
  });

  it('keep stage and case labels unique and start interaction stages from the load', () => {
    for (const labels of [externalErrorStages.map((item) => item.label), formatErrorCases.map((item) => item.label)])
      expect(new Set(labels).size).toBe(labels.length);
    expect(interactionStateStages[0]).toEqual({ act: 'load', state: {}, notifications: 0 });
  });
});
