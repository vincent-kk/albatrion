import { describe, expect, it } from 'vitest';

import { deferredMountOptions, deferredMountStages, scaleFeatureScenarios } from '../index';

// filid:contract scale-scene-data
describe('scale feature scenarios', () => {
  it('carry the family prefix, unique names, and an expectation on every top-level step', () => {
    const names = scaleFeatureScenarios.map((scenario) => scenario.name);
    expect(new Set(names).size).toBe(names.length);
    for (const scenario of scaleFeatureScenarios) {
      expect(scenario.name.startsWith('scale.')).toBe(true);
      expect(scenario.description).toBeTruthy();
      expect(scenario.steps.every((step) => step.expect !== undefined)).toBe(true);
    }
  });

  it('start reveal stages from the load and name a VirtualizationBackfill value', () => {
    expect(deferredMountStages[0].act).toBe('load');
    expect(['none', 'idle']).toContain(deferredMountOptions.backfill);
  });
});
