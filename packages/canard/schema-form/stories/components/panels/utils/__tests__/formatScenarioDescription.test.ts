import { compositeCases, compositionFeatureScenarios } from '@aileron/schema-form-scenarios';
import { describe, expect, it } from 'vitest';

import { formatScenarioDescription } from '../formatScenarioDescription';

describe('formatScenarioDescription', () => {
  it('turns the real if-then-else ledger clauses into readable sentences', () => {
    const scenario = compositionFeatureScenarios.find(({ name }) => name === 'composition.if-then-else-guard')!;
    const description = scenario.description!;
    expect(formatScenarioDescription(description)).toBe(
      'If gates use compileGuard. Then and else are gated declarations. The form does not interpret if. Retains inactive source values.',
    );
    expect(scenario.description).toBe(description);
  });
  it('cleans round markers throughout the real cx15 description', () => {
    const description = compositeCases.find(({ scenario }) => scenario.name === 'composite.cx15-external-and-validation-errors')!.scenario.description!;
    expect(formatScenarioDescription(description)).toBe(
      'A node lists external errors before validator issues. Fixing the value drops only the validator issue. An empty errors prop drops the external one. A non-array errors prop is read as an empty list. getErrors() is the root external errors followed by the validation list. The shared steps check the validator side. The tail stages the errors prop.',
    );
  });
  it('removes repeated IDs, empty parentheses and the prefix colon anywhere', () => {
    expect(formatScenarioDescription('TEST-018 NODE-051: clear  leaves (79C-01); after FRAGMENT-009 updates (178C-01), retain values'))
      .toBe('Clear leaves. After updates, retain values.');
  });
  it('preserves meaningful parentheses and domain values', () => {
    expect(formatScenarioDescription('set VAT-0 (default); keep getErrors() and a@b.co. (GOAL-061 T-3)'))
      .toBe('Set VAT-0 (default). Keep getErrors() and a@b.co.');
  });
  it('collapses whitespace and keeps terminal punctuation', () => {
    expect(formatScenarioDescription('  first clause ;  second clause!  ')).toBe('First clause. Second clause!');
    expect(formatScenarioDescription('TEST-018 (79C-01)')).toBe('');
  });
  it('cleans marker lists next to punctuation and preserves meaningful parentheses', () => {
    expect(formatScenarioDescription('NODE-051 : first;(TEST-018,79C-01); last (see NODE-051)'))
      .toBe('First. Last (see).');
  });

  it('preserves a leading code identifier with parentheses, dots or internal capitals', () => {
    expect(formatScenarioDescription('getErrors() returns issues; node.value is current; showError controls visibility; getErrors returns issues'))
      .toBe('getErrors() returns issues. node.value is current. showError controls visibility. getErrors returns issues.');
    expect(formatScenarioDescription('submit() sends values; regular prose becomes a sentence'))
      .toBe('submit() sends values. Regular prose becomes a sentence.');
    expect(formatScenarioDescription('plain.')).toBe('Plain.');
  });

});
