import { describe, expect, it } from 'vitest';

import { eventsFeatureScenarios, renderCommitStages, subscriptionStages } from '../index';

// filid:contract events-scene-data
describe('events feature scenarios', () => {
  it('carry the family prefix, unique names, and an expectation on every top-level step', () => {
    const names = eventsFeatureScenarios.map((scenario) => scenario.name);
    expect(new Set(names).size).toBe(names.length);
    for (const scenario of eventsFeatureScenarios) {
      expect(scenario.name.startsWith('events.')).toBe(true);
      expect(scenario.description).toBeTruthy();
      expect(scenario.steps.every((step) => step.expect !== undefined)).toBe(true);
    }
  });

  it('keep stage labels unique and never both include and exclude one event kind', () => {
    const labels = renderCommitStages.map((stage) => stage.label);
    expect(new Set(labels).size).toBe(labels.length);
    for (const stage of subscriptionStages) expect(stage.includes.filter((name) => stage.excludes.includes(name))).toEqual([]);
  });
});
