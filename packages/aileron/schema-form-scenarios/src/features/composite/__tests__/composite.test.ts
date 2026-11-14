import { describe, expect, it } from 'vitest';

import { compositeCases, compositeRegressionScenarios } from '../index';

// filid:contract composite-scene-data
describe('composite cases', () => {
  it('number CX-01 to CX-24 in order with unique names and an expectation on every top-level step', () => {
    const names = compositeCases.map((item) => item.scenario.name);
    expect(new Set(names).size).toBe(24);
    names.forEach((name, index) => expect(name.startsWith(`composite.cx${String(index + 1).padStart(2, '0')}-`), name).toBe(true));
    for (const { scenario } of compositeCases) {
      expect(scenario.description, scenario.name).toBeTruthy();
      expect(scenario.steps.every((step) => step.expect !== undefined), scenario.name).toBe(true);
    }
  });

  it('give a tail a start value whenever it does not continue from the shared steps, and keep regressions apart', () => {
    for (const item of compositeCases) if (item.tailStart !== undefined) expect(item.tail?.length, item.scenario.name).toBeGreaterThan(0);
    const caseNames = new Set(compositeCases.map((item) => item.scenario.name));
    for (const scenario of compositeRegressionScenarios) {
      expect(scenario.name.startsWith('composite.') && !scenario.name.startsWith('composite.cx'), scenario.name).toBe(true);
      expect(scenario.steps.every((step) => step.expect !== undefined), scenario.name).toBe(true);
    }
    expect(compositeRegressionScenarios.some((scenario) => caseNames.has(scenario.name))).toBe(false);
  });
});
