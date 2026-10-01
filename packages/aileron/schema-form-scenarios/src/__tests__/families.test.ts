import { describe, expect, it } from 'vitest';

import { valueScenarios, settleScenarios, fillScenarios, exitScenarios,
  unionScenarios, deriveScenarios, controlsScenarios, arrayScenarios } from '../../index';
import { notifyScenarios, validationScenarios } from '../../index';

const families = [
  ['value', valueScenarios], ['settle', settleScenarios],
  ['fill', fillScenarios], ['exit', exitScenarios], ['union', unionScenarios],
  ['derive', deriveScenarios], ['controls', controlsScenarios],
  ['array', arrayScenarios],
  ['notify', notifyScenarios], ['validation', validationScenarios],
] as const;

// filid:contract scenario-data
describe('shared scenario families', () => {
  it.each(families)('%s has executable steps with observable expectations',
    (family, scenarios) => {
      expect(scenarios.length).toBeGreaterThan(0);
      for (const scenario of scenarios) {
        expect(scenario.name.startsWith(`${family}.`)).toBe(true);
        expect(scenario.steps.length).toBeGreaterThan(0);
        expect(scenario.steps.every((step) => step.expect !== undefined)).toBe(true);
      }
    });

  it('keeps the ledger-named union scenario addresses', () => {
    expect(unionScenarios.map((scenario) => scenario.name)).toEqual(expect.arrayContaining([
      'union.entry-two-step', 'union.gated-effective-list', 'union.rule-a',
      'union.ambiguous', 'union.integer', 'union.object-array',
      'union.omit-empty', 'union.default-fill',
    ]));
  });

  it('keeps the ledger-named validation scenario addresses', () => {
    expect(validationScenarios.map((scenario) => scenario.name)).toEqual([
      'validation.if-only-oneof-invalid', 'validation.union-type-error-on-node',
    ]);
  });
});
